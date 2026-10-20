# HIST-001-busca-filtros — Filtrar tarefas

## Visão geral

Na tela de um projeto, Proprietário e Membro reduzem as tarefas por responsável, status, tag e intervalo de prazo. Os filtros se combinam com E lógico e valem para o Kanban e para a Lista. Os filtros ficam só na tela: não são guardados ao sair do projeto nem ao recarregar a página.

Fora de escopo: busca textual global (`HIST-002-busca-filtros`), filtros por outros campos, ordenação por relevância e filtros no Dashboard.

Dependências: `HIST-001-tarefa`, `HIST-002-tarefa` e `HIST-004-membros` (lista de membros para o filtro de responsável).

## Domínio

busca-filtros

## Origem

- Requisitos, RT-02, RT-03, RF-23 e RNF-01.
- Domínio, seções 3 e 4.
- Especificação, seções 5 e 6 (tela 8).
- Modelo de dados, seções 2.6 a 2.8.
- Decisões técnicas, DT-10.
- Padrão de API, seções 5, 6 e 7.

## Requisitos funcionais

1. A listagem de tarefas do projeto aceita filtros.
   - Critério de aceitação: `GET /api/v1/projetos/{projetoId}/tarefas` aceita `responsavelId`, `status` (repetível), `tag`, `prazoDe` e `prazoAte`; os filtros informados se aplicam em conjunto e a resposta mantém a paginação e a ordem `criadoEm,desc` de `HIST-002-tarefa`.
2. O prazo é filtrado por intervalo inclusivo.
   - Critério de aceitação: `prazoDe` e `prazoAte` (`AAAA-MM-DD`) são limites inclusivos sobre `prazo`; informado só um deles, o outro lado fica aberto.
3. Tarefas sem prazo saem de qualquer filtro de prazo.
   - Critério de aceitação: com `prazoDe` ou `prazoAte` informado, tarefas sem prazo não são devolvidas.
4. A tag é filtrada por nome, sem distinção de caixa e acentos.
   - Critério de aceitação: `tag` é aparado nas pontas e comparado com o nome inteiro da tag, ignorando maiúsculas e acentos; `tag` em branco é ignorado.
5. Um status pode ser filtrado em várias seleções.
   - Critério de aceitação: com `status` repetido, são devolvidas tarefas de qualquer um dos status informados.
6. Valores inválidos são rejeitados.
   - Critério de aceitação: status desconhecido, data fora do formato, `responsavelId` não numérico e `prazoDe` posterior a `prazoAte` respondem `400 VALIDACAO` com `FORMATO_INVALIDO` no parâmetro correspondente (`prazoAte` no caso do intervalo).
7. Sem resultados, a resposta é vazia.
   - Critério de aceitação: filtros sem correspondência, inclusive `responsavelId` inexistente ou de outro workspace, respondem `200` com `conteudo` vazio, sem devolver tarefas não filtradas.
8. O isolamento por workspace é mantido.
   - Critério de aceitação: projeto de outro workspace responde `404 RECURSO_NAO_ENCONTRADO` e nenhum filtro devolve tarefas de outro workspace.
9. A tela do projeto tem uma barra de filtros.
   - Critério de aceitação: a barra tem os campos "Responsável" (membros de `GET /api/v1/membros`), "Status" (seleção múltipla), "Tag" (com sugestões de `GET /api/v1/tags`), "Prazo de" e "Prazo até", e o botão "Limpar filtros".
10. Os filtros valem para as duas visualizações.
    - Critério de aceitação: o Kanban e a Lista usam os mesmos filtros nas consultas; no Kanban, com status selecionados, só aparecem as colunas desses status, e as contagens refletem o filtro.
11. A interface trata o resultado vazio.
    - Critério de aceitação: sem correspondência, as colunas do Kanban mostram "Nenhuma tarefa encontrada" e a Lista mostra "Nenhuma tarefa encontrada para os filtros aplicados", sem mostrar tarefas fora do filtro.
12. Os filtros são temporários.
    - Critério de aceitação: ao sair do projeto ou recarregar a página, os filtros voltam ao estado vazio.

## Requisitos não-funcionais

- RNF-01 e RT-02: o isolamento por workspace é garantido no backend.
- RNF-04, RNF-05 e RNF-06: a barra de filtros é utilizável em 360 px, 768 px e 1280 px, nos navegadores definidos; em 360 px ela pode ser recolhida.
- RNF-08: 95% das requisições respondem em até 500 ms em ambiente local de teste, com até 1.000 tarefas por workspace.

## Cenários Gherkin

Cenário: [C01] Combinar filtros
  Dado tarefas com responsáveis, status, tags e prazos diferentes no projeto
  Quando o usuário filtra por responsável, status, tag e intervalo de prazo
  Então a resposta contém só as tarefas que atendem a todos os filtros

Cenário: [C02] Filtrar por responsável
  Dado tarefas de dois responsáveis no projeto
  Quando o usuário filtra por um `responsavelId`
  Então a resposta contém só as tarefas dele

Cenário: [C03] Filtrar por mais de um status
  Dado tarefas em quatro status no projeto
  Quando o usuário filtra por `status=EM_TESTES` e `status=FINALIZADO`
  Então a resposta contém só as tarefas desses dois status

