---
name: stack-react-native-web
description: Usar ao implementar ou auditar um módulo de interface em React Native Web (Expo, Expo Router, TypeScript) com TanStack Query, Zustand e axios. Define padrões de código, TDD com Jest e React Native Testing Library, formato de citação dos IDs de cenário nos testes, comandos de teste e cobertura, e o checklist de qualidade usado pelo agente-testes.
---

# Stack: React Native Web

Esta skill é a régua de um módulo de interface em React Native Web (Expo). O `construtor` a segue; o `agente-testes` a aplica na auditoria. Decisões específicas do projeto (camadas, tema, fluxo de autenticação, referência visual) ficam nos documentos do projeto listados no `AGENTS.md`. Em caso de conflito, **vale o documento do projeto**, e a divergência é registrada em "Pontos em aberto".

## 1. Estrutura e padrões

- **Linguagem:** TypeScript com `strict` ligado. Proibido `any` implícito; `any` explícito exige `qualidade-exceção`.
- **Organização por funcionalidade (feature-first):** cada funcionalidade tem `api` (acesso à API), `model` (tipos e regras de interface) e `ui` (telas e componentes). Código compartilhado fica em `src/core` ou `src/shared`. Se o projeto definir outra divisão de camadas, siga a do projeto.
- **Navegação:** Expo Router. As rotas ficam na pasta `app/` e são **arquivos finos**: só montam a tela da funcionalidade. Proteção de rotas por redirecionamento no layout raiz (usuário sem sessão vai ao login).
- **Estado de servidor:** TanStack Query (consultas e mutações). Chaves de consulta centralizadas por funcionalidade.
- **Estado de cliente:** Zustand (sessão, preferências de interface). Estado e lógica ficam em hooks e stores, nunca dentro do corpo do componente. O componente só desenha e dispara ações.
- **HTTP:** axios, em uma única instância configurada (base URL por configuração de ambiente, interceptores de autenticação e de erro). Componentes nunca usam `axios` diretamente: passam por funções do módulo `api` da funcionalidade.
- **Contrato:** modelos de resposta e erro seguem exatamente o Contrato de Integração da história e o padrão de API do projeto. Não inventar campos.
- **Estados de tela:** toda tela que carrega dados trata **carregando, vazio, erro e sucesso**. Mensagens de erro vêm do contrato, em linguagem do usuário.
- **Formulários:** validação no cliente espelha os limites do contrato (tamanhos, obrigatoriedade). A validação do servidor continua sendo a autoridade.
- **Datas e horas:** a API trabalha em UTC. Converta para o fuso do usuário **apenas na apresentação**, em um único utilitário. Nunca fazer aritmética de data em string.
- **Segredos e tokens:** nenhum segredo no código. Variáveis `EXPO_PUBLIC_*` vão para o pacote do navegador e são **públicas**: nunca coloque segredo nelas. Persistência de tokens segue a decisão do projeto (DT-05). Nunca registrar token em log.
- **Plataforma:** o alvo é web. Evite APIs do DOM (`document`, `window`) fora de módulos de plataforma (`*.web.ts`/`*.web.tsx`) para não amarrar a base à web sem necessidade.
- **Lint e tipos:** `eslint`, `prettier` e `tsc --noEmit` sem avisos. Regras do projeto não são desativadas para passar.
- **Acessibilidade e responsividade básicas:** campos com rótulo, botões com texto ou `accessibilityLabel`, `accessibilityRole` onde couber, layout que não quebra em largura de celular, tablet e desktop.
- **Referência visual:** a referência está em `docs/referencia-visual/` (somente leitura). Siga a skill `design-system-taskflow` e o `AGENTS.md`: da referência usa-se aparência, textos, fluxos e estados; nunca componentes `.tsx` nem lógica do protótipo. O motor mock só é portado seguindo `docs/referencia-visual/ADAPTACAO-RN.md`.

## 2. TDD (ordem obrigatória)

Para cada cenário da história:

1. **Vermelho:** escreva o teste que traduz o "Dado/Quando/Então". Rode e veja **falhar pelo motivo certo**.
2. **Verde:** escreva o mínimo de código que o faz passar.
3. **Refatore** mantendo tudo verde.

Tipos de teste:

| Tipo | Quando | Ferramentas |
|---|---|---|
| Unitário | Hooks, stores, funções de `api`, utilitários | `jest` (preset `jest-expo`), `renderHook` |
| Componente/tela | Tela e interação (digitar, tocar, ver mensagem) | `@testing-library/react-native` |

Regras:

