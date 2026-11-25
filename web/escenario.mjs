const maximoCentavos = 10_000_000_000;

export function leerMonto(texto) {
  if (typeof texto !== 'string' || !/^(?:\d{1,9}(?:\.\d{1,2})?|\.\d{1,2})$/.test(texto)) return null;
  const [entero, decimal = ''] = texto.split('.');
  const centavos = Number(entero) * 100 + Number(decimal.padEnd(2, '0'));
  return centavos <= maximoCentavos ? centavos : null;
}

export function simularCaida(disponible, meta, porcentaje) {
  if (!Number.isInteger(disponible) || disponible < 0 || disponible > maximoCentavos
      || !Number.isInteger(meta) || meta <= 0 || meta > maximoCentavos
      || !Number.isInteger(porcentaje) || porcentaje < 0 || porcentaje > 100) {
    throw new RangeError('Los montos o el porcentaje quedan fuera del intervalo admitido.');
  }

  const saldo = Math.floor((disponible * (100 - porcentaje) + 50) / 100);
  return {
    saldo,
    faltante: Math.max(0, meta - saldo),
    sobrante: Math.max(0, saldo - meta),
  };
}
