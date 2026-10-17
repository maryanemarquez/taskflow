'use strict';

const path = require('node:path');
const {
  dividirSecoes, semMarcadoresDeCerca, acharPlaceholders,
} = require('./util');

const SECOES = [
  'Visão geral', 'Domínio', 'Origem', 'Requisitos funcionais', 'Requisitos não-funcionais',
  'Cenários Gherkin', 'Contrato de Integração', 'Plano de execução',
  'Decisões técnicas relevantes', 'Pontos em aberto',
];
const MARCADORES = ['[AMBÍGUO]', '[DOMÍNIO A DEFINIR]'];
const MODOS = ['não se aplica', 'paralelo', 'sequencial'];
const ROTULOS_CONTRATO = ['Endpoint', 'Quem acessa', 'Requisição', 'Resposta de sucesso', 'Erros', 'Regras de negócio'];
const REGEX_TITULO = /^(HIST-\d{3}-[a-z0-9]+(?:-[a-z0-9]+)*)\s+[—–-]\s+\S/;
const PALAVRAS_INGLES = /^(Given|When|Then|And|But|Scenario)\b/;

const corpoDe = (secoes, nome) => (secoes.find((s) => s.nome === nome) || { corpo: '' }).corpo;
const vazio = (texto) => texto.trim() === '';

/** Extrai os cenários Gherkin de um texto. Usado também pela verificação de entrega. */
function extrairCenarios(corpo) {
  const cenarios = [];
  const problemas = [];
  let atual = null;
  semMarcadoresDeCerca(corpo).split('\n').forEach((bruta) => {
    const linha = bruta.trim();
    if (/^Cenário\b/.test(linha)) {
      const m = /^Cenário: \[C(\d{2,})\] (\S.*)$/.exec(linha);
      if (m) {
        atual = { id: `C${m[1]}`, nome: m[2].trim(), passos: [] };
        cenarios.push(atual);
      } else {
        atual = null;
        problemas.push(`linha de cenário inválida: "${linha}" (use "Cenário: [C01] nome")`);
      }
    } else if (PALAVRAS_INGLES.test(linha)) {
      problemas.push(`palavra-chave em inglês: "${linha.slice(0, 40)}" (use Cenário, Dado, Quando, Então, E)`);
    } else if (atual) {
      const passo = ['Dado', 'Quando', 'Então', 'E'].find((p) => linha.startsWith(`${p} `));
      if (passo) atual.passos.push(passo);
    }
  });
  return { cenarios, problemas };
}

function verificarCenarios(corpo, erros) {
  const { cenarios, problemas } = extrairCenarios(corpo);
  problemas.forEach((p) => erros.push(`Cenários Gherkin: ${p}.`));
  if (cenarios.length === 0) erros.push('Cenários Gherkin: nenhum cenário encontrado.');
  const ids = new Set();
  const nomes = new Set();
  for (const c of cenarios) {
    if (ids.has(c.id)) erros.push(`Cenários Gherkin: ID [${c.id}] repetido.`);
    if (nomes.has(c.nome)) erros.push(`Cenários Gherkin: nome repetido em [${c.id}] ("${c.nome}").`);
    ids.add(c.id);
    nomes.add(c.nome);
    const ordem = c.passos.filter((p) => p !== 'E');
    if (ordem.join(',') !== 'Dado,Quando,Então') {
      erros.push(`Cenários Gherkin: [${c.id}] deve ter exatamente um Dado, um Quando e um Então, nessa ordem (encontrado: ${ordem.join(', ') || 'nenhum'}).`);
    }
  }
}

function verificarRequisitos(corpo, erros) {
  const itens = corpo.split('\n').filter((l) => /^\d+\.\s+\S/.test(l)).length;
  const criterios = corpo.split('\n').filter((l) => /^\s+-\s+Critério de aceitação:\s*\S/.test(l)).length;
  if (itens === 0) erros.push('Requisitos funcionais: nenhum requisito numerado encontrado.');
  if (criterios !== itens) {
    erros.push(`Requisitos funcionais: ${itens} requisito(s) e ${criterios} critério(s) de aceitação; todo requisito exige um critério ("- Critério de aceitação: ...").`);
  }
}

function lerCampo(corpo, rotulo) {
  const m = new RegExp(`^- ${rotulo}:[ \\t]*(.*)$`, 'm').exec(corpo);
  return m ? m[1].trim() : null;
}

function verificarPlano(corpo, modulosConhecidos, erros) {
  const modulos = lerCampo(corpo, 'Módulos ativados');
  const modo = lerCampo(corpo, 'Modo');
  const justificativa = lerCampo(corpo, 'Justificativa');
  if (!modulos) erros.push('Plano de execução: falta "- Módulos ativados: ...".');
  if (!justificativa) erros.push('Plano de execução: falta "- Justificativa: ...".');
  if (!modo || !MODOS.includes(modo)) {
    erros.push(`Plano de execução: "- Modo:" deve ser um de: ${MODOS.join(' | ')}.`);
  }
  if (!modulos) return modo;
  const lista = modulos.split(',').map((m) => m.trim()).filter(Boolean);
  if (modulosConhecidos && modulosConhecidos.length > 0) {
    lista.filter((m) => !modulosConhecidos.includes(m)).forEach((m) => {
      erros.push(`Plano de execução: módulo "${m}" não existe no AGENTS.md (módulos: ${modulosConhecidos.join(', ')}).`);
    });
  }
  if (modo && MODOS.includes(modo)) {
    if (lista.length === 1 && modo !== 'não se aplica') erros.push('Plano de execução: com um único módulo, o modo deve ser "não se aplica".');
    if (lista.length >= 2 && modo === 'não se aplica') erros.push('Plano de execução: com dois ou mais módulos, o modo deve ser "paralelo" ou "sequencial".');
  }
  return modo;
}

