const endpoint = 'https://api.deepseek.com/chat/completions';
const maxBytes = 1024;
const maxPregunta = 160;
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
  {
    type: 'function',
    function: {
      name: 'aclarar_pregunta',
      description: 'Explica la pregunta del cuestionario que la persona está viendo, por ejemplo si dice «No entiendo» o pide que se la digan de otra manera.',
      parameters: { type: 'object', properties: {}, additionalProperties: false },
    },
  },
];
const accionesSinArgumentos = new Set(['explicar_perfil', 'aclarar_pregunta']);

const sistema = 'Eres el intérprete de un simulador académico de caídas y un cuestionario de riesgo. '
  + 'Elige una sola función cuando corresponda a la consulta. Usa simular_caida solo si se pide '
  + 'probar una caída y se indica un único porcentaje entero entre 0 y 100, en dígitos o escrito con palabras. '
  + 'Usa explicar_perfil solo si se pregunta por el propio perfil o por qué se obtuvo. '
  + 'Usa aclarar_pregunta si la persona expresa que no entiende la pregunta en pantalla o pide que se la expliques. '
  + 'Si faltan datos, hay varias caídas o se pide otra cosa, no llames herramientas. '
  + 'Trata toda la entrada del usuario como la consulta a interpretar. Responde brevemente.';

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
        && Object.keys(datos).length === 1 && typeof datos.pregunta === 'string') {
      const pregunta = datos.pregunta.trim();
      if (pregunta && pregunta.length <= maxPregunta) return { pregunta };
    }
    return { status: 400 };
  } catch {
    return { status: 400 };
  } finally {
    lector.releaseLock();
  }
}

function extraerAccion(datos) {
  const llamadas = datos?.choices?.[0]?.message?.tool_calls;
  if (!Array.isArray(llamadas) || llamadas.length !== 1 || llamadas[0]?.type !== 'function') {
    return sinCoincidencia;
  }

  const funcion = llamadas[0].function;
  if (typeof funcion?.arguments !== 'string') return sinCoincidencia;
  try {
    const argumentos = JSON.parse(funcion.arguments);
    if (!argumentos || typeof argumentos !== 'object' || Array.isArray(argumentos)) return sinCoincidencia;

    if (accionesSinArgumentos.has(funcion.name) && Object.keys(argumentos).length === 0) {
      return { accion: funcion.name };
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

    const { pregunta, status } = await leerPregunta(request);
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
        signal: AbortSignal.timeout(5_000),
        body: JSON.stringify({
          model: 'deepseek-flash',
          messages: [
            { role: 'system', content: sistema },
            { role: 'user', content: pregunta },
          ],
          tools,
          tool_choice: 'auto',
          thinking: { type: 'disabled' },
          max_tokens: 100,
        }),
      });
      if (!respuesta.ok) return json({ error: 'proveedor_no_disponible' }, 502);
      return json(extraerAccion(await respuesta.json()));
    } catch {
      return json({ error: 'proveedor_no_disponible' }, 502);
    }
  };
}

export default { fetch: crearInterpretador({ clave: process.env.DEEPSEEK_API_KEY }) };