- A API é **sempre simulada** nos testes (mock do módulo `api` ou adaptador do axios simulado). Teste nunca acessa rede real.
- Cenário de interface é testado executando o "Quando" (toque, digitação) e verificando o "Então" visível (texto, estado, rota atual).
- Localize elementos por papel, rótulo ou texto; use `testID` estável para o que não tiver alternativa.
- Testes independentes entre si. Sem `setTimeout` real: use timers falsos do Jest e `waitFor`.
- Cada consulta do TanStack Query roda em um `QueryClient` novo por teste, com `retry: false`.
- Parametrize variações de dados (`it.each`) e use helpers/builders para montar cenários, mantendo cada teste simples e legível.
- Estrutura Arrange-Act-Assert em cada teste.
- Asserções específicas. Proibido teste sem `expect` significativo.
- **Pasta e formato:** os testes ficam em `<modulo>/__tests__/`, espelhando `src/`, com nome `*.test.ts` ou `*.test.tsx`. Teste ao lado do código-fonte não é rastreado pela verificação de entrega.
- Escreva os `it` no nível do arquivo. `describe` só é aceito se cada `it` interno respeitar o limite de Q-03; a função do `describe` conta como função (use `qualidade-exceção` com motivo, se necessário).

## 3. Citação do ID do cenário no teste

O ID qualificado `HIST-XXX-<dominio>/Cxx` deve aparecer **no texto da descrição** do `it`/`test`. Exemplo:

```ts
it('HIST-003-projeto/C02 - criar projeto com nome no tamanho máximo', async () => {
  // ...
});
```

Regras:

- O ID fica no início da descrição, seguido de ` - ` e do nome do comportamento.
- Um teste cita o ID do cenário que verifica. Um teste **parametrizado** (`it.each`, cada caso com descrição própria) pode cobrir variações do mesmo cenário (um ID) ou cenários diferentes (IDs separados por vírgula), desde que as asserções cubram o "Então" de cada um.
- Descrição do teste: ID, depois cenário e resultado esperado (`HIST-003-projeto/C02 - nome no limite máximo resulta em projeto criado`).
- Nenhum teste existe sem cenário de origem.

## 4. Comandos (executados na pasta do módulo)

| Objetivo | Comando |
|---|---|
| Dependências | `npm ci` |
| Formatação (linha de 120) | `npx prettier --check .` |
| Lint (Q-01 a Q-09) | `npx eslint . --max-warnings 0` |
| Tipos | `npx tsc --noEmit` |
| Suíte completa + cobertura | `npx jest --coverage` |
| Verificar o mínimo de cobertura | `node ../tools/gates/verificar.js lcov coverage/lcov.info --min auto` |
| Teste específico | `npx jest __tests__/caminho/arquivo.test.tsx` |
| Build web (sanidade) | `npx expo export --platform web` |

- `--min auto` lê o mínimo de cobertura do `AGENTS.md`. Para outro valor, use `--min <N>`.
- O caminho `../tools/gates/verificar.js` considera o módulo na pasta de primeiro nível do repositório. Ajuste se a pasta do módulo estiver mais profunda.
- A cobertura é medida sobre `src/` e `app/` (`collectCoverageFrom` no modelo de `jest.config.js`) e gera `coverage/lcov.info`. Cobertura abaixo do mínimo **faz o CI falhar**. Nunca exclua arquivos da medição para passar.
- O CI executa formatação, lint, tipos, testes com cobertura, verificação `lcov` e o build web, nessa ordem.
- O modo `qualidade` do `verificar.js` **não** é usado no frontend: as regras de estilo são verificadas pelo ESLint.

## 5. Padrão de código (`padrao-codigo`)

Aplicam-se todas as regras da skill `padrao-codigo`. Verificação nesta stack (configurações-modelo em `ai/templates/qualidade/react-native-web/`, entregues com o CI):

