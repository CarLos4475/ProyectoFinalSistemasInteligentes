"""Documentación técnica de Tolera."""

import sys

from formato import Documento, enlace

URL = "https://sistemasinteligentesinversiopn.vercel.app/"
d = Documento(
    sys.argv[1], tipo="DOCUMENTACIÓN TÉCNICA", producto="TOLERA · SIMULADOR DE PERFIL DE INVERSIÓN",
    titulo_meta="Documentación Técnica · Tolera, simulador de perfil de inversión",
    asunto="Limpieza de datos, sistema experto, K-modes, árbol de decisión y arquitectura propuesta",
    fecha="2026-11-26", profesora="ÁNGELES URIBE MIRIAM",
    alumnos=["JIMÉNEZ CASTILLO MARÍA PAOLA", "RAMÍREZ HERNÁNDEZ NEHIEL", "SEGURA LOERA CARLOS EMILIANO"],
)

# 2 ---------------------------------------------------------------------------
d.seccion("Contexto, problema y objetivos")
d.parrafo("<b>¿Cuánto riesgo puede asumir alguien que necesita su dinero en un plazo concreto?</b> La persona "
          "debe distinguir cuánto estaría dispuesta a perder de cuánto margen le deja su meta. Tolera le permite "
          "poner ambas cosas en pesos y entender qué respuestas pesaron en su perfil.")
d.subtitulo("Objetivo general")
d.parrafo("Construir un producto web que simule una caída hipotética y explique un perfil de inversión con reglas "
          "que el equipo pueda mostrar y comprobar. Está pensado para personas que empiezan a invertir y tienen "
          "una meta con plazo.")
d.subtitulo("Componentes del producto")
d.tabla([
    ["Componente", "Qué hace"],
    ["Simulador", "Calcula el saldo y el faltante o sobrante de una meta para un porcentaje de caída. El plazo "
                  "pasa al cuestionario y los montos sirven para traducir a pesos las caídas de P9."],
    ["Sistema experto", "Registra 14 respuestas y aplica el límite de riesgo, las reglas de tolerancia y, cuando "
                        "hace falta, una pregunta de aclaración."],
    ["Chat", "DeepSeek Flash conversa con memoria de los últimos tres intercambios. Recibe la pregunta activa, "
             "las respuestas marcadas, el perfil calculado y los porcentajes del escenario, sin montos en pesos."],
    ["Análisis en Python", "Limpia las respuestas del formulario, ejecuta las reglas de la web, agrupa respuestas "
                           "parecidas con K-modes y mide con un árbol de decisión qué preguntas anticipan el perfil."],
], [142, 378])
d.subtitulo("Ejemplo de uso")
d.parrafo("Con $10,000 disponibles y una meta de $9,000, una caída del 15 % deja $8,500. Faltarían $500 para la "
          "meta. El cálculo se hace en el navegador y redondea a centavos.")
d.nota("El perfil es orientativo y Tolera no recomienda inversiones concretas. El escenario usa la caída que elige "
       "la persona y muestra su efecto sobre los montos ingresados.")

# 3 ---------------------------------------------------------------------------
d.seccion("Limpieza de los datos")
d.parrafo("La limpieza recibe un archivo CSV con el formato de exportación de Google Forms: una fila por envío y "
          "cada respuesta escrita como el texto de la opción. El módulo analisis/limpieza.py convierte esas "
          "respuestas a los códigos del cuestionario de la web. Todo el proceso se hace con Python.")
