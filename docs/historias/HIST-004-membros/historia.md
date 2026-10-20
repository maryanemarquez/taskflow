# HIST-004-membros — Listar membros e convites

## Visão geral

Proprietário e Membro veem quem faz parte do workspace. Só o Proprietário vê os convites pendentes e expirados, e é na mesma tela que ele convida novas pessoas. Convites expirados continuam na lista, com indicação explícita, para o Proprietário gerar um novo.

Fora de escopo: remover membro (`HIST-005-membros`), reatribuição de tarefas (`HIST-006-tarefa`), reenvio automático e edição de papéis (fora da V1).

Dependências: `HIST-001-membros` (criação de convites), `HIST-001-auth` e `HIST-002-auth`.

## Domínio

membros

## Origem

- Requisitos, RF-06, RF-09, RF-27 a RF-29 e RNF-01.
- Domínio, seções 3 a 5.
- Especificação, seções 3.3, 5, 6 (tela 10) e 7.7.
- Modelo de dados, seções 2.3 e 2.4.
- Decisões técnicas, DT-12.
- Padrão de API, seções 2.1, 3 e 6.

## Requisitos funcionais

1. Proprietário e Membro listam os membros do workspace.
   - Critério de aceitação: `GET /api/v1/membros` devolve a página (`conteudo`, `pagina`, `tamanho`, `totalElementos`, `totalPaginas`) somente com membros do próprio workspace, ordenados por `nome,asc`; cada item traz `usuarioId`, `nome`, `email` e `papel`.
2. Somente o Proprietário lista os convites.
   - Critério de aceitação: `GET /api/v1/convites` devolve a página dos convites do workspace que não foram utilizados nem invalidados, ordenados por `criadoEm,desc`; cada item traz `id`, `email`, `criadoEm`, `expiraEm` e `expirado`; o Membro recebe `403 ACESSO_NEGADO`.
3. Convites expirados continuam na lista, com indicação explícita.
   - Critério de aceitação: o item com `expiraEm` igual ou anterior ao instante atual traz `expirado` verdadeiro; a lista nunca devolve o token nem o hash.
4. Nenhum dado de outro workspace é exposto.
   - Critério de aceitação: as listas contêm só registros do workspace do usuário; usuário sem workspace recebe `403 SEM_WORKSPACE`.
5. A tela de membros exibe os membros para todos.
   - Critério de aceitação: a tela lista nome, e-mail e papel de cada membro; o workspace com apenas o Proprietário mostra só ele.
6. A tela exibe convites e a ação de convidar somente ao Proprietário.
   - Critério de aceitação: o Proprietário vê a seção de convites, com o selo "Expirado" nos expirados, e a ação "Convidar"; o Membro não vê nenhum dos dois.
7. O Proprietário convida pela tela.
   - Critério de aceitação: "Convidar" abre um diálogo com o campo e-mail; ao confirmar, a tela chama `POST /api/v1/convites`, fecha o diálogo e mostra o convite na lista; erros de campo aparecem no diálogo.
8. O Proprietário gera um novo convite para um expirado.
   - Critério de aceitação: a ação "Gerar novo convite" no item expirado chama `POST /api/v1/convites` com o e-mail dele e atualiza a lista.

## Requisitos não-funcionais

- RNF-01: o papel é validado no backend; ocultar elementos na interface não substitui a autorização.
- RNF-04, RNF-05 e RNF-06: a tela é utilizável em 360 px, 768 px e 1280 px, nos navegadores definidos.
- RNF-08: 95% das requisições respondem em até 500 ms em ambiente local de teste, com até 1.000 tarefas por workspace.

## Cenários Gherkin

Cenário: [C01] Listar membros do workspace
  Dado um workspace com um Proprietário e dois Membros
  Quando um Membro envia `GET /api/v1/membros`
  Então a resposta é `200` com os três membros, com `nome`, `email` e `papel`

