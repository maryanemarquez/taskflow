'use strict';

const fs = require('node:fs');
const path = require('node:path');
const {
  ErroUso, lerArquivo, listarArquivos, dividirSecoes, acharPlaceholders, linhasDeTabela,
} = require('./util');
const { extrairCenarios } = require('./historia');

const EXTENSOES_TESTE = ['.java', '.kt', '.dart', '.js', '.ts', '.py', '.go', '.cs'];
const STATUS_VALIDOS = ['Rastreado e correto', 'Rastreado mas insuficiente', 'Não rastreado'];
const CLASSIFICACOES = ['Falha de código', 'Falha de história/critério mal definido'];
const REGEX_ID_QUALIFICADO = /\bHIST-\d{3}-[a-z0-9]+(?:-[a-z0-9]+)*\/C\d{2,}\b/g;
const REGEX_LINHA_VEREDITO = /^[^\p{L}\p{N}\n]*\**\s*Veredito\s*:/u;

/** Devolve { arquivo, nome } da versão mais recente da história na pasta. */
function versaoMaisRecente(pasta) {
  const versoes = fs.readdirSync(pasta)
    .map((nome) => ({ nome, m: /^historia(?:-v(\d+))?\.md$/.exec(nome) }))
    .filter((v) => v.m)
    .map((v) => ({ nome: v.nome, numero: v.m[1] ? Number(v.m[1]) : 1 }))
    .sort((a, b) => b.numero - a.numero);
  if (versoes.length === 0) throw new ErroUso(`Nenhum historia.md ou historia-vN.md em "${pasta}".`);
  return { nome: versoes[0].nome, arquivo: path.join(pasta, versoes[0].nome) };
}

function verificarVeredito(texto, erros) {
  const linhas = texto.split('\n').filter((l) => REGEX_LINHA_VEREDITO.test(l.trim()));
  if (linhas.length !== 1) {
    erros.push(`Veredito: deve existir exatamente uma linha "Veredito: LIBERADO" ou "Veredito: BLOQUEADO" (encontradas: ${linhas.length}).`);
    return null;
  }
  const m = /^Veredito: (LIBERADO|BLOQUEADO)$/.exec(linhas[0].trim());
  if (!m || linhas[0] !== linhas[0].trim()) {
    erros.push(`Veredito: formato inválido ("${linhas[0].trim()}"). Use uma linha simples, sem emoji, negrito ou texto antes: "Veredito: LIBERADO".`);
    return null;
  }
  return m[1];
}

