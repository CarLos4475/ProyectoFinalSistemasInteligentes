"""Análisis de sensibilidad de un factor a la vez sobre las decisiones del sistema experto.

Cada decisión del equipo se cambia por una alternativa razonable, una por vez, y se cuenta
cuántos de los casos cambian de resultado. Las reglas se reescriben aquí con parámetros; antes
de variar nada se comprueba que la configuración base da exactamente lo mismo que la web.
"""

PERFILES = ("conservador", "moderado", "propenso")
ORDEN = {perfil: nivel for nivel, perfil in enumerate(PERFILES)}

BASE = {
    "reaccion": {"A": 0, "B": 0, "C": 1, "D": 2},      # P8
    "caida": {"A": 0, "B": 1, "C": 2},                  # P9 (D = «No me inquieto»)
    "preferencia": {"A": 0, "B": 1, "C": 1, "D": 2},   # P10
    "limite_ingresos": 1,                               # P1 = B
    "limite_plazo_medio": 1,                            # P4 = B
    "combinar": "mediana",
}

VARIANTES = (
    ("P8 «Esperaría y revisaría» = baja", {"reaccion": {"C": 0}}),
    ("P8 «Esperaría y revisaría» = alta", {"reaccion": {"C": 2}}),
    ("P8 «Me incomodarían las fluctuaciones» = intermedia", {"reaccion": {"A": 1}}),
    ("P9 10 % = baja", {"caida": {"B": 0}}),
    ("P9 10 % = alta", {"caida": {"B": 2}}),
    ("P10 «Competitivo con seguridad» = baja", {"preferencia": {"B": 0}}),
    ("P10 «Por encima del mercado» = alta", {"preferencia": {"C": 2}}),
    ("Ingresos periódicos sin tope", {"limite_ingresos": 2}),
    ("Plazo de 1 a 3 años = conservador", {"limite_plazo_medio": 0}),
    ("Combinar señales con el mínimo", {"combinar": "minimo"}),
    ("Combinar señales con el promedio", {"combinar": "promedio"}),
)


def limite(caso, cfg):
    if caso["p1"] == "A" or caso["p4"] == "A":
        return 0
    topes = []
    if caso["p1"] == "B":
        topes.append(cfg["limite_ingresos"])
    if caso["p4"] == "B":
        topes.append(cfg["limite_plazo_medio"])
    return min(topes, default=2)


def combinar(senales, cfg):
    ordenadas = sorted(senales)
    if cfg["combinar"] == "minimo":
        return ordenadas[0]
    if cfg["combinar"] == "promedio":
        return int(sum(senales) / 3 + 0.5)
    return ordenadas[1]


def evaluar(caso, cfg):
    tope = limite(caso, cfg)
    caidas = list(cfg["caida"].values()) if caso["p9"] == "D" else [cfg["caida"][caso["p9"]]]
    posibles = {min(tope, combinar([cfg["reaccion"][caso["p8"]], c, cfg["preferencia"][caso["p10"]]], cfg))
                for c in caidas}
    return "aclaracion" if len(posibles) > 1 else PERFILES[posibles.pop()]


def aplicar(cambios):
    return {clave: {**BASE[clave], **valor} if isinstance(valor, dict) else valor
            for clave, valor in {**BASE, **cambios}.items()}


def sensibilidad(casos, estados_web):
    base = [evaluar(caso, BASE) for caso in casos]
    if base != list(estados_web):
        raise ValueError("Las reglas parametrizadas no coinciden con las de la web.")
    filas = []
    for nombre, cambios in VARIANTES:
        nuevo = [evaluar(caso, aplicar(cambios)) for caso in casos]
        pares = [(a, b) for a, b in zip(base, nuevo) if a != b]
        niveles = [(ORDEN[a], ORDEN[b]) for a, b in pares if a in ORDEN and b in ORDEN]
        filas.append({
            "decision": nombre,
            "cambian": len(pares),
            "porcentaje": round(100 * len(pares) / len(casos), 1),
            "suben": sum(b > a for a, b in niveles),
            "bajan": sum(b < a for a, b in niveles),
            "aclaracion": len(pares) - len(niveles),
            "saltos_de_dos_niveles": sum(abs(b - a) > 1 for a, b in niveles),
        })
    return filas


def sensibilidad_baremo(registros, cortes=(26, 27, 29, 30)):
    """Misma prueba sobre el baremo anterior: mover el corte Moderado/Propenso (28 puntos)."""
    def perfil(puntaje, corte):
        return "adverso" if puntaje <= 14 else "moderado" if puntaje <= corte else "propenso"

    puntajes = [registro["Puntaje"] for registro in registros]
    filas = []
    for corte in cortes:
        cambian = sum(perfil(p, 28) != perfil(p, corte) for p in puntajes)
        filas.append({"corte": corte, "cambian": cambian, "porcentaje": round(100 * cambian / len(puntajes), 1)})
    return filas
