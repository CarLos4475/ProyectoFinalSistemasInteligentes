"""Documentación de negocio de Tolera."""

import sys

from formato import Documento, enlace

URL = "https://sistemasinteligentesinversiopn.vercel.app/"
d = Documento(
    sys.argv[1], tipo="DOCUMENTACIÓN DE NEGOCIO", producto="TOLERA · SIMULADOR DE PERFIL DE INVERSIÓN",
    titulo_meta="Documentación De Negocio · Tolera, simulador de perfil de inversión",
    asunto="Público objetivo, problemática, propuesta de valor y evidencia de funcionamiento",
    fecha="2026-11-26", profesora="ÁNGELES URIBE MIRIAM",
    alumnos=["JIMÉNEZ CASTILLO MARÍA PAOLA", "RAMÍREZ HERNÁNDEZ NEHIEL", "SEGURA LOERA CARLOS EMILIANO"],
)

# 2 ---------------------------------------------------------------------------
d.seccion("Problema y propuesta")
d.parrafo("<b>¿Una caída pondría en riesgo mi meta?</b> Cuando alguien empieza a invertir, puede saber cuánto "
          "dinero necesita y para cuándo, pero le cuesta traducir una caída porcentual a pesos o decidir cuánta "
          "pérdida toleraría. Tolera responde esa pregunta antes de que la persona elija una inversión.")
d.subtitulo("Público objetivo")
d.parrafo("Personas de 25 a 40 años que empiezan a invertir y tienen una meta con fecha, como un enganche, un "
          "viaje o un fondo para emergencias, pero no saben cuánto riesgo pueden tomar.")
d.tabla([
    ["Dato de los 350 casos", "Valor", "Qué indica"],
    ["Personas de 25 a 40 años", "153 (43.7 %)", "Es el grupo de edad más grande"],
    ["Nunca han invertido", "186 (53.1 %)", "Más de la mitad empieza desde cero"],
    ["Sin inversiones en otras instituciones", "249 (71.1 %)", "La mayoría no tiene un portafolio previo"],
], [200, 110, 210])
d.subtitulo("Qué hace el producto")
d.tabla([
    ["Paso", "Qué obtiene la persona"],
    ["1. Poner una meta", "Ingresa el dinero disponible, lo que necesita, el plazo y la caída que quiere probar."],
    ["2. Ver el impacto", "Ve cuánto dinero le quedaría, si alcanzaría su meta y cuánta caída aguanta esa meta."],
    ["3. Entender su perfil", "Contesta el cuestionario con ayuda del chat y recibe un perfil orientativo con las "
                              "respuestas que lo determinaron y preguntas para llevar a su asesor."],
], [155, 365])
d.subtitulo("Escena para la demostración")
d.parrafo("Una persona tiene $10,000 y necesita $9,000 en menos de un año. Con una caída del 15 %, su saldo bajaría "
          "a $8,500 y le faltarían $500. Tolera le muestra que su meta solo aguanta caídas de hasta 10 % y, al pasar "
          "el plazo al cuestionario, cómo una meta cercana limita el riesgo que se le asigna.")
d.nota(enlace("Abrir Tolera", URL) + ". El escenario se puede probar desde el navegador.")

# 3 ---------------------------------------------------------------------------
d.seccion("Problemática y propuesta de valor")
d.tabla([
    ["Problema", "Cómo lo resuelve Tolera"],
    ["Una caída del 15 % dice poco si no se ve en pesos sobre la meta.",
     "El simulador muestra el saldo, si alcanza la meta y la mayor caída que la meta aguanta."],
    ["La persona confunde cuánto le gustaría arriesgar con cuánto le permite su plazo.",
     "El perfil toma el nivel más bajo entre la tolerancia y el límite que fijan el objetivo y el plazo."],
    ["Los cuestionarios tradicionales dan un perfil sin explicar por qué. Con el baremo anterior, 48 de 350 "
     "personas (13.7 %) no estuvieron de acuerdo con su perfil.",
     "El resultado muestra qué respuestas determinaron el perfil y pide aclarar cuando una respuesta puede "
     "cambiarlo."],
    ["Muchas personas dependen de otra para decidir. «La opinión de mi asesor» fue el factor más elegido "
     "(109 casos).",
     "La sección «¿Y ahora qué?» da preguntas concretas para llevar al asesor o al banco."],
], [260, 260])
d.subtitulo("Frente a preguntarle a un chatbot general")
d.parrafo("Un chatbot general responde lo que se le pregunta, pero quien empieza no sabe qué datos importan. "
          "Tolera hace las preguntas necesarias, da el mismo perfil cada vez que recibe las mismas respuestas y "
          "explica el resultado con las reglas que lo calcularon. Los montos se quedan en el navegador. El chat de "
          "Tolera también usa un modelo de lenguaje, pero solo explica: el perfil lo deciden las reglas.")
