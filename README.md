# Perfil de inversión

Página interactiva para probar si una caída hipotética pondría en riesgo una meta. El chat te guía por las 14 preguntas del cuestionario y te explica qué respuestas determinaron el perfil.

[Abrir la página publicada](https://carlos4475.github.io/ProyectoFinalSistemasInteligentes/)

## Abrir en tu equipo

Con Python instalado, ejecuta este comando desde la carpeta del repositorio.

```text
python -m http.server 8000 --directory web
```

Abre [el simulador](http://localhost:8000). El navegador calcula el saldo en pesos y guarda las respuestas durante la sesión. Puedes pasar el plazo de tu meta al cuestionario o pedir otra caída desde el chat con una frase como «¿Y si mi inversión cae 15 %?».

## Cómo se armó el cuestionario

El equipo retomó las 14 preguntas de perfilamiento del Excel. El objetivo y el plazo fijan el nivel máximo de riesgo. La reacción ante las pérdidas, el porcentaje que haría actuar y la preferencia de riesgo indican la tolerancia. El motor toma el nivel menor de los dos. La experiencia declarada le da contexto a la explicación.

Las 350 respuestas del Excel son simuladas y sirven para probar las reglas. La [especificación del cuestionario completo](docs/superpowers/specs/2026-11-23-cuestionario-completo-design.md) explica cada criterio.

El resultado es orientativo y forma parte de un proyecto académico.

## Activar DeepSeek en Vercel

Importa este repositorio como proyecto en Vercel. La configuración publica `web/` y expone `/api/interpretar`. Guarda una clave de DeepSeek en la variable de servidor `DEEPSEEK_API_KEY` y vuelve a desplegar. En la página de ese despliegue aparece la opción de usar DeepSeek.

Al activar esa opción, la función envía a DeepSeek únicamente el texto de la pregunta. El proveedor puede indicar una caída del 0 al 100 % o pedir que se muestre la explicación del perfil. El código del navegador ejecuta ambas acciones. La versión de GitHub Pages usa la interpretación local.

La función limita las consultas por instancia y usa un tiempo de espera de cinco segundos. Para una demo pública con la API activa, configura un límite en el [firewall de Vercel](https://vercel.com/docs/vercel-firewall/vercel-waf/custom-rules) para `POST /api/interpretar`. El límite del firewall abarca el despliegue, incluso si se ejecutan varias instancias.

## Pruebas

```text
node --test
```
