import { evaluarPerfil } from './perfil.mjs';

const preguntas = {
  plazo: {
    texto: '¿En cuánto tiempo necesitarías el dinero que invertirías?',
    opciones: [
      ['corto', 'Menos de 1 año'],
      ['medio', 'De 1 a 3 años'],
      ['largo', 'Más de 3 años'],
    ],
  },
  caida: {
    texto: 'Si tu inversión pierde valor, ¿a partir de qué caída considerarías tomar medidas?',
    opciones: [
      ['5', 'Al caer 5 %'],
      ['10', 'Al caer 10 %'],
      ['20', 'Al caer 20 %'],
      ['sin-umbral', 'No me inquieto'],
    ],
  },
};

preguntas.aclaracion = {
  texto: 'Para entender esa respuesta, piensa en una caída concreta. ¿A partir de qué caída considerarías tomar medidas?',
  opciones: preguntas.caida.opciones.slice(0, 3),
};

const perfiles = {
  conservador: {
    nombre: 'Conservador',
    descripcion: 'Tus respuestas apuntan a priorizar la estabilidad y la disponibilidad de tu dinero.',
  },
  moderado: {
    nombre: 'Moderado',
    descripcion: 'Tus respuestas indican que aceptarías ciertas pérdidas, con un límite de tiempo o de caída.',
  },
  propenso: {
    nombre: 'Propenso al riesgo',
    descripcion: 'Tus respuestas indican que tienes un plazo largo y que tomarías medidas ante una caída mayor.',
  },
};

const motivos = {
  'plazo-corto': 'Necesitarías el dinero en menos de un año. Ese plazo deja poco tiempo para esperar una recuperación si la inversión pierde valor.',
  'caida-5': 'Considerarías tomar medidas al caer 5 %. Esa respuesta indica que una caída pequeña ya influiría en tu decisión.',
  'plazo-medio': 'Necesitarías el dinero en un plazo de uno a tres años. El cuestionario toma ese plazo como un punto intermedio.',
  'plazo-largo': 'Necesitarías el dinero en más de tres años. Ese plazo da más tiempo para esperar si la inversión pierde valor.',
  'caida-10': 'Considerarías tomar medidas al caer 10 %. Ese límite lleva a un perfil moderado aunque tu plazo sea largo.',
  'caida-20': 'Considerarías tomar medidas al caer 20 %. Junto con el plazo largo, esa respuesta determina el perfil propenso al riesgo.',
};

const glosario = [
  [/\b(liquidez|liquido|disponibilidad)\b/, 'La liquidez es la facilidad de convertir una inversión en dinero disponible. Si necesitas usar el dinero pronto, importa cuánto tardarías en disponer de él.'],
  [/\b(horizonte|plazo|tiempo)\b/, 'El horizonte de inversión es el tiempo que puedes dejar invertido el dinero antes de necesitarlo.'],
  [/\b(caida|caer|perdida|perder|tolerancia|baja)\b/, 'Una caída es una pérdida de valor. Si una inversión vale $100 y baja 10 %, pasa a valer $90. La tolerancia indica qué caída te haría considerar tomar medidas.'],
  [/\b(riesgo|volatilidad|fluctuacion)\b/, 'El riesgo incluye la posibilidad de que tu inversión pierda valor cuando necesites el dinero. El perfil reúne lo que dices sobre tu plazo y tu tolerancia a pérdidas.'],
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
  if (respuestas[paso] !== valor && paso !== 'aclaracion') {
    delete respuestas.aclaracion;
  }
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

function renderizarResultado(resultado) {
  const perfil = perfiles[resultado.perfil];
  const tarjeta = elemento('article', `resultado resultado--${resultado.perfil}`);
  tarjeta.id = 'resultado';
  tarjeta.append(elemento('p', 'etiqueta', 'Tu perfil'));

  const titulo = elemento('h3', '', perfil.nombre);
  titulo.tabIndex = -1;
  tarjeta.append(titulo, elemento('p', 'resultado-texto', perfil.descripcion));

  if (explicar) {
    const detalle = elemento('div', 'motivos');
    detalle.id = 'motivos';
    const encabezado = elemento('h4', '', 'Por qué te salió este perfil');
    encabezado.tabIndex = -1;
    const lista = elemento('ul');
    for (const motivo of resultado.motivos) {
      lista.append(elemento('li', '', motivos[motivo]));
    }
    detalle.append(encabezado, lista);
    tarjeta.append(detalle);
  } else {
    tarjeta.append(boton('¿Por qué me salió este perfil?', 'boton-explicar', mostrarMotivos));
  }
  conversacion.append(tarjeta);
  return tarjeta.querySelector(explicar ? 'h4' : 'h3');
}

function renderizarPregunta(paso) {
  const pregunta = preguntas[paso];
  const caja = elemento('div', 'turno');
  const titulo = elemento('h3', 'pregunta', pregunta.texto);
  titulo.id = 'pregunta';
  titulo.tabIndex = -1;
  const opciones = elemento('div', 'opciones');
  opciones.setAttribute('role', 'group');
  opciones.setAttribute('aria-labelledby', 'pregunta');
  for (const [valor, texto] of pregunta.opciones) {
    opciones.append(boton(texto, 'opcion', () => seleccionar(paso, valor)));
  }
  caja.append(titulo, opciones);
  conversacion.append(caja);
  if (editando) {
    caja.append(boton('Volver', 'boton-texto volver', () => {
      editando = null;
      renderizar(true);
    }));
  }
  return titulo;
}

function renderizar(enfocar = false) {
  const resultado = evaluarPerfil(respuestas);
  const paso = editando ?? resultado.paso;
  progreso.textContent = {
    plazo: 'Pregunta 1 de 2',
    caida: 'Pregunta 2 de 2',
    aclaracion: 'Una aclaración',
    resultado: 'Resultado',
  }[paso];
  reiniciar.hidden = !respuestas.plazo;
  conversacion.replaceChildren();

  const elegidas = elemento('div', 'respuestas');
  for (const [clave, texto] of [['plazo', 'Cambiar plazo'], ['caida', 'Cambiar caída'], ['aclaracion', 'Cambiar aclaración']]) {
    if (!respuestas[clave] || clave === editando) continue;
    const [, valor] = preguntas[clave].opciones.find(([id]) => id === respuestas[clave]);
    const fila = elemento('div', 'respuesta');
    fila.append(elemento('span', '', valor), boton(texto, 'boton-texto', () => editar(clave)));
    elegidas.append(fila);
  }
  if (elegidas.childElementCount) conversacion.append(elegidas);

  const destino = paso === 'resultado' ? renderizarResultado(resultado) : renderizarPregunta(paso);
  if (enfocar) {
    destino.focus({ preventScroll: true });
    conversacion.parentElement.scrollTop = conversacion.parentElement.scrollHeight;
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
    : coincidencia?.[1] ?? 'Puedo explicar plazo, liquidez, pérdidas y riesgo. Elige una opción para seguir con tu perfil.';
  conversacion.parentElement.scrollTop = conversacion.parentElement.scrollHeight;
});

renderizar();
