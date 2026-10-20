# HIST-002-tarefa — Visualizar Kanban e Lista

## Visão geral

Proprietário e Membro acompanham as tarefas de um projeto em duas visualizações: Kanban (padrão), com uma coluna por status, e Lista. As duas mostram os mesmos dados persistidos. Esta história entrega a consulta das tarefas do projeto, a consulta de uma tarefa e a tela de detalhe do projeto.

Fora de escopo: filtros (`HIST-001-busca-filtros`), arrastar e soltar (a mudança de status usa botões, em `HIST-004-tarefa`), criar, editar, excluir e trocar responsável (outras histórias de `tarefa`) e o Dashboard.

Dependências: `HIST-001-tarefa` e `HIST-001-projeto`.

## Domínio

tarefa

## Origem

- Requisitos, RT-02, RF-17, RF-22, RNF-01 e RNF-07.
- Domínio, seções 3 e 4.
- Especificação, seções 3.2, 5 e 6 (tela 8).
- Padrão de API, seções 7 e 8.

## Requisitos funcionais

1. Os usuários do workspace consultam as tarefas de um projeto.
   - Critério de aceitação: `GET /api/v1/projetos/{projetoId}/tarefas` devolve a página (`conteudo`, `pagina`, `tamanho`, `totalElementos`, `totalPaginas`) de tarefas do projeto, ordenadas por `criadoEm,desc` e depois por `id,desc`; o parâmetro `status` (repetível) restringe os status.
2. O projeto precisa ser do workspace do usuário.
   - Critério de aceitação: projeto inexistente ou de outro workspace responde `404 RECURSO_NAO_ENCONTRADO`; usuário sem workspace recebe `403 SEM_WORKSPACE`.
3. Os usuários consultam uma tarefa.
   - Critério de aceitação: `GET /api/v1/tarefas/{id}` devolve a tarefa do próprio workspace com os mesmos campos da criação; tarefa inexistente ou de outro workspace responde `404 RECURSO_NAO_ENCONTRADO`.
4. O Kanban é a visualização padrão.
   - Critério de aceitação: ao abrir um projeto, a tela exibe quatro colunas com os títulos "Pendente a iniciar", "Em desenvolvimento", "Em testes" e "Finalizado", cada uma com a contagem de tarefas; cada coluna usa uma consulta com `status` e `size=100`.
5. Colunas grandes avisam o limite.
   - Critério de aceitação: quando uma coluna tem mais de 100 tarefas, ela exibe as 100 primeiras e a mensagem "Exibindo 100 de N tarefas. Use a Lista para ver todas."
6. A Lista mostra as mesmas tarefas.
   - Critério de aceitação: ao alternar para "Lista", a tela mostra título, status, prioridade, responsável, prazo e tags de todas as tarefas do projeto, com 20 itens por página e os botões "Anterior" e "Próxima".
7. Os cartões e linhas trazem o essencial.
   - Critério de aceitação: cada cartão do Kanban mostra título, prioridade, prazo, nome do responsável e tags; o prazo vazio não ocupa espaço.
8. As duas visualizações são consistentes.
   - Critério de aceitação: Kanban e Lista leem as mesmas consultas do projeto, e uma tarefa criada ou alterada aparece atualizada nas duas após a invalidação da consulta.
9. Projetos sem tarefas mostram estado vazio.
   - Critério de aceitação: sem tarefas, cada coluna do Kanban mostra "Nenhuma tarefa" e a Lista mostra a mensagem de estado vazio; a ação "Nova tarefa" aparece para Proprietário e Membro.
10. A tela mostra o nome do projeto e permite voltar.
    - Critério de aceitação: a rota `/projetos/{projetoId}` exibe o nome do projeto, o alternador "Kanban | Lista" e o botão de voltar para a lista de projetos; projeto inexistente mostra a tela de recurso não encontrado.

## Requisitos não-funcionais

- RNF-01 e RT-02: o isolamento por workspace é garantido no backend.
- RNF-04, RNF-05 e RNF-06: as duas visualizações são utilizáveis em 360 px, 768 px e 1280 px, nos navegadores definidos; em 360 px as colunas do Kanban rolam na horizontal.
- RNF-07: o estado exibido é consistente entre Kanban e Lista.
- RNF-08: 95% das requisições respondem em até 500 ms em ambiente local de teste, com até 1.000 tarefas por workspace.

## Cenários Gherkin

Cenário: [C01] Listar as tarefas do projeto
  Dado um projeto com tarefas do workspace
  Quando um usuário envia `GET /api/v1/projetos/{projetoId}/tarefas`
  Então a resposta é `200` com a página das tarefas do projeto

