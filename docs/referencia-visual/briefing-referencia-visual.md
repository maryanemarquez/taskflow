# TaskFlow V1 — Briefing completo para construir a Referência Visual em React

> **Destinatário:** uma IA que vai construir, do zero, uma **referência visual totalmente em React** do TaskFlow V1.
> **Fonte:** documentos oficiais do projeto TaskFlow V1 (Especificação, Requisitos, Modelo de Dados, Padrão de API, Decisões Técnicas, Domínio, Backlog, Índice da referência visual), revisão de 17/10/2026.
> **Idioma do produto:** português do Brasil. Nomes técnicos (enums, campos JSON, endpoints, tabelas) ficam exatamente como no projeto.

---

## 0. Como ler este documento

### 0.1 Convenção de confiança das informações

Para você não confundir o que é regra do projeto com o que é sugestão, cada afirmação relevante segue esta marcação:

| Marca | Significado |
|---|---|
| **[DOC]** | Está nos documentos oficiais. É regra. Siga exatamente. |
| **[SUGESTÃO]** | Não está nos documentos. É uma proposta minha para preencher uma lacuna visual. Pode ser ajustada. |
| **[LACUNA]** | Os documentos não definem. Você deve escolher, registrar a escolha e deixar fácil de trocar. |

Textos de interface entre aspas, como "Este convite expirou", são **[DOC]** quando a seção diz que são literais. Os demais textos de mensagem são **[SUGESTÃO]**.

### 0.2 O que é esta referência visual e para que ela serve

- A sua referência React serve **apenas como guia de aparência e comportamento visual**: layote, hierarquia visual, espaçamento, componentes, estados de tela, paleta e tipografia.
- Portanto, a sua entrega é um **protótipo navegável**, com dados fictícios (mock), cobrindo **todas as 13 telas, todos os estados e todos os fluxos** descritos aqui.
- **Não** construa backend. **Não** use Firebase ou qualquer serviço real. **Não** implemente autenticação real.

### 0.3 Regras de fronteira (importantes)

**[DOC]** O projeto tem uma regra rígida: da referência visual usa-se só o aspecto visual. A IA nunca deve reproduzir lógica de estado, chamadas de API, hooks de dados, contextos de autenticação, nomes de variáveis ou funções da referência.

Para facilitar isso, **[SUGESTÃO]** organize o seu código assim:

1. **Camada visual pura:** componentes e páginas recebem **dados e estados por props**. Nenhuma regra de negócio dentro de componente visual.
2. **Camada de mock isolada:** uma pasta própria (por exemplo, `mock/`) com os dados fictícios e as funções que simulam a API. Fácil de identificar e de ignorar.
3. **Tokens de design centralizados:** cores, tipografia, espaçamento, raios e sombras em um único arquivo (CSS variables ou tema).
4. **Galeria de estados:** uma rota de apoio (por exemplo, `/__estados`) que mostra cada tela em cada estado (carregando, vazio, erro, sucesso, sem permissão), sem precisar "forçar" o mock.
5. **Alternador de papel (dev):** um controle para trocar entre "Proprietário", "Membro" e "Sem workspace" e ver as diferenças de interface.
6. Evite padrões que só existem em React como "arquitetura": a referência deve ser legível como **catálogo visual**, não como modelo de estado.

---

## 1. Visão do produto

**[DOC]** TaskFlow é uma aplicação web SaaS de gestão de tarefas e projetos. Tem dois modos previstos (Pessoal e Equipe). **A V1 constrói só o Modo Equipe**, com escopo mínimo.

Hierarquia do sistema:

```
Workspace
  └─ Projetos
       └─ Tarefas
```

**Objetivo da V1 [DOC]:** um usuário cria a conta, ganha um workspace, cria projetos, convida colegas, cria tarefas e as acompanha até a conclusão.

**Fora da V1 [DOC] — não desenhe nada disso:**
subtarefas; tarefas refinadas (story/casos de teste); comentários; anexos; cargos/permissões customizados; relatórios e métricas avançadas; notificações; integração com IA; múltiplos workspaces por usuário; edição do workspace (nome, transferência de propriedade); mudança de e-mail da conta; mover tarefa entre projetos; tipos de tarefa além de "Simples".

---

## 2. Glossário e vocabulário fixo

| Termo | Significado |
|---|---|
| Workspace | Ambiente que agrupa membros e projetos. Cada usuário pertence a **no máximo 1** workspace na V1 |
| Proprietário | Dono do workspace. Exatamente 1 por workspace. Acesso administrativo total. Não pode ser removido |
| Membro | Participante com acesso operacional restrito |
| Usuário sem workspace | Conta existente, sem vínculo (ex.: membro removido). Não tem papel |
| Projeto | Contêiner de tarefas. Só tem **nome** na V1 |
| Tarefa | Unidade de trabalho, tipo único "Simples" |
| Responsável | Usuário pelo qual a tarefa responde. Toda tarefa tem um |
| Autor | Usuário que criou a tarefa. Define "tarefa própria" |
| Tag | Etiqueta da tarefa, pertence ao workspace, criada ao digitar |
| Convite | Link por e-mail, válido por 2 dias, para entrar no workspace como Membro |
| Token de acesso | JWT de 15 minutos |
| Refresh token | Token de renovação, 7 dias, revogável |

### 2.1 Enumerações e rótulos de exibição

**[DOC]** Os valores da API são `UPPER_SNAKE_CASE`. Os rótulos de exibição abaixo são os nomes usados na especificação.

| Enum (API) | Rótulo na tela |
|---|---|
| `PROPRIETARIO` | Proprietário |
| `MEMBRO` | Membro |
| `BAIXA` | Baixa |
| `MEDIA` | Média (**padrão** quando não informada) |
| `ALTA` | Alta |
| `PENDENTE_A_INICIAR` | Pendente a iniciar |
| `EM_DESENVOLVIMENTO` | Em desenvolvimento |
| `EM_TESTES` | Em testes |
| `FINALIZADO` | Finalizado |

**Fluxo de status [DOC]:**

```
PENDENTE_A_INICIAR ⇄ EM_DESENVOLVIMENTO ⇄ EM_TESTES ⇄ FINALIZADO
```

- Muda **um estágio por vez**, avançando ou retrocedendo. **Não pode pular estágios.**
- Estado inicial de toda tarefa: `PENDENTE_A_INICIAR`.
- Não existe "voltar de Finalizado direto para Pendente". De `FINALIZADO` só se retrocede para `EM_TESTES`. De `PENDENTE_A_INICIAR` só se avança para `EM_DESENVOLVIMENTO`.

---

## 3. Papéis e permissões (o que cada papel vê e pode fazer)

**[DOC]** Regra de ouro: o backend é a fonte da autorização; **a interface apenas oculta ou desabilita ações**. Na referência, esconda/desabilite conforme as tabelas.

### 3.1 Projetos

| Ação | Proprietário | Membro |
|---|---|---|
| Ver projetos | Todos do workspace | Todos do workspace |
| Criar projeto | Sim | Não |
| Editar projeto | Sim | Não |
| Remover projeto | Sim | Não |

### 3.2 Tarefas

| Ação | Proprietário | Membro |
|---|---|---|
| Ver tarefas | Todas do workspace | Todas do workspace |
| Criar tarefa | Em qualquer projeto | Em qualquer projeto do workspace |
| Definir responsável ao criar | Qualquer membro, inclusive ele mesmo | **Não escolhe**: o responsável é ele mesmo (campo exibido, não editável) |
| Editar (título, descrição, prioridade, tags, prazo) | Qualquer tarefa | Só tarefas **das quais é autor** ou **pelas quais é responsável** |
| Remover tarefa | Qualquer | **Não** |
| Alterar responsável de tarefa existente | Sim | Não |
| Alterar status (um estágio por vez) | Qualquer tarefa | Só tarefas **pelas quais é responsável** |
| Alterar prazo | Sim | Sim (regra geral de edição) |
| Mover para outro projeto | Não (V2) | Não (V2) |