Cenário: [C02] Listar membros em ordem alfabética
  Dado membros com os nomes "Carla", "Ana" e "Bruno"
  Quando um usuário lista os membros
  Então a ordem é "Ana", "Bruno", "Carla"

Cenário: [C03] Listar somente membros do próprio workspace
  Dado membros em dois workspaces diferentes
  Quando um usuário de um deles lista os membros
  Então a lista contém apenas os membros do seu workspace

Cenário: [C04] Listar convites como Proprietário
  Dado um convite pendente e um convite já utilizado
  Quando o Proprietário envia `GET /api/v1/convites`
  Então a resposta traz somente o convite pendente, com `email`, `criadoEm`, `expiraEm` e `expirado`
  E a resposta não contém token nem hash

Cenário: [C05] Indicar convite expirado
  Dado um convite cujo instante atual é igual a `expiraEm`
  Quando o Proprietário lista os convites
  Então o item traz `expirado` verdadeiro

Cenário: [C06] Omitir convite invalidado
  Dado um convite invalidado por um convite mais novo
  Quando o Proprietário lista os convites
  Então somente o convite mais novo aparece

Cenário: [C07] Negar lista de convites ao Membro
  Dado um usuário com papel Membro
  Quando ele envia `GET /api/v1/convites`
  Então a resposta é `403 ACESSO_NEGADO`

Cenário: [C08] Negar listas a usuário sem workspace
  Dado um usuário autenticado sem vínculo com workspace
  Quando ele lista os membros
  Então a resposta é `403 SEM_WORKSPACE`

Cenário: [C09] Exibir a tela de membros ao Proprietário
  Dado um workspace com membros e convites
  Quando o Proprietário abre a tela de membros
  Então a tela mostra os membros, a seção de convites com o selo "Expirado" e a ação "Convidar"

Cenário: [C10] Ocultar convites e convidar do Membro
  Dado um workspace com convites
  Quando um Membro abre a tela de membros
  Então a tela mostra os membros
  E não mostra a seção de convites nem a ação "Convidar"

Cenário: [C11] Convidar pelo diálogo
  Dado a tela de membros aberta pelo Proprietário
  Quando ele aciona "Convidar" e confirma um e-mail válido
  Então o diálogo é fechado
  E o convite aparece na lista de convites

Cenário: [C12] Exibir erro de campo no diálogo de convite
  Dado o diálogo de convite aberto
  Quando o Proprietário confirma um e-mail inválido
  Então o diálogo permanece aberto com a mensagem de erro no campo

Cenário: [C13] Gerar novo convite para um expirado
  Dado um convite expirado na lista
  Quando o Proprietário aciona "Gerar novo convite"
  Então o frontend chama `POST /api/v1/convites` com o e-mail do convite expirado
  E a lista passa a mostrar o novo convite

## Contrato de Integração

Não se aplica. O modo é sequencial, e o contrato das listas nasce no backend.

## Plano de execução

- Módulos ativados: backend, frontend
- Modo: sequencial
- Justificativa: a história ativa dois módulos e não tem Contrato de Integração completo (skill `criterio-fluxo-execucao`, passo 2); o backend vem primeiro e o frontend depois.

## Decisões técnicas relevantes

- Endpoints: `GET /api/v1/membros` e `GET /api/v1/convites`, conforme o Padrão de API; a criação reutiliza `POST /api/v1/convites` de `HIST-001-membros`.
- Dados do membro limitados a `usuarioId`, `nome`, `email` e `papel`; ordenação fixa em `nome,asc` para membros e `criadoEm,desc` para convites.
- A lista de convites mostra pendentes e expirados; utilizados e invalidados saem da lista. O indicador `expirado` é calculado com o `Clock` injetado.
- A seção de convites aparece pelo papel devolvido por `GET /api/v1/auth/eu`; o backend continua sendo a barreira.
- Ordem de avaliação dos erros: 404, 403, 400.

## Pontos em aberto

Nenhum.
