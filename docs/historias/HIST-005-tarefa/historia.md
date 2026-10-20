# HIST-005-tarefa — Remover tarefa e trocar responsável

## Visão geral

O Proprietário exclui tarefas e troca o responsável delas. São ações administrativas: o Membro não exclui tarefas nem atribui responsáveis. A exclusão é física, remove as associações com tags e mantém as tags no workspace.

Fora de escopo: editar os demais campos (`HIST-003-tarefa`), alterar status (`HIST-004-tarefa`) e reatribuir em massa ao remover um membro (`HIST-006-tarefa`).

Dependências: `HIST-001-tarefa`, `HIST-002-tarefa` e `HIST-004-membros` (lista de membros).

## Domínio

tarefa

## Origem

- Requisitos, RT-02, RF-19, RF-20, RNF-01 e RNF-10.
- Domínio, seções 3 e 5.
- Especificação, seções 3.2, 5 e 6 (tela 9).
- Modelo de dados, seções 2.6 a 2.8 e 6.
- Padrão de API, seções 2.1, 6 e 8.

## Requisitos funcionais

1. O Proprietário exclui uma tarefa do workspace.
   - Critério de aceitação: `DELETE /api/v1/tarefas/{id}` responde `204`, remove a tarefa fisicamente e suas associações com tags, e a tarefa deixa de aparecer nas consultas; as tags permanecem em `GET /api/v1/tags`.
2. O Proprietário troca o responsável.
   - Critério de aceitação: `PATCH /api/v1/tarefas/{id}/responsavel` com `responsavelId` de um membro do mesmo workspace, inclusive o Proprietário, responde `200` com a tarefa atualizada; atribuir ao responsável atual também responde `200`.
3. Somente o Proprietário executa essas ações.
   - Critério de aceitação: o Membro recebe `403 ACESSO_NEGADO` na exclusão e na troca de responsável, sem alterar dados.
4. O novo responsável deve ser do workspace.
   - Critério de aceitação: `responsavelId` inexistente ou de usuário de outro workspace responde `404 RECURSO_NAO_ENCONTRADO` e a tarefa mantém o responsável anterior; `responsavelId` ausente responde `400 VALIDACAO` com `OBRIGATORIO`.
5. Tarefa de outro workspace não é revelada.
   - Critério de aceitação: tarefa inexistente ou de outro workspace responde `404 RECURSO_NAO_ENCONTRADO` nas duas operações, sem alterar dados.
6. A autoria é preservada.
   - Critério de aceitação: a troca de responsável não altera `autorId` nem os demais campos.
7. A interface oferece as ações só ao Proprietário.
   - Critério de aceitação: o menu do cartão e da linha mostra "Trocar responsável" e "Excluir" ao Proprietário e não os mostra ao Membro.
8. A troca de responsável usa um diálogo.
   - Critério de aceitação: "Trocar responsável" abre um diálogo com a lista de membros de `GET /api/v1/membros` e o responsável atual selecionado; confirmar chama o `PATCH` e atualiza Kanban e Lista.
9. A exclusão pede confirmação.
   - Critério de aceitação: "Excluir" abre o diálogo destrutivo com o título da tarefa; cancelar não exclui; confirmar exclui, fecha o diálogo e remove a tarefa do Kanban e da Lista.

## Requisitos não-funcionais

- RNF-01 e RT-02: papel e workspace são validados no backend.
- RNF-04, RNF-05 e RNF-06: as ações são utilizáveis em 360 px, 768 px e 1280 px, nos navegadores definidos.
- RNF-08: 95% das requisições respondem em até 500 ms em ambiente local de teste, com até 1.000 tarefas por workspace.
- RNF-10: exclusão e troca são persistidas sem vínculos inconsistentes.

## Cenários Gherkin

Cenário: [C01] Excluir tarefa
  Dado uma tarefa do workspace do Proprietário
  Quando ele envia `DELETE /api/v1/tarefas/{id}`
  Então a resposta é `204`
  E a tarefa deixa de existir

Cenário: [C02] Remover as associações e manter as tags
  Dado uma tarefa associada a duas tags
  Quando o Proprietário a exclui
  Então as associações da tarefa são removidas
  E as duas tags continuam no workspace

Cenário: [C03] Negar exclusão a Membro
  Dado um usuário com papel Membro
  Quando ele envia `DELETE /api/v1/tarefas/{id}`
  Então a resposta é `403 ACESSO_NEGADO`
  E a tarefa continua existindo

