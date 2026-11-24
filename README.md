# Perfil de inversión

Página interactiva para explorar un perfil de riesgo. El chat te guía por las 14 preguntas del cuestionario y te explica qué respuestas determinaron el resultado.

[Abrir la página publicada](https://carlos4475.github.io/ProyectoFinalSistemasInteligentes/)

## Abrir en tu equipo

Con Python instalado, ejecuta este comando desde la carpeta del repositorio.

```text
python -m http.server 8000 --directory web
```

Abre [el chat](http://localhost:8000). El navegador calcula el perfil y conserva las respuestas durante la sesión.

## Cómo se armó el cuestionario

El equipo retomó las 14 preguntas de perfilamiento del Excel. El objetivo y el plazo fijan el nivel máximo de riesgo. La reacción ante las pérdidas, el porcentaje que haría actuar y la preferencia de riesgo indican la tolerancia. El motor toma el nivel menor de los dos. La experiencia declarada le da contexto a la explicación.

Las 350 respuestas del Excel son simuladas y sirven para probar las reglas. La [especificación del cuestionario completo](docs/superpowers/specs/2026-11-23-cuestionario-completo-design.md) explica cada criterio.

El resultado es orientativo y forma parte de un proyecto académico.

## Pruebas del motor

```text
node --test
```