| Regra | Verificação | Tipo |
|---|---|---|
| Q-01 linha ≤ 120 | Prettier (`printWidth: 120`) e ESLint `max-len` | O |
| Q-02 classe ≤ 100 linhas | ESLint `max-lines` por arquivo de produção (100 linhas sem comentários e brancos). No frontend o limite vale para o componente/módulo, pois quase não há classes. | O |
| Q-03 método ≤ 20 linhas | ESLint `max-lines-per-function` (20, sem comentários e brancos), em produção e teste | O |
| Q-04 ≤ 3 parâmetros | ESLint `max-params` (3). Componente recebe um único objeto de props. | O |
| Q-05 hard code | ESLint: texto de negócio em atributos (`placeholder`, `label`, `title`, `accessibilityLabel`) e em `Alert` é bloqueado; números e limites de negócio: leitura do `agente-testes` | O |
| Q-06 log centralizado | ESLint `no-console` como erro; só `src/core/logger.ts` pode usar `console` | O |
| Q-07 mensagens centralizadas | ESLint `react/jsx-no-literals` (texto solto em JSX) e leitura do `agente-testes` | O |
| Q-08 nomes | Tipos, interfaces e componentes em `PascalCase`; funções, variáveis e hooks (`useXxx`) em `camelCase`; constantes de módulo em `UPPER_SNAKE_CASE`; arquivos de componente `PascalCase.tsx`, demais `camelCase.ts`; arquivos de `app/` seguem o padrão do Expo Router. ESLint `@typescript-eslint/naming-convention` (identificadores); nome de arquivo por leitura do `agente-testes` | O |
| Q-09 código morto | ESLint `@typescript-eslint/no-unused-vars` e `no-unreachable` como erro, `noUnusedLocals`/`noUnusedParameters` no `tsconfig`; código comentado por leitura do `agente-testes` | O |
| Q-12 duplicação | Leitura do `agente-testes` | R |
| Q-10, Q-11, Q-13 a Q-18 | Leitura do `agente-testes` | R |

- **Exceção justificada:** `// eslint-disable-next-line <regra> -- qualidade-exceção: <motivo>`. A regra de comentários do ESLint exige o motivo e proíbe diretiva sem uso.
- Componente com mais de 20 linhas deve ser decomposto em subcomponentes ou hooks menores (Q-03).
- Falso positivo se corrige na configuração do ESLint do módulo com justificativa, nunca afrouxando a regra.

## 6. Checklist de qualidade (usado pelo agente-testes)

Classificação: **B** = bloqueante (compromete corretude, segurança ou manutenibilidade); **E** = estilístico (registrar, não bloqueia).

| ID | Item | Tipo |
|---|---|---|
| R-01 | Estado e lógica em hooks, stores e consultas; componentes só apresentam e disparam ações | B |
| R-02 | Componentes não chamam `axios` nem a API diretamente (passam pelo módulo `api`) | B |
| R-03 | Modelos de requisição e resposta conformes ao Contrato de Integração, sem campos inventados | B |
| R-04 | Telas com dados tratam carregando, vazio, erro e sucesso | B |
| R-05 | Validações de formulário espelham os limites do contrato | B |
| R-06 | Rotas em `app/` (Expo Router); rotas protegidas redirecionam usuário não autenticado | B |
| R-07 | Datas recebidas em UTC e convertidas apenas na apresentação | B |
| R-08 | Nenhum segredo ou token em código, log, arquivo versionado ou variável `EXPO_PUBLIC_*` | B |
| R-09 | Testes não acessam rede real; API simulada | B |
| R-10 | Todo teste tem `expect` significativo e cita um ID de cenário | B |
| R-11 | `tsc --noEmit`, ESLint e Prettier sem avisos | B |
| R-17 | Regras obrigatórias Q-01 a Q-09 sem violação (resultado do job de CI; cite o job e o local) | B |
| R-12 | Nenhum componente `.tsx` nem lógica de estado copiados da referência visual (o motor mock só entra portado conforme `ADAPTACAO-RN.md`) | B |
| R-13 | `testID` estáveis nos elementos usados pelos testes sem alternativa por papel ou texto | E |
| R-14 | Componentes extraídos quando o corpo fica longo ou repetitivo | E |
| R-15 | Rótulos e papéis de acessibilidade em campos e botões | E |
| R-16 | Nomes e organização de pastas consistentes com o restante do módulo | E |
| R-18 | Regras recomendadas Q-10 a Q-18: cada alerta registrado com local (bloqueante só se compromete corretude ou manutenção) | E |
| R-19 | Sem uso direto de APIs do DOM fora de módulos de plataforma | E |

## O que nunca fazer

- Nunca colocar chamada HTTP ou regra de negócio dentro de componente.
- Nunca acessar rede real em teste.
- Nunca escrever código antes do teste vermelho.
- Nunca baixar o mínimo de cobertura nem excluir arquivos da medição para passar.
- Nunca criar tela, campo ou fluxo que a história aprovada não pede.
- Nunca copiar componentes ou lógica de estado da referência visual.
- Nunca desligar regras do ESLint nem do `tsconfig` para passar.
- Nunca colocar segredo em variável `EXPO_PUBLIC_*`.
