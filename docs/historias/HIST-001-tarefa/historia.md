# HIST-001-tarefa — Criar tarefa simples

## Visão geral

Proprietário e Membro registram trabalho em um projeto do workspace. A tarefa nasce com prioridade `MEDIA` e status `PENDENTE_A_INICIAR` quando a prioridade não é informada, tem autor e responsável, aceita prazo, descrição e até 10 tags. As tags são do workspace, normalizadas e reutilizadas. O Membro é sempre o responsável pelas tarefas que cria; o Proprietário escolhe qualquer membro, inclusive ele mesmo.

Esta história cria também as tabelas `tarefa`, `tag` e `tarefa_tag`, com as exclusões em cascata que `HIST-002-projeto` deixou para cá.

Fora de escopo: listar ou visualizar tarefas (`HIST-002-tarefa`), editar (`HIST-003-tarefa`), alterar status (`HIST-004-tarefa`), excluir e trocar responsável (`HIST-005-tarefa`), subtarefas, comentários, anexos e mover tarefa de projeto (fora da V1).

Dependências: `HIST-001-projeto`, `HIST-002-projeto`, `HIST-001-membros` e `HIST-004-membros` (lista de membros para o seletor de responsável).

## Domínio

tarefa

## Origem

- Requisitos, RT-02, RT-03, RT-04, RF-16, RF-17 e RF-20.
- Domínio, seções 3 a 5.
- Especificação, seções 3.2, 4, 5, 6 (tela 9) e 7.4.
- Modelo de dados, seções 2.5 a 2.8.
- Decisões técnicas, DT-09, DT-10 e DT-15.
- Padrão de API, seções 2, 5, 6 e 8.

## Requisitos funcionais

1. Proprietário e Membro criam tarefa em projeto do próprio workspace.
   - Critério de aceitação: `POST /api/v1/tarefas` com `projetoId`, `titulo` e demais campos válidos responde `201` com `Location` e a tarefa no corpo (`id`, `titulo`, `descricao`, `prioridade`, `status`, `prazo`, `projetoId`, `responsavelId`, `responsavelNome`, `autorId`, `tags`, `criadoEm`); o autor é o usuário autenticado.
2. Prioridade e status têm valores iniciais.
   - Critério de aceitação: sem prioridade informada a tarefa fica `MEDIA`; o status inicial é sempre `PENDENTE_A_INICIAR` e qualquer `status` enviado no corpo é ignorado.
3. O Membro é o responsável pelas tarefas que cria.
   - Critério de aceitação: para o Membro, `responsavelId` ausente ou igual ao próprio id define o próprio Membro como responsável; outro valor responde `403 ACESSO_NEGADO` sem criar tarefa.
4. O Proprietário escolhe o responsável.
   - Critério de aceitação: com `responsavelId` de qualquer membro do workspace, inclusive o Proprietário, a tarefa é atribuída a ele; sem `responsavelId`, o responsável é o próprio Proprietário.
5. As tags são normalizadas e reutilizadas por workspace.
   - Critério de aceitação: cada nome de tag é aparado nas pontas e convertido para minúsculas, sem alterar espaços internos; se já existe tag equivalente no workspace (a comparação ignora acentos e maiúsculas), ela é reutilizada, senão é criada; a mesma tag informada duas vezes na submissão é associada uma só vez.
6. Os limites do RT-04 são validados.
   - Critério de aceitação: título vazio responde `400 VALIDACAO` com `OBRIGATORIO` e com mais de 200 caracteres com `TAMANHO_EXCEDIDO`; descrição com mais de 5.000 caracteres, tag com mais de 50 caracteres e tag vazia (`TAMANHO_EXCEDIDO` e `OBRIGATORIO`) idem; mais de 10 tags distintas responde `LIMITE_EXCEDIDO` no campo `tags`; prioridade ou prazo em formato inválido responde `FORMATO_INVALIDO`; nada é gravado.
7. O prazo é uma data de calendário.
   - Critério de aceitação: o prazo `AAAA-MM-DD` é gravado e devolvido sem conversão de fuso.
