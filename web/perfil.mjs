import { aclaracionCaida, preguntas } from './cuestionario.mjs';

const perfiles = ['conservador', 'moderado', 'propenso'];
const reaccion = { A: 0, B: 0, C: 1, D: 2 };
const caida = { A: 0, B: 1, C: 2 };
const preferencia = { A: 0, B: 1, C: 1, D: 2 };

function limitePorObjetivoYPlazo({ p1, p4 }) {
  const conservador = [];
  if (p1 === 'A') conservador.push('liquidez');
  if (p4 === 'A') conservador.push('plazo-corto');
  if (conservador.length) return { nivel: 0, razones: conservador };

  const moderado = [];
  if (p1 === 'B') moderado.push('ingresos');
  if (p4 === 'B') moderado.push('plazo-medio');
  if (moderado.length) return { nivel: 1, razones: moderado };

  return { nivel: 2, razones: ['objetivo-y-plazo'] };
}

export function evaluarPerfil(respuestas) {
  for (const [paso, { opciones }] of Object.entries(preguntas)) {
    if (!Object.hasOwn(opciones, respuestas[paso])) return { paso };
  }

  const limite = limitePorObjetivoYPlazo(respuestas);
  const montoCaida = respuestas.p9 === 'D' ? respuestas.aclaracion : respuestas.p9;
  const caidaConocida = Object.hasOwn(aclaracionCaida.opciones, montoCaida);
  const senales = {
    p8: reaccion[respuestas.p8],
    p9: caidaConocida ? caida[montoCaida] : null,
    p10: preferencia[respuestas.p10],
  };
  const opcionesCaida = caidaConocida ? [senales.p9] : Object.values(caida);
  const niveles = opcionesCaida.map((nivelCaida) =>
    [senales.p8, nivelCaida, senales.p10].sort((a, b) => a - b)[1],
  );
  const posibles = new Set(niveles.map((nivel) => Math.min(limite.nivel, nivel)));
  if (posibles.size > 1) return { paso: 'aclaracion' };

  return {
    paso: 'resultado',
    perfil: perfiles[Math.min(limite.nivel, niveles[0])],
    limite: { nivel: perfiles[limite.nivel], razones: limite.razones },
    tolerancia: {
      nivel: new Set(niveles).size === 1 ? perfiles[niveles[0]] : null,
      senales: {
        p8: perfiles[senales.p8],
        p9: caidaConocida ? perfiles[senales.p9] : null,
        p10: perfiles[senales.p10],
      },
    },
  };
}
