# HIST-003-auth — Sessão, renovação e logout

## Visão geral

Mantém a sessão autenticada com duração limitada, renovação revogável e logout efetivo. O token de acesso (JWT) vale 15 minutos e o refresh token opaco, 7 dias, com rotação. No cliente, a renovação concorrente passa por uma fila única, para não criar sessões inválidas nem encerrar sessões legítimas.

A emissão inicial do par de tokens e a tabela `refresh_token` vêm de `HIST-001-auth`; esta história acrescenta rotação, janela de tolerância, logout e fila de renovação no cliente. Entrega também o layout autenticado do frontend (cabeçalho com o nome do usuário e o menu do usuário com "Sair"), onde outras histórias acrescentam seus itens.

Fora de escopo: cadastro e login (`HIST-001-auth` e `HIST-002-auth`), cookies `HttpOnly` como mudança de arquitetura (desvio da DT-05, que exige Gate 1) e limitação de tentativas de login (risco aceito na V1).

Dependências: `HIST-001-auth` e `HIST-002-auth`.

## Domínio

auth

## Origem

- Requisitos, RF-05, RF-38, RNF-02, RNF-03 e RNF-13.
- Decisões técnicas, DT-04, DT-05, DT-07 a DT-09 e DT-14.
- Padrão de API, seção 4.
- Modelo de dados, seção 2.10.
- Índice da referência visual, seção 4 (sessão expirada).

## Requisitos funcionais

1. Recursos protegidos exigem token de acesso válido.
   - Critério de aceitação: uma requisição sem token de acesso válido recebe `401 NAO_AUTENTICADO`, pela cadeia de segurança criada em `HIST-001-auth`.
2. O refresh token válido renova a sessão com rotação.
   - Critério de aceitação: o uso de um refresh token válido o revoga com motivo `ROTACAO` e devolve novo par de tokens, com acesso de 15 minutos e refresh de 7 dias.
3. Refresh token inválido, expirado ou revogado exige novo login.
   - Critério de aceitação: a renovação com esse token responde `401 NAO_AUTENTICADO` e não emite tokens.
4. O reuso de refresh token revogado por rotação segue a janela de tolerância da DT-05.
   - Critério de aceitação: até 10 segundos após a rotação, a tentativa é rejeitada sem revogar os demais tokens do usuário; depois disso, todos os refresh tokens do usuário são revogados com `REUSO_DETECTADO`.
5. O logout revoga o refresh token informado.
   - Critério de aceitação: após o logout (`204`), o refresh token revogado com `LOGOUT` não permite nova renovação.
6. O cliente mantém uma fila única de renovação.
   - Critério de aceitação: com várias requisições recebendo `401 NAO_AUTENTICADO` durante a renovação, ocorre uma única renovação e cada requisição é repetida no máximo uma vez; a chamada de renovação não dispara outra renovação.
7. Outros `401` não disparam renovação.
   - Critério de aceitação: `401 CREDENCIAIS_INVALIDAS` não aciona a renovação.
8. A falha de renovação encerra a sessão no cliente.
   - Critério de aceitação: com a renovação falha, o cliente apaga a sessão e redireciona ao login com a mensagem "Sua sessão expirou. Entre novamente.".
9. O frontend autenticado tem um layout com cabeçalho e menu do usuário.
   - Critério de aceitação: nas telas autenticadas o cabeçalho mostra o nome do usuário (de `GET /api/v1/auth/eu`) e o menu do usuário com a opção "Sair", que executa o logout e leva ao login; o layout deixa espaço para o campo de busca e para itens adicionais do menu; usuário sem workspace vê o cabeçalho apenas com o nome e "Sair".

## Requisitos não-funcionais

- RNF-01, RNF-02 e RNF-03: recursos protegidos exigem sessão; papel e workspace são consultados a cada requisição.
- RNF-05 e RNF-06: os fluxos web são compatíveis com as larguras e os navegadores da V1.
- RNF-08: 95% das requisições da história respondem em até 500 ms em ambiente local de teste.
- RNF-13: refresh tokens são persistidos somente como SHA-256 (`HIST-001-auth`).

## Cenários Gherkin

Cenário: [C01] Renovar a sessão com rotação
  Dado um refresh token válido
  Quando ele é usado para renovar a sessão
  Então ele é revogado com motivo `ROTACAO`
  E um novo par de tokens é emitido, com acesso de 15 minutos e refresh de 7 dias

Cenário: [C02] Rejeitar reuso dentro da janela de tolerância
  Dado um refresh token revogado por rotação há 10 segundos ou menos
  Quando ele é reutilizado
  Então a tentativa é rejeitada com `401 NAO_AUTENTICADO`
  E os demais refresh tokens do usuário permanecem válidos

