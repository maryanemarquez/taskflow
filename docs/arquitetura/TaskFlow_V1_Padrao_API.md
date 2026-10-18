# TaskFlow — Padrão de API (V1)

**Versão:** V1
**Data:** 17/10/2026
**Referências:** Especificação V1, Requisitos V1, Modelo de Dados V1, Decisões Técnicas V1

## 1. Objetivo e escopo

Este documento define as **convenções comuns** da API REST do TaskFlow V1: formato, autenticação, erros, paginação, filtros e datas. Os endpoints concretos de cada funcionalidade **não** são definidos aqui — eles são fechados no "Contrato de Integração" de cada história (ver seção 11), sempre seguindo este padrão.

O objetivo é reduzir a carga de cada Contrato de Integração e evitar divergência entre o `construtor` do módulo `backend` e o do módulo `frontend` quando atuam em paralelo.

## 2. Convenções gerais

| Item | Padrão |
|---|---|
| Estilo | REST sobre HTTPS, JSON (`Content-Type: application/json; charset=utf-8`) |
| Prefixo e versão | `/api/v1`. Mudança incompatível exige nova versão (`/api/v2`) |
| Nomes de recursos | Português, plural, minúsculas, `kebab-case` (ex.: `/api/v1/projetos`, `/api/v1/tarefas`) |
| Campos JSON | `camelCase` (ex.: `responsavelId`, `criadoEm`) |
| Identificadores | Numéricos (`BIGINT` do banco), serializados como número |
| Enumerações | Strings em `UPPER_SNAKE_CASE`, iguais às do modelo de dados (ex.: `PENDENTE_A_INICIAR`, `PROPRIETARIO`, `ALTA`) |
| Campos nulos | Campos opcionais sem valor são omitidos ou enviados como `null`; o cliente trata os dois casos |
| Texto | UTF-8; o backend remove espaços das pontas de campos de texto curtos |
| E-mail | Normalizado pelo backend (sem espaços nas pontas, em minúsculas) |

### 2.1 Famílias de recursos (indicativo)

Prefixos sugeridos, para manter coerência entre histórias. Os caminhos finais são definidos em cada Contrato de Integração.

| Domínio (backlog) | Prefixo |
|---|---|
| `auth` | `/api/v1/auth` |
| `fundacao` | Sem endpoints de negócio (apenas base técnica, ex.: verificação de saúde) |
| `membros` (e dados do workspace) | `/api/v1/workspace`, `/api/v1/membros`, `/api/v1/convites` |
| `projeto` | `/api/v1/projetos` |
| `tarefa` | `/api/v1/tarefas` (e `/api/v1/projetos/{projetoId}/tarefas` para listagem por projeto) |
| `busca-filtros` | `/api/v1/busca` |
| `dashboard` | `/api/v1/dashboard` |
| `configuracoes` | `/api/v1/perfil` |

#### Endpoints transversais (fora do prefixo do domínio)

Alguns endpoints auxiliares ficam no escopo de um domínio, ainda que o caminho aponte para outro recurso:

| Endpoint | Domínio da história | Finalidade |
|---|---|---|
| `GET /api/v1/tags` | `tarefa` | Tags do workspace, para sugestão na digitação (RF-16) |
| `PATCH /api/v1/tarefas/{id}/responsavel` | `tarefa` | Troca de responsável (RF-20) |
| `POST /api/v1/convites/validar` | `membros` | Valida o token do convite antes do cadastro ou do aceite (RF-27, RF-28); token no corpo |
| `POST /api/v1/convites/aceitar` (previsto) | `membros` | Aceite do convite por conta existente sem workspace (RF-28, RF-39); definido no Contrato da história |

## 3. Métodos HTTP e códigos de sucesso

| Operação | Método | Sucesso |
|---|---|---|
| Consultar | `GET` | `200 OK` |
| Criar | `POST` | `201 Created` + cabeçalho `Location` com o recurso criado + corpo com o recurso |
| Ação sem recurso criado (ex.: login, solicitar recuperação) | `POST` | `200 OK` (ou `202 Accepted` quando o processamento é assíncrono, como o envio de e-mail) |
| Substituir/editar | `PUT` | `200 OK` com o recurso atualizado |
| Alteração parcial (ex.: status da tarefa) | `PATCH` | `200 OK` com o recurso atualizado |
| Remover | `DELETE` | `204 No Content` |
| Logout | `POST` | `204 No Content` |

