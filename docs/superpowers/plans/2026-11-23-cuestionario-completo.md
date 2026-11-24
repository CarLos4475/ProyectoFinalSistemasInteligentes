# Cuestionario completo · Implementation Plan

> **For agentic workers:** Use superpowers:executing-plans to implement this plan task by task.

**Goal:** Publicar el cuestionario de 14 preguntas con un perfil explicable.

**Architecture:** `web/cuestionario.mjs` guarda preguntas y opciones. `web/perfil.mjs` calcula el límite, la tolerancia y el perfil. `web/chat.mjs` controla los turnos y explica el resultado.

**Tech Stack:** HTML, CSS y JavaScript. Node.js y Chromium para las pruebas.

**Spec:** `docs/superpowers/specs/2026-11-23-cuestionario-completo-design.md`

## Motor

- [x] Escribir las pruebas para comprobar el límite, el nivel central y la aclaración. Ejecutar `node --test` antes de cambiar el motor.
- [x] Implementar `evaluarPerfil(respuestas)`. Si falta una respuesta, devuelve su clave. Si una aclaración cambia el perfil, devuelve `aclaracion`. El resultado incluye `perfil`, `limite` y `tolerancia`.
- [x] Verificar los tres perfiles con las 350 filas simuladas y comprobar las opciones de aclaración.

## Chat

- [x] Recorrer las 14 preguntas en orden. Permitir volver atrás, cancelar una edición y consultar definiciones durante el cuestionario.
- [x] Mostrar la razón principal, el detalle del cálculo y la experiencia declarada. Añadir el resumen plegable para editar las 14 respuestas.
- [x] Probar el recorrido, la aclaración, la edición y el reinicio en Chromium en escritorio y móvil.
- [x] Actualizar el README y publicar en el repositorio y en GitHub Pages. Comprobar el enlace público.
