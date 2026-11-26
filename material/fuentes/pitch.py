"""Guion del pitch de 7 minutos de Tolera."""

import sys

from formato import Documento

d = Documento(
    sys.argv[1], tipo="GUION DEL PITCH", producto="TOLERA · SIMULADOR DE PERFIL DE INVERSIÓN",
    titulo_meta="Guion del pitch · Tolera",
    asunto="Guion de 7 minutos con tiempos, pantallas y reparto",
    fecha="2026-11-26", profesora="ÁNGELES URIBE MIRIAM",
    alumnos=["JIMÉNEZ CASTILLO MARÍA PAOLA", "RAMÍREZ HERNÁNDEZ NEHIEL", "SEGURA LOERA CARLOS EMILIANO"],
)


def bloque(tiempo, tema, quien, pantalla, texto):
    d.subtitulo(f"{tiempo} · {tema} · {quien}")
    d.nota(f"En pantalla: {pantalla}")
    d.parrafo(texto)


# 2 ---------------------------------------------------------------------------
d.seccion("Estructura del pitch")
d.parrafo("El pitch dura 7 minutos, se reparte entre tres presentadores y habla solo del producto. La maestra pidió no "
          "mostrar código, limpieza de datos, EDA ni tecnicismos. Los modelos (K-modes, árbol de decisión, "
          "sensibilidad) se defienden en la ronda de preguntas con el documento de notas.")
d.tabla([
    ["Tiempo", "Bloque", "Quién", "Objetivo"],
    ["0:00 – 0:45", "El problema", "Presentador 1", "Que la audiencia sienta la pregunta"],
    ["0:45 – 1:30", "Para quién es", "Presentador 1", "Público y qué le duele"],
    ["1:30 – 3:45", "Demo en vivo", "Presentador 2", "Mostrar el producto funcionando"],
    ["3:45 – 4:45", "Cómo decide Tolera tu perfil", "Presentador 3", "Explicar la idea en palabras simples"],
    ["4:45 – 5:45", "Por qué confiar en Tolera", "Presentador 3", "Lo que gana la persona"],
    ["5:45 – 6:30", "Frente a ChatGPT y hacia dónde crece", "Presentador 1", "Diferencia y siguiente paso"],
    ["6:30 – 7:00", "Cierre", "Presentador 1", "Mensaje que se quede"],
], [85, 175, 95, 165])
d.subtitulo("Antes de empezar")
d.parrafo("Abrir la página publicada en Vercel en la pantalla de inicio y dejar el simulador con sus valores de "
          "fábrica: $10,000 disponibles, meta de $9,000, menos de un año y caída de 15 %. Tener una pestaña con la "
          "página en local por si falla internet. En pantalla solo se muestra la página, nunca código ni tablas.")

# 3 ---------------------------------------------------------------------------
d.seccion("Guion")
bloque("0:00 – 0:45", "El problema", "Presentador 1", "portada de Tolera.",
       "Imaginen que tienen $10,000 ahorrados y que en menos de un año necesitan $9,000 para un enganche. Alguien les "
       "dice que su inversión podría caer 15 %. ¿Eso es mucho o poco? ¿Les alcanzaría? Casi nadie sabe responder "
       "eso con un porcentaje. Tolera lo responde en pesos y además les explica cuánto riesgo pueden tomar.")
bloque("0:45 – 1:30", "Para quién es", "Presentador 1", "sección «Para quién es».",
       "Tolera es para quien empieza a invertir con una meta en mente: un enganche, un viaje, un fondo para "
       "emergencias. Sabe cuánto necesita y para cuándo, pero no cuánto riesgo puede tomar. Le pasan tres cosas: un "
       "porcentaje le dice poco, confunde lo que quiere arriesgar con lo que su plazo le permite, y cuando le hacen un "
       "cuestionario de perfil, nadie le explica por qué le salió ese resultado.")
bloque("1:30 – 2:15", "Demo: la caída en pesos", "Presentador 2", "simulador abierto con los valores de fábrica.",
       "Empezamos con la meta. Con $10,000 y una caída de 15 %, quedarían $8,500 y faltarían $500 para la meta. "
       "Muevo la caída y el resultado cambia al momento. Estos montos se quedan en la computadora de la persona.")