function verificarContrato(corpo, modo, erros) {
  const naoSeAplica = /^não se aplica\.?$/i.test(corpo.trim());
  if (modo !== 'paralelo') {
    if (vazio(corpo)) erros.push('Contrato de Integração: seção vazia (escreva "Não se aplica" se for o caso).');
    return;
  }
  if (naoSeAplica || vazio(corpo)) {
    erros.push('Contrato de Integração: obrigatório e completo quando o modo é "paralelo".');
    return;
  }
  const blocos = semMarcadoresDeCerca(corpo).split(/^### /m).slice(1);
  if (blocos.length === 0) erros.push('Contrato de Integração: nenhuma operação ("### Nome da operação") encontrada.');
  blocos.forEach((bloco) => {
    const nome = bloco.split('\n')[0].trim();
    for (const rotulo of ROTULOS_CONTRATO) {
      const valor = lerCampo(bloco, rotulo);
      if (!valor) erros.push(`Contrato de Integração, operação "${nome}": falta "- ${rotulo}:" preenchido.`);
    }
  });
}

function contar(texto, marcador) {
  return texto.split(marcador).length - 1;
}

function verificarMarcadores(secoes, erros) {
  const abertos = corpoDe(secoes, 'Pontos em aberto');
  for (const marcador of MARCADORES) {
    const fora = secoes.filter((s) => s.nome !== 'Pontos em aberto').reduce((n, s) => n + contar(s.corpo, marcador), 0);
    const listados = contar(abertos, marcador);
    if (fora > listados) {
      erros.push(`Pontos em aberto: ${fora} ocorrência(s) de ${marcador} no documento e ${listados} listada(s); liste todas.`);
    }
  }
}

/**
 * Verifica a estrutura de um historia.md. `opcoes.caminho` serve para conferir o ID do título
 * com a pasta; `opcoes.modulos` traz os módulos do AGENTS.md, quando conhecidos.
 */
function verificarHistoria(texto, opcoes = {}) {
  const erros = [];
  if (vazio(texto)) return ['Arquivo vazio.'];
  const { titulo, secoes } = dividirSecoes(texto);

  const idTitulo = titulo && REGEX_TITULO.exec(titulo.texto);
  if (!idTitulo) erros.push('Título: use "# HIST-XXX-<dominio> — Título curto" (ex.: "# HIST-001-auth — Login").');
  if (idTitulo && opcoes.caminho) {
    const pasta = path.basename(path.dirname(path.resolve(opcoes.caminho)));
    if (/^HIST-\d{3}-/.test(pasta) && pasta !== idTitulo[1]) {
      erros.push(`Título: o ID "${idTitulo[1]}" difere da pasta "${pasta}".`);
    }
  }

  const nomes = secoes.map((s) => s.nome);
  SECOES.filter((s) => !nomes.includes(s)).forEach((s) => erros.push(`Seção obrigatória ausente: "## ${s}".`));
  nomes.filter((n) => !SECOES.includes(n)).forEach((n) => erros.push(`Seção não prevista: "## ${n}".`));
  const presentes = nomes.filter((n) => SECOES.includes(n));
  if (presentes.length === SECOES.length && presentes.join('|') !== SECOES.join('|')) {
    erros.push(`Seções fora de ordem. Ordem correta: ${SECOES.join(', ')}.`);
  }
  secoes.filter((s) => SECOES.includes(s.nome) && vazio(s.corpo)).forEach((s) => {
    erros.push(`Seção vazia: "## ${s.nome}" (escreva "Não se aplica", "Nenhuma" ou "Nenhum" quando couber).`);
  });

  acharPlaceholders(texto).forEach((p) => erros.push(`Linha ${p.linha}: marcador de modelo não preenchido ("${p.trecho}").`));

  if (nomes.includes('Requisitos funcionais')) verificarRequisitos(corpoDe(secoes, 'Requisitos funcionais'), erros);
  if (nomes.includes('Cenários Gherkin')) verificarCenarios(corpoDe(secoes, 'Cenários Gherkin'), erros);
  const modo = nomes.includes('Plano de execução') ? verificarPlano(corpoDe(secoes, 'Plano de execução'), opcoes.modulos, erros) : null;
  if (nomes.includes('Contrato de Integração')) verificarContrato(corpoDe(secoes, 'Contrato de Integração'), modo, erros);
  if (nomes.includes('Pontos em aberto')) verificarMarcadores(secoes, erros);
  return erros;
}

module.exports = { verificarHistoria, extrairCenarios, SECOES };
