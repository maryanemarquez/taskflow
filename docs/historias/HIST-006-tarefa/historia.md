# HIST-006-tarefa — Reatribuir tarefas ao remover membro

## Visão geral

Ao remover um Membro que é responsável por tarefas, o Proprietário escolhe um novo responsável do workspace, e a reatribuição de todas as tarefas e a remoção do vínculo acontecem numa única transação. Sem tarefas, a remoção segue como em `HIST-005-membros`. A conta e a autoria das tarefas criadas pelo membro são mantidas.

Fora de escopo: reatribuir tarefas uma a uma (`HIST-005-tarefa`), remover o Proprietário ou transferir a propriedade (proibido na V1) e excluir a conta.

Dependências: `HIST-005-membros`, `HIST-001-tarefa` e `HIST-005-tarefa`.

## Domínio

tarefa

## Origem

- Backlog, observações sobre RF-10.
- Requisitos, RF-10, RF-39, RNF-01 e RNF-10.
- Domínio, seções 3 a 5.
- Especificação, seções 3.3, 6 (telas 10 e 13), 7.8 e 7.9.
- Modelo de dados, seções 2.3, 2.6 e 6.
- Padrão de API, seções 6.1 e 6.2.

## Requisitos funcionais

1. O Proprietário remove um membro com tarefas indicando o novo responsável.
   - Critério de aceitação: `DELETE /api/v1/membros/{usuarioId}?novoResponsavelId={id}` reatribui ao novo responsável todas as tarefas do membro, exclui o vínculo e responde `204`, na mesma transação.
2. A reatribuição é obrigatória quando há tarefas.
   - Critério de aceitação: se o membro tem tarefas e `novoResponsavelId` está ausente, a resposta é `422 REATRIBUICAO_OBRIGATORIA` e nada é alterado.
3. Sem tarefas, a remoção não exige reatribuição.
   - Critério de aceitação: o membro sem tarefas é removido com `204`, com ou sem `novoResponsavelId` válido, e a conta permanece.
4. A operação é atômica.
   - Critério de aceitação: se qualquer etapa falha, o vínculo e os responsáveis anteriores permanecem.
5. O novo responsável é validado.
   - Critério de aceitação: `novoResponsavelId` inexistente ou de outro workspace responde `404 RECURSO_NAO_ENCONTRADO`; o próprio membro removido como destino responde `422 REATRIBUICAO_OBRIGATORIA`; nada é alterado.
6. As tarefas são lidas dentro da transação.
   - Critério de aceitação: tarefas atribuídas ao membro depois da abertura do diálogo também são reatribuídas, e nenhuma tarefa fica com responsável sem vínculo.
7. A autoria e a conta são preservadas.
   - Critério de aceitação: `autorId` das tarefas criadas pelo membro permanece, e o usuário continua existindo sem workspace.
8. O Proprietário não é removido e o Membro não remove.
   - Critério de aceitação: alvo Proprietário responde `422 PROPRIETARIO_NAO_REMOVIVEL`; o Membro responde `403 ACESSO_NEGADO`; nada é alterado.
9. O Proprietário lista as tarefas de um responsável.
   - Critério de aceitação: `GET /api/v1/tarefas?responsavelId={id}` devolve a página (ordenada por `criadoEm,desc`) das tarefas do usuário no workspace, com `totalElementos`; usuário fora do workspace responde `404 RECURSO_NAO_ENCONTRADO` e o Membro `403 ACESSO_NEGADO`.
10. A interface verifica as tarefas antes de remover.
    - Critério de aceitação: ao acionar "Remover", a tela consulta `GET /api/v1/tarefas?responsavelId={id}&size=100`; se `totalElementos` é zero, segue a confirmação simples de `HIST-005-membros`.
11. O diálogo de reatribuição lista as tarefas e pede o destino.
    - Critério de aceitação: com tarefas, o diálogo mostra os títulos (até 100, mais "e mais N tarefas" quando houver mais), o seletor de novo responsável com os demais membros e o botão "Atribuir todas a mim"; "Confirmar" fica desabilitado até haver um destino.