8. Projeto e responsável devem ser do workspace do usuário.
   - Critério de aceitação: `projetoId` ou `responsavelId` inexistente ou de outro workspace responde `404 RECURSO_NAO_ENCONTRADO` sem gravar tarefa, tag nem associação.
9. A gravação é atômica.
   - Critério de aceitação: se qualquer parte falha, não ficam tarefa, tag nova nem associação parcial.
10. O usuário sem workspace não cria tarefas.
    - Critério de aceitação: a resposta é `403 SEM_WORKSPACE`.
11. As tags do workspace estão disponíveis para sugestão.
    - Critério de aceitação: `GET /api/v1/tags` devolve a lista (sem paginação) de nomes de tag somente do workspace do usuário, ordenada por `nome,asc`.
12. A exclusão de projeto remove suas tarefas.
    - Critério de aceitação: a migração define `ON DELETE CASCADE` de `projeto` para `tarefa` e de `tarefa` para `tarefa_tag`; excluir um projeto com tarefas remove as tarefas e suas associações, e as tags permanecem.
13. O formulário de nova tarefa abre em diálogo, com opção de página dedicada.
    - Critério de aceitação: a ação "Nova tarefa" abre um diálogo com título, descrição com contador, prioridade, prazo e tags; um ícone abre o mesmo formulário na rota `/projetos/{projetoId}/tarefas/nova`; o formulário não tem campo de status.
14. O seletor de responsável depende do papel.
    - Critério de aceitação: o Proprietário vê o campo "Responsável" com os membros de `GET /api/v1/membros`, com ele mesmo como valor inicial; o Membro não vê o campo.
15. As tags são digitadas com sugestão e erros aparecem no campo.
    - Critério de aceitação: o campo de tags sugere os nomes de `GET /api/v1/tags`, aceita nomes novos e mostra o limite de 10; erros `400 VALIDACAO` aparecem junto ao campo correspondente, com o diálogo aberto.

## Requisitos não-funcionais

- RNF-01 e RT-02: papel, workspace e projeto são validados no backend.
- RNF-04, RNF-05 e RNF-06: o formulário é compreensível e utilizável em 360 px, 768 px e 1280 px, nos navegadores definidos.
- RNF-08: 95% das requisições respondem em até 500 ms em ambiente local de teste, com até 1.000 tarefas por workspace.
- RNF-10: tarefa, tags e associações são gravadas de forma consistente.

## Cenários Gherkin

Cenário: [C01] Membro cria tarefa
  Dado um Membro em um projeto do próprio workspace
  Quando ele envia `POST /api/v1/tarefas` com campos válidos
  Então a resposta é `201` com `Location` e a tarefa no corpo
  E ele é o autor e o responsável, com prioridade `MEDIA` e status `PENDENTE_A_INICIAR`

Cenário: [C02] Proprietário escolhe o responsável
  Dado um Proprietário e um Membro do mesmo workspace
  Quando o Proprietário cria a tarefa com o `responsavelId` do Membro
  Então a tarefa é atribuída ao Membro
  E o Proprietário é o autor

Cenário: [C03] Proprietário atribui a si mesmo
  Dado um Proprietário e um projeto do workspace
  Quando ele cria a tarefa com o próprio `responsavelId`
  Então a tarefa é atribuída a ele

Cenário: [C04] Proprietário sem responsável informado
  Dado um Proprietário e um projeto do workspace
  Quando ele cria a tarefa sem `responsavelId`
  Então a tarefa é atribuída ao Proprietário

Cenário: [C05] Negar escolha de outro responsável ao Membro
  Dado um Membro e outro membro do workspace
  Quando o Membro cria a tarefa com o `responsavelId` do outro
  Então a resposta é `403 ACESSO_NEGADO`
  E nenhuma tarefa é criada

Cenário: [C06] Gravar prioridade e prazo informados
  Dado um usuário e um projeto do workspace
  Quando ele cria a tarefa com prioridade `ALTA` e prazo `2026-11-30`
  Então a tarefa guarda a prioridade `ALTA`
  E devolve o prazo `2026-11-30` sem conversão de fuso

