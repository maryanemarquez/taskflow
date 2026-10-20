# HIST-004-auth — Recuperação de senha

## Visão geral

Permite que uma pessoa que perdeu a senha solicite a redefinição sem que a resposta revele se o e-mail está cadastrado. O link enviado por e-mail é temporário (30 minutos), de uso único, e leva à definição de uma nova senha compatível com a política da V1.

Fora de escopo: login, renovação e logout (histórias anteriores de `auth`), limitação de tentativas (risco aceito na V1) e alteração de senha autenticada no perfil (`HIST-001-configuracoes`).

Dependências: `HIST-001-fundacao`, `HIST-002-fundacao` e `HIST-002-auth`.

## Domínio

auth

## Origem

- Requisitos, RT-01, RF-30 a RF-37, RNF-05, RNF-06, RNF-08, RNF-12 e RNF-13.
- Especificação, seções 5, 6 (telas 4 e 5) e 7.6.
- Modelo de dados, seção 2.9.
- Decisões técnicas, DT-06 a DT-09 e DT-12.
- Padrão de API, seções 4 e 6.

## Requisitos funcionais

1. A solicitação de recuperação responde igual para qualquer e-mail.
   - Critério de aceitação: a solicitação responde `202` com a mesma mensagem genérica, exista ou não a conta.
2. A solicitação para conta existente gera token e envia e-mail.
   - Critério de aceitação: é gerado um token único de 32 bytes, válido por 30 minutos e persistido só como SHA-256; o e-mail enviado contém o botão "Redefinir minha senha".
3. Uma nova solicitação invalida os tokens anteriores não utilizados da mesma conta.
   - Critério de aceitação: após a nova solicitação, o token anterior é rejeitado.
4. A validação do token exibe o formulário apenas quando ele é válido.
   - Critério de aceitação: o token válido libera o formulário de nova senha e confirmação; o token inexistente, expirado ou utilizado responde `422 TOKEN_RECUPERACAO_INVALIDO` e a tela informa que o link não é mais válido.
5. A redefinição aplica a política de senha e a confirmação.
   - Critério de aceitação: o formulário só envia a requisição quando a nova senha coincide com a confirmação; o backend recebe `token` e `novaSenha` e rejeita senha fora de RT-01; em qualquer rejeição, a senha da conta permanece inalterada.
6. O token é de uso único.
   - Critério de aceitação: após a redefinição, o token é consumido e uma segunda tentativa com ele responde `422 TOKEN_RECUPERACAO_INVALIDO`.
7. Após a redefinição, o usuário volta ao login com mensagem de sucesso.
   - Critério de aceitação: o frontend exibe a mensagem de sucesso e abre a tela de login.
8. Falha no envio de e-mail não altera a resposta pública.
   - Critério de aceitação: com falha de envio, a resposta ao solicitante é a mesma e a falha é registrada em log, sem segredos.
9. Os tokens de recuperação trafegam no corpo de requisições POST.
   - Critério de aceitação: nenhum endpoint da API recebe o token em query string nem no caminho.

## Requisitos não-funcionais

- RNF-05 e RNF-06: o fluxo web é utilizável nas larguras e nos navegadores da V1.
- RNF-08: não se aplica. A redefinição calcula hash BCrypt, cujo custo é deliberado (DT-06).
- RNF-12 e RNF-13: o token expira em 30 minutos, é de uso único e é persistido somente como hash.
- RT-01: senha com no mínimo 8 caracteres, ao menos uma letra e um número, e no máximo 72 bytes UTF-8.

## Cenários Gherkin

Cenário: [C01] Solicitar recuperação para conta existente
  Dado um e-mail associado a uma conta
  Quando a solicitação é enviada
  Então a resposta é `202` com a mensagem genérica
  E um token válido por 30 minutos é gerado e o e-mail de redefinição é solicitado ao serviço de envio

