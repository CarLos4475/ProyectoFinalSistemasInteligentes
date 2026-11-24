import assert from 'node:assert/strict';
import { test } from 'node:test';
import { evaluarPerfil } from '../web/perfil.mjs';

const combinaciones = [
  ['corto', '5', 'conservador'],
  ['corto', '10', 'conservador'],
  ['corto', '20', 'conservador'],
  ['corto', 'sin-umbral', 'conservador'],
  ['medio', '5', 'conservador'],
  ['medio', '10', 'moderado'],
  ['medio', '20', 'moderado'],
  ['medio', 'sin-umbral', 'moderado'],
  ['largo', '5', 'conservador'],
  ['largo', '10', 'moderado'],
  ['largo', '20', 'propenso'],
  ['largo', 'sin-umbral', null],
];

for (const [plazo, caida, perfil] of combinaciones) {
  test(`plazo ${plazo} y caída ${caida}: ${perfil ?? 'pide aclaración'}`, () => {
    const resultado = evaluarPerfil({ plazo, caida });
    if (perfil) {
      assert.equal(resultado.paso, 'resultado');
      assert.equal(resultado.perfil, perfil);
      assert.ok(resultado.motivos.length > 0);
    } else {
      assert.equal(resultado.paso, 'aclaracion');
      assert.equal(resultado.perfil, undefined);
    }
  });
}

test('la aclaración resuelve cada umbral en plazo largo', () => {
  for (const [aclaracion, perfil] of [['5', 'conservador'], ['10', 'moderado'], ['20', 'propenso']]) {
    const resultado = evaluarPerfil({ plazo: 'largo', caida: 'sin-umbral', aclaracion });
    assert.equal(resultado.perfil, perfil);
  }
});

test('el motor espera una respuesta válida', () => {
  assert.deepEqual(evaluarPerfil({ caida: '5' }), { paso: 'plazo' });
  assert.deepEqual(evaluarPerfil({ plazo: 'medio', caida: '15' }), { paso: 'caida' });
  assert.deepEqual(
    evaluarPerfil({ plazo: 'largo', caida: 'sin-umbral', aclaracion: 'sin-umbral' }),
    { paso: 'aclaracion' },
  );
});

test('un plazo corto explica la decisión aunque la tolerancia sea alta', () => {
  const resultado = evaluarPerfil({ plazo: 'corto', caida: '20' });
  assert.equal(resultado.perfil, 'conservador');
  assert.ok(resultado.motivos.includes('plazo-corto'));
});

test('una aclaración anterior no se aplica al cambiar el plazo', () => {
  const resultado = evaluarPerfil({ plazo: 'medio', caida: 'sin-umbral', aclaracion: '5' });
  assert.equal(resultado.perfil, 'moderado');
});
