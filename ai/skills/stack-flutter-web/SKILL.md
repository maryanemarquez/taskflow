---
name: stack-flutter-web
description: Usar ao implementar ou auditar um módulo de interface em Flutter Web com Riverpod, go_router e dio. Define padrões de código, TDD com testes de widget, formato de citação dos IDs de cenário nos testes, comandos de teste e cobertura, e o checklist de qualidade usado pelo agente-testes.
---

# Stack: Flutter Web

Esta skill é a régua de um módulo de interface em Flutter Web. O `construtor` a segue; o `agente-testes` a aplica na auditoria. Decisões específicas do projeto (camadas, tema, fluxo de autenticação, referência visual) ficam nos documentos do projeto listados no `AGENTS.md`. Em caso de conflito, **vale o documento do projeto**, e a divergência é registrada em "Pontos em aberto".

## 1. Estrutura e padrões

- **Organização por funcionalidade (feature-first):** cada funcionalidade tem suas camadas `data` (acesso à API), `domain` (modelos e regras de interface) e `presentation` (telas e widgets). Código compartilhado fica em `core/` ou `shared/`. Se o projeto definir outra divisão de camadas, siga a do projeto.
- **Estado:** Riverpod. Estado e lógica em providers/notifiers, nunca dentro do `build` do widget. Widget só desenha e dispara ações.
- **Navegação:** go_router, com rotas declaradas em um único lugar e proteção de rotas por redirecionamento (usuário não autenticado vai ao login).
- **HTTP:** dio, em uma única instância configurada (base URL por configuração de ambiente, interceptores de autenticação e de erro). Widgets nunca usam `dio` diretamente: passam por repository.
- **Contrato:** modelos de resposta e erro seguem exatamente o Contrato de Integração da história e o padrão de API do projeto. Não inventar campos.
- **Estados de tela:** toda tela que carrega dados trata **carregando, vazio, erro e sucesso**. Mensagens de erro vêm do contrato, em linguagem do usuário.
- **Formulários:** validação no cliente espelha os limites do contrato (tamanhos, obrigatoriedade). A validação do servidor continua sendo a autoridade.
- **Datas e horas:** a API trabalha em UTC. Converta para o fuso do usuário **apenas na apresentação**, em um único utilitário. Nunca fazer aritmética de data em string.
- **Segredos e tokens:** nenhum segredo no código. Tokens de acesso ficam em memória; persistência de refresh segue a decisão do projeto. Nunca registrar token em log.
- **Configuração de ambiente:** por `--dart-define` ou arquivo de configuração não versionado com segredos.
- **Lint:** `flutter analyze` sem avisos. Regras do `analysis_options.yaml` do projeto não são desativadas para passar.
- **Acessibilidade e responsividade básicas:** campos com rótulo, botões com texto ou `semanticLabel`, layout que não quebra em largura de desktop e tablet.
- **Referência visual externa:** se o `AGENTS.md` indicar uma referência externa, ela serve **apenas** de guia visual e de comportamento; nunca copie código dela para o módulo.

## 2. TDD (ordem obrigatória)

Para cada cenário da história:

1. **Vermelho:** escreva o teste que traduz o "Dado/Quando/Então". Rode e veja **falhar pelo motivo certo**.
2. **Verde:** escreva o mínimo de código que o faz passar.
3. **Refatore** mantendo tudo verde.

Tipos de teste:

| Tipo | Quando | Ferramentas |
|---|---|---|
| Unitário | Notifier/provider, repository, utilitários | `flutter_test`, `mocktail`, `ProviderContainer` com overrides |
| Widget | Tela e interação (digitar, tocar, ver mensagem) | `flutter_test` (`testWidgets`), `ProviderScope` com overrides |

Regras:

- A API é **sempre simulada** nos testes (override do repository ou adaptador do dio com `mocktail`). Teste nunca acessa rede real.
- Cenário de interface é testado como **widget test** que executa o "Quando" (toque, digitação) e verifica o "Então" visível (texto, estado, rota atual).
- Use `find.byKey` para elementos que o teste precisa localizar; chaves estáveis e descritivas.
- Testes independentes entre si. Sem `Future.delayed` real: use `pump`/`pumpAndSettle` e relógio controlado.
- Parametrize variações de dados e use helpers/builders para montar cenários, mantendo cada teste simples e legível.
- Estrutura Arrange-Act-Assert em cada teste.
- Asserções específicas. Proibido teste sem `expect` significativo.

## 3. Citação do ID do cenário no teste

O ID qualificado `HIST-XXX-<dominio>/Cxx` deve aparecer **no texto da descrição** do `test`/`testWidgets`. Exemplo:

```dart
testWidgets('HIST-003-projeto/C02 - criar projeto com nome no tamanho máximo',
    (tester) async {
  // ...
});
```

Regras:

- O ID fica no início da descrição, seguido de ` - ` e do nome do comportamento.
- Um teste cita o ID do cenário que verifica. Um teste **parametrizado** (laço sobre casos, cada caso com descrição própria) pode cobrir variações do mesmo cenário (um ID) ou cenários diferentes (IDs separados por vírgula), desde que as asserções cubram o "Então" de cada um.
- Descrição do teste: ID, depois cenário e resultado esperado (`HIST-003-projeto/C02 - nome no limite máximo resulta em projeto criado`).
- Nenhum teste existe sem cenário de origem.

## 4. Comandos (executados na pasta do módulo)

