"""Notas internas para preparar la exposición de Tolera."""

import sys

from reportlab.platypus import PageBreak

from formato import Documento

d = Documento(
    sys.argv[1], tipo="NOTAS PARA LA EXPOSICIÓN", producto="TOLERA · SIMULADOR DE PERFIL DE INVERSIÓN",
    titulo_meta="Notas para la exposición · Tolera",
    asunto="Cifras clave, preguntas probables y respuestas para la exposición",
    fecha="2026-11-26", profesora="ÁNGELES URIBE MIRIAM",
    alumnos=["JIMÉNEZ CASTILLO MARÍA PAOLA", "RAMÍREZ HERNÁNDEZ NEHIEL", "SEGURA LOERA CARLOS EMILIANO"],
)

# 2 ---------------------------------------------------------------------------
d.seccion("Mensaje central y cifras clave")
d.parrafo("<b>Tolera traduce una caída a pesos sobre tu meta y explica tu perfil de inversión con reglas que se "
          "pueden comprobar.</b> El perfil combina lo que la persona puede arriesgar, según su objetivo y su plazo, "
          "con lo que quiere arriesgar, y toma el nivel más bajo.")
d.subtitulo("Cifras que conviene saber de memoria")
d.tabla([
    ["Tema", "Cifra", "Dónde está"],
    ["Casos analizados", "350", "Documento técnico, limpieza"],
    ["Limpieza", "368 filas, 4 vacías y 14 envíos repetidos. 4,900 de 4,900 respuestas convertidas",
     "Documento técnico, limpieza"],
    ["Salida de las reglas", "139 conservador, 131 moderado, 49 propenso y 31 con aclaración",
     "Documento técnico, sistema experto"],
    ["Perfil sin aclaración", "319 de 350 (91.1 %)", "Documento de negocio, evidencia"],
    ["Público", "153 de 25 a 40 años (43.7 %) y 186 sin experiencia (53.1 %)", "Documento de negocio, público"],
    ["Baremo anterior", "De 87 personas con plazo menor de un año, 46 salieron Sofisticado y ninguna Adversa",
     "Documento técnico, fundamento"],
    ["K-modes", "k = 2 con silueta de 0.281. Grupos de 244 y 106 casos", "Documento técnico, agrupamiento"],
    ["Árbol de decisión", "Profundidad 4: 89.3 % en validación y 84.1 % en prueba. Usa P1, P4, P8, P9 y P10",
     "Documento técnico, árbol"],
    ["Sensibilidad", "Equivalencias: de 1.1 % a 8.3 %. Plazo medio: 15.7 %. Mínimo en vez de mediana: 38.3 %",
     "Documento técnico, sensibilidad"],
    ["Pruebas", "22 pruebas automáticas", "node --test"],
], [120, 250, 150])

# 3 ---------------------------------------------------------------------------
d.seccion("Preguntas sobre los perfiles")
d.nota("Esta fue la parte que más se cuestionó en la entrega parcial. Conviene que los tres puedan responderla.")
d.tabla([
    ["Pregunta", "Respuesta corta"],
    ["¿En qué se basaron para definir los perfiles?",
     "En las dimensiones que la CNBV exige evaluar al perfilar a un inversionista: objetivos, situación financiera y "
     "conocimientos. Tolera mide objetivo (P1), plazo (P4), tolerancia (P8 a P10) y experiencia (P3, P5 a P7)."],
    ["¿Por qué el perfil es el nivel más bajo?",
     "La guía de perfilamiento del CFA Institute distingue la capacidad de asumir riesgo de la disposición y señala "
     "que la capacidad suele ser el límite. Nosotros lo formalizamos como un mínimo. La guía no usa la palabra "
     "«mínimo»: es nuestra forma de aplicar el principio."],
    ["¿De dónde salen los cortes de 1 y 3 años?",
     "Son los mismos que usa la CNBV en el Anexo 1 de la CUFI para separar corto, mediano y largo plazo en los "
     "fondos de deuda."],
    ["¿Por qué la mediana de las tres señales?",
     "Las tres preguntas miden lo mismo. La mediana ignora una respuesta que no concuerda. El mínimo sería "
     "doblemente conservador y el promedio supone distancias iguales entre niveles."],
    ["¿Por qué 5 %, 10 % y 20 %?",
     "Son las opciones del cuestionario original. Solo suponemos que están en orden: actuar al 5 % indica menos "
     "tolerancia que actuar al 20 %."],
    ["¿Por qué ya no usan puntos?",
     "La suma compensa: la edad o la experiencia tapaban un plazo corto. De 87 personas que necesitan el dinero en "
     "menos de un año, 46 salían Sofisticado. Además, el rango Adverso era casi inalcanzable."],
    ["¿Por qué no usan la edad?",
     "Lo que la edad intenta aproximar es el horizonte, y ese lo preguntamos directo en P4. Usar las dos cosas "
     "contaría el plazo dos veces."],
    ["¿Cómo saben que los perfiles están bien?",
     "El análisis de sensibilidad muestra que son estables: cambiar la equivalencia de una respuesta sobre pérdidas "
     "mueve como máximo 8.3 % de los casos, y el tope del plazo medio, 15.7 %. Eso prueba estabilidad, no exactitud. La validación externa, contra un asesor real, queda como trabajo "
     "futuro."],
], [170, 350])