Cenário: [C02] Solicitar recuperação para conta inexistente
  Dado um e-mail sem conta associada
  Quando a solicitação é enviada
  Então a resposta é igual à da conta existente
  E nenhum token é criado

Cenário: [C03] Invalidar o token anterior numa nova solicitação
  Dado uma conta com um token de recuperação ainda não utilizado
  Quando uma nova solicitação é enviada para o mesmo e-mail
  Então o token anterior passa a ser rejeitado

Cenário: [C04] Validar token válido
  Dado um token de recuperação válido
  Quando o token é validado
  Então o formulário de nova senha e confirmação é liberado

Cenário: [C05] Rejeitar token expirado
  Dado um token criado há mais de 30 minutos
  Quando o token é validado
  Então a resposta é `422 TOKEN_RECUPERACAO_INVALIDO`
  E a tela informa que o link não é mais válido

Cenário: [C06] Rejeitar token inexistente
  Dado um token que não existe
  Quando o token é validado
  Então a resposta é `422 TOKEN_RECUPERACAO_INVALIDO`

Cenário: [C07] Rejeitar senha fora da política
  Dado um token válido e uma nova senha sem número
  Quando a redefinição é enviada
  Então a redefinição é rejeitada com `400 VALIDACAO`
  E a senha da conta permanece inalterada

Cenário: [C08] Bloquear confirmação divergente no formulário
  Dado a tela de redefinição com uma confirmação diferente da nova senha
  Quando o usuário envia o formulário
  Então o formulário exibe o erro de confirmação
  E nenhuma requisição é enviada ao backend

Cenário: [C09] Redefinir a senha com token válido
  Dado um token válido e uma nova senha que atende a política e coincide com a confirmação
  Quando a redefinição é concluída
  Então a senha é atualizada e o token é consumido
  E o frontend abre o login com a mensagem de sucesso

Cenário: [C10] Rejeitar segunda tentativa com o mesmo token
  Dado um token já consumido numa redefinição
  Quando uma nova redefinição é enviada com ele
  Então a resposta é `422 TOKEN_RECUPERACAO_INVALIDO`
  E a senha da conta permanece como na primeira redefinição

Cenário: [C11] Manter a resposta genérica quando o envio falha
  Dado uma conta existente e uma falha no envio de e-mail
  Quando a solicitação é enviada
  Então a resposta é igual à de um envio bem-sucedido
  E a falha é registrada em log sem segredos

Cenário: [C12] Persistir o token somente como hash
  Dado um token de recuperação gerado
  Quando o registro é consultado no banco
  Então apenas o SHA-256 do token está armazenado

## Contrato de Integração

Não se aplica. O modo é sequencial, e o contrato da recuperação nasce no backend.

## Plano de execução

- Módulos ativados: backend, frontend
- Modo: sequencial
- Justificativa: a história ativa dois módulos e não tem Contrato de Integração completo (skill `criterio-fluxo-execucao`, passo 2); o backend vem primeiro e o frontend depois.

## Decisões técnicas relevantes

- Token de 32 bytes com `SecureRandom`, em Base64 URL-safe, gravado como SHA-256 em hexadecimal (DT-07).
- Validade de 30 minutos, calculada com o `Clock` injetado (DT-08 e DT-09).
- Envio assíncrono, e falha de envio apenas registrada em log (DT-12).
- A tabela `recuperacao_senha` segue a seção 2.9 do modelo de dados, com índice por `usuario_id`.
- A confirmação da senha é validada só no formulário; o backend recebe `token` e `novaSenha`.
- A redefinição não revoga os refresh tokens ativos, para manter o modelo de dados (`motivo_revogacao` só aceita `ROTACAO`, `LOGOUT` e `REUSO_DETECTADO`). Risco aceito na V1; revogar antes de produção.
- Tokens expirados não são removidos nesta versão (risco aceito, com limpeza antes de produção).
## Pontos em aberto

Nenhum.
