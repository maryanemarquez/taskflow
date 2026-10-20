# HIST-001-membros — Criar e validar convite

## Visão geral

O Proprietário convida uma pessoa por e-mail para entrar no workspace como Membro. O convite é temporário (2 dias), único, invalidável por um convite mais novo e guardado só como hash. Esta história entrega também a validação do token, que não consome o convite nem cria conta ou vínculo.

Esta história é somente de backend. As telas de convite ficam em `HIST-004-membros` (convidar) e `HIST-002-membros` (abrir o link).

Fora de escopo: cadastro e aceite da pessoa convidada (`HIST-002-membros` e `HIST-003-membros`), listagem de membros e convites (`HIST-004-membros`) e reenvio automático (o Proprietário gera um novo convite, DT-12).

Dependências: `HIST-001-fundacao`, `HIST-002-fundacao` e `HIST-001-auth`.

## Domínio

membros

## Origem

- Requisitos, RF-06, RF-27 a RF-29, RNF-01, RNF-11 e RNF-13.
- Domínio, seções 3 a 5.
- Especificação, seções 5, 6 (telas 2 e 3), 7.2 e 7.7.
- Modelo de dados, seção 2.4.
- Decisões técnicas, DT-07, DT-08 e DT-12.
- Padrão de API, seções 2.1, 4 e 6.

## Requisitos funcionais

1. O Proprietário cria um convite para um e-mail.
   - Critério de aceitação: `POST /api/v1/convites` com `email` responde `201` com `Location` e o convite no corpo (`id`, `email`, `criadoEm`, `expiraEm`), sem o token; o convite pertence ao workspace do Proprietário e expira 2 dias após `criadoEm`.
2. O token do convite é aleatório e guardado como hash.
   - Critério de aceitação: o token tem 32 bytes de `SecureRandom` em Base64 URL-safe e a coluna `token_hash` guarda somente o SHA-256 em hexadecimal.
3. Um novo convite invalida o convite pendente anterior do mesmo e-mail e workspace.
   - Critério de aceitação: após criar o novo convite, o anterior fica com `invalidado` verdadeiro e seu token é rejeitado.
4. Não se convida o e-mail de quem já pertence a um workspace.
   - Critério de aceitação: a resposta é `422 USUARIO_JA_PERTENCE_A_WORKSPACE` e nenhum convite é criado; e-mail de conta sem workspace ou de pessoa sem conta é aceito.
5. O e-mail é normalizado e validado.
   - Critério de aceitação: o e-mail é aparado e convertido para minúsculas; vazio responde `400 VALIDACAO` com `OBRIGATORIO`, formato inválido com `FORMATO_INVALIDO` e mais de 150 caracteres com `TAMANHO_EXCEDIDO`, sem criar convite.
6. Somente o Proprietário cria convites.
   - Critério de aceitação: o Membro recebe `403 ACESSO_NEGADO` e nenhum convite é criado.
7. O convite é enviado por e-mail.
   - Critério de aceitação: a porta `EmailSender` recebe uma mensagem com o link `APP_BASE_URL/invite/{token}` e o botão "Criar minha conta"; falha de envio é registrada em log e não altera a resposta.
8. O token do convite pode ser validado sem ser consumido.
   - Critério de aceitação: `POST /api/v1/convites/validar` com `token` no corpo responde `200` com `email`, `nomeWorkspace` e `contaExistente`, sem criar usuário nem vínculo e sem alterar o convite.
9. Token inválido é rejeitado.
   - Critério de aceitação: token inexistente, expirado, utilizado ou invalidado responde `422 CONVITE_INVALIDO`; o convite só é válido quando o instante atual é anterior a `expiraEm`.

## Requisitos não-funcionais

- RNF-01: somente o Proprietário do workspace cria convites; nenhum dado de outro workspace é exposto.
- RNF-08: 95% das requisições respondem em até 500 ms em ambiente local de teste, com até 1.000 tarefas por workspace.
- RNF-11 e RNF-13: expiração de 2 dias e persistência apenas do hash.

## Cenários Gherkin

Cenário: [C01] Criar convite válido
  Dado um Proprietário e um e-mail sem conta
  Quando ele envia `POST /api/v1/convites` com esse e-mail
  Então a resposta é `201` com `Location` e o convite no corpo, sem o token
  E o convite expira 2 dias após a criação

