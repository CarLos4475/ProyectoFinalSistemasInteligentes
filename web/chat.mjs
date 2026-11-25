import { aclaracionCaida, preguntas } from './cuestionario.mjs';
import { disponibleDeepSeek, interpretarDeepSeek } from './interprete.mjs';
import { evaluarPerfil } from './perfil.mjs?v=2';
import { ajustarCaida, describirCaida, iniciarSimulador, leerEscenario } from './simulador.mjs?v=6';

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
const barraChat = document.querySelector('#barra-chat');
const chat = document.querySelector('#cuestionario');
const chatLateral = document.querySelector('#chat-lateral');
const ayuda = document.querySelector('#ayuda-respuesta');
const reiniciar = document.querySelector('#reiniciar');
const formulario = document.querySelector('#consulta');
const duda = document.querySelector('#duda');
const enviar = formulario.querySelector('button[type="submit"]');
const opcionDeepSeek = document.querySelector('#opcion-deepseek');
const usarDeepSeek = opcionDeepSeek.querySelector('#usar-deepseek');

const respuestas = {};
let editando = null;
let explicar = false;
let revisionChat = 0;

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
  revisionChat += 1;
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

function actualizarVinculo() {
  const vinculo = document.querySelector('#vinculo-escenario');
  if (!vinculo) return;

  const escenario = leerEscenario();
  const coincide = escenario?.plazo === respuestas.p4;
  vinculo.closest('.resultado-escenario').hidden = !coincide;
  vinculo.textContent = coincide ? describirCaida(escenario) : '';
}