d.subtitulo("Problemas encontrados y técnica aplicada")
d.tabla([
    ["Problema", "Ejemplo", "Técnica"],
    ["Mayúsculas, acentos y espacios de más", "«MODERADO», «De  41  a  60  años»",
     "Normalización con unicodedata y expresiones regulares"],
    ["Letra en lugar del texto", "«c», «B) No»", "Expresiones regulares que reconocen la letra o la quitan del inicio"],
    ["Erratas", "«Esperraía y revisaría qué pasó», «Inrfaestructura»",
     "Similitud de cadenas con difflib y umbral de 0.8"],
    ["Casillas múltiples en P5", "«El mercado mexicano, Mercados de otros países»",
     "Separar por comas o punto y coma. Las dos opciones equivalen a «Ambos»"],
    ["Fechas en varios formatos", "«2026-11-09 13:09:25», «13 feb 2026»", "Tres patrones de fecha con expresiones regulares"],
    ["Edades con texto o fuera de rango", "«35 años», «430»",
     "Extraer el número. Fuera de 18 a 100 años queda como faltante"],
    ["Envíos repetidos y filas vacías", "La misma persona envía el formulario dos veces",
     "Conservar el primer envío por nombre normalizado y quitar filas sin datos"],
], [150, 175, 195])
d.subtitulo("Resultado")
d.tabla([
    ["Paso", "Resultado"],
    ["Filas del archivo", "368, de las cuales 4 estaban vacías y 14 eran envíos repetidos"],
    ["Casos para el análisis", "350"],
    ["Respuestas de P1 a P14", "4,900 convertidas y 0 sin resolver. 4,511 coincidieron al normalizar, 213 se "
                               "resolvieron por la letra, 144 por similitud y 32 como casillas múltiples"],
    ["Edades válidas", "339 de 350"],
], [150, 370])
d.nota("Para comprobar la limpieza, cada campo limpio se comparó con la hoja Respuestas del Excel. Coincidieron "
       "las 4,900 respuestas, los nombres, las fechas y los campos abiertos de P6, P14, P15 y P16.")

# 4 ---------------------------------------------------------------------------
d.seccion("Análisis exploratorio y KPIs")
d.parrafo("P1 a P14 describen objetivo, plazo, experiencia y preferencias. Para analizar las respuestas se dejaron "
          "fuera los nombres, las fechas y los textos libres. «Hacer crecer mi dinero» fue el objetivo más "
          "frecuente, con 109 casos, y 182 personas necesitan el dinero en más de tres años.")
d.subtitulo("Comprobaciones")
d.tabla([
    ["Comprobación", "Resultado"],
    ["P1 a P14", "0 faltantes después de la limpieza. Todas las opciones coinciden con el catálogo de la web."],
    ["Patrones repetidos", "2 casos repiten una combinación completa de P1 a P14. Se conservaron porque "
                           "corresponden a personas distintas."],
    ["Campos que dependen de una respuesta", "Medios propios, tipos de inversión y P16 tuvieron 276, 266 y 302 "
                                             "casos donde el campo no aplicaba, respectivamente. El filtro coincidió "
                                             "en todos los casos."],
], [184, 336])
d.subtitulo("Indicadores clave")
d.tabla([
    ["Indicador", "Valor", "Para qué sirve"],
    ["Perfiles resueltos sin aclaración", "319 de 350 (91.1 %)", "Cuántas personas terminan sin una pregunta extra"],
    ["Metas de corto plazo", "87 de 350 (24.9 %)", "Personas cuyo plazo limita el perfil a conservador"],
    ["Umbral de caída abierto", "90 de 350 (25.7 %)", "Respuestas que pueden requerir aclaración"],
    ["Sin experiencia previa", "186 de 350 (53.1 %)", "Personas que podrían necesitar más ayuda del chat"],
    ["Conformidad con el perfil anterior", "302 de 350 (86.3 %)", "Respuestas «Sí» en P15 sobre el baremo del Excel"],
], [184, 120, 216])
d.nota("En P9, la caída que haría actuar, 72 personas eligieron 5 %, 93 eligieron 10 %, 95 eligieron 20 % y 90 "
       "marcaron «No me inquieto», que deja el umbral abierto.")
d.subtitulo("Revisión del baremo anterior")
d.parrafo("La hoja Resumen atribuye la excepción «Sofisticado» a P12. En las 350 fórmulas revisadas, la excepción "
          "consultaba P10. De los 79 casos con esa etiqueta, 77 marcaron «No» en P12. Los puntajes observados iban "
          "de 15 a 39 y el tramo anterior de 0 a 14 quedó con 0 casos. Estas etiquetas se conservaron como "
          "antecedente del Excel.")

# 5 ---------------------------------------------------------------------------
d.seccion("Sistema experto y resultados")
d.parrafo("El perfil toma el nivel más bajo entre el máximo que permiten el objetivo y el plazo y la tolerancia a "
          "pérdidas declarada. La regla se aplica igual a cada persona.")
