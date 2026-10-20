# HIST-001-fundacao — Estrutura inicial dos módulos

## Visão geral

Entrega a base executável dos módulos `backend` (Java 21, Spring Boot) e `frontend` (Expo, React Native Web, TypeScript), verificável pelos workflows de CI já existentes, com cobertura mínima de 80%. No `frontend`, inclui a base de rotas, a base do cliente HTTP e o port do motor mock da referência visual, conforme `docs/referencia-visual/ADAPTACAO-RN.md`. A primeira atividade do frontend é validar `docs/referencia-visual-indice.md`.

Fora de escopo: regras e endpoints de negócio (histórias dos domínios), configuração por ambiente, migração Flyway, RFC 7807, `Clock` e porta de e-mail (`HIST-002-fundacao`), renovação de token (`HIST-003-auth`) e qualquer alteração em `.github/`, `ai/` e `tools/`.

Dependências: nenhuma. É a primeira história do backlog.

## Domínio

fundacao

## Origem

- Backlog, "Ordem de dependência" (linha `fundacao`) e "Observações".
- Domínio, seção 2 (vocabulário de domínios).
- Decisões técnicas, DT-01 a DT-04, DT-11 e DT-15.
- Requisitos, RNF-05, RNF-06 e RNF-08.
- Padrão de API, seções 2.1 e 4.
- Índice da referência visual, seções 1, 3, 4 e 5.
- `docs/referencia-visual/ADAPTACAO-RN.md`, tabela de ajustes e "Ordem sugerida".
- `AGENTS.md`, seções "Módulos" e "Referência visual".

## Requisitos funcionais

1. O `backend` existe como projeto Maven executável, com wrapper `mvnw`, as configurações de qualidade de `ai/templates/qualidade/java/` e o JaCoCo com mínimo de cobertura lido da propriedade `cobertura.minima`.
   - Critério de aceitação: `bash ./mvnw -B verify` na pasta `backend/` conclui com sucesso, com cobertura de linhas de pelo menos 80%, sem excluir código de produção da medição.
2. O `frontend` existe como projeto Expo com Expo Router, TypeScript e Jest, com as configurações de `ai/templates/qualidade/react-native-web/`.
   - Critério de aceitação: na pasta `frontend/`, `npm ci`, `npx prettier --check .`, `npx eslint . --max-warnings 0`, `npx tsc --noEmit` e `npx jest --coverage` concluem com sucesso, e `node ../tools/gates/verificar.js lcov coverage/lcov.info --min auto` confirma cobertura de pelo menos 80%.
3. O `frontend` exporta a aplicação para web.
   - Critério de aceitação: `npx expo export --platform web` conclui com sucesso, sem importar código de `docs/referencia-visual/`.
4. Cada módulo tem a estrutura mínima que os workflows de CI existentes esperam, sem alteração em `.github/`.
   - Critério de aceitação: a pasta `backend/` contém `pom.xml` e `mvnw`, e a pasta `frontend/` contém `package.json`, `jest.config.js` e `app/`; cada módulo tem um teste que verifica esses arquivos.
5. O `frontend` tem a estrutura base de rotas do Expo Router, com arquivos finos em `app/` e sem conteúdo funcional de negócio na rota inicial.
   - Critério de aceitação: o mapa de rotas do `frontend` contém apenas as rotas da V1 liberadas pelo índice da referência visual, e a rota inicial renderiza sem texto de negócio.
6. O `frontend` tem uma instância única de `axios`, configurada por ambiente, que converte respostas `application/problem+json` em erro tipado com o campo `codigo` (DT-04).
   - Critério de aceitação: com a API simulada, uma resposta `application/problem+json` com `codigo` resulta em erro tipado cujo `codigo` é o enviado; a URL base vem de variável `EXPO_PUBLIC_*` sem segredo.
7. O motor mock (`engine.ts`, `seed.ts` e `engine.test.ts`) é portado para o `frontend` como mock de desenvolvimento e regras de UX, com os ajustes de `ADAPTACAO-RN.md`, atrás da mesma interface do módulo `api` e sem substituir o backend.
   - Critério de aceitação: os testes portados do motor passam no Jest; a validação de senha conta bytes UTF-8 sem `TextEncoder`; os tokens vêm de uma função `novoToken()`; o relógio é injetado; o código portado passa no ESLint do template sem exceções, com arquivos de produção de até 100 linhas e funções de até 20.
8. O índice `docs/referencia-visual-indice.md` é validado antes de qualquer trabalho visual, e itens marcados ⚪ ou ❓ não são implementados.
   - Critério de aceitação: nenhum controle do protótipo ("acessar como", seletor de papel ou cenário) existe nas rotas ou no código do `frontend`.

## Requisitos não-funcionais

- RNF-05: a aplicação web inicial permanece utilizável em 360 px, 768 px e 1280 px, sem rolagem horizontal.
- RNF-06: a aplicação web inicial e sua navegação-base são compatíveis com Chrome, Edge e Firefox (últimas 2 versões estáveis) e Safari 16 ou superior. Os fluxos de negócio serão verificados nas histórias que os entregarem.
- RNF-08: não se aplica. A história não entrega endpoints nem processamento de tarefas.
- Cobertura mínima de 80% em cada módulo, sem excluir código de produção da medição.

## Cenários Gherkin

