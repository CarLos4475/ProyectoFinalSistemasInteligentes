import { aclaracionCaida, preguntas } from '../web/cuestionario.mjs';

const endpoint = 'https://api.deepseek.com/chat/completions';
const maxBytes = 4096;
const maxPregunta = 480;
const maxRespuesta = 1600;
const catalogo = { ...preguntas, aclaracion: aclaracionCaida };
const sinCoincidencia = { accion: 'sin_coincidencia' };
const tools = [
  {
    type: 'function',
    function: {
      name: 'simular_caida',
      description: 'Simula una caída hipotética de un solo porcentaje explícito para la meta de la persona.',
      parameters: {
        type: 'object',
        properties: { porcentaje: { type: 'integer', minimum: 0, maximum: 100 } },
        required: ['porcentaje'],
        additionalProperties: false,
      },
    },
  },
  {
    type: 'function',
    function: {
      name: 'explicar_perfil',
      description: 'Muestra las reglas y las respuestas que explican el perfil de riesgo de la persona.',
      parameters: { type: 'object', properties: {}, additionalProperties: false },
    },
  },
];

const sistema = 'Eres el asistente de un simulador académico de caídas y un cuestionario de perfil de inversión. '
  + 'Responde directamente en español claro y texto plano, en dos a cuatro frases. '
  + 'Si la persona plantea un caso, usa solo los datos que dio y evita añadir casos hipotéticos. '
  + 'Si la persona dice que no entiende, explica en palabras sencillas la pregunta que ve. '
  + 'Si pregunta por una opción concreta, explica esa opción y usa el orden en que aparecen. '
  + 'Si describe una situación y pregunta qué opción encaja, relaciónala con las opciones visibles. '
  + 'Usa las respuestas registradas cuando ayuden a contestar la duda. Distingue lo que la persona ya marcó de las opciones que todavía puede elegir. '
  + 'Si te pregunta por una respuesta que no tienes registrada, dilo. No deduzcas su perfil a partir de un cuestionario incompleto. '
  + 'Puedes explicar conceptos del cuestionario y del simulador. Mantén el enfoque educativo y evita recomendar inversiones concretas o prometer rendimientos. '
  + 'Elige una sola función cuando corresponda. Usa simular_caida solo si se pide '
  + 'probar una caída y se indica un único porcentaje entero entre 0 y 100, en dígitos o escrito con palabras. '
  + 'Usa explicar_perfil solo si se pregunta por el propio perfil o por qué se obtuvo. '
  + 'Para las demás dudas, responde con texto. Si algo es ambiguo, pide el dato necesario. '
  + 'Si la consulta está fuera del tema, indica brevemente en qué puedes ayudar.';

function contextoDelPaso(paso) {
  if (paso === 'resultado') return '\nLa persona está viendo el resultado de su perfil.';
  const activa = catalogo[paso];
  if (!activa) return '';
  const opciones = Object.values(activa.opciones).map((opcion, i) => `${i + 1}. ${opcion}`);
  return `\nPregunta que ve la persona: ${activa.texto}\nOpciones en pantalla:\n${opciones.join('\n')}\nGuía del cuestionario: ${activa.ayuda}`;
}

function contextoDeRespuestas(respuestas) {
  const elegidas = Object.entries(catalogo)
    .filter(([paso]) => Object.hasOwn(respuestas, paso))
    .map(([paso, pregunta]) => `- ${pregunta.tema}: ${pregunta.opciones[respuestas[paso]]}`);
  return elegidas.length
    ? `\nRespuestas registradas hasta ahora:\n${elegidas.join('\n')}`
    : '\nTodavía no hay respuestas registradas en el contexto.';
}

function respuestasValidas(respuestas) {
  if (!respuestas || typeof respuestas !== 'object' || Array.isArray(respuestas)) return false;
  return Object.entries(respuestas).every(([paso, opcion]) => Object.hasOwn(catalogo, paso)
    && typeof opcion === 'string' && Object.hasOwn(catalogo[paso].opciones, opcion))
    && (!Object.hasOwn(respuestas, 'aclaracion') || respuestas.p9 === 'D');
}

function json(data, status = 200) {
  return Response.json(data, { status, headers: { 'Cache-Control': 'no-store' } });
}