| Objetivo | Comando |
|---|---|
| Dependências | `flutter pub get` |
| Análise estática | `flutter analyze` |
| Suíte completa + cobertura | `flutter test --coverage` |
| Verificar o mínimo de cobertura | `node ../tools/gates/verificar.js lcov coverage/lcov.info --min auto` |
| Teste específico | `flutter test test/caminho/arquivo_test.dart` |
| Formatação (linha de 120) | `dart format --output=none --set-exit-if-changed --line-length 120 lib test` |
| Regras de estilo (`padrao-codigo`) | `node ../tools/gates/verificar.js qualidade lib test` |
| Build web (sanidade) | `flutter build web` |

- `--min auto` lê o mínimo de cobertura do `AGENTS.md`. Para outro valor, use `--min <N>`.
- O caminho `../tools/gates/verificar.js` considera o módulo na pasta de primeiro nível do repositório. Ajuste se a pasta do módulo estiver mais profunda.
- O comando de cobertura `lcov` é entregue junto com o script de verificações do framework. Cobertura abaixo do mínimo **faz o CI falhar**.
- O CI executa formatação, `flutter analyze`, `qualidade`, `flutter test --coverage` e a verificação `lcov`, nessa ordem.
- O modo `qualidade` é entregue junto com o script de verificações do framework.

## 5. Padrão de código (`padrao-codigo`)

Aplicam-se todas as regras da skill `padrao-codigo`. Verificação nesta stack (configurações-modelo em `ai/templates/qualidade/flutter/`, entregues com o CI):

| Regra | Verificação | Tipo |
|---|---|---|
| Q-01 linha ≤ 120 | `dart format --line-length 120` e modo `qualidade` | O |
| Q-02 classe ≤ 100 linhas | Modo `qualidade` (conta linhas de código sem comentários, brancos e imports) | O |
| Q-03 método ≤ 20 linhas | Modo `qualidade` | O |
| Q-04 ≤ 3 parâmetros | Modo `qualidade` | O |
| Q-05 hard code | Modo `qualidade` para textos (texto de negócio fora das classes de constantes e de mensagens); números e limites de negócio: leitura do `agente-testes` | O |
| Q-06 log centralizado | Lint `avoid_print` como erro; só a classe de logging usa o pacote de log | O |
| Q-07 mensagens centralizadas | Modo `qualidade` e leitura do `agente-testes` | O |
| Q-08 nomes | Convenção Dart: tipos em `UpperCamelCase`; membros, variáveis e constantes em `lowerCamelCase`; arquivos e pastas em `snake_case`. Lints `camel_case_types`, `non_constant_identifier_names`, `constant_identifier_names`, `file_names` | O |
| Q-09 código morto | Analisador (`unused_import`, `unused_element`, `unused_local_variable`, `unused_field`) tratado como erro | O |
| Q-12 duplicação | Leitura do `agente-testes` | R |
| Q-10, Q-11, Q-13 a Q-18 | Leitura do `agente-testes` | R |

- O marcador `qualidade-exceção: <motivo>` é reconhecido pelo modo `qualidade`.
- Widgets: `build` com mais de 20 linhas deve ser decomposto em widgets ou métodos menores (Q-03).
- O modo `qualidade` para Dart é heurístico (não é um analisador sintático completo). Falso positivo se corrige no script, nunca afrouxando a regra.

## 6. Checklist de qualidade (usado pelo agente-testes)

Classificação: **B** = bloqueante (compromete corretude, segurança ou manutenibilidade); **E** = estilístico (registrar, não bloqueia).

| ID | Item | Tipo |
|---|---|---|
| F-01 | Estado e lógica em providers/notifiers; widgets só apresentam e disparam ações | B |
| F-02 | Widgets não chamam `dio` nem a API diretamente (passam por repository) | B |
| F-03 | Modelos de requisição e resposta conformes ao Contrato de Integração, sem campos inventados | B |
| F-04 | Telas com dados tratam carregando, vazio, erro e sucesso | B |
| F-05 | Validações de formulário espelham os limites do contrato | B |
| F-06 | Rotas centralizadas no go_router; rotas protegidas redirecionam usuário não autenticado | B |
| F-07 | Datas recebidas em UTC e convertidas apenas na apresentação | B |
| F-08 | Nenhum segredo ou token em código, log ou arquivo versionado | B |
| F-09 | Testes não acessam rede real; API simulada | B |
| F-10 | Todo teste tem `expect` significativo e cita um ID de cenário | B |
| F-11 | `flutter analyze` sem avisos | B |
| F-17 | Regras obrigatórias Q-01 a Q-09 sem violação (resultado do job de CI; cite o job e o local) | B |
| F-12 | Nenhum código copiado da referência visual externa | B |
| F-13 | Chaves estáveis (`Key`) nos elementos usados pelos testes | E |
| F-14 | Widgets extraídos quando o `build` fica longo ou repetitivo | E |
| F-15 | Rótulos e textos acessíveis em campos e botões | E |
| F-16 | Nomes e organização de pastas consistentes com o restante do módulo | E |
| F-18 | Regras recomendadas Q-10 a Q-18: cada alerta registrado com local (bloqueante só se compromete corretude ou manutenção) | E |

## O que nunca fazer

- Nunca colocar chamada HTTP ou regra de negócio dentro de widget.
- Nunca acessar rede real em teste.
- Nunca escrever código antes do teste vermelho.
- Nunca baixar o mínimo de cobertura nem excluir arquivos da medição para passar.
- Nunca criar tela, campo ou fluxo que a história aprovada não pede.
- Nunca copiar código da referência visual externa.
- Nunca desligar lints nem afrouxar o modo `qualidade` para passar.