d.subtitulo("De dónde salen los cortes")
d.tabla([
    ["Parte de la regla", "Criterio aplicado"],
    ["Límite por objetivo y plazo", "Conservador si prima la disponibilidad o el plazo es menor de un año. Moderado "
                                    "si busca ingresos periódicos o el plazo es de uno a tres años. En los demás "
                                    "casos, el límite admite el nivel alto."],
    ["Tolerancia a pérdidas", "Se ordenan las señales de P8 (reacción), P9 (caída) y P10 (preferencia) en baja, "
                              "intermedia o alta. La señal central determina la tolerancia."],
    ["Aclaración", "Si la persona marca «No me inquieto», se prueba el perfil con los tres umbrales. El chat pide "
                   "precisar la caída si alguno cambiaría el resultado."],
], [160, 360])
d.subtitulo("Cómo se leen las señales de tolerancia")
d.tabla([
    ["Señal", "Baja", "Intermedia", "Alta"],
    ["P8 · Reacción", "Incomodarse con las fluctuaciones o vender de inmediato", "Esperar y revisar qué pasó",
     "Mantener la inversión esperando una recuperación"],
    ["P9 · Caída que haría actuar", "5 %", "10 %", "20 %"],
    ["P10 · Preferencia", "Máxima seguridad", "Buscar rendimiento con seguridad o aceptar riesgo moderado",
     "Buscar rendimientos altos y aceptar mayor riesgo"],
], [105, 135, 140, 140])
d.nota("Las equivalencias de las señales y el límite por plazo son criterios del equipo. La sección de análisis de "
       "sensibilidad mide cuánto cambia el resultado si se eligen de otra forma. P12 se conserva como autopercepción.")
d.subtitulo("Salida de las reglas en 350 casos")
d.tabla([
    ["Salida", "Casos", "% del total"],
    ["Conservador", "139", "39.7 %"], ["Moderado", "131", "37.4 %"],
    ["Propenso al riesgo", "49", "14.0 %"], ["Requiere aclaración", "31", "8.9 %"],
], [300, 100, 120])
d.parrafo("De los 90 casos que marcaron «No me inquieto», 31 requirieron aclaración. En los otros 59, los tres "
          "umbrales llevaban al mismo perfil.")

# 6 ---------------------------------------------------------------------------
d.seccion("Cómo se calcula el perfil")
d.parrafo("El sistema usa tres niveles ordenados. El 0 representa riesgo conservador o tolerancia baja. El 1 "
          "representa riesgo moderado o tolerancia intermedia. El 2 representa propensión al riesgo o tolerancia "
          "alta. Los números sirven para comparar niveles.")
d.subtitulo("Ejemplo para la demostración")
d.parrafo("La persona elige hacer crecer su dinero y da estas tres respuestas sobre pérdidas y riesgo.")
d.tabla([
    ["Pregunta", "Respuesta", "Nivel"],
    ["P8 · Reacción", "Esperaría y revisaría qué pasó", "1"],
    ["P9 · Caída que haría actuar", "Al caer 20 %", "2"],
    ["P10 · Preferencia", "Rendimiento alto a largo plazo, aunque implique mayor riesgo", "2"],
], [158, 292, 70])
d.parrafo("Al ordenar 1, 2 y 2, el valor del centro es 2. Esa es la tolerancia. Para obtener el perfil, el sistema "
          "toma el menor valor entre la tolerancia y el límite por objetivo y plazo.")
d.subtitulo("Qué pasa si solo cambia el plazo")
d.tabla([
    ["Plazo", "Límite", "Tolerancia", "Perfil"],
    ["Menos de 1 año", "0", "2", "0 · Conservador"],
    ["De 1 a 3 años", "1", "2", "1 · Moderado"],
    ["Más de 3 años", "2", "2", "2 · Propenso al riesgo"],
], [157, 77, 93, 193])
d.parrafo("Con un umbral definido, el nivel 2 requiere un plazo mayor de tres años, un objetivo de crecimiento o de "
          "aprovechar cambios de precio, y al menos dos señales de tolerancia alta.")
d.subtitulo("Cuándo hace falta una aclaración")
d.parrafo("En el mismo ejemplo, si el plazo supera los tres años y la persona marca «No me inquieto», un umbral de "
          "5 % o 10 % daría Moderado y uno de 20 % daría Propenso al riesgo. El chat pide precisar la caída porque "
          "la respuesta cambia el perfil.")

# 6a --------------------------------------------------------------------------
d.seccion("Fundamento de los perfiles")
d.parrafo("El perfil combina dos dimensiones que la práctica de perfilamiento separa. La capacidad indica cuánto "
          "riesgo permite la situación de la persona y la disposición indica cuánto riesgo quiere asumir. El "
          "objetivo y el plazo miden la capacidad. P8, P9 y P10 miden la disposición.")