12. A confirmação chama a remoção com o destino escolhido.
    - Critério de aceitação: confirmar envia `DELETE /api/v1/membros/{usuarioId}?novoResponsavelId={id}`, "Atribuir todas a mim" usa o id do Proprietário, e em caso de sucesso o diálogo fecha e o membro sai da lista.
13. Falhas mantêm o diálogo aberto.
    - Critério de aceitação: erro na remoção mostra uma mensagem no diálogo, mantém o destino escolhido e não altera a lista de membros.

## Requisitos não-funcionais

- RNF-01 e RT-02: somente o Proprietário administra a remoção, e o destino pertence ao workspace.
- RNF-04, RNF-05 e RNF-06: o diálogo é utilizável em 360 px, 768 px e 1280 px, nos navegadores definidos.
- RNF-08: 95% das requisições respondem em até 500 ms em ambiente local de teste, com até 1.000 tarefas por workspace.
- RNF-10: reatribuição e remoção são atômicas.

## Cenários Gherkin

Cenário: [C01] Remover com reatribuição
  Dado um Membro com tarefas e outro membro do workspace
  Quando o Proprietário envia `DELETE /api/v1/membros/{usuarioId}?novoResponsavelId={id}`
  Então a resposta é `204`
  E todas as tarefas passam ao novo responsável e o vínculo é removido

Cenário: [C02] Exigir reatribuição quando há tarefas
  Dado um Membro com tarefas
  Quando o Proprietário envia `DELETE /api/v1/membros/{usuarioId}` sem `novoResponsavelId`
  Então a resposta é `422 REATRIBUICAO_OBRIGATORIA`
  E o vínculo e os responsáveis permanecem

Cenário: [C03] Remover Membro sem tarefas
  Dado um Membro sem tarefas atribuídas
  Quando o Proprietário envia `DELETE /api/v1/membros/{usuarioId}` sem `novoResponsavelId`
  Então a resposta é `204`
  E a conta do usuário permanece

Cenário: [C04] Desfazer tudo quando a remoção falha
  Dado um Membro com tarefas e que a exclusão do vínculo falha
  Quando o Proprietário o remove com um novo responsável
  Então nenhuma tarefa muda de responsável
  E o vínculo permanece

Cenário: [C05] Rejeitar destino de outro workspace
  Dado um usuário de outro workspace
  Quando o Proprietário o indica como `novoResponsavelId`
  Então a resposta é `404 RECURSO_NAO_ENCONTRADO`
  E nada é alterado

Cenário: [C06] Rejeitar o próprio removido como destino
  Dado um Membro com tarefas
  Quando o Proprietário indica o próprio Membro como `novoResponsavelId`
  Então a resposta é `422 REATRIBUICAO_OBRIGATORIA`
  E nada é alterado

Cenário: [C07] Reatribuir tarefas atribuídas durante a abertura do diálogo
  Dado uma tarefa atribuída ao Membro depois que o diálogo foi aberto
  Quando o Proprietário confirma a remoção com um novo responsável
  Então essa tarefa também passa ao novo responsável

Cenário: [C08] Preservar autoria e conta
  Dado tarefas criadas pelo Membro e atribuídas a ele
  Quando o Proprietário o remove com um novo responsável
  Então o `autorId` das tarefas permanece
  E o usuário continua existindo sem workspace

Cenário: [C09] Proteger o Proprietário
  Dado o Proprietário do workspace
  Quando ele tenta removê-lo com um `novoResponsavelId`
  Então a resposta é `422 PROPRIETARIO_NAO_REMOVIVEL`
  E nada é alterado

Cenário: [C10] Negar remoção por Membro
  Dado um usuário com papel Membro
  Quando ele envia `DELETE /api/v1/membros/{usuarioId}` com um `novoResponsavelId`
  Então a resposta é `403 ACESSO_NEGADO`
  E nada é alterado