## 4. Autenticação e sessão

- Recursos protegidos exigem `Authorization: Bearer <accessToken>`.
- Tokens são devolvidos no **corpo** das respostas de login, cadastro e renovação:

```json
{
  "tipo": "Bearer",
  "accessToken": "…",
  "accessTokenExpiraEm": "2026-10-15T20:15:00Z",
  "refreshToken": "…",
  "refreshTokenExpiraEm": "2026-10-22T20:00:00Z"
}
```

- A renovação (`refresh`) devolve um novo par de tokens e **revoga** o refresh token usado (rotação). O reuso de um refresh token já revogado segue a janela de tolerância das Decisões Técnicas (DT-05): até 10 segundos após a rotação, responde `401 NAO_AUTENTICADO` sem revogar os demais tokens; depois, revoga todos os refresh tokens do usuário.
- O logout revoga o refresh token informado.
- **Comportamento do cliente em `401`:** apenas `401` com `codigo = NAO_AUTENTICADO` dispara a renovação do token. O cliente mantém uma **fila única** de renovação (uma por vez); as requisições que falharam aguardam o resultado e são repetidas uma única vez. Se a renovação falhar, a sessão é encerrada. Outros `401` (ex.: `CREDENCIAIS_INVALIDAS`) não disparam renovação. A chamada de renovação nunca dispara nova renovação, e antes de encerrar a sessão por falha nela o cliente aplica a regra de abas simultâneas do DT-04 das Decisões Técnicas.
- O token de acesso identifica apenas o usuário. **O backend consulta o vínculo e o papel do usuário no workspace a cada requisição**, para que a remoção de um membro ou a mudança de papel tenham efeito imediato. Usuário autenticado sem workspace recebe `403` com o código `SEM_WORKSPACE` em qualquer recurso que exija workspace.
- **Tokens de convite e de recuperação de senha trafegam no corpo de requisições `POST`**, nunca em query string ou no caminho da API, para não aparecerem em logs. (A rota do aplicativo web, como `/invite/{token}`, pode conter o token; é o cliente que o repassa no corpo.)
- Falhas de login retornam sempre a mesma mensagem genérica (`CREDENCIAIS_INVALIDAS`), sem indicar se o e-mail existe. A solicitação de recuperação de senha retorna a mesma resposta (`202`) para e-mail cadastrado ou não (RF-37).

## 5. Datas e horas

| Tipo | Formato | Exemplo |
|---|---|---|
| Data e hora (`criadoEm`, `expiraEm`, etc.) | ISO-8601 em **UTC**, com `Z` | `2026-10-15T20:00:00Z` |
| Data de calendário (`prazo`) | `AAAA-MM-DD`, sem fuso | `2026-11-30` |

A API nunca envia horário local. A conversão para America/Sao_Paulo é feita pelo cliente (RT-03).

## 6. Erros

Toda resposta de erro usa o formato **RFC 7807** (`application/problem+json`), com campos adicionais do TaskFlow.

```json
{
  "type": "urn:taskflow:erro:validacao",
  "title": "Dados inválidos",
  "status": 400,
  "detail": "Um ou mais campos são inválidos.",
  "instance": "/api/v1/tarefas",
  "codigo": "VALIDACAO",
  "erros": [
    { "campo": "titulo", "codigo": "OBRIGATORIO", "mensagem": "O título é obrigatório." }
  ]
}
```

| Campo | Descrição |
|---|---|
| `type` | `urn:taskflow:erro:{codigo em minúsculas}` |
| `title` | Resumo curto e estável do erro |
| `status` | Código HTTP |
| `detail` | Explicação legível, sem dados sensíveis |
| `instance` | Caminho da requisição |
| `codigo` | **Código de negócio estável**, usado pelo cliente para decidir o comportamento (não usar `detail` para isso) |
| `erros` | Opcional. Lista de erros por campo, nas validações |