# 4 ---------------------------------------------------------------------------
d.seccion("Preguntas sobre datos y modelos")
d.tabla([
    ["Pregunta", "Respuesta corta"],
    ["¿Cómo limpiaron los datos?",
     "Solo con Python, en analisis/limpieza.py. Normalización de texto, expresiones regulares para letras, fechas y "
     "edades, y similitud de cadenas con difflib para las erratas. Se recuperaron las 4,900 respuestas."],
    ["¿Por qué K-modes y no K-means?",
     "Las respuestas son categóricas. K-means necesita promedios y distancias numéricas. K-modes usa la moda y cuenta "
     "cuántas categorías son distintas (Huang, 1998)."],
    ["¿Por qué dos grupos?",
     "Probamos k de 2 a 5 con dos inicializaciones y elegimos la mayor silueta (0.281). La diferencia con k = 3 y "
     "k = 4 fue pequeña, así que lo usamos como descripción exploratoria."],
    ["¿Qué es la silueta?", "Mide qué tan cerca está cada caso de su grupo comparado con el grupo vecino. Va de -1 "
                            "a 1. Más alto indica grupos mejor separados."],
    ["¿Para qué sirve el árbol de decisión?",
     "Para comprobar con los datos qué preguntas anticipan el perfil. Sin conocer las reglas, eligió las mismas "
     "cinco que usan."],
    ["¿Qué es GridSearchCV?",
     "Prueba todas las combinaciones de hiperparámetros (42) con validación cruzada de 5 pliegues y se queda con la "
     "de mejor exactitud promedio."],
    ["¿Por qué profundidad 4 y no la más exacta?",
     "El árbol sin límite llega a 94.7 %, pero usa P6 y P11, que no tienen relación con el riesgo. Eso es "
     "sobreajuste. El de profundidad 4 tiene 8 hojas y se puede explicar."],
    ["¿El árbol reemplaza a las reglas?", "No. Las reglas deciden el perfil. El árbol solo confirma qué preguntas "
                                          "importan."],
], [170, 350])

# 5 ---------------------------------------------------------------------------
d.seccion("Preguntas sobre el producto")
d.tabla([
    ["Pregunta", "Respuesta corta"],
    ["¿Qué ventaja tienen frente a ChatGPT?",
     "Tolera hace las preguntas que importan, da el mismo perfil con las mismas respuestas y explica el resultado con "
     "las reglas que lo calcularon. Los montos no salen del navegador. Nuestro chat también usa un modelo de "
     "lenguaje, pero solo explica: el perfil lo deciden las reglas."],
    ["¿Qué datos recibe DeepSeek?",
     "El mensaje, los últimos tres intercambios, la pregunta activa, las respuestas marcadas, el perfil calculado y "
     "los porcentajes del escenario. Nunca los montos en pesos. El servidor rechaza cualquier dato de más."],
    ["¿Qué pasa si falla DeepSeek?", "El chat usa explicaciones locales y el simulador y el cuestionario siguen "
                                     "funcionando."],
    ["¿Recomiendan inversiones?", "No. La sección «¿Y ahora qué?» describe en general cada perfil y sugiere "
                                  "preguntas para un asesor."],
    ["¿Para quién es?", "Para personas de 25 a 40 años que empiezan a invertir con una meta y un plazo."],
    ["¿Ya está en la nube de Google?",
     "No. Hoy funciona en Vercel. La arquitectura en Google Cloud es una propuesta: Cloud Run, BigQuery, BigQuery ML, "
     "Cloud Run Jobs, Cloud Scheduler, Secret Manager y Cloud Armor."],
    ["¿Por qué no BigQuery ML para K-modes?", "BigQuery ML incluye KMEANS, pero no K-modes. Por eso K-modes "
                                              "seguiría en Python dentro de un Cloud Run Job."],
    ["¿Cuánto costaría?", "No lo estimamos. Cloud Run cobra según el uso y baja a cero instancias sin tráfico, así "
                          "que el costo sigue a la demanda."],
], [170, 350])