Observação importante para o visual: **autor ≠ responsável** em alguns casos. Um Membro que criou uma tarefa e depois teve o responsável trocado pelo Proprietário continua podendo **editar** (é autor), mas **não pode mudar o status** (não é responsável).

### 3.3 Membros

| Ação | Proprietário | Membro |
|---|---|---|
| Ver membros | Sim | Sim |
| Convidar | Sim | Não |
| Ver convites pendentes / gerar novo convite | Sim | Não |
| Remover membro | Sim (exceto a si mesmo) | Não |

### 3.4 Métricas e configurações

| Ação | Proprietário | Membro |
|---|---|---|
| Ver Dashboard (contagem por status do workspace) | Sim | Sim |
| Ver "Minhas tarefas" | Sim | Sim |
| Editar o próprio perfil (nome e senha) | Sim | Sim |

### 3.5 Usuário sem workspace

**[DOC]** Não tem papel. Vê **somente** a tela "Sem Workspace" e o botão "Sair". Não acessa nenhuma outra tela e não pode criar workspace.

### 3.6 Resumo das variações de interface por papel

| Elemento de interface | Proprietário | Membro |
|---|---|---|
| Botão "Novo Projeto" | Visível | Oculto |
| Ações editar/remover projeto | Visíveis | Ocultas |
| Botão "Nova Tarefa" | Visível | Visível |
| Campo "Responsável" no formulário de tarefa | Seletor com todos os membros | Valor fixo = ele mesmo, não editável |
| Botão excluir tarefa | Visível | Oculto |
| Controle de status da tarefa | Em todas | Só nas tarefas em que é responsável (nas demais: oculto ou desabilitado) |
| Editar tarefa | Em todas | Só nas que é autor ou responsável |
| Trocar responsável de tarefa existente | Visível | Oculto |
| Tela Membros: convidar, convites pendentes, remover | Visíveis | Ocultos (só a lista de membros) |
| Estado vazio do Dashboard: ação "Criar primeiro projeto" | Visível | **[SUGESTÃO]** oculto (só mensagem informativa) |

---

## 4. Mapa de rotas e navegação

### 4.1 Rotas

**[DOC]** Só duas rotas têm formato definido: o link de convite `app.taskflow.com/invite/{token}` e o fato de que a redefinição de senha abre por link com token. A aplicação usa URLs **sem `#`** (roteamento por caminho). Os demais nomes abaixo são **[SUGESTÃO]**; mantenha-os centralizados em um único arquivo de rotas.

| Rota | Tela | Acesso |
|---|---|---|
| `/login` | 1. Login | Público |
| `/cadastro` | 2. Cadastro (sem convite) | Público |
| `/invite/{token}` | 2/3. Cadastro por convite, aceite por conta existente, ou Convite expirado/inválido | Público |
| `/recuperar-senha` | 4. Solicitar recuperação | Público |
| `/redefinir-senha/{token}` **[SUGESTÃO]** | 5. Redefinir senha | Público (token no link) |
| `/` ou `/dashboard` | 6. Dashboard (ou tela inicial provisória) | Autenticado com workspace |
| `/projetos` | 7. Listagem de projetos | Autenticado com workspace |
| `/projetos/{id}` | 8. Detalhe do projeto (Kanban/Lista + filtros) | Autenticado com workspace |
| `/projetos/{id}/tarefas/nova`, `/tarefas/{id}/editar` **[SUGESTÃO]** (ou diálogo) | 9. Criação/edição de tarefa | Autenticado com workspace |
| `/membros` | 10. Membros | Autenticado com workspace |
| (campo no topo) | 11. Busca global | Autenticado com workspace |
| `/configuracoes` | 12. Configurações de perfil | Autenticado com workspace |
| `/sem-workspace` | 13. Sem Workspace | Autenticado sem workspace |
| `*` | Página não encontrada (apoio visual) **[SUGESTÃO]** | Qualquer |

### 4.2 Guardas de rota (comportamento obrigatório) [DOC]

| Situação do usuário | Regra |
|---|---|
| Sem sessão tentando abrir rota autenticada | Redireciona para o login |
| Autenticado **sem workspace** tentando qualquer rota autenticada | Redireciona para "Sem Workspace" |
| Qualquer usuário autenticado abrindo `/login`, `/cadastro` | **[SUGESTÃO]** redireciona para a tela inicial |
| Sessão expira e a renovação falha | Encerra a sessão e leva ao login |
| Membro removido enquanto usa o sistema | Na **próxima requisição**, recebe "sem workspace" e a interface o leva a "Sem Workspace" imediatamente |

### 4.3 Destino após cadastro/login/aceite de convite [DOC]

- Destino normal: **Dashboard** do workspace.
- Enquanto o Dashboard não existir (ele é o penúltimo item do backlog), o destino é uma **tela inicial provisória do workspace**. Ela é definida na história do domínio `auth`. **[LACUNA]** Nenhum documento descreve seu conteúdo. **[SUGESTÃO]** desenhe-a como uma página simples com a saudação "Olá, {nome}", o nome do workspace e um atalho para "Projetos". Marque-a claramente como "provisória" na galeria de estados.

---

## 5. Leiaute geral da área autenticada

### 5.1 Estrutura [DOC]

Estrutura geral: **barra lateral + conteúdo + topo**.

- **Barra lateral — itens de navegação da V1 [DOC]:** Dashboard, Projetos, Membros e Configurações. Nada além disso.
- **Topo [DOC]:** campo de **busca global** e **menu do usuário**.
- **Menu do usuário [DOC]:** presente em **todas** as telas autenticadas, com acesso a "Configurações de Perfil" e à opção **"Sair"** (logout).
- Para o usuário **sem workspace**, a tela "Sem Workspace" oferece apenas o botão "Sair" (sem a navegação lateral).

### 5.2 Responsividade [DOC — RNF-05]

Três larguras de referência. Em todas, **todas as funcionalidades devem continuar utilizáveis, sem rolagem horizontal da página e sem perda de funcionalidade**:

| Largura | Dispositivo | Comportamento esperado |
|---|---|---|
| 360 px | Celular | **[SUGESTÃO]** barra lateral vira menu recolhível (gaveta); Kanban com rolagem horizontal **interna** ao quadro (não da página) ou colunas empilhadas; tabelas viram cartões |
| 768 px | Tablet | **[SUGESTÃO]** barra lateral recolhida por padrão (ícones) |
| 1280 px | Desktop | Barra lateral expandida |

Atenção: "sem rolagem horizontal da página" permite rolagem horizontal **dentro** de um componente (como o quadro Kanban), desde que a página em si não role.

### 5.3 Navegadores [DOC — RNF-06]

Chrome, Edge e Firefox (últimas 2 versões estáveis) e Safari 16+. Evite recursos de CSS que o Safari 16 não suporte sem alternativa.

---

## 6. Regras de validação de formulários (válidas em todas as telas)

**[DOC]** O backend é a fonte de verdade, e os formulários **espelham** os limites para dar retorno imediato.

### 6.1 Política de senha (RT-01)

- Mínimo de **8 caracteres**.
- Máximo de **72 bytes em UTF-8** (não 72 caracteres). Para texto só ASCII, 72 bytes = 72 caracteres; letras acentuadas ocupam 2 bytes ou mais.
- Pelo menos **1 letra** e **1 número**.
- Senha acima do limite é **rejeitada, nunca truncada**.
- Na referência, contar bytes com `new TextEncoder().encode(senha).length`.

### 6.2 Limites de campos (RT-04)

| Campo | Limite |
|---|---|
| Nome do usuário | 1 a 100 caracteres |
| E-mail | até 150 caracteres |
| Nome do projeto | 1 a 150 caracteres |
| Título da tarefa | 1 a 200 caracteres |
| Descrição da tarefa | até 5.000 caracteres |
| Tags por tarefa | até 10 |
| Nome de tag | 1 a 50 caracteres (após remover espaços das pontas) |