function renderizarResultado(resultado) {
  const tarjeta = elemento('article', `resultado resultado--${resultado.perfil}`);
  tarjeta.id = 'resultado';
  const titulo = elemento('h3', '', perfiles[resultado.perfil]);
  titulo.tabIndex = -1;
  const lateral = elemento('div', 'resultado-lateral');
  const ficha = elemento('div', 'resultado-perfil tarjeta-clay');
  const escala = elemento('ul', 'escala-perfil');
  escala.setAttribute('aria-label', 'Niveles de riesgo');
  for (const [nivel, nombre] of Object.entries(perfiles)) {
    const item = elemento('li', '', nivel === 'propenso' ? 'Propenso' : nombre);
    if (resultado.perfil === nivel) item.setAttribute('aria-current', 'true');
    escala.append(item);
  }
  ficha.append(elemento('p', 'etiqueta', 'Tu perfil · orientativo'), titulo, escala);
  lateral.append(ficha);
  tarjeta.append(lateral);
  let destino = titulo;

  if (explicar) {
    tarjeta.classList.add('resultado--explicado');
    const detalle = elemento('div', 'motivos');
    detalle.id = 'motivos';
    const encabezado = elemento('h4', '', 'Por qué te salió este perfil');
    encabezado.tabIndex = -1;
    const { limite, tolerancia } = resultado;
    const vinculo = elemento('p');
    vinculo.id = 'vinculo-escenario';
    const escenario = elemento('section', 'resultado-escenario');
    escenario.append(elemento('h4', '', 'Escenario activo'), vinculo);
    lateral.append(escenario);

    ficha.append(elemento('p', 'resultado-texto', 'El perfil toma el nivel más bajo entre tu tolerancia y el máximo que fijan tu objetivo y tu plazo.'));
    detalle.append(encabezado);
    for (const [tema, ...contenido] of [
      ['Objetivo y plazo', elemento('p', '', limite.razones.map((razon) => limites[razon]).join(' '))],
      ['Tolerancia a pérdidas', describirSenales(tolerancia), elemento('p', '', explicarTolerancia(tolerancia))],
      ['Tu experiencia', elemento('p', '', describirExperiencia())],
    ]) {
      const tarjetaMotivo = elemento('section', 'tarjeta-motivo tarjeta-clay');
      tarjetaMotivo.append(elemento('h5', '', tema), ...contenido);
      detalle.append(tarjetaMotivo);
    }
    tarjeta.append(detalle);
    destino = encabezado;
  } else {
    ficha.append(
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

function renderizarRespuestas(padre) {
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
  padre.append(detalle);
}

function renderizar(enfocar = false) {
  const resultado = evaluarPerfil(respuestas);
  const paso = editando ?? resultado.paso;
  chat.classList.toggle('chat--resultado', paso === 'resultado');
  chatLateral.hidden = paso === 'resultado';
  barraChat.value = orden.filter((id) => respuestas[id]).length;
  if (paso === 'resultado') {
    progreso.textContent = 'Resultado';
  } else if (paso === 'aclaracion') {
    progreso.textContent = 'Una aclaración';
  } else {
    progreso.textContent = `Pregunta ${orden.indexOf(paso) + 1} de ${orden.length}`;
  }
  reiniciar.hidden = Object.keys(respuestas).length === 0;
  conversacion.replaceChildren();
  const destino = paso === 'resultado' ? renderizarResultado(resultado) : renderizarPregunta(paso);
  renderizarRespuestas(conversacion.querySelector('.resultado-lateral') ?? conversacion);
  actualizarVinculo();
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

function mostrarAyuda(texto) {
  ayuda.hidden = false;
  ayuda.textContent = texto;
  ayuda.scrollIntoView({ block: 'nearest', inline: 'nearest' });
}

function interpretarLocal(texto) {
  if (/\b(por que|explica|explicame)\b.*\bperfil\b/.test(texto)) {
    return { accion: 'explicar_perfil' };
  }
  const pideSimular = /\b(y si|que pasa|que pasaria|simula|simular|prueba|probar|me alcanza|alcanzaria|me queda|quedaria)\b/.test(texto);
  const mencionaCaida = /\b(cae|caer|caida|baja|bajara|pierde|perdida|perder)\b/.test(texto);
  if (!pideSimular || !mencionaCaida || texto.match(/%|por ciento\b/g)?.length !== 1) return null;

  const coincidencia = texto.match(/(?<![\p{L}\p{N}.,+-])(\d{1,3})\s*(?:%|por ciento\b)/u);
  if (coincidencia && Number(coincidencia[1]) <= 100) {
    return { accion: 'simular_caida', porcentaje: Number(coincidencia[1]) };
  }
  return null;
}

formulario.addEventListener('submit', async (evento) => {
  evento.preventDefault();
  const pregunta = duda.value.trim();
  if (!pregunta || enviar.disabled) return;
  const texto = pregunta.toLowerCase().normalize('NFD').replace(/\p{M}/gu, '');
  let intencion = interpretarLocal(texto);
  duda.value = '';

  if (!opcionDeepSeek.hidden && usarDeepSeek.checked) {
    enviar.disabled = true;
    const revision = revisionChat;
    mostrarAyuda('Interpretando tu pregunta…');
    const respuesta = await interpretarDeepSeek(pregunta);
    enviar.disabled = false;
    if (revisionChat !== revision) return;
    if (respuesta?.accion === 'explicar_perfil' || respuesta?.accion === 'simular_caida') {
      intencion = respuesta;
    }
  }

  if (intencion?.accion === 'explicar_perfil') {
    if (!editando && evaluarPerfil(respuestas).paso === 'resultado') mostrarMotivos();
    else mostrarAyuda('Termina las preguntas del perfil y te explico qué respuestas llevaron al resultado.');
    return;
  }
  if (intencion?.accion === 'simular_caida') {
    const escenario = ajustarCaida(intencion.porcentaje);
    actualizarVinculo();
    mostrarAyuda(escenario
      ? describirCaida(escenario)
      : 'Ingresa los dos montos en el simulador y vuelve a indicar la caída.');
    return;
  }

  const coincidencia = glosario.find(([patron]) => patron.test(texto));
  if (coincidencia) {
    mostrarAyuda(coincidencia[1]);
    return;
  }
  mostrarAyuda('Prueba «¿Y si mi inversión cae 15 %?» o «¿Por qué me salió este perfil?». También puedo explicar términos como liquidez y plazo.');
});

usarDeepSeek.checked = false;
disponibleDeepSeek().then((disponible) => { opcionDeepSeek.hidden = !disponible; });
iniciarSimulador((plazo) => seleccionar('p4', plazo), () => {
  if (enviar.disabled) ocultarAyuda();
  actualizarVinculo();
});
renderizar();
