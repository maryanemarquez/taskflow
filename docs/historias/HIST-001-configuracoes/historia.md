# HIST-001-configuracoes — Editar perfil

## Visão geral

Proprietário e Membro editam o próprio nome e trocam a própria senha. A troca exige a senha atual e segue a política da conta. O e-mail é exibido e não pode ser alterado. Nome e senha são operações separadas, cada uma com seu formulário e seu botão.

Fora de escopo: alterar e-mail, editar o perfil de outra pessoa, administrar o workspace, revogar sessões ao trocar a senha (risco aceito, como na redefinição de senha) e foto ou outros dados de perfil.

Dependências: `HIST-001-auth`, `HIST-002-auth`, `HIST-003-auth` (cabeçalho e menu do usuário) e `HIST-001-fundacao`.

## Domínio

configuracoes

## Origem

- Requisitos, RT-01, RT-04, RF-26, RNF-01, RNF-02 e RNF-13.
- Domínio, seção 5.
- Especificação, seções 3.5, 5 e 6 (tela 12).
- Decisões técnicas, DT-06 e DT-14.
- Padrão de API, seções 2, 6 e 8.

## Requisitos funcionais

1. O usuário consulta o próprio perfil.
   - Critério de aceitação: `GET /api/v1/perfil` responde `200` com `id`, `nome` e `email` do usuário autenticado, sem exigir workspace.
2. O usuário altera o próprio nome.
   - Critério de aceitação: `PUT /api/v1/perfil` com `nome` válido responde `200` com o perfil atualizado; o nome é aparado nas pontas, tem de 1 a 100 caracteres, e só a conta do usuário autenticado muda.
3. O nome respeita RT-04.
   - Critério de aceitação: nome vazio responde `400 VALIDACAO` com `OBRIGATORIO` e com mais de 100 caracteres com `TAMANHO_EXCEDIDO`, sem alterar o nome.
4. O e-mail e a conta não são alteráveis pelo perfil.
   - Critério de aceitação: `email`, `id` ou qualquer outro campo enviado no corpo é ignorado, e os endpoints não aceitam identificador de usuário, por isso só atuam na conta autenticada.
5. O usuário altera a própria senha.
   - Critério de aceitação: `PUT /api/v1/perfil/senha` com `senhaAtual` correta e `novaSenha` válida responde `204`; a nova senha é guardada somente como hash BCrypt e a senha anterior deixa de valer no login.
6. A senha atual incorreta bloqueia a troca.
   - Critério de aceitação: a resposta é `422 SENHA_ATUAL_INCORRETA` e a senha permanece.
7. A nova senha segue a política RT-01.
   - Critério de aceitação: nova senha com menos de 8 caracteres, sem letra, sem número ou com mais de 72 bytes UTF-8 responde `400 VALIDACAO` com `SENHA_FORA_DA_POLITICA` em `novaSenha`; campo ausente responde `OBRIGATORIO`; a senha permanece.
8. As requisições exigem autenticação.
   - Critério de aceitação: sem token válido, os endpoints respondem `401 NAO_AUTENTICADO`.
9. A tela de configurações mostra o perfil.
   - Critério de aceitação: a rota `/configuracoes` exibe o e-mail em campo somente leitura, o formulário de nome e o formulário de senha com senha atual, nova senha e confirmação.
10. A confirmação da senha é validada no formulário.
    - Critério de aceitação: confirmação diferente da nova senha mostra erro junto ao campo e não envia a requisição.
11. A tela reflete os resultados.
    - Critério de aceitação: ao salvar o nome, a tela mostra a confirmação "Nome atualizado" e o novo nome aparece no restante da aplicação; ao trocar a senha, mostra "Senha alterada" e limpa os campos; erros do servidor aparecem junto ao campo (`SENHA_ATUAL_INCORRETA` no campo senha atual).
12. A tela é alcançada pelo menu do usuário.
    - Critério de aceitação: o menu do usuário, para quem tem workspace, tem a opção "Configurações" que abre `/configuracoes`.

## Requisitos não-funcionais

- RNF-01 e RNF-02: acesso autenticado e limitado ao próprio perfil.
- RNF-04, RNF-05 e RNF-06: a tela é utilizável em 360 px, 768 px e 1280 px, nos navegadores definidos.
- RNF-08: não se aplica à troca de senha, que calcula hash BCrypt de custo deliberado (DT-06); a consulta e a troca de nome seguem 95% das requisições em até 500 ms em ambiente local de teste.
- RNF-13: senha guardada somente como hash adaptativo.

## Cenários Gherkin

Cenário: [C01] Consultar o perfil
  Dado um usuário autenticado
  Quando ele envia `GET /api/v1/perfil`
  Então a resposta é `200` com `id`, `nome` e `email` dele

Cenário: [C02] Atualizar o nome
  Dado um usuário autenticado
  Quando ele envia `PUT /api/v1/perfil` com um nome válido
  Então a resposta é `200` com o nome novo
  E somente a conta dele é alterada

Cenário: [C03] Aceitar nome com 100 caracteres
  Dado um usuário autenticado
  Quando ele envia um nome com 100 caracteres
  Então o nome é gravado

Cenário: [C04] Rejeitar nome com 101 caracteres
  Dado um usuário autenticado
  Quando ele envia um nome com 101 caracteres
  Então a resposta é `400 VALIDACAO` com erro de campo `TAMANHO_EXCEDIDO`
  E o nome permanece

