---
name: design-system-taskflow
description: Usar ao construir ou auditar telas e componentes do módulo frontend do TaskFlow a partir da referência visual versionada em docs/referencia-visual/. Define tokens (theme), mapeamento da referência web para React Native Web, regras de reaproveitamento e o padrão de galeria de estados.
---

# Design system do TaskFlow (frontend)

Esta skill orienta como transformar a referência visual (`docs/referencia-visual/`, somente leitura) em telas React Native Web. Ela **não** define regras de negócio nem de stack: para isso valem os documentos do projeto e a skill `stack-react-native-web`. Em conflito, **vale a documentação da V1**, e a divergência é registrada em "Pontos em aberto".

## 1. Fontes e precedência

| Ordem | Fonte | Para quê |
|---|---|---|
| 1 | `docs/especificacao/`, `docs/requisitos/`, Padrão de API, história aprovada | O que construir |
| 2 | `docs/referencia-visual-indice.md` | Qual parte da referência corresponde a cada tela e o que ignorar |
| 3 | `docs/referencia-visual/briefing-referencia-visual.md` | Papéis, validações, fluxos, erros, estados, dados fictícios |
| 4 | `docs/referencia-visual/catalogo-componentes.md` e `tokens/index.css` | Aparência dos componentes e valores de design |

Item marcado ⚪ ou ❓ no índice não é implementado. `[LACUNA]` do briefing vai para "Pontos em aberto" da história.

## 2. Tokens (`theme`)

- Os tokens vivem em **um único módulo** (`src/core/theme`), exportando cores, espaçamentos, raios, sombras, tipografia e breakpoints. Nenhum valor de design solto em componente.
- Origem: variáveis de `tokens/index.css` (cores em HSL, raio, espaço de página, sombras). Converta para constantes TypeScript; não importe o CSS.
- Cores semânticas obrigatórias: primária, fundo, superfície, texto, texto secundário, borda, destrutiva, e as de **status** (pendente, desenvolvimento, testes, finalizado) com versão suave, e de **prioridade** (baixa, média, alta).
- Tipografia: família da referência (Manrope) carregada por `expo-font`; a escala segue o catálogo.
- Breakpoints de referência: 767, 900 e 1100 px. Use um hook único de largura da janela; não espalhe consultas de largura pelas telas.

## 3. Mapeamento web → React Native Web

| Referência (web) | Em React Native Web |
|---|---|
| `div`, `section`, `main` | `View` |
| Texto | `Text` (nunca texto solto em `View`) |
| `button`, `Link`, `NavLink` | `Pressable`; navegação com `Link`/`router` do Expo Router |
| `input`, `textarea` | `TextInput` (com rótulo e mensagem de erro associados) |
| `select`, `datalist` | Seletor próprio (lista em `Modal`); data via componente de data |
| `dialog`/Radix | `Modal` com foco e fechamento por botão e por tecla Esc na web |
| `table` | Lista de linhas (`FlatList`); no celular, cartões |
| Classes Tailwind e `.tf-*` | `StyleSheet` com tokens do `theme` |
| `lucide-react` | `lucide-react-native` |
| `sonner` (toast) | Componente de aviso único do módulo |
| Kanban em colunas | `ScrollView` horizontal de colunas com lista vertical por coluna |

## 4. Regras de reaproveitamento

1. **Componentes `.tsx` da referência não são portados.** A aparência vem do catálogo e dos tokens.
2. **Textos e mensagens da referência podem ser reaproveitados** (rótulos, títulos, erros, estados vazios), centralizados no módulo de mensagens (Q-07).
3. **Motor mock:** `docs/referencia-visual/motor-mock/` só é portado seguindo `docs/referencia-visual/ADAPTACAO-RN.md`, como mock de desenvolvimento e regras de UX. Permissões, transições e demais regras de negócio vivem no backend. O módulo mock fica isolado atrás da mesma interface do módulo `api`, e o app o troca pelo cliente real por configuração.
4. **Seed e testes do mock** servem de base para dados de teste e para cenários Gherkin; cada cenário aproveitado segue a skill `padrao-cenarios-gherkin`.
5. **Rotas:** `docs/referencia-visual/routes.ts` orienta a estrutura de `app/`; os caminhos públicos (`/invite/{token}`, `/redefinir-senha/{token}`) seguem a Especificação.
6. Controles do protótipo (acesso por papel/cenário, botões "acessar como") **nunca** entram no app.

## 5. Componentes e estados

- Construa primeiro os componentes base do catálogo (marca, avatar, selos de status e prioridade, campo, estado vazio, retorno de carregando/erro/sem permissão, botão de envio, cabeçalho de página), depois as telas.
- Toda tela trata os estados do checklist do briefing (§9): preenchido, carregando, vazio, erro, enviando, validação, sem permissão, dados extremos, sucesso, sem resultados e contagens zero, quando aplicável.
- Dados extremos: títulos de 200 e nomes de projeto de 150 caracteres, descrição de 5000 e 10 tags não podem quebrar o leiaute.
- Em ambiente de desenvolvimento, mantenha uma **galeria de estados** (rota restrita a desenvolvimento) para revisão visual das telas e dos estados. Ela não vai para produção.
- Ações destrutivas usam confirmação; ações negadas por papel não aparecem para quem não tem permissão (o servidor continua sendo a autoridade).

## 6. Checklist (usado pelo agente-testes)

| ID | Item | Tipo |
|---|---|---|
| D-01 | Nenhum valor de design (cor, espaçamento, raio) solto fora do `theme` | B |
| D-02 | Tela implementada corresponde a uma tela do índice marcada como liberada; nada de ⚪ ou ❓ | B |
| D-03 | Nenhum controle do protótipo (acesso por papel, "acessar como") no app | B |
| D-04 | Estados da tela cobertos conforme o checklist do briefing | B |
| D-05 | Textos centralizados; mensagens de erro vindas do contrato | B |
| D-06 | Permissões refletidas na interface sem substituir a validação do servidor | B |
| D-07 | Layout íntegro com dados extremos e nas larguras de celular, tablet e desktop | E |
| D-08 | Acessibilidade: rótulos, papéis e foco em modais | E |

## O que nunca fazer

- Nunca copiar componentes `.tsx`, classes Tailwind ou lógica de estado da referência.
- Nunca alterar `docs/referencia-visual/` numa história de implementação.
- Nunca decidir sozinho uma lacuna do briefing: registre em "Pontos em aberto".
- Nunca reproduzir regra de negócio do mock como se fosse a regra real.
