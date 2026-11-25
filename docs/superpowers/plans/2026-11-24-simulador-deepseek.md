# Simulador y DeepSeek · Plan de implementación

**Objetivo:** Probar una caída para una meta y relacionar el escenario con el perfil de riesgo.

**Flujo:** La página abre con el simulador. La persona introduce el monto disponible, el monto necesario y el plazo. Puede pasar al cuestionario con ese plazo y preguntar en el chat por otra caída o por su perfil.

**Responsabilidades:** El navegador conserva los hechos y ejecuta el simulador y el motor de inferencia. Una función de servidor interpreta preguntas con DeepSeek y devuelve una acción permitida. Los montos se calculan en centavos y la explicación toma los hechos del cuestionario.

- [x] Probar y crear el cálculo de saldo, faltante y sobrante en `web/escenario.mjs`.
- [x] Añadir el simulador y reutilizar el plazo en la pregunta 4.
- [x] Probar y crear `api/interpretar.mjs`. Aceptar únicamente preguntas de texto y devolver `simular_caida` con un porcentaje válido o `explicar_perfil`.
- [x] Conectar las acciones al chat, verificar el modo local y documentar la configuración de Vercel.
- [ ] Probar la navegación en escritorio y móvil y publicar la versión disponible.
