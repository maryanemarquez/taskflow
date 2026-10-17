# Índice da Referência Visual — TaskFlow V1

**Data:** 17/10/2026
**Referência:** `rf-taskflow` (Vite + React + TypeScript + Supabase), mantida **fora do repositório**; o caminho local está na coluna "Referência externa" do módulo `frontend` no `AGENTS.md`
**Telas de destino:** `docs/especificacao/TaskFlow_V1_Especificacao.md`, seção 6

## 1. Finalidade e status

Este índice diz ao `construtor` do módulo `frontend` quais partes da referência visual correspondem às telas da V1 e quais devem ser **ignoradas** por estarem fora do escopo. Como a referência não está no repositório, este índice (que está) é o único registro versionado do que dela se usa. A fronteira de uso está no `AGENTS.md`, seção "Referência externa".

> **Status: classificação preliminar.** O índice foi montado **apenas a partir dos nomes dos arquivos** da referência — o conteúdo deles não foi aberto (a sessão que o criou não tem acesso à pasta). Por isso há itens marcados "validar". **A validação deste índice é a primeira tarefa do frontend**, na história de `fundacao` (Backlog): o `construtor` do `frontend` ou o desenvolvedor abre a referência, resolve os itens ❓ e ajusta este arquivo antes de qualquer tela ser construída.

### Legenda

| Marca | Significado |
|---|---|
| ✅ Liberada | Pode ser usada como referência visual da tela da V1 |
| ⚠️ Parcial | Usar somente o layout dos elementos que existem na V1; ignorar o restante |
| ❌ Ignorar | Fora da V1; não implementar |
| ❓ Validar | Não foi possível classificar pelo nome; **não implementar** até validar |

## 2. Telas da Especificação V1 → referência

| Tela da V1 (Spec §6) | Referência provável | Marca | Observação |
|---|---|---|---|
| 1. Login | `pages/Auth.tsx` | ⚠️ Parcial | Usar só o visual. A tela mistura lógica de autenticação (Supabase), que nunca é usada. |
| 2. Cadastro (com e sem convite) | `pages/Auth.tsx` | ⚠️ Parcial | Visual dos campos; a V1 pede só nome, e-mail e senha (ou nome e senha, por convite). |
| 3. Convite Expirado ou Inválido | — | Sem equivalente | Compor com os padrões visuais de `Auth.tsx` e `NotFound.tsx`. |
| 4. Solicitar Recuperação de Senha | — | Sem equivalente | Compor com os padrões visuais de `Auth.tsx`. |
| 5. Redefinir Senha | — | Sem equivalente | Compor com os padrões visuais de `Auth.tsx`. |
| 6. Dashboard | `pages/Index.tsx` | ⚠️ Parcial | Usar `StatCard` (contagem por status) e `TaskCard` ("Minhas tarefas"). Gráficos de atividade e anéis de progresso são métricas avançadas (fora da V1). |
| 7. Listagem de Projetos | `pages/Projects.tsx` | ⚠️ Parcial | Na criação, a V1 tem só o campo nome; ignorar demais campos de `CreateProjectDialog.tsx`. |
| 8. Detalhe do Projeto | `pages/ProjectDetail.tsx`, `pages/Tasks.tsx` | ⚠️ Parcial | Kanban, Lista e filtros da V1 (responsável, status, tag, prazo). Ignorar o que extrapolar a V1. |
| 9. Criação/Edição de Tarefa | `components/tasks/CreateTaskDialog.tsx`, `components/tasks/TaskContent.tsx`, `pages/TaskDetail.tsx` | ⚠️ Parcial | Usar só os campos da V1: título, descrição, prioridade, tags, prazo e responsável. Ignorar subtarefas, comentários, anexos, tipos de tarefa e demais seções. Sem campo de status no formulário. |
| 10. Membros do Workspace | `pages/Team.tsx` | ⚠️ Parcial | Listagem, convidar, convites pendentes e remover. Ignorar cargos/permissões personalizadas (V2). |
| 11. Busca Global | `components/layout/GlobalSearch.tsx` | ✅ Liberada | Resultados de tarefas e projetos. |
| 12. Configurações de Perfil | `pages/Settings.tsx` | ⚠️ Parcial | Somente nome e senha. Ignorar outras seções de configuração. |
| 13. Sem Workspace | — | Sem equivalente | Compor com os padrões visuais de `NotFound.tsx` (estado informativo com um botão). |