- Campos de texto curto: o backend remove espaços das pontas. O e-mail é normalizado (sem espaços nas pontas e em minúsculas).
- **[SUGESTÃO]** mostre contador de caracteres nos campos longos (descrição, título) e no campo de tags ("3/10").

### 6.3 Códigos de erro por campo (`erros[].codigo`) [DOC]

| Código | Quando |
|---|---|
| `OBRIGATORIO` | Campo obrigatório ausente ou vazio |
| `FORMATO_INVALIDO` | Formato inválido (e-mail, data) |
| `TAMANHO_EXCEDIDO` | Texto acima/abaixo do tamanho permitido; inclui senha acima de 72 bytes |
| `LIMITE_EXCEDIDO` | Quantidade acima do limite (mais de 10 tags) |
| `SENHA_FORA_DA_POLITICA` | Senha sem letra e número, ou abaixo do mínimo |

### 6.4 Mensagens de erro por campo (textos) **[SUGESTÃO]**

| Código | Texto sugerido |
|---|---|
| `OBRIGATORIO` | "Este campo é obrigatório." |
| `FORMATO_INVALIDO` (e-mail) | "Informe um e-mail válido." |
| `TAMANHO_EXCEDIDO` | "Use no máximo {n} caracteres." |
| `TAMANHO_EXCEDIDO` (senha) | "A senha é muito longa." |
| `LIMITE_EXCEDIDO` (tags) | "Use no máximo 10 tags." |
| `SENHA_FORA_DA_POLITICA` | "A senha precisa ter ao menos 8 caracteres, com letra e número." |
| Confirmação diferente | "A confirmação não coincide com a senha." |

Exemplo de exibição documentada (da API): `{ "campo": "titulo", "codigo": "OBRIGATORIO", "mensagem": "O título é obrigatório." }`.

---

## 7. As 13 telas — especificação detalhada

Para cada tela: objetivo, quem acessa, conteúdo, campos, ações, estados e navegação.

### Tela 1 — Login

- **Acesso:** público. **[DOC]**
- **Conteúdo [DOC]:** campos **e-mail** e **senha**; botão de entrar; link para **cadastro**; link **"Esqueci minha senha"**.
- **Comportamento:**
  - Sucesso → destino pós-login (seção 4.3). Se a conta não tem workspace → "Sem Workspace".
  - Falha → mensagem **genérica** (`CREDENCIAIS_INVALIDAS`, HTTP 401), **sem indicar se o e-mail existe**. **[SUGESTÃO]** texto: "E-mail ou senha incorretos."
  - Erro de campo (e-mail em branco/formato) é validação local, diferente de credencial inválida.
- **Estados:** inicial, enviando (botão em carregamento, campos desabilitados), erro de credenciais, erro de rede **[SUGESTÃO]**.
- **Navegação:** "Esqueci minha senha" → tela 4. "Cadastro" → tela 2.

### Tela 2 — Cadastro (três variações)

**[DOC]** É uma única tela com três comportamentos conforme o contexto.

**2A. Sem convite** (acesso por `/cadastro`)
- Campos: **nome**, **e-mail**, **senha**. (Sem confirmação de senha na especificação. **[SUGESTÃO]** não incluir confirmação.)
- Validações: RT-01, RT-04 (seção 6).
- Erros específicos:
  - E-mail já cadastrado → HTTP 409, código `EMAIL_JA_CADASTRADO`. **[SUGESTÃO]** exibir no campo e-mail: "Este e-mail já está cadastrado."
- Sucesso: cria conta, cria workspace "Workspace de {nome}" e o torna Proprietário **em uma única operação atômica**; inicia sessão automaticamente; vai ao Dashboard (ou tela provisória).
- Informação útil de comunicação: o workspace é criado sem intervenção do usuário; **[SUGESTÃO]** pode haver um texto curto "Vamos criar seu workspace automaticamente".

**2B. Por convite, pessoa sem conta** (acesso por `/invite/{token}` com token válido)
- Campos: apenas **nome** e **senha**.
- O **e-mail do convite** é exibido **sem possibilidade de edição** (campo somente leitura).
- **[SUGESTÃO]** mostrar também "Você foi convidado para {nome do workspace}".
- Sucesso: vincula como **Membro** ao workspace do convite, marca o convite como utilizado, inicia sessão automática e vai ao Dashboard (ou tela provisória).

**2C. Por convite, e-mail que já tem conta e está sem workspace**
- A página **não** pede cadastro. Pede **apenas a autenticação (senha)**.
- Exibe o **e-mail** e o **workspace** do convite.
- Sucesso: autentica, vincula como Membro, marca o convite como utilizado e vai ao Dashboard (ou tela provisória).

**[LACUNA]** Os documentos não dizem como a tela descobre se o e-mail do convite já tem conta (a API de validação `POST /api/v1/convites/validar` recebe o token no corpo e deve devolver, de alguma forma, e-mail, nome do workspace e se a conta existe). Na referência, simule uma resposta com esses dados (ver seção 11).

### Tela 3 — Convite Expirado ou Inválido

- **Acesso:** público, aberta via `/invite/{token}` quando o token não é aceito.
- **Conteúdo [DOC] (textos literais):**
  - Mensagem: **"Este convite expirou"**.
  - Orientação para **solicitar um novo convite ao responsável pelo workspace**.
  - Botão: **"Voltar para o login"**.
- **Quando aparece [DOC]:** token expirado (mais de 2 dias), inexistente/inválido, **já utilizado** ou **invalidado** por um convite mais recente. **A mesma tela** serve para todos esses casos.
- **Não há reenvio automático** a partir desta tela. Apenas o Proprietário gera novo convite, pela tela Membros.
- Código de erro da API: `CONVITE_INVALIDO` (HTTP 422).

### Tela 4 — Solicitar Recuperação de Senha

- **Acesso:** público, a partir do link "Esqueci minha senha".
- **Conteúdo [DOC]:** campo de **e-mail**, botão de envio e **mensagem genérica de confirmação**.
- **Regra crítica [DOC — RF-37]:** a mensagem exibida é **exatamente a mesma** quer o e-mail exista ou não. A API responde `202 Accepted` nos dois casos. A interface **nunca** pode revelar se a conta existe.
- **[SUGESTÃO]** texto da confirmação: "Se o e-mail estiver cadastrado, enviaremos as instruções para redefinir a senha."
- **Estados:** inicial, enviando, confirmação (campo desabilitado ou escondido, com opção de voltar ao login), erro de formato do e-mail.
- Resultado fora da tela: o sistema envia e-mail com o botão **"Redefinir minha senha"** (seção 12).

### Tela 5 — Redefinir Senha

- **Acesso:** público, por link com token (vindo do e-mail).
- **Duas variações [DOC]:**
  1. **Token válido** → formulário com **nova senha** e **confirmação**.
  2. **Token expirado/inválido/já usado** → **mensagem informando que o link não é mais válido**. Não mostra formulário. (Código `TOKEN_RECUPERACAO_INVALIDO`, HTTP 422.)
- **Validações [DOC]:** nova senha segue RT-01; a confirmação precisa coincidir.
- **Sucesso [DOC]:** exibe mensagem de sucesso ("senha alterada com sucesso") e direciona para o **login**.
- **Regras de token [DOC]:** validade de 30 minutos; uso único; nova solicitação invalida as anteriores não utilizadas.
- **[SUGESTÃO]** na variação "link inválido", oferecer botão "Solicitar novo link" que leva à tela 4.

### Tela 6 — Dashboard

- **Acesso:** autenticado com workspace (Proprietário e Membro).
- **Conteúdo [DOC]:**
  1. **Contagem de tarefas do workspace por status** (4 status). Status sem tarefas mostram **zero**.
  2. **Destaque "Minhas tarefas"**: contagem das tarefas do **próprio usuário** (como responsável) por status.
  3. **Acesso rápido aos projetos.**
