export const preguntas = {
  p1: {
    tema: 'Objetivo de inversión',
    texto: '¿Qué quieres lograr con esta inversión?',
    ayuda: 'Piensa para qué quieres usar ese dinero. Tenerlo disponible significa poder usarlo pronto. Recibir ingresos significa que quieres pagos cada cierto tiempo. Hacerlo crecer es buscar que valga más con el tiempo. También puedes buscar ganancias comprando y vendiendo cuando cambian los precios.',
    opciones: {
      A: 'Tener el dinero disponible',
      B: 'Recibir ingresos periódicos',
      C: 'Hacer crecer mi dinero',
      D: 'Buscar ganancias con cambios de precio',
    },
  },
  p2: {
    tema: 'Edad',
    texto: '¿En qué rango de edad estás?',
    ayuda: 'Elige el grupo que incluye tu edad actual. Si tienes 40 años, por ejemplo, elige «De 25 a 40 años».',
    opciones: {
      A: 'Menos de 25 años',
      B: 'De 25 a 40 años',
      C: 'De 41 a 60 años',
      D: 'Más de 60 años',
    },
  },
  p3: {
    tema: 'Experiencia',
    texto: '¿Has invertido antes?',
    ayuda: 'Piensa si alguna vez pusiste dinero en una inversión, como CETES, un fondo o acciones. Si sería tu primera vez, elige «No».',
    opciones: { A: 'Sí', B: 'No' },
  },
  p4: {
    tema: 'Plazo',
    texto: '¿En cuánto tiempo necesitarías el dinero que invertirías?',
    ayuda: 'Piensa cuándo tendrías que usar el dinero de esa inversión. Si lo necesitas en seis meses, por ejemplo, elige «Menos de 1 año».',
    opciones: {
      A: 'Menos de 1 año',
      B: 'De 1 a 3 años',
      C: 'Más de 3 años',
    },
  },
  p5: {
    tema: 'Mercados que conoces',
    texto: '¿Qué mercados de inversión conoces?',
    ayuda: 'Piensa dónde conoces alguna forma de invertir. La Bolsa Mexicana de Valores es un ejemplo del mercado mexicano. La bolsa de Nueva York es un ejemplo de otro país.',
    opciones: {
      A: 'El mercado mexicano',
      B: 'Mercados de otros países',
      AyB: 'Ambos',
      C: 'Ninguno',
    },
  },
  p6: {
    tema: 'Herramientas de análisis',
    texto: '¿Usas tus propios métodos para evaluar una inversión?',
    ayuda: 'Piensa si sigues algún método propio antes de decidir. Por ejemplo, si haces una tabla para comparar costos, posibles ganancias y pérdidas.',
    opciones: { A: 'Sí', B: 'No' },
  },
  p7: {
    tema: 'Forma de decidir',
    texto: '¿En qué te basas más al tomar decisiones de inversión?',
    ayuda: 'Elige la fuente que más pesa en tu decisión. Puede ser lo que tú revisas, la información de una casa de bolsa, lo que te recomienda un asesor o lo que aprendiste en inversiones anteriores.',
    opciones: {
      A: 'Mi propio análisis',
      B: 'Información de una casa de bolsa',
      C: 'La opinión de mi asesor',
      D: 'Mis experiencias anteriores',
      E: 'Otro criterio',
    },
  },
  p8: {
    tema: 'Reacción ante pérdidas',
    texto: '¿Cómo reaccionarías si el valor de tu inversión bajara mucho?',
    ayuda: 'Imagina que invertiste $10,000 y tu inversión ahora vale $8,000. ¿Te inquietarían los cambios, venderías enseguida, te tomarías un tiempo para revisar qué pasó o mantendrías la inversión esperando que se recupere?',
    opciones: {
      A: 'Me incomodarían las fluctuaciones',
      B: 'Vendería de inmediato',
      C: 'Esperaría y revisaría qué pasó',
      D: 'Mantendría la inversión esperando una recuperación',
    },
  },
  p9: {
    tema: 'Límite de pérdida',
    texto: '¿A partir de qué caída considerarías tomar medidas importantes?',
    ayuda: 'Elige a partir de qué pérdida pensarías en hacer un cambio, como vender o mover parte del dinero. Si empezaste con $10,000, una caída del 5 % equivale a $500, una del 10 % a $1,000 y una del 20 % a $2,000.',
    opciones: {
      A: 'Al caer 5 %',
      B: 'Al caer 10 %',
      C: 'Al caer 20 %',
      D: 'No me inquieto',
    },
  },
  p10: {
    tema: 'Riesgo y rendimiento',
    texto: 'Al elegir una inversión, ¿qué opción se acerca más a lo que buscas?',
    ayuda: 'Piensa cuánto pesa para ti cuidar el dinero frente a la posibilidad de ganar más. Elige la opción que mejor refleje cuánto riesgo aceptarías.',
    opciones: {
      A: 'Máxima seguridad, aunque gane poco',
      B: 'Un rendimiento competitivo con seguridad',
      C: 'Rendimiento por encima del mercado con riesgo moderado',
      D: 'Rendimiento alto a largo plazo, aunque implique mayor riesgo',
    },
  },
  p11: {
    tema: 'Moneda',
    texto: '¿En qué moneda preferirías invertir?',
    ayuda: 'La pregunta se refiere a la moneda en la que estaría tu inversión, por ejemplo pesos, dólares o euros. Si te da igual, elige «Sin preferencia».',
    opciones: { A: 'Pesos', B: 'Dólares', C: 'Euros', D: 'Otra', E: 'Sin preferencia' },
  },
  p12: {
    tema: 'Autoevaluación',
    texto: '¿Te consideras un inversionista sofisticado?',
    ayuda: 'Aquí se refiere a cómo ves tu propia experiencia. Piensa si sabes evaluar inversiones complejas y entiendes cómo funcionan y cuánto podrías perder.',
    opciones: { A: 'Sí', B: 'No' },
  },
  p13: {
    tema: 'Otras instituciones',
    texto: '¿Tienes inversiones en otras instituciones financieras?',
    ayuda: 'Piensa si hoy tienes dinero invertido por medio de otro banco, casa de bolsa o plataforma. Por ejemplo, un fondo de inversión contratado en otro banco.',
    opciones: { A: 'Sí', B: 'No' },
  },
  p14: {
    tema: 'Inversiones fuera del mercado financiero',
    texto: '¿Tienes inversiones fuera del mercado financiero, como un negocio o un inmueble?',
    ayuda: 'Piensa en dinero que hayas destinado a un negocio o a un inmueble como inversión. Un local que compraste para rentarlo cuenta como ejemplo.',
    opciones: { A: 'Sí', B: 'No' },
  },
};

export const aclaracionCaida = {
  tema: 'Caída que te haría actuar',
  texto: 'Para afinar tu perfil, piensa en una caída concreta. ¿A partir de qué caída considerarías tomar medidas?',
  ayuda: preguntas.p9.ayuda,
  opciones: {
    A: preguntas.p9.opciones.A,
    B: preguntas.p9.opciones.B,
    C: preguntas.p9.opciones.C,
  },
};