# 5b --------------------------------------------------------------------------
d.seccion("Ronda de preguntas técnicas")
d.parrafo("Las preguntas técnicas llegan después del pitch. Esta sección prepara las más difíciles: la historia que "
          "explica por qué la página no usa los rangos del Excel, las repreguntas que suelen tumbar a un equipo y "
          "cómo funciona el chat por dentro.")
d.subtitulo("La historia del rediseño")
d.parrafo("Es la respuesta a «¿por qué el Excel tiene puntos y rangos y la página no?». Conviene contarla en este "
          "orden, siempre que sea el orden en que pasó.")
d.tabla([
    ["Paso", "Qué decir"],
    ["1. Punto de partida", "Partimos del cuestionario de 14 preguntas y del baremo de puntos del Excel."],
    ["2. Revisión con los datos", "Al revisar los 350 casos encontramos tres fallas: el rango Adverso quedó con 0 "
                                  "casos, la etiqueta Sofisticado consultaba P10 en vez de P12, y la suma compensaba "
                                  "el plazo corto (46 de 87 personas con plazo menor de un año salían Sofisticado)."],
    ["3. Investigación", "Revisamos qué exige la CNBV al perfilar, la guía de perfilamiento del CFA Institute y la "
                         "clasificación de plazos del Anexo 1 de la CUFI."],
    ["4. Rediseño", "Cambiamos la suma por reglas de niveles: capacidad contra disposición y el nivel más prudente."],
    ["5. Comprobación", "Medimos con el análisis de sensibilidad cuánto cambian los perfiles si se eligen otras "
                        "equivalencias."],
], [130, 390])
d.nota("[Por confirmar en el equipo: que este sea el orden real. Si el rediseño fue antes de revisar los datos, "
       "cuéntenlo así. Una cronología que no ocurrió se cae con una repregunta.]")

d.subtitulo("Repreguntas difíciles")
d.tabla([
    ["Repregunta", "Respuesta"],
    ["«¿Quién decidió que “esperaría y revisaría” es tolerancia intermedia?»",
     "Fue criterio del equipo. Por eso lo medimos: si estuviera mal, cambia entre 5.4 % y 7.4 % de los perfiles."],
    ["«Entonces, ¿sus perfiles son correctos?»",
     "Son estables y están fundamentados. Para afirmar que son correctos habría que compararlos con el perfil que "
     "asigna un asesor. Es trabajo futuro."],
    ["«Entrenaron el árbol para predecir sus propias reglas. ¿No es circular?»",
     "Sí, y por eso no lo usamos para validar los perfiles. Sirve para confirmar que la información está en P1, P4, "
     "P8, P9 y P10 y no en las otras nueve preguntas."],
    ["«Una silueta de 0.281 es baja. ¿Los grupos existen?»",
     "La estructura es débil. Por eso K-modes se presenta como descripción exploratoria y ninguna decisión del "
     "producto depende de los grupos."],
    ["«Agruparon con las mismas preguntas que usan las reglas. ¿No es obvio que coincidan?»",
     "En parte sí. El cruce describe cómo se relacionan ambos resultados, no prueba que las reglas sean correctas."],
    ["«¿Por qué no usaron P15 como variable objetivo?»",
     "P15 mide el acuerdo con el perfil del baremo anterior, que tenía fallas. No sirve como verdad."],
    ["«¿Y si cambian dos decisiones a la vez?»",
     "El análisis cambia una a la vez, así que no mide interacciones. Es su limitación y podemos reconocerla."],
    ["«¿De dónde salen los datos y cómo se recolectaron?»", "[Respuesta del equipo. Debe ser verdadera.]"],
], [200, 320])

