"""Audita el Excel, evalúa las reglas de la web y agrupa respuestas con K-modes."""

import argparse
from collections import Counter
import json
from pathlib import Path
import re
import subprocess

from kmodes.kmodes import KModes
import numpy as np
from openpyxl import load_workbook
from openpyxl.utils import get_column_letter
from sklearn.metrics import silhouette_score


RAIZ = Path(__file__).resolve().parents[1]
PREGUNTAS = tuple(f"p{i}" for i in range(1, 15))
VARIABLES_KMODES = ("p1", "p4", "p8", "p9", "p10")
ESTADOS = ("conservador", "moderado", "propenso", "aclaracion")
SEED = 42
REINICIOS = 20
FILTROS = (
    ("P6", "A", "Medios propios (P6)"),
    ("P14", "A", "Tipos de inversión no financiera (P14)"),
    ("P15 ¿De acuerdo con el perfil?", "No", "P16 Perfil que considera correcto"),
)


def cargar_excel(path):
    libro = load_workbook(path, read_only=True, data_only=True)
    try:
        encabezados, *filas = libro["Respuestas"].values
        registros = [dict(zip(encabezados, fila)) for fila in filas
                     if any(valor is not None for valor in fila)]
    finally:
        libro.close()
    esperadas = {"#", *(clave.upper() for clave in PREGUNTAS)}
    esperadas.update(campo for filtro, _, detalle in FILTROS for campo in (filtro, detalle))
    esperadas.update(("Puntaje", "Perfil resultante (después)"))
    faltan = esperadas - set(encabezados)
    if faltan:
        raise ValueError("Faltan columnas: " + ", ".join(sorted(faltan)))
    folios = [registro["#"] for registro in registros]
    if not folios or None in folios or len(set(folios)) != len(folios):
        raise ValueError("La hoja debe tener un folio único y completo para cada caso.")
    return registros


def normalizar(registros):
    casos = []
    cambios = 0
    for registro in registros:
        caso = {}
        for clave in PREGUNTAS:
            original = registro[clave.upper()]
            valor = original.strip().upper() if isinstance(original, str) else original
            if valor == "AYB":
                valor = "AyB"
            cambios += int(valor != original)
            caso[clave] = valor
        casos.append(caso)
    return casos, cambios


def aplicar_reglas(casos):
    # La misma función que se ejecuta en el navegador evita duplicar los criterios.
    programa = """
      import { readFileSync } from 'node:fs';
      import { preguntas } from './web/cuestionario.mjs';
      import { evaluarPerfil } from './web/perfil.mjs';

      const casos = JSON.parse(readFileSync(0, 'utf8'));
      const estados = casos.map((caso, i) => {
        for (const [paso, pregunta] of Object.entries(preguntas)) {
          if (!Object.hasOwn(pregunta.opciones, caso[paso])) {
            throw new Error(`Opción inválida en el caso ${i + 1}, ${paso}`);
          }
        }
        const resultado = evaluarPerfil(caso);
        return resultado.perfil ?? resultado.paso;
      });
      console.log(JSON.stringify({ preguntas, estados }));
    """
    proceso = subprocess.run(
        ["node", "--input-type=module", "-e", programa],
        cwd=RAIZ, input=json.dumps(casos), capture_output=True, encoding="utf-8",
    )
    if proceso.returncode:
        raise ValueError(proceso.stderr.strip())
    salida = json.loads(proceso.stdout)
    return salida["preguntas"], salida["estados"]


def auditar_baremo(path, registros):
    libro = load_workbook(path, read_only=True)
    try:
        encabezados, *filas = libro["Respuestas"].values
        columna = encabezados.index("Perfil resultante (después)")
        columna_p10 = get_column_letter(encabezados.index("P10") + 1)
        formulas = [fila[columna] for fila in filas if any(valor is not None for valor in fila)]
    finally:
        libro.close()
    puntajes = [registro["Puntaje"] for registro in registros]
    excepcion = re.compile(rf'^=IF\({columna_p10}\d+="A","Sofisticado",', re.IGNORECASE)
    return {
        "formulas_excepcion_p10": sum(bool(excepcion.match(f)) for f in formulas if isinstance(f, str)),
        "sofisticados_en_excel": sum(r["Perfil resultante (después)"] == "Sofisticado" for r in registros),
        "sofisticados_con_p12_no": sum(
            r["Perfil resultante (después)"] == "Sofisticado" and str(r["P12"]).strip().upper() == "B"
            for r in registros
        ),
        "puntaje_minimo": min(puntajes),
        "puntaje_maximo": max(puntajes),
        "puntaje_hasta_14": sum(p <= 14 for p in puntajes),
    }


