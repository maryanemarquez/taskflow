# HIST-001-auth — Cadastro sem convite

## Visão geral

Permite que uma pessoa sem conta se cadastre sem convite informando nome, e-mail e senha. O cadastro cria, em uma única operação atômica, o usuário, o workspace "Workspace de {nome}" e o vínculo de Proprietário, inicia a sessão e direciona à tela inicial provisória do workspace (ou ao Dashboard, quando existir).

Fora de escopo: cadastro e aceite por convite (`HIST-002-membros` e `HIST-003-membros`), login (`HIST-002-auth`), renovação e logout (`HIST-003-auth`) e edição do nome do workspace (fora da V1).

Dependências: `HIST-001-fundacao` e `HIST-002-fundacao`.

## Domínio

auth

## Origem

- Requisitos, RT-01, RT-04 e RF-01 a RF-03.
- Domínio, seções 3 a 5.
- Especificação, seções 5, 6 (tela 2) e 7.1.
- Modelo de dados, seções 2.1 a 2.3.
- Decisões técnicas, DT-06, DT-10 e DT-14.
- Padrão de API, seções 2, 3 e 6.

## Requisitos funcionais

1. O cadastro sem convite cria usuário, workspace "Workspace de {nome do usuário}" e vínculo com papel `PROPRIETARIO` na mesma operação.
   - Critério de aceitação: com nome, e-mail e senha válidos, os três registros existem após o cadastro; se a criação de qualquer um falhar, nenhum deles é persistido.
2. Após o cadastro, a sessão é iniciada e a pessoa é direcionada à tela inicial provisória do workspace, ou ao Dashboard quando ele existir.
   - Critério de aceitação: a resposta do cadastro traz o par de tokens da sessão, e o frontend abre a tela inicial provisória, que exibe "Olá, {nome}" e o nome do workspace.
3. A senha segue a política RT-01: mínimo de 8 caracteres, ao menos uma letra e um número, e máximo de 72 bytes em UTF-8, sem truncamento.
   - Critério de aceitação: senha fora da política responde `400 VALIDACAO` com o erro de campo correspondente, sem criar usuário, workspace nem vínculo.
4. Os campos respeitam os limites de RT-04 (nome de 1 a 100 caracteres, e-mail de até 150) e o e-mail é normalizado (sem espaços nas pontas, em minúsculas).
   - Critério de aceitação: valores acima do limite respondem `400 VALIDACAO` sem criar registros.
5. O e-mail deve ser único.
   - Critério de aceitação: e-mail já cadastrado responde `409 EMAIL_JA_CADASTRADO` sem criar usuário, workspace nem vínculo.
6. O formulário de cadastro sem convite não permite escolher papel nem workspace.
   - Critério de aceitação: a tela exibe apenas os campos nome, e-mail e senha.
7. A senha é persistida somente como hash adaptativo (BCrypt).
   - Critério de aceitação: nenhum registro persistido contém a senha em texto puro.
8. O cadastro emite o par de tokens da sessão (DT-05).
   - Critério de aceitação: o token de acesso é um JWT HS256 de 15 minutos com o identificador do usuário; o refresh token é opaco, vale 7 dias e é persistido na tabela `refresh_token` somente como SHA-256 em hexadecimal.
9. `GET /api/v1/auth/eu` devolve os dados da sessão do usuário autenticado.
   - Critério de aceitação: a resposta traz `usuario` (id, nome e e-mail) e `workspace` (id, nome e papel), com `workspace` nulo quando o usuário não tem vínculo.
10. A API usa uma cadeia de segurança stateless que protege os recursos autenticados.
   - Critério de aceitação: o filtro valida o JWT (DT-05) e carrega usuário, workspace e papel a cada requisição; `GET /api/v1/auth/eu` sem token válido responde `401 NAO_AUTENTICADO`, no formato RFC 7807.

## Requisitos não-funcionais

- RNF-01 e RNF-02: a conta criada fica restrita ao próprio workspace e protegida por autenticação.
- RNF-05 e RNF-06: o formulário é utilizável em 360 px, 768 px e 1280 px, nos navegadores definidos.
- RNF-08: não se aplica. O cadastro calcula hash BCrypt, cujo custo é deliberado (DT-06).
- RNF-10: a criação de usuário, workspace e vínculo é consistente.
- RNF-13: a senha é armazenada somente como hash adaptativo.

## Cenários Gherkin

Cenário: [C01] Cadastro válido cria usuário, workspace e vínculo
  Dado que o e-mail informado ainda não está cadastrado
  Quando a pessoa envia nome, e-mail e senha válidos
  Então são criados o usuário, o workspace "Workspace de {nome}" e o vínculo `PROPRIETARIO`

Cenário: [C02] Cadastro válido inicia a sessão
  Dado que o cadastro foi concluído com dados válidos
  Quando a resposta do cadastro é recebida
  Então a sessão é iniciada com o par de tokens
  E o frontend abre a tela inicial provisória com "Olá, {nome}" e o nome do workspace

Cenário: [C03] Aceitar senha com exatamente 72 bytes
  Dado uma senha válida com acentos que ocupa exatamente 72 bytes em UTF-8
  Quando o cadastro é enviado
  Então a senha é aceita sem truncamento

