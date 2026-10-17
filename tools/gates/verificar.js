#!/usr/bin/env node
'use strict';

/**
 * Verificações do framework SDD. Sem dependências externas; requer Node.js 18 ou superior.
 * Códigos de saída: 0 = ok, 1 = violação encontrada, 2 = uso incorreto ou erro de ambiente.
 * Qualquer falha inesperada termina com código 2 (nunca aprova por engano).
 */

const path = require('node:path');
const { ErroUso, lerArquivo } = require('./lib/util');
const { verificarHistoria } = require('./lib/historia');
const { verificarEntrega } = require('./lib/entrega');
const { verificarLcov } = require('./lib/lcov');
const { verificarQualidade } = require('./lib/qualidade');
const {
  modulosDoProjeto, pastasDeTeste, pastasDaStack, localizarAgents, lerCoberturaMinima,
} = require('./lib/modulos');

const AJUDA = `Uso:
  node tools/gates/verificar.js historia <historia.md>
  node tools/gates/verificar.js entrega <pasta-da-historia> --testes <pasta1,pasta2 | auto>
  node tools/gates/verificar.js lcov <lcov.info> --min <0-100 | auto>
  node tools/gates/verificar.js qualidade <pasta-ou-arquivo>...
  node tools/gates/verificar.js modulos <skill-de-stack> [--base <ref-git>]

Códigos de saída: 0 = ok, 1 = violação, 2 = erro de uso ou de ambiente.`;

function lerOpcoes(argumentos) {
  const posicionais = [];
  const opcoes = {};
  for (let i = 0; i < argumentos.length; i += 1) {
    if (argumentos[i].startsWith('--')) {
      const valor = argumentos[i + 1];
      if (valor === undefined || valor.startsWith('--')) throw new ErroUso(`A opção ${argumentos[i]} exige um valor.`);
      opcoes[argumentos[i].slice(2)] = valor;
      i += 1;
    } else {
      posicionais.push(argumentos[i]);
    }
  }
  return { posicionais, opcoes };
}

function exigir(posicionais, quantidade, modo) {
  if (posicionais.length < quantidade) throw new ErroUso(`Argumentos insuficientes para "${modo}".\n\n${AJUDA}`);
}

function relatar(modo, alvo, erros) {
  if (erros.length === 0) {
    console.log(`OK [${modo}] ${alvo}`);
    return 0;
  }
  erros.forEach((e) => console.error(`ERRO [${modo}] ${alvo}: ${e}`));
  console.error(`\n${erros.length} problema(s) encontrado(s) em ${alvo}.`);
  return 1;
}

function executarHistoria({ posicionais }) {
  exigir(posicionais, 1, 'historia');
  const arquivo = posicionais[0];
  const { modulos } = modulosDoProjeto(path.dirname(path.resolve(arquivo)));
  const nomes = modulos.map((m) => m.modulo);
  return relatar('historia', arquivo, verificarHistoria(lerArquivo(arquivo), { caminho: arquivo, modulos: nomes }));
}

function resolverPastasDeTeste(valor, pastaHistoria) {
  if (valor !== 'auto') return valor.split(',').map((p) => p.trim()).filter(Boolean);
  const { raiz, modulos } = modulosDoProjeto(path.resolve(pastaHistoria));
  if (!raiz) throw new ErroUso('--testes auto exige um AGENTS.md acima da pasta da história.');
  const pastas = pastasDeTeste(raiz, modulos);
  if (pastas.length === 0) throw new ErroUso('--testes auto não achou src/test nem test nos módulos do AGENTS.md.');
  return pastas;
}

function executarEntrega({ posicionais, opcoes }) {
  exigir(posicionais, 1, 'entrega');
  if (!opcoes.testes) throw new ErroUso('A verificação "entrega" exige --testes <pastas> ou --testes auto.');
  const pasta = posicionais[0];
  const erros = verificarEntrega(pasta, resolverPastasDeTeste(opcoes.testes, pasta));
  return relatar('entrega', pasta, erros);
}

function minimoDoAgents() {
  const agents = localizarAgents(process.cwd());
  const minimo = agents ? lerCoberturaMinima(lerArquivo(agents)) : null;
  if (minimo === null) throw new ErroUso('--min auto exige AGENTS.md com "Cobertura mínima de testes: `NN%`".');
  return minimo;
}

function executarLcov({ posicionais, opcoes }) {
  exigir(posicionais, 1, 'lcov');
  if (opcoes.min === undefined) throw new ErroUso('A verificação "lcov" exige --min <0-100 | auto>.');
  const minimo = opcoes.min === 'auto' ? minimoDoAgents() : Number(opcoes.min);
  const { erros, percentual } = verificarLcov(lerArquivo(posicionais[0]), minimo);
  if (percentual !== null) console.log(`Cobertura de linhas: ${percentual.toFixed(2)}% (mínimo ${minimo}%)`);
  return relatar('lcov', posicionais[0], erros);
}

function executarQualidade({ posicionais }) {
  exigir(posicionais, 1, 'qualidade');
  const erros = verificarQualidade(posicionais);
  erros.forEach((e) => console.error(`ERRO [qualidade] ${e.caminho}:${e.linha}: ${e.mensagem}`));
  if (erros.length === 0) {
    console.log(`OK [qualidade] ${posicionais.join(', ')}`);
    return 0;
  }
  console.error(`\n${erros.length} violação(ões) de regra obrigatória (padrao-codigo).`);
  return 1;
}

function executarModulos({ posicionais, opcoes }) {
  exigir(posicionais, 1, 'modulos');
  const { pastas } = pastasDaStack(process.cwd(), posicionais[0], opcoes.base);
  pastas.forEach((pasta) => console.log(pasta));
  return 0;
}

const MODOS = {
  historia: executarHistoria,
  entrega: executarEntrega,
  lcov: executarLcov,
  qualidade: executarQualidade,
  modulos: executarModulos,
};

function principal(argumentos) {
  const [modo, ...resto] = argumentos;
  if (!modo || !MODOS[modo]) throw new ErroUso(AJUDA);
  return MODOS[modo](lerOpcoes(resto));
}

try {
  process.exitCode = principal(process.argv.slice(2));
} catch (erro) {
  console.error(erro instanceof ErroUso ? erro.message : `Falha inesperada: ${erro.stack}`);
  process.exitCode = 2;
}