Cenário: [C01] Verificar o backend com cobertura mínima
  Dado que o backend está criado com Java 21 e o Docker está disponível para o Testcontainers
  Quando o comando `bash ./mvnw -B verify` é executado na pasta `backend/`
  Então o build conclui com sucesso
  E a cobertura de linhas é de pelo menos 80%

Cenário: [C02] Verificar o frontend com cobertura mínima
  Dado que o frontend está criado com Node 22
  Quando a formatação, o lint, a verificação de tipos e `npx jest --coverage` são executados na pasta `frontend/`
  Então todas as etapas concluem sem erro nem aviso
  E a cobertura de linhas no `lcov.info` é de pelo menos 80%

Cenário: [C03] Exportar o frontend para web
  Dado que o frontend passa na verificação de tipos
  Quando o comando `npx expo export --platform web` é executado
  Então a exportação conclui com sucesso

Cenário: [C04] Reconhecer a estrutura mínima do backend
  Dado o módulo `backend` declarado no `AGENTS.md`
  Quando a pasta `backend/` é inspecionada
  Então ela contém `pom.xml` e `mvnw`

Cenário: [C05] Reconhecer a estrutura mínima do frontend
  Dado o módulo `frontend` declarado no `AGENTS.md`
  Quando a pasta `frontend/` é inspecionada
  Então ela contém `package.json`, `jest.config.js` e a pasta `app/`

Cenário: [C06] Abrir a rota inicial sem conteúdo de negócio
  Dado que o frontend tem a estrutura base de rotas
  Quando a rota inicial é renderizada
  Então a tela é exibida sem texto de negócio nem tela inicial provisória

Cenário: [C07] Converter erro problem+json em erro tipado
  Dado que a API simulada responde `application/problem+json` com `codigo` igual a `RECURSO_NAO_ENCONTRADO`
  Quando o cliente HTTP recebe a resposta
  Então ele lança um erro tipado com `codigo` igual a `RECURSO_NAO_ENCONTRADO`

Cenário: [C08] Portar o motor mock com seus testes
  Dado que o motor mock foi portado com os ajustes de `ADAPTACAO-RN.md`
  Quando a suíte de testes do motor é executada no Jest
  Então todos os testes do motor passam

Cenário: [C09] Aceitar senha com exatamente 72 bytes
  Dado uma senha válida com acentos que ocupa exatamente 72 bytes em UTF-8
  Quando a validação de senha do motor é executada
  Então a senha é aceita

Cenário: [C10] Rejeitar senha com 73 bytes
  Dado uma senha com acentos que ocupa 73 bytes em UTF-8
  Quando a validação de senha do motor é executada
  Então a senha é rejeitada sem ser truncada

Cenário: [C11] Não incluir controles do protótipo
  Dado o índice da referência visual marca os controles "acessar como" como fora da V1
  Quando as rotas e os componentes do frontend são inspecionados
  Então nenhum controle de acesso por papel ou cenário do protótipo existe

## Contrato de Integração

Não se aplica. A história não define endpoints de negócio.

## Plano de execução

- Módulos ativados: backend, frontend
- Modo: sequencial
- Justificativa: a história ativa dois módulos e não tem Contrato de Integração completo (skill `criterio-fluxo-execucao`, passo 2); o backend vem primeiro e o frontend depois.

## Decisões técnicas relevantes

- Seguir DT-01 a DT-04, DT-11 e DT-15, sem adicionar bibliotecas de estado além de TanStack Query e Zustand.
- Usar os workflows `ci-java-spring` e `ci-react-native-web` sem modificá-los.
- Copiar para os módulos as configurações de `ai/templates/qualidade/` (Checkstyle, PMD, ArchUnit, ESLint, Prettier, `tsconfig`, Jest), sem editar os modelos.
- No port do motor mock: remover o import do `vitest`, usar `expo-crypto` em `novoToken()`, contar bytes UTF-8 sem `TextEncoder`, isolar a formatação de data com `America/Sao_Paulo` e injetar o relógio.
- Permissões, transições de status, convites e demais regras de negócio permanecem no backend; no frontend o motor existe só como mock de desenvolvimento.
- O código portado do motor mock se submete às regras de qualidade do template (Q-01 a Q-09), sem exclusão no ESLint: `engine.ts` e `seed.ts` são divididos em módulos pequenos em `src/mock/` (por exemplo, regras por tema e dados de seed por entidade), com a mesma interface pública do módulo `api`. Os testes portados (`*.test.ts`) não têm limite de linhas por arquivo, só o de 20 linhas por função.
- O frontend centraliza mensagens e log (Q-06 e Q-07); `console` só em `src/core/logger.ts`.
- A rota inicial `/` renderiza uma tela neutra, sem texto de negócio. A tela inicial provisória pertence a `HIST-001-auth`.
- O `theme.ts` (tokens de `tokens/index.css`) não entra aqui: é criado em `src/core/theme` na primeira história de interface, `HIST-001-auth`.
- Os tipos `Status`, `Role` e `Priority` do mock ficam escritos à mão em `src/core/types`, com os mesmos valores `UPPER_SNAKE_CASE` do Padrão de API. A geração de tipos pelo OpenAPI segue adiada.
- Os diretórios `.github/`, `ai/`, `tools/` e `docs/referencia-visual/` não são alterados (regra 2 do `AGENTS.md`); o diff é conferido no Gate 3, sem cenário próprio.

## Pontos em aberto

Nenhum. Se a CI exigir mudança em `.github/`, `ai/` ou `tools/`, o trabalho para e aguarda decisão humana.
