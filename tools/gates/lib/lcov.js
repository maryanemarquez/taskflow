'use strict';

/** Soma LF (linhas) e LH (linhas cobertas) de um arquivo lcov e compara com o mínimo. */
function verificarLcov(texto, minimo) {
  const erros = [];
  if (!Number.isFinite(minimo) || minimo < 0 || minimo > 100) {
    return { erros: ['O mínimo de cobertura deve ser um número entre 0 e 100 (use --min).'], percentual: null };
  }
  let encontradas = 0;
  let cobertas = 0;
  for (const linha of texto.split('\n')) {
    const lf = /^LF:(\d+)\s*$/.exec(linha.trim());
    const lh = /^LH:(\d+)\s*$/.exec(linha.trim());
    if (lf) encontradas += Number(lf[1]);
    if (lh) cobertas += Number(lh[1]);
  }
  if (encontradas === 0) {
    return { erros: ['O arquivo lcov não tem linhas instrumentadas (LF zerado ou ausente).'], percentual: null };
  }
  const percentual = (cobertas / encontradas) * 100;
  if (percentual < minimo) {
    erros.push(`Cobertura de ${percentual.toFixed(2)}% abaixo do mínimo de ${minimo}% (${cobertas}/${encontradas} linhas).`);
  }
  return { erros, percentual };
}

module.exports = { verificarLcov };
