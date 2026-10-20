# HIST-001-dashboard — Resumo e minhas tarefas

## Visão geral

Proprietário e Membro veem, na tela inicial, quantas tarefas o workspace tem em cada status e quantas estão sob a responsabilidade do usuário (“Minhas tarefas”). A tela também dá acesso rápido aos projetos e passa a ser o destino da sessão no lugar da tela inicial provisória.

Fora de escopo: relatórios e métricas avançadas, contagem por autoria, filtros no Dashboard e atualização automática por intervalo (a tela atualiza ao ser aberta, ao voltar o foco à janela e após alterações feitas na própria aplicação).

Dependências: `HIST-001-tarefa`, `HIST-003-tarefa`, `HIST-004-tarefa`, `HIST-005-tarefa`, `HIST-006-tarefa`, `HIST-001-projeto`, `HIST-002-projeto`, `HIST-002-auth` (tela “Sem Workspace”) e `HIST-003-auth` (layout autenticado onde a tela é exibida).

## Domínio

dashboard

## Origem

- Requisitos, RT-02, RF-25, RF-39, RNF-01 e RNF-07.
- Domínio, seções 3 e 5.
- Especificação, seções 3.4, 5, 6 (tela 6), 7.1, 7.2 e 7.5.
- Padrão de API, seções 2.1 e 8.

## Requisitos funcionais

1. O Dashboard informa as contagens do workspace por status.
   - Critério de aceitação: `GET /api/v1/dashboard` responde `200` com `workspace` contendo as quatro contagens (`PENDENTE_A_INICIAR`, `EM_DESENVOLVIMENTO`, `EM_TESTES` e `FINALIZADO`) das tarefas de todos os projetos do workspace do usuário.
2. O Dashboard informa as tarefas do usuário por status.
   - Critério de aceitação: a mesma resposta traz `minhasTarefas` com as quatro contagens das tarefas cujo responsável é o usuário autenticado; tarefas só criadas por ele não entram.
3. Status sem tarefas aparecem com zero.
   - Critério de aceitação: as oito contagens estão sempre presentes e valem `0` quando não há tarefas.
4. As contagens refletem o estado persistido.
   - Critério de aceitação: criação, exclusão, troca de responsável, mudança de status e exclusão de projeto alteram as contagens da próxima consulta, sem cache no servidor.
5. Os dados são isolados por workspace.
   - Critério de aceitação: as contagens consideram só o workspace do usuário; usuário sem workspace recebe `403 SEM_WORKSPACE`.
6. A tela exibe as contagens.
   - Critério de aceitação: a tela mostra um cartão por status com a contagem do workspace e a seção “Minhas tarefas” com as quatro contagens do usuário, usando os mesmos rótulos de status do Kanban.
7. A tela dá acesso rápido aos projetos.
   - Critério de aceitação: a seção “Projetos” lista os 20 primeiros projetos (`GET /api/v1/projetos`), cada um levando a `/projetos/{id}`, e o link “Ver todos” leva à lista de projetos.
8. Workspace sem projetos mostra estado vazio.
   - Critério de aceitação: sem projetos, a seção mostra o estado vazio; o Proprietário vê a ação “Criar primeiro projeto” e o Membro não.
9. O Dashboard substitui a tela inicial provisória.
   - Critério de aceitação: após login, cadastro, aceite de convite ou abertura da raiz da aplicação por usuário com workspace, a tela exibida é o Dashboard; usuário sem workspace continua vendo a tela “Sem Workspace”.
10. A tela se mantém atual.
    - Critério de aceitação: a consulta do Dashboard é refeita ao abrir a tela, ao recuperar o foco da janela e depois de qualquer criação, exclusão ou alteração de tarefa feita pela interface.

## Requisitos não-funcionais

- RNF-01 e RT-02: as contagens são calculadas no backend, só com dados do workspace autenticado.
- RNF-04, RNF-05 e RNF-06: o Dashboard é utilizável em 360 px, 768 px e 1280 px, nos navegadores definidos.
- RNF-07: as contagens são consistentes com o Kanban e a Lista.
- RNF-08: 95% das requisições respondem em até 500 ms em ambiente local de teste, com até 1.000 tarefas por workspace.

## Cenários Gherkin

Cenário: [C01] Contar as tarefas do workspace por status
  Dado tarefas em status diferentes em dois projetos do workspace
  Quando um usuário envia `GET /api/v1/dashboard`
  Então `workspace` traz a contagem correta de cada status

Cenário: [C02] Contar as tarefas do usuário
  Dado tarefas atribuídas ao usuário e a outro membro
  Quando o usuário envia `GET /api/v1/dashboard`
  Então `minhasTarefas` conta só as tarefas atribuídas a ele

Cenário: [C03] Ignorar tarefas só criadas pelo usuário
  Dado uma tarefa criada pelo usuário e atribuída a outro membro
  Quando o usuário envia `GET /api/v1/dashboard`
  Então `minhasTarefas` não conta essa tarefa
  E `workspace` conta essa tarefa

Cenário: [C04] Devolver zero nos status sem tarefas
  Dado um workspace sem tarefas
  Quando um usuário envia `GET /api/v1/dashboard`
  Então as oito contagens estão presentes e valem zero