Cenário: [C04] Ocultar tarefa de outro workspace na exclusão
  Dado uma tarefa de outro workspace
  Quando o Proprietário envia `DELETE /api/v1/tarefas/{id}`
  Então a resposta é `404 RECURSO_NAO_ENCONTRADO`

Cenário: [C05] Trocar o responsável
  Dado uma tarefa e outro membro do workspace
  Quando o Proprietário envia `PATCH /api/v1/tarefas/{id}/responsavel` com o id desse membro
  Então a resposta é `200` com o novo responsável

Cenário: [C06] Atribuir ao Proprietário
  Dado uma tarefa atribuída a um Membro
  Quando o Proprietário a atribui a si mesmo
  Então o responsável passa a ser o Proprietário

Cenário: [C07] Aceitar o responsável atual
  Dado uma tarefa atribuída a um Membro
  Quando o Proprietário a atribui ao mesmo Membro
  Então a resposta é `200` sem mudança

Cenário: [C08] Preservar autor e demais campos
  Dado uma tarefa com autor, título e status definidos
  Quando o Proprietário troca o responsável
  Então autor, título e status permanecem

Cenário: [C09] Negar troca de responsável a Membro
  Dado um usuário com papel Membro
  Quando ele envia `PATCH /api/v1/tarefas/{id}/responsavel`
  Então a resposta é `403 ACESSO_NEGADO`
  E o responsável permanece

Cenário: [C10] Rejeitar responsável de outro workspace
  Dado um usuário de outro workspace
  Quando o Proprietário o indica como novo responsável
  Então a resposta é `404 RECURSO_NAO_ENCONTRADO`
  E a tarefa mantém o responsável anterior

Cenário: [C11] Rejeitar responsável ausente
  Dado uma tarefa do workspace
  Quando o Proprietário envia o corpo sem `responsavelId`
  Então a resposta é `400 VALIDACAO` com erro de campo `OBRIGATORIO`

Cenário: [C12] Ocultar tarefa de outro workspace na troca
  Dado uma tarefa de outro workspace
  Quando o Proprietário envia `PATCH /api/v1/tarefas/{id}/responsavel`
  Então a resposta é `404 RECURSO_NAO_ENCONTRADO`

Cenário: [C13] Mostrar as ações ao Proprietário
  Dado uma tarefa exibida ao Proprietário
  Quando ele abre o menu da tarefa
  Então o menu oferece "Trocar responsável" e "Excluir"

Cenário: [C14] Ocultar as ações do Membro
  Dado uma tarefa exibida a um Membro
  Quando ele abre o menu da tarefa
  Então o menu não oferece "Trocar responsável" nem "Excluir"

Cenário: [C15] Trocar o responsável pelo diálogo
  Dado o diálogo "Trocar responsável" aberto
  Quando o Proprietário escolhe outro membro e confirma
  Então o diálogo é fechado
  E Kanban e Lista mostram o novo responsável

Cenário: [C16] Cancelar a exclusão
  Dado o diálogo de confirmação de exclusão aberto
  Quando o Proprietário cancela
  Então a tarefa continua no Kanban e na Lista

Cenário: [C17] Confirmar a exclusão
  Dado o diálogo de confirmação de exclusão aberto
  Quando o Proprietário confirma
  Então a tarefa sai do Kanban e da Lista

## Contrato de Integração

Não se aplica. O modo é sequencial, e o contrato das duas operações nasce no backend.

## Plano de execução

- Módulos ativados: backend, frontend
- Modo: sequencial
- Justificativa: a história ativa dois módulos e não tem Contrato de Integração completo (skill `criterio-fluxo-execucao`, passo 2); o backend vem primeiro e o frontend depois.

## Decisões técnicas relevantes

- Endpoints: `DELETE /api/v1/tarefas/{id}` e `PATCH /api/v1/tarefas/{id}/responsavel` (Padrão de API, seção 2.1).
- Exclusão física; as associações saem pela cascata de `tarefa` para `tarefa_tag`, criada em `HIST-001-tarefa`. As tags nunca são excluídas.
- Responsável de outro workspace responde `404`, não `422`, para não revelar usuários de outro workspace. Ordem dos erros: 404, 403, 400.
- O diálogo de confirmação reaproveita o diálogo destrutivo das telas de projeto. A lista de membros do diálogo é de até 100 itens.

## Pontos em aberto

Nenhum.
