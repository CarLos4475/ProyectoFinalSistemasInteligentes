import assert from 'node:assert/strict';
import { test } from 'node:test';
import { evaluarPerfil } from '../web/perfil.mjs';

const base = {
  p1: 'C', p2: 'B', p3: 'A', p4: 'C', p5: 'AyB', p6: 'A', p7: 'A',
  p8: 'D', p9: 'C', p10: 'D', p11: 'A', p12: 'B', p13: 'A', p14: 'B',
};

const evaluar = (cambios = {}) => evaluarPerfil({ ...base, ...cambios });

test('pide las preguntas en orden y valida las opciones', () => {
  const respuestas = {};
  for (const [id, respuesta] of Object.entries(base)) {
    assert.deepEqual(evaluarPerfil(respuestas), { paso: id });
    respuestas[id] = respuesta;
  }
  assert.deepEqual(evaluar({ p11: 'Z' }), { paso: 'p11' });
  assert.deepEqual(evaluar({ p5: 'toString' }), { paso: 'p5' });
});

test('una tolerancia alta no supera el nivel que permiten el objetivo y el plazo', () => {
  const casos = [
    [{ p4: 'A' }, 'conservador', ['plazo-corto']],
    [{ p1: 'A' }, 'conservador', ['liquidez']],
    [{ p4: 'B' }, 'moderado', ['plazo-medio']],
    [{ p1: 'B' }, 'moderado', ['ingresos']],
    [{}, 'propenso', ['objetivo-y-plazo']],
  ];
  for (const [cambios, perfil, razones] of casos) {
    const resultado = evaluar(cambios);
    assert.equal(resultado.paso, 'resultado');
    assert.equal(resultado.perfil, perfil);
    assert.equal(resultado.tolerancia.nivel, 'propenso');
    assert.deepEqual(resultado.limite.razones, razones);
  }
});

test('combina las tres señales y asigna el nivel central', () => {
  const casos = [
    [{ p8: 'A', p9: 'A', p10: 'D' }, 'conservador'],
    [{ p8: 'B', p9: 'B', p10: 'D' }, 'moderado'],
    [{ p8: 'C', p9: 'C', p10: 'D' }, 'propenso'],
    [{ p8: 'D', p9: 'B', p10: 'A' }, 'moderado'],
    [{ p8: 'C', p9: 'A', p10: 'B' }, 'moderado'],
    [{ p8: 'D', p9: 'A', p10: 'A' }, 'conservador'],
  ];
  for (const [cambios, perfil] of casos) {
    const resultado = evaluar(cambios);
    assert.equal(resultado.perfil, perfil);
    assert.equal(resultado.tolerancia.nivel, perfil);
  }
});

test('aclara «No me inquieto» si el perfil puede cambiar', () => {
  const cambios = { p8: 'A', p9: 'D', p10: 'D' };
  for (const aclaracion of [undefined, 'D', 'Z']) {
    assert.deepEqual(evaluar({ ...cambios, aclaracion }), { paso: 'aclaracion' });
  }
  for (const [aclaracion, perfil] of [['A', 'conservador'], ['B', 'moderado'], ['C', 'propenso']]) {
    const resultado = evaluar({ ...cambios, aclaracion });
    assert.equal(resultado.perfil, perfil);
    assert.equal(resultado.tolerancia.senales.p9, perfil);
  }
});

test('el perfil puede resolverse con una caída sin precisar', () => {
  const porPlazo = evaluar({ p4: 'A', p8: 'C', p9: 'D' });
  assert.equal(porPlazo.perfil, 'conservador');
  assert.equal(porPlazo.tolerancia.nivel, null);
  assert.equal(porPlazo.tolerancia.senales.p9, null);

  const porCoincidencia = evaluar({ p9: 'D' });
  assert.equal(porCoincidencia.perfil, 'propenso');
  assert.equal(porCoincidencia.tolerancia.nivel, 'propenso');
});

test('la autoevaluación y la moneda no alteran el nivel de riesgo', () => {
  const resultado = evaluar({ p8: 'B', p9: 'A', p10: 'A' });
  assert.equal(resultado.perfil, 'conservador');
  assert.deepEqual(evaluar({ p8: 'B', p9: 'A', p10: 'A', p11: 'D', p12: 'A' }), resultado);
});

test('una aclaración anterior se ignora si la P9 ya tiene un umbral concreto', () => {
  const resultado = evaluar({ p8: 'A', p9: 'B', aclaracion: 'C' });
  assert.equal(resultado.perfil, 'moderado');
  assert.equal(resultado.tolerancia.senales.p9, 'moderado');
});
