const plazos = ['corto', 'medio', 'largo'];
const umbrales = ['5', '10', '20'];
const caidas = [...umbrales, 'sin-umbral'];

export function evaluarPerfil({ plazo, caida, aclaracion }) {
  if (!plazos.includes(plazo)) return { paso: 'plazo' };
  if (!caidas.includes(caida)) return { paso: 'caida' };

  const necesitaAclaracion = plazo === 'largo' && caida === 'sin-umbral';
  if (necesitaAclaracion && !umbrales.includes(aclaracion)) {
    return { paso: 'aclaracion' };
  }

  const umbral = necesitaAclaracion ? aclaracion : caida;
  if (plazo === 'corto') {
    return { paso: 'resultado', perfil: 'conservador', motivos: ['plazo-corto'] };
  }
  if (umbral === '5') {
    return { paso: 'resultado', perfil: 'conservador', motivos: ['caida-5'] };
  }
  if (plazo === 'largo' && umbral === '20') {
    return { paso: 'resultado', perfil: 'propenso', motivos: ['plazo-largo', 'caida-20'] };
  }

  return {
    paso: 'resultado',
    perfil: 'moderado',
    motivos: plazo === 'medio' ? ['plazo-medio'] : ['plazo-largo', 'caida-10'],
  };
}