## 3. Componentes e arquivos de apoio

| Arquivo da referência | Marca | Observação |
|---|---|---|
| `components/layout/AppLayout.tsx` | ⚠️ Parcial | Estrutura geral (barra lateral + conteúdo + topo). |
| `components/AppSidebar.tsx` | ⚠️ Parcial | Itens de navegação da V1: Dashboard, Projetos, Membros e Configurações. Ignorar itens de relatórios, parâmetros e demais. |
| `components/layout/GlobalSearch.tsx` | ✅ Liberada | Ver tela 11. |
| `components/layout/ProjectSwitcher.tsx` | ❓ Validar | Troca rápida de projeto não está na Especificação V1. |
| `components/dashboard/StatCard.tsx` | ✅ Liberada | Contagem por status. |
| `components/dashboard/TaskCard.tsx` | ✅ Liberada | Cartão de tarefa (Kanban, Lista, "Minhas tarefas"). |
| `components/dashboard/ActivityChart.tsx` | ❌ Ignorar | Métrica avançada (fora da V1). |
| `components/dashboard/ProgressRing.tsx` | ❌ Ignorar | Métrica avançada (fora da V1). |
| `components/projects/CreateProjectDialog.tsx` | ⚠️ Parcial | Somente o campo nome. |
| `components/projects/ProjectMetrics.tsx` | ❌ Ignorar | Métricas de projeto (fora da V1). |
| `components/projects/ProjectUnitsOverview.tsx` | ❌ Ignorar | Visão por unidades (fora da V1). |
| `components/tasks/CreateTaskDialog.tsx` | ⚠️ Parcial | Ver tela 9. |
| `components/tasks/TaskContent.tsx` | ⚠️ Parcial | Ver tela 9. |
| `components/tasks/TaskActionsMenu.tsx` | ⚠️ Parcial | Somente ações da V1 (editar, excluir para o Proprietário, mudar status). |
| `components/tasks/EditableField.tsx` | ❓ Validar | Edição em linha não está prevista na Especificação (a edição é por formulário). |
| `components/NavLink.tsx` | ❌ Ignorar | Apoio de roteamento do React; sem valor visual. |
| `components/ui/*` | ✅ Liberada | Componentes de interface genéricos (botões, campos, diálogos, tabelas etc.): usar apenas como referência de aparência e comportamento visual, recriando com widgets Flutter. |
| `index.css` | ✅ Liberada | Referência de cores, tipografia, espaçamento e demais tokens visuais. |
| `public/*` (favicon, placeholder, robots) | ❓ Validar | Sem relação com as telas da V1. |

## 4. Páginas da referência sem tela na V1

| Arquivo | Marca | Observação |
|---|---|---|
| `pages/Reports.tsx` | ❌ Ignorar | Relatórios e métricas avançadas estão fora da V1. |
| `pages/Parameters.tsx` | ❓ Validar | Provavelmente parâmetros/cargos de configuração (V2). Não implementar até validar. |
| `pages/NotFound.tsx` | ⚠️ Parcial | Usar só como base visual para estados informativos (tela 13). |

## 5. Regras de uso

1. Esta classificação **não** altera a regra de fronteira do `AGENTS.md` (seção "Referência externa"): da referência usa-se apenas o aspecto visual — nunca lógica de estado, chamadas de API/Supabase, hooks de dados ou autenticação.
2. Tela marcada ❌ ou ❓ não é implementada, mesmo que exista na referência.
3. Em caso de dúvida sobre uma tela ou componente, o `construtor` do `frontend` registra a dúvida em Pontos em Aberto da história, em vez de decidir sozinho.
4. Ao validar a referência, atualizar este índice (principalmente os itens ❓ e a coluna "Referência provável") e manter a data.
