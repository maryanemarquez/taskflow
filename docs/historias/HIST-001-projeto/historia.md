# HIST-001-projeto — Criar e listar projetos

## Visão geral

O Proprietário cria projetos para organizar o trabalho do workspace. Proprietário e Membro listam e consultam os projetos do próprio workspace, inclusive com a coleção vazia. Todo membro tem acesso automático a todos os projetos.

Fora de escopo: editar ou remover projeto (`HIST-002-projeto`), criar tarefas (domínio `tarefa`) e acesso seletivo por projeto (fora da V1).

Dependências: `HIST-001-auth` e `HIST-002-auth`.

## Domínio

projeto

## Origem

- Requisitos, RT-02, RT-04 e RF-11 a RF-13.
- Domínio, seções 3 a 5.
- Especificação, seções 3.1, 5, 6 (tela 7) e 7.3.
- Modelo de dados, seção 2.5.
- Padrão de API, seções 2, 3, 6 e 7.

## Requisitos funcionais

1. O Proprietário cria projeto informando o nome.
   - Critério de aceitação: `POST /api/v1/projetos` com `nome` válido responde `201` com cabeçalho `Location` e o projeto no corpo, vinculado ao workspace do usuário.
2. O nome do projeto respeita RT-04.
   - Critério de aceitação: o nome é aparado nas pontas; vazio ou com mais de 150 caracteres responde `400 VALIDACAO` sem criar projeto.
3. Somente o Proprietário cria projetos.
   - Critério de aceitação: o Membro recebe `403 ACESSO_NEGADO` e nenhum projeto é criado.
4. Proprietário e Membro listam os projetos do workspace.
   - Critério de aceitação: `GET /api/v1/projetos` devolve a página (`conteudo`, `pagina`, `tamanho`, `totalElementos`, `totalPaginas`) somente com projetos do próprio workspace, ordenados por `nome,asc`; todo projeto criado fica visível a todos os membros.
5. Proprietário e Membro consultam um projeto.
   - Critério de aceitação: `GET /api/v1/projetos/{id}` devolve o projeto do próprio workspace; projeto inexistente ou de outro workspace responde `404 RECURSO_NAO_ENCONTRADO`.
6. Usuário sem workspace não acessa projetos.
   - Critério de aceitação: as rotas de projetos respondem `403 SEM_WORKSPACE` ao usuário sem vínculo.
7. A tela de projetos exibe estado vazio quando não há projetos.
   - Critério de aceitação: sem projetos, a tela mostra a mensagem de estado vazio; o Proprietário vê também a ação de criar e o Membro não.
8. A criação de projeto na interface é feita em diálogo.
   - Critério de aceitação: a ação "Novo projeto" (só para o Proprietário) abre um diálogo com o campo nome e o contador de caracteres.

## Requisitos não-funcionais

- RNF-01 e RT-02: autorização e isolamento por workspace, validados no backend.
- RNF-04, RNF-05 e RNF-06: listagem e estado vazio utilizáveis em 360 px, 768 px e 1280 px, nos navegadores definidos.
- RNF-08: 95% das requisições respondem em até 500 ms em ambiente local de teste, com até 1.000 tarefas por workspace.
- RNF-10: o projeto criado é persistido de forma consistente.

## Cenários Gherkin

Cenário: [C01] Proprietário cria projeto
  Dado um Proprietário autenticado
  Quando ele envia `POST /api/v1/projetos` com um nome válido
  Então a resposta é `201` com `Location` e o projeto no corpo
  E o projeto pertence ao workspace do Proprietário

Cenário: [C02] Membro vê o projeto criado
  Dado um projeto criado pelo Proprietário
  Quando um Membro do mesmo workspace lista os projetos
  Então o projeto aparece na listagem

Cenário: [C03] Aceitar nome com exatamente 150 caracteres
  Dado um nome com 150 caracteres
  Quando o Proprietário cria o projeto
  Então o projeto é criado

Cenário: [C04] Rejeitar nome com 151 caracteres
  Dado um nome com 151 caracteres
  Quando o Proprietário cria o projeto
  Então a resposta é `400 VALIDACAO` com erro de campo `TAMANHO_EXCEDIDO`
  E nenhum projeto é criado

Cenário: [C05] Rejeitar nome vazio
  Dado um nome vazio ou só com espaços
  Quando o Proprietário cria o projeto
  Então a resposta é `400 VALIDACAO` com erro de campo `OBRIGATORIO`
  E nenhum projeto é criado

Cenário: [C06] Negar criação por Membro
  Dado um usuário com papel Membro
  Quando ele envia `POST /api/v1/projetos`
  Então a resposta é `403 ACESSO_NEGADO`
  E nenhum projeto é criado

Cenário: [C07] Listar somente projetos do próprio workspace
  Dado projetos em dois workspaces diferentes
  Quando um usuário de um deles lista os projetos
  Então a listagem contém apenas os projetos do seu workspace

Cenário: [C08] Listar em ordem alfabética
  Dado projetos com os nomes "Beta", "Alfa" e "Gama"
  Quando um usuário lista os projetos
  Então a ordem é "Alfa", "Beta", "Gama"

Cenário: [C09] Estado vazio para o Proprietário
  Dado um workspace sem projetos
  Quando o Proprietário abre a tela de projetos
  Então a tela mostra o estado vazio com a ação de criar projeto

Cenário: [C10] Estado vazio para o Membro
  Dado um workspace sem projetos
  Quando um Membro abre a tela de projetos
  Então a tela mostra o estado vazio sem a ação de criar projeto

Cenário: [C11] Ocultar a ação de criar para o Membro
  Dado um workspace com projetos
  Quando um Membro abre a tela de projetos
  Então a ação "Novo projeto" não é exibida

Cenário: [C12] Criar projeto pelo diálogo
  Dado a tela de projetos aberta pelo Proprietário
  Quando ele aciona "Novo projeto" e confirma um nome válido
  Então o diálogo é fechado
  E o projeto aparece na listagem

Cenário: [C13] Ocultar projeto de outro workspace
  Dado um projeto de outro workspace
  Quando um usuário consulta `GET /api/v1/projetos/{id}` desse projeto
  Então a resposta é `404 RECURSO_NAO_ENCONTRADO`

Cenário: [C14] Negar acesso a projetos sem workspace
  Dado um usuário autenticado sem vínculo com workspace
  Quando ele lista os projetos
  Então a resposta é `403 SEM_WORKSPACE`

## Contrato de Integração

Não se aplica. O modo é sequencial, e o contrato dos projetos nasce no backend.

## Plano de execução

- Módulos ativados: backend, frontend
- Modo: sequencial
- Justificativa: a história ativa dois módulos e não tem Contrato de Integração completo (skill `criterio-fluxo-execucao`, passo 2); o backend vem primeiro e o frontend depois.

## Decisões técnicas relevantes

- Endpoints: `POST /api/v1/projetos`, `GET /api/v1/projetos` e `GET /api/v1/projetos/{id}`, conforme o Padrão de API.
- A migração cria a tabela `projeto` do modelo de dados (seção 2.5), com FK para `workspace`.
- Ordem da listagem: `nome,asc`. Nomes repetidos no mesmo workspace são permitidos, pois nenhum documento exige unicidade.
- Ordem de avaliação dos erros: 404, 403, 400 (Padrão de API, seção 6.1).
- A criação usa diálogo, como o formulário de tarefa; a exclusão usa confirmação (`HIST-002-projeto`).
- O estado vazio da tela segue a Especificação (telas 6 e 7); os textos ficam no módulo central de mensagens.

## Pontos em aberto

Nenhum.
