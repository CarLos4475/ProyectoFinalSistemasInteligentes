const servicio = new URL('./api/interpretar', document.baseURI);

export async function disponibleDeepSeek() {
  if (location.hostname.endsWith('.github.io')) return false;
  try {
    const respuesta = await fetch(servicio, { signal: AbortSignal.timeout(3500) });
    return respuesta.ok && (await respuesta.json()).disponible === true;
  } catch {
    return false;
  }
}

export async function interpretarDeepSeek(pregunta) {
  try {
    const respuesta = await fetch(servicio, {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ pregunta }),
      signal: AbortSignal.timeout(6500),
    });
    return respuesta.ok ? await respuesta.json() : null;
  } catch {
    return null;
  }
}
