"""Formato de los PDF del proyecto (portada UNAM, Century Gothic, tablas y pie)."""

from pathlib import Path

from reportlab.lib import colors
from reportlab.lib.enums import TA_JUSTIFY
from reportlab.lib.pagesizes import letter
from reportlab.lib.styles import ParagraphStyle
from reportlab.pdfbase import pdfmetrics
from reportlab.pdfbase.ttfonts import TTFont
from reportlab.platypus import (BaseDocTemplate, Frame, NextPageTemplate, PageBreak, PageTemplate,
                                Paragraph, Spacer, Table, TableStyle)

AQUI = Path(__file__).parent
TTC = "/System/Library/PrivateFrameworks/FontServices.framework/Versions/A/Resources/Fonts/ApplicationSupport/CenturyGothic.ttc"
pdfmetrics.registerFont(TTFont("CenturyGothic", TTC, subfontIndex=0))
pdfmetrics.registerFont(TTFont("CenturyGothic-Bold", TTC, subfontIndex=1))
pdfmetrics.registerFontFamily("CenturyGothic", normal="CenturyGothic", bold="CenturyGothic-Bold",
                              italic="CenturyGothic", boldItalic="CenturyGothic-Bold")

AZUL_OSCURO = colors.HexColor("#0d3e71")
AZUL = colors.HexColor("#365f91")
GRIS_AZUL = colors.HexColor("#5e7290")
GRIS = colors.HexColor("#444444")
FONDO_TABLA = colors.HexColor("#f1f4f8")

ANCHO, ALTO = letter
X0, X1 = 52, 560
TABLA_ANCHO = 520

# Calibración contra los PDF originales.
AJUSTE = {"margen_sup": 8, "titulo_desp": 0, "parrafo_desp": 0, "sub_antes": 0, "sub_desp": 0,
          "tabla_antes": 0, "tabla_desp": 0, "nota_antes": 0}

TITULO = ParagraphStyle("titulo", fontName="CenturyGothic", fontSize=19, leading=23, textColor=AZUL)
SUB = ParagraphStyle("sub", fontName="CenturyGothic-Bold", fontSize=11, leading=13.5)
CUERPO = ParagraphStyle("cuerpo", fontName="CenturyGothic", fontSize=10.5, leading=14.5, alignment=TA_JUSTIFY)
NOTA = ParagraphStyle("nota", fontName="CenturyGothic", fontSize=9, leading=12, textColor=GRIS)
CELDA = ParagraphStyle("celda", fontName="CenturyGothic", fontSize=9.2, leading=12)
CELDA_ENC = ParagraphStyle("celda_enc", parent=CELDA, fontName="CenturyGothic-Bold")


def enlace(texto, url):
    return f'<a href="{url}" color="#365f91">{texto}</a>'