- **Estado vazio [DOC]:** workspace sem projetos → estado vazio com a ação **"Criar primeiro projeto"** para o **Proprietário**. **[SUGESTÃO]** Membro vê o estado vazio sem a ação.
- **Reflexo imediato [DOC]:** ao mudar o status de uma tarefa, a contagem do Dashboard e a visão do projeto refletem a mudança (RNF-07: Kanban, Lista e Dashboard sempre consistentes). Na referência com mock em memória, faça as três visões lerem a **mesma fonte** de dados.
- **Escopo visual [DOC]:** cartões de estatística (contagem por status) e cartões de tarefa ("Minhas tarefas"). **Gráficos de atividade e anéis de progresso estão fora da V1.**
- **Sem métricas avançadas.** Nada de porcentagem de conclusão, tendências, ranking.

### Tela 7 — Listagem de Projetos

- **Acesso:** autenticado com workspace.
- **Conteúdo [DOC]:** lista dos projetos do workspace; ação **"Novo Projeto"** (apenas Proprietário).
- **Estado vazio [DOC]:** sem projetos → estado vazio. **[SUGESTÃO]** com a ação de criar apenas para o Proprietário.
- **Criar projeto [DOC]:** o formulário tem **somente o campo nome** (1 a 150 caracteres). Projeto novo fica imediatamente visível para todos os membros.
- **Editar/remover [DOC]:** só Proprietário. Editar = renomear.
- **Remover projeto:** o banco apaga em cascata todas as tarefas do projeto (`ON DELETE CASCADE`). **[SUGESTÃO]** use um diálogo de confirmação que avise "As tarefas deste projeto também serão excluídas." (e, se possível, mostre quantas).
- **Item da lista [SUGESTÃO]:** nome do projeto; opcionalmente contagem de tarefas por status. Os documentos só exigem nome; não invente métricas.

### Tela 8 — Detalhe do Projeto

- **Acesso:** autenticado com workspace.
- **Conteúdo [DOC]:** as tarefas do projeto em **Kanban** ou **Lista**, com **filtros**; ação **"Nova Tarefa"** (Proprietário e Membro).
- **Alternância Kanban/Lista [DOC — RF-22]:** a **mesma tarefa** aparece nas duas visões. **[LACUNA]** visão padrão não definida; **[SUGESTÃO]** Kanban.
- **Kanban:**
  - 4 colunas fixas, nesta ordem: Pendente a iniciar, Em desenvolvimento, Em testes, Finalizado.
  - Cada coluna mostra o número de tarefas **[SUGESTÃO]**.
  - Mudança de status: **por controle próprio na tarefa** (botões avançar/retroceder, menu de ação), **respeitando um estágio por vez**. Arrastar e soltar **não** é citado nos documentos; se implementar, só permita soltar na coluna **adjacente** e só se o usuário tiver permissão. **[SUGESTÃO]** priorize botões/menus, que são o que a especificação descreve.
- **Lista:** tabela (ou cartões em telas pequenas) com as mesmas tarefas e colunas sugeridas: título, responsável, prioridade, status, prazo, tags.
- **Cartão de tarefa [SUGESTÃO] — conteúdo mínimo:** título; prioridade (selo); responsável (nome/avatar); prazo (data de calendário); tags (até 10, com truncamento "+N"); controle de status; menu de ações (editar, excluir) conforme permissão.
- **Filtros [DOC — RF-23]:** responsável, status, tag, **intervalo de datas aplicado ao prazo** (De / Até, ambos inclusivos). Filtros combinados aplicam-se em conjunto (**E lógico**). **[SUGESTÃO]** botão "Limpar filtros" e chips dos filtros ativos.
- **Filtro de tag [DOC]:** comparação **sem distinção de acentos e de maiúsculas** (`ação` = `acao` = `AÇÃO`).
- **Estados:** carregando (esqueleto), projeto sem tarefas (estado vazio, com "Nova Tarefa"), **filtro sem resultado** (mensagem distinta do vazio, com "Limpar filtros") **[SUGESTÃO]**, erro, projeto não encontrado (404).
- **Escala [DOC — RNF-08]:** o sistema considera até **1.000 tarefas por workspace**. O Kanban pede as tarefas por status com `size` até o máximo da API (100 por página).

### Tela 9 — Criação/Edição de Tarefa

- **Formato:** diálogo (modal) ou página. A especificação chama de "formulário". **[LACUNA]** escolha.
- **Campos [DOC]:**

| Campo | Tipo | Obrigatório | Regras |
|---|---|---|---|
| Título | texto | Sim | 1–200 caracteres |
| Descrição | texto longo | Não | até 5.000 caracteres |
| Prioridade | seleção (Baixa/Média/Alta) | Não | padrão **Média** quando não informada |
| Tags | entrada por **digitação** | Não | até **10** por tarefa; cada tag 1–50 caracteres (sem espaços nas pontas); criadas automaticamente se não existirem no workspace |
| Prazo | data de calendário | Não | formato `AAAA-MM-DD`, sem fuso |
| Responsável | seleção de membro | Sim (definido pelo sistema) | Proprietário escolhe qualquer membro (inclusive ele mesmo); Membro: fixo nele mesmo, **não editável** |

- **O formulário NÃO tem campo de status [DOC].** Na criação o status é sempre "Pendente a iniciar". A mudança de status acontece por **controle próprio na tarefa** (Kanban, Lista ou detalhe).
- **Na edição [DOC]:**
  - Editam-se: título, descrição, prioridade, tags e prazo.
  - **O projeto não é alterável.**
  - O **responsável só é alterável pelo Proprietário** (via ação específica de troca de responsável).
  - O status não é alterado aqui.
- **Campo de tags (comportamento) [SUGESTÃO] consistente com as regras [DOC]:**
  - Digitar e confirmar com Enter/vírgula cria uma "chip".
  - Sugerir tags já existentes do workspace enquanto digita (a API tem `GET /api/v1/tags` para isso).
  - Tag que difere só por acento/maiúscula de uma existente é **reutilizada** (`acao` quando `ação` existe).
  - Ao chegar em 10 tags, desabilitar a entrada e exibir aviso.
  - Isolamento: tags não são compartilhadas entre workspaces.
- **Erros [DOC]:** mais de 10 tags → `LIMITE_EXCEDIDO`; campo acima do limite → `TAMANHO_EXCEDIDO`; sem título → `OBRIGATORIO`; Membro tentando editar tarefa que não é sua → `ACESSO_NEGADO` (HTTP 403).

### Tela 9b — Detalhe da tarefa (apoio) **[SUGESTÃO]**

A especificação cita acessar a tarefa "via Kanban, Lista ou busca" e "controle próprio na tarefa (Kanban ou detalhe)", logo existe alguma visão de detalhe. Desenhe como painel lateral ou página com: título, descrição, projeto (somente leitura), responsável, autor **[SUGESTÃO]**, prioridade, status com controle avançar/retroceder, prazo, tags, ações editar/excluir/trocar responsável conforme permissão. Sem comentários, anexos ou subtarefas.

### Tela 10 — Membros do Workspace

- **Acesso:** Proprietário e Membro veem; só o Proprietário age.
- **Conteúdo [DOC]:**
  1. **Listagem de membros** (todos veem). **[SUGESTÃO]** nome, e-mail, papel (selo "Proprietário"/"Membro"), data de entrada.
  2. **Convidar** (Proprietário): campo de e-mail e botão.
  3. **Convites pendentes** (Proprietário): tabela com **e-mail, data de criação, expiração** e a ação **gerar novo convite**.
  4. **Remover** (Proprietário, **exceto a si mesmo** e exceto o Proprietário, que não pode ser removido).
- **Regras do convite [DOC]:**
  - Gera token único com validade de **2 dias**.
  - Um novo convite para o **mesmo e-mail** no mesmo workspace **invalida o anterior**.
  - **Não se pode convidar o e-mail de quem já pertence a um workspace** → rejeição com mensagem ao Proprietário (código `USUARIO_JA_PERTENCE_A_WORKSPACE`, HTTP 422). Vale também para e-mail já membro do **próprio** workspace.
  - Pode-se convidar o e-mail de uma conta que **existe sem workspace**.
  - Na V1 todo convite entra como **Membro**; não há seletor de papel.
  - O e-mail é enviado de forma assíncrona; se não chegar, o Proprietário gera um novo convite pela própria tela. **Não há reenvio automático.**
  - **[SUGESTÃO]** mostrar convites expirados na lista com um selo "Expirado" para dar sentido à ação de gerar novo (a especificação diz "pendentes", sem definir se expirados continuam listados; trate como lacuna).
