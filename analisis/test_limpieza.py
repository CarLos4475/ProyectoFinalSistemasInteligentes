import csv
from pathlib import Path
from tempfile import TemporaryDirectory
import unittest

from catalogo import PREGUNTAS
from limpieza import limpiar_formulario


class LimpiezaFormularioTest(unittest.TestCase):
    def setUp(self):
        temporal = TemporaryDirectory()
        self.addCleanup(temporal.cleanup)
        self.path = Path(temporal.name) / "respuestas.csv"
        self.preguntas = {clave: {"opciones": {"A": "Sí", "B": "No"}} for clave in PREGUNTAS}
        self.encabezados = [
            "Marca temporal", "Nombre completo", "Edad", "Antes de empezar, ¿cómo describirías tu perfil?",
            *(f"P{i}. Pregunta {i}" for i in range(1, 15)),
            "¿Qué medios usas para evaluar una inversión?", "¿En qué tipo de inversiones no financieras?",
            "¿Estás de acuerdo con el perfil que te asignamos?", "¿Qué perfil consideras correcto?",
        ]
        self.fila = ["2026-01-01", "Caso de prueba", "30", "Moderado", *["A"] * 14, "", "", "Sí", ""]
        self.fila[17] = "B"  # P14. P6 conserva A.

    def escribir(self, orden):
        orden = tuple(orden)
        with self.path.open("w", newline="", encoding="utf-8") as archivo:
            writer = csv.writer(archivo)
            for fila in (self.encabezados, self.fila):
                writer.writerow([fila[i] for i in orden])

    def test_conserva_respuestas_aunque_se_intercambien_p6_y_p14(self):
        orden = list(range(len(self.encabezados)))
        self.escribir(orden)
        esperado = limpiar_formulario(self.path, self.preguntas)

        orden[9], orden[17] = orden[17], orden[9]
        self.escribir(orden)
        casos, reporte = limpiar_formulario(self.path, self.preguntas)

        self.assertEqual((casos[0]["p6"], casos[0]["p14"]), ("A", "B"))
        self.assertEqual((casos, reporte), esperado)

    def test_rechaza_una_pregunta_faltante(self):
        self.escribir(i for i in range(len(self.encabezados)) if i != 9)
        with self.assertRaisesRegex(ValueError, "Faltan columnas.*P6"):
            limpiar_formulario(self.path, self.preguntas)

    def test_rechaza_dos_columnas_con_el_mismo_codigo(self):
        self.encabezados[17] = "P6. Otro encabezado"
        self.escribir(range(len(self.encabezados)))
        with self.assertRaisesRegex(ValueError, "Encabezado duplicado.*P6"):
            limpiar_formulario(self.path, self.preguntas)
