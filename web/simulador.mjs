import { leerMonto, simularCaida } from './escenario.mjs';

const formulario = document.querySelector('#escenario');
const disponible = formulario.querySelector('#disponible');
const montoMeta = formulario.querySelector('#monto-meta');
const plazo = formulario.querySelector('#plazo-meta');
const caida = formulario.querySelector('#caida');
const indicador = formulario.querySelector('#caida-valor');
const saldo = document.querySelector('#saldo-caida');
const mensaje = document.querySelector('#resultado-caida');

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
    porcentaje, plazo: plazo.value, ...simularCaida(base, meta, porcentaje),
  };
}

export function describirSaldo({ faltante, sobrante }) {
  if (faltante) return `Te faltarían ${pesos(faltante)} para alcanzar tu meta.`;
  if (sobrante) return `Cubrirías tu meta y te sobrarían ${pesos(sobrante)}.`;
  return 'Te alcanzaría justo para cubrir tu meta.';
}

function actualizar() {
  indicador.value = `${caida.value} %`;
  caida.setAttribute('aria-valuetext', `${caida.value} por ciento`);
  const escenario = leerEscenario();
  saldo.textContent = escenario ? pesos(escenario.saldo) : '—';
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
    if (escenario) usarPlazo(escenario.plazo);
  });
  actualizar();
}