- **Diálogo de remoção [DOC]:**
  1. Se o membro **tem tarefas sob sua responsabilidade**: o diálogo **lista essas tarefas** e **exige escolher o novo responsável** (outro membro do workspace **ou o próprio Proprietário**), com a opção rápida **"Atribuir todas a mim"**.
  2. Se **não tem tarefas**: apenas pede a **confirmação**.
  3. Ao confirmar, **uma única operação** reatribui as tarefas e remove o vínculo. Se qualquer etapa falhar, **nada** é alterado e o Proprietário é informado.
  4. Após remover: o membro some da lista; a conta dele continua existindo, sem workspace; as tarefas que ele **criou** continuam com ele como **autor**.
  5. Erro `REATRIBUICAO_OBRIGATORIA` (422) se confirmar sem informar o novo responsável quando há tarefas. Erro `PROPRIETARIO_NAO_REMOVIVEL` (422) se tentar remover o Proprietário.
  - **[SUGESTÃO]** o botão de confirmar fica desabilitado enquanto o novo responsável não for escolhido (quando houver tarefas). A lista de opções de novo responsável **exclui** o membro que está sendo removido.

### Tela 11 — Busca Global

- **Posição [DOC]:** campo de busca **no topo** da área autenticada.
- **Escopo [DOC — RF-24]:** busca por **título de tarefa**, **projeto** (nome) e **tags**, **somente no workspace do usuário**.
- **Comparação [DOC]:** ignora acentos e maiúsculas.
- **Resultados [DOC]:** tarefas e projetos. **[SUGESTÃO]** agrupe em duas seções (Projetos, Tarefas), mostre o trecho que casou, e ao clicar abra o projeto ou a tarefa.
- **Estados [SUGESTÃO]:** sem termo, buscando, sem resultados, com resultados, erro.

### Tela 12 — Configurações de Perfil

- **Acesso:** Proprietário e Membro, pelo menu do usuário.
- **Conteúdo [DOC]:**
  - **Nome** (editável, 1–100).
  - **E-mail** (exibido, **sem possibilidade de edição**).
  - Alteração de **senha**: **senha atual**, **nova senha** e **confirmação**.
- **Regras [DOC — RF-26]:** a alteração de senha **exige a senha atual correta** (erro `SENHA_ATUAL_INCORRETA`, 422) e segue a política RT-01. Nada mais é configurável (não há tema, notificações, idioma, workspace etc.).
- **[LACUNA]** Não está definido se nome e senha são salvos em formulários separados. **[SUGESTÃO]** duas seções independentes ("Dados do perfil" e "Alterar senha"), cada uma com seu botão salvar.

### Tela 13 — Sem Workspace

- **Acesso:** usuário autenticado **sem** workspace (ex.: membro removido).
- **Conteúdo [DOC]:** informa que **não faz parte de nenhum workspace**; **orienta a solicitar um convite ao Proprietário**; oferece o botão **"Sair"**.
- **Restrições [DOC]:** não dá acesso às demais telas; não permite criar workspace.
- Saída dessa situação: o Proprietário gera um novo convite para o e-mail da conta; a pessoa abre o link, autentica (tela 2C) e entra como Membro.

### Telas auxiliares recomendadas **[SUGESTÃO]**

Não estão nas 13, mas ajudam a referência: 404 (página não encontrada); erro genérico 500; "sem permissão" (para quando o Membro abre uma ação proibida); sessão expirada.

---

## 8. Componentes reutilizáveis (catálogo)

Todos recriados com widgets/elementos próprios; a implementação final recriará cada um.

| Componente | Uso | Observações |
|---|---|---|
| Barra lateral | Navegação | Itens: Dashboard, Projetos, Membros, Configurações |
| Layout autenticado | Estrutura geral | Lateral + topo + conteúdo |
| Campo de busca global | Topo | Resultados em painel/lista |
| Menu do usuário | Topo | Configurações de Perfil, Sair |
| Cartão de estatística | Dashboard | Rótulo do status + número |
| Cartão de tarefa | Kanban, Lista, "Minhas tarefas" | Ver conteúdo mínimo na tela 8 |
| Coluna Kanban | Detalhe do projeto | Título + contagem + cartões |
| Tabela/lista de tarefas | Detalhe do projeto | Responsiva |
| Selo de status | Tarefa | 4 variações |
| Selo de prioridade | Tarefa | 3 variações |
| Selo de papel | Membros | Proprietário/Membro |
| Avatar/identificador de usuário | Responsável, membros | Pode usar iniciais |
| Campo de tags (chips + sugestões) | Formulário de tarefa | Máx. 10 |
| Seletor de responsável | Formulário, remoção de membro | Lista de membros |
| Seletor de data (prazo) | Formulário, filtros | Data de calendário |
| Barra de filtros | Detalhe do projeto | Responsável, status, tag, prazo De/Até |
| Diálogo de confirmação | Excluir tarefa/projeto, remover membro | Variante com lista de tarefas e seletor |
| Estado vazio | Dashboard, projetos, tarefas, busca | Ícone + texto + ação opcional |
| Esqueleto de carregamento | Todas as listas | |
| Banner/alerta de erro | Formulários e telas | Mensagem + tentar novamente |
| Notificação efêmera (toast) | Sucesso/erro de ação | |
| Campo de formulário com erro inline | Todos | Rótulo, ajuda, erro |
| Botão (primário, secundário, destrutivo, carregando) | Todos | |

---

## 9. Estados que cada tela deve cobrir (checklist)

Para cada tela e componente com dados, a galeria de estados deve mostrar:

| Estado | Quando |
|---|---|
| Carregando | Esperando dados |
| Vazio | Sem dados (sem projetos, sem tarefas, sem convites, sem resultados) |
| Preenchido | Dados normais |
| Erro | Falha de carregamento ou de ação |
| Enviando | Formulário em andamento |
| Validação | Erros por campo |
| Sem permissão | Ação proibida para o papel |
| Dados extremos | Texto longo, muitos itens, 10 tags, título de 200 caracteres |

Estados específicos importantes: Login com credencial inválida; Cadastro com e-mail duplicado; Convite (válido-novo-usuário, válido-conta-existente, inválido); Recuperação (confirmação genérica); Redefinição (token válido/inválido/sucesso); Dashboard (vazio, com dados, zeros); Detalhe do projeto (vazio, filtro sem resultado); Membros (sem convites pendentes, diálogo de remoção com e sem tarefas); Sem Workspace.

---

## 10. Fluxos de usuário (roteiros de navegação)

Implemente o mock de modo que cada fluxo possa ser percorrido de ponta a ponta.

### 10.1 Criação de conta sem convite
1. Abre `/cadastro`, informa nome, e-mail e senha (conforme a política).
2. O sistema cria a conta e, **na mesma operação**, o workspace "Workspace de {nome}" e o vínculo de Proprietário.
3. Inicia a sessão automaticamente.
4. Vai ao Dashboard (workspace vazio) ou à tela provisória.
- Falhas: e-mail duplicado (409), senha fora da política, campos acima dos limites. **Nenhuma conta/workspace é criado se algo falhar.**

### 10.2 Convite e criação de conta por convite
1. Proprietário abre Membros e informa o e-mail. Se o e-mail já pertence a um workspace, o convite é **rejeitado** com mensagem.
2. O sistema gera o convite (token, 2 dias), **invalida o anterior pendente** do mesmo e-mail e envia o e-mail com link exclusivo.
3. A pessoa abre o link. Sem conta: nome e senha. Com conta sem workspace: só autenticação (fluxo 10.9).
4. Ao concluir, é vinculada como **Membro**, o convite vira "utilizado".
5. Sessão automática e Dashboard (ou tela provisória), com os projetos já visíveis.

