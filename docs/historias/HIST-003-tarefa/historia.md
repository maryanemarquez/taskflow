# HIST-003-tarefa — Editar tarefa

## Visão geral

Usuários autorizados atualizam título, descrição, prioridade, tags e prazo de uma tarefa, sem mexer em projeto, responsável nem status. O Proprietário edita qualquer tarefa do workspace; o Membro edita as que criou ou pelas quais responde. Quem não pode editar abre a tarefa só para leitura.

Fora de escopo: alterar responsável e excluir (`HIST-005-tarefa`), alterar status (`HIST-004-tarefa`) e mover a tarefa de projeto (fora da V1).

Dependências: `HIST-001-tarefa` e `HIST-002-tarefa`.

## Domínio

tarefa

## Origem

- Requisitos, RT-02, RT-04, RF-18 e RNF-01.
- Domínio, seções 3 e 5.
- Especificação, seções 3.2 e 6 (tela 9).
- Modelo de dados, seções 2.6 a 2.8.
- Padrão de API, seções 6 e 8.

## Requisitos funcionais

1. O Proprietário edita qualquer tarefa do workspace.
   - Critério de aceitação: `PUT /api/v1/tarefas/{id}` com `titulo`, `descricao`, `prioridade`, `prazo` e `tags` válidos responde `200` com a tarefa atualizada.
2. O Membro edita a tarefa que criou ou da qual é responsável.
   - Critério de aceitação: o Membro autor ou responsável recebe `200`; o Membro que não é nem autor nem responsável recebe `403 ACESSO_NEGADO` e a tarefa não muda.
3. Projeto, responsável e status são preservados.
   - Critério de aceitação: `projetoId`, `responsavelId` e `status` enviados no corpo são ignorados e a tarefa mantém os valores anteriores.
4. As regras de validação são as da criação.
   - Critério de aceitação: os mesmos limites e códigos de `HIST-001-tarefa` valem na edição (título, descrição, prazo, prioridade, tags e `LIMITE_EXCEDIDO`); qualquer erro responde `400 VALIDACAO` e a tarefa permanece inalterada.
5. As tags da tarefa são substituídas pelas enviadas.
   - Critério de aceitação: a tarefa fica com exatamente as tags enviadas (normalizadas, sem repetição e reutilizando as existentes); tags que deixam de ser usadas continuam no workspace.
6. Tarefa de outro workspace não é revelada.
   - Critério de aceitação: tarefa inexistente ou de outro workspace responde `404 RECURSO_NAO_ENCONTRADO` sem alterar dados.
7. A gravação é atômica.
   - Critério de aceitação: se a troca de tags falha, nenhum campo da tarefa é alterado.
8. Clicar numa tarefa abre o diálogo dela.
   - Critério de aceitação: o clique no cartão do Kanban ou na linha da Lista abre o diálogo carregado com `GET /api/v1/tarefas/{id}`; um ícone abre a rota `/tarefas/{id}/editar` com o mesmo formulário.
9. O formulário respeita a permissão.
   - Critério de aceitação: para o Proprietário e para o Membro autor ou responsável os campos são editáveis, com o botão "Salvar"; para os demais os campos ficam desabilitados e não há botão "Salvar".
10. O formulário de edição não altera projeto, responsável nem status.
    - Critério de aceitação: o formulário não tem esses campos e mostra o responsável e o status apenas como texto.
11. O resultado da edição é refletido na tela.
    - Critério de aceitação: ao salvar, o diálogo fecha e Kanban e Lista mostram os dados novos; erros `400 VALIDACAO` aparecem junto ao campo, com o diálogo aberto.

## Requisitos não-funcionais

- RNF-01 e RT-02: autorização por papel e posse e isolamento por workspace, validados no backend.
- RNF-04, RNF-05 e RNF-06: a edição é utilizável em 360 px, 768 px e 1280 px, nos navegadores definidos.
- RNF-08: 95% das requisições respondem em até 500 ms em ambiente local de teste, com até 1.000 tarefas por workspace.
- RNF-10: alterações válidas são persistidas sem modificar campos fora do escopo.

## Cenários Gherkin

Cenário: [C01] Proprietário edita tarefa
  Dado um Proprietário e uma tarefa do workspace
  Quando ele envia `PUT /api/v1/tarefas/{id}` com valores válidos
  Então a resposta é `200` com os campos atualizados

Cenário: [C02] Membro autor edita a tarefa
  Dado uma tarefa criada por um Membro e atribuída a outro membro
  Quando o Membro autor envia `PUT /api/v1/tarefas/{id}` com valores válidos
  Então a resposta é `200`

Cenário: [C03] Membro responsável edita a tarefa
  Dado uma tarefa criada pelo Proprietário e atribuída a um Membro
  Quando o Membro responsável envia `PUT /api/v1/tarefas/{id}` com valores válidos
  Então a resposta é `200`

