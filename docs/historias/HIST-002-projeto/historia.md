# HIST-002-projeto — Editar e remover projeto

## Visão geral

O Proprietário corrige o nome de um projeto e remove projetos que não devam mais existir. A remoção na V1 é física, sem exclusão lógica, e a integridade definida no modelo de dados exclui junto as tarefas do projeto.

Fora de escopo: criar ou listar projetos (`HIST-001-projeto`), mover tarefas para outro projeto (fora da V1), exclusão lógica ou arquivamento e restauração após a exclusão.

Dependências: `HIST-001-projeto` e as histórias de `auth`. A cascata sobre as tarefas só pode ser verificada quando a tabela `tarefa` existir; ela é testada em `HIST-001-tarefa`.

## Domínio

projeto

## Origem

- Requisitos, RT-02, RT-04, RF-14 e RF-15.
- Domínio, seções 3 a 5.
- Especificação, seções 3.1 e 6 (tela 7).
- Modelo de dados, seções 2.5 e 6.
- Padrão de API, seções 6 e 8.

## Requisitos funcionais

1. O Proprietário edita o nome do projeto.
   - Critério de aceitação: `PUT /api/v1/projetos/{id}` com `nome` válido responde `200` com o projeto atualizado, no mesmo workspace.
2. O nome editado respeita RT-04.
   - Critério de aceitação: o nome é aparado nas pontas; vazio ou com mais de 150 caracteres responde `400 VALIDACAO` e o projeto permanece inalterado.
3. O Proprietário remove o projeto.
   - Critério de aceitação: `DELETE /api/v1/projetos/{id}` responde `204`, o projeto é excluído fisicamente e deixa de aparecer na listagem.
4. Somente o Proprietário edita ou remove projetos.
   - Critério de aceitação: o Membro recebe `403 ACESSO_NEGADO` na edição e na remoção, sem alterar dados.
5. Projetos de outro workspace não são revelados.
   - Critério de aceitação: edição ou remoção de projeto inexistente ou de outro workspace responde `404 RECURSO_NAO_ENCONTRADO`, sem alterar dados.
6. A remoção de um projeto exclui as tarefas dele, pela chave estrangeira `ON DELETE CASCADE`.
   - Critério de aceitação: a migração da tabela `tarefa` define a FK com `ON DELETE CASCADE`; a verificação com tarefas existentes é feita em `HIST-001-tarefa`.
7. A interface pede confirmação antes de excluir.
   - Critério de aceitação: ao acionar "Excluir", um diálogo de confirmação é exibido; cancelar não remove o projeto.
8. A interface exibe as ações de editar e excluir somente ao Proprietário.
   - Critério de aceitação: o Membro não vê as ações "Renomear" e "Excluir" nos cartões de projeto.

## Requisitos não-funcionais

- RNF-01 e RT-02: somente o Proprietário administra projetos; os dados ficam isolados por workspace.
- RNF-05 e RNF-06: as ações de edição e remoção são utilizáveis em 360 px, 768 px e 1280 px, nos navegadores definidos.
- RNF-08: 95% das requisições respondem em até 500 ms em ambiente local de teste, com até 1.000 tarefas por workspace.
- RNF-10: a edição é persistida corretamente e a remoção não deixa estado inconsistente.

## Cenários Gherkin

Cenário: [C01] Editar o nome com valor válido
  Dado um projeto do workspace do Proprietário
  Quando ele envia `PUT /api/v1/projetos/{id}` com um novo nome dentro do limite
  Então a resposta é `200` com o nome atualizado
  E a listagem mostra o novo nome

Cenário: [C02] Rejeitar nome com 151 caracteres na edição
  Dado um projeto do workspace do Proprietário
  Quando ele envia um nome com 151 caracteres
  Então a resposta é `400 VALIDACAO` com erro de campo `TAMANHO_EXCEDIDO`
  E o nome do projeto permanece o mesmo

Cenário: [C03] Rejeitar nome vazio na edição
  Dado um projeto do workspace do Proprietário
  Quando ele envia um nome vazio
  Então a resposta é `400 VALIDACAO` com erro de campo `OBRIGATORIO`
  E o nome do projeto permanece o mesmo

Cenário: [C04] Negar edição por Membro
  Dado um projeto do workspace e um usuário com papel Membro
  Quando ele envia `PUT /api/v1/projetos/{id}`
  Então a resposta é `403 ACESSO_NEGADO`
  E o projeto permanece inalterado

Cenário: [C05] Negar remoção por Membro
  Dado um projeto do workspace e um usuário com papel Membro
  Quando ele envia `DELETE /api/v1/projetos/{id}`
  Então a resposta é `403 ACESSO_NEGADO`
  E o projeto continua existindo

Cenário: [C06] Ocultar projeto de outro workspace na edição
  Dado um projeto de outro workspace
  Quando o Proprietário envia `PUT /api/v1/projetos/{id}` para ele
  Então a resposta é `404 RECURSO_NAO_ENCONTRADO`
  E o projeto permanece inalterado

Cenário: [C07] Ocultar projeto de outro workspace na remoção
  Dado um projeto de outro workspace
  Quando o Proprietário envia `DELETE /api/v1/projetos/{id}` para ele
  Então a resposta é `404 RECURSO_NAO_ENCONTRADO`
  E o projeto continua existindo

Cenário: [C08] Remover projeto
  Dado um projeto do workspace do Proprietário
  Quando ele envia `DELETE /api/v1/projetos/{id}`
  Então a resposta é `204`
  E o projeto é excluído fisicamente

Cenário: [C09] Projeto removido sai da listagem
  Dado um projeto removido pelo Proprietário
  Quando qualquer usuário do workspace lista os projetos
  Então o projeto não aparece

Cenário: [C10] Pedir confirmação antes de excluir
  Dado a tela de projetos aberta pelo Proprietário
  Quando ele aciona "Excluir" e cancela o diálogo de confirmação
  Então o projeto não é removido

Cenário: [C11] Ocultar editar e excluir para o Membro
  Dado a tela de projetos aberta por um Membro
  Quando os cartões de projeto são exibidos
  Então as ações "Renomear" e "Excluir" não aparecem

## Contrato de Integração

Não se aplica. O modo é sequencial, e o contrato da edição e da remoção nasce no backend.

## Plano de execução

- Módulos ativados: backend, frontend
- Modo: sequencial
- Justificativa: a história ativa dois módulos e não tem Contrato de Integração completo (skill `criterio-fluxo-execucao`, passo 2); o backend vem primeiro e o frontend depois.

## Decisões técnicas relevantes

- Endpoints: `PUT /api/v1/projetos/{id}` e `DELETE /api/v1/projetos/{id}`, conforme o Padrão de API.
- Exclusão física, sem exclusão lógica (Modelo de dados, seção 6).
- A tabela `tarefa` ainda não existe nesta história. Por isso a cascata (`ON DELETE CASCADE` de `projeto` para `tarefa`, e de `tarefa` para `tarefa_tag`) é criada na migração de `HIST-001-tarefa`, que também ganha o cenário de exclusão do projeto com tarefas.
- A confirmação de exclusão usa o diálogo destrutivo do catálogo de componentes; editar reutiliza o diálogo do formulário de projeto.
- Ordem de avaliação dos erros: 404, 403, 400.

## Pontos em aberto

Nenhum.