### 10.3 Criação de projeto
1. Proprietário abre Projetos e clica "Novo Projeto".
2. Informa o nome.
3. O projeto aparece, imediatamente visível para todos.

### 10.4 Criação de tarefa
1. Usuário abre o Detalhe do Projeto e clica "Nova Tarefa".
2. Preenche título, descrição, prioridade, tags e prazo. Proprietário também escolhe o responsável; para o Membro o responsável é ele mesmo.
3. Tags novas são criadas; as existentes são reutilizadas.
4. A tarefa nasce em "Pendente a iniciar" e aparece na coluna correspondente do Kanban e na Lista.

### 10.5 Atualização de status
1. O responsável (ou o Proprietário) abre a tarefa (Kanban, Lista ou busca).
2. Avança ou retrocede **um estágio**. Saltar estágios é rejeitado (`TRANSICAO_STATUS_INVALIDA`, 422). Falta de permissão é `ACESSO_NEGADO` (403), **nunca** 422.
3. A mudança aparece de imediato no Dashboard e na visão do projeto.

### 10.6 Recuperação de senha
1. No login, "Esqueci minha senha" e informa o e-mail.
2. O sistema gera token (30 min, uso único; invalida anteriores não usados) e envia e-mail com "Redefinir minha senha".
3. Mostra **sempre** a mesma mensagem genérica.
4. O usuário abre o link: token válido → formulário (nova senha + confirmação); inválido → "link não é mais válido".
5. Valida política e coincidência; salva; invalida o token; mostra sucesso; vai ao login.

### 10.7 Convite expirado ou inválido
1. Abre `/invite/{token}` de convite expirado, inexistente, usado ou invalidado.
2. O sistema impede criar conta e vincular.
3. Mostra "Este convite expirou" + orientação + "Voltar para o login".
4. Só o Proprietário gera novo convite, na tela Membros.

### 10.8 Remoção de membro com reatribuição
1. Proprietário abre Membros e clica "Remover" (não aparece para o próprio Proprietário).
2. Com tarefas: lista as tarefas e pede o novo responsável (outro membro ou o Proprietário; atalho "Atribuir todas a mim"). Sem tarefas: só confirma.
3. Confirma.
4. Uma única operação reatribui e remove. Falha = nada muda.
5. O membro some da lista. A conta continua existindo, sem workspace.

### 10.9 Usuário sem workspace e aceite por conta existente
1. O usuário removido, ao autenticar-se (ou na próxima interação), vai a "Sem Workspace" e só pode "Sair".
2. O Proprietário gera novo convite para o e-mail dessa conta.
3. O usuário abre o link; a página pede **só a senha** e mostra e-mail e workspace do convite.
4. Token válido + senha correta → vinculado como Membro, convite usado, Dashboard (ou tela provisória).
5. Token inválido → fluxo 10.7.

### 10.10 Logout [DOC — RF-38]
O menu do usuário tem "Sair". Ao sair, o token de renovação é revogado e os recursos protegidos deixam de ser acessíveis até novo login. Retorna ao login.

---

## 11. Mensagens, erros e como a interface deve reagir

### 11.1 Formato de erro da API [DOC]

Todo erro vem em `application/problem+json` (RFC 7807):

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

**Regra do cliente [DOC]:** o comportamento da interface depende **só do campo `codigo`**, nunca do texto de `detail`.

### 11.2 Uso dos códigos HTTP [DOC]

| Status | Quando |
|---|---|
| 400 | Requisição malformada ou campos inválidos (formato, tamanho, limites, obrigatoriedade, política de senha) |
| 401 | Sem token, token inválido/expirado, credenciais inválidas |
| 403 | Sem permissão (papel ou posse) ou sem workspace |
| 404 | Recurso inexistente **ou de outro workspace** (não revela a existência) |
| 409 | Conflito de unicidade (e-mail já cadastrado) |
| 422 | Regra de **negócio** violada por quem tem permissão. **Nunca** para falta de permissão |
| 500 | Erro inesperado, corpo genérico |

**Ordem de avaliação [DOC]:** 404 → 403 → 400 → 422. O primeiro que falhar define a resposta.

### 11.3 Catálogo de códigos de negócio e reação da interface

| Código | HTTP | Onde ocorre | Reação sugerida da interface **[SUGESTÃO]** |
|---|---|---|---|
| `VALIDACAO` | 400 | Qualquer formulário | Marcar cada campo de `erros[]` |
| `NAO_AUTENTICADO` | 401 | Token ausente/inválido/expirado | Disparar renovação silenciosa (seção 13); se falhar, ir ao login |
| `CREDENCIAIS_INVALIDAS` | 401 | Login | Mensagem genérica; **não** renovar token |
| `ACESSO_NEGADO` | 403 | Ação sem permissão | Toast/aviso "Você não tem permissão para esta ação." |
| `SEM_WORKSPACE` | 403 | Qualquer recurso de workspace | Redirecionar a "Sem Workspace" |
| `RECURSO_NAO_ENCONTRADO` | 404 | Projeto/tarefa inexistente ou de outro workspace | Tela de não encontrado |
| `EMAIL_JA_CADASTRADO` | 409 | Cadastro | Erro no campo e-mail |
| `USUARIO_JA_PERTENCE_A_WORKSPACE` | 422 | Convidar | Mensagem ao Proprietário no formulário de convite |
| `CONVITE_INVALIDO` | 422 | Abrir/aceitar convite | Tela 3 |
| `TOKEN_RECUPERACAO_INVALIDO` | 422 | Redefinir senha | Mensagem "link não é mais válido" |
| `SENHA_ATUAL_INCORRETA` | 422 | Configurações | Erro no campo senha atual |
| `TRANSICAO_STATUS_INVALIDA` | 422 | Mudar status | Aviso; na prática a interface só oferece estágios adjacentes |
| `PROPRIETARIO_NAO_REMOVIVEL` | 422 | Remover membro | Aviso; o botão nem deveria aparecer |
| `REATRIBUICAO_OBRIGATORIA` | 422 | Remover membro com tarefas | Erro no seletor de novo responsável |

---

## 12. E-mails (apoio visual opcional)

**[DOC]** O sistema envia dois e-mails em HTML simples. Opcionalmente, desenhe-os como "pré-visualização" na galeria.

| E-mail | Botão (texto literal) | Link |
|---|---|---|
| Convite (RF-06) | **"Criar minha conta"** | `https://app.taskflow.com/invite/{token}` (em desenvolvimento, endereço local; base vem de `APP_BASE_URL`) |
| Recuperação de senha (RF-32) | **"Redefinir minha senha"** | Página de redefinição com o token |

- O token vai no **link do aplicativo**; ao chamar a API, o cliente repassa o token **no corpo** de um `POST`, nunca em query string ou caminho da API.
- A validade do convite é 2 dias; a da recuperação, 30 minutos. **[SUGESTÃO]** o e-mail menciona essa validade.

---

## 13. Regras técnicas que alteram o comportamento visível

Resumo apenas do que afeta a experiência; você não precisa implementar o backend.

### 13.1 Sessão [DOC]
- Token de acesso (JWT) de **15 minutos**; refresh token de **7 dias**, com rotação.
- O papel e o workspace **não** vão no token; o backend consulta o vínculo **a cada requisição**. Por isso, a remoção de um membro tem efeito imediato: a próxima requisição dele devolve `403 SEM_WORKSPACE`.
- Login e cadastro respondem com um objeto de tokens:

```json
{
  "tipo": "Bearer",
  "accessToken": "…",
  "accessTokenExpiraEm": "2026-10-15T20:15:00Z",
  "refreshToken": "…",
  "refreshTokenExpiraEm": "2026-10-22T20:00:00Z"
}
```

