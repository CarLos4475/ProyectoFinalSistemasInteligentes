# Material de la exposición

- `GUION_PITCH.pdf`: guion del pitch de 7 minutos, con tiempos, pantallas y reparto.
- `NOTAS_EXPOSICION.pdf`: cifras clave, preguntas probables y respuestas para la ronda de preguntas.

Los documentos oficiales están en `docs/`.

## Volver a generar los PDF

Los archivos de `fuentes/` generan los cuatro PDF con ReportLab y la fuente Century Gothic de macOS (la ruta está en `formato.py`).

```text
python -m pip install reportlab==4.2.5
cd material/fuentes
python tecnica.py ../../docs/DOCUMENTACION_TECNICA.pdf
python negocio.py ../../docs/DOCUMENTACION_NEGOCIO.pdf
python notas_expo.py ../NOTAS_EXPOSICION.pdf
python pitch.py ../GUION_PITCH.pdf
```
