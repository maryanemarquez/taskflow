# HIST-005-membros — Remover membro sem tarefas

## Visão geral

O Proprietário remove um Membro do workspace. A remoção desfaz apenas o vínculo; a conta continua existindo e a pessoa pode ser convidada de novo ou entrar em outro workspace. O Proprietário não pode remover a si mesmo. Quando o Membro tem tarefas atribuídas, a remoção é bloqueada e a reatribuição é tratada em `HIST-006-tarefa`.

Fora de escopo: bloquear ou reatribuir tarefas na remoção (`HIST-006-tarefa`), exclusão da conta e transferência da propriedade do workspace (fora da V1).

Dependências: `HIST-004-membros` (tela de membros), `HIST-002-auth` (tela "Sem Workspace") e `HIST-003-auth`.

## Domínio

membros

## Origem

- Requisitos, RF-06, RF-10, RF-39 e RNF-01.
- Domínio, seções 3 a 5.
- Especificação, seções 3.3, 5, 6 (telas 10 e 13) e 7.8.
- Modelo de dados, seções 2.3 e 6.
- Padrão de API, seções 2.1 e 6.

## Requisitos funcionais

1. O Proprietário remove um Membro sem tarefas.
   - Critério de aceitação: `DELETE /api/v1/membros/{usuarioId}` responde `204`, o vínculo com o workspace é excluído e o membro deixa de aparecer na lista.
2. A conta do usuário removido é mantida.
   - Critério de aceitação: o registro do usuário continua existindo e ele ainda consegue fazer login.
3. O Proprietário não se remove.
   - Critério de aceitação: remover o próprio vínculo responde `422 PROPRIETARIO_NAO_REMOVIVEL`, sem alterar dados.
4. Somente o Proprietário remove membros.
   - Critério de aceitação: o Membro recebe `403 ACESSO_NEGADO`, sem alterar dados.
5. Usuários de outro workspace não são revelados.
   - Critério de aceitação: identificador inexistente ou de usuário fora do workspace responde `404 RECURSO_NAO_ENCONTRADO`, sem alterar dados.
6. O usuário removido perde o acesso ao workspace.
   - Critério de aceitação: as rotas do workspace passam a responder `403 SEM_WORKSPACE` a ele, e a interface exibe a tela "Sem Workspace".
7. A interface pede confirmação antes de remover.
   - Critério de aceitação: a ação "Remover" abre um diálogo de confirmação; cancelar não remove; a ação aparece somente ao Proprietário e não aparece na linha dele.

## Requisitos não-funcionais

- RNF-01: o papel é validado no backend; o Membro não administra outros membros.
- RNF-05 e RNF-06: a ação é utilizável em 360 px, 768 px e 1280 px, nos navegadores definidos.
- RNF-08: 95% das requisições respondem em até 500 ms em ambiente local de teste, com até 1.000 tarefas por workspace.
- RNF-10: a remoção não deixa estado inconsistente.

## Cenários Gherkin

Cenário: [C01] Remover Membro sem tarefas
  Dado um Membro sem tarefas atribuídas
  Quando o Proprietário envia `DELETE /api/v1/membros/{usuarioId}`
  Então a resposta é `204`
  E o membro deixa de aparecer na lista

Cenário: [C02] Manter a conta do usuário removido
  Dado um Membro removido
  Quando ele faz login
  Então o login é aceito
  E ele não tem workspace

Cenário: [C03] Impedir que o Proprietário se remova
  Dado o Proprietário do workspace
  Quando ele envia `DELETE /api/v1/membros/{usuarioId}` com o próprio identificador
  Então a resposta é `422 PROPRIETARIO_NAO_REMOVIVEL`
  E o vínculo permanece

Cenário: [C04] Negar remoção por Membro
  Dado um usuário com papel Membro
  Quando ele envia `DELETE /api/v1/membros/{usuarioId}` para outro membro
  Então a resposta é `403 ACESSO_NEGADO`
  E o vínculo permanece

Cenário: [C05] Ocultar usuário de outro workspace
  Dado um usuário que pertence a outro workspace
  Quando o Proprietário envia `DELETE /api/v1/membros/{usuarioId}` para ele
  Então a resposta é `404 RECURSO_NAO_ENCONTRADO`
  E nenhum vínculo é alterado

Cenário: [C06] Ocultar identificador inexistente
  Dado um identificador que não existe
  Quando o Proprietário tenta removê-lo
  Então a resposta é `404 RECURSO_NAO_ENCONTRADO`

Cenário: [C07] Negar acesso ao workspace após a remoção
  Dado um Membro removido com sessão ativa
  Quando ele envia `GET /api/v1/membros`
  Então a resposta é `403 SEM_WORKSPACE`

Cenário: [C08] Exibir a tela Sem Workspace após a remoção
  Dado um Membro removido
  Quando ele abre a aplicação
  Então a tela "Sem Workspace" é exibida

Cenário: [C09] Pedir confirmação antes de remover
  Dado a tela de membros aberta pelo Proprietário
  Quando ele aciona "Remover" e cancela o diálogo de confirmação
  Então o membro não é removido

Cenário: [C10] Remover pela interface
  Dado a tela de membros aberta pelo Proprietário
  Quando ele aciona "Remover" e confirma
  Então o membro sai da lista

Cenário: [C11] Ocultar a ação de remover
  Dado a tela de membros
  Quando um Membro a abre, ou o Proprietário olha a própria linha
  Então a ação "Remover" não é exibida

## Contrato de Integração

Não se aplica. O modo é sequencial, e o contrato da remoção nasce no backend.

## Plano de execução

- Módulos ativados: backend, frontend
- Modo: sequencial
- Justificativa: a história ativa dois módulos e não tem Contrato de Integração completo (skill `criterio-fluxo-execucao`, passo 2); o backend vem primeiro e o frontend depois.

## Decisões técnicas relevantes

- Endpoint `DELETE /api/v1/membros/{usuarioId}`, em que o identificador é o do usuário; remove só o vínculo.
- A tabela `tarefa` ainda não existe nesta história. A regra `REATRIBUICAO_OBRIGATORIA` (membro com tarefas) e a reatribuição atômica são implementadas e testadas em `HIST-006-tarefa`, que altera esta remoção.
- O acesso do removido cai por consequência: o vínculo é consultado a cada requisição, então ele recebe `SEM_WORKSPACE` sem revogar tokens.
- A tela "Sem Workspace" vem de `HIST-002-auth`.
- Ordem de avaliação dos erros: 404, 403, 400, 422.

## Pontos em aberto

Nenhum.
