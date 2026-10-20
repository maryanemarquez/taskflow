# HIST-002-membros — Aceitar convite com cadastro

## Visão geral

Uma pessoa sem conta conclui o cadastro a partir de um convite válido, informando só nome e senha. O e-mail e o workspace vêm do convite e não podem ser alterados. O cadastro cria o usuário com papel Membro, consome o convite e inicia a sessão. Convite expirado, inválido, utilizado ou invalidado mostra a tela "Este convite expirou".

Fora de escopo: criar e enviar o convite (`HIST-001-membros`), aceitar com conta existente (`HIST-003-membros`, que entrega a variante da mesma rota) e login sem convite (`HIST-002-auth`).

Dependências: `HIST-001-membros` e `HIST-001-auth`.

## Domínio

membros

## Origem

- Requisitos, RT-01, RT-04, RF-07, RF-08, RF-27, RF-28, RNF-01, RNF-11 e RNF-13.
- Especificação, seções 5, 6 (telas 2 e 3), 7.2 e 7.7.
- Modelo de dados, seções 2.1 a 2.4.
- Decisões técnicas, DT-06 a DT-08.
- Padrão de API, seções 4 e 6.

## Requisitos funcionais

1. A pessoa convidada sem conta se cadastra pelo convite.
   - Critério de aceitação: `POST /api/v1/convites/cadastrar` com `token`, `nome` e `senha` válidos responde `201` com o par de tokens; o usuário é criado com o e-mail do convite, o vínculo `MEMBRO` com o workspace do convite é criado e o convite fica utilizado, tudo na mesma transação.
2. O cadastro por convite respeita RT-01 e RT-04.
   - Critério de aceitação: nome de 1 a 100 caracteres e senha da política RT-01 (8 caracteres, letra e número, até 72 bytes UTF-8); fora disso, `400 VALIDACAO` sem criar usuário nem vínculo.
3. Token inválido impede o cadastro.
   - Critério de aceitação: token inexistente, expirado, utilizado ou invalidado responde `422 CONVITE_INVALIDO` sem criar usuário nem vínculo.
4. O e-mail do convite não pode ter conta.
   - Critério de aceitação: se o e-mail já tem conta, a resposta é `409 EMAIL_JA_CADASTRADO` sem criar usuário nem vínculo.
5. O convite é de uso único.
   - Critério de aceitação: uma segunda tentativa com o mesmo token responde `422 CONVITE_INVALIDO`.
6. A senha é guardada somente como hash adaptativo.
   - Critério de aceitação: nenhum registro contém a senha em texto puro.
7. A rota `/invite/{token}` valida o convite e mostra o cadastro.
   - Critério de aceitação: o frontend envia o token a `POST /api/v1/convites/validar`; com convite válido e `contaExistente` falso, exibe o nome do workspace, o e-mail somente leitura e os campos nome e senha.
8. A tela "Convite expirado ou inválido" orienta a pessoa.
   - Critério de aceitação: ela exibe "Este convite expirou", a orientação de pedir um novo convite ao responsável pelo workspace e o botão "Voltar para o login".
9. Após o cadastro, a sessão é iniciada.
   - Critério de aceitação: o frontend guarda a sessão e abre a tela inicial provisória.

## Requisitos não-funcionais

- RNF-01: o ingresso só ocorre no workspace associado ao token.
- RNF-05 e RNF-06: o fluxo de cadastro é utilizável em 360 px, 768 px e 1280 px, nos navegadores definidos.
- RNF-08: não se aplica ao cadastro, que calcula hash BCrypt de custo deliberado (DT-06).
- RNF-11 e RNF-13: convite válido por 2 dias; senha e token guardados somente como hash.

## Cenários Gherkin

Cenário: [C01] Cadastrar por convite válido
  Dado um convite válido para um e-mail sem conta
  Quando a pessoa envia `POST /api/v1/convites/cadastrar` com nome e senha válidos
  Então a resposta é `201` com o par de tokens
  E o usuário é criado com o e-mail do convite e o vínculo `MEMBRO` com o workspace do convite

