# Perfil del inversionista

## Problema

Quien empieza a invertir puede tener claro cuándo necesitará su dinero y cuánto le preocuparía perder, pero le cuesta relacionar esas dos respuestas con un perfil de riesgo. La página le devuelve un perfil orientativo y le muestra qué respuestas llevaron a ese resultado.

## Cómo se asigna el perfil

El Excel ofrece dos caminos. Uno consiste en revisar la puntuación de las 14 preguntas y justificar los cortes. El equipo eligió el otro: usar reglas directas con dos preguntas del cuestionario, el horizonte de inversión (P4) y la caída a partir de la cual la persona tomaría medidas (P9).

| Cuándo necesitaría el dinero | Al caer 5 % | Al caer 10 % | Al caer 20 % | «No me inquieto» |
| --- | --- | --- | --- | --- |
| Menos de 1 año | Conservador | Conservador | Conservador | Conservador |
| De 1 a 3 años | Conservador | Moderado | Moderado | Moderado |
| Más de 3 años | Conservador | Moderado | Propenso al riesgo | Pedir que elija un umbral |

El plazo corto basta para asignar el perfil conservador: hay menos tiempo para esperar una recuperación antes de necesitar el dinero. Tomar medidas ante una caída del 5 % también lleva a un perfil conservador, aunque el plazo sea largo. Para asignar el perfil propenso al riesgo, la persona debe indicar un plazo mayor a tres años y señalar el 20 % como la caída a partir de la cual tomaría medidas. Las demás combinaciones resueltas quedan en el perfil moderado.

Con un plazo mayor a tres años, «No me inquieto» deja abierta la tolerancia a una caída concreta. El chatbot pide elegir entre 5 %, 10 % y 20 % y explica para qué hace la pregunta. El perfil queda pendiente hasta que la persona elija un umbral o cambie su respuesta sobre el plazo.

Los cortes son criterios de este prototipo académico. Las 350 respuestas son simuladas y permiten probar qué resultado devuelve cada regla. Cubren las 12 combinaciones de la tabla.

## Recorrido en la página

1. La persona abre el chat y responde las dos preguntas con botones.
2. Durante el recorrido puede consultar términos como «horizonte» y «caída» y volver a la pregunta pendiente.
3. El motor de reglas devuelve el perfil y las condiciones que se cumplieron. El chat explica el resultado con las respuestas de esa persona.
4. La persona puede cambiar una respuesta para ver cómo cambia el resultado.

La página funciona en el navegador con HTML, CSS y JavaScript. El chatbot utiliza las preguntas, las definiciones y la explicación del motor. El resultado orienta sobre el perfil de riesgo. La demo para el pitch sigue a una sola persona desde su primera respuesta hasta «¿Por qué me salió este perfil?».

## Textos y documentación

Se aplica `humanizer-es` a los textos en español de la página, el chatbot, los documentos y el guion del pitch. El chat usa frases que una persona pueda leer de corrido y términos que el equipo pueda explicar en voz alta.

Los PDF de negocio y técnico siguen el formato de `DOCUMENTACION_NEGOCIO.pdf` y `DOCUMENTACION_TECNICA.pdf` del proyecto de IA. Se toma como referencia la portada institucional, la tipografía, los colores, la jerarquía de títulos, las tablas y los pies de página. El documento de negocio explica el problema, para quién es la página y qué hace el producto. El técnico explica la base de conocimientos, las reglas, el recorrido del chatbot y las pruebas con las respuestas simuladas.

## Pruebas de aceptación

- Probar las 12 combinaciones y las tres respuestas de la pregunta de seguimiento.
- Comprobar que un plazo menor a un año produzca una explicación conservadora aunque la tolerancia declarada sea alta.
- Comprobar que pedir una definición conserve la pregunta pendiente.
- Cambiar una respuesta y verificar que se actualicen el perfil y su justificación.
