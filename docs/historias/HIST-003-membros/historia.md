# HIST-003-membros — Aceitar convite com conta existente

## Visão geral

Uma pessoa que já tem conta, mas está sem workspace, se autentica a partir de um convite válido para voltar a um workspace como Membro. Em vez de criar uma conta, a rota do convite pede só a senha. A autenticação, o vínculo e o consumo do convite ocorrem na mesma transação.

Fora de escopo: cadastro de conta nova por convite (`HIST-002-membros`), aceite de pessoa que já pertence a um workspace (não permitido na V1) e login sem convite (`HIST-002-auth`).

Dependências: `HIST-001-membros`, `HIST-002-membros` (rota e tela de convite expirado) e `HIST-003-auth`.

## Domínio

membros

## Origem

- Requisitos, RF-06 a RF-08, RF-27, RF-28 e RF-39.
- Domínio, seções 3 a 5.
- Especificação, seções 5, 6 (telas 2, 3 e 13), 7.2, 7.7 e 7.9.
- Modelo de dados, seções 2.1 a 2.4.
- Decisões técnicas, DT-07, DT-08 e DT-14.
- Padrão de API, seções 2.1, 4 e 6.

## Requisitos funcionais

1. A conta sem workspace aceita o convite autenticando-se.
   - Critério de aceitação: `POST /api/v1/convites/aceitar` com `token` e `senha` corretos responde `200` com o par de tokens; o usuário é vinculado como `MEMBRO` ao workspace do convite e o convite fica utilizado, na mesma transação.
2. Senha incorreta nega o aceite.
   - Critério de aceitação: a resposta é `401 CREDENCIAIS_INVALIDAS`, sem criar vínculo e sem consumir o convite.
3. E-mail do convite sem conta recebe a mesma resposta genérica.
   - Critério de aceitação: a resposta é `401 CREDENCIAIS_INVALIDAS`, igual à da senha incorreta.
4. Token inválido impede o aceite.
   - Critério de aceitação: token inexistente, expirado, utilizado ou invalidado responde `422 CONVITE_INVALIDO` sem criar vínculo.
5. A conta que já pertence a um workspace não é vinculada a outro.
   - Critério de aceitação: a resposta é `422 USUARIO_JA_PERTENCE_A_WORKSPACE`, sem alterar vínculo nem convite.
6. A rota do convite mostra a autenticação quando a conta existe.
   - Critério de aceitação: com `contaExistente` verdadeiro na validação, a rota `/invite/{token}` exibe o e-mail e o nome do workspace e pede somente a senha, sem oferecer criar conta.
7. Após o aceite, a sessão é iniciada.
   - Critério de aceitação: o frontend guarda a sessão e abre a tela inicial provisória.

## Requisitos não-funcionais

- RNF-01 e RNF-02: autenticação e isolamento por workspace.
- RNF-05 e RNF-06: o fluxo é utilizável em 360 px, 768 px e 1280 px, nos navegadores definidos.
- RNF-08: não se aplica ao aceite, que confere hash BCrypt de custo deliberado (DT-06).
- RNF-11 e RNF-13: token limitado a 2 dias e guardado somente como hash.

## Cenários Gherkin

Cenário: [C01] Aceitar convite com a senha correta
  Dado uma conta sem workspace e um convite válido para o mesmo e-mail
  Quando o usuário envia `POST /api/v1/convites/aceitar` com a senha correta
  Então a resposta é `200` com o par de tokens
  E o usuário é vinculado como `MEMBRO` ao workspace do convite

Cenário: [C02] Consumir o convite no aceite
  Dado um aceite concluído
  Quando o convite é consultado
  Então ele está marcado como utilizado

Cenário: [C03] Negar o aceite com senha incorreta
  Dado uma conta sem workspace e um convite válido
  Quando o usuário envia uma senha incorreta
  Então a resposta é `401 CREDENCIAIS_INVALIDAS`
  E nenhum vínculo é criado e o convite continua válido

Cenário: [C04] Responder igual quando o e-mail não tem conta
  Dado um convite válido cujo e-mail não tem conta
  Quando o aceite é enviado
  Então a resposta é `401 CREDENCIAIS_INVALIDAS`, igual à da senha incorreta

Cenário: [C05] Rejeitar convite indisponível
  Dado um convite expirado, inexistente, utilizado ou invalidado
  Quando o aceite é enviado
  Então a resposta é `422 CONVITE_INVALIDO`
  E nenhum vínculo é criado

Cenário: [C06] Rejeitar conta que já pertence a um workspace
  Dado uma conta que já pertence a um workspace e um convite válido para o seu e-mail
  Quando o aceite é enviado
  Então a resposta é `422 USUARIO_JA_PERTENCE_A_WORKSPACE`
  E o vínculo existente permanece

Cenário: [C07] Desfazer tudo quando o aceite falha
  Dado que o consumo do convite falha durante o aceite
  Quando o aceite é processado
  Então nenhum vínculo é criado

Cenário: [C08] Exibir somente a senha para conta existente
  Dado um convite válido para um e-mail com conta sem workspace
  Quando a pessoa abre a rota `/invite/{token}`
  Então a tela mostra o e-mail e o nome do workspace
  E pede somente a senha, sem campo de nome

Cenário: [C09] Abrir a tela inicial após o aceite
  Dado um aceite concluído
  Quando o frontend recebe a resposta
  Então a sessão é guardada
  E a tela inicial provisória é exibida

## Contrato de Integração

Não se aplica. O modo é sequencial, e o contrato do aceite nasce no backend.

## Plano de execução

- Módulos ativados: backend, frontend
- Modo: sequencial
- Justificativa: a história ativa dois módulos e não tem Contrato de Integração completo (skill `criterio-fluxo-execucao`, passo 2); o backend vem primeiro e o frontend depois.

## Decisões técnicas relevantes

- Endpoint `POST /api/v1/convites/aceitar`, previsto no Padrão de API, com `token` e `senha` no corpo.
- A senha incorreta e a conta inexistente usam a mesma resposta genérica `CREDENCIAIS_INVALIDAS`, como no login.
- Vínculo e consumo do convite ficam na mesma transação, com o token revalidado dentro dela.
- A validação do convite (`contaExistente`) vem de `HIST-001-membros`, e a tela de convite expirado, de `HIST-002-membros`.

## Pontos em aberto

Nenhum.