bloque("2:15 – 3:15", "Demo: el perfil y la tolerancia en pesos", "Presentador 2",
       "cerrar el simulador, ir a Cuestionario y pulsar «Ver un ejemplo».",
       "Para no contestar las 14 preguntas en vivo, cargamos un ejemplo. Esta persona quiere hacer crecer su dinero, "
       "pero lo necesita en menos de un año. Está dispuesta a arriesgar bastante, y aun así su perfil es Conservador, "
       "porque su plazo no le da tiempo de recuperarse. Y aquí está lo que ningún cuestionario le dice: dijo que "
       "actuaría al caer 20 %, pero su meta solo aguanta 10 %. Una caída que todavía aguantaría ya la dejaría sin su "
       "enganche.")
bloque("3:15 – 3:45", "Demo: el chat y el siguiente paso", "Presentador 2",
       "escribir en el chat «¿Por qué no salí moderado?» y bajar a «¿Y ahora qué?».",
       "Si tiene dudas, pregunta. El chat recuerda la conversación y conoce su resultado. Y al final, Tolera le da "
       "preguntas concretas para llevar a su asesor o a su banco.")
bloque("3:45 – 4:45", "Cómo decide Tolera tu perfil", "Presentador 3", "tarjetas de «Por qué te salió este perfil».",
       "Tolera se hace dos preguntas sobre cada persona. La primera es cuánto puede arriesgar, y eso lo deciden su "
       "objetivo y su plazo. La segunda es cuánto quiere arriesgar, y eso lo dicen sus respuestas sobre pérdidas. El "
       "perfil se queda con la respuesta más prudente de las dos. Por eso una meta cercana pone un tope que ninguna "
       "otra respuesta puede compensar, ni la edad ni la experiencia. Son los mismos aspectos que los bancos en "
       "México deben revisar antes de recomendar una inversión.")
bloque("4:45 – 5:45", "Por qué confiar en Tolera", "Presentador 3", "resultado completo del ejemplo.",
       "Con las mismas respuestas, Tolera siempre da el mismo perfil. Cada resultado dice qué respuestas lo "
       "decidieron, así que la persona puede entenderlo y discutirlo. Si una respuesta puede cambiar el perfil, Tolera "
       "pregunta antes de decidir. Los montos nunca salen de su computadora. Y Tolera no recomienda productos: le "
       "ayuda a llegar con su asesor sabiendo qué preguntar.")
bloque("5:45 – 6:30", "Frente a ChatGPT y hacia dónde crece", "Presentador 1", "portada de Tolera.",
       "¿Por qué no preguntarle a ChatGPT? Porque un chatbot responde lo que le preguntas, y quien empieza no sabe qué "
       "preguntar. Tolera hace las preguntas necesarias y explica cada resultado. Hoy está publicado en la web. El "
       "siguiente paso es llevarlo a la nube de Google, para atender a más personas y aprender de sus respuestas "
       "cuáles preguntas generan más dudas.")
bloque("6:30 – 7:00", "Cierre", "Presentador 1", "portada de Tolera.",
       "Antes de elegir una inversión, hay que saber cuánto riesgo puedes tomar. Tolera te lo muestra en pesos y te "
       "explica por qué. Gracias.")

# 4 ---------------------------------------------------------------------------
d.seccion("Para ensayar")
d.tabla([
    ["Punto", "Qué cuidar"],
    ["Tiempo", "El guion tiene unas 500 palabras habladas, unos 4 minutos a ritmo tranquilo. El resto del "
               "tiempo se va en los clics de la demo, la espera del chat y las pausas. Si se pasan, recortar primero "
               "el bloque «Por qué confiar en Tolera», no la demo."],
    ["Lenguaje", "Hablar de la persona y de su meta. Evitar palabras como algoritmo, modelo, mediana, K-modes, "
                 "dataset o API durante el pitch."],
    ["Demo", "Ensayarla con la página publicada. Si DeepSeek tarda, seguir hablando de «¿Y ahora qué?» mientras "
             "llega la respuesta."],
    ["Transiciones", "Cada presentador cierra con una frase que conecte con el siguiente bloque."],
    ["Preguntas", "Las preguntas técnicas llegan después. Repartirlas con el documento de notas: perfiles y "
                  "modelos para el presentador 3, producto para el 1 y demo o tecnología para el 2."],
], [110, 410])
d.construir()
