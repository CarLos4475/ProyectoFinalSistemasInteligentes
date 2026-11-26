import { leerMonto, simularCaida } from './escenario.mjs';

const formulario = document.querySelector('#escenario');
const disponible = formulario.querySelector('#disponible');
const montoMeta = formulario.querySelector('#monto-meta');
const plazo = formulario.elements.namedItem('plazo');
const caida = formulario.querySelector('#caida');
const indicador = formulario.querySelector('#caida-valor');
const barraCaida = formulario.querySelector('#barra-caida');
const mensaje = document.querySelector('#resultado-caida');
const resumenes = Object.fromEntries(
  ['pct', 'orb', 'saldo', 'meta', 'balance', 'plazo', 'panel', 'cobertura'].map((dato) =>
    [dato, document.querySelectorAll(`[data-escenario-${dato}]`)],
  ),
);

const moneda = new Intl.NumberFormat('es-MX', {
  style: 'currency', currency: 'MXN', minimumFractionDigits: 0, maximumFractionDigits: 2,
});
const pesos = (centavos) => moneda.format(centavos / 100);

export function leerEscenario() {
  const base = leerMonto(disponible.value);
  const meta = leerMonto(montoMeta.value);
  if (base === null || meta === null || meta <= 0) return null;
  const porcentaje = Number(caida.value);
  return {
    disponible: base, meta, porcentaje, plazo: plazo.value, ...simularCaida(base, meta, porcentaje),
  };
}

export function compararCaida(escenario, porcentaje) {
  return { ...escenario, porcentaje, ...simularCaida(escenario.disponible, escenario.meta, porcentaje) };
}

// Mayor caída entera que todavía deja cubierta la meta; -1 si ni sin caída alcanza.
export function margenDeMeta(escenario) {
  let margen = -1;
  for (let porcentaje = 0; porcentaje <= 100; porcentaje += 1) {
    if (simularCaida(escenario.disponible, escenario.meta, porcentaje).faltante) break;
    margen = porcentaje;
  }
  return margen;
}

export function describirSaldo({ faltante, sobrante }) {
  if (faltante) return `Te faltarían ${pesos(faltante)} para alcanzar tu meta.`;
  if (sobrante) return `Cubrirías tu meta y te sobrarían ${pesos(sobrante)}.`;
  return 'Te alcanzaría justo para cubrir tu meta.';
}

function actualizar() {
  indicador.value = `${caida.value} %`;
  caida.setAttribute('aria-valuetext', `${caida.value} por ciento`);
  barraCaida.value = Number(caida.value);
  const escenario = leerEscenario();
  const estado = !escenario ? 'incompleto' : escenario.faltante ? 'faltante' : escenario.sobrante ? 'sobrante' : 'justo';
  let balance = 'Completa los montos';
  if (estado === 'faltante') balance = `Faltan ${pesos(escenario.faltante)}`;
  if (estado === 'sobrante') balance = `Sobran ${pesos(escenario.sobrante)}`;
  if (estado === 'justo') balance = 'Meta cubierta';
  const textos = {
    saldo: escenario ? pesos(escenario.saldo) : '—',
    meta: escenario ? pesos(escenario.meta) : '—',
    pct: indicador.value,
    orb: caida.value === '0' ? indicador.value : `−${indicador.value}`,
    plazo: formulario.querySelector('input[name="plazo"]:checked').labels[0].textContent.trim(),
    balance,
  };
  for (const [dato, texto] of Object.entries(textos)) {
    for (const nodo of resumenes[dato]) nodo.textContent = texto;
  }
  for (const panel of resumenes.panel) panel.dataset.balance = estado;
  const avance = escenario ? Math.min(100, 100 * escenario.saldo / escenario.meta) : 0;
  for (const barra of resumenes.cobertura) {
    barra.value = avance;
    barra.setAttribute('aria-valuetext', `${Math.round(avance)} % de la meta cubierta`);
  }
  mensaje.textContent = escenario
    ? describirSaldo(escenario)
    : 'Ingresa ambos montos en pesos para ver el resultado.';
  return escenario;
}

export function ajustarCaida(porcentaje) {
  if (!Number.isInteger(porcentaje) || porcentaje < 0 || porcentaje > 100) return null;
  caida.value = porcentaje;
  return actualizar();
}

export function restablecerEscenario() {
  formulario.reset();
  actualizar();
}

export function describirCaida(escenario) {
  return `Con una caída del ${escenario.porcentaje} %, quedarían ${pesos(escenario.saldo)}. ${describirSaldo(escenario)}`;
}

export function iniciarSimulador(usarPlazo, alCambiar) {
  formulario.addEventListener('input', () => {
    actualizar();
    alCambiar();
  });
  formulario.addEventListener('submit', (evento) => {
    evento.preventDefault();
    const escenario = leerEscenario();
    if (escenario) usarPlazo(escenario);
  });
  actualizar();
}