Cenário: [C03] Revogar todos os tokens no reuso fora da janela
  Dado um refresh token revogado por rotação há mais de 10 segundos
  Quando ele é reutilizado
  Então todos os refresh tokens do usuário são revogados com `REUSO_DETECTADO`

Cenário: [C04] Rejeitar refresh token expirado
  Dado um refresh token com mais de 7 dias
  Quando a renovação é solicitada
  Então a resposta é `401 NAO_AUTENTICADO` e nenhum token é emitido

Cenário: [C05] Negar recurso protegido sem token
  Dado um recurso protegido
  Quando ele é solicitado sem token de acesso válido
  Então a resposta é `401 NAO_AUTENTICADO`

Cenário: [C06] Encerrar a sessão no logout
  Dado uma sessão ativa
  Quando o usuário encerra a sessão
  Então o refresh token é revogado com motivo `LOGOUT`

Cenário: [C07] Rejeitar renovação com token revogado no logout
  Dado um refresh token revogado por logout
  Quando a renovação é solicitada com esse token
  Então a resposta é `401 NAO_AUTENTICADO`
  E os demais refresh tokens do usuário não são revogados

Cenário: [C08] Renovar uma única vez para várias requisições
  Dado várias requisições que receberam `401 NAO_AUTENTICADO` durante a renovação
  Quando o cliente trata essas respostas
  Então ocorre uma única renovação
  E cada requisição é repetida uma vez com o novo token

Cenário: [C09] Não renovar em loop
  Dado que a própria chamada de renovação recebe `401`
  Quando o cliente trata a resposta
  Então nenhuma nova renovação é iniciada
  E a sessão é encerrada

Cenário: [C10] Não renovar para outros códigos de erro
  Dado uma requisição de login que recebe `401 CREDENCIAIS_INVALIDAS`
  Quando o cliente trata a resposta
  Então nenhuma renovação é iniciada

Cenário: [C11] Redirecionar ao login quando a renovação falha
  Dado que a renovação falhou e o refresh token armazenado não mudou
  Quando o cliente encerra a sessão
  Então o usuário é redirecionado ao login com a mensagem "Sua sessão expirou. Entre novamente."

Cenário: [C12] Repetir a renovação quando outra aba já renovou
  Dado que a renovação falhou e o refresh token armazenado mudou desde o início da tentativa
  Quando o cliente trata a falha
  Então a renovação é repetida uma única vez com o token novo

Cenário: [C13] Exibir o cabeçalho com o nome do usuário
  Dado um usuário autenticado com workspace
  Quando ele abre uma tela autenticada
  Então o cabeçalho mostra o nome dele e o menu do usuário com "Sair"

Cenário: [C14] Sair pelo menu do usuário
  Dado o menu do usuário aberto
  Quando o usuário aciona "Sair"
  Então o logout é executado e o login é exibido

## Contrato de Integração

Não se aplica. O modo é sequencial, e o contrato da sessão nasce no backend.

## Plano de execução

- Módulos ativados: backend, frontend
- Modo: sequencial
- Justificativa: a história ativa dois módulos e não tem Contrato de Integração completo (skill `criterio-fluxo-execucao`, passo 2); o backend vem primeiro e o frontend depois.

## Decisões técnicas relevantes

- JWT HS256 de 15 minutos, com segredo em `JWT_SECRET`; refresh opaco de 7 dias com rotação e janela de 10 segundos (DT-05 e DT-08).
- Tokens de 32 bytes aleatórios, persistidos como SHA-256 em hexadecimal (DT-07).
- Fila única de renovação e regra de abas simultâneas no cliente (DT-04).
- Sessão expirada sem tela dedicada, com redirecionamento ao login e a mensagem do índice visual.
- Os tokens ficam em `localStorage` via Zustand `persist`, conforme decidido em `HIST-001-auth`. A regra de abas simultâneas depende desse armazenamento compartilhado.
- A mensagem "Sua sessão expirou. Entre novamente." e o redirecionamento ao login, sem tela dedicada, estão confirmados pelo índice visual.
- Com o logout implementado, o botão "Sair" da tela "Sem Workspace" passa a chamar `POST /api/v1/auth/logout` (`204`).
- A limitação de tentativas de login é risco aceito na V1.
- O layout autenticado vive em `src/core` e é a única origem do cabeçalho. `HIST-002-busca-filtros` acrescenta o campo de busca e `HIST-001-configuracoes` acrescenta a opção "Configurações" ao menu; nenhuma delas cria cabeçalho próprio.

## Pontos em aberto

Nenhum.