Cenário: [C07] Ignorar o status enviado
  Dado um usuário e um projeto do workspace
  Quando ele cria a tarefa enviando `status` `FINALIZADO`
  Então a tarefa é criada com status `PENDENTE_A_INICIAR`

Cenário: [C08] Reutilizar tag equivalente
  Dado a tag "ação" já existente no workspace
  Quando o usuário cria a tarefa com a tag "ACAO"
  Então a tarefa é associada à tag existente
  E nenhuma tag nova é criada

Cenário: [C09] Normalizar o nome da tag nova
  Dado um workspace sem a tag "urgente"
  Quando o usuário cria a tarefa com a tag "  Urgente  "
  Então a tag é criada com o nome "urgente"

Cenário: [C10] Associar a tag repetida uma só vez
  Dado um usuário e um projeto do workspace
  Quando ele cria a tarefa com as tags "Bug" e "bug"
  Então a tarefa tem uma única associação com a tag "bug"

Cenário: [C11] Aceitar 10 tags
  Dado um usuário e um projeto do workspace
  Quando ele cria a tarefa com 10 tags distintas
  Então a tarefa é criada com as 10 tags

Cenário: [C12] Rejeitar 11 tags
  Dado um usuário e um projeto do workspace
  Quando ele cria a tarefa com 11 tags distintas
  Então a resposta é `400 VALIDACAO` com erro de campo `LIMITE_EXCEDIDO` em `tags`
  E nenhuma tarefa, tag nem associação é gravada

Cenário: [C13] Rejeitar tag vazia
  Dado um usuário e um projeto do workspace
  Quando ele cria a tarefa com uma tag só com espaços
  Então a resposta é `400 VALIDACAO` com erro de campo `OBRIGATORIO`
  E nenhuma tarefa é criada

Cenário: [C14] Rejeitar tag com 51 caracteres
  Dado um usuário e um projeto do workspace
  Quando ele cria a tarefa com uma tag de 51 caracteres
  Então a resposta é `400 VALIDACAO` com erro de campo `TAMANHO_EXCEDIDO`
  E nenhuma tarefa é criada

Cenário: [C15] Rejeitar título vazio
  Dado um usuário e um projeto do workspace
  Quando ele cria a tarefa com título vazio
  Então a resposta é `400 VALIDACAO` com erro de campo `OBRIGATORIO`
  E nenhuma tarefa é criada

Cenário: [C16] Rejeitar título com 201 caracteres
  Dado um usuário e um projeto do workspace
  Quando ele cria a tarefa com título de 201 caracteres
  Então a resposta é `400 VALIDACAO` com erro de campo `TAMANHO_EXCEDIDO`
  E nenhuma tarefa é criada

Cenário: [C17] Rejeitar descrição com 5001 caracteres
  Dado um usuário e um projeto do workspace
  Quando ele cria a tarefa com descrição de 5001 caracteres
  Então a resposta é `400 VALIDACAO` com erro de campo `TAMANHO_EXCEDIDO`
  E nenhuma tarefa é criada

Cenário: [C18] Rejeitar prazo em formato inválido
  Dado um usuário e um projeto do workspace
  Quando ele cria a tarefa com prazo "30/11/2026"
  Então a resposta é `400 VALIDACAO` com erro de campo `FORMATO_INVALIDO`
  E nenhuma tarefa é criada

Cenário: [C19] Ocultar projeto de outro workspace
  Dado um projeto de outro workspace
  Quando o usuário cria a tarefa nesse projeto
  Então a resposta é `404 RECURSO_NAO_ENCONTRADO`
  E nenhuma tarefa, tag nem associação é gravada

Cenário: [C20] Ocultar responsável de outro workspace
  Dado um usuário de outro workspace
  Quando o Proprietário cria a tarefa com o `responsavelId` desse usuário
  Então a resposta é `404 RECURSO_NAO_ENCONTRADO`
  E nenhuma tarefa, tag nem associação é gravada