d.subtitulo("Cómo funciona el chat")
d.tabla([
    ["Pregunta", "Respuesta corta"],
    ["¿Cómo está construido?", "La página llama a una función en Vercel, /api/interpretar, que consulta a DeepSeek "
                               "Flash. La clave del proveedor nunca llega al navegador."],
    ["¿Qué recibe el modelo?", "El mensaje, los últimos tres intercambios, la pregunta activa, las respuestas "
                               "marcadas, el perfil calculado en el servidor y los porcentajes del escenario. Nunca "
                               "los pesos."],
    ["¿Qué puede hacer el modelo?", "Responder con texto o pedir una de dos acciones: simular una caída o mostrar "
                                    "la explicación del perfil. Ambas se validan antes de ejecutarse."],
    ["¿Qué límites tiene?", "12 consultas por minuto por instancia, 8 segundos de espera, respuestas de hasta 300 "
                            "tokens y un tamaño máximo por petición."],
    ["¿Y si el usuario intenta engañarlo?", "El perfil lo calculan las reglas en el servidor, el historial se valida "
                                           "y solo hay dos acciones permitidas. Lo peor posible es una respuesta de "
                                           "texto mala, no un perfil falso."],
    ["¿Y si DeepSeek falla?", "El chat usa explicaciones locales: un glosario y patrones para simular caídas o "
                              "aclarar preguntas."],
    ["¿Por qué DeepSeek?", "Por precio: es barato, y el chat responde dudas cortas. Además, la conexión está "
                           "en un solo archivo, api/interpretar.mjs, así que cambiar de proveedor no toca el resto."],
    ["¿Y la calidad de las respuestas?", "El perfil no depende del modelo, lo calculan las reglas. El modelo solo "
                                         "explica, y en las pruebas entendió el contexto y las referencias a la "
                                         "conversación."],
], [160, 360])

d.historia.append(PageBreak())
d.subtitulo("Nube y trabajo futuro")
d.tabla([
    ["Pregunta", "Respuesta corta"],
    ["¿Por qué Cloud Run?", "Escala con la demanda, baja a cero instancias sin tráfico, usa contenedores y no hay "
                            "servidores que administrar."],
    ["¿BigQuery ML agrupa respuestas categóricas?", "Sí, con KMEANS y codificación one-hot. K-modes seguiría en "
                                                    "Python dentro de un Cloud Run Job."],
    ["¿Qué harían con más tiempo?", "Comparar los perfiles con los de asesores reales, hacer una prueba de uso con "
                                    "personas y probar el cuestionario corto de cinco preguntas."],
    ["¿Cuál es la principal limitación?", "El perfil es orientativo, no tiene validación externa y las "
                                          "equivalencias de cada opción son criterio del equipo."],
], [190, 330])

d.subtitulo("Reparto y reglas para responder")
d.tabla([
    ["Tema", "Quién responde"],
    ["Perfiles, criterios y sensibilidad", "Presentador 3"],
    ["K-modes, árbol, GridSearchCV y limpieza", "[Quien hizo el análisis]"],
    ["Chat, arquitectura y nube", "[Quien conozca mejor el código]"],
    ["Producto, público y ChatGPT", "Presentador 1"],
], [260, 260])
d.parrafo("Si no saben algo, digan «no lo medimos» o «queda como trabajo futuro». Responder corto y con un dato "
          "funciona mejor que una explicación larga. Ensayen en voz alta las repreguntas difíciles, sobre todo la "
          "circularidad del árbol y el origen de los datos.")

# 6 ---------------------------------------------------------------------------
d.seccion("Qué evitar y plan B")
d.subtitulo("Durante el pitch")
d.parrafo("La maestra pidió no mostrar código, limpieza de datos, EDA ni tecnicismos en el pitch. En pantalla solo va "
          "la página y se habla de la persona y su meta. Todo lo de este documento sobre datos y modelos es para la "
          "ronda de preguntas.")
d.subtitulo("Frases que conviene evitar")
d.tabla([
    ["Evitar", "Decir en su lugar"],
    ["«El perfil es correcto» o «está validado»", "«Las reglas son estables ante cambios razonables»"],
    ["«Usamos BigQuery»", "«Proponemos BigQuery para la siguiente etapa»"],
    ["«Tolera te dice en qué invertir»", "«Tolera te dice cuánto riesgo puedes tomar y qué preguntar»"],
    ["«El CFA dice que se toma el mínimo»", "«Seguimos el principio de que la capacidad limita la disposición»"],
    ["«La CNBV define nuestros perfiles»", "«La CNBV define qué dimensiones evaluar»"],
    ["«El sistema acierta 84 %»", "«El árbol anticipa la salida de las reglas en 84 % de los casos de prueba»"],
], [240, 280])
d.subtitulo("Si falla internet durante la demo")
d.parrafo("Llevar el repositorio en la laptop y abrir la página en local con python -m http.server 8000 --directory "
          "web. El simulador, el cuestionario, la tolerancia en pesos y el chat local funcionan sin conexión. Solo "
          "se pierde DeepSeek. Tener también capturas de la demo como último respaldo.")
d.construir()
