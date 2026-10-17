'use strict';

/**
 * Regras obrigatórias de estilo (skill padrao-codigo) que as ferramentas das stacks não cobrem:
 * Q-01 (linha), Q-02 (classe), Q-03 (método), Q-04 (parâmetros), Q-05/Q-07 (texto fixo) e
 * Q-06 (log centralizado). Heurístico: lê Java e Dart sem analisador sintático completo.
 */

const path = require('node:path');
const { lerArquivo, listarArquivos } = require('./util');

const LIMITES = { linha: 120, classe: 100, metodo: 20, parametros: 3 };
const LINHAS_DE_CABECALHO = 15;
const CONTROLE = new Set([
  'if', 'for', 'while', 'switch', 'catch', 'synchronized', 'try', 'return', 'new', 'else', 'do',
  'super', 'this', 'assert', 'when', 'finally', 'with',
]);
const REGEX_EXCECAO = /qualidade-exceção:(.*)$/;
const GERADOS = /\.(g|freezed|mocks|gr)\.dart$/;
const NOME_LOG = /(logger|logging|applog|app_log)|^log$/i;
const NOME_TEXTOS = /(message|mensage|constant|constante|strings|config|properties|labels|textos?|texts)/i;
const LINHA_DE_LOG = /\b(log|logger|LOG|LOGGER|Log|AppLogger)\w*\s*\./;
const SAIDA_JAVA = /\bSystem\s*\.\s*(out|err)\b|\.printStackTrace\s*\(/;
const SAIDA_DART = /(^|[^\w.])(print|debugPrint)\s*\(|\b(stdout|stderr)\s*\.\s*write/;

/** Remove comentários e esvazia strings, preservando as linhas. Devolve também os literais. */
function limparFonte(texto, dart) {
  const codigo = [''];
  const literais = [];
  let linha = 0;
  const emitir = (c) => {
    if (c === '\n') { codigo.push(''); linha += 1; } else { codigo[linha] += c; }
  };
  let i = 0;
  while (i < texto.length) {
    const c = texto[i];
    if (c === '/' && texto[i + 1] === '/') {
      while (i < texto.length && texto[i] !== '\n') i += 1;
    } else if (c === '/' && texto[i + 1] === '*') {
      i += 2;
      while (i < texto.length && !(texto[i] === '*' && texto[i + 1] === '/')) {
        if (texto[i] === '\n') emitir('\n');
        i += 1;
      }
      i += 2;
    } else {
      const aspas = abrirString(texto, i, dart);
      if (aspas) {
        i = consumirString(texto, aspas, dart, emitir, literais, linha);
      } else {
        emitir(c);
        i += 1;
      }
    }
  }
  return { codigo, literais };
}

function abrirString(texto, i, dart) {
  let k = i;
  let cru = false;
  if (dart && texto[k] === 'r' && /['"]/.test(texto[k + 1] || '') && !/[\w$]/.test(texto[i - 1] || '')) {
    cru = true;
    k += 1;
  }
  const q = texto[k];
  if (q !== '"' && q !== "'") return null;
  const triplo = texto.startsWith(q.repeat(3), k);
  return { q, triplo, cru, abre: k + (triplo ? 3 : 1) };
}

function consumirString(texto, aspas, dart, emitir, literais, linhaInicial) {
  const { q, triplo, cru } = aspas;
  let j = aspas.abre;
  let conteudo = '';
  emitir(q);
  emitir('S');
  emitir(q);
  const guardar = (c) => {
    conteudo += c;
    if (c === '\n') emitir('\n');
  };
  while (j < texto.length) {
    if (!cru && texto[j] === '\\') {
      guardar(texto[j]);
      guardar(texto[j + 1] || '');
      j += 2;
    } else if (dart && !cru && texto[j] === '$' && texto[j + 1] === '{') {
      let nivel = 1;
      guardar('$');
      guardar('{');
      j += 2;
      while (j < texto.length && nivel > 0) {
        if (texto[j] === '{') nivel += 1;
        if (texto[j] === '}') nivel -= 1;
        guardar(texto[j]);
        j += 1;
      }
    } else if (triplo ? texto.startsWith(q.repeat(3), j) : texto[j] === q) {
      j += triplo ? 3 : 1;
      break;
    } else if (!triplo && texto[j] === '\n') {
      break;
    } else {
      guardar(texto[j]);
      j += 1;
    }
  }
  literais.push({ linha: linhaInicial, texto: conteudo });
  return j;
}

/** Lê "nome(parâmetros)" no fim da cabeça de um bloco. Devolve null se não for método. */
function lerAssinatura(cabeca) {
  let resto = cabeca.replace(/\s+$/, '')
    .replace(/\s+throws\s+[\w$.,<>?\s]+$/, '')
    .replace(/\s+(async\*?|sync\*|async)$/, '')
    .replace(/\s+$/, '');
  if (!resto.endsWith(')')) return null;
  let nivel = 0;
  let k = resto.length - 1;
  for (; k >= 0; k -= 1) {
    if (resto[k] === ')') nivel += 1;
    else if (resto[k] === '(') {
      nivel -= 1;
      if (nivel === 0) break;
    }
  }
  if (k < 0) return null;
  const parametros = resto.slice(k + 1, resto.length - 1);
  let j = k - 1;
  while (j >= 0 && /\s/.test(resto[j])) j -= 1;
  if (resto[j] === '>') {
    let angulos = 0;
    for (; j >= 0; j -= 1) {
      if (resto[j] === '>') angulos += 1;
      else if (resto[j] === '<') {
        angulos -= 1;
        if (angulos === 0) { j -= 1; break; }
      }
    }
    while (j >= 0 && /\s/.test(resto[j])) j -= 1;
  }
  const fimNome = j + 1;
  while (j >= 0 && /[\w$]/.test(resto[j])) j -= 1;
  const nome = resto.slice(j + 1, fimNome);
  if (!nome || /^\d/.test(nome) || CONTROLE.has(nome)) return null;
  let q = j;
  while (q >= 0 && /\s/.test(resto[q])) q -= 1;
  const anterior = /[\w$]*$/.exec(resto.slice(0, q + 1))[0];
  if (anterior === 'new' || resto[q] === '.' || resto[q] === '=') return null;
  return { nome, parametros, deslocamento: j + 1 };
}

function contarParametros(texto, dart) {
  const limpo = dart ? texto.replace(/[{}[\]]/g, ' ') : texto;
  let nivel = 0;
  let atual = '';
  const partes = [];
  for (let i = 0; i < limpo.length; i += 1) {
    const c = limpo[i];
    const seta = c === '>' && (limpo[i - 1] === '-' || limpo[i - 1] === '=');
    if (c === '(' || c === '<') nivel += 1;
    if ((c === ')' || c === '>') && !seta) nivel -= 1;
    if (c === ',' && nivel === 0) { partes.push(atual); atual = ''; } else { atual += c; }
  }
  partes.push(atual);
  return partes.filter((p) => p.trim() !== '').length;
}

function classificar(cabeca, inicioCabeca, pilha, dart) {
  const tipo = /(?:^|[^\w$@])(class|interface|enum|mixin|extension|record)\s+([A-Za-z_$][\w$]*)/.exec(cabeca);
  if (tipo) {
    return { tipo: 'classe', nome: tipo[2], posicao: inicioCabeca + tipo.index + tipo[0].length - tipo[2].length };
  }
  if (cabeca.includes('=>')) return { tipo: 'outro' };
  const pai = pilha[pilha.length - 1];
  const permitido = pai ? pai.tipo === 'classe' : dart;
  const assinatura = permitido ? lerAssinatura(cabeca) : null;
  if (!assinatura) return { tipo: 'outro' };
  return {
    tipo: 'metodo',
    nome: assinatura.nome,
    posicao: inicioCabeca + assinatura.deslocamento,
    parametros: contarParametros(assinatura.parametros, dart),
  };
}

/** Encontra classes e métodos (com linha inicial, final e parâmetros) a partir do código limpo. */
function analisarEstrutura(codigo, dart) {
  const texto = codigo.join('\n');
  const inicios = [0];
  for (let i = 0; i < texto.length; i += 1) if (texto[i] === '\n') inicios.push(i + 1);
  const linhaDe = (posicao) => {
    let baixo = 0;
    let alto = inicios.length - 1;
    while (baixo < alto) {
      const meio = Math.ceil((baixo + alto) / 2);
      if (inicios[meio] <= posicao) baixo = meio; else alto = meio - 1;
    }
    return baixo;
  };
  const pilha = [];
  const itens = [];
  let parenteses = 0;
  let inicioCabeca = 0;
  for (let p = 0; p < texto.length; p += 1) {
    const c = texto[p];
    if (c === '(') parenteses += 1;
    else if (c === ')') parenteses = Math.max(0, parenteses - 1);
    else if (parenteses === 0) {
      if (c === ';') inicioCabeca = p + 1;
      else if (c === '{') {
        const bloco = classificar(texto.slice(inicioCabeca, p), inicioCabeca, pilha, dart);
        pilha.push(bloco);
        inicioCabeca = p + 1;
      } else if (c === '}') {
        const bloco = pilha.pop();
        if (bloco && bloco.tipo !== 'outro') {
          itens.push({ ...bloco, linhaInicial: linhaDe(bloco.posicao), linhaFinal: linhaDe(p) });
        }
        inicioCabeca = p + 1;
      }
    }
  }
  return itens;
}

const ehTeste = (caminho) => /(^|[\\/])(test|tests|integration_test)[\\/]/.test(caminho)
  || /(Test|Tests|IT)\.java$/.test(caminho) || /_test\.dart$/.test(caminho);

const ehTextoDeNegocio = (t) => /^https?:\/\//.test(t) || /\p{L}+\s+\p{L}+/u.test(t)
  || /^\p{Lu}\p{Ll}{2,}[.!?:]?$/u.test(t);

function declaraConstante(linhaBruta, dart) {
  if (!dart) return /\bstatic\s+final\b/.test(linhaBruta);
  return /\b(static\s+(const|final)|const)\s+(String\s+)?[A-Za-z_]\w*\s*=/.test(linhaBruta);
}

function verificarArquivo(caminho, texto) {
  const dart = caminho.endsWith('.dart');
  const nome = path.basename(caminho).replace(/\.[^.]+$/, '');
  const erros = [];
  const falha = (regra, linha, mensagem) => erros.push({ caminho, linha: linha + 1, mensagem: `${regra} ${mensagem}` });
  if (GERADOS.test(caminho)) return erros;

  const brutas = texto.split('\n');
  const excecaoArquivo = brutas.slice(0, LINHAS_DE_CABECALHO).some((l) => REGEX_EXCECAO.test(l));
  const excecaoEm = (linha) => brutas.slice(Math.max(0, linha - 4), linha + 1).some((l) => REGEX_EXCECAO.test(l));
  brutas.forEach((l, i) => {
    const m = REGEX_EXCECAO.exec(l);
    if (m && m[1].trim().length < 3) falha('Q-00', i, 'exceção "qualidade-exceção:" sem motivo; explique em uma frase.');
  });

  if (!excecaoArquivo) {
    brutas.forEach((l, i) => {
      const tamanho = [...l].length;
      if (tamanho > LIMITES.linha) falha('Q-01', i, `linha com ${tamanho} caracteres (máx. ${LIMITES.linha}).`);
    });
  }

  const { codigo, literais } = limparFonte(texto, dart);
  const importacao = dart ? /^\s*(import|export|part|library)\b/ : /^\s*(import|package)\b/;
  const contaLinha = codigo.map((l) => (l.trim() !== '' && !importacao.test(l) ? 1 : 0));
  const prefixo = [0];
  contaLinha.forEach((v) => prefixo.push(prefixo[prefixo.length - 1] + v));
  const linhasDeCodigo = (ini, fim) => prefixo[fim + 1] - prefixo[ini];

  if (!excecaoArquivo) {
    analisarEstrutura(codigo, dart).forEach((item) => {
      if (excecaoEm(item.linhaInicial)) return;
      const total = linhasDeCodigo(item.linhaInicial, item.linhaFinal);
      if (item.tipo === 'classe' && !ehTeste(caminho) && total > LIMITES.classe) {
        falha('Q-02', item.linhaInicial, `classe "${item.nome}" tem ${total} linhas de código (máx. ${LIMITES.classe}); decomponha.`);
      }
      if (item.tipo === 'metodo' && total > LIMITES.metodo) {
        falha('Q-03', item.linhaInicial, `método "${item.nome}" tem ${total} linhas de código (máx. ${LIMITES.metodo}); decomponha em submétodos.`);
      }
      if (item.tipo === 'metodo' && item.parametros > LIMITES.parametros) {
        falha('Q-04', item.linhaInicial, `método "${item.nome}" tem ${item.parametros} parâmetros (máx. ${LIMITES.parametros}).`);
      }
    });
  }

  if (!NOME_LOG.test(nome)) {
    const padrao = dart ? SAIDA_DART : SAIDA_JAVA;
    codigo.forEach((l, i) => {
      if (padrao.test(l)) falha('Q-06', i, 'saída direta (print/System.out/printStackTrace); use a classe centralizada de logging.');
    });
  }

  const dispensaTexto = ehTeste(caminho) || NOME_TEXTOS.test(nome) || /[\\/](messages|constants|l10n)[\\/]/.test(caminho);
  if (!dispensaTexto) {
    literais.filter((l) => ehTextoDeNegocio(l.texto)).forEach((l) => {
      const bruta = brutas[l.linha] || '';
      const dispensado = bruta.trim().startsWith('@') || LINHA_DE_LOG.test(bruta) || declaraConstante(bruta, dart);
      if (!dispensado) {
        falha('Q-05/Q-07', l.linha, `texto fixo "${l.texto.trim().slice(0, 40)}"; mova para constante ou para a classe de mensagens.`);
      }
    });
  }
  return erros;
}

function verificarQualidade(raizes) {
  const erros = [];
  for (const raiz of raizes) {
    for (const arquivo of listarArquivos(raiz, ['.java', '.dart'])) {
      erros.push(...verificarArquivo(arquivo, lerArquivo(arquivo)));
    }
  }
  return erros.sort((a, b) => a.caminho.localeCompare(b.caminho) || a.linha - b.linha);
}

module.exports = { verificarQualidade, verificarArquivo, limparFonte, LIMITES };