d.subtitulo("Cuestionario rápido")
d.parrafo("Las reglas usan 5 de las 14 preguntas para calcular el perfil. Un árbol de decisión, entrenado sin "
          "conocer las reglas, eligió las mismas cinco. Tolera puede ofrecer una versión de cinco preguntas para "
          "quien tiene poco tiempo y dejar las demás para conocer mejor su contexto.")
d.nota("El perfil es orientativo. Tolera no recomienda inversiones concretas.")

# 4 ---------------------------------------------------------------------------
d.seccion("Evidencia de funcionamiento")
d.parrafo("El equipo ejecutó las reglas sobre 350 casos. La comprobación muestra cuándo la página da un perfil y "
          "cuándo solicita un dato clave antes de hacerlo.")
d.tabla([
    ["Indicador", "Valor observado", "Lectura"],
    ["Perfil con las 14 respuestas", "319 de 350 (91.1 %)", "El objetivo, el plazo y la tolerancia permitieron "
                                                            "llegar a un resultado."],
    ["Pregunta de aclaración", "31 de 350 (8.9 %)", "La caída que haría actuar podía cambiar el perfil y convenía "
                                                    "precisarla."],
    ["Grupo de plazo corto y disponibilidad", "105 de 106 conservadores", "En ese grupo predominaron las respuestas "
                                                                          "que dan prioridad a disponer pronto del "
                                                                          "dinero."],
    ["Preguntas que anticipan el perfil", "5 de 14", "El árbol de decisión eligió las mismas preguntas que usan "
                                                     "las reglas."],
], [173, 157, 190])
d.subtitulo("Qué aportó el agrupamiento")
d.parrafo("K-modes encontró dos grupos en el ajuste con mejor silueta. En el más grande, de 244 casos, "
          "predominaron el crecimiento y el plazo mayor de tres años. Ahí aparecieron los tres perfiles. Decir que "
          "se quiere crecer a largo plazo deja abierta la pregunta de qué pérdida se estaría dispuesto a tolerar.")
d.subtitulo("Alcance de los resultados")
d.parrafo("Las cifras describen el comportamiento de la herramienta con los casos del archivo. Para medir si la "
          "gente comprende mejor el riesgo con la página, se puede observar una prueba de uso y pedir a cada "
          "participante que explique su resultado con sus propias palabras.")
d.nota("La documentación técnica detalla la limpieza de los datos, el criterio de agrupamiento, el árbol de "
       "decisión y el funcionamiento de las reglas.")

# 5 ---------------------------------------------------------------------------
d.seccion("Cómo crece el producto")
d.parrafo("La versión actual funciona en Vercel y basta para la demostración. Para atender a más personas, el "
          "equipo propone llevar Tolera a Google Cloud. Es una propuesta y todavía no está implementada.")
d.tabla([
    ["Etapa", "Qué se agrega", "Servicios de Google Cloud"],
    ["1. Más visitas", "La página y la API en un contenedor que crece con la demanda.", "Cloud Run"],
    ["2. Aprender de las respuestas", "Registro de respuestas codificadas, sin nombres ni montos, y grupos de "
                                      "perfiles calculados de nuevo cada semana.",
     "BigQuery, BigQuery ML, Cloud Run Jobs y Cloud Scheduler"],
    ["3. Proteger el servicio", "Límites de consultas al chat y resguardo de la clave del proveedor.",
     "Cloud Armor y Secret Manager"],
], [150, 220, 150])
d.parrafo("Cloud Run ajusta el número de instancias a las visitas y baja a cero cuando no hay tráfico, así que el "
          "costo de cómputo sigue a la demanda. Con las respuestas en BigQuery, el equipo puede revisar qué "
          "preguntas generan más dudas y mejorar las explicaciones.")
d.nota("La documentación técnica describe cada servicio y el flujo de datos propuesto.")
d.construir()
