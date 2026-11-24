import { aclaracionCaida, preguntas } from './cuestionario.mjs';
import { evaluarPerfil } from './perfil.mjs?v=2';

const orden = Object.keys(preguntas);
const catalogo = { ...preguntas, aclaracion: aclaracionCaida };
const perfiles = {
  conservador: 'Conservador',
  moderado: 'Moderado',
  propenso: 'Propenso al riesgo',
};
const tolerancias = {
  conservador: 'baja',
  moderado: 'intermedia',
  propenso: 'alta',
};
const limites = {
  liquidez: 'Dijiste que tu prioridad es disponer del dinero. Esa necesidad fija el límite en conservador.',
  'plazo-corto': 'Necesitarías el dinero en menos de un año. Ese plazo deja poco tiempo para esperar una recuperación si la inversión pierde valor.',
  ingresos: 'Quieres recibir ingresos periódicos. En este cuestionario, ese objetivo pone el límite en moderado.',
  'plazo-medio': 'Necesitarías el dinero en uno a tres años. Para ese plazo, el nivel máximo del cuestionario es moderado.',
  'objetivo-y-plazo': 'Elegiste un objetivo de crecimiento o especulación y un plazo de más de tres años. Con esas respuestas, la tolerancia puede llevar a cualquiera de los tres perfiles.',
};

const glosario = [
  [/\b(liquidez|liquido|disponibilidad)\b/, 'La liquidez es la facilidad de convertir una inversión en dinero disponible. Si necesitas el dinero pronto, importa cuánto tardarías en disponer de él.'],
  [/\b(horizonte|plazo|tiempo)\b/, 'El horizonte de inversión es el tiempo que puedes dejar invertido el dinero antes de necesitarlo.'],
  [/\b(caida|caer|perdidas?|perder|tolerancia|baja)\b/, 'Una caída es una pérdida de valor. Si una inversión vale $100 y baja 10 %, pasa a valer $90. La tolerancia indica qué caída te haría considerar tomar medidas.'],
  [/\b(riesgo|volatilidad|fluctuaciones?)\b/, 'El riesgo incluye la posibilidad de que tu inversión pierda valor. La volatilidad describe cuánto cambia ese valor con el tiempo.'],
  [/\b(rendimiento|rendimientos)\b/, 'El rendimiento es cuánto gana o pierde una inversión respecto a su valor inicial.'],
  [/\b(especulacion|especulativo|especular)\b/, 'Especular es buscar ganancias a partir de cambios de precio. Si el precio se mueve en la otra dirección, también puedes perder.'],
  [/\b(sofisticado|sofisticada)\b/, 'Para esta pregunta, piensa si tienes experiencia para entender inversiones complejas, cómo funcionan y qué podrías perder. Tu respuesta describe cómo ves tu experiencia.'],
  [/\bcasa de bolsa\b/, 'Una casa de bolsa es un intermediario que permite comprar y vender valores, como acciones.'],
];

const conversacion = document.querySelector('#conversacion');
const progreso = document.querySelector('#progreso');
const ayuda = document.querySelector('#ayuda-respuesta');
const reiniciar = document.querySelector('#reiniciar');
const formulario = document.querySelector('#consulta');
const duda = document.querySelector('#duda');

const respuestas = {};
let editando = null;
let explicar = false;

function elemento(tag, clase, texto) {
  const nodo = document.createElement(tag);
  if (clase) nodo.className = clase;
  if (texto) nodo.textContent = texto;
  return nodo;
}

function boton(texto, clase, accion) {
  const control = elemento('button', clase, texto);
  control.type = 'button';
  control.addEventListener('click', accion);
  return control;
}

function ocultarAyuda() {
  ayuda.hidden = true;
  ayuda.textContent = '';
}

function seleccionar(paso, valor) {
  if (paso === 'p9' && respuestas.p9 !== valor) delete respuestas.aclaracion;
  respuestas[paso] = valor;
  editando = null;
  explicar = false;
  ocultarAyuda();
  renderizar(true);
}

function editar(paso) {
  editando = paso;
  ocultarAyuda();
  renderizar(true);
}

function mostrarMotivos() {
  explicar = true;
  ocultarAyuda();
  renderizar(true);
}

function textoRespuesta(paso) {
  return catalogo[paso].opciones[respuestas[paso]];
}

