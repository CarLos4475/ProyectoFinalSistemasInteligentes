# Tolera

Tolera calcula si una caída hipotética pondría en riesgo una meta y explica el perfil de inversión con las respuestas que lo determinaron. Está pensado para personas que empiezan a invertir y tienen una meta con plazo. El chat guía a la persona por las 14 preguntas del cuestionario y recuerda la conversación reciente.

[Abrir Tolera](https://sistemasinteligentesinversiopn.vercel.app/)

## Abrir en tu equipo

Con Python instalado, ejecuta este comando desde la carpeta del repositorio.

```text
python -m http.server 8000 --directory web
```

Abre [el simulador](http://localhost:8000). El navegador calcula el saldo en pesos y guarda las respuestas durante la sesión. Puedes pasar el plazo de tu meta al cuestionario o pedir otra caída desde el chat con una frase como «¿Y si mi inversión cae 15 %?».

## Cómo se armó el cuestionario

El equipo retomó las 14 preguntas de perfilamiento del Excel. El objetivo y el plazo fijan el nivel máximo de riesgo. La reacción ante las pérdidas, el porcentaje que haría actuar y la preferencia de riesgo indican la tolerancia. El motor toma el nivel menor de los dos. La experiencia declarada le da contexto a la explicación.

Los 350 casos de prueba del Excel sirven para comprobar qué reglas se activan y explorar patrones de respuesta. La [especificación del cuestionario completo](docs/superpowers/specs/2026-11-23-cuestionario-completo-design.md) explica cada criterio.

El resultado es orientativo. Tolera no recomienda inversiones concretas.

## Documentación y análisis

- [Documentación técnica](docs/DOCUMENTACION_TECNICA.pdf)
- [Documentación de negocio](docs/DOCUMENTACION_NEGOCIO.pdf)

El análisis limpia las respuestas del formulario, revisa el Excel, mide la sensibilidad de las reglas, agrupa los casos con K-modes y entrena un árbol de decisión con GridSearchCV. Necesitas Python 3.11 o posterior y Node.js. Indica la ruta de tus archivos.

```text
python -m pip install -r analisis/requirements.txt
python analisis/perfil_inversion.py "perfil_inversionista_350_respuestas.xlsx" --formulario respuestas.csv --salida resultados.json
```

Sin `--formulario`, el análisis toma las respuestas directamente del Excel.

## Publicar en Vercel

1. En [Vercel](https://vercel.com/new), importa `CarLos4475/ProyectoFinalSistemasInteligentes` desde GitHub.
2. Elige **Other** como **Framework Preset** y deja **Root Directory** en la raíz del repo (`./`). El archivo `vercel.json` publica la carpeta `web/` sin compilar y Vercel carga la función en `/api/interpretar`.
3. Si quieres habilitar DeepSeek, agrega una clave nueva como `DEEPSEEK_API_KEY` en **Environment Variables** para **Production**. Si la agregas después del primer despliegue, haz **Redeploy** para que surta efecto.
4. Pulsa **Deploy** y abre el enlace que genera Vercel. Visita también `/api/interpretar` en ese dominio para comprobar que devuelve `{"disponible":true}` con la variable configurada.

Sin la clave, el simulador, el cuestionario y el chat local siguen disponibles.

Al enviar una duda, DeepSeek recibe tu mensaje, los últimos tres intercambios, la pregunta que estás viendo con sus opciones, lo que ya marcaste en el cuestionario, tu perfil si ya lo tienes y los porcentajes de tu escenario. Los montos en pesos se calculan en tu navegador y no se envían. Si pides probar una caída o ver por qué te salió tu perfil, la página ejecuta esa acción con sus propias reglas. En GitHub Pages y cuando falla el proveedor, el chat usa sus explicaciones locales.

La función limita las consultas por instancia y usa un tiempo de espera de ocho segundos. Para una demo pública con la API activa, configura un límite en el [firewall de Vercel](https://vercel.com/docs/vercel-firewall/vercel-waf/custom-rules) para `POST /api/interpretar`. El límite del firewall abarca el despliegue, incluso si se ejecutan varias instancias.

## Pruebas

```text
node --test
```
