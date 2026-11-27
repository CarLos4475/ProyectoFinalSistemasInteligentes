import { aclaracionCaida, preguntas } from './cuestionario.mjs?v=7';
import { disponibleDeepSeek, interpretarDeepSeek } from './interprete.mjs?v=10';
import { evaluarPerfil } from './perfil.mjs?v=2';
import {
  ajustarCaida, compararCaida, describirCaida, iniciarSimulador, leerEscenario, margenDeMeta, restablecerEscenario,
} from './simulador.mjs?v=12';

const orden = Object.keys(preguntas);
const catalogo = { ...preguntas, aclaracion: aclaracionCaida };
const respuestasDemo = {
  p1: 'C', p2: 'B', p3: 'B', p4: 'A', p5: 'C', p6: 'B', p7: 'B',
  p8: 'C', p9: 'C', p10: 'D', p11: 'A', p12: 'B', p13: 'B', p14: 'B',
};
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

const umbrales = { A: 5, B: 10, C: 20 };
const maxHistorial = 6;
const siguientes = {
  conservador: 'Un perfil conservador suele dar prioridad a cuidar el dinero y a poder disponer de él. Por eso tiende a instrumentos de deuda de corto plazo y bajo riesgo, como CETES o fondos de deuda.',
  moderado: 'Un perfil moderado suele combinar instrumentos de deuda con una parte en renta variable, como fondos que invierten en acciones. Acepta algunas caídas a cambio de buscar un rendimiento mayor.',
  propenso: 'Un perfil propenso al riesgo suele aceptar una parte mayor en renta variable. Su valor puede caer más en el corto plazo, así que conviene que el plazo permita esperar una recuperación.',
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
const inicio = document.querySelector('#vista-inicio');
const zonaChat = document.querySelector('#zona-chat');
const chat = document.querySelector('#vista-cuestionario');
const cabeceraChat = chat.querySelector('.chat-cabecera');
const chatLateral = document.querySelector('#chat-lateral');
const mensajeUsuario = document.querySelector('#mensaje-usuario');
const ayuda = document.querySelector('#ayuda-respuesta');
const reiniciar = document.querySelector('#reiniciar');
const demo = document.querySelector('#modo-demo');
const enlacePerfil = document.querySelector('#nav-perfil');
const enlacesVista = document.querySelectorAll('.navegacion [data-vista]');
const pasosVista = document.querySelectorAll('[data-paso]');
const dialogo = document.querySelector('#modal-simulador');
const formulario = document.querySelector('#consulta');
const pieChat = formulario.closest('.chat-pie');
const duda = document.querySelector('#duda');
const enviar = formulario.querySelector('button[type="submit"]');
const avisoDeepSeek = document.querySelector('#aviso-deepseek');
const hilo = document.querySelector('#hilo');

const respuestas = {};
let editando = null;
let vista = 'inicio';
let usoSimulador = false;
let mostrandoDemo = false;
let revisionChat = 0;
// Conversación reciente: «texto» viaja al modelo y «mostrado» se ve en pantalla (puede incluir pesos).
const historial = [];
let parVisible = false;

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

function renderizarHilo() {
  const visibles = parVisible ? historial.slice(0, -2) : historial;
  hilo.replaceChildren(...visibles.map(({ rol, mostrado }) =>
    elemento('p', rol === 'persona' ? 'mensaje-usuario' : 'ayuda ayuda--previa', mostrado)));
  hilo.hidden = visibles.length === 0;
}

function registrar(pregunta, texto, mostrado = texto) {
  historial.push(
    { rol: 'persona', texto: pregunta, mostrado: pregunta },
    { rol: 'tolera', texto: texto.slice(0, 1600), mostrado },
  );
  historial.splice(0, Math.max(0, historial.length - maxHistorial));
  parVisible = true;
  renderizarHilo();
}

function ocultarAyuda() {
  revisionChat += 1;
  ayuda.hidden = true;
  ayuda.textContent = '';
  mensajeUsuario.hidden = true;
  mensajeUsuario.textContent = '';
  parVisible = false;
  renderizarHilo();
}

function escenarioUsado() {
  return usoSimulador ? leerEscenario() : null;
}

function escenarioParaChat() {
  const escenario = escenarioUsado();
  if (!escenario) return undefined;
  const cobertura = Math.min(10_000, Math.round((100 * escenario.saldo) / escenario.meta));
  return { caida: escenario.porcentaje, cobertura, plazo: escenario.plazo };
}

function textoMargen(escenario) {
  const margen = margenDeMeta(escenario);
  return margen < 0
    ? 'Incluso sin caída, tu monto disponible no alcanza tu meta.'
    : `Tu meta aguanta caídas de hasta ${margen} %.`;
}

function umbralElegido() {
  return umbrales[respuestas.p9] ?? umbrales[respuestas.aclaracion] ?? null;
}

function toleranciaEnPesos(escenario) {
  const umbral = umbralElegido();
  if (umbral === null) return `No elegiste una caída concreta. ${textoMargen(escenario)}`;
  const margen = margenDeMeta(escenario);
  let lectura = '';
  if (margen >= 0) {
    lectura = umbral > margen
      ? ' Una caída que todavía aguantarías ya dejaría tu meta sin cubrir.'
      : ' Tu meta resiste la caída que te haría actuar.';
  }
  return `Dijiste que tomarías medidas al caer ${umbral} %. ${describirCaida(compararCaida(escenario, umbral))} `
    + `${textoMargen(escenario)}${lectura}`;
}

function navegar(destino, enfocar = true, desdeURL = false) {
  const perfilListo = evaluarPerfil(respuestas).paso === 'resultado';
  if (destino === 'perfil' && !perfilListo) {
    destino = 'cuestionario';
    if (desdeURL) history.replaceState(null, '', '#cuestionario');
  }
  if (vista !== destino) {
    ocultarAyuda();
    if (dialogo.open) dialogo.close();
    window.scrollTo(0, 0);
  }
  vista = destino;
  if (vista === 'perfil') editando = null;
  if (!desdeURL && location.hash !== `#${vista}`) history.pushState(null, '', `#${vista}`);
  renderizar(enfocar);
}

function continuar() {
  navegar(evaluarPerfil(respuestas).paso === 'resultado' ? 'perfil' : 'cuestionario');
}

function seleccionar(paso, valor, destino) {
  if (paso === 'p9' && respuestas.p9 !== valor) delete respuestas.aclaracion;
  respuestas[paso] = valor;
  editando = null;
  ocultarAyuda();
  if (destino) navegar(destino);
  else continuar();
}

function editar(paso) {
  editando = paso;
  ocultarAyuda();
  navegar('cuestionario');
}

function mostrarMotivos() {
  ocultarAyuda();
  navegar('perfil', false);
  const encabezado = document.querySelector('#titulo-motivos');
  encabezado.focus({ preventScroll: true });
  encabezado.scrollIntoView({ block: 'center', inline: 'nearest' });
}

function textoRespuesta(paso) {
  return catalogo[paso].opciones[respuestas[paso]];
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

function actualizarEscenarioVinculado() {
  const usado = escenarioUsado();
  const escenario = usado?.plazo === respuestas.p4 ? usado : null;
  const vinculo = conversacion.querySelector('#vinculo-escenario');
  const tolerancia = conversacion.querySelector('#tolerancia-pesos');
  const comparacion = conversacion.querySelector('.umbrales');

  if (vinculo) {
    vinculo.closest('.resultado-escenario').hidden = !escenario;
    vinculo.textContent = escenario ? describirCaida(escenario) : '';
  }
  if (tolerancia) {
    tolerancia.closest('.tarjeta-motivo').hidden = !escenario;
    tolerancia.textContent = escenario ? toleranciaEnPesos(escenario) : '';
  }
  if (comparacion) {
    comparacion.hidden = !escenario;
    if (escenario) {
      for (const renglon of comparacion.querySelectorAll('[data-umbral]')) {
        renglon.textContent = describirCaida(compararCaida(escenario, Number(renglon.dataset.umbral)));
      }
      comparacion.querySelector('p').textContent = textoMargen(escenario);
    }
  }
}

function renderizarResultado(resultado) {
  const tarjeta = elemento('article', `resultado resultado--${resultado.perfil}`);
  tarjeta.id = 'resultado';
  const titulo = elemento('h2', '', perfiles[resultado.perfil]);
  titulo.id = 'perfil-titulo';
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
  ficha.append(
    elemento('p', 'etiqueta', mostrandoDemo ? 'Perfil de ejemplo' : 'Tu perfil · orientativo'),
    titulo,
    escala,
    elemento('p', 'resultado-texto', 'El perfil toma el nivel más bajo entre tu tolerancia y el máximo que fijan tu objetivo y tu plazo.'),
  );
  lateral.append(ficha);
  const escenario = elemento('section', 'resultado-escenario');
  const vinculo = elemento('p');
  vinculo.id = 'vinculo-escenario';
  escenario.append(elemento('h4', '', 'Escenario activo'), vinculo);
  lateral.append(escenario);
  renderizarRespuestas(lateral);
  lateral.append(boton('Volver a empezar', 'boton-texto', reiniciarCuestionario));

  const detalle = elemento('div', 'motivos');
  detalle.id = 'motivos';
  const encabezado = elemento('h3', '', mostrandoDemo ? 'Por qué el ejemplo da este perfil' : 'Por qué te salió este perfil');
  encabezado.id = 'titulo-motivos';
  encabezado.tabIndex = -1;
  const { limite, tolerancia } = resultado;
  detalle.append(encabezado);
  const tarjetas = [
    ['Objetivo y plazo', elemento('p', '', limite.razones.map((razon) => limites[razon]).join(' '))],
    ['Tolerancia a pérdidas', describirSenales(tolerancia), elemento('p', '', explicarTolerancia(tolerancia))],
  ];
  const toleranciaPesos = elemento('p');
  toleranciaPesos.id = 'tolerancia-pesos';
  tarjetas.push(['Tu tolerancia en pesos', toleranciaPesos]);
  tarjetas.push(['Tu experiencia', elemento('p', '', describirExperiencia())]);
  const preguntasAsesor = elemento('ul');
  for (const texto of [
    '¿Cuánto podría caer esta inversión en un mal año?',
    '¿Puedo retirar mi dinero antes de mi plazo y cuánto me costaría?',
    '¿Qué comisiones cobra?',
    `¿Esta opción corresponde a un perfil ${perfiles[resultado.perfil].toLowerCase()}?`,
  ]) preguntasAsesor.append(elemento('li', '', texto));
  tarjetas.push([
    '¿Y ahora qué?',
    elemento('p', '', siguientes[resultado.perfil]),
    elemento('p', 'motivo-subtitulo', 'Preguntas para llevar a tu asesor o a tu banco'),
    preguntasAsesor,
    elemento('p', 'motivo-nota', 'Es información general para orientarte, no una recomendación de inversión.'),
  ]);
  for (const [tema, ...contenido] of tarjetas) {
    const motivo = elemento('section', 'tarjeta-motivo tarjeta-clay');
    motivo.append(elemento('h4', '', tema), ...contenido);
    detalle.append(motivo);
  }
  tarjeta.append(lateral, detalle);
  conversacion.append(tarjeta);
  return titulo;
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
  if (paso === 'p9' || paso === 'aclaracion') {
    const bloque = elemento('section', 'umbrales');
    const lista = elemento('ul');
    for (const porcentaje of Object.values(umbrales)) {
      const renglon = elemento('li');
      renglon.dataset.umbral = porcentaje;
      lista.append(renglon);
    }
    bloque.append(elemento('h4', '', 'Estas caídas con tu escenario'), lista, elemento('p'));
    caja.append(bloque);
  }
  conversacion.append(caja);

  const indice = orden.indexOf(paso);
  if (editando) {
    caja.append(boton('Volver', 'boton-texto volver', () => {
      editando = null;
      ocultarAyuda();
      continuar();
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
  const perfilListo = resultado.paso === 'resultado';
  const enPerfil = vista === 'perfil';
  inicio.hidden = vista !== 'inicio';
  zonaChat.hidden = vista === 'inicio';
  enlacePerfil.disabled = !perfilListo;
  for (const enlace of enlacesVista) {
    if (enlace.dataset.vista === vista) enlace.setAttribute('aria-current', 'page');
    else enlace.removeAttribute('aria-current');
  }
  for (const [indice, item] of pasosVista.entries()) {
    const paso = item.dataset.paso;
    const completo = (paso === 'simular' && usoSimulador) || (paso === 'cuestionario' && enPerfil);
    item.classList.toggle('hecho', completo);
    const numero = item.querySelector('.paso-numero');
    numero.textContent = completo ? '✓' : String(indice + 1);
    if (paso === vista) item.setAttribute('aria-current', 'step');
    else item.removeAttribute('aria-current');
  }
  if (vista === 'inicio') {
    if (enfocar) document.querySelector('#titulo').focus({ preventScroll: true });
    return;
  }

  const paso = editando ?? resultado.paso;
  chat.classList.toggle('chat--resultado', enPerfil);
  chat.setAttribute('aria-labelledby', enPerfil ? 'perfil-titulo' : 'titulo-chat');
  cabeceraChat.hidden = enPerfil;
  chatLateral.hidden = enPerfil;
  const respondidas = orden.filter((id) => respuestas[id]).length;
  barraChat.value = respondidas;
  if (paso === 'resultado') {
    progreso.textContent = 'Cuestionario completo';
  } else if (paso === 'aclaracion') {
    progreso.textContent = 'Una aclaración';
  } else {
    progreso.textContent = `Pregunta ${orden.indexOf(paso) + 1} de ${orden.length}`;
  }
  demo.hidden = respondidas > 0;
  reiniciar.hidden = respondidas === 0;
  conversacion.replaceChildren();
  let destino;
  if (enPerfil) {
    destino = renderizarResultado(resultado);
  } else {
    if (paso === 'resultado') {
      destino = elemento('h3', 'pregunta', 'Ya completaste el cuestionario');
      destino.tabIndex = -1;
      conversacion.append(destino, boton('Ver mi perfil', 'boton-oscuro', () => navegar('perfil')));
    } else {
      destino = renderizarPregunta(paso);
    }
    renderizarRespuestas(conversacion);
  }
  actualizarEscenarioVinculado();
  if (enfocar) {
    destino.focus({ preventScroll: true });
    destino.scrollIntoView({ block: 'nearest', inline: 'nearest' });
  }
}

function reiniciarCuestionario() {
  for (const clave of Object.keys(respuestas)) delete respuestas[clave];
  historial.length = 0;
  editando = null;
  usoSimulador = false;
  mostrandoDemo = false;
  duda.value = '';
  ocultarAyuda();
  navegar('cuestionario');
}

reiniciar.addEventListener('click', reiniciarCuestionario);
demo.addEventListener('click', () => {
  if (Object.keys(respuestas).length) return;
  restablecerEscenario();
  Object.assign(respuestas, respuestasDemo);
  usoSimulador = true;
  mostrandoDemo = true;
  duda.value = '';
  continuar();
});

function abrirSimulador() {
  if (!dialogo.open) dialogo.showModal();
}

function irSegunURL(enfocar) {
  const fragmento = location.hash.slice(1);
  const destino = fragmento === 'perfil' || fragmento === 'cuestionario' ? fragmento : 'inicio';
  navegar(destino, enfocar, true);
  if (fragmento === 'simulador') abrirSimulador();
}

for (const enlace of document.querySelectorAll('[data-vista]')) {
  enlace.addEventListener('click', (evento) => {
    if (evento.ctrlKey || evento.metaKey || evento.altKey || evento.shiftKey) return;
    evento.preventDefault();
    navegar(enlace.dataset.vista);
  });
}
for (const botonSimulador of document.querySelectorAll('[data-abrir-simulador]')) {
  botonSimulador.addEventListener('click', abrirSimulador);
}
document.querySelector('#cerrar-simulador').addEventListener('click', () => dialogo.close());
dialogo.addEventListener('click', (evento) => {
  if (evento.target !== dialogo) return;
  const rect = dialogo.getBoundingClientRect();
  if (evento.clientX < rect.left || evento.clientX > rect.right
      || evento.clientY < rect.top || evento.clientY > rect.bottom) dialogo.close();
});
window.addEventListener('hashchange', () => irSegunURL(true));

function mostrarAyuda(texto) {
  ayuda.hidden = false;
  ayuda.textContent = texto;
  ayuda.scrollIntoView({ block: 'nearest', inline: 'nearest' });
}

function interpretarLocal(texto) {
  if (/\b(por que|explica|explicame)\b.*\bperfil\b/.test(texto)) {
    return { accion: 'explicar_perfil' };
  }
  if (/\b(no (?:entiendo|entendi|comprendo|me queda clara?)|(?:explica(?:me|s)?|aclara(?:me|s)?) (?:esta|la) pregunta|que (?:significa|quiere decir) (?:esta|la) pregunta)\b/.test(texto)) {
    return { accion: 'aclarar_pregunta' };
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
  const paso = editando ?? evaluarPerfil(respuestas).paso;
  let intencion = interpretarLocal(texto);
  let falloDeepSeek = false;
  duda.value = '';
  parVisible = false;
  renderizarHilo();
  mensajeUsuario.textContent = pregunta;
  mensajeUsuario.hidden = false;
  const contestar = (respuesta, mostrado = respuesta) => {
    mostrarAyuda(mostrado);
    registrar(pregunta, respuesta, mostrado);
  };

  if (!avisoDeepSeek.hidden) {
    enviar.disabled = true;
    const revision = revisionChat;
    mostrarAyuda('DeepSeek Flash');
    const respuesta = await interpretarDeepSeek({
      pregunta, paso, respuestas,
      historial: historial.map(({ rol, texto: contenido }) => ({ rol, texto: contenido })),
      escenario: escenarioParaChat(),
    });
    enviar.disabled = false;
    if (revisionChat !== revision) return;
    if (respuesta?.accion === 'responder' && typeof respuesta.texto === 'string') {
      contestar(respuesta.texto);
      return;
    }
    falloDeepSeek = !respuesta || respuesta.accion === 'sin_coincidencia';
    if (respuesta?.accion === 'explicar_perfil' || respuesta?.accion === 'simular_caida') {
      intencion = respuesta;
    }
  }

  if (intencion?.accion === 'aclarar_pregunta') {
    contestar(catalogo[paso]?.ayuda
      ?? 'Ya tienes tu resultado. Abre «Revisar respuestas» y pulsa «Cambiar» en la pregunta que quieres aclarar.');
    return;
  }
  if (intencion?.accion === 'explicar_perfil') {
    if (paso === 'resultado') {
      registrar(pregunta, 'Mostré la explicación de tu perfil en pantalla.');
      mostrarMotivos();
    } else {
      contestar('Termina las preguntas del perfil y te explico qué respuestas llevaron al resultado.');
    }
    return;
  }
  if (intencion?.accion === 'simular_caida') {
    const escenario = ajustarCaida(intencion.porcentaje);
    actualizarEscenarioVinculado();
    if (!escenario) {
      contestar('Ingresa los dos montos en el simulador y vuelve a indicar la caída.');
      return;
    }
    const cobertura = Math.round((100 * escenario.saldo) / escenario.meta);
    contestar(`Simulé una caída del ${escenario.porcentaje} %. Tu meta quedaría cubierta al ${cobertura} %.`,
      describirCaida(escenario));
    return;
  }

  const coincidencia = glosario.find(([patron]) => patron.test(texto));
  if (coincidencia) {
    contestar(coincidencia[1]);
    return;
  }
  if (falloDeepSeek) {
    mostrarAyuda('DeepSeek no pudo responder. Intenta enviar tu pregunta otra vez.');
    if (!duda.value) duda.value = pregunta;
    return;
  }
  mostrarAyuda('Puedes escribir «No entiendo esta pregunta», «¿Y si mi inversión cae 15 %?» o «¿Por qué me salió este perfil?».');
});

disponibleDeepSeek().then((disponible) => {
  avisoDeepSeek.hidden = !disponible;
  if (disponible) duda.setAttribute('aria-describedby', avisoDeepSeek.id);
});
new ResizeObserver(() => {
  const espacio = Math.ceil(pieChat.getBoundingClientRect().height) + 12;
  document.documentElement.style.setProperty('--espacio-pie-chat', `${espacio}px`);
}).observe(pieChat);
iniciarSimulador((escenario) => {
  usoSimulador = true;
  dialogo.close();
  seleccionar('p4', escenario.plazo, 'cuestionario');
  mostrarAyuda(describirCaida(escenario));
}, () => {
  if (enviar.disabled) ocultarAyuda();
  actualizarEscenarioVinculado();
});
irSegunURL(false);