function razonPrincipal(resultado) {
  if (resultado.perfil === resultado.limite.nivel) {
    if (resultado.perfil === 'propenso') {
      return 'Tu objetivo y tu plazo admiten un nivel alto, y tus respuestas sobre pérdidas apuntan a ese mismo nivel.';
    }
    return limites[resultado.limite.razones[0]];
  }
  return `El resultado se basa en tu tolerancia ${tolerancias[resultado.tolerancia.nivel]} a pérdidas. El chat la calcula con tu reacción, la caída que te haría actuar y tu preferencia de riesgo.`;
}

function describirSenales(tolerancia) {
  const lista = elemento('ul');
  for (const [id, nivel] of Object.entries(tolerancia.senales)) {
    const respuesta = id === 'p9' && respuestas.aclaracion ? textoRespuesta('aclaracion') : textoRespuesta(id);
    const lectura = nivel ? `Tolerancia ${tolerancias[nivel]}.` : 'Quedó sin precisar una caída.';
    const fila = elemento('li');
    fila.append(elemento('strong', '', preguntas[id].tema + '. '));
    fila.append(`«${respuesta}». ${lectura}`);
    lista.append(fila);
  }
  return lista;
}

function explicarTolerancia(tolerancia) {
  if (!tolerancia.nivel) {
    return 'El objetivo y el plazo llevan al mismo perfil con cualquiera de las tres caídas. Por eso puedes obtener tu resultado sin precisar un porcentaje.';
  }

  const nivel = tolerancias[tolerancia.nivel];
  const senales = new Set(Object.values(tolerancia.senales));
  let razon = `Tus respuestas coinciden en una tolerancia ${nivel}.`;
  if (tolerancia.senales.p9 === null) {
    razon = `Tu reacción ante pérdidas y tu preferencia de riesgo coinciden en una tolerancia ${nivel}. Esas dos respuestas bastan para calcularla.`;
  } else if (senales.size === 3) {
    razon = 'Tus respuestas apuntan a tres niveles distintos. Tomamos el nivel central, que corresponde a una tolerancia intermedia.';
  } else if (senales.size === 2) {
    razon = `Dos respuestas apuntan a una tolerancia ${nivel}. Por eso ese es el nivel central.`;
  }
  return `${razon} El perfil toma el nivel más bajo entre tu tolerancia y el límite que fijan tu objetivo y tu plazo.`;
}

function describirExperiencia() {
  const experiencia = respuestas.p3 === 'A'
    ? 'Indicaste que ya has invertido.'
    : 'Indicaste que estás explorando tu primera inversión.';
  const mercados = {
    A: 'Conoces el mercado mexicano.',
    B: 'Conoces mercados de otros países.',
    AyB: 'Conoces el mercado mexicano y otros mercados.',
    C: 'Todavía estás conociendo los mercados de inversión.',
  };
  const analisis = respuestas.p6 === 'A'
    ? 'Usas tus propios métodos de análisis.'
    : 'Dijiste que no usas métodos propios para evaluar inversiones.';
  return `${experiencia} ${mercados[respuestas.p5]} ${analisis} Para decidir, elegiste «${textoRespuesta('p7')}».`;
}

function renderizarResultado(resultado) {
  const tarjeta = elemento('article', `resultado resultado--${resultado.perfil}`);
  tarjeta.id = 'resultado';
  const titulo = elemento('h3', '', perfiles[resultado.perfil]);
  titulo.tabIndex = -1;
  tarjeta.append(elemento('p', 'etiqueta', 'Tu perfil'), titulo);
  let destino = titulo;

  if (explicar) {
    const detalle = elemento('div', 'motivos');
    detalle.id = 'motivos';
    const encabezado = elemento('h4', '', 'Por qué te salió este perfil');
    encabezado.tabIndex = -1;
    const { limite, tolerancia } = resultado;

    detalle.append(
      encabezado,
      elemento('h5', '', 'Objetivo y plazo'),
      elemento('p', '', limite.razones.map((razon) => limites[razon]).join(' ')),
      elemento('h5', '', 'Tolerancia a pérdidas'),
      describirSenales(tolerancia),
      elemento('p', '', explicarTolerancia(tolerancia)),
      elemento('h5', '', 'Tu experiencia'),
      elemento('p', '', describirExperiencia()),
    );
    tarjeta.append(detalle);
    destino = encabezado;
  } else {
    tarjeta.append(
      elemento('p', 'resultado-texto', razonPrincipal(resultado)),
      boton('¿Por qué me salió este perfil?', 'boton-explicar', mostrarMotivos),
    );
  }
  conversacion.append(tarjeta);
  return destino;
}

