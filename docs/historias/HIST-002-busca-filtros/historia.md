# HIST-002-busca-filtros — Buscar tarefas e projetos

## Visão geral

Proprietário e Membro buscam, em todo o workspace, projetos pelo nome e tarefas pelo título ou por tags. A busca ignora caixa e acentos, aceita parte do texto e só devolve dados do próprio workspace. Os resultados aparecem em duas listas paginadas, projetos e tarefas, numa tela de busca.

Fora de escopo: busca em descrição, membros ou outros campos, ordenação por relevância e filtros de tarefa (`HIST-001-busca-filtros`).

Dependências: `HIST-001-tarefa`, `HIST-001-projeto`, `HIST-002-tarefa` e `HIST-003-auth` (cabeçalho onde fica o campo de busca).

## Domínio

busca-filtros

## Origem

- Requisitos, RT-02, RF-24 e RNF-01.
- Domínio, seções 3 a 5.
- Especificação, seções 5 e 6 (tela 11).
- Decisões técnicas, DT-10.
- Padrão de API, seções 2.1, 6, 7 e 8.

## Requisitos funcionais

1. A busca de projetos usa o nome.
   - Critério de aceitação: `GET /api/v1/busca/projetos?q={termo}` devolve a página (`conteudo`, `pagina`, `tamanho`, `totalElementos`, `totalPaginas`) de projetos do workspace cujo nome contém o termo, com `id` e `nome`, ordenados por `nome,asc`.
2. A busca de tarefas usa título e tags.
   - Critério de aceitação: `GET /api/v1/busca/tarefas?q={termo}` devolve a página de tarefas do workspace cujo título contém o termo ou que têm alguma tag cujo nome contém o termo, com `id`, `titulo`, `status`, `projetoId`, `projetoNome` e `tags` (lista com os nomes das tags, por exemplo `["urgente","api"]`), ordenadas por `criadoEm,desc` e depois por `id,desc`; cada tarefa aparece uma só vez.
3. A correspondência é parcial e ignora caixa e acentos.
   - Critério de aceitação: o termo é aparado nas pontas e comparado como trecho do texto, sem distinguir maiúsculas e acentos; `%` e `_` no termo são tratados como caracteres comuns.
4. O termo é obrigatório e limitado.
   - Critério de aceitação: `q` ausente ou só com espaços responde `400 VALIDACAO` com `OBRIGATORIO`, e com mais de 100 caracteres com `TAMANHO_EXCEDIDO`.
5. Sem correspondência, a resposta é vazia.
   - Critério de aceitação: o termo sem correspondência no workspace responde `200` com `conteudo` vazio.
6. O isolamento por workspace é mantido.
   - Critério de aceitação: nenhum resultado, contagem ou indício de dados de outro workspace é devolvido; usuário sem workspace recebe `403 SEM_WORKSPACE`.
7. A tela de busca mostra as duas listas.
   - Critério de aceitação: o campo de busca do cabeçalho envia o termo ao ser confirmado e abre `/busca?q={termo}`, que mostra as seções "Projetos" e "Tarefas", cada uma com seu total e os botões "Anterior" e "Próxima" (20 itens por página).
8. Os resultados levam ao item.
   - Critério de aceitação: clicar num projeto abre `/projetos/{id}`; clicar numa tarefa abre `/tarefas/{id}/editar`; cada tarefa mostra título, status, nome do projeto e tags.
9. A interface trata o resultado vazio.
   - Critério de aceitação: sem resultados em ambas as seções, a tela mostra “Nenhum resultado para “{termo}””; a seção vazia isolada mostra “Nenhum projeto encontrado” ou “Nenhuma tarefa encontrada”.
10. A busca só é feita com termo válido.
    - Critério de aceitação: termo vazio ou só com espaços não envia a requisição, e o campo mostra a orientação “Digite ao menos um caractere”.

## Requisitos não-funcionais

- RNF-01 e RT-02: o isolamento por workspace é aplicado em toda consulta, no backend.
- RNF-04, RNF-05 e RNF-06: a busca é utilizável em 360 px, 768 px e 1280 px, nos navegadores definidos.
- RNF-08: 95% das requisições respondem em até 500 ms em ambiente local de teste, com até 1.000 tarefas por workspace.

## Cenários Gherkin

Cenário: [C01] Buscar projeto pelo nome
  Dado um projeto chamado "Lançamento Beta"
  Quando o usuário envia `GET /api/v1/busca/projetos?q=beta`
  Então o projeto é devolvido

Cenário: [C02] Ordenar projetos por nome
  Dado projetos "Beta", "Alfa" e "Alfabeto"
  Quando o usuário busca por "alf"
  Então a ordem é "Alfa", "Alfabeto"

Cenário: [C03] Buscar tarefa pelo título
  Dado uma tarefa chamada "Montar relatório"
  Quando o usuário envia `GET /api/v1/busca/tarefas?q=relat`
  Então a tarefa é devolvida com `projetoNome` e `tags`

Cenário: [C04] Buscar tarefa pela tag
  Dado uma tarefa com a tag "urgente" e sem o termo no título
  Quando o usuário busca por "urg"
  Então a tarefa é devolvida

Cenário: [C05] Devolver a tarefa uma só vez
  Dado uma tarefa com o termo no título e em duas tags
  Quando o usuário busca pelo termo
  Então a tarefa aparece uma única vez