d.subtitulo("Qué se evalúa y de dónde sale")
d.tabla([
    ["Dimensión", "Preguntas", "Uso en el perfil", "Referencia"],
    ["Objetivo de inversión", "P1", "Fija el límite", "Disposiciones de servicios de inversión de la CNBV"],
    ["Horizonte", "P4", "Fija el límite", "Anexo 1 de la CUFI de la CNBV"],
    ["Tolerancia al riesgo", "P8, P9 y P10", "Define la tolerancia", "CNBV y guía de perfilamiento del CFA Institute"],
    ["Conocimiento y experiencia", "P3, P5, P6 y P7", "Se muestra en la explicación", "Disposiciones de servicios de "
                                                                                  "inversión de la CNBV"],
], [130, 95, 125, 170])
d.subtitulo("Por qué se toma el nivel más bajo")
d.parrafo("La guía de perfilamiento del CFA Institute señala que la capacidad de asumir riesgo suele ser el factor "
          "que limita, y que la disposición puede ser desaconsejable si pone en peligro los compromisos futuros de "
          "la persona. Tolera formaliza ese principio con una regla: el perfil es el mínimo entre el límite y la "
          "tolerancia. La edad no entra al cálculo porque lo que aproxima, el horizonte, se pregunta directamente en P4.")
d.parrafo("Los cortes de 1 y 3 años del plazo son los mismos que usa la CNBV para categorizar los fondos de deuda: "
          "corto plazo hasta un año, mediano plazo de más de uno hasta tres años y largo plazo más de tres años.")
d.subtitulo("Por qué no se usan puntos")
d.tabla([
    ["Problema del baremo anterior", "Evidencia en los 350 casos"],
    ["El rango Adverso (0 a 14) solo se alcanza con la opción más baja en las 14 preguntas.", "0 casos adversos."],
    ["La suma compensa: la edad, la moneda o la experiencia tapan un plazo corto.",
     "De 87 personas con plazo menor de un año, 46 salieron Sofisticado y ninguna Adversa."],
    ["La excepción Sofisticado consulta P10 = A, que es «máxima seguridad».", "79 casos Sofisticado, 77 con «No» en P12."],
], [270, 250])
d.parrafo("Las reglas de Tolera usan niveles ordenados y no suman. Solo suponen que las opciones de cada pregunta "
          "están en orden, sin asignar pesos ni distancias entre ellas.")

# 6a2 -------------------------------------------------------------------------
d.seccion("Análisis de sensibilidad")
d.parrafo("Para medir cuánto dependen los perfiles de las decisiones del equipo, se cambió cada decisión por una "
          "alternativa razonable, una a la vez, y se contó cuántos de los 350 casos cambian de resultado. Antes de "
          "variar nada se comprobó que las reglas reescritas en Python dan el mismo resultado que la web en los 350 "
          "casos. El cálculo está en analisis/sensibilidad.py.")
d.tabla([
    ["Decisión cambiada", "Casos que cambian", "Dirección"],
    ["P8 «Esperaría y revisaría» como baja", "19 (5.4 %)", "4 bajan y 15 pasan a aclaración"],
    ["P8 «Esperaría y revisaría» como alta", "26 (7.4 %)", "11 suben y 15 pasan a aclaración"],
    ["P8 «Me incomodarían las fluctuaciones» como intermedia", "4 (1.1 %)", "2 suben y 2 pasan a aclaración"],
    ["P9 10 % como baja", "25 (7.1 %)", "25 bajan"],
    ["P9 10 % como alta", "6 (1.7 %)", "6 suben"],
    ["P10 «Competitivo con seguridad» como baja", "28 (8.0 %)", "21 bajan y 7 pasan a aclaración"],
    ["P10 «Por encima del mercado» como alta", "29 (8.3 %)", "14 suben y 15 pasan a aclaración"],
    ["Ingresos periódicos sin límite", "8 (2.3 %)", "7 suben y 1 pasa a aclaración"],
    ["Plazo de 1 a 3 años como conservador", "55 (15.7 %)", "52 bajan y 3 pasan a aclaración"],
    ["Combinar las señales con el mínimo", "134 (38.3 %)", "68 bajan, 66 pasan a aclaración y 2 saltan dos niveles"],
    ["Combinar las señales con el promedio", "44 (12.6 %)", "5 suben, 2 bajan y 37 pasan a aclaración"],
], [215, 105, 200])
d.subtitulo("Lectura")
d.parrafo("Las equivalencias de cada opción mueven entre 1.1 % y 8.3 % de los casos, sin saltos de dos niveles y "
          "siempre en la dirección esperada. El límite del plazo medio mueve 15.7 %, así que es la equivalencia que "
          "más conviene justificar. La forma de combinar las señales es la decisión más sensible. La mediana ignora "
          "una respuesta que no concuerda con las otras dos. El mínimo sería doblemente conservador, porque el "
          "perfil ya toma el mínimo entre límite y tolerancia, y el promedio supone distancias iguales entre niveles.")
