# Catálogo de Componentes Visuais — referência web → React Native Web

Descrição dos componentes do protótipo, na ordem em que aparecem. O código `.tsx` original não foi trazido. Detalhes completos em `briefing-referencia-visual.md` (§5, §7, §8, §9).

**Equivalências gerais:** `div`/`section` → `View`; texto → `Text`; `button`/`Link` → `Pressable` ou `Link` do Expo Router; `input` → `TextInput`; `select` → picker/modal de seleção; `<dialog>` → `Modal`; `<table>` → linhas em `FlatList`; ícones `lucide-react` → `lucide-react-native`; toasts `sonner` → toast nativo.

## 1. Base

| Componente (ref.) | O que mostra | Estados / variações | Em RN Web |
|---|---|---|---|
| `Brand` | Logo (quadrado verde com check) + "TaskFlow." | Link para o dashboard, ou estático (sem workspace) | SVG via `react-native-svg` |
| `Avatar` | Iniciais (2 primeiras palavras) | Cor diferente para Membro; tamanhos normal e pequeno | `View` + `Text` |
| `StatusBadge` / `PriorityBadge` | Selo com ponto colorido e rótulo | 4 status, 3 prioridades | `View` com cores do tema |
| `IconStatus` | Ícone por status (tracejado, ponto, frasco, check) | 4 | Ícone lucide |
| `Field` | Rótulo + campo + erro (`role=alert`) + dica | Normal, erro, desabilitado, com contador | `TextInput` com acessibilidade |
| `Empty` | Ícone de pasta, título, descrição, ação | Com/sem botão por papel | `View` |
| `Feedback` | Carregando (4 esqueletos), erro com "Tentar novamente", sem permissão | 3 | Skeleton + `Empty` |
| `Submit` | Botão com spinner e "Enviando…" | Normal, ocupado, desabilitado | `Pressable` |
| `PageHeading` | Título, subtítulo e ação à direita | — | `View` |
| `TaskActions` | Editar, excluir, retroceder, avançar estágio | Exibição por permissão e posição do status | Ícones em `Pressable` |

## 2. Estrutura da área autenticada (`Layout`)

| Parte | Comportamento |
|---|---|
| Barra lateral | Dashboard, Projetos, Membros, Configurações; bloco do workspace ("Modo Equipe") e "TaskFlow V1" no rodapé. No celular vira gaveta com fundo escurecido. |
| Topo | Botão de menu (celular), busca global, menu do usuário (nome, e-mail, Configurações de Perfil, Sair) |
| Busca global | Painel com Projetos e Tarefas (até 20), estados "digite algo" e "nenhum resultado"; fecha com Esc |
| Breakpoints de referência | 767 / 900 / 1100 px |

## 3. Telas e componentes

| Tela (briefing §7) | Componentes | Observações |
|---|---|---|
| 1–5, 13 Autenticação | `AuthView` com 10 variantes: login, cadastro, convite (conta nova), convite (conta existente), convite inválido, recuperação, redefinição, link inválido, sem workspace, sessão expirada | Estados: preenchido, enviando, validação, erro, sucesso. Os botões "acessar como" do login são só do protótipo e não entram. |
| 6 Dashboard | `DashboardView`: 4 cartões de contagem por status, "Minhas tarefas" (até 6), "Seus projetos" (até 3) | Estados vazio, carregando, erro, zeros, extremos |
| 7 Projetos | `ProjectsView` + `ProjectCard` (nome, contagem, contagem por status; Renomear/Excluir só para o Proprietário) + `ProjectForm` | Nome até 150 caracteres, com contador |
| 8 Projeto | `ProjectView`: alternância Kanban/Lista, 5 filtros (responsável, status, tag, prazo de/até), limpar filtros, "Carregar mais" (20 por vez) | Kanban com 4 colunas; lista vira cartões no celular |
| 9 Tarefa | `TaskForm` (título 200, descrição 5000, prioridade, prazo, tags até 10 com sugestões, responsável) e `TaskDetail` (selos, descrição, responsável, autor, prazo, tags, trocar responsável) | Troca de responsável só no detalhe e só para o Proprietário. Sem campo de status no formulário. |
| 10 Membros | `MembersView`: tabela de membros, convite por e-mail, convites pendentes (renovar, visualizar e-mail) | Remoção com reatribuição obrigatória quando há tarefas |
| 12 Perfil | `ProfileView`: nome e troca de senha (atual, nova, confirmação) | — |
| Confirmações | `ConfirmDialog` destrutivo | Excluir projeto, excluir tarefa, remover membro |
| E-mails (apoio) | `EmailPreview` | Convite e recuperação; apoio visual opcional |

## 4. Tokens principais (resumo)

| Token | Valor de referência |
|---|---|
| Cor primária | `hsl(163 68% 29%)` (verde) |
| Status | pendente, desenvolvimento, testes e finalizado, cada um com versão suave |
| Raio | 0,5 rem |
| Espaço de página | 32 px |
| Fonte | Manrope |

Valores completos em `tokens/index.css`.

## 5. Telas de apoio (fora das 13)

| Tela | Situação | Proposta |
|---|---|---|
| Inicial provisória do workspace | Prevista na V1 (Especificação §6, RF-01). Usada até o Dashboard existir. Conteúdo é lacuna do briefing (§4 e §20). | Página simples: saudação "Olá, {nome}", nome do workspace e atalho para "Projetos". Rotulada como "provisória" na galeria de estados. Aprovar no Gate 1 de `auth`. |
| Sessão expirada | Não é tela dedicada (decisão registrada). | Redirecionar ao login com a mensagem "Sua sessão expirou. Entre novamente." (variante `expired-session` do `AuthView`). Confirmar no Gate 1 de `auth`. |
| 404 e erro genérico | Citadas no briefing (§7) como apoio. | `Empty` com ação "Voltar". Detalhar quando surgir a necessidade. |

## 6. Galeria de estados (padrão a replicar)

A referência tem uma rota de desenvolvimento (`/__estados`) que exibe **24 telas × 11 estados** (preenchido, carregando, vazio, erro, enviando, validação, sem permissão, dados extremos, sucesso, sem resultados, contagens zero) e um seletor de papel/cenário. Recomenda-se uma tela equivalente, só em ambiente de desenvolvimento, para a revisão visual.
