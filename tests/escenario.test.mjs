import assert from 'node:assert/strict';
import { test } from 'node:test';

import * as escenario from '../web/escenario.mjs';

test('calcula el saldo y el faltante en centavos', () => {
  assert.deepEqual(escenario.simularCaida(1_000_000, 900_000, 15), {
    saldo: 850_000, faltante: 50_000, sobrante: 0,
  });
  assert.deepEqual(escenario.simularCaida(1_000_000, 900_000, 10), {
    saldo: 900_000, faltante: 0, sobrante: 0,
  });
  assert.deepEqual(escenario.simularCaida(1_000_000, 900_000, 0), {
    saldo: 1_000_000, faltante: 0, sobrante: 100_000,
  });
});

test('redondea a centavos y contempla una caída total', () => {
  assert.equal(escenario.simularCaida(101, 100, 50).saldo, 51);
  assert.equal(escenario.simularCaida(99, 100, 100).faltante, 100);
});

test('convierte dinero decimal y rechaza valores inválidos', () => {
  assert.equal(escenario.leerMonto('10000.25'), 1_000_025);
  assert.equal(escenario.leerMonto('0'), 0);
  for (const valor of ['', '-1', '1e3', '200000000', '1.005']) {
    assert.equal(escenario.leerMonto(valor), null);
  }
  for (const caida of [-1, 101, 1.5, '15']) {
    assert.throws(() => escenario.simularCaida(200, 100, caida), RangeError);
  }
});