d.nota("En el baremo anterior, mover el corte entre Moderado y Propenso de 28 a 30 puntos cambia 53 casos (15.1 %), "
       "y ese corte no tenía justificación. El análisis cambia una decisión a la vez, así que no mide interacciones, "
       "y muestra la estabilidad de las reglas, no que los perfiles sean correctos.")

# 6b --------------------------------------------------------------------------
d.seccion("Chat y conexión con el simulador")
d.parrafo("El simulador, el cuestionario y el chat comparten la misma información. Los montos se quedan en el "
          "navegador y al chat solo llegan porcentajes.")
d.subtitulo("Tolerancia en pesos")
d.parrafo("Si la persona usó el simulador, la pregunta P9 muestra cuánto le quedaría con caídas de 5 %, 10 % y "
          "20 % y la mayor caída que su meta aguanta. Con $20,000 disponibles y una meta de $17,000, la meta aguanta "
          "hasta 15 %. Si la persona elige actuar al caer 20 %, el resultado le avisa que una caída que todavía "
          "aguantaría ya dejaría su meta sin cubrir.")
d.subtitulo("Qué recibe el modelo en cada mensaje")
d.tabla([
    ["Dato", "Qué se envía", "Validación en el servidor"],
    ["Mensaje actual", "El texto de la persona", "Hasta 480 caracteres"],
    ["Conversación reciente", "Los últimos tres intercambios", "Hasta 6 mensajes con rol de persona o de Tolera"],
    ["Cuestionario", "La pregunta activa, sus opciones y las respuestas marcadas", "Solo códigos del catálogo"],
    ["Perfil", "Perfil, límite y señales de tolerancia", "Se calcula en el servidor con evaluarPerfil"],
    ["Escenario", "Caída probada, cobertura de la meta en % y plazo", "Solo esos tres campos con valores permitidos. No acepta montos"],
], [130, 200, 190])
d.parrafo("El modelo recibe la conversación para entender referencias como «¿y eso me conviene?». El perfil lo "
          "calculan las reglas y el modelo solo lo explica. Las acciones de simular una caída o mostrar la "
          "explicación del perfil se validan antes de ejecutarse.")
d.subtitulo("Después del perfil")
d.parrafo("La pantalla de resultado incluye una sección «¿Y ahora qué?» con una descripción general del perfil y "
          "preguntas para llevar a un asesor. Es información orientativa y no recomienda productos.")

# 7 ---------------------------------------------------------------------------
d.seccion("Agrupamiento con K-modes")
d.parrafo("Se exploró si hay combinaciones de respuestas que se repiten en el conjunto. Se usaron cinco variables "
          "categóricas ligadas al problema. P1 recoge el objetivo, P4 el plazo, P8 la reacción ante pérdidas, P9 la "
          "caída que haría actuar y P10 la preferencia de riesgo.")
d.subtitulo("Cómo se formaron los grupos")
d.parrafo("Cada variable aporta una diferencia si las opciones de dos casos son distintas. El modo del grupo es la "
          "opción más frecuente en cada variable. Este ajuste da el mismo peso a las cinco preguntas y conserva "
          "«No me inquieto» como una categoría de P9.")
d.subtitulo("Búsqueda en cuadrícula")
d.tabla([
    ["Grupos (k)", "Silueta con Huang", "Silueta con Cao", "Grupo menor con Huang"],
    ["2", "0.281", "0.220", "106"], ["3", "0.267", "0.215", "77"],
    ["4", "0.267", "0.258", "71"], ["5", "0.253", "0.238", "23"],
], [100, 130, 130, 160])
d.parrafo("Se probaron 8 combinaciones de número de grupos e inicialización, cada una con 20 reinicios y semilla "
          "42. La silueta usa como distancia la proporción de categorías distintas. Se eligió k = 2 con "
          "inicialización de Huang por obtener la mayor silueta (0.281). La diferencia frente a k = 3 y k = 4 fue "
          "pequeña, así que el resultado sirve como descripción exploratoria.")
