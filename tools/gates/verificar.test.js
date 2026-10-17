'use strict';

const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const os = require('node:os');
const path = require('node:path');
const { spawnSync } = require('node:child_process');
const { verificarHistoria } = require('./lib/historia');
const { verificarEntrega } = require('./lib/entrega');
const { verificarLcov } = require('./lib/lcov');
const { verificarArquivo } = require('./lib/qualidade');
const { lerModulos, pastasDaStack, lerCoberturaMinima } = require('./lib/modulos');

const CLI = path.join(__dirname, 'verificar.js');
const HISTORIA = fs.readFileSync(path.join(__dirname, 'fixtures', 'historia-valida.md'), 'utf8');

const tmp = () => fs.mkdtempSync(path.join(os.tmpdir(), 'sdd-'));
const escrever = (arquivo, conteudo) => {
  fs.mkdirSync(path.dirname(arquivo), { recursive: true });
  fs.writeFileSync(arquivo, conteudo);
};
const contem = (lista, trecho) => lista.some((e) => (typeof e === 'string' ? e : e.mensagem).includes(trecho));
const trocar = (texto, de, para) => {
  assert.ok(texto.includes(de), `trecho de teste inexistente: ${de}`);
  return texto.replace(de, para);
};

// ---------- historia ----------

test('historia: o exemplo válido passa', () => {
  assert.deepEqual(verificarHistoria(HISTORIA), []);
});

test('historia: seção ausente, vazia, extra e fora de ordem', () => {
  assert.ok(contem(verificarHistoria(trocar(HISTORIA, '## Origem\n', '## Origem extra\n')), 'Seção obrigatória ausente: "## Origem"'));
  assert.ok(contem(verificarHistoria(trocar(HISTORIA, '## Decisões técnicas relevantes\n\nNenhuma.\n', '## Decisões técnicas relevantes\n\n')), 'Seção vazia'));
  assert.ok(contem(verificarHistoria(`${HISTORIA}\n## Extra\n\ntexto\n`), 'Seção não prevista'));
  const trocada = trocar(trocar(HISTORIA, '## Domínio\n', '## TMP\n'), '## Origem\n', '## Domínio\n').replace('## TMP\n', '## Origem\n');
  assert.ok(contem(verificarHistoria(trocada), 'fora de ordem'));
});

test('historia: título inválido e divergente da pasta', () => {
  assert.ok(contem(verificarHistoria(trocar(HISTORIA, '# HIST-000-exemplo — Reservar sala', '# Reservar sala')), 'Título'));
  const pasta = path.join(tmp(), 'HIST-007-outro');
  escrever(path.join(pasta, 'historia.md'), HISTORIA);
  assert.ok(contem(verificarHistoria(HISTORIA, { caminho: path.join(pasta, 'historia.md') }), 'difere da pasta'));
});

test('historia: cenários com ID repetido, passos errados e inglês', () => {
  assert.ok(contem(verificarHistoria(trocar(HISTORIA, '[C03] Tentar', '[C02] Tentar')), 'ID [C02] repetido'));
  assert.ok(contem(verificarHistoria(trocar(HISTORIA, 'Cenário: [C01] Reservar sala livre', 'Cenário: Reservar sala livre')), 'linha de cenário inválida'));
  const doisQuando = trocar(HISTORIA, '  Então a reserva é registrada\n\nCenário: [C03]', '  Quando o usuário confirma de novo\n  Então a reserva é registrada\n\nCenário: [C03]');
  assert.ok(contem(verificarHistoria(doisQuando), 'exatamente um Dado, um Quando e um Então'));
  assert.ok(contem(verificarHistoria(trocar(HISTORIA, '  Dado que a sala "A1" está livre às 10h', '  Given a room')), 'inglês'));
});

test('historia: requisito sem critério e marcador de modelo', () => {
  const semCriterio = trocar(HISTORIA, '   - Critério de aceitação: com sala e horário livres e duração de até 4 horas, o sistema registra a reserva e exibe "Reserva confirmada".\n', '');
  assert.ok(contem(verificarHistoria(semCriterio), 'critério'));
  assert.ok(contem(verificarHistoria(trocar(HISTORIA, 'exemplo\n\n## Origem', '<domínio>\n\n## Origem')), 'marcador de modelo'));
});

