import assert from 'node:assert/strict';
import { test } from 'node:test';

import { crearInterpretador } from '../api/interpretar.mjs';
const endpoint = 'https://perfil.test/api/interpretar';

const solicitud = (body, options = {}) => new Request(endpoint, {
  method: 'POST',
  headers: { 'content-type': 'application/json', origin: 'https://perfil.test', ...options.headers },
  body: JSON.stringify(body),
});

const simular = (argumentos) => ({ name: 'simular_caida', arguments: JSON.stringify(argumentos) });
const proveedor = (...functions) => Response.json({
  choices: [{ message: { tool_calls: functions.map((funcion) => ({ type: 'function', function: funcion })) } }],
});

test('avisa si el proveedor está disponible sin revelar la clave', async () => {
  const handler = crearInterpretador({ clave: '', enviar: assert.fail });
  const response = await handler(new Request(endpoint));
  assert.deepEqual(await response.json(), { disponible: false });
  assert.equal((await handler(solicitud({ pregunta: '¿Qué pasa si baja 15 %?' }))).status, 503);
});

test('envía la pregunta mínima y devuelve la acción validada', async () => {
  const handler = crearInterpretador({
    clave: 'clave-ficticia',
    enviar: async (url, options) => {
      assert.equal(url, 'https://api.deepseek.com/chat/completions');
      assert.equal(options.headers.authorization, 'Bearer clave-ficticia');
      const payload = JSON.parse(options.body);
      assert.equal(payload.messages.at(-1).content, '¿Qué pasa si baja 15 %?');
      assert.deepEqual(payload.tools.map((tool) => tool.function.name), [
        'simular_caida', 'explicar_perfil', 'aclarar_pregunta',
      ]);
      return proveedor(simular({ porcentaje: 15 }));
    },
  });
  const respuesta = await handler(solicitud({ pregunta: '¿Qué pasa si baja 15 %?' }));
  assert.deepEqual(await respuesta.json(), { accion: 'simular_caida', porcentaje: 15 });
});

test('acepta la explicación del perfil como segunda acción', async () => {
  const handler = crearInterpretador({
    clave: 'ficticia', enviar: async () => proveedor({ name: 'explicar_perfil', arguments: '{}' }),
  });
  const response = await handler(solicitud({ pregunta: '¿Por qué salió ese resultado?' }));
  assert.deepEqual(await response.json(), { accion: 'explicar_perfil' });
});

test('permite pedir una aclaración de la pregunta del cuestionario', async () => {
  const handler = crearInterpretador({
    clave: 'ficticia', enviar: async () => proveedor({ name: 'aclarar_pregunta', arguments: '{}' }),
  });
  const response = await handler(solicitud({ pregunta: 'No entiendo.' }));
  assert.deepEqual(await response.json(), { accion: 'aclarar_pregunta' });
});

test('rechaza respuestas ambiguas o campos inventados por el modelo', async () => {
  for (const functions of [
    [simular({ porcentaje: 150 })],
    [simular({ porcentaje: 15, monto: 800 })],
    [{ name: 'simular_caida', arguments: '15' }],
    [simular({ porcentaje: 10 }), simular({ porcentaje: 20 })],
    [{ name: 'aclarar_pregunta', arguments: '{"pregunta":"p1"}' }],
    [{ name: 'invertir', arguments: '{}' }],
  ]) {
    const handler = crearInterpretador({ clave: 'ficticia', enviar: async () => proveedor(...functions) });
    const response = await handler(solicitud({ pregunta: '¿Qué tal 15 %?' }));
    assert.deepEqual(await response.json(), { accion: 'sin_coincidencia' });
  }
});

test('bloquea solicitudes con datos extra, orígenes externos y consultas largas', async () => {
  const handler = crearInterpretador({ clave: 'ficticia', enviar: assert.fail });
  assert.equal((await handler(solicitud({ pregunta: '¿Qué tal 20 %?', cuenta: 42 }))).status, 400);
  assert.equal((await handler(solicitud({ pregunta: 'a'.repeat(2000) }))).status, 413);
  assert.equal((await handler(solicitud({ pregunta: '¿Y si baja?' }, {
    headers: { origin: 'https://otro-sitio.test' },
  }))).status, 403);
});

test('limita las llamadas de una instancia y permite volver a consultar después', async () => {
  let tiempo = 0;
  let llamadas = 0;
  const handler = crearInterpretador({
    clave: 'ficticia', ahora: () => tiempo,
    enviar: async () => { llamadas += 1; return proveedor(simular({ porcentaje: 15 })); },
  });
  for (let i = 0; i < 12; i += 1) {
    assert.equal((await handler(solicitud({ pregunta: '¿Qué tal 15 %?' }))).status, 200);
  }
  assert.equal((await handler(solicitud({ pregunta: '¿Qué tal 15 %?' }))).status, 429);
  tiempo = 60_000;
  assert.equal((await handler(solicitud({ pregunta: '¿Qué tal 15 %?' }))).status, 200);
  assert.equal(llamadas, 13);
});