Cenário: [C21] Desfazer tudo quando a gravação falha
  Dado que a gravação das associações de tag falha
  Quando o usuário cria a tarefa com tags novas
  Então nenhuma tarefa, tag nem associação é gravada

Cenário: [C22] Negar criação a usuário sem workspace
  Dado um usuário autenticado sem vínculo com workspace
  Quando ele envia `POST /api/v1/tarefas`
  Então a resposta é `403 SEM_WORKSPACE`

Cenário: [C23] Listar as tags somente do workspace
  Dado tags em dois workspaces diferentes
  Quando um usuário envia `GET /api/v1/tags`
  Então a lista contém apenas as tags do seu workspace, em ordem alfabética

Cenário: [C24] Excluir o projeto remove as tarefas
  Dado um projeto com tarefas associadas a tags
  Quando o Proprietário exclui o projeto
  Então as tarefas e suas associações são removidas
  E as tags do workspace permanecem

Cenário: [C25] Abrir o formulário em diálogo
  Dado a tela de um projeto
  Quando o usuário aciona "Nova tarefa"
  Então um diálogo com os campos da tarefa é exibido, sem campo de status

Cenário: [C26] Abrir o formulário em página dedicada
  Dado o diálogo de nova tarefa aberto
  Quando o usuário aciona o ícone de página dedicada
  Então a rota `/projetos/{projetoId}/tarefas/nova` exibe o mesmo formulário

Cenário: [C27] Exibir o seletor de responsável ao Proprietário
  Dado o formulário de nova tarefa aberto pelo Proprietário
  Quando o formulário é exibido
  Então o campo "Responsável" lista os membros do workspace, com o Proprietário selecionado

Cenário: [C28] Ocultar o seletor de responsável do Membro
  Dado o formulário de nova tarefa aberto por um Membro
  Quando o formulário é exibido
  Então o campo "Responsável" não aparece

Cenário: [C29] Sugerir tags existentes
  Dado tags existentes no workspace
  Quando o usuário digita no campo de tags
  Então as tags que combinam com o texto são sugeridas

Cenário: [C30] Exibir erro de campo no formulário
  Dado o diálogo de nova tarefa aberto
  Quando o usuário confirma com título vazio
  Então o diálogo permanece aberto com a mensagem de erro no campo título

## Contrato de Integração

Não se aplica. O modo é sequencial, e o contrato da criação de tarefa nasce no backend.

## Plano de execução

- Módulos ativados: backend, frontend
- Modo: sequencial
- Justificativa: a história ativa dois módulos e não tem Contrato de Integração completo (skill `criterio-fluxo-execucao`, passo 2); o backend vem primeiro e o frontend depois.

## Decisões técnicas relevantes

- Endpoints: `POST /api/v1/tarefas` e `GET /api/v1/tags`, conforme o Padrão de API.
- A migração cria `tarefa`, `tag` (com `COLLATE utf8mb4_0900_ai_ci` e unicidade `workspace_id` + `nome`) e `tarefa_tag`, com as chaves estrangeiras do modelo de dados e `ON DELETE CASCADE` de `projeto` para `tarefa` e de `tarefa` para `tarefa_tag`.
- Tag repetida na mesma submissão: é descartada em silêncio, comparada já normalizada, e conta uma só vez para o limite de 10. Não há erro nem aviso.
- Referência de outro workspace (projeto ou responsável) responde `404`, para não revelar a existência (Padrão de API, seção 6.1). Ordem dos erros: 404, 403, 400.
- Campos desconhecidos no corpo, como `status`, são ignorados.
- O seletor de responsável carrega até 100 membros em uma única consulta (`size=100`).
- `GET /api/v1/tags` devolve a lista completa de nomes, sem paginação, como exceção consciente à seção 7.1 do Padrão de API: o endpoint só alimenta a sugestão de digitação e o volume da V1 é pequeno (até 1.000 tarefas por workspace, RNF-08, com até 10 tags cada).
- O formulário é um componente único, usado no diálogo e na página dedicada, e reaproveitado por `HIST-003-tarefa`. Os textos ficam no módulo central de mensagens.

## Pontos em aberto

Nenhum.