Cenário: [C05] Refletir a mudança de status
  Dado uma tarefa do usuário em `PENDENTE_A_INICIAR`
  Quando o status dela muda para `EM_DESENVOLVIMENTO`
  Então a próxima consulta mostra uma tarefa a menos em `PENDENTE_A_INICIAR` e uma a mais em `EM_DESENVOLVIMENTO`

Cenário: [C06] Refletir a troca de responsável
  Dado uma tarefa atribuída ao usuário
  Quando o Proprietário a atribui a outro membro
  Então `minhasTarefas` do usuário perde essa tarefa
  E `workspace` mantém a mesma contagem

Cenário: [C07] Refletir a exclusão de tarefa
  Dado uma tarefa do workspace
  Quando o Proprietário a exclui
  Então a contagem do workspace diminui em um

Cenário: [C08] Refletir a exclusão de projeto
  Dado um projeto com tarefas
  Quando o Proprietário exclui o projeto
  Então as tarefas dele deixam de ser contadas

Cenário: [C09] Isolar os dados por workspace
  Dado tarefas em dois workspaces diferentes
  Quando um usuário de um deles consulta o Dashboard
  Então as contagens consideram só as tarefas do seu workspace

Cenário: [C10] Negar o Dashboard a usuário sem workspace
  Dado um usuário autenticado sem vínculo com workspace
  Quando ele envia `GET /api/v1/dashboard`
  Então a resposta é `403 SEM_WORKSPACE`

Cenário: [C11] Exibir os cartões de status
  Dado um workspace com tarefas
  Quando o usuário abre o Dashboard
  Então a tela mostra um cartão por status com a contagem do workspace

Cenário: [C12] Exibir Minhas tarefas
  Dado um usuário com tarefas atribuídas
  Quando ele abre o Dashboard
  Então a seção “Minhas tarefas” mostra as quatro contagens dele

Cenário: [C13] Exibir zero na tela
  Dado um status sem tarefas
  Quando o usuário abre o Dashboard
  Então a contagem desse status aparece como zero

Cenário: [C14] Acessar um projeto pelo Dashboard
  Dado a seção “Projetos” com projetos
  Quando o usuário aciona um projeto
  Então a tela do projeto `/projetos/{id}` é exibida

Cenário: [C15] Ver todos os projetos
  Dado o Dashboard aberto
  Quando o usuário aciona “Ver todos”
  Então a lista de projetos é exibida

Cenário: [C16] Estado vazio para o Proprietário
  Dado um workspace sem projetos
  Quando o Proprietário abre o Dashboard
  Então a seção “Projetos” mostra o estado vazio com a ação “Criar primeiro projeto”

Cenário: [C17] Estado vazio para o Membro
  Dado um workspace sem projetos
  Quando um Membro abre o Dashboard
  Então a seção “Projetos” mostra o estado vazio sem a ação de criar

Cenário: [C18] Abrir o Dashboard após o login
  Dado um usuário com workspace
  Quando ele conclui o login
  Então o Dashboard é exibido no lugar da tela inicial provisória

Cenário: [C19] Manter a tela Sem Workspace
  Dado um usuário autenticado sem workspace
  Quando ele abre a aplicação
  Então a tela “Sem Workspace” é exibida, sem contagens

Cenário: [C20] Atualizar após alterar uma tarefa
  Dado o Dashboard já carregado
  Quando o usuário altera o status de uma tarefa pela interface e volta ao Dashboard
  Então as contagens exibidas são refeitas com o novo estado

## Contrato de Integração

Não se aplica. O modo é sequencial, e o contrato do Dashboard nasce no backend.

## Plano de execução

- Módulos ativados: backend, frontend
- Modo: sequencial
- Justificativa: a história ativa dois módulos e não tem Contrato de Integração completo (skill `criterio-fluxo-execucao`, passo 2); o backend vem primeiro e o frontend depois.

## Decisões técnicas relevantes

- Endpoint único `GET /api/v1/dashboard`, com `{ "workspace": { <status>: n }, "minhasTarefas": { <status>: n } }`. As contagens vêm de `GROUP BY status`, sem cache.
- Atualização: sem polling. A consulta usa as regras padrão do TanStack Query (refazer ao abrir e ao recuperar o foco) e é invalidada após mutações de tarefa.
- A seção “Projetos” reutiliza `GET /api/v1/projetos` com `size=20`, sem criar endpoint novo; “Ver todos” leva à lista de projetos de `HIST-001-projeto`.
- A rota inicial do usuário autenticado com workspace passa a ser o Dashboard. A tela provisória é removida e a tela “Sem Workspace” de `HIST-002-auth` é mantida.
- A invalidação da consulta do Dashboard é acrescentada nos hooks de mutação já existentes de `tarefa` (criar, editar, alterar status, excluir, trocar responsável e reatribuir) e de exclusão de projeto (`HIST-002-projeto`). Esta história altera esses hooks no frontend, sem criar mutação nova.
- Ordem de avaliação dos erros: 404, 403, 400.

## Pontos em aberto

Nenhum.