Cenário: [C06] Ignorar caixa e acentos
  Dado uma tarefa chamada "Revisão da Ação"
  Quando o usuário busca por "ACAO"
  Então a tarefa é devolvida

Cenário: [C07] Tratar % e _ como caracteres comuns
  Dado tarefas chamadas "Meta 100%" e "Meta 1000"
  Quando o usuário busca por "100%"
  Então só a tarefa "Meta 100%" é devolvida

Cenário: [C08] Ordenar tarefas da mais recente para a mais antiga
  Dado duas tarefas que contêm o termo, criadas em instantes diferentes
  Quando o usuário busca pelo termo
  Então a mais recente vem primeiro

Cenário: [C09] Paginar os resultados
  Dado 25 tarefas que contêm o termo
  Quando o usuário busca com `size=20` e `page=1`
  Então a resposta traz as 5 tarefas restantes e `totalElementos` 25

Cenário: [C10] Rejeitar termo ausente
  Dado um usuário autenticado
  Quando ele envia a busca sem `q`
  Então a resposta é `400 VALIDACAO` com erro de campo `OBRIGATORIO`

Cenário: [C11] Rejeitar termo só com espaços
  Dado um usuário autenticado
  Quando ele envia `q` só com espaços
  Então a resposta é `400 VALIDACAO` com erro de campo `OBRIGATORIO`

Cenário: [C12] Rejeitar termo com 101 caracteres
  Dado um usuário autenticado
  Quando ele envia um termo com 101 caracteres
  Então a resposta é `400 VALIDACAO` com erro de campo `TAMANHO_EXCEDIDO`

Cenário: [C13] Devolver vazio sem correspondência
  Dado um termo que não existe no workspace
  Quando o usuário busca por ele
  Então a resposta é `200` com `conteudo` vazio nas duas buscas

Cenário: [C14] Não revelar dados de outro workspace
  Dado um termo que existe só em outro workspace
  Quando o usuário busca por ele
  Então a resposta é `200` com `conteudo` vazio

Cenário: [C15] Negar a busca a usuário sem workspace
  Dado um usuário autenticado sem vínculo com workspace
  Quando ele envia `GET /api/v1/busca/projetos?q=a`
  Então a resposta é `403 SEM_WORKSPACE`

Cenário: [C16] Abrir a tela de busca
  Dado o campo de busca do cabeçalho
  Quando o usuário digita um termo e confirma
  Então a rota `/busca?q={termo}` mostra as seções "Projetos" e "Tarefas" com seus totais

Cenário: [C17] Abrir um projeto pelo resultado
  Dado um projeto nos resultados
  Quando o usuário o aciona
  Então a tela `/projetos/{id}` é exibida

Cenário: [C18] Abrir uma tarefa pelo resultado
  Dado uma tarefa nos resultados
  Quando o usuário a aciona
  Então a tela `/tarefas/{id}/editar` é exibida

Cenário: [C19] Paginar uma seção da tela
  Dado mais de 20 tarefas nos resultados
  Quando o usuário aciona "Próxima" na seção "Tarefas"
  Então a segunda página de tarefas é exibida
  E a seção "Projetos" não muda

Cenário: [C20] Exibir mensagem sem resultados
  Dado um termo sem correspondência
  Quando o usuário confirma a busca
  Então a tela mostra “Nenhum resultado para “{termo}””

Cenário: [C21] Exibir seção vazia isolada
  Dado um termo que só corresponde a tarefas
  Quando o usuário confirma a busca
  Então a seção "Projetos" mostra “Nenhum projeto encontrado”

Cenário: [C22] Bloquear termo vazio na interface
  Dado o campo de busca vazio
  Quando o usuário confirma a busca
  Então nenhuma requisição é enviada
  E o campo mostra “Digite ao menos um caractere”

## Contrato de Integração

Não se aplica. O modo é sequencial, e o contrato da busca nasce no backend.

## Plano de execução

- Módulos ativados: backend, frontend
- Modo: sequencial
- Justificativa: a história ativa dois módulos e não tem Contrato de Integração completo (skill `criterio-fluxo-execucao`, passo 2); o backend vem primeiro e o frontend depois.

## Decisões técnicas relevantes

- Endpoints: `GET /api/v1/busca/projetos` e `GET /api/v1/busca/tarefas`, sob o prefixo `/api/v1/busca` do Padrão de API. Dois endpoints mantêm a paginação padrão de cada coleção.
- Correspondência por trecho (`LIKE '%termo%'`) com `COLLATE utf8mb4_0900_ai_ci` nas colunas comparadas, conforme DT-10. Os caracteres `%`, `_` e `\` do termo são escapados. Não há normalização de espaços internos.
- A busca de tarefas usa `EXISTS` sobre `tarefa_tag` e `tag`, para não duplicar linhas.
- A busca roda ao confirmar o termo (Enter ou botão), sem busca incremental durante a digitação.
- Ordem dos resultados: sem relevância; projetos por `nome,asc`, tarefas por `criadoEm,desc`.
- O campo de busca é acrescentado ao cabeçalho do layout autenticado de `HIST-003-auth`; esta história não cria cabeçalho próprio.
- Esta história valida `q` (obrigatório, aparado e de até 100 caracteres). A ausência de `q` é mapeada para `400 VALIDACAO` com `OBRIGATORIO`, e não para o erro padrão do Spring, usando o tratador RFC 7807 de `HIST-002-fundacao`.
- Ordem de avaliação dos erros: 404, 403, 400.

## Pontos em aberto

Nenhum.
