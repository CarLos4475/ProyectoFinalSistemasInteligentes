# Perfil de inversión

Página interactiva para explorar un perfil de riesgo. El chat pregunta cuándo necesitarías el dinero y qué caída te haría tomar medidas. El sistema experto aplica las reglas y muestra qué respuestas explican el resultado.

## Abrir en tu equipo

Con Python instalado, ejecuta este comando desde la carpeta del repositorio.

```text
python -m http.server 8000 --directory web
```

Abre [el chat](http://localhost:8000). El navegador calcula el perfil y conserva las respuestas durante la sesión.

## Cómo se armó el cuestionario

El equipo retomó dos preguntas del Excel de perfilamiento. La P4 mide el horizonte de inversión y la P9 pregunta qué caída te haría tomar medidas. Las 350 respuestas del Excel son simuladas y cubren los 12 cruces de la tabla. La [especificación](docs/superpowers/specs/2026-11-23-perfil-inversionista-design.md) explica cada regla.

El resultado es orientativo y forma parte de un proyecto académico.

## Pruebas del motor

```text
node --test
```