function renderizarPregunta(paso) {
  const pregunta = catalogo[paso];
  const caja = elemento('div', 'turno');
  const titulo = elemento('h3', 'pregunta', pregunta.texto);
  titulo.id = 'pregunta';
  titulo.tabIndex = -1;
  const opciones = elemento('div', 'opciones');
  opciones.setAttribute('role', 'group');
  opciones.setAttribute('aria-labelledby', 'pregunta');
  for (const [valor, texto] of Object.entries(pregunta.opciones)) {
    const control = boton(texto, 'opcion', () => seleccionar(paso, valor));
    if (editando) control.setAttribute('aria-pressed', String(respuestas[paso] === valor));
    opciones.append(control);
  }
  caja.append(titulo, opciones);
  conversacion.append(caja);

  const indice = orden.indexOf(paso);
  if (editando) {
    caja.append(boton('Volver', 'boton-texto volver', () => {
      editando = null;
      ocultarAyuda();
      renderizar(true);
    }));
  } else if (indice > 0) {
    caja.append(boton('Anterior', 'boton-texto volver', () => editar(orden[indice - 1])));
  }
  return titulo;
}

function renderizarRespuestas() {
  const respondidas = orden.filter((id) => respuestas[id]);
  if (!respondidas.length) return;

  const detalle = elemento('details', 'respuestas');
  detalle.id = 'respuestas';
  detalle.append(elemento('summary', '', `Revisar respuestas (${respondidas.length} de ${orden.length})`));
  const lista = elemento('ul');
  for (const id of respondidas) {
    const tema = preguntas[id].tema;
    const valor = id === 'p9' && respuestas.aclaracion
      ? `${textoRespuesta(id)}. En la aclaración elegiste «${textoRespuesta('aclaracion')}».`
      : textoRespuesta(id);
    const fila = elemento('li', 'respuesta');
    const texto = elemento('div', 'respuesta-texto');
    texto.append(elemento('strong', '', tema), elemento('span', '', valor));
    const control = boton('Cambiar', 'boton-texto', () => editar(id));
    control.setAttribute('aria-label', `Cambiar ${tema}`);
    fila.append(texto, control);
    if (id === 'p9' && respuestas.aclaracion) {
      fila.append(boton('Cambiar aclaración', 'boton-texto', () => editar('aclaracion')));
    }
    lista.append(fila);
  }
  detalle.append(lista);
  conversacion.append(detalle);
}

function renderizar(enfocar = false) {
  const resultado = evaluarPerfil(respuestas);
  const paso = editando ?? resultado.paso;
  if (paso === 'resultado') {
    progreso.textContent = 'Resultado';
  } else if (paso === 'aclaracion') {
    progreso.textContent = 'Una aclaración';
  } else {
    progreso.textContent = `Pregunta ${orden.indexOf(paso) + 1} de ${orden.length}`;
  }
  reiniciar.hidden = !respuestas.p1;
  conversacion.replaceChildren();
  const destino = paso === 'resultado' ? renderizarResultado(resultado) : renderizarPregunta(paso);
  renderizarRespuestas();
  if (enfocar) {
    destino.focus({ preventScroll: true });
    destino.scrollIntoView({ block: 'center', inline: 'nearest' });
  }
}

reiniciar.addEventListener('click', () => {
  for (const clave of Object.keys(respuestas)) delete respuestas[clave];
  editando = null;
  explicar = false;
  duda.value = '';
  ocultarAyuda();
  renderizar(true);
});

formulario.addEventListener('submit', (evento) => {
  evento.preventDefault();
  const texto = duda.value.toLowerCase().normalize('NFD').replace(/\p{M}/gu, '').trim();
  if (!texto) return;

  duda.value = '';
  const pideResultado = /\bpor que\b.*\bperfil\b/.test(texto);
  if (pideResultado && !editando && evaluarPerfil(respuestas).paso === 'resultado') {
    mostrarMotivos();
    return;
  }
  const coincidencia = glosario.find(([patron]) => patron.test(texto));
  ayuda.hidden = false;
  ayuda.textContent = pideResultado
    ? 'Termina las preguntas del perfil y te explico qué respuestas llevaron al resultado.'
    : coincidencia?.[1] ?? 'Puedo explicar términos como plazo, liquidez, pérdidas y riesgo. Usa los botones para seguir con tu perfil.';
  ayuda.scrollIntoView({ block: 'nearest', inline: 'nearest' });
});

renderizar();