Cenário: [C04] Incluir os dois limites do prazo
  Dado tarefas com prazo igual ao primeiro e ao último dia do intervalo
  Quando o usuário filtra por esse intervalo
  Então as duas tarefas são devolvidas

Cenário: [C05] Aplicar só o limite inicial
  Dado tarefas com prazos antes e depois de uma data
  Quando o usuário filtra só com `prazoDe`
  Então a resposta contém as tarefas com prazo na data ou depois dela

Cenário: [C06] Excluir tarefas sem prazo
  Dado uma tarefa sem prazo
  Quando o usuário filtra por um intervalo de prazo
  Então a tarefa sem prazo não é devolvida

Cenário: [C07] Encontrar a tag ignorando caixa e acentos
  Dado uma tarefa com a tag "ação"
  Quando o usuário filtra por `tag=ACAO`
  Então a tarefa é devolvida

Cenário: [C08] Não aceitar correspondência parcial de tag
  Dado uma tarefa com a tag "backend"
  Quando o usuário filtra por `tag=back`
  Então a tarefa não é devolvida

Cenário: [C09] Ignorar tag em branco
  Dado tarefas com e sem tags
  Quando o usuário filtra com `tag` só com espaços
  Então todas as tarefas do projeto são devolvidas

Cenário: [C10] Rejeitar status desconhecido
  Dado um projeto do workspace
  Quando o usuário filtra por `status=ARQUIVADO`
  Então a resposta é `400 VALIDACAO` com erro de campo `FORMATO_INVALIDO`

Cenário: [C11] Rejeitar data em formato inválido
  Dado um projeto do workspace
  Quando o usuário filtra por `prazoDe=30/11/2026`
  Então a resposta é `400 VALIDACAO` com erro de campo `FORMATO_INVALIDO`

Cenário: [C12] Rejeitar intervalo invertido
  Dado um projeto do workspace
  Quando o usuário filtra com `prazoDe` posterior a `prazoAte`
  Então a resposta é `400 VALIDACAO` com erro de campo `FORMATO_INVALIDO` em `prazoAte`

Cenário: [C13] Devolver vazio quando nada corresponde
  Dado um projeto com tarefas
  Quando o usuário filtra por um responsável sem tarefas
  Então a resposta é `200` com `conteudo` vazio

Cenário: [C14] Ocultar projeto de outro workspace
  Dado um projeto de outro workspace
  Quando o usuário filtra as tarefas desse projeto
  Então a resposta é `404 RECURSO_NAO_ENCONTRADO`

Cenário: [C15] Exibir a barra de filtros
  Dado a tela de um projeto
  Quando o usuário a abre
  Então a barra mostra Responsável, Status, Tag, Prazo de, Prazo até e "Limpar filtros"

Cenário: [C16] Filtrar o Kanban e a Lista
  Dado tarefas de dois responsáveis no projeto
  Quando o usuário escolhe um responsável no filtro
  Então o Kanban e a Lista mostram só as tarefas dele

Cenário: [C17] Mostrar só as colunas dos status escolhidos
  Dado o Kanban de um projeto
  Quando o usuário seleciona o status "Em testes"
  Então apenas a coluna "Em testes" é exibida

Cenário: [C18] Exibir mensagem sem resultados
  Dado filtros sem correspondência
  Quando o usuário os aplica
  Então a Lista mostra "Nenhuma tarefa encontrada para os filtros aplicados"
  E o Kanban mostra "Nenhuma tarefa encontrada" nas colunas

Cenário: [C19] Limpar os filtros
  Dado filtros aplicados
  Quando o usuário aciona "Limpar filtros"
  Então todas as tarefas do projeto voltam a ser exibidas

Cenário: [C20] Descartar os filtros ao recarregar
  Dado filtros aplicados
  Quando o usuário recarrega a página
  Então a tela abre sem filtros

## Contrato de Integração

Não se aplica. O modo é sequencial, e o contrato dos filtros nasce no backend.

## Plano de execução

- Módulos ativados: backend, frontend
- Modo: sequencial
- Justificativa: a história ativa dois módulos e não tem Contrato de Integração completo (skill `criterio-fluxo-execucao`, passo 2); o backend vem primeiro e o frontend depois.

## Decisões técnicas relevantes

- Os filtros entram como parâmetros de consulta do endpoint de `HIST-002-tarefa`; não há endpoint novo (Padrão de API, seção 7.2).
- Tarefas sem prazo ficam fora de qualquer filtro de prazo, resultado natural da comparação em SQL.
- A tag é filtrada por nome inteiro. A comparação usa a collation `utf8mb4_0900_ai_ci` da coluna `tag.nome`.
- A ordem dos resultados continua `criadoEm,desc`, sem relevância.
- Os filtros ficam no estado local da tela do projeto, sem persistência em URL ou armazenamento. As consultas do Kanban e da Lista incluem os filtros na chave do TanStack Query.
- `GET /api/v1/tarefas?responsavelId=` (Proprietário, `HIST-006-tarefa`) é outro endpoint e não é afetado.
- Ordem de avaliação dos erros: 404, 403, 400.

## Pontos em aberto

Nenhum.
