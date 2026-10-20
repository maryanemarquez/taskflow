# HIST-004-tarefa — Alterar status

## Visão geral

O status de uma tarefa avança ou retrocede um estágio por vez, na ordem `PENDENTE_A_INICIAR`, `EM_DESENVOLVIMENTO`, `EM_TESTES` e `FINALIZADO`. O Proprietário altera qualquer tarefa do workspace; o Membro altera só as tarefas sob sua responsabilidade. A mudança é feita por botões no cartão ou na linha, sem arrastar e soltar.

Fora de escopo: campo de status nos formulários (`HIST-001-tarefa` e `HIST-003-tarefa`), arrastar e soltar, fluxos de status personalizados e aprovação.

Dependências: `HIST-001-tarefa` e `HIST-002-tarefa`.

## Domínio

tarefa

## Origem

- Requisitos, RT-02, RF-21, RNF-01, RNF-07 e RNF-10.
- Domínio, seções 3 e 4.
- Especificação, seções 3.2, 5, 6 (telas 8 e 9) e 7.5.
- Padrão de API, seções 3, 6 e 10.

## Requisitos funcionais

1. O status muda para o estágio adjacente.
   - Critério de aceitação: `PATCH /api/v1/tarefas/{id}/status` com `status` igual ao estágio anterior ou ao seguinte responde `200` com a tarefa atualizada e persiste o novo status.
2. Transições não adjacentes são rejeitadas.
   - Critério de aceitação: pular estágio ou enviar o status atual responde `422 TRANSICAO_STATUS_INVALIDA` e a tarefa permanece inalterada.
3. O Proprietário altera o status de qualquer tarefa do workspace.
   - Critério de aceitação: as transições adjacentes são aceitas para o Proprietário em qualquer tarefa do próprio workspace.
4. O Membro altera somente as tarefas pelas quais responde.
   - Critério de aceitação: o Membro responsável tem as transições adjacentes aceitas; o Membro que não é o responsável, mesmo sendo o autor, recebe `403 ACESSO_NEGADO` e a tarefa não muda.
5. O status enviado é validado.
   - Critério de aceitação: `status` ausente responde `400 VALIDACAO` com `OBRIGATORIO`, e valor fora dos quatro status com `FORMATO_INVALIDO`; a tarefa não muda.
6. Tarefa de outro workspace não é revelada.
   - Critério de aceitação: tarefa inexistente ou de outro workspace responde `404 RECURSO_NAO_ENCONTRADO` sem alterar dados.
7. O novo status é refletido em todas as consultas.
   - Critério de aceitação: após a alteração, `GET /api/v1/tarefas/{id}` e as listagens do projeto devolvem o novo status.
8. A interface oferece botões de transição.
   - Critério de aceitação: o menu do cartão do Kanban e da linha da Lista mostra "Mover para {estágio anterior}" e "Mover para {próximo estágio}", omitindo o que não existe no primeiro e no último estágio.
9. Os botões aparecem só a quem pode usá-los.
   - Critério de aceitação: o menu de status aparece ao Proprietário e ao Membro responsável pela tarefa, e não aparece aos demais.
10. O resultado é mostrado sem recarregar a página.
    - Critério de aceitação: após o sucesso, o cartão passa para a coluna do novo status e a Lista mostra o novo valor; em caso de erro, uma mensagem informa a falha e a tarefa continua no status anterior.

## Requisitos não-funcionais

- RNF-01 e RT-02: autorização por papel e responsabilidade e isolamento por workspace, validados no backend.
- RNF-04, RNF-05 e RNF-06: o controle de status é utilizável em 360 px, 768 px e 1280 px, nos navegadores definidos.
- RNF-07: Kanban, Lista e consultas mostram o mesmo status.
- RNF-08: 95% das requisições respondem em até 500 ms em ambiente local de teste, com até 1.000 tarefas por workspace.
- RNF-10: a transição é persistida sem estado intermediário.

## Cenários Gherkin

Cenário: [C01] Avançar um estágio
  Dado uma tarefa em `PENDENTE_A_INICIAR` e um usuário autorizado
  Quando ele envia `PATCH /api/v1/tarefas/{id}/status` com `EM_DESENVOLVIMENTO`
  Então a resposta é `200` com o novo status
  E o status persistido é `EM_DESENVOLVIMENTO`

Cenário: [C02] Retroceder um estágio
  Dado uma tarefa em `EM_TESTES` e um usuário autorizado
  Quando ele envia o status `EM_DESENVOLVIMENTO`
  Então a resposta é `200` com o novo status

Cenário: [C03] Pular estágio
  Dado uma tarefa em `PENDENTE_A_INICIAR`
  Quando o usuário envia o status `EM_TESTES`
  Então a resposta é `422 TRANSICAO_STATUS_INVALIDA`
  E a tarefa permanece em `PENDENTE_A_INICIAR`