d.subtitulo("Opción más frecuente en cada grupo")
d.tabla([
    ["Variable", "Grupo 1 · 244 casos", "Grupo 2 · 106 casos"],
    ["P1 · Objetivo", "Hacer crecer mi dinero", "Tener el dinero disponible"],
    ["P4 · Plazo", "Más de 3 años", "Menos de 1 año"],
    ["P8 · Reacción", "Esperaría y revisaría qué pasó", "Me incomodarían las fluctuaciones"],
    ["P9 · Caída", "No me inquieto", "Al caer 5 %"],
    ["P10 · Preferencia", "Rendimiento por encima del mercado con riesgo moderado", "Máxima seguridad, aunque gane poco"],
], [114, 203, 203])

# 8 ---------------------------------------------------------------------------
d.seccion("Lectura de los grupos")
d.tabla([
    ["Grupo", "Conservador", "Moderado", "Propenso", "Aclaración", "Total"],
    ["1", "34", "130", "49", "31", "244"], ["2", "105", "1", "0", "0", "106"],
], [70, 101, 88, 83, 101, 77])
d.parrafo("El grupo 2 concentró 105 resultados conservadores de 106 casos. En el grupo 1 aparecen los tres perfiles "
          "y los 31 casos con aclaración. Las opciones más frecuentes del grupo ayudan a describirlo. Para saber qué "
          "perfil corresponde a una fila se aplican sus propias respuestas.")
d.parrafo("El agrupamiento usa las mismas cinco preguntas que influyen de forma directa en las reglas. El cruce "
          "muestra cómo se relacionan ambos resultados en esta base. Para el producto, los grupos describen dos "
          "tipos de usuario: quien necesita el dinero pronto y quien busca crecer a largo plazo con distintos "
          "grados de tolerancia.")

# 9 ---------------------------------------------------------------------------
d.seccion("Árbol de decisión")
d.parrafo("Las reglas del sistema experto las escribió el equipo. Para comprobar si los datos llevan a las mismas "
          "preguntas, se entrenó un árbol de decisión que predice la salida de las reglas (conservador, moderado, "
          "propenso o aclaración) a partir de las 14 respuestas codificadas con one-hot.")
d.subtitulo("Búsqueda de hiperparámetros")
d.parrafo("GridSearchCV probó 42 combinaciones de profundidad máxima (1 a 6 o sin límite), mínimo de casos por hoja "
          "(1, 5 o 10) y criterio (gini o entropía). Cada combinación se evaluó con validación cruzada estratificada "
          "de 5 pliegues sobre el 75 % de los casos (262). El 25 % restante (88) se reservó para la prueba final.")
d.tabla([
    ["Profundidad máxima", "Mejor exactitud en validación"],
    ["1", "63.4 %"], ["2", "70.2 %"], ["3", "78.6 %"], ["4", "89.3 %"],
    ["5", "90.1 %"], ["6", "89.3 %"], ["Sin límite", "94.7 %"],
], [200, 320])
d.subtitulo("Modelo elegido")
d.parrafo("El árbol sin límite logra la mayor exactitud, pero tiene 24 hojas y usa P6 y P11, que no se relacionan "
          "con el riesgo. Se eligió el árbol de profundidad 4 con entropía. Tiene 8 hojas y alcanza 89.3 % en "
          "validación y 84.1 % en la prueba final.")
d.subtitulo("Qué muestra el árbol")
d.parrafo("El árbol de profundidad 4 usa solo P1, P4, P8, P9 y P10, las mismas cinco preguntas que emplean las "
          "reglas, sin que el modelo las conociera. Las otras nueve preguntas dan contexto a la explicación y al "
          "asesor. Esto permite ofrecer una versión rápida del cuestionario con cinco preguntas, que llega al mismo "
          "perfil con las reglas.")

