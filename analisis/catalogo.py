"""Catálogo de preguntas compartido con la web (web/cuestionario.mjs)."""

import json
from pathlib import Path
import subprocess

RAIZ = Path(__file__).resolve().parents[1]
PREGUNTAS = tuple(f"p{i}" for i in range(1, 15))

# Respuestas abiertas que se capturan solo cuando P6 o P14 valen «Sí».
MEDIOS = ("Bloomberg", "Excel propio", "Investing.com", "Reportes de Banxico", "TradingView", "Yahoo Finanzas")
TIPOS_NO_FINANCIEROS = ("Agrícola", "Comercio", "Infraestructura", "Inmobiliaria", "Otras", "Tecnología")
PERFILES_EXCEL = ("Adverso al Riesgo", "Moderado", "Propenso al Riesgo")


def cargar_preguntas():
    programa = """
      import { preguntas } from './web/cuestionario.mjs';
      console.log(JSON.stringify(preguntas));
    """
    proceso = subprocess.run(["node", "--input-type=module", "-e", programa],
                             cwd=RAIZ, capture_output=True, encoding="utf-8")
    if proceso.returncode:
        raise ValueError(proceso.stderr.strip())
    return json.loads(proceso.stdout)