Cenário: [C02] Ordenar da mais recente para a mais antiga
  Dado três tarefas criadas em instantes diferentes no projeto
  Quando um usuário lista as tarefas
  Então a mais recente vem primeiro

Cenário: [C03] Filtrar por status
  Dado tarefas em status diferentes no projeto
  Quando um usuário lista as tarefas com `status=EM_TESTES`
  Então a resposta contém só as tarefas em `EM_TESTES`

Cenário: [C04] Ocultar projeto de outro workspace
  Dado um projeto de outro workspace
  Quando um usuário lista as tarefas desse projeto
  Então a resposta é `404 RECURSO_NAO_ENCONTRADO`

Cenário: [C05] Negar acesso a usuário sem workspace
  Dado um usuário autenticado sem vínculo com workspace
  Quando ele lista as tarefas de um projeto
  Então a resposta é `403 SEM_WORKSPACE`

Cenário: [C06] Consultar uma tarefa
  Dado uma tarefa do workspace do usuário
  Quando ele envia `GET /api/v1/tarefas/{id}`
  Então a resposta é `200` com os campos da tarefa

Cenário: [C07] Ocultar tarefa de outro workspace
  Dado uma tarefa de outro workspace
  Quando o usuário envia `GET /api/v1/tarefas/{id}`
  Então a resposta é `404 RECURSO_NAO_ENCONTRADO`

Cenário: [C08] Abrir o projeto no Kanban
  Dado um projeto acessível ao usuário
  Quando ele abre `/projetos/{projetoId}`
  Então a visualização inicial é o Kanban com as quatro colunas e suas contagens

Cenário: [C09] Colocar cada tarefa na coluna do seu status
  Dado tarefas em status diferentes
  Quando o Kanban é exibido
  Então cada tarefa aparece na coluna do seu status

Cenário: [C10] Avisar quando a coluna passa de 100 tarefas
  Dado uma coluna com 101 tarefas
  Quando o Kanban é exibido
  Então a coluna mostra 100 cartões e a mensagem "Exibindo 100 de 101 tarefas. Use a Lista para ver todas."

Cenário: [C11] Alternar para a Lista
  Dado as tarefas do projeto no Kanban
  Quando o usuário seleciona "Lista"
  Então a tela mostra as mesmas tarefas com título, status, prioridade, responsável, prazo e tags

Cenário: [C12] Paginar a Lista
  Dado um projeto com 25 tarefas
  Quando o usuário abre a Lista e aciona "Próxima"
  Então a segunda página mostra as 5 tarefas restantes

Cenário: [C13] Refletir a alteração nas duas visualizações
  Dado uma tarefa exibida no Kanban e na Lista
  Quando o status dela muda e as consultas são atualizadas
  Então as duas visualizações mostram o novo status

Cenário: [C14] Exibir estado vazio
  Dado um projeto sem tarefas
  Quando o usuário abre o Kanban e depois a Lista
  Então o Kanban mostra "Nenhuma tarefa" em cada coluna
  E a Lista mostra a mensagem de estado vazio

Cenário: [C15] Mostrar "Nova tarefa" ao Membro
  Dado um projeto aberto por um Membro
  Quando a tela é exibida
  Então a ação "Nova tarefa" aparece

Cenário: [C16] Voltar para a lista de projetos
  Dado o detalhe de um projeto aberto
  Quando o usuário aciona o botão de voltar
  Então a lista de projetos é exibida

## Contrato de Integração

Não se aplica. O modo é sequencial, e o contrato das consultas nasce no backend.

## Plano de execução

- Módulos ativados: backend, frontend
- Modo: sequencial
- Justificativa: a história ativa dois módulos e não tem Contrato de Integração completo (skill `criterio-fluxo-execucao`, passo 2); o backend vem primeiro e o frontend depois.

## Decisões técnicas relevantes

- Endpoints: `GET /api/v1/projetos/{projetoId}/tarefas` e `GET /api/v1/tarefas/{id}`.
- Ordem dentro das colunas e da Lista: `criadoEm,desc`, desempate por `id,desc`. Não há ordenação configurável na V1.
- O Kanban faz uma consulta por coluna (`status` + `size=100`), como prevê o Padrão de API, seção 7. A contagem vem de `totalElementos`.
- A alternância Kanban/Lista fica no estado local da tela; ao abrir o projeto, a visualização inicial é sempre o Kanban.
- Não há detalhe de tarefa separado do formulário: clicar no cartão ou na linha abre o diálogo de `HIST-003-tarefa`.
- O estado vazio segue o padrão visual das telas de projetos; textos no módulo central de mensagens.
- Ordem de avaliação dos erros: 404, 403, 400.

## Pontos em aberto

Nenhum.
