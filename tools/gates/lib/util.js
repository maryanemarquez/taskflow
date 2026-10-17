'use strict';

const fs = require('node:fs');
const path = require('node:path');

/** Erro de uso ou de ambiente (arquivo inexistente, argumento inválido). Encerra com código 2. */
class ErroUso extends Error {}

const PASTAS_IGNORADAS = new Set([
  'node_modules', 'target', 'build', '.dart_tool', '.git', '.gradle', 'coverage', 'generated',
]);

function lerArquivo(caminho) {
  try {
    return fs.readFileSync(caminho, 'utf8').replace(/^﻿/, '').replace(/\r\n?/g, '\n');
  } catch (erro) {
    throw new ErroUso(`Não foi possível ler "${caminho}": ${erro.message}`);
  }
}

/** Lista arquivos com as extensões dadas, recursivamente. Aceita pasta ou arquivo. */
function listarArquivos(raiz, extensoes) {
  if (!fs.existsSync(raiz)) {
    throw new ErroUso(`Caminho inexistente: "${raiz}"`);
  }
  const resultado = [];
  const visitar = (caminho) => {
    const info = fs.statSync(caminho);
    if (info.isDirectory()) {
      for (const nome of fs.readdirSync(caminho).sort()) {
        if (!PASTAS_IGNORADAS.has(nome)) visitar(path.join(caminho, nome));
      }
    } else if (extensoes.includes(path.extname(caminho))) {
      resultado.push(caminho);
    }
  };
  visitar(raiz);
  return resultado;
}

/** Remove os marcadores de cerca (```), mantendo o conteúdo. */
function semMarcadoresDeCerca(texto) {
  return texto.split('\n').filter((linha) => !linha.trim().startsWith('```')).join('\n');
}

/**
 * Divide um Markdown em título (H1) e seções (H2). Cabeçalhos dentro de cercas de código
 * não contam. Cada seção traz o nome, a linha (1-based) e o corpo.
 */
function dividirSecoes(texto) {
  const linhas = texto.split('\n');
  const secoes = [];
  let titulo = null;
  let atual = null;
  let dentroDeCerca = false;
  linhas.forEach((linha, indice) => {
    if (linha.trim().startsWith('```')) dentroDeCerca = !dentroDeCerca;
    if (!dentroDeCerca && /^## /.test(linha)) {
      atual = { nome: linha.slice(3).trim(), linha: indice + 1, linhas: [] };
      secoes.push(atual);
    } else if (!dentroDeCerca && titulo === null && /^# /.test(linha)) {
      titulo = { texto: linha.slice(2).trim(), linha: indice + 1 };
    } else if (atual) {
      atual.linhas.push(linha);
    }
  });
  for (const secao of secoes) secao.corpo = secao.linhas.join('\n');
  return { titulo, secoes };
}

/** Texto sem blocos de código e sem trechos entre crases, para procurar marcadores de modelo. */
function textoSemCodigo(texto) {
  const semBlocos = texto.replace(/^```[^\n]*\n[\s\S]*?^```[ \t]*$/gm, (bloco) => bloco.replace(/[^\n]/g, ''));
  return semBlocos.replace(/`[^`\n]*`/g, '');
}

/** Procura marcadores de modelo não preenchidos, como <requisito> ou HIST-XXX. */
function acharPlaceholders(texto) {
  const achados = [];
  textoSemCodigo(texto).split('\n').forEach((linha, indice) => {
    if (/<[A-Za-zÀ-ÿ][^<>\n]*>/.test(linha) || /HIST-XXX/.test(linha)) {
      achados.push({ linha: indice + 1, trecho: linha.trim().slice(0, 80) });
    }
  });
  return achados;
}

/** Extrai as linhas de dados de uma tabela Markdown como arrays de células. */
function linhasDeTabela(corpo) {
  const linhas = corpo.split('\n').map((l) => l.trim()).filter((l) => l.startsWith('|'));
  const celulas = linhas.map((l) => l.replace(/^\||\|$/g, '').split('|').map((c) => c.trim()));
  return celulas.filter((c, indice) => indice > 0 && !c.every((x) => /^:?-{3,}:?$/.test(x)));
}

module.exports = {
  ErroUso, lerArquivo, listarArquivos, semMarcadoresDeCerca, dividirSecoes,
  textoSemCodigo, acharPlaceholders, linhasDeTabela,
};