test('historia: marcadores precisam estar em Pontos em aberto', () => {
  const comMarcador = trocar(HISTORIA, 'e exibe "Horário indisponível".', 'e exibe "Horário indisponível". [AMBÍGUO]');
  assert.ok(contem(verificarHistoria(comMarcador), '[AMBÍGUO]'));
  const listado = trocar(comMarcador, '## Pontos em aberto\n\nNenhum.', '## Pontos em aberto\n\n- [AMBÍGUO] RF-02: texto da mensagem a confirmar.');
  assert.deepEqual(verificarHistoria(listado), []);
});

test('historia: plano de execução e contrato em modo paralelo', () => {
  assert.ok(contem(verificarHistoria(trocar(HISTORIA, '- Modo: paralelo', '- Modo: tanto faz')), 'Modo'));
  assert.ok(contem(verificarHistoria(trocar(HISTORIA, '- Modo: paralelo', '- Modo: não se aplica')), 'dois ou mais módulos'));
  assert.ok(contem(verificarHistoria(trocar(HISTORIA, '- Módulos ativados: backend, frontend', '- Módulos ativados: backend')), 'único módulo'));
  const semContrato = HISTORIA.replace(/## Contrato de Integração[\s\S]*?## Plano/, '## Contrato de Integração\n\nNão se aplica.\n\n## Plano');
  assert.ok(contem(verificarHistoria(semContrato), 'obrigatório e completo'));
  assert.ok(contem(verificarHistoria(trocar(HISTORIA, '- Erros: `422 HORARIO_INDISPONIVEL` quando a sala já está reservada no período; `400 VALIDACAO` quando um campo é inválido\n', '')), 'falta "- Erros:"'));
  assert.ok(contem(verificarHistoria(HISTORIA, { modulos: ['api', 'app'] }), 'não existe no AGENTS.md'));
  assert.deepEqual(verificarHistoria(HISTORIA, { modulos: ['backend', 'frontend'] }), []);
});

test('historia: arquivo vazio falha', () => {
  assert.deepEqual(verificarHistoria('  \n'), ['Arquivo vazio.']);
});

// ---------- entrega ----------

const ID = 'HIST-001-auth';

function relatorio({ veredito = 'Veredito: LIBERADO', ids = ['C01', 'C02', 'C03'], status = 'Rastreado e correto', avaliada = 'historia.md', diagnostico = 'Não se aplica.' } = {}) {
  const linhas = ids.map((c) => `| ${ID}/${c} | Teste.java: teste ${c} | ${status} |`).join('\n');
  return `# Relatório de Teste — ${ID}

- História avaliada: ${avaliada}
- Ciclo: 1
- Fonte da evidência: CI do PR

## Resultado da reexecução

| Módulo | Comando | Testes | Passaram | Falharam | Cobertura | Mínimo |
|---|---|---|---|---|---|---|
| backend | ./mvnw verify | 3 | 3 | 0 | 90% | 80% |

## Rastreabilidade cenário ↔ teste

| ID | Teste (arquivo e nome) | Status |
|---|---|---|
${linhas}

## Diagnóstico de falha

${diagnostico}

## Veredito

${veredito}
`;
}

function montarEntrega({ rel = relatorio(), testes = `@DisplayName("${ID}/C01 - a")\n@DisplayName("${ID}/C02, ${ID}/C03 - b")\n` } = {}) {
  const raiz = tmp();
  const pasta = path.join(raiz, 'docs', 'historias', ID);
  escrever(path.join(pasta, 'historia.md'), trocar(HISTORIA, '# HIST-000-exemplo', `# ${ID}`));
  if (rel) escrever(path.join(pasta, 'relatorio-teste.md'), rel);
  escrever(path.join(raiz, 'backend', 'src', 'test', 'java', 'Teste.java'), testes);
  return { raiz, pasta, testes: [path.join(raiz, 'backend', 'src', 'test')] };
}

test('entrega: caso válido, com teste parametrizado citando vários IDs', () => {
  const { pasta, testes } = montarEntrega();
  assert.deepEqual(verificarEntrega(pasta, testes), []);
});

test('entrega: cenário sem teste e ID inexistente da mesma história', () => {
  const sem = montarEntrega({ testes: `${ID}/C01\n${ID}/C02\n` });
  assert.ok(contem(verificarEntrega(sem.pasta, sem.testes), `${ID}/C03 não é citado`));
  const extra = montarEntrega({ testes: `${ID}/C01 ${ID}/C02 ${ID}/C03 ${ID}/C09\n` });
  assert.ok(contem(verificarEntrega(extra.pasta, extra.testes), `${ID}/C09, que não existe`));
});

test('entrega: IDs de outras histórias nos testes são ignorados', () => {
  const { pasta, testes } = montarEntrega({ testes: `${ID}/C01 ${ID}/C02 ${ID}/C03 HIST-002-auth/C07\n` });
  assert.deepEqual(verificarEntrega(pasta, testes), []);
});

test('entrega: formato do veredito', () => {
  for (const ruim of ['🛑 Veredito: BLOQUEADO', '**Veredito: LIBERADO**', 'Veredito: liberado']) {
    const { pasta, testes } = montarEntrega({ rel: relatorio({ veredito: ruim }) });
    assert.ok(contem(verificarEntrega(pasta, testes), 'Veredito'), ruim);
  }
  const duas = montarEntrega({ rel: relatorio({ veredito: 'Veredito: LIBERADO\n\nVeredito: BLOQUEADO' }) });
  assert.ok(contem(verificarEntrega(duas.pasta, duas.testes), 'exatamente uma linha'));
});

test('entrega: BLOQUEADO falha e exige diagnóstico completo', () => {
  const sem = montarEntrega({ rel: relatorio({ veredito: 'Veredito: BLOQUEADO' }) });
  const erros = verificarEntrega(sem.pasta, sem.testes);
  assert.ok(contem(erros, 'BLOQUEADO: o PR de entrega não pode ser mesclado'));
  assert.ok(contem(erros, 'ao menos um bloco'));
  const bloco = '### C03\n\n**Classificação:** Falha de código\n\n**Evidência:**\nArquivo Servico.java linha 10: não valida o limite.\n';
  const completo = montarEntrega({ rel: relatorio({ veredito: 'Veredito: BLOQUEADO', diagnostico: bloco }) });
  const resultado = verificarEntrega(completo.pasta, completo.testes);
  assert.equal(resultado.length, 1);
  assert.ok(contem(resultado, 'não pode ser mesclado'));
});

test('entrega: matriz incompleta, status inválido e LIBERADO incoerente', () => {
  const incompleta = montarEntrega({ rel: relatorio({ ids: ['C01', 'C02'] }) });
  assert.ok(contem(verificarEntrega(incompleta.pasta, incompleta.testes), `falta o cenário ${ID}/C03`));
  const invalido = montarEntrega({ rel: relatorio({ status: 'Ok' }) });
  assert.ok(contem(verificarEntrega(invalido.pasta, invalido.testes), 'status inválido'));
  const incoerente = montarEntrega({ rel: relatorio({ status: 'Não rastreado' }) });
  assert.ok(contem(verificarEntrega(incoerente.pasta, incoerente.testes), 'LIBERADO é incoerente'));
});

test('entrega: usa a versão mais recente da história', () => {
  const { pasta, testes } = montarEntrega();
  escrever(path.join(pasta, 'historia-v2.md'), trocar(HISTORIA, '# HIST-000-exemplo', `# ${ID}`).replace(/Cenário: \[C03\][\s\S]*?(?=## Contrato)/, ''));
  assert.ok(contem(verificarEntrega(pasta, testes), 'historia-v2.md'));
});

test('entrega: relatório ausente e pasta de teste ausente', () => {
  const sem = montarEntrega({ rel: null });
  assert.ok(contem(verificarEntrega(sem.pasta, sem.testes), 'Relatório ausente'));
  assert.throws(() => verificarEntrega(sem.pasta, []), /Nenhuma pasta de teste/);
  assert.throws(() => verificarEntrega(sem.pasta, [path.join(sem.raiz, 'nao-existe')]), /inexistente/);
});

// ---------- lcov ----------

test('lcov: soma LF/LH e compara com o mínimo', () => {
  const texto = 'SF:a.dart\nLF:10\nLH:9\nend_of_record\nSF:b.dart\nLF:10\nLH:7\nend_of_record\n';
  assert.deepEqual(verificarLcov(texto, 80).erros, []);
  assert.equal(verificarLcov(texto, 80).percentual, 80);
  assert.ok(contem(verificarLcov(texto, 81).erros, 'abaixo do mínimo'));
  assert.ok(contem(verificarLcov('SF:a\nLF:0\nLH:0\n', 80).erros, 'linhas instrumentadas'));
  assert.ok(contem(verificarLcov(texto, 150).erros, 'entre 0 e 100'));
});

// ---------- qualidade ----------

const corpo = (n, prefixo = '        ') => Array.from({ length: n }, (_, i) => `${prefixo}total += ${i + 2};`).join('\n');
const metodoJava = (nome, n, parametros = 'int a') => `    void ${nome}(${parametros}) {\n        int total = 0;\n${corpo(n)}\n    }\n`;
const classeJava = (conteudo, nome = 'Servico') => `package a.b;\n\nimport java.util.List;\n\nclass ${nome} {\n${conteudo}}\n`;

test('qualidade Java: código dentro dos limites passa', () => {
  assert.deepEqual(verificarArquivo('Servico.java', classeJava(metodoJava('calcular', 10))), []);
});

test('qualidade Java: método longo, linhas em branco e comentários não contam', () => {
  const longo = verificarArquivo('Servico.java', classeJava(metodoJava('calcular', 25)));
  assert.ok(contem(longo, 'Q-03'));
  const enfeitado = `    void calcular(int a) {\n        int total = 0;\n${Array.from({ length: 17 }, (_, i) => `        // nota ${i}\n\n        total += ${i + 2};`).join('\n')}\n    }\n`;
  assert.deepEqual(verificarArquivo('Servico.java', classeJava(enfeitado)), []);
});

test('qualidade Java: limite de 20 linhas é inclusivo', () => {
  assert.deepEqual(verificarArquivo('Servico.java', classeJava(metodoJava('ok', 17))), []);
  assert.ok(contem(verificarArquivo('Servico.java', classeJava(metodoJava('estoura', 18))), 'Q-03'));
});

test('qualidade Java: parâmetros, linha longa e classe longa', () => {
  assert.ok(contem(verificarArquivo('Servico.java', classeJava(metodoJava('m', 1, 'int a, int b, int c, int d'))), 'Q-04'));
  assert.deepEqual(verificarArquivo('Servico.java', classeJava(metodoJava('m', 1, 'Map<String, Integer> a, List<Integer> b, int c'))), []);
  assert.ok(contem(verificarArquivo('Servico.java', classeJava(`    int x = ${'1 + '.repeat(40)}1;\n`)), 'Q-01'));
  const metodos = Array.from({ length: 12 }, (_, i) => metodoJava(`m${i}`, 6)).join('');
  assert.ok(contem(verificarArquivo('Servico.java', classeJava(metodos)), 'Q-02'));
  assert.deepEqual(verificarArquivo('ServicoTest.java', classeJava(metodos, 'ServicoTest')).filter((e) => e.mensagem.startsWith('Q-02')), []);
});

test('qualidade: exceção com motivo suprime, sem motivo é erro', () => {
  const comMotivo = classeJava(`    // qualidade-exceção: mapeamento declarativo\n${metodoJava('mapear', 25)}`);
  assert.deepEqual(verificarArquivo('Servico.java', comMotivo), []);
  const semMotivo = classeJava(`    // qualidade-exceção:\n${metodoJava('mapear', 25)}`);
  assert.ok(contem(verificarArquivo('Servico.java', semMotivo), 'Q-00'));
  const arquivo = `// qualidade-exceção: classe gerada\n${classeJava(metodoJava('gerado', 30))}`;
  assert.deepEqual(verificarArquivo('Gerado.java', arquivo), []);
});

test('qualidade Java: saída direta e texto fixo', () => {
  assert.ok(contem(verificarArquivo('Servico.java', classeJava('    void a() {\n        System.out.println(1);\n    }\n')), 'Q-06'));
  assert.ok(contem(verificarArquivo('Servico.java', classeJava('    void a() {\n        e.printStackTrace();\n    }\n')), 'Q-06'));
  assert.deepEqual(verificarArquivo('AppLogger.java', classeJava('    void a() {\n        System.out.println(1);\n    }\n', 'AppLogger')), []);
  const texto = classeJava('    void a() {\n        throw new IllegalStateException("Horário indisponível");\n    }\n');
  assert.ok(contem(verificarArquivo('Servico.java', texto), 'Q-05/Q-07'));
  assert.deepEqual(verificarArquivo('Mensagens.java', classeJava('    static final String M = "Horário indisponível";\n', 'Mensagens')), []);
  assert.deepEqual(verificarArquivo('Servico.java', classeJava('    static final String M = "Horário indisponível";\n')), []);
  assert.deepEqual(verificarArquivo('ServicoTest.java', texto), []);
  assert.deepEqual(verificarArquivo('Servico.java', classeJava('    @Schema(description = "Texto livre aqui")\n    int a;\n')), []);
  assert.deepEqual(verificarArquivo('Servico.java', classeJava('    void a() {\n        log.info("Reserva criada com sucesso");\n    }\n')), []);
});

test('qualidade Java: comentários e strings não confundem a contagem', () => {
  const fonte = classeJava('    void a() {\n        String s = "{ ) ( }";\n        /* } } } */\n        int x = 1;\n    }\n    void b() {\n        int y = 2;\n    }\n');
  assert.deepEqual(verificarArquivo('Servico.java', fonte), []);
});

const metodoDart = (nome, n, parametros = '') => `  Widget ${nome}(${parametros}) {\n    var total = 0;\n${corpo(n, '    ')}\n    return total;\n  }\n`;
const classeDart = (conteudo) => `import 'package:flutter/material.dart';\n\nclass Tela {\n${conteudo}}\n`;

test('qualidade Dart: build longo, parâmetros nomeados e print', () => {
  assert.deepEqual(verificarArquivo('tela.dart', classeDart(metodoDart('build', 10, 'BuildContext context'))), []);
  assert.ok(contem(verificarArquivo('tela.dart', classeDart(metodoDart('build', 30, 'BuildContext context'))), 'Q-03'));
  assert.ok(contem(verificarArquivo('tela.dart', classeDart(metodoDart('montar', 2, 'int a, {required int b, int c = 2, int d = 3}'))), 'Q-04'));
  assert.ok(contem(verificarArquivo('tela.dart', classeDart('  void a() {\n    print(1);\n  }\n')), 'Q-06'));
  assert.deepEqual(verificarArquivo('app_logger.dart', classeDart('  void a() {\n    print(1);\n  }\n')), []);
  assert.deepEqual(verificarArquivo('tela.g.dart', classeDart(metodoDart('build', 40))), []);
});

test('qualidade Dart: texto fixo na interface', () => {
  const fonte = classeDart("  Widget build(BuildContext c) {\n    return Text('Salvar projeto');\n  }\n");
  assert.ok(contem(verificarArquivo('tela.dart', fonte), 'Q-05/Q-07'));
  const palavra = classeDart("  Widget build(BuildContext c) {\n    return Text('Salvar');\n  }\n");
  assert.ok(contem(verificarArquivo('tela.dart', palavra), 'Q-05/Q-07'));
  const chave = classeDart("  Widget build(BuildContext c) {\n    return Text(Mensagens.salvar, key: Key('botao_salvar'));\n  }\n");
  assert.deepEqual(verificarArquivo('tela.dart', chave), []);
  assert.deepEqual(verificarArquivo('mensagens.dart', classeDart("  static const salvar = 'Salvar projeto';\n")), []);
  assert.deepEqual(verificarArquivo('tela_test.dart', fonte), []);
});

test('qualidade Dart: interpolação e strings brutas não quebram a contagem', () => {
  const fonte = classeDart("  void a() {\n    var s = '${1 + 2} {';\n    var r = r'}}}';\n  }\n  void b() {\n    var x = 1;\n  }\n");
  assert.deepEqual(verificarArquivo('tela.dart', fonte), []);
});

// ---------- módulos ----------

const AGENTS = `# AGENTS

## Módulos

| Módulo | Pasta | Skill de stack | Referência externa |
|---|---|---|---|
| \`backend\` | \`backend/\` | \`stack-java-spring\` | não |
| \`frontend\` | \`frontend/\` | \`stack-flutter-web\` | não |
| \`<exemplo>\` | \`<pasta/>\` | \`<skill>\` | \`<x>\` |

## Outro
`;

test('módulos: lê a tabela e ignora linhas de modelo', () => {
  assert.deepEqual(lerModulos(AGENTS), [
    { modulo: 'backend', pasta: 'backend', skill: 'stack-java-spring' },
    { modulo: 'frontend', pasta: 'frontend', skill: 'stack-flutter-web' },
  ]);
  assert.deepEqual(lerModulos('sem tabela'), []);
});

test('módulos: lê a cobertura mínima do AGENTS.md', () => {
  assert.equal(lerCoberturaMinima('- Cobertura mínima de testes: `85%`'), 85);
  assert.equal(lerCoberturaMinima('sem a linha'), null);
});

test('módulos: pastas por stack, com e sem AGENTS.md', () => {
  const raiz = tmp();
  assert.deepEqual(pastasDaStack(raiz, 'stack-java-spring').pastas, []);
  escrever(path.join(raiz, 'AGENTS.md'), AGENTS);
  assert.deepEqual(pastasDaStack(raiz, 'stack-java-spring').pastas, ['backend']);
  assert.deepEqual(pastasDaStack(raiz, 'stack-inexistente').pastas, []);
});

// ---------- linha de comando ----------

const rodar = (...args) => spawnSync(process.execPath, [CLI, ...args], { encoding: 'utf8' });

test('CLI: códigos de saída 0, 1 e 2', () => {
  const raiz = tmp();
  const ok = path.join(raiz, 'HIST-000-exemplo', 'historia.md');
  escrever(ok, HISTORIA);
  assert.equal(rodar('historia', ok).status, 0);
  escrever(ok, '# nada\n');
  const ruim = rodar('historia', ok);
  assert.equal(ruim.status, 1);
  assert.match(ruim.stderr, /ERRO \[historia\]/);
  assert.equal(rodar('historia', path.join(raiz, 'nao-existe.md')).status, 2);
  assert.equal(rodar('inexistente').status, 2);
  assert.equal(rodar().status, 2);
  assert.equal(rodar('entrega', raiz).status, 2);
  assert.equal(rodar('lcov', ok).status, 2);
});

test('CLI: lcov e qualidade', () => {
  const raiz = tmp();
  escrever(path.join(raiz, 'lcov.info'), 'LF:10\nLH:9\n');
  assert.equal(rodar('lcov', path.join(raiz, 'lcov.info'), '--min', '80').status, 0);
  assert.equal(rodar('lcov', path.join(raiz, 'lcov.info'), '--min', '95').status, 1);
  escrever(path.join(raiz, 'src', 'A.java'), classeJava(metodoJava('m', 30), 'A'));
  assert.equal(rodar('qualidade', path.join(raiz, 'src')).status, 1);
  escrever(path.join(raiz, 'ok', 'B.java'), classeJava(metodoJava('m', 3), 'B'));
  assert.equal(rodar('qualidade', path.join(raiz, 'ok')).status, 0);
});

test('CLI: entrega com --testes auto usa as pastas do AGENTS.md', () => {
  const { raiz, pasta } = montarEntrega();
  escrever(path.join(raiz, 'AGENTS.md'), AGENTS);
  const ok = rodar('entrega', pasta, '--testes', 'auto');
  assert.equal(ok.status, 0, ok.stderr);
  escrever(path.join(raiz, 'backend', 'src', 'test', 'java', 'Teste.java'), `${ID}/C01\n`);
  assert.equal(rodar('entrega', pasta, '--testes', 'auto').status, 1);
  const semAgents = montarEntrega();
  assert.equal(rodar('entrega', semAgents.pasta, '--testes', 'auto').status, 2);
});
