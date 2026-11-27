"""Limpia la exportación del formulario y la convierte a los códigos del cuestionario.

Técnicas: normalización de texto (acentos, mayúsculas y espacios), expresiones regulares
para letras, porcentajes, edades y fechas, y similitud de cadenas (difflib) para erratas.
"""

from collections import Counter
import csv
from datetime import date
from difflib import SequenceMatcher
import re
import unicodedata

from catalogo import MEDIOS, PERFILES_EXCEL, PREGUNTAS, TIPOS_NO_FINANCIEROS

UMBRAL_SIMILITUD = 0.8
EDAD_MINIMA, EDAD_MAXIMA = 18, 100
MESES = {m: i for i, m in enumerate(
    ("ene", "feb", "mar", "abr", "may", "jun", "jul", "ago", "sep", "oct", "nov", "dic"), start=1)}

SOLO_LETRA = re.compile(r"^\(?([a-e])\)?$")
PREFIJO_LETRA = re.compile(r"^([a-e])\)\s*(.+)$")
SEPARADORES = re.compile(r"\s*[,;/]\s*")
ESPACIOS = re.compile(r"\s+")
FECHA_ISO = re.compile(r"^(\d{4})-(\d{1,2})-(\d{1,2})")
FECHA_DMY = re.compile(r"^(\d{1,2})/(\d{1,2})/(\d{4})")
FECHA_TEXTO = re.compile(r"^(\d{1,2}) ([a-z]{3}) (\d{4})$")
NUMERO = re.compile(r"\d+")
CODIGO_PREGUNTA = re.compile(r"^(p\d+)\b")
CAMPOS_FORMULARIO = {
    "fecha": "Marca temporal",
    "nombre": "Nombre completo",
    "edad": "Edad",
    "autoevaluacion": "Antes de empezar, ¿cómo describirías tu perfil?",
    "medios": "¿Qué medios usas para evaluar una inversión?",
    "tipos_no_financieros": "¿En qué tipo de inversiones no financieras?",
    "de_acuerdo": "¿Estás de acuerdo con el perfil que te asignamos?",
    "perfil_sugerido": "¿Qué perfil consideras correcto?",
}


def normalizar(texto):
    texto = unicodedata.normalize("NFD", texto or "")
    texto = "".join(c for c in texto if unicodedata.category(c) != "Mn")
    return ESPACIOS.sub(" ", texto).strip().lower()


def parecido(texto, catalogo):
    """Devuelve la entrada del catálogo más parecida si supera el umbral."""
    clave = normalizar(texto)
    puntajes = sorted(((SequenceMatcher(None, clave, normalizar(v)).ratio(), v) for v in catalogo), reverse=True)
    if puntajes and puntajes[0][0] >= UMBRAL_SIMILITUD:
        return puntajes[0][1]
    return None


class Limpiador:
    def __init__(self, preguntas):
        self.preguntas = preguntas
        self.tecnicas = Counter()
        self.sin_resolver = []

    def opcion(self, clave, texto, fila):
        opciones = self.preguntas[clave]["opciones"]
        por_texto = {normalizar(v): codigo for codigo, v in opciones.items()}
        limpio = normalizar(texto)

        if coincidencia := SOLO_LETRA.match(limpio):
            codigo = coincidencia.group(1).upper()
            if codigo in opciones:
                self.tecnicas["regex_letra"] += 1
                return codigo
        if coincidencia := PREFIJO_LETRA.match(limpio):
            limpio = coincidencia.group(2)
            self.tecnicas["regex_prefijo"] += 1
        if limpio in por_texto:
            self.tecnicas["exacta"] += 1
            return por_texto[limpio]

        # Casillas múltiples: «El mercado mexicano, Mercados de otros países» equivale a «Ambos».
        partes = [p for p in SEPARADORES.split(limpio) if p]
        if len(partes) > 1:
            codigos = {self._parecido_codigo(p, opciones) for p in partes}
            if codigos == {"A", "B"} and "AyB" in opciones:
                self.tecnicas["casillas_multiples"] += 1
                return "AyB"

        if codigo := self._parecido_codigo(limpio, opciones):
            self.tecnicas["similitud"] += 1
            return codigo
        self.sin_resolver.append({"fila": fila, "campo": clave, "valor": texto})
        return None

    @staticmethod
    def _parecido_codigo(texto, opciones):
        elegido = parecido(texto, opciones.values())
        return next((c for c, v in opciones.items() if v == elegido), None)

    def lista(self, texto, catalogo, campo, fila):
        valores = []
        for parte in SEPARADORES.split(texto.strip()):
            if not parte.strip():
                continue
            if elegido := parecido(parte, catalogo):
                valores.append(elegido)
            else:
                self.sin_resolver.append({"fila": fila, "campo": campo, "valor": parte})
        return sorted(set(valores))


def limpiar_fecha(texto):
    limpio = normalizar(texto)
    if m := FECHA_ISO.match(limpio):
        return date(int(m[1]), int(m[2]), int(m[3])), "iso"
    if m := FECHA_DMY.match(limpio):
        return date(int(m[3]), int(m[2]), int(m[1])), "dia/mes/año"
    if (m := FECHA_TEXTO.match(limpio)) and m[2] in MESES:
        return date(int(m[3]), MESES[m[2]], int(m[1])), "texto"
    return None, "invalida"


