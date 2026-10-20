# HIST-002-auth — Login

## Visão geral

Permite que uma pessoa com conta se autentique por e-mail e senha, inicie a sessão e seja direcionada conforme tenha ou não vínculo com um workspace. Credenciais inválidas recebem sempre a mesma resposta genérica, sem revelar se o e-mail existe.

Fora de escopo: criar conta (`HIST-001-auth`), renovar ou encerrar a sessão (`HIST-003-auth`) e recuperar senha (`HIST-004-auth`).

Dependências: `HIST-001-auth` e as bases de `fundacao`.

## Domínio

auth

## Origem

- Requisitos, RF-04, RNF-01 e RNF-02.
- Especificação, seções 3, 5, 6 (telas 1 e 13) e 7.9.
- Domínio, seções 3 a 5.
- Padrão de API, seções 4, 6.2 e 8.

## Requisitos funcionais

1. O login por e-mail e senha corretos inicia a sessão e direciona à área autenticada do workspace.
   - Critério de aceitação: com credenciais válidas, a resposta traz o par de tokens e o frontend abre a área autenticada do workspace.
2. Credenciais inválidas negam o acesso com resposta genérica.
   - Critério de aceitação: e-mail inexistente e senha incorreta respondem `401 CREDENCIAIS_INVALIDAS` com corpo indistinguível.
3. O e-mail é normalizado antes da autenticação (sem espaços nas pontas, em minúsculas).
   - Critério de aceitação: o login com o e-mail em caixa diferente ou com espaços nas pontas autentica a mesma conta.
4. A conta autenticada sem vínculo com workspace é direcionada à tela "Sem Workspace".
   - Critério de aceitação: após o login, `GET /api/v1/auth/eu` devolve `workspace` nulo e o usuário vê somente a tela "Sem Workspace", que informa que ele não faz parte de nenhum workspace, orienta a pedir um convite ao Proprietário e oferece o botão "Sair".
5. Recursos protegidos exigem autenticação.
   - Critério de aceitação: uma requisição sem token de acesso válido recebe `401 NAO_AUTENTICADO`.
6. Senhas e tokens não são registrados em log.
   - Critério de aceitação: nenhuma entrada de log do login contém senha nem token.
7. Usuário já autenticado que acessa a rota de login é redirecionado.
   - Critério de aceitação: com sessão ativa, abrir `/login` leva à área autenticada (ou à tela "Sem Workspace", se não houver vínculo).
8. O botão "Sair" da tela "Sem Workspace" descarta a sessão local e abre o login.
   - Critério de aceitação: após tocar em "Sair", não há sessão no armazenamento do navegador e a tela de login é exibida.

## Requisitos não-funcionais

- RNF-01 e RNF-02: autenticação e autorização conforme vínculo e papel.
- RNF-05 e RNF-06: a tela de login é utilizável nas larguras e nos navegadores exigidos.
- RNF-08: não se aplica. O login confere hash BCrypt, cujo custo é deliberado (DT-06).
- Segredos de autenticação não são registrados em log (Padrão de API, seção 8).

## Cenários Gherkin

Cenário: [C01] Login válido de usuário com workspace
  Dado um usuário com credenciais válidas e vínculo com um workspace
  Quando ele envia e-mail e senha corretos
  Então recebe o par de tokens da sessão
  E o frontend abre a área autenticada do workspace

Cenário: [C02] Login válido de usuário sem workspace
  Dado um usuário com credenciais válidas e sem vínculo com workspace
  Quando ele envia e-mail e senha corretos
  Então o frontend abre somente a tela "Sem Workspace"

Cenário: [C03] Rejeitar senha incorreta
  Dado um usuário cadastrado
  Quando ele envia o e-mail correto e uma senha incorreta
  Então o acesso é negado com `401 CREDENCIAIS_INVALIDAS`

Cenário: [C04] Rejeitar e-mail inexistente com a mesma resposta
  Dado um e-mail sem conta associada
  Quando o login é enviado
  Então o acesso é negado com `401 CREDENCIAIS_INVALIDAS`
  E o corpo da resposta é igual ao da senha incorreta

Cenário: [C05] Normalizar o e-mail no login
  Dado um usuário cadastrado com e-mail em minúsculas
  Quando ele envia o e-mail com letras maiúsculas e espaços nas pontas e a senha correta
  Então a sessão é iniciada para essa conta

Cenário: [C06] Negar recurso protegido sem token
  Dado um recurso protegido
  Quando ele é solicitado sem token de acesso
  Então a resposta é `401 NAO_AUTENTICADO`

Cenário: [C07] Não registrar segredos em log
  Dado um login enviado com senha
  Quando a requisição é processada
  Então nenhuma entrada de log contém a senha nem o token emitido

Cenário: [C08] Exibir o conteúdo da tela "Sem Workspace"
  Dado um usuário autenticado sem vínculo com workspace
  Quando a tela "Sem Workspace" é exibida
  Então ela informa que ele não faz parte de nenhum workspace
  E orienta a solicitar um convite ao Proprietário
  E oferece o botão "Sair"

Cenário: [C09] Identificar usuário sem workspace
  Dado um usuário autenticado sem vínculo com workspace
  Quando ele consulta `GET /api/v1/auth/eu`
  Então a resposta traz o usuário e `workspace` nulo

Cenário: [C10] Redirecionar usuário autenticado que abre o login
  Dado um usuário com sessão ativa
  Quando ele abre a rota `/login`
  Então ele é redirecionado à área autenticada

Cenário: [C11] Sair da tela "Sem Workspace"
  Dado um usuário sem workspace na tela "Sem Workspace"
  Quando ele toca em "Sair"
  Então a sessão local é descartada
  E a tela de login é exibida

## Contrato de Integração

Não se aplica. O modo é sequencial, e o contrato do login nasce no backend.

## Plano de execução

- Módulos ativados: backend, frontend
- Modo: sequencial
- Justificativa: a história ativa dois módulos e não tem Contrato de Integração completo (skill `criterio-fluxo-execucao`, passo 2); o backend vem primeiro e o frontend depois.

## Decisões técnicas relevantes

- Resposta genérica `CREDENCIAIS_INVALIDAS` em qualquer falha de credencial (Padrão de API, seção 4).
- Apenas `401` com `codigo` igual a `NAO_AUTENTICADO` dispara renovação no cliente; `CREDENCIAIS_INVALIDAS` não (DT-04).
- Vínculo e papel consultados a cada requisição (DT-14).
- O backend emite o par de tokens com a infraestrutura criada em `HIST-001-auth`.
- A tela "Sem Workspace" é construída aqui, com o conteúdo da tela 13 da Especificação, e reutilizada por `HIST-005-membros`. Nesta história o botão "Sair" só descarta a sessão local; `HIST-003-auth` passa a revogar também o refresh token.
- O cliente identifica a falta de vínculo por `GET /api/v1/auth/eu` (definido em `HIST-001-auth`).
- A tela inicial provisória para usuário com workspace é definida em `HIST-001-auth`.
## Pontos em aberto

Nenhum.
