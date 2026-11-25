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

## Publicar en Vercel

1. En [Vercel](https://vercel.com/new), importa `CarLos4475/ProyectoFinalSistemasInteligentes` desde GitHub.
2. Elige **Other** como **Framework Preset** y deja **Root Directory** en la raíz del repo (`./`). El archivo `vercel.json` publica la carpeta `web/` sin compilar y Vercel carga la función en `/api/interpretar`.
3. Si quieres habilitar DeepSeek, agrega una clave nueva como `DEEPSEEK_API_KEY` en **Environment Variables** para **Production**. Si la agregas después del primer despliegue, haz **Redeploy** para que surta efecto.
4. Pulsa **Deploy** y abre el enlace que genera Vercel. Visita también `/api/interpretar` en ese dominio para comprobar que devuelve `{"disponible":true}` con la variable configurada.

Sin la clave, el simulador, el cuestionario y el chat local siguen disponibles.

Cuando DeepSeek está disponible, recibe lo que escribes en el chat junto con la pregunta y las opciones que ves. Con eso redacta una respuesta a tu duda. Las opciones que marques y los montos del simulador se quedan en tu navegador. Si pides probar una caída o ver por qué te salió tu perfil, la página ejecuta esa acción con sus propias reglas. En GitHub Pages y cuando falla el proveedor, el chat usa sus explicaciones locales.

La función limita las consultas por instancia y usa un tiempo de espera de ocho segundos. Para una demo pública con la API activa, configura un límite en el [firewall de Vercel](https://vercel.com/docs/vercel-firewall/vercel-waf/custom-rules) para `POST /api/interpretar`. El límite del firewall abarca el despliegue, incluso si se ejecutan varias instancias.

## Pruebas

```text
node --test
```