Cenário: [C05] Rejeitar nome vazio
  Dado um usuário autenticado
  Quando ele envia um nome só com espaços
  Então a resposta é `400 VALIDACAO` com erro de campo `OBRIGATORIO`
  E o nome permanece

Cenário: [C06] Ignorar e-mail e identificador no corpo
  Dado um usuário autenticado
  Quando ele envia `PUT /api/v1/perfil` com `email` e `id` de outra pessoa
  Então o e-mail e o identificador da conta permanecem
  E a conta da outra pessoa não é alterada

Cenário: [C07] Trocar a senha
  Dado um usuário autenticado
  Quando ele envia `PUT /api/v1/perfil/senha` com a senha atual correta e uma nova senha válida
  Então a resposta é `204`
  E o login com a senha nova é aceito e com a anterior é recusado

Cenário: [C08] Guardar a senha somente como hash
  Dado uma senha trocada
  Quando o registro do usuário é consultado no banco
  Então apenas o hash da nova senha está armazenado

Cenário: [C09] Negar troca com a senha atual incorreta
  Dado um usuário autenticado
  Quando ele envia uma senha atual incorreta
  Então a resposta é `422 SENHA_ATUAL_INCORRETA`
  E a senha anterior continua válida

Cenário: [C10] Rejeitar nova senha sem número
  Dado um usuário autenticado
  Quando ele envia uma nova senha sem número
  Então a resposta é `400 VALIDACAO` com erro de campo `SENHA_FORA_DA_POLITICA` em `novaSenha`
  E a senha anterior continua válida

Cenário: [C11] Rejeitar nova senha com 7 caracteres
  Dado um usuário autenticado
  Quando ele envia uma nova senha com 7 caracteres
  Então a resposta é `400 VALIDACAO` com erro de campo `SENHA_FORA_DA_POLITICA` em `novaSenha`

Cenário: [C12] Rejeitar nova senha ausente
  Dado um usuário autenticado
  Quando ele envia a troca sem `novaSenha`
  Então a resposta é `400 VALIDACAO` com erro de campo `OBRIGATORIO`

Cenário: [C13] Exigir autenticação
  Dado uma requisição sem token válido
  Quando ela chama `GET /api/v1/perfil`
  Então a resposta é `401 NAO_AUTENTICADO`

Cenário: [C14] Exibir a tela de configurações
  Dado um usuário autenticado
  Quando ele abre `/configuracoes`
  Então a tela mostra o e-mail somente leitura, o formulário de nome e o formulário de senha

Cenário: [C15] Abrir pelo menu do usuário
  Dado um usuário com workspace
  Quando ele aciona "Configurações" no menu do usuário
  Então a rota `/configuracoes` é exibida

Cenário: [C16] Salvar o nome pela interface
  Dado a tela de configurações aberta
  Quando o usuário altera o nome e aciona "Salvar"
  Então a tela mostra "Nome atualizado"
  E o novo nome aparece no restante da aplicação

Cenário: [C17] Bloquear confirmação divergente
  Dado o formulário de senha preenchido com confirmação diferente da nova senha
  Quando o usuário aciona "Alterar senha"
  Então o erro aparece junto ao campo de confirmação
  E nenhuma requisição é enviada

Cenário: [C18] Trocar a senha pela interface
  Dado o formulário de senha com os dados válidos
  Quando o usuário aciona "Alterar senha"
  Então a tela mostra "Senha alterada"
  E os campos de senha ficam vazios

Cenário: [C19] Mostrar o erro de senha atual incorreta
  Dado o formulário de senha com senha atual incorreta
  Quando o usuário aciona "Alterar senha"
  Então o erro aparece junto ao campo senha atual

## Contrato de Integração

Não se aplica. O modo é sequencial, e o contrato do perfil nasce no backend.

## Plano de execução

- Módulos ativados: backend, frontend
- Modo: sequencial
- Justificativa: a história ativa dois módulos e não tem Contrato de Integração completo (skill `criterio-fluxo-execucao`, passo 2); o backend vem primeiro e o frontend depois.

## Decisões técnicas relevantes

- Endpoints: `GET /api/v1/perfil`, `PUT /api/v1/perfil` (nome) e `PUT /api/v1/perfil/senha`, todos sobre o usuário do token, sem identificador na URL. Por isso não existe como atuar em outra conta.
- Nome e senha são formulários e endpoints separados; não há envio conjunto e, portanto, nenhuma questão de atomicidade.
- A confirmação da nova senha é validada só no formulário, como no cadastro e na redefinição. O backend recebe `senhaAtual` e `novaSenha`.
- A troca de senha não revoga os refresh tokens existentes (risco aceito, como na redefinição de senha).
- Após salvar o nome, a tela atualiza o usuário guardado no estado global (`/auth/eu`), sem novo login.
- A tela fica fora do `SEM_WORKSPACE`: os endpoints exigem só autenticação. O acesso pelo menu é para quem tem workspace.
- A opção "Configurações" é acrescentada ao menu do usuário do layout autenticado de `HIST-003-auth`; o nome mostrado no cabeçalho vem do usuário do estado global, atualizado após salvar o nome.
- Ordem de avaliação dos erros: 404, 403, 400, 422.

## Pontos em aberto

Nenhum.