### 13.2 Renovação transparente (cliente) [DOC]
Se quiser demonstrar o comportamento no mock:
- Só um `401` com `codigo = NAO_AUTENTICADO` dispara a renovação. Outros 401 (ex.: `CREDENCIAIS_INVALIDAS`) **não**.
- Há **uma única renovação por vez** (fila). As requisições que falharam aguardam e são repetidas **uma vez** com o novo token.
- A chamada de renovação nunca dispara nova renovação. Um 401 nela encerra a sessão e leva ao login.
- Abas simultâneas: antes de encerrar a sessão por falha, o cliente confere se o refresh token armazenado mudou (outra aba pode ter renovado). Se mudou, tenta de novo uma vez.
- Tolerância de reuso do refresh token: 10 segundos.
- **[SUGESTÃO]** na referência, uma tela/aviso "Sessão expirada" pode ilustrar o resultado.

### 13.3 Datas e horas [DOC]
- API: data e hora em **UTC ISO-8601 com `Z`** (ex.: `2026-10-15T20:00:00Z`). O cliente exibe em **America/Sao_Paulo (UTC−03:00)**.
- **`prazo` é data de calendário** (`AAAA-MM-DD`), **sem horário e sem conversão de fuso**. Exiba exatamente o dia recebido (cuidado: interpretar `2026-11-30` como UTC e converter pode mostrar 29/11).
- Campos de data e hora na interface: data de criação e expiração dos convites; data de entrada de membros **[SUGESTÃO]**.
- **[SUGESTÃO]** exibição `dd/MM/aaaa` e `dd/MM/aaaa HH:mm`. Idioma pt-BR.

### 13.4 Acentos e maiúsculas [DOC]
- Tags: `ação` e `acao` são a **mesma tag**.
- Busca global e filtro por tag ignoram acentos e maiúsculas.
- Unicidade de e-mail ignora maiúsculas; o e-mail é normalizado em minúsculas.

### 13.5 Paginação [DOC]
Coleções são paginadas: `page` (a partir de 0), `size` (padrão 20, máximo 100), `sort`.

```json
{ "conteudo": [ { "id": 1 } ], "pagina": 0, "tamanho": 20, "totalElementos": 1, "totalPaginas": 1 }
```

**[SUGESTÃO]** mostre paginação ou "carregar mais" nas listas longas (membros, tarefas na Lista, resultados de busca). O Kanban pede uma coluna por vez.

### 13.6 Segurança visível
- Senhas e tokens nunca aparecem em log nem na interface.
- Falha de login sempre genérica. Recuperação de senha sempre genérica.
- Recursos de outro workspace → 404 (a interface trata como "não encontrado").
- Sem limite de tentativas (rate limiting) na V1; não desenhe bloqueio por tentativas.

---

## 14. Modelo de dados (como os dados aparecem na tela)

Use estas formas nos mocks. Campos da API em `camelCase`; ids numéricos.

| Entidade | Campos relevantes |
|---|---|
| `usuario` | `id`, `nome` (≤100), `email` (≤150, único, imutável), `criadoEm` |
| `workspace` | `id`, `nome` (≤150; padrão "Workspace de {nome}"), `criadoEm` |
| vínculo usuário–workspace | `usuarioId` (único: 1 workspace por usuário), `workspaceId`, `papel` (`PROPRIETARIO`/`MEMBRO`), `criadoEm` |
| `convite` | `id`, `emailConvidado`, `workspaceId`, `criadoEm`, `expiraEm` (= criação + 2 dias), `utilizado`, `invalidado` |
| `projeto` | `id`, `nome` (≤150), `workspaceId`, `criadoEm` |
| `tarefa` | `id`, `titulo` (≤200), `descricao` (≤5000, opcional), `prioridade` (padrão `MEDIA`), `status` (padrão `PENDENTE_A_INICIAR`), `prazo` (data, opcional), `projetoId`, `responsavelId` (obrigatório), `autorId` (obrigatório), `criadoEm`, `tags` (lista de nomes) |
| `tag` | `id`, `workspaceId`, `nome` (≤50, minúsculas, sem espaços nas pontas) |

Regras de integridade que a interface deve respeitar:
- Convite **válido** = não utilizado, não invalidado e antes da expiração.
- Exatamente 1 Proprietário por workspace.
- Toda tarefa tem 1 responsável e 1 autor.
- Excluir projeto exclui suas tarefas; excluir tarefa remove seus vínculos de tag (a tag em si permanece).
- Excluir/remover membro: mantém a conta; tarefas criadas por ele continuam com ele como **autor**.
- Exclusão **física** (sem lixeira, sem desfazer): **[SUGESTÃO]** use confirmação em ações destrutivas.

---

## 15. Contratos de API úteis para os mocks

**[DOC]** Os documentos fixam as **convenções**; os endpoints exatos são fechados nos contratos de cada história. O que já está definido:

| Endpoint | Observação |
|---|---|
| `/api/v1/auth` | Família de autenticação (cadastro, login, renovação, logout, recuperação). Caminhos finais **[LACUNA]** |
| `POST /api/v1/convites/validar` | Valida o token do convite antes do cadastro/aceite. **Token no corpo** |
| `POST /api/v1/convites/aceitar` (previsto) | Aceite por conta existente sem workspace |
| `/api/v1/workspace`, `/api/v1/membros`, `/api/v1/convites` | Membros e convites |
| `/api/v1/projetos` | Projetos |
| `/api/v1/tarefas` e `/api/v1/projetos/{projetoId}/tarefas` | Tarefas |
| `PATCH /api/v1/tarefas/{id}/status` | Mudança de status. Corpo: `{ "status": "EM_DESENVOLVIMENTO" }` |
| `PATCH /api/v1/tarefas/{id}/responsavel` | Troca de responsável (Proprietário) |
| `GET /api/v1/tags` | Tags do workspace, para sugestão |
| `/api/v1/busca` | Busca global (parâmetro `q`) |
| `/api/v1/dashboard` | Contagens |
| `/api/v1/perfil` | Nome e senha do próprio usuário |

Convenções [DOC]: sucesso `200/201/202/204`; criação devolve `201` com `Location`; edição `PUT` (`200`); alteração parcial `PATCH` (`200`); remoção `DELETE` (`204`); logout `POST` (`204`).

**Parâmetros de filtro das listagens [DOC]:** `responsavelId`; `status` (repetível); `tag`; `prazoDe`, `prazoAte` (`AAAA-MM-DD`, inclusivos); `q`. Combinados com E lógico.

**Exemplo documentado de mudança de status:**
Requisição `PATCH /api/v1/tarefas/42/status` com `{ "status": "EM_DESENVOLVIMENTO" }` → `200` com `{ "id": 42, "titulo": "Montar relatório", "status": "EM_DESENVOLVIMENTO", "prazo": "2026-11-30" }`.
Salto de estágio → `422`, `codigo: "TRANSICAO_STATUS_INVALIDA"`.

---

## 16. Conjunto de dados fictícios sugerido (mock)

**[SUGESTÃO]** Use um workspace com variedade suficiente para exercitar todas as telas.

### 16.1 Usuários e workspace
- Workspace: **"Workspace de Maria Silva"** (id 1).
- Maria Silva — Proprietária (`maria@exemplo.com`).
- João Pereira — Membro.
- Ana Costa — Membro (sem tarefas, para testar a remoção sem reatribuição).
- Carlos Souza — conta **sem workspace** (para o fluxo 2C e "Sem Workspace").

### 16.2 Projetos
- "Lançamento do site" (com muitas tarefas, todos os status).
- "Campanha de marketing" (poucas tarefas).
- "Backlog técnico" (vazio, para o estado vazio).
- Mais um projeto com nome de 150 caracteres (limite).

### 16.3 Tarefas (variações a cobrir)
- Uma em cada status, em mais de um projeto.
- Prioridades Baixa, Média (padrão) e Alta.
- Com e sem prazo; uma com prazo já passado (a especificação não define destaque de atraso; **não invente regra**, apenas exiba a data).
- Uma com **10 tags** (limite) e uma sem tags.
- Uma com **título de 200 caracteres** e uma com **descrição próxima de 5.000**.
- Tags com acento (`ação`, `urgência`) e maiúsculas, para a busca/filtro sem acento.
- Uma tarefa em que **autor ≠ responsável** (João criou, Maria responsável).
- Tarefas do João (para a remoção com reatribuição) e do Membro logado (para "Minhas tarefas").

