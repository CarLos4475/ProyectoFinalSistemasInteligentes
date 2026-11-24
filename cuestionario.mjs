export const preguntas = {
  p1: {
    tema: 'Objetivo de inversión',
    texto: '¿Qué quieres lograr con esta inversión?',
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
    opciones: {
      A: 'Menos de 25 años',
      B: 'De 25 a 39 años',
      C: 'De 40 a 60 años',
      D: 'Más de 60 años',
    },
  },
  p3: {
    tema: 'Experiencia',
    texto: '¿Has invertido antes?',
    opciones: { A: 'Sí', B: 'No' },
  },
  p4: {
    tema: 'Plazo',
    texto: '¿En cuánto tiempo necesitarías el dinero que invertirías?',
    opciones: {
      A: 'Menos de 1 año',
      B: 'De 1 a 3 años',
      C: 'Más de 3 años',
    },
  },
  p5: {
    tema: 'Mercados que conoces',
    texto: '¿Qué mercados de inversión conoces?',
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
    opciones: { A: 'Sí', B: 'No' },
  },
  p7: {
    tema: 'Forma de decidir',
    texto: '¿En qué te basas más al tomar decisiones de inversión?',
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
    opciones: { A: 'Pesos', B: 'Dólares', C: 'Euros', D: 'Otra', E: 'Sin preferencia' },
  },
  p12: {
    tema: 'Autoevaluación',
    texto: '¿Te consideras un inversionista sofisticado?',
    opciones: { A: 'Sí', B: 'No' },
  },
  p13: {
    tema: 'Otras instituciones',
    texto: '¿Tienes inversiones en otras instituciones financieras?',
    opciones: { A: 'Sí', B: 'No' },
  },
  p14: {
    tema: 'Inversiones fuera del mercado financiero',
    texto: '¿Tienes inversiones fuera del mercado financiero, como un negocio o un inmueble?',
    opciones: { A: 'Sí', B: 'No' },
  },
};

export const aclaracionCaida = {
  tema: 'Caída que te haría actuar',
  texto: 'Para afinar tu perfil, piensa en una caída concreta. ¿A partir de qué caída considerarías tomar medidas?',
  opciones: {
    A: preguntas.p9.opciones.A,
    B: preguntas.p9.opciones.B,
    C: preguntas.p9.opciones.C,
  },
};