Cenário: [C04] Negar edição a Membro sem posse
  Dado uma tarefa que o Membro não criou e pela qual não responde
  Quando ele envia `PUT /api/v1/tarefas/{id}`
  Então a resposta é `403 ACESSO_NEGADO`
  E a tarefa permanece inalterada

Cenário: [C05] Preservar projeto, responsável e status
  Dado uma tarefa em `EM_TESTES` com responsável definido
  Quando o Proprietário edita enviando outro `projetoId`, outro `responsavelId` e `status` diferente
  Então a tarefa mantém o projeto, o responsável e o status anteriores

Cenário: [C06] Rejeitar título com 201 caracteres
  Dado uma tarefa do workspace
  Quando o Proprietário a edita com título de 201 caracteres
  Então a resposta é `400 VALIDACAO` com erro de campo `TAMANHO_EXCEDIDO`
  E a tarefa permanece inalterada

Cenário: [C07] Rejeitar 11 tags
  Dado uma tarefa do workspace
  Quando o Proprietário a edita com 11 tags distintas
  Então a resposta é `400 VALIDACAO` com erro de campo `LIMITE_EXCEDIDO` em `tags`
  E a tarefa permanece inalterada

Cenário: [C08] Substituir as tags
  Dado uma tarefa com as tags "a" e "b"
  Quando o Proprietário a edita com as tags "b" e "c"
  Então a tarefa fica com as tags "b" e "c"
  E a tag "a" continua existindo no workspace

Cenário: [C09] Ocultar tarefa de outro workspace
  Dado uma tarefa de outro workspace
  Quando o Proprietário envia `PUT /api/v1/tarefas/{id}`
  Então a resposta é `404 RECURSO_NAO_ENCONTRADO`

Cenário: [C10] Desfazer tudo quando a troca de tags falha
  Dado que a gravação das tags falha durante a edição
  Quando o Proprietário edita o título e as tags
  Então o título anterior permanece

Cenário: [C11] Abrir o diálogo ao clicar na tarefa
  Dado uma tarefa exibida no Kanban
  Quando o usuário clica no cartão
  Então um diálogo com os dados da tarefa é exibido

Cenário: [C12] Abrir a página dedicada de edição
  Dado o diálogo de uma tarefa aberto
  Quando o usuário aciona o ícone de página dedicada
  Então a rota `/tarefas/{id}/editar` exibe o mesmo formulário

Cenário: [C13] Mostrar o formulário editável a quem pode editar
  Dado um Membro autor da tarefa
  Quando ele abre o diálogo da tarefa
  Então os campos estão editáveis e o botão "Salvar" aparece

Cenário: [C14] Mostrar a tarefa somente para leitura
  Dado um Membro que não é autor nem responsável da tarefa
  Quando ele abre o diálogo da tarefa
  Então os campos estão desabilitados
  E o botão "Salvar" não aparece

Cenário: [C15] Não oferecer projeto, responsável nem status para edição
  Dado o diálogo de uma tarefa aberto pelo Proprietário
  Quando o formulário é exibido
  Então responsável e status aparecem apenas como texto
  E não há campo de projeto

Cenário: [C16] Salvar a edição pela interface
  Dado o diálogo de uma tarefa aberto por quem pode editar
  Quando o usuário altera o título e aciona "Salvar"
  Então o diálogo é fechado
  E Kanban e Lista mostram o novo título

Cenário: [C17] Exibir erro de campo na edição
  Dado o diálogo de uma tarefa aberto por quem pode editar
  Quando o usuário apaga o título e aciona "Salvar"
  Então o diálogo permanece aberto com a mensagem de erro no campo título

## Contrato de Integração

Não se aplica. O modo é sequencial, e o contrato da edição nasce no backend.

## Plano de execução

- Módulos ativados: backend, frontend
- Modo: sequencial
- Justificativa: a história ativa dois módulos e não tem Contrato de Integração completo (skill `criterio-fluxo-execucao`, passo 2); o backend vem primeiro e o frontend depois.

## Decisões técnicas relevantes

- Endpoint `PUT /api/v1/tarefas/{id}`, que substitui os cinco campos editáveis; a consulta usa `GET /api/v1/tarefas/{id}` de `HIST-002-tarefa`.
- O backend ignora campos fora do contrato. A ordem dos erros é 404, 403, 400.
- A permissão no frontend é calculada com o usuário de `GET /api/v1/auth/eu` (id e papel) e os campos `autorId` e `responsavelId` da tarefa; o backend continua sendo a barreira.
- Tags repetidas na mesma edição são descartadas em silêncio, como na criação, sem aviso.
- O formulário é o mesmo componente de `HIST-001-tarefa`, em modo de edição e de leitura. Não há tela de detalhe separada.

## Pontos em aberto

Nenhum.