Cenário: [C11] Listar as tarefas de um responsável
  Dado tarefas atribuídas a um Membro e a outro membro
  Quando o Proprietário envia `GET /api/v1/tarefas?responsavelId={id}` do Membro
  Então a página traz só as tarefas dele, com `totalElementos`

Cenário: [C12] Ocultar usuário de outro workspace na consulta
  Dado um usuário de outro workspace
  Quando o Proprietário envia `GET /api/v1/tarefas?responsavelId={id}` desse usuário
  Então a resposta é `404 RECURSO_NAO_ENCONTRADO`

Cenário: [C13] Negar a consulta ao Membro
  Dado um usuário com papel Membro
  Quando ele envia `GET /api/v1/tarefas?responsavelId={id}`
  Então a resposta é `403 ACESSO_NEGADO`

Cenário: [C14] Seguir a confirmação simples quando não há tarefas
  Dado um Membro sem tarefas na tela de membros
  Quando o Proprietário aciona "Remover"
  Então o diálogo de confirmação simples é exibido, sem seletor de responsável

Cenário: [C15] Abrir o diálogo de reatribuição
  Dado um Membro com tarefas na tela de membros
  Quando o Proprietário aciona "Remover"
  Então o diálogo mostra os títulos das tarefas, o seletor de novo responsável e o botão "Atribuir todas a mim"

Cenário: [C16] Avisar quando há mais de 100 tarefas
  Dado um Membro com 103 tarefas
  Quando o diálogo de reatribuição é aberto
  Então o diálogo mostra 100 títulos e a mensagem "e mais 3 tarefas"

Cenário: [C17] Desabilitar a confirmação sem destino
  Dado o diálogo de reatribuição aberto
  Quando nenhum novo responsável está selecionado
  Então o botão "Confirmar" está desabilitado

Cenário: [C18] Remover com o destino escolhido
  Dado o diálogo de reatribuição aberto
  Quando o Proprietário escolhe um membro e confirma
  Então a tela envia `DELETE /api/v1/membros/{usuarioId}?novoResponsavelId={id}`
  E o membro sai da lista

Cenário: [C19] Atribuir todas ao Proprietário
  Dado o diálogo de reatribuição aberto
  Quando o Proprietário aciona "Atribuir todas a mim"
  Então a tela envia a remoção com o id do Proprietário como `novoResponsavelId`

Cenário: [C20] Manter o diálogo aberto em caso de falha
  Dado o diálogo de reatribuição aberto
  Quando a remoção falha
  Então o diálogo permanece aberto com uma mensagem de erro
  E o destino escolhido é mantido

## Contrato de Integração

Não se aplica. O modo é sequencial, e o contrato da remoção com reatribuição nasce no backend.

## Plano de execução

- Módulos ativados: backend, frontend
- Modo: sequencial
- Justificativa: a história ativa dois módulos e não tem Contrato de Integração completo (skill `criterio-fluxo-execucao`, passo 2); o backend vem primeiro e o frontend depois.

## Decisões técnicas relevantes

- A remoção reutiliza `DELETE /api/v1/membros/{usuarioId}` de `HIST-005-membros`, acrescentando o parâmetro de consulta `novoResponsavelId`; é um identificador, não um token, e portanto pode ir na URL. Esta história altera esse endpoint e seus testes.
- Conflito de concorrência: a transação reatribui com `UPDATE ... WHERE responsavel_id = :membro`, lendo o estado no momento da confirmação. Não há versionamento nem tela de conflito.
- Novo responsável removido ou inexistente no momento da confirmação responde `404`, e o diálogo mostra a mensagem de erro.
- `GET /api/v1/tarefas?responsavelId=` é exclusivo do Proprietário e serve ao diálogo; a busca com filtros gerais fica em `busca-filtros`.
- Ordem de avaliação dos erros: 404, 403, 400, 422.

## Pontos em aberto

Nenhum.
