'use strict';

const fs = require('node:fs');
const path = require('node:path');
const { execFileSync } = require('node:child_process');
const { ErroUso, lerArquivo, linhasDeTabela } = require('./util');

function limparCelula(celula) {
  return celula.replace(/`/g, '').trim();
}

/** Lê a tabela "Módulos" do AGENTS.md. Ignora linhas ainda com marcadores de modelo (<...>). */
function lerModulos(textoAgents) {
  const linhas = textoAgents.split('\n');
  const inicio = linhas.findIndex((l) => /^\|\s*`?Módulo`?\s*\|/i.test(l.trim()));
  if (inicio === -1) return [];
  const bloco = [];
  for (let i = inicio; i < linhas.length && linhas[i].trim().startsWith('|'); i += 1) bloco.push(linhas[i]);
  return linhasDeTabela(bloco.join('\n'))
    .map((c) => ({ modulo: limparCelula(c[0]), pasta: limparCelula(c[1]).replace(/\/+$/, ''), skill: limparCelula(c[2]) }))
    .filter((m) => m.modulo && m.pasta && !/[<>]/.test(`${m.modulo}${m.pasta}${m.skill}`));
}

/** Sobe a partir de `inicio` até achar um AGENTS.md. Devolve o caminho ou null. */
function localizarAgents(inicio) {
  let atual = path.resolve(inicio);
  if (fs.existsSync(atual) && fs.statSync(atual).isFile()) atual = path.dirname(atual);
  for (;;) {
    const candidato = path.join(atual, 'AGENTS.md');
    if (fs.existsSync(candidato)) return candidato;
    const pai = path.dirname(atual);
    if (pai === atual) return null;
    atual = pai;
  }
}

/** Lê "Cobertura mínima de testes: `80%`" do AGENTS.md. Devolve o número ou null. */
function lerCoberturaMinima(textoAgents) {
  const m = /Cobertura mínima de testes:\s*`?(\d{1,3}(?:[.,]\d+)?)\s*%`?/i.exec(textoAgents);
  return m ? Number(m[1].replace(',', '.')) : null;
}

/** Lê o valor entre crases de uma linha "- <rótulo>: `valor`" do AGENTS.md. Devolve null se não existir. */
function lerValor(textoAgents, rotulo) {
  const escapado = rotulo.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  const m = new RegExp(`^-\\s*${escapado}:\\s*\`([^\`\\n]+)\``, 'm').exec(textoAgents);
  return m ? m[1].trim() : null;
}

const CONFIGURACOES = {
  java: { rotulo: 'Versão do Java', padrao: '21' },
  flutter: { rotulo: 'Versão do Flutter', padrao: 'stable' },
};
const CHAVES_CONFIG = ['cobertura-minima', ...Object.keys(CONFIGURACOES)];

/** Valor de uma chave do modo "config", como texto. Lança ErroUso se a chave exigida não existir. */
function lerConfiguracao(textoAgents, chave) {
  if (chave === 'cobertura-minima') {
    const minimo = lerCoberturaMinima(textoAgents);
    if (minimo === null) {
      throw new ErroUso('config cobertura-minima exige AGENTS.md com "Cobertura mínima de testes: `NN%`".');
    }
    return String(minimo);
  }
  const { rotulo, padrao } = CONFIGURACOES[chave];
  const valor = lerValor(textoAgents, rotulo);
  return valor === null ? padrao : valor;
}

/** Garante que a tabela "Módulos" tem linhas preenchidas e que cada skill citada existe em ai/skills. */
function validarModulos(raiz, modulos) {
  if (modulos.length === 0) {
    throw new ErroUso('A tabela "Módulos" do AGENTS.md não tem nenhum módulo preenchido.');
  }
  const ausentes = modulos.filter((m) => !fs.existsSync(path.join(raiz, 'ai', 'skills', m.skill, 'SKILL.md')));
  if (ausentes.length > 0) {
    const linhas = ausentes.map((m) => `  - módulo "${m.modulo}": skill "${m.skill}" sem ai/skills/${m.skill}/SKILL.md`);
    throw new ErroUso(`Skill inexistente na tabela "Módulos" do AGENTS.md:\n${linhas.join('\n')}`);
  }
}

function modulosDoProjeto(inicio) {
  const agents = localizarAgents(inicio);
  if (!agents) return { agents: null, raiz: null, modulos: [] };
  return { agents, raiz: path.dirname(agents), modulos: lerModulos(lerArquivo(agents)) };
}

/** Pastas de teste conhecidas dos módulos (src/test para Java, test para Dart). */
function pastasDeTeste(raiz, modulos) {
  const pastas = [];
  for (const modulo of modulos) {
    for (const sub of ['src/test', 'test']) {
      const caminho = path.join(raiz, modulo.pasta, sub);
      if (fs.existsSync(caminho)) pastas.push(caminho);
    }
  }
  return pastas;
}

function arquivosAlterados(base) {
  try {
    return execFileSync('git', ['diff', '--name-only', `${base}...HEAD`], { encoding: 'utf8' })
      .split('\n').map((l) => l.trim()).filter(Boolean);
  } catch (erro) {
    throw new ErroUso(`Não foi possível comparar com "${base}" via git: ${erro.message.split('\n')[0]}`);
  }
}

/** Pastas dos módulos que usam a skill de stack dada, opcionalmente só as alteradas desde `base`. */
function pastasDaStack(inicio, skill, base) {
  const { raiz, modulos } = modulosDoProjeto(inicio);
  let pastas = modulos.filter((m) => m.skill === skill).map((m) => m.pasta);
  if (base && pastas.length > 0) {
    const alterados = arquivosAlterados(base);
    pastas = pastas.filter((pasta) => alterados.some((a) => a === pasta || a.startsWith(`${pasta}/`)));
  }
  return { raiz, pastas };
}

module.exports = {
  CHAVES_CONFIG, lerConfiguracao, lerCoberturaMinima, lerModulos, lerValor, localizarAgents, modulosDoProjeto,
  pastasDeTeste, pastasDaStack, validarModulos,
};