async function leerPregunta(request) {
  if (request.headers.get('content-type')?.split(';')[0].trim() !== 'application/json') {
    return { status: 415 };
  }
  if (!request.body) return { status: 400 };

  const lector = request.body.getReader();
  const decodificador = new TextDecoder('utf-8', { fatal: true });
  let bytes = 0;
  let texto = '';
  try {
    for (;;) {
      const { done, value } = await lector.read();
      if (done) break;
      bytes += value.byteLength;
      if (bytes > maxBytes) {
        await lector.cancel();
        return { status: 413 };
      }
      texto += decodificador.decode(value, { stream: true });
    }
    const datos = JSON.parse(texto + decodificador.decode());
    if (datos && typeof datos === 'object' && !Array.isArray(datos)
        && Object.keys(datos).every((clave) => ['pregunta', 'paso', 'respuestas'].includes(clave))
        && typeof datos.pregunta === 'string') {
      const { paso, respuestas = {} } = datos;
      const pregunta = datos.pregunta.trim();
      const pasoValido = paso === undefined || paso === 'resultado'
        || (typeof paso === 'string' && Object.hasOwn(catalogo, paso));
      if (pregunta && pregunta.length <= maxPregunta && pasoValido && respuestasValidas(respuestas)) {
        return { pregunta, paso, respuestas };
      }
    }
    return { status: 400 };
  } catch {
    return { status: 400 };
  } finally {
    lector.releaseLock();
  }
}

function extraerRespuesta(datos) {
  const mensaje = datos?.choices?.[0]?.message;
  const llamadas = mensaje?.tool_calls;
  if (llamadas == null || (Array.isArray(llamadas) && llamadas.length === 0)) {
    const texto = typeof mensaje?.content === 'string' ? mensaje.content.trim() : '';
    return texto ? { accion: 'responder', texto: texto.slice(0, maxRespuesta) } : sinCoincidencia;
  }
  if (!Array.isArray(llamadas) || llamadas.length !== 1 || llamadas[0]?.type !== 'function') {
    return sinCoincidencia;
  }

  const funcion = llamadas[0].function;
  if (typeof funcion?.arguments !== 'string') return sinCoincidencia;
  try {
    const argumentos = JSON.parse(funcion.arguments);
    if (!argumentos || typeof argumentos !== 'object' || Array.isArray(argumentos)) return sinCoincidencia;

    if (funcion.name === 'explicar_perfil' && Object.keys(argumentos).length === 0) {
      return { accion: 'explicar_perfil' };
    }
    const { porcentaje } = argumentos;
    if (funcion.name === 'simular_caida' && Object.keys(argumentos).length === 1
        && Number.isInteger(porcentaje) && porcentaje >= 0 && porcentaje <= 100) {
      return { accion: 'simular_caida', porcentaje };
    }
  } catch {
    return sinCoincidencia;
  }
  return sinCoincidencia;
}

export function crearInterpretador({ clave, enviar = fetch, ahora = Date.now } = {}) {
  const disponible = Boolean(clave?.trim());
  let ventana = 0;
  let usos = 0;

  return async (request) => {
    if (request.method === 'GET') return json({ disponible });
    if (request.method !== 'POST') {
      return new Response(null, { status: 405, headers: { Allow: 'GET, POST' } });
    }
    if (!disponible) return json({ error: 'sin_proveedor' }, 503);
    if (request.headers.get('origin') !== new URL(request.url).origin) {
      return json({ error: 'origen_invalido' }, 403);
    }

    const { pregunta, paso, respuestas, status } = await leerPregunta(request);
    if (!pregunta) return json({ error: 'consulta_invalida' }, status);

    const minuto = Math.floor(ahora() / 60_000);
    if (ventana !== minuto) {
      ventana = minuto;
      usos = 0;
    }
    if (usos >= 12) return json({ error: 'limite_de_consultas' }, 429);
    usos += 1;

    try {
      const respuesta = await enviar(endpoint, {
        method: 'POST',
        headers: { authorization: `Bearer ${clave.trim()}`, 'content-type': 'application/json' },
        signal: AbortSignal.timeout(8_000),
        body: JSON.stringify({
          model: 'deepseek-flash',
          messages: [
            { role: 'system', content: sistema + contextoDelPaso(paso) + contextoDeRespuestas(respuestas) },
            { role: 'user', content: pregunta },
          ],
          tools,
          tool_choice: 'auto',
          thinking: { type: 'disabled' },
          max_tokens: 220,
        }),
      });
      if (!respuesta.ok) return json({ error: 'proveedor_no_disponible' }, 502);
      return json(extraerRespuesta(await respuesta.json()));
    } catch {
      return json({ error: 'proveedor_no_disponible' }, 502);
    }
  };
}

export default { fetch: crearInterpretador({ clave: process.env.DEEPSEEK_API_KEY }) };