### 6.1 Uso dos códigos HTTP

| Status | Quando usar |
|---|---|
| `400 Bad Request` | Requisição malformada ou campos inválidos (validação de formato, tamanho, limites de RT-04, obrigatoriedade, política de senha) |
| `401 Unauthorized` | Sem token de acesso, token inválido ou expirado, credenciais inválidas |
| `403 Forbidden` | Usuário autenticado **sem permissão** para a operação (papel ou posse, ex.: Membro tentando alterar o responsável ou o status de tarefa que não é sua), ou sem workspace |
| `404 Not Found` | Recurso inexistente **ou de outro workspace** (não revelar a existência) |
| `409 Conflict` | Conflito de unicidade (ex.: e-mail já cadastrado) |
| `422 Unprocessable Entity` | Regra de **negócio** violada por quem tem permissão (ex.: salto de estágio no status, convite inválido). Nunca para falta de permissão |
| `500 Internal Server Error` | Erro inesperado; corpo genérico, sem detalhes internos |

**Ordem de avaliação:** `404` (recurso existe e é do workspace) → `403` (permissão) → `400` (validação de campos) → `422` (regra de negócio). O primeiro que falhar define a resposta.

### 6.2 Catálogo inicial de códigos de negócio

Lista inicial, a ser estendida pelos Contratos de Integração. Nomes em `UPPER_SNAKE_CASE`.

| Código | Status | Origem |
|---|---|---|
| `VALIDACAO` | 400 | Validação de campos (RF-01, RT-01, RT-04); detalhe por campo em `erros` |
| `NAO_AUTENTICADO` | 401 | Token ausente, inválido ou expirado (RF-05) |
| `CREDENCIAIS_INVALIDAS` | 401 | Login (RF-04) |
| `ACESSO_NEGADO` | 403 | Papel ou posse sem permissão, inclusive Membro alterando status ou responsável de tarefa alheia (RNF-01, RF-20, RF-21) |
| `SEM_WORKSPACE` | 403 | Usuário sem workspace (RF-39) |
| `RECURSO_NAO_ENCONTRADO` | 404 | Recurso inexistente ou de outro workspace |
| `EMAIL_JA_CADASTRADO` | 409 | Cadastro (RF-01) |
| `USUARIO_JA_PERTENCE_A_WORKSPACE` | 422 | Convite para e-mail que já está em um workspace (RF-06) |
| `CONVITE_INVALIDO` | 422 | Convite expirado, inexistente, utilizado ou invalidado (RF-27, RF-28) |
| `TOKEN_RECUPERACAO_INVALIDO` | 422 | Token de recuperação expirado, inexistente ou utilizado (RF-33, RF-35) |
| `SENHA_ATUAL_INCORRETA` | 422 | Alteração de senha no perfil (RF-26) |
| `TRANSICAO_STATUS_INVALIDA` | 422 | Salto de estágios: só é permitido mudar para o estágio adjacente (RF-21). Falta de permissão é `ACESSO_NEGADO` (403) |
| `PROPRIETARIO_NAO_REMOVIVEL` | 422 | Remoção do Proprietário (RF-10) |
| `REATRIBUICAO_OBRIGATORIA` | 422 | Remoção de membro sem novo responsável informado para as tarefas (RF-10) |

### 6.3 Códigos de erro por campo

Usados em `erros[].codigo` das respostas `VALIDACAO`:

| Código | Quando |
|---|---|
| `OBRIGATORIO` | Campo obrigatório ausente ou vazio |
| `FORMATO_INVALIDO` | Formato inválido (ex.: e-mail, data) |
| `TAMANHO_EXCEDIDO` | Texto acima (ou abaixo) do tamanho permitido (RT-04), inclusive senha acima de 72 bytes UTF-8 (RT-01) |
| `LIMITE_EXCEDIDO` | Quantidade acima do limite (ex.: mais de 10 tags por tarefa — RT-04) |
| `SENHA_FORA_DA_POLITICA` | Senha sem letra e número ou abaixo do mínimo (RT-01) |