Cenário: [C02] Consumir o convite no cadastro
  Dado um cadastro por convite concluído
  Quando o convite é consultado
  Então ele está marcado como utilizado

Cenário: [C03] Rejeitar convite reutilizado
  Dado um convite já utilizado num cadastro
  Quando outro cadastro é enviado com o mesmo token
  Então a resposta é `422 CONVITE_INVALIDO`
  E nenhum usuário novo é criado

Cenário: [C04] Rejeitar convite expirado
  Dado um convite com mais de 2 dias
  Quando o cadastro é enviado
  Então a resposta é `422 CONVITE_INVALIDO`
  E nenhum usuário nem vínculo é criado

Cenário: [C05] Rejeitar token inexistente
  Dado um token que não existe
  Quando o cadastro é enviado
  Então a resposta é `422 CONVITE_INVALIDO`
  E nenhum usuário nem vínculo é criado

Cenário: [C06] Rejeitar senha fora da política
  Dado um convite válido e uma senha sem número
  Quando o cadastro é enviado
  Então a resposta é `400 VALIDACAO` com erro de campo `SENHA_FORA_DA_POLITICA`
  E nenhum usuário nem vínculo é criado

Cenário: [C07] Rejeitar nome com 101 caracteres
  Dado um convite válido e um nome com 101 caracteres
  Quando o cadastro é enviado
  Então a resposta é `400 VALIDACAO` com erro de campo `TAMANHO_EXCEDIDO`
  E nenhum usuário nem vínculo é criado

Cenário: [C08] Rejeitar e-mail que já tem conta
  Dado um convite válido cujo e-mail já tem conta
  Quando o cadastro é enviado
  Então a resposta é `409 EMAIL_JA_CADASTRADO`
  E nenhum vínculo é criado

Cenário: [C09] Desfazer tudo quando o cadastro falha
  Dado que a criação do vínculo falha durante o cadastro por convite
  Quando o cadastro é processado
  Então nenhum usuário é criado e o convite continua válido

Cenário: [C10] Exibir o formulário do convite
  Dado um convite válido para um e-mail sem conta
  Quando a pessoa abre a rota `/invite/{token}`
  Então a tela mostra o nome do workspace e o e-mail somente leitura
  E mostra apenas os campos nome e senha

Cenário: [C11] Exibir a tela de convite expirado
  Dado um convite expirado, inválido, utilizado ou invalidado
  Quando a pessoa abre a rota `/invite/{token}`
  Então a tela mostra "Este convite expirou" e a orientação de pedir um novo convite

Cenário: [C12] Voltar para o login a partir do convite expirado
  Dado a tela de convite expirado
  Quando a pessoa aciona "Voltar para o login"
  Então a tela de login é exibida

Cenário: [C13] Abrir a tela inicial após o cadastro
  Dado um cadastro por convite concluído
  Quando o frontend recebe a resposta
  Então a sessão é guardada
  E a tela inicial provisória é exibida

Cenário: [C14] Persistir a senha somente como hash
  Dado um cadastro por convite concluído
  Quando o registro do usuário é consultado no banco
  Então apenas o hash da senha está armazenado

## Contrato de Integração

Não se aplica. O modo é sequencial, e o contrato do cadastro por convite nasce no backend.

## Plano de execução

- Módulos ativados: backend, frontend
- Modo: sequencial
- Justificativa: a história ativa dois módulos e não tem Contrato de Integração completo (skill `criterio-fluxo-execucao`, passo 2); o backend vem primeiro e o frontend depois.

## Decisões técnicas relevantes

- Endpoint `POST /api/v1/convites/cadastrar`, com o token no corpo; a rota web `/invite/{token}` repassa o token ao corpo (Padrão de API, seção 4).
- O token é validado de novo dentro da transação do cadastro, para evitar uso concorrente do mesmo convite.
- A tela "Convite expirado ou inválido" é construída aqui e reutilizada por `HIST-003-membros`.
- Quando `contaExistente` é verdadeiro, a rota mostra a variante de autenticação entregue por `HIST-003-membros`.
- Usa a infraestrutura de tokens de sessão de `HIST-001-auth`.

## Pontos em aberto

Nenhum.