Cenário: [C04] Rejeitar o status atual
  Dado uma tarefa em `EM_TESTES`
  Quando o usuário envia o status `EM_TESTES`
  Então a resposta é `422 TRANSICAO_STATUS_INVALIDA`

Cenário: [C05] Rejeitar retorno do último estágio para o primeiro
  Dado uma tarefa em `FINALIZADO`
  Quando o usuário envia o status `PENDENTE_A_INICIAR`
  Então a resposta é `422 TRANSICAO_STATUS_INVALIDA`

Cenário: [C06] Proprietário altera tarefa de qualquer membro
  Dado uma tarefa atribuída a um Membro
  Quando o Proprietário avança o status
  Então a resposta é `200`

Cenário: [C07] Membro responsável altera o status
  Dado uma tarefa atribuída a um Membro
  Quando o Membro responsável avança o status
  Então a resposta é `200`

Cenário: [C08] Negar alteração a Membro não responsável
  Dado uma tarefa atribuída a outro membro
  Quando o Membro tenta alterar o status
  Então a resposta é `403 ACESSO_NEGADO`
  E a tarefa permanece inalterada

Cenário: [C09] Negar alteração ao Membro que só é autor
  Dado uma tarefa criada por um Membro e atribuída a outro membro
  Quando o Membro autor tenta alterar o status
  Então a resposta é `403 ACESSO_NEGADO`

Cenário: [C10] Rejeitar status ausente
  Dado uma tarefa do workspace
  Quando o usuário envia o corpo sem `status`
  Então a resposta é `400 VALIDACAO` com erro de campo `OBRIGATORIO`

Cenário: [C11] Rejeitar status desconhecido
  Dado uma tarefa do workspace
  Quando o usuário envia o status "ARQUIVADO"
  Então a resposta é `400 VALIDACAO` com erro de campo `FORMATO_INVALIDO`

Cenário: [C12] Ocultar tarefa de outro workspace
  Dado uma tarefa de outro workspace
  Quando o usuário envia `PATCH /api/v1/tarefas/{id}/status`
  Então a resposta é `404 RECURSO_NAO_ENCONTRADO`

Cenário: [C13] Refletir o novo status nas consultas
  Dado uma tarefa que mudou de status
  Quando o usuário consulta a tarefa e a listagem do projeto
  Então as duas respostas trazem o novo status

Cenário: [C14] Oferecer os botões de transição adjacentes
  Dado uma tarefa em `EM_DESENVOLVIMENTO` exibida a um usuário autorizado
  Quando ele abre o menu da tarefa
  Então o menu oferece "Mover para Pendente a iniciar" e "Mover para Em testes"

Cenário: [C15] Omitir a transição que não existe
  Dado uma tarefa em `PENDENTE_A_INICIAR` exibida a um usuário autorizado
  Quando ele abre o menu da tarefa
  Então o menu oferece só "Mover para Em desenvolvimento"

Cenário: [C16] Ocultar o menu de status
  Dado uma tarefa atribuída a outro membro
  Quando um Membro vê o cartão
  Então o menu de status não aparece

Cenário: [C17] Mover o cartão após o sucesso
  Dado uma tarefa na coluna "Pendente a iniciar"
  Quando o usuário aciona "Mover para Em desenvolvimento" e a requisição tem sucesso
  Então o cartão aparece na coluna "Em desenvolvimento"

Cenário: [C18] Informar a falha na alteração
  Dado uma tarefa exibida no Kanban
  Quando o usuário aciona uma mudança de status e a requisição falha
  Então uma mensagem de erro é exibida
  E o cartão continua na coluna anterior

## Contrato de Integração

Não se aplica. O modo é sequencial, e o contrato da alteração de status nasce no backend.

## Plano de execução

- Módulos ativados: backend, frontend
- Modo: sequencial
- Justificativa: a história ativa dois módulos e não tem Contrato de Integração completo (skill `criterio-fluxo-execucao`, passo 2); o backend vem primeiro e o frontend depois.

## Decisões técnicas relevantes

- Endpoint `PATCH /api/v1/tarefas/{id}/status`, com `status` no corpo e `200` com a tarefa (Padrão de API, seções 3 e 10).
- Adjacência pela ordem do enum; o status atual é tratado como transição inválida.
- A regra de posse é só "responsável" para o Membro, conforme RF-21; o autor perde a permissão se deixar de ser o responsável.
- Ordem de avaliação dos erros: 404, 403, 400, 422.
- Sem confirmação nem texto de sucesso: o cartão trocando de coluna é o retorno visual. A mensagem de erro vem do módulo central de mensagens.
- Após o sucesso, a interface invalida as consultas do projeto (sem atualização otimista).

## Pontos em aberto

Nenhum.