## 7. Paginação, ordenação e filtros

### 7.1 Paginação

Endpoints de coleção são paginados por padrão.

| Parâmetro | Descrição | Padrão |
|---|---|---|
| `page` | Número da página, começando em `0` | `0` |
| `size` | Itens por página (máximo `100`) | `20` |
| `sort` | `campo,asc` ou `campo,desc` (pode repetir) | definido por endpoint |

Resposta:

```json
{
  "conteudo": [ { "id": 1 } ],
  "pagina": 0,
  "tamanho": 20,
  "totalElementos": 1,
  "totalPaginas": 1
}
```

O Kanban solicita as tarefas filtrando por `status` (uma coluna por requisição) ou com `size` até o máximo permitido.

### 7.2 Filtros e busca

| Parâmetro | Significado |
|---|---|
| `responsavelId` | Tarefas do responsável informado |
| `status` | Um ou mais status (repetir o parâmetro) |
| `tag` | Nome da tag (normalizado em minúsculas; comparação sem distinção de acentos e de maiúsculas) |
| `prazoDe`, `prazoAte` | Intervalo do **prazo** da tarefa (RF-23), formato `AAAA-MM-DD`, ambos inclusivos |
| `q` | Termo da busca global (RF-24), no escopo do workspace do usuário; ignora acentos e maiúsculas |

Filtros combinados aplicam-se em conjunto (E lógico).

## 8. Segurança e isolamento

- Toda consulta é restrita ao workspace do usuário autenticado (RT-02, RNF-01). Recursos de outro workspace respondem `404`.
- A permissão por papel é verificada no backend; o frontend apenas oculta ações, nunca é a fonte da autorização.
- CORS liberado somente para a origem do aplicativo web (configurável por ambiente).
- Respostas de erro não expõem stack traces, SQL ou dados de outros usuários.
- Senhas e tokens nunca aparecem em logs (RNF-13).

## 9. Compatibilidade e evolução

- Acréscimo de campos opcionais na resposta é compatível; o cliente ignora campos desconhecidos.
- Remoção ou mudança de significado de campo, ou de código de erro, é mudança incompatível e exige nova versão da API.
- A API pode publicar a especificação OpenAPI (ex.: springdoc) em ambiente de desenvolvimento, como apoio ao Contrato de Integração. O Contrato da história continua sendo a fonte de verdade.

## 10. Exemplo de requisição

```http
PATCH /api/v1/tarefas/42/status
Authorization: Bearer <accessToken>
Content-Type: application/json

{ "status": "EM_DESENVOLVIMENTO" }
```

Resposta de sucesso:

```http
200 OK
Content-Type: application/json

{ "id": 42, "titulo": "Montar relatório", "status": "EM_DESENVOLVIMENTO", "prazo": "2026-11-30" }
```

Resposta de erro (salto de estágio):

```http
422 Unprocessable Entity
Content-Type: application/problem+json

{ "type": "urn:taskflow:erro:transicao_status_invalida", "title": "Transição de status inválida", "status": 422, "detail": "O status só pode mudar para o estágio adjacente.", "instance": "/api/v1/tarefas/42/status", "codigo": "TRANSICAO_STATUS_INVALIDA" }
```

## 11. Modelo do Contrato de Integração (por história)

O `gerenciador-historias` usa este modelo na seção "Contrato de Integração" quando a execução é paralela.

| Item | Conteúdo |
|---|---|
| Endpoint | Método e caminho (`POST /api/v1/...`) |
| Quem acessa | Papéis permitidos (Proprietário, Membro, ambos, público) |
| Requisição | Cabeçalhos, parâmetros de caminho/consulta e corpo (campos, tipos, obrigatoriedade, validações) |
| Resposta de sucesso | Status e corpo (campos e tipos) |
| Erros | Lista de `status` + `codigo` + quando ocorre (usar o catálogo da seção 6.2, acrescentando novos códigos quando necessário) |
| Regras de negócio | RFs e regras transversais (RT) aplicáveis |