# 10 --------------------------------------------------------------------------
d.seccion("Arquitectura propuesta en la nube")
d.parrafo("Hoy Tolera se publica en Vercel. La página es estática y una función en /api/interpretar conecta el "
          "chat con DeepSeek. Para atender a más personas, el equipo propone llevar el producto a Google Cloud. "
          "Esta arquitectura es una propuesta y no está implementada.")
d.subtitulo("Servicios")
d.tabla([
    ["Necesidad", "Servicio", "Uso en Tolera"],
    ["Servir la página y la API", "Cloud Run", "Contenedor con la web y /api/interpretar. Escala según las "
                                               "solicitudes y baja a cero instancias cuando no hay tráfico."],
    ["Guardar las respuestas", "BigQuery", "Tabla de respuestas codificadas, sin nombres ni montos."],
    ["Agrupar perfiles", "BigQuery ML", "Modelo KMEANS con las cinco preguntas en one-hot. K-modes se mantiene en "
                                        "Python porque BigQuery ML no lo incluye."],
    ["Reentrenar los modelos", "Cloud Run Jobs y Cloud Scheduler", "Ejecutar cada semana la limpieza, K-modes y "
                                                                   "el árbol, y guardar los resultados en BigQuery."],
    ["Proteger la clave del chat", "Secret Manager", "Guardar DEEPSEEK_API_KEY fuera del código."],
    ["Limitar el abuso", "Cloud Armor", "Limitar por IP las consultas a la API del chat."],
], [140, 130, 250])
d.subtitulo("Flujo de datos")
d.parrafo("La persona responde en la página servida por Cloud Run. La API guarda las respuestas codificadas en "
          "BigQuery, sin nombre ni montos. Cada semana, un trabajo de Cloud Run Jobs limpia los datos nuevos y "
          "vuelve a entrenar K-modes y el árbol. BigQuery ML calcula los grupos con KMEANS y el equipo usa los "
          "resultados para ajustar las preguntas y las explicaciones.")
d.nota("Los montos del simulador se siguen calculando en el navegador y no se envían al servidor.")

# 11 --------------------------------------------------------------------------
d.seccion("Pruebas y cómo repetir el análisis")
d.tabla([
    ["Paso", "Dónde se ejecuta"],
    ["1. Instalar dependencias", "python -m pip install -r analisis/requirements.txt"],
    ["2. Limpiar y analizar", "python analisis/perfil_inversion.py archivo.xlsx --formulario respuestas.csv "
                              "--salida resultados.json"],
    ["3. Probar los módulos web", "node --test"],
], [187, 333])
d.parrafo("Las 22 pruebas de node --test revisan el cálculo del escenario en centavos, las reglas del perfil, la "
          "pregunta de aclaración y la API del chat. La API rechaza respuestas ajenas al cuestionario, historiales "
          "y escenarios mal formados, y limita las consultas por instancia.")
d.nota("Se necesita Node.js para llamar a evaluarPerfil, la misma función que usa el cuestionario. El análisis lee "
       "el Excel y el CSV y escribe un resumen agregado.")
d.subtitulo("Referencias")
d.nota("CNBV (2015). " + enlace("Disposiciones de carácter general aplicables a las entidades financieras y demás "
                                "personas que proporcionen servicios de inversión",
                                "https://dof.gob.mx/nota_detalle_popup.php?codigo=5279484") + ". Diario Oficial de la "
       "Federación.")
d.nota("CNBV (2026). " + enlace("Anexo 1 de las Disposiciones de carácter general aplicables a los fondos de "
                                "inversión", "https://www.cnbv.gob.mx/Anexos/Anexo%201%20CUFI.pdf") + ".")
d.nota("CFA Institute Research Foundation. " + enlace("Investment Risk Profiling",
       "https://rpc.cfainstitute.org/-/media/documents/survey/investment-risk-profiling.pdf") + ".")
d.nota("Huang, Z. (1998). " + enlace("Extensions to the k-Means Algorithm for Clustering Large Data Sets with "
                                    "Categorical Values", "https://doi.org/10.1023/A:1009769707641")
       + ". Data Mining and Knowledge Discovery, 2, 283–304.")
d.nota("Pedregosa, F., et al. (2011). " + enlace("Scikit-learn: Machine Learning in Python",
                                                 "https://jmlr.org/papers/v12/pedregosa11a.html")
       + ". Journal of Machine Learning Research, 12, 2825–2830.")
d.nota(enlace("Tolera", URL) + ". Proyecto de Sistemas Inteligentes, FES Acatlán.")
d.construir()
