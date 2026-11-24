# Cuestionario completo de perfil de inversión

## Alcance

El chat guía a la persona por las 14 preguntas del Excel y muestra un resultado orientativo. El resultado incluye el nivel de riesgo, la explicación de las reglas que se aplicaron y un resumen de la experiencia y las preferencias declaradas. El flujo funciona en el navegador y permite revisar cualquier respuesta.

Se conserva el sistema de reglas directas. Retomar la suma del baremo original exigiría justificar sus pesos y cortes. Con las reglas directas se puede explicar cómo el plazo, el objetivo y la reacción ante pérdidas influyen en el resultado.

## Qué aporta cada pregunta

| Preguntas | Uso en el resultado |
| --- | --- |
| P1 y P4 · Objetivo y plazo | Fijan el nivel de riesgo máximo para el objetivo y el plazo declarados. |
| P8, P9 y P10 · Reacción, caída y preferencia | Estiman la tolerancia a pérdidas a partir de tres respuestas. |
| P3, P5, P6 y P7 · Experiencia, mercados conocidos, herramientas de análisis y forma de decidir | Permiten explicar desde qué experiencia parte la persona y ajustar el lenguaje del chatbot. |
| P2, P11, P12, P13 y P14 · Edad, moneda, autoevaluación y otras inversiones | Aparecen en el resumen de respuestas para revisar. La P12 registra cómo se describe la persona. |

El perfil de riesgo tiene tres niveles: conservador, moderado y propenso al riesgo. Una persona puede obtener un perfil propenso al riesgo y declarar poca experiencia. El resultado explica ambas cosas.

## Reglas propuestas

1. **Objetivo y plazo.** Si la prioridad es disponer del dinero (P1) o el plazo es menor de un año (P4), el nivel máximo es conservador. Si el objetivo es recibir ingresos, o si el plazo es de uno a tres años, el nivel máximo es moderado. Con un plazo superior a tres años y un objetivo de crecimiento o especulación, el nivel máximo es propenso al riesgo.
2. **Tolerancia a pérdidas.** Cada una de las tres respuestas indica un nivel. Se toma el nivel central. Cuando dos respuestas coinciden, se toma ese nivel. Si las tres indican niveles distintos, se toma moderado y el chat explica la diferencia.
3. **Perfil.** Se toma el nivel más bajo entre la tolerancia y el límite del objetivo y el plazo. Por ejemplo, si una persona tolera una caída importante pero requiere el dinero antes de un año, el plazo determina un perfil conservador.
4. **Aclaración.** Si la persona responde «No me inquieto» en la P9, el sistema verifica si elegir 5 %, 10 % o 20 % cambiaría el perfil. Si cambia, el chat solicita la aclaración. Si el resultado coincide en los tres casos, explica qué otras respuestas determinaron el perfil.

| Señal de tolerancia | Conservador | Moderado | Propenso al riesgo |
| --- | --- | --- | --- |
| P8 · Reacción ante pérdidas | Incomodidad ante fluctuaciones o liquidar de inmediato | Esperar y analizar | Mantener la inversión a la espera de una recuperación |
| P9 · Caída ante la que actuaría | 5 % | 10 % | 20 % |
| P10 · Preferencia declarada | Máxima seguridad | Buscar rendimiento con seguridad o aceptar riesgo moderado | Buscar rendimientos altos y aceptar mayor riesgo |

Se usan categorías con un orden definido para combinar las respuestas. El método evita asignar puntos a la edad o a la moneda y elimina la excepción por autodeclararse sofisticado. Las reglas son una propuesta académica del equipo. El [Anexo 3 de la CNBV](https://www.cnbv.gob.mx/Anexos/Anexo%203%20Entidades%20y%20personas.pdf) se consultó como referencia para distinguir objetivos, plazo, tolerancia y experiencia.

## Experiencia de uso y comprobación

- Mostrar una pregunta a la vez, indicar el avance y conservar las respuestas al pedir una definición o volver atrás.
- Al final, mostrar el perfil, la razón principal y el botón «¿Por qué me salió este perfil?». Dejar las 14 respuestas en un resumen plegable desde el que se puedan editar.
- Mantener el diseño minimalista y los iconos ya aprobados. Aplicar `humanizer-es` a las preguntas, las explicaciones y la documentación.
- Probar los tres perfiles, el límite por plazo u objetivo, la aclaración y la edición de respuestas. Usar las 350 filas simuladas para comprobar el comportamiento de las reglas.

La propuesta se probó con los datos simulados. Entre las 350 filas, 139 dieron conservador, 131 moderado, 49 propenso al riesgo y 31 necesitaron aclaración. Esta prueba verifica qué devuelve el sistema con esos datos.