def agrupar(casos, preguntas, estados):
    datos = np.array([[caso[clave] for clave in VARIABLES_KMODES] for caso in casos])
    distancias = (datos[:, None] != datos[None, :]).mean(axis=2)
    candidatos = []
    ajustes = {}
    for k in range(2, 6):
        modelo = KModes(n_clusters=k, init="Huang", n_init=REINICIOS, random_state=SEED)
        grupos = modelo.fit_predict(datos)
        if len(set(grupos)) != k:
            raise ValueError(f"K-modes solo produjo {len(set(grupos))} grupos para k={k}.")
        puntuacion = float(silhouette_score(distancias, grupos, metric="precomputed"))
        candidatos.append({"k": k, "silueta": puntuacion, "grupo_menor": min(Counter(grupos).values())})
        ajustes[k] = (modelo, grupos)
    elegido = max(candidatos, key=lambda candidato: candidato["silueta"])["k"]
    modelo, grupos = ajustes[elegido]
    tamanos = Counter(grupos)
    resumen = []
    for etiqueta, grupo in enumerate(sorted(tamanos, key=lambda g: (-tamanos[g], g)), start=1):
        centro = modelo.cluster_centroids_[grupo]
        modos = {clave: preguntas[clave]["opciones"][valor]
                 for clave, valor in zip(VARIABLES_KMODES, centro)}
        estados_grupo = Counter(estado for estado, asignacion in zip(estados, grupos) if asignacion == grupo)
        resumen.append({
            "grupo": etiqueta, "casos": tamanos[grupo], "modas": modos,
            "estados": {estado: estados_grupo[estado] for estado in ESTADOS},
        })
    return {"variables": VARIABLES_KMODES, "semilla": SEED, "reinicios": REINICIOS,
            "candidatos": candidatos, "k": elegido, "grupos": resumen}


def analizar(path):
    registros = cargar_excel(path)
    casos, cambios = normalizar(registros)
    preguntas, estados = aplicar_reglas(casos)
    frecuencias = {}
    for clave in PREGUNTAS:
        conteos = Counter(caso[clave] for caso in casos)
        frecuencias[clave] = {etiqueta: conteos[codigo]
                              for codigo, etiqueta in preguntas[clave]["opciones"].items()}
    estado = Counter(estados)
    return {
        "archivo": path.name,
        "casos": len(casos),
        "preguntas": len(PREGUNTAS),
        "normalizaciones": cambios,
        "patrones_repetidos": len(casos) - len({tuple(caso.values()) for caso in casos}),
        "faltantes_p1_p14": sum(valor is None for caso in casos for valor in caso.values()),
        "filtros": [
            {"campo": detalle, "sin_aplicar": sum(r[filtro] != si for r in registros),
             "desajustes": sum((r[detalle] not in (None, "")) != (r[filtro] == si) for r in registros)}
            for filtro, si, detalle in FILTROS
        ],
        "baremo": auditar_baremo(path, registros),
        "frecuencias": frecuencias,
        "reglas": {nombre: estado[nombre] for nombre in ESTADOS},
        "p9_sin_umbral": sum(caso["p9"] == "D" for caso in casos),
        "kmodes": agrupar(casos, preguntas, estados),
    }


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("excel", type=Path, help="Ruta a perfil_inversionista_350_respuestas.xlsx")
    parser.add_argument("--salida", type=Path, help="Archivo JSON para guardar los resultados agregados")
    args = parser.parse_args()
    texto = json.dumps(analizar(args.excel), ensure_ascii=False, indent=2) + "\n"
    if args.salida:
        args.salida.write_text(texto, encoding="utf-8")
    else:
        print(texto, end="")


if __name__ == "__main__":
    main()