### 16.4 Convites
- Um pendente válido; um expirado; um já usado; um invalidado por convite mais novo. Servem para as variações da tela 3 e da lista de pendentes.

### 16.5 Cenários para o alternador de dev
| Cenário | Efeito |
|---|---|
| Logar como Proprietário | Vê tudo |
| Logar como Membro | Vê as restrições |
| Logar como sem workspace | Vai a "Sem Workspace" |
| Latência / lista vazia / erro forçado | Alimenta os estados |
| Token de convite válido (novo usuário) / (conta existente) / inválido | Variações da tela 2 e 3 |
| Token de recuperação válido / inválido | Variações da tela 5 |

---

## 17. Decisões visuais: o que fica a seu critério

**[LACUNA]** Os documentos **não** definem identidade visual. Você decide, **registrando as escolhas em tokens**:
- Paleta, tipografia, tamanho de componentes, raios, sombras, ícones.
- Modo claro/escuro (não exigido na V1; **[SUGESTÃO]** só claro, a menos que queira oferecer os dois).
- Biblioteca de componentes (livre, desde que a saída seja legível como referência visual).
- Escolhas de interação não especificadas: arrastar-e-soltar no Kanban, diálogo versus página na criação de tarefa, visão padrão (Kanban/Lista).

Qualquer escolha deve respeitar: **sem rolagem horizontal da página em 360/768/1280 px**, rótulos acessíveis nos campos, botões com texto ou rótulo de acessibilidade, e feedback claro de carregando/erro/sucesso.

---

## 18. O que NÃO deve existir na referência (itens ignorados)

Itens que **não** entram na V1 e não devem ser desenhados:

| Item | Decisão |
|---|---|
| Relatórios e métricas avançadas | ❌ Fora da V1 |
| Parâmetros/cargos | ❌ Fora (V2). Não implementar |
| Gráfico de atividade, anel de progresso | ❌ Fora da V1 |
| Métricas de projeto, visão por unidades | ❌ Fora da V1 |
| Troca rápida de projeto | ❓ Não está na especificação. Não implementar |
| Edição em linha de campos | ❓ A edição é por formulário. Não implementar |
| Subtarefas, comentários, anexos, tipos de tarefa | ❌ Fora da V1 |
| Itens de menu além de Dashboard, Projetos, Membros, Configurações | ❌ Não incluir |
| Cargos e permissões personalizados | ❌ V2 |
| Criar/editar workspace, transferir propriedade | ❌ V2 |
| Alterar e-mail da conta | ❌ Fora da V1 |
| Mover tarefa entre projetos | ❌ V2 |
| Notificações, integração com IA | ❌ Fora da V1 |
| Campo de status no formulário de tarefa | ❌ Proibido. Status só muda por controle próprio |


---

## 19. Ordem de construção sugerida e critérios de aceite da referência

**[SUGESTÃO]** Ordem (acompanha o backlog do projeto: fundação → auth → membros → projeto → tarefa → busca-filtros → dashboard → configurações):

1. Tokens de design, leiaute autenticado, componentes básicos.
2. Telas públicas: 1, 2 (A/B/C), 3, 4, 5.
3. Sem Workspace e guardas de rota (13).
4. Membros (10), incluindo diálogo de remoção.
5. Projetos (7) e Detalhe (8) com Kanban e Lista.
6. Formulário de tarefa (9) e detalhe da tarefa.
7. Filtros e busca global (11).
8. Dashboard (6) e tela inicial provisória.
9. Configurações (12).
10. Galeria de estados, alternador de papel, revisão de responsividade e acessibilidade.

**A referência está pronta quando:**
- As 13 telas existem, nas variações descritas, com os textos literais corretos.
- Cada papel mostra exatamente as ações permitidas (seção 3.6).
- Todos os estados da seção 9 podem ser vistos sem manipular o código.
- Os 10 fluxos da seção 10 podem ser percorridos.
- Kanban, Lista e Dashboard leem a mesma fonte de dados (RNF-07).
- Nenhuma tela exibe elementos da lista de ignorados (seção 18).
- Não há rolagem horizontal da página em 360, 768 e 1280 px.
- O código visual está separado da camada de mock e dos tokens de design.

---

## 20. Pontos em aberto reunidos (decisões que você deve registrar)

| # | Lacuna | Como tratar |
|---|---|---|
| 1 | Conteúdo da tela inicial provisória | Proponha, rotule como provisória |
| 2 | Formato da resposta de validação do convite (conta existente? nome do workspace?) | Simule e documente o formato usado no mock |
| 3 | Visão padrão do detalhe do projeto (Kanban ou Lista) | Escolha e registre |
| 4 | Criação/edição de tarefa: diálogo ou página | Escolha e registre |
| 5 | Detalhe da tarefa: painel ou página | Escolha e registre |
| 6 | Convites expirados continuam na lista de "pendentes"? | Mostre com selo "Expirado" ou oculte; registre |
| 7 | Nome e senha no mesmo formulário ou em separados | Duas seções recomendadas |
| 8 | Ação "Criar primeiro projeto" para Membro | Oculta recomendada |
| 9 | Ordenação padrão das listas | Defina (ex.: criação, mais recentes primeiro) e registre |
| 10 | Destaque visual para tarefas com prazo vencido | Não definido pelos documentos; não crie regra de negócio, apenas exiba a data |
| 11 | Identidade visual (paleta, tipografia, componentes) | Seu critério, em tokens |
| 12 | Arrastar-e-soltar no Kanban | Não definido; prefira botões/menus |
| 13 | Confirmação de senha no cadastro | Não citada; recomendada ausente |

---

## 21. Resumo das regras de negócio mais críticas (cola rápida)

1. 1 usuário = no máximo 1 workspace. Sem workspace = só "Sem Workspace" + "Sair".
2. Cadastro sem convite cria usuário + workspace "Workspace de {nome}" + Proprietário, tudo ou nada.
3. Convite: 2 dias, só entra como Membro, novo convite invalida o anterior, não convida quem já está em workspace, não há reenvio automático.
4. Convite inválido (expirado/usado/invalidado/inexistente) = mesma tela "Este convite expirou".
5. Proprietário nunca é removido; remover membro reatribui tarefas na mesma operação (ou nada acontece); a conta do removido continua, sem workspace; autoria das tarefas é preservada.
6. Membro: vê tudo do workspace, cria tarefas (responsável = ele), edita só as que criou ou das quais é responsável, muda status só das que é responsável, nunca remove tarefa, nunca troca responsável, nunca administra projetos/membros.
7. Proprietário: tudo, inclusive escolher/trocar responsável e excluir.
8. Status: 4 estágios, 1 por vez, avançar ou retroceder. Formulário de tarefa não tem status.
9. Prioridade padrão Média. Até 10 tags por tarefa. Tags por workspace, sem distinção de acento/maiúsculas.
10. Senha: ≥8 caracteres, ≤72 bytes UTF-8, 1 letra e 1 número; troca de senha exige a senha atual.
11. Recuperação de senha e login nunca revelam se o e-mail existe. Token de recuperação: 30 minutos, uso único.
12. Datas/horas em UTC na API, exibidas em America/Sao_Paulo; `prazo` é data de calendário sem fuso.
13. Kanban, Lista e Dashboard sempre consistentes.
14. A interface apenas oculta ações; o backend decide. Falta de permissão = 403; salto de estágio/convite inválido = 422; recurso de outro workspace = 404.
15. Responsividade em 360/768/1280 px sem rolagem horizontal da página.

---

*Fim do briefing. Se uma situação não estiver coberta, não invente regra de negócio: registre como lacuna (seção 20) e escolha a opção visual mais simples.*