Cenário: [C04] Rejeitar senha com 73 bytes
  Dado uma senha que ocupa 73 bytes em UTF-8
  Quando o cadastro é enviado
  Então o cadastro é rejeitado com `400 VALIDACAO` e erro de campo `TAMANHO_EXCEDIDO`
  E nenhum usuário, workspace ou vínculo é criado

Cenário: [C05] Rejeitar senha com 7 caracteres
  Dado uma senha com letra e número, mas com 7 caracteres
  Quando o cadastro é enviado
  Então o cadastro é rejeitado com `400 VALIDACAO`
  E nenhum registro é criado

Cenário: [C06] Rejeitar senha sem número
  Dado uma senha com 8 caracteres e sem número
  Quando o cadastro é enviado
  Então o cadastro é rejeitado com `400 VALIDACAO` e erro de campo `SENHA_FORA_DA_POLITICA`
  E nenhum registro é criado

Cenário: [C07] Rejeitar nome acima do limite
  Dado um nome com 101 caracteres
  Quando o cadastro é enviado
  Então o cadastro é rejeitado com `400 VALIDACAO` e erro de campo `TAMANHO_EXCEDIDO`
  E nenhum registro é criado

Cenário: [C08] Rejeitar e-mail acima do limite
  Dado um e-mail com 151 caracteres
  Quando o cadastro é enviado
  Então o cadastro é rejeitado com `400 VALIDACAO` e erro de campo `TAMANHO_EXCEDIDO`
  E nenhum registro é criado

Cenário: [C09] Rejeitar e-mail já cadastrado
  Dado que o e-mail informado já está cadastrado
  Quando o cadastro é enviado
  Então o cadastro é rejeitado com `409 EMAIL_JA_CADASTRADO`
  E nenhum usuário, workspace ou vínculo novo é criado

Cenário: [C10] Desfazer tudo quando a criação falha
  Dado que a criação do vínculo falha durante o cadastro
  Quando o cadastro é processado
  Então nenhum usuário, workspace ou vínculo é persistido

Cenário: [C11] Formulário sem escolha de papel ou workspace
  Dado a tela de cadastro sem convite
  Quando a tela é exibida
  Então ela mostra apenas os campos nome, e-mail e senha

Cenário: [C12] Emitir o token de acesso com validade de 15 minutos
  Dado um cadastro concluído
  Quando o token de acesso é decodificado
  Então ele contém o identificador do usuário e expira 15 minutos após a emissão

Cenário: [C13] Persistir o refresh token somente como hash
  Dado um cadastro concluído
  Quando o registro de `refresh_token` é consultado no banco
  Então apenas o SHA-256 do token está armazenado
  E a expiração é 7 dias após a emissão

Cenário: [C14] Consultar os dados da sessão
  Dado um usuário autenticado com workspace
  Quando ele consulta `GET /api/v1/auth/eu`
  Então a resposta traz seus dados e o workspace com o papel `PROPRIETARIO`

Cenário: [C15] Negar os dados da sessão sem token
  Dado uma requisição sem token de acesso válido
  Quando ela consulta `GET /api/v1/auth/eu`
  Então a resposta é `401 NAO_AUTENTICADO`

## Contrato de Integração

Não se aplica. O modo é sequencial, e o contrato do cadastro nasce no backend.

## Plano de execução

- Módulos ativados: backend, frontend
- Modo: sequencial
- Justificativa: a história ativa dois módulos e não tem Contrato de Integração completo (skill `criterio-fluxo-execucao`, passo 2); o backend vem primeiro e o frontend depois.

## Decisões técnicas relevantes

- BCrypt com força 12 por padrão e valor reduzido nos testes (DT-06).
- Política de senha validada no backend (fonte de verdade) e espelhada no formulário.
- Cadastro, workspace e vínculo gravados em uma única transação.
- Erros no formato RFC 7807, com os códigos `VALIDACAO` e `EMAIL_JA_CADASTRADO` do Padrão de API.
- Esta história cria a emissão de tokens e a tabela `refresh_token`; `HIST-003-auth` acrescenta rotação, logout e fila de renovação.
- O frontend guarda a sessão em Zustand com `persist` em `localStorage`, para sobreviver ao recarregamento e valer entre abas (DT-04). Risco de XSS aceito pela DT-05; cookie `HttpOnly` fica para antes da produção.
- A tela inicial provisória mostra "Olá, {nome}" e o nome do workspace, sem atalhos. O Dashboard a substitui em `HIST-001-dashboard`.
- Esta é a primeira história de interface: ela cria `src/core/theme` com os tokens de `docs/referencia-visual/tokens/index.css`, conforme a skill `design-system-taskflow`.
- O cliente descobre usuário, workspace e papel por `GET /api/v1/auth/eu`.
- Esta história cria a configuração do Spring Security (stateless, filtro JWT, 401 e 403 em RFC 7807, papel e workspace consultados a cada requisição). As demais histórias apenas a usam, e `/auth/eu` já a exige.

## Pontos em aberto

Nenhum.