def limpiar_edad(texto):
    numeros = NUMERO.findall(texto or "")
    if len(numeros) != 1:
        return None
    edad = int(numeros[0])
    return edad if EDAD_MINIMA <= edad <= EDAD_MAXIMA else None


def limpiar_si_no(texto):
    return {"si": "Sí", "s": "Sí", "no": "No", "n": "No"}.get(normalizar(texto))


def posiciones_formulario(encabezados):
    esperados = {**CAMPOS_FORMULARIO, **{clave: clave.upper() for clave in PREGUNTAS}}
    por_encabezado = {normalizar(texto): campo for campo, texto in esperados.items()}
    posiciones = {}
    for indice, encabezado in enumerate(encabezados):
        texto = normalizar(encabezado)
        campo = por_encabezado.get(texto)
        if campo is None and (codigo := CODIGO_PREGUNTA.match(texto)):
            campo = codigo[1]
        if campo not in esperados:
            continue
        if campo in posiciones:
            raise ValueError(f"Encabezado duplicado para {esperados[campo]}.")
        posiciones[campo] = indice
    faltan = [texto for campo, texto in esperados.items() if campo not in posiciones]
    if faltan:
        raise ValueError("Faltan columnas del formulario: " + ", ".join(faltan))
    return posiciones


def limpiar_formulario(path, preguntas):
    with open(path, newline="", encoding="utf-8-sig") as archivo:
        lector = csv.reader(archivo)
        encabezados = next(lector, [])
        posiciones = posiciones_formulario(encabezados)
        filas = list(lector)

    limpiador = Limpiador(preguntas)
    resumen = Counter()
    formatos_fecha = Counter()
    vistos = set()
    casos = []
    for numero, fila in enumerate(filas, start=2):
        if not any(celda.strip() for celda in fila):
            resumen["filas_vacias"] += 1
            continue
        if len(fila) != len(encabezados):
            raise ValueError(f"La fila {numero} tiene {len(fila)} columnas. Se esperaban {len(encabezados)}.")
        datos = {campo: fila[indice] for campo, indice in posiciones.items()}

        nombre_limpio = ESPACIOS.sub(" ", datos["nombre"]).strip().title()
        if normalizar(nombre_limpio) in vistos:
            resumen["duplicados"] += 1
            continue
        vistos.add(normalizar(nombre_limpio))

        fecha_limpia, formato = limpiar_fecha(datos["fecha"])
        formatos_fecha[formato] += 1
        edad_limpia = limpiar_edad(datos["edad"])
        resumen["edades_invalidas"] += edad_limpia is None
        sugerido = datos["perfil_sugerido"]
        caso = {
            "nombre": nombre_limpio, "fecha": fecha_limpia, "edad": edad_limpia,
            "autoevaluacion": parecido(datos["autoevaluacion"], PERFILES_EXCEL),
            **{clave: limpiador.opcion(clave, datos[clave], numero) for clave in PREGUNTAS},
            "medios": limpiador.lista(datos["medios"], MEDIOS, "medios", numero),
            "tipos_no_financieros": limpiador.lista(datos["tipos_no_financieros"], TIPOS_NO_FINANCIEROS, "tipos", numero),
            "de_acuerdo": limpiar_si_no(datos["de_acuerdo"]),
            "perfil_sugerido": parecido(sugerido, PERFILES_EXCEL) if sugerido.strip() else None,
        }
        casos.append(caso)

    reporte = {
        "filas_leidas": len(filas),
        "filas_vacias": resumen["filas_vacias"],
        "duplicados": resumen["duplicados"],
        "casos": len(casos),
        "edades_invalidas": resumen["edades_invalidas"],
        "formatos_fecha": dict(formatos_fecha),
        "respuestas_por_tecnica": dict(limpiador.tecnicas),
        "sin_resolver": limpiador.sin_resolver,
    }
    return casos, reporte


def comparar_con_excel(casos, registros):
    """Mide cuántos campos limpios coinciden con el Excel de origen."""
    por_nombre = {r["Nombre"]: r for r in registros}
    aciertos, total = Counter(), Counter()
    for caso in casos:
        original = por_nombre.get(caso["nombre"])
        total["nombre"] += 1
        if original is None:
            continue
        aciertos["nombre"] += 1
        pares = {clave: (caso[clave], original[clave.upper()]) for clave in PREGUNTAS}
        pares["edad"] = (caso["edad"], original["Edad"])
        pares["fecha"] = (caso["fecha"], original["Fecha de encuesta"].date())
        pares["medios"] = (caso["medios"], sorted(v.strip() for v in (original["Medios propios (P6)"] or "").split(",") if v))
        pares["tipos_no_financieros"] = (caso["tipos_no_financieros"], sorted(
            v.strip() for v in (original["Tipos de inversión no financiera (P14)"] or "").split(",") if v))
        pares["de_acuerdo"] = (caso["de_acuerdo"], original["P15 ¿De acuerdo con el perfil?"])
        pares["perfil_sugerido"] = (caso["perfil_sugerido"], original["P16 Perfil que considera correcto"])
        for campo, (limpio, esperado) in pares.items():
            total[campo] += 1
            aciertos[campo] += limpio == esperado
    respuestas = sum(aciertos[c] for c in PREGUNTAS), sum(total[c] for c in PREGUNTAS)
    return {
        "respuestas_p1_p14": f"{respuestas[0]}/{respuestas[1]}",
        **{campo: f"{aciertos[campo]}/{total[campo]}" for campo in total if campo not in PREGUNTAS},
    }
