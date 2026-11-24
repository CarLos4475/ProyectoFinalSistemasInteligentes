# Perfil del inversionista · Implementation Plan

> **For agentic workers:** Use superpowers:executing-plans to implement this plan task by task.

**Goal:** Entregar una página interactiva que asigne y explique un perfil de riesgo en un chat.

**Architecture:** El motor puro recibe el plazo, la caída y la aclaración cuando corresponda. La interfaz muestra las preguntas por turnos y explica las condiciones que devuelve el motor.

**Tech Stack:** HTML, CSS y JavaScript. Pruebas con Node.js y Chromium.

**Spec:** `docs/superpowers/specs/2026-11-23-perfil-inversionista-design.md`

## Restricciones

La sesión funciona en el navegador. Los textos se revisan con humanizer-es. El Excel aporta casos simulados de prueba y queda fuera del sitio.

## 1. Motor de reglas

- [ ] En `tests/perfil.test.mjs`, comprobar las 12 celdas de la tabla, las tres aclaraciones y los estados incompletos. Ver el fallo con `node --test`.
- [ ] En `web/perfil.mjs`, implementar `evaluarPerfil({ plazo, caida, aclaracion })`. El resultado indica el paso pendiente o devuelve el perfil y los motivos. La aclaración solo cuenta para «Más de 3 años» con «No me inquieto».
- [ ] Ejecutar `node --test` y registrar el cambio.

## 2. Chat y página

- [ ] Crear una verificación en navegador para preguntar por liquidez durante el cuestionario, aclarar la caída, abrir la explicación y editar el plazo. Comprobar el fallo antes de implementar la página.
- [ ] Crear `web/index.html`, `web/styles.css` y `web/chat.mjs`. Mantener el historial de respuestas y la ayuda dentro de la sesión. Insertar los mensajes como texto y restaurar el foco al cambiar de paso.
- [ ] Probar el recorrido, el reinicio, el teclado, el caso de texto desconocido y las vistas de escritorio y móvil. Documentar cómo abrir la página en `README.md`.
- [ ] Ejecutar la suite y registrar el cambio.

## Revisión

- Si una persona necesita el dinero pronto, la explicación debe citar el plazo aunque su tolerancia sea alta.
- Una pregunta de ayuda no debe modificar las respuestas ni perder el turno.
- Editar el plazo debe recalcular el perfil y retirar una aclaración que ya no corresponda.
- Al enviar una duda sin coincidencia, la persona debe poder seguir con el cuestionario.
- El reinicio debe borrar respuestas, aclaraciones y resultado.