Cenário: [C02] Enviar o e-mail do convite
  Dado um convite criado
  Quando o envio é processado
  Então a porta de e-mail recebe uma mensagem com o link `APP_BASE_URL/invite/{token}` e o botão "Criar minha conta"

Cenário: [C03] Invalidar o convite anterior
  Dado um convite pendente para um e-mail e workspace
  Quando o Proprietário cria outro convite para o mesmo e-mail
  Então o convite anterior é invalidado
  E somente o novo convite é aceito na validação

Cenário: [C04] Rejeitar e-mail de usuário que já está em um workspace
  Dado um e-mail de usuário que pertence a um workspace
  Quando o Proprietário cria o convite
  Então a resposta é `422 USUARIO_JA_PERTENCE_A_WORKSPACE`
  E nenhum convite é criado

Cenário: [C05] Convidar conta existente sem workspace
  Dado um e-mail de usuário sem workspace
  Quando o Proprietário cria o convite
  Então o convite é criado

Cenário: [C06] Normalizar o e-mail
  Dado um e-mail com letras maiúsculas e espaços nas pontas
  Quando o Proprietário cria o convite
  Então o convite é gravado com o e-mail aparado e em minúsculas

Cenário: [C07] Rejeitar e-mail com formato inválido
  Dado um e-mail sem arroba
  Quando o Proprietário cria o convite
  Então a resposta é `400 VALIDACAO` com erro de campo `FORMATO_INVALIDO`
  E nenhum convite é criado

Cenário: [C08] Rejeitar e-mail com 151 caracteres
  Dado um e-mail com 151 caracteres
  Quando o Proprietário cria o convite
  Então a resposta é `400 VALIDACAO` com erro de campo `TAMANHO_EXCEDIDO`
  E nenhum convite é criado

Cenário: [C09] Negar criação por Membro
  Dado um usuário com papel Membro
  Quando ele envia `POST /api/v1/convites`
  Então a resposta é `403 ACESSO_NEGADO`
  E nenhum convite é criado

Cenário: [C10] Tolerar falha no envio do e-mail
  Dado que o envio de e-mail falha
  Quando o Proprietário cria o convite
  Então a resposta é `201`
  E a falha é registrada em log sem o token

Cenário: [C11] Validar token válido sem consumir
  Dado um convite válido
  Quando o token é enviado a `POST /api/v1/convites/validar`
  Então a resposta é `200` com `email`, `nomeWorkspace` e `contaExistente`
  E o convite continua válido, sem usuário nem vínculo novos

Cenário: [C12] Rejeitar token inexistente
  Dado um token que não existe
  Quando ele é validado
  Então a resposta é `422 CONVITE_INVALIDO`

Cenário: [C13] Rejeitar token no instante de expiração
  Dado um convite cujo instante atual é igual a `expiraEm`
  Quando o token é validado
  Então a resposta é `422 CONVITE_INVALIDO`

Cenário: [C14] Rejeitar token utilizado
  Dado um convite já utilizado
  Quando o token é validado
  Então a resposta é `422 CONVITE_INVALIDO`

Cenário: [C15] Rejeitar token invalidado
  Dado um convite invalidado por um convite mais novo
  Quando o token é validado
  Então a resposta é `422 CONVITE_INVALIDO`

Cenário: [C16] Persistir o token somente como hash
  Dado um convite criado
  Quando o registro é consultado no banco
  Então apenas o SHA-256 do token está armazenado

## Contrato de Integração

Não se aplica. A história toca um único módulo.

## Plano de execução

- Módulos ativados: backend
- Modo: não se aplica
- Justificativa: a história altera somente o módulo `backend` (skill `criterio-fluxo-execucao`, passo 2, módulo único).

## Decisões técnicas relevantes

- Endpoints: `POST /api/v1/convites` e `POST /api/v1/convites/validar`, com o token sempre no corpo (Padrão de API, seção 4).
- A validação devolve apenas `email`, `nomeWorkspace` e `contaExistente`, o mínimo para o cliente escolher entre cadastro e autenticação.
- A migração cria a tabela `convite` do modelo de dados (seção 2.4), com índice em `email_convidado` e `workspace_id`.
- Gerar um novo convite para o mesmo e-mail é a ação "gerar novo convite" (RF-29); não há endpoint de reenvio.
- Validade calculada com o `Clock` injetado (DT-09).
- Ordem de avaliação dos erros: 404, 403, 400, 422.

## Pontos em aberto

Nenhum.