class Documento:
    def __init__(self, salida, *, tipo, titulo_meta, asunto, fecha, profesora, alumnos, producto="SIMULADOR DE PERFIL DE INVERSIÓN"):
        self.salida = Path(salida)
        self.tipo = tipo
        self.producto = producto
        self.fecha = fecha
        self.profesora = profesora
        self.alumnos = alumnos
        self.historia = [NextPageTemplate("contenido"), PageBreak()]
        self.doc = BaseDocTemplate(
            str(self.salida), pagesize=letter, title=titulo_meta,
            author="Proyecto de Sistemas Inteligentes · MAC", subject=asunto,
            leftMargin=X0, rightMargin=ANCHO - X1, topMargin=40, bottomMargin=60,
        )
        marco = Frame(X0, 60, X1 - X0, ALTO - 100 - AJUSTE["margen_sup"], id="marco",
                      leftPadding=0, rightPadding=0, topPadding=0, bottomPadding=0)
        self.doc.addPageTemplates([
            PageTemplate("portada", frames=[marco], onPage=self._portada),
            PageTemplate("contenido", frames=[marco], onPage=self._pie),
        ])
        self._primera = True

    # Páginas -------------------------------------------------------------
    def _portada(self, c, _doc):
        def centrado(texto, tamano, color, y_superior):
            c.setFont("CenturyGothic", tamano)
            c.setFillColor(color)
            c.drawCentredString(ANCHO / 2, ALTO - y_superior - tamano * 0.79 + 0.2, texto)

        centrado("UNIVERSIDAD NACIONAL AUTÓNOMA", 28, AZUL_OSCURO, 42.1)
        centrado("DE MÉXICO", 28, AZUL_OSCURO, 79.1)
        centrado("FACULTAD DE ESTUDIOS SUPERIORES ACATLÁN", 22, AZUL, 122.8)
        centrado("LIC. MATEMÁTICAS APLICADAS Y COMPUTACIÓN", 18, GRIS_AZUL, 158.9)
        c.drawImage(str(AQUI / "escudo_unam.png"), 225, ALTO - 388, width=162, height=182, mask="auto")
        centrado(self.tipo, 24, AZUL, 433.2)
        centrado(self.producto, 16, GRIS_AZUL, 477.5)
        centrado(f"SISTEMAS INTELIGENTES · PROFESORA {self.profesora}", 14, AZUL, 552.0)
        centrado("ALUMNOS", 15, GRIS_AZUL, 609.3)
        for i, alumno in enumerate(self.alumnos):
            centrado(alumno, 16, AZUL_OSCURO, 638.5 + 29 * i)

    def _pie(self, c, doc):
        c.setStrokeColor(AZUL)
        c.setLineWidth(0.6)
        c.line(46, ALTO - 749, 566, ALTO - 749)
        c.setFont("CenturyGothic", 8)
        c.setFillColor(GRIS)
        c.drawString(46, ALTO - 763.7 + 8 * 0.21 - 0.1, f"Proyecto de Sistemas Inteligentes | {self.fecha}")
        c.drawRightString(566, ALTO - 763.7 + 8 * 0.21 - 0.1, str(doc.page))

    # Bloques -------------------------------------------------------------
    def seccion(self, titulo):
        if not self._primera:
            self.historia.append(PageBreak())
        self._primera = False
        self.historia += [Spacer(1, AJUSTE["titulo_desp"]), Paragraph(titulo.upper(), TITULO),
                          Spacer(1, 15.0)]

    def parrafo(self, texto):
        if getattr(self.historia[-1], "origen", None) == "tabla":
            self.historia[-1] = Spacer(1, 7.0)
        self.historia += [Paragraph(texto, CUERPO), Spacer(1, 10.0)]

    def subtitulo(self, texto):
        self.historia += [Paragraph(texto.upper(), SUB), Spacer(1, 8.0)]

    def nota(self, texto):
        previo = self.historia.pop() if isinstance(self.historia[-1], Spacer) else None
        antes = {"tabla": 8.0}.get(getattr(previo, "origen", None), 9.0)
        self.historia += [Spacer(1, antes), Paragraph(texto, NOTA), Spacer(1, 10.0)]

    def tabla(self, filas, anchos):
        datos = [[Paragraph(str(v), CELDA_ENC if i == 0 else CELDA) for v in fila] for i, fila in enumerate(filas)]
        tabla = Table(datos, colWidths=anchos, hAlign="LEFT")
        tabla.setStyle(TableStyle([
            ("FONT", (0, 0), (-1, -1), "CenturyGothic", 9.2),
            ("BACKGROUND", (0, 0), (-1, 0), FONDO_TABLA),
            ("GRID", (0, 0), (-1, -1), 0.65, colors.black),
            ("VALIGN", (0, 0), (-1, -1), "TOP"),
            ("LEFTPADDING", (0, 0), (-1, -1), 6),
            ("RIGHTPADDING", (0, 0), (-1, -1), 6),
            ("TOPPADDING", (0, 0), (-1, -1), 6),
            ("BOTTOMPADDING", (0, 0), (-1, -1), 6),
        ]))
        despues = Spacer(1, 10.0)
        despues.origen = "tabla"
        self.historia += [tabla, despues]

    def construir(self):
        self.doc.build(self.historia)