function verificarDiagnostico(secoes, erros) {
  const secao = secoes.find((s) => s.nome === 'Diagnóstico de falha');
  const blocos = secao ? secao.corpo.split(/^### /m).slice(1) : [];
  if (blocos.length === 0) {
    erros.push('Diagnóstico de falha: com veredito BLOQUEADO, é obrigatório ao menos um bloco "### <item>".');
  }
  blocos.forEach((bloco) => {
    const nome = bloco.split('\n')[0].trim();
    const classificacao = /\*\*Classificação:\*\*\s*(.+)/.exec(bloco);
    if (!classificacao || !CLASSIFICACOES.includes(classificacao[1].trim())) {
      erros.push(`Diagnóstico de falha, bloco "${nome}": falta "**Classificação:**" com ${CLASSIFICACOES.join(' ou ')}.`);
    }
    const evidencia = /\*\*Evidência:\*\*\s*\n?([\s\S]*?)(?=\n\*\*|\n###|$)/.exec(bloco);
    if (!evidencia || evidencia[1].trim().length < 10) {
      erros.push(`Diagnóstico de falha, bloco "${nome}": falta "**Evidência:**" com citação real.`);
    }
  });
}

function verificarMatriz(secoes, idHistoria, idsCenarios, erros) {
  const secao = secoes.find((s) => s.nome.startsWith('Rastreabilidade'));
  if (!secao) {
    erros.push('Relatório: falta a seção "## Rastreabilidade cenário ↔ teste".');
    return;
  }
  const linhas = linhasDeTabela(secao.corpo);
  const porId = new Map();
  linhas.forEach((c) => porId.set(c[0], c[2]));
  for (const id of idsCenarios) {
    const qualificado = `${idHistoria}/${id}`;
    if (!porId.has(qualificado)) erros.push(`Matriz de rastreabilidade: falta o cenário ${qualificado}.`);
  }
  for (const [id, status] of porId) {
    if (!STATUS_VALIDOS.includes(status)) erros.push(`Matriz de rastreabilidade: status inválido em ${id} ("${status}").`);
    const local = id.startsWith(`${idHistoria}/`) ? id.slice(idHistoria.length + 1) : null;
    if (local === null || !idsCenarios.includes(local)) erros.push(`Matriz de rastreabilidade: ${id} não pertence à história ${idHistoria}.`);
  }
}

function verificarCabecalho(texto, nomeVersao, erros) {
  const avaliada = /^- História avaliada:[ \t]*(.*)$/m.exec(texto);
  if (!avaliada || avaliada[1].trim() !== nomeVersao) {
    erros.push(`Relatório: "- História avaliada:" deve ser "${nomeVersao}" (a versão mais recente).`);
  }
  if (!/^- Ciclo:[ \t]*\d+[ \t]*$/m.test(texto)) erros.push('Relatório: falta "- Ciclo: <número>".');
  const fonte = /^- Fonte da evidência:[ \t]*(\S.*)$/m.exec(texto);
  if (!fonte) erros.push('Relatório: falta "- Fonte da evidência:" preenchida.');
}

/** Coleta os IDs qualificados citados em arquivos de teste. Devolve Map(id -> [arquivos]). */
function coletarCitacoes(pastasDeTeste) {
  if (pastasDeTeste.length === 0) throw new ErroUso('Nenhuma pasta de teste informada (use --testes <pasta1,pasta2> ou --testes auto).');
  const citacoes = new Map();
  for (const pasta of pastasDeTeste) {
    for (const arquivo of listarArquivos(pasta, EXTENSOES_TESTE)) {
      const ids = lerArquivo(arquivo).match(REGEX_ID_QUALIFICADO) || [];
      for (const id of new Set(ids)) citacoes.set(id, [...(citacoes.get(id) || []), arquivo]);
    }
  }
  return citacoes;
}

/** Verificação do PR de entrega. `pastasDeTeste` já resolvidas. */
function verificarEntrega(pastaHistoria, pastasDeTeste) {
  const erros = [];
  const idHistoria = path.basename(path.resolve(pastaHistoria));
  if (!/^HIST-\d{3}-[a-z0-9]+(?:-[a-z0-9]+)*$/.test(idHistoria)) {
    throw new ErroUso(`A pasta "${idHistoria}" não segue o padrão HIST-XXX-<dominio>.`);
  }
  if (!fs.existsSync(pastaHistoria)) throw new ErroUso(`Pasta inexistente: "${pastaHistoria}".`);
  const versao = versaoMaisRecente(pastaHistoria);
  const idsCenarios = extrairCenarios(dividirSecoes(lerArquivo(versao.arquivo)).secoes
    .filter((s) => s.nome === 'Cenários Gherkin').map((s) => s.corpo).join('\n')).cenarios.map((c) => c.id);
  if (idsCenarios.length === 0) erros.push(`História ${versao.nome}: nenhum cenário [Cxx] encontrado.`);

  const caminhoRelatorio = path.join(pastaHistoria, 'relatorio-teste.md');
  if (!fs.existsSync(caminhoRelatorio)) {
    erros.push('Relatório ausente: crie relatorio-teste.md na pasta da história (agente-testes).');
  } else {
    const texto = lerArquivo(caminhoRelatorio);
    const { secoes } = dividirSecoes(texto);
    verificarCabecalho(texto, versao.nome, erros);
    acharPlaceholders(texto).forEach((p) => erros.push(`Relatório, linha ${p.linha}: marcador de modelo não preenchido ("${p.trecho}").`));
    verificarMatriz(secoes, idHistoria, idsCenarios, erros);
    const veredito = verificarVeredito(texto, erros);
    if (veredito === 'BLOQUEADO') {
      verificarDiagnostico(secoes, erros);
      erros.push('Veredito BLOQUEADO: o PR de entrega não pode ser mesclado.');
    }
    if (veredito === 'LIBERADO') {
      const secao = secoes.find((s) => s.nome.startsWith('Rastreabilidade'));
      linhasDeTabela(secao ? secao.corpo : '').filter((c) => c[2] !== 'Rastreado e correto').forEach((c) => {
        erros.push(`Veredito LIBERADO é incoerente: ${c[0]} está como "${c[2]}".`);
      });
    }
  }

  const citacoes = coletarCitacoes(pastasDeTeste);
  for (const id of idsCenarios) {
    if (!citacoes.has(`${idHistoria}/${id}`)) erros.push(`Cenário ${idHistoria}/${id} não é citado por nenhum teste.`);
  }
  for (const [id, arquivos] of citacoes) {
    if (id.startsWith(`${idHistoria}/`) && !idsCenarios.includes(id.slice(idHistoria.length + 1))) {
      erros.push(`Teste cita ${id}, que não existe na história (${arquivos[0]}).`);
    }
  }
  return erros;
}

module.exports = { verificarEntrega, versaoMaisRecente, coletarCitacoes };
