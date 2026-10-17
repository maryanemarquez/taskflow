# TaskFlow — Especificação V1

## 1. O que é

TaskFlow é uma aplicação web SaaS de gestão de tarefas e projetos, com dois modos de uso: Modo Pessoal (organização individual) e Modo Equipe (gestão colaborativa). Esta especificação cobre exclusivamente a **V1**, que constrói apenas o **Modo Equipe**, com escopo mínimo funcional. Na V1, a aplicação é entregue como aplicação web (Flutter Web).

O sistema organiza o trabalho em uma hierarquia simples: um **Workspace** contém **Projetos**, e cada Projeto contém **Tarefas**.

## 2. Objetivo da V1

Entregar a base funcional mínima do TaskFlow: um usuário consegue criar sua conta, ter um workspace, criar projetos, convidar colegas, criar e acompanhar tarefas até a conclusão. Não há nesta versão: subtarefas, tarefas refinadas (story/casos de teste), comentários, anexos, cargos customizados, relatórios/métricas avançadas, notificações ou integração com IA — tudo isso é incremental em V2 e V3.

## 3. Papéis

Na V1 existem apenas dois papéis fixos, sem customização (cargos customizados só existem a partir da V2):

- **Proprietário** — dono do workspace, acesso administrativo total.
- **Membro** — participante do workspace, acesso operacional restrito ao que cria ou ao que é de sua responsabilidade.

Um usuário que não pertence a nenhum workspace (ex.: membro removido) não possui papel e acessa apenas a tela "Sem Workspace" (ver seção 6, Tela 13).

### 3.1 Projetos

| Permissão | Proprietário | Membro |
|---|---|---|
| Visualizar projetos | Todos do workspace | Todos do workspace (acesso automático) |
| Criar projetos | Sim | Não |
| Editar projetos | Sim | Não |
| Remover projetos | Sim | Não |

### 3.2 Tarefas

| Permissão | Proprietário | Membro |
|---|---|---|
| Visualizar tarefas | Todas do workspace | Todas do workspace |
| Criar tarefas | Em qualquer projeto | Em qualquer projeto do workspace |
| Definir responsável ao criar a tarefa | Qualquer membro do workspace, inclusive ele mesmo | Não escolhe: o responsável é definido automaticamente como ele mesmo |
| Editar tarefas (título, descrição, prioridade, tags e prazo) | Qualquer tarefa | Apenas as próprias (das quais é autor) ou sob sua responsabilidade |
| Remover tarefas | Qualquer tarefa | Não |
| Alterar responsável de tarefa existente | Sim | Não |
| Alterar status da tarefa (um estágio por vez, avançando ou retrocedendo) | Qualquer tarefa | Das quais é responsável |
| Alterar data de entrega (prazo) | Sim | Sim (regra geral de edição de tarefa) |
| Mover tarefa para outro projeto | Não (fica para a V2) | Não (fica para a V2) |

### 3.3 Membros

| Permissão | Proprietário | Membro |
|---|---|---|
| Visualizar membros do workspace | Sim | Sim |
| Convidar membros para o workspace | Sim | Não |
| Visualizar convites pendentes e gerar novo convite | Sim | Não |
| Remover membros do workspace | Sim (exceto a si mesmo) | Não |

### 3.4 Métricas

| Permissão | Proprietário | Membro |
|---|---|---|
| Ver dashboard simplificado (contagem de tarefas do workspace por status) | Sim | Sim |
| Ver "Minhas tarefas" (contagem das tarefas sob sua responsabilidade, por status) | Sim | Sim |

### 3.5 Configurações

| Permissão | Proprietário | Membro |
|---|---|---|
| Editar próprio perfil/conta (nome e senha) | Sim | Sim |

A administração do workspace (ex.: edição do nome, transferência de propriedade) não existe na V1 e fica para a V2. Convidar e remover membros é feito na tela Membros (ver seção 3.3).

**Resumo:** Proprietário tem acesso total e irrestrito a tudo que existe na V1. Membro tem leitura ampla (tudo do seu workspace) e escrita restrita ao que ele mesmo cria ou ao que é sua responsabilidade — nunca administra o workspace.

## 4. Estrutura técnica de domínio

```
Usuário
  └─ pertence a no máximo 1 Workspace (V1)
  └─ pode ficar sem workspace (ex.: membro removido)

Workspace
  └─ tem exatamente 1 Proprietário (quem criou), que não pode ser removido
  └─ tem 0 ou mais Membros
  └─ tem 0 ou mais Projetos
  └─ tem Tags próprias (não compartilhadas com outros workspaces)

Projeto
  └─ nome
  └─ membros: todos os membros do workspace têm acesso automático (sem vínculo seletivo)
  └─ tem 0 ou mais Tarefas

Tarefa
  └─ tipo: Simples (único tipo existente na V1)
  └─ título, descrição, projeto, responsável, prioridade, status, tags, prazo
  └─ status: Pendente a iniciar ↔ Em desenvolvimento ↔ Em testes ↔ Finalizado
```

### Regras de negócio

- Um usuário pertence a no máximo um workspace na V1.
- Quem cria conta sem convite vira automaticamente Proprietário do seu próprio workspace, nomeado "Workspace de {nome do usuário}".
- Quem cria conta a partir de um convite entra automaticamente como Membro do workspace que o convidou.
- Quem já possui conta e não pertence a nenhum workspace entra como Membro ao aceitar um convite.
- Não é possível convidar o e-mail de um usuário que já pertença a um workspace.
- Não é possível, na V1, criar um workspace adicional depois do cadastro: o usuário sem workspace só ingressa em um por convite.
- Todo membro do workspace tem acesso automático a todos os projetos e tarefas daquele workspace.
- Não há vínculo seletivo membro↔projeto na V1 (chega na V2, com o convite de projeto).
- O Proprietário não pode ser removido do workspace.
- Ao remover um membro, todas as tarefas sob sua responsabilidade são reatribuídas na mesma operação; a conta do membro removido é mantida, sem workspace.
- O status da tarefa muda um estágio por vez, avançando ou retrocedendo, sem pular estágios.
- Toda tarefa tem um responsável. Quando criada por um Membro, ele é o responsável; a atribuição e a alteração do responsável cabem ao Proprietário.
- Tags pertencem ao workspace e são criadas ao serem digitadas na tarefa. Cada tarefa tem no máximo 10 tags.
- A prioridade da tarefa, quando não informada, é Média.
- A senha segue a política: mínimo de 8 caracteres e máximo de 72 bytes em UTF-8, com pelo menos 1 letra e 1 número.
- Os limites de tamanho dos campos (nome, título, descrição, tags) estão no documento de Requisitos (RT-04).

## 5. Funcionalidades

### Autenticação
- Cadastro de conta (nome, e-mail, senha), com início de sessão automático.
- Login por e-mail e senha.
- Logout.
- Recuperação de senha por e-mail, com token de validade limitada (30 minutos) e uso único.
- Controle de sessão (token de acesso de curta duração e token de renovação revogável).

### Workspace
- Criação automática do workspace ao cadastrar-se sem convite, com nome padrão "Workspace de {nome do usuário}".
- Convite de novo membro ao workspace, feito pelo Proprietário, via e-mail (token de 2 dias). Um novo convite para o mesmo e-mail invalida o anterior.
- Aceite de convite por quem já tem conta e está sem workspace.
- Listagem de membros e de convites pendentes.
- Remoção de membro pelo Proprietário, com reatribuição das tarefas sob responsabilidade do membro.
- Tela informativa para o usuário sem workspace.

### Projetos
- Criação de projeto: nome.
- Listagem de projetos do workspace, com estado vazio quando não houver projetos.
- Edição e remoção de projeto (Proprietário).

### Tarefas
- Criação de tarefa do tipo Simples: título, descrição, projeto, responsável, prioridade (padrão Média quando não informada), tags (até 10 por tarefa), prazo. O status inicial é sempre "Pendente a iniciar".
- Tags informadas por digitação (até 10 por tarefa), criadas automaticamente quando não existirem no workspace.
- Edição de tarefa (título, descrição, prioridade, tags e prazo).
- Exclusão de tarefa (Proprietário).
- Visualização em Kanban (agrupado por status) e em Lista.
- Mudança de status ao longo do fluxo, um estágio por vez, avançando ou retrocedendo: Pendente a iniciar ↔ Em desenvolvimento ↔ Em testes ↔ Finalizado.

### Filtros e busca
- Filtros por responsável, status, categoria/tag, data inicial e final (aplicadas ao prazo da tarefa).
- Busca global por título de tarefa, projeto e tags, no escopo do workspace do usuário.

### Dashboard
- Contagem de tarefas do workspace por status (visão simplificada, sem métricas avançadas), com destaque para "Minhas tarefas".

### Configurações
- Edição de nome e senha do próprio perfil/conta (a alteração de senha exige a senha atual). O e-mail não é editável.

## 6. Telas

Em todas as telas autenticadas há um menu do usuário com acesso a Configurações de Perfil e à opção **Sair** (logout).

1. **Login** — e-mail e senha, link para cadastro, link "Esqueci minha senha".
2. **Cadastro** — sem convite: nome, e-mail e senha. A partir de link de convite com token válido: apenas nome e senha, com o e-mail do convite exibido sem possibilidade de edição, associando automaticamente ao workspace do convite. Se o e-mail do convite já tiver conta sem workspace, a tela solicita apenas a autenticação (senha).
3. **Convite Expirado ou Inválido** — mensagem "Este convite expirou", orientação para solicitar novo convite ao responsável pelo workspace, botão "Voltar para o login". Também é exibida para convite já utilizado ou invalidado.
4. **Solicitar Recuperação de Senha** — campo de e-mail, botão de envio, mensagem genérica de confirmação.
5. **Redefinir Senha** — formulário de nova senha e confirmação (token válido), ou mensagem informando que o link não é mais válido (token expirado/inválido).
6. **Dashboard** — contagem de tarefas do workspace por status, destaque "Minhas tarefas", acesso rápido aos projetos. Com o workspace sem projetos, exibe estado vazio (com a ação "Criar primeiro projeto" para o Proprietário).
7. **Listagem de Projetos** — projetos do workspace, ação de criar novo (Proprietário). Sem projetos, exibe estado vazio.
8. **Detalhe do Projeto** — tarefas do projeto em Kanban ou Lista, com filtros.
9. **Criação/Edição de Tarefa** — formulário com título, descrição, prioridade (padrão Média), tags (digitação, até 10), prazo e responsável. Na criação, o Proprietário escolhe o responsável (qualquer membro, inclusive ele mesmo); para o Membro, o responsável é ele mesmo e não é editável. O formulário **não** contém o campo de status: na criação o status é "Pendente a iniciar", e a mudança de status é feita por controle próprio na tarefa (Kanban ou detalhe). Na edição, o responsável só é alterável pelo Proprietário, e o projeto não é alterável.
10. **Membros do Workspace** — listagem de membros, ação de convidar (Proprietário), listagem de convites pendentes (e-mail, data de criação, expiração) com a ação de gerar novo convite (Proprietário), ação de remover (Proprietário, exceto ele mesmo). A remoção abre uma confirmação que, quando o membro tiver tarefas sob sua responsabilidade, lista essas tarefas e solicita o novo responsável (outro membro ou o próprio Proprietário), com a opção rápida "Atribuir todas a mim".
11. **Busca Global** — campo de busca no topo, resultados de tarefas e projetos do workspace.
12. **Configurações de Perfil** — edição de nome e senha da própria conta (senha atual, nova senha e confirmação). O e-mail é exibido sem possibilidade de edição.
13. **Sem Workspace** — exibida ao usuário autenticado que não pertence a nenhum workspace. Informa que ele não faz parte de nenhum workspace, orienta a solicitar um convite ao Proprietário e oferece o botão "Sair". Não dá acesso às demais telas.

## 7. Fluxos principais

### 7.1 Criação de conta sem convite
1. Usuário acessa a tela de cadastro e informa nome, e-mail e senha (conforme a política de senha).
2. Sistema cria a conta e, automaticamente, um workspace novo, com o nome "Workspace de {nome do usuário}".
3. Usuário se torna Proprietário desse workspace.
4. Sistema inicia a sessão do usuário automaticamente.
5. Usuário é direcionado ao Dashboard (workspace vazio, sem projetos).

### 7.2 Convite e criação de conta por convite
1. Proprietário acessa a tela de Membros e informa o e-mail da pessoa a convidar. Se o e-mail pertencer a um usuário que já faz parte de um workspace, o sistema rejeita o convite e informa o Proprietário.
2. Sistema gera o convite (token único, validade de 2 dias), invalida eventual convite anterior pendente para o mesmo e-mail e envia e-mail com link exclusivo.
3. Pessoa convidada acessa o link. Se não tiver conta, realiza o cadastro informando apenas nome e senha (o e-mail vem do convite). Se já tiver conta sem workspace, apenas se autentica (ver 7.9).
4. Ao concluir o cadastro, o usuário é vinculado automaticamente ao workspace do convite, como Membro, e o convite é marcado como utilizado.
5. Sistema inicia a sessão do usuário automaticamente e o direciona ao Dashboard do workspace, com os projetos já visíveis.

### 7.3 Criação de projeto
1. Proprietário acessa a Listagem de Projetos e aciona "Novo Projeto".
2. Informa o nome do projeto.
3. Projeto é criado e fica imediatamente visível para todos os membros do workspace.

### 7.4 Criação de tarefa
1. Usuário (Proprietário ou Membro) acessa o Detalhe do Projeto.
2. Aciona "Nova Tarefa" e preenche título, descrição, prioridade, tags e prazo. O Proprietário também escolhe o responsável (qualquer membro do workspace, inclusive ele mesmo); para o Membro, o responsável é definido automaticamente como ele mesmo.
3. Tags digitadas que ainda não existem no workspace são criadas; as existentes são reutilizadas.
4. Tarefa é criada com status inicial "Pendente a iniciar".
5. Tarefa aparece no Kanban (coluna correspondente) e na Lista.

### 7.5 Atualização de status da tarefa
1. Responsável pela tarefa (ou o Proprietário) acessa a tarefa (via Kanban, Lista ou busca).
2. Altera o status para o estágio adjacente do fluxo: avança (Em desenvolvimento, Em testes, Finalizado) ou retrocede um estágio. Não é permitido pular estágios.
3. Alteração é refletida imediatamente no Dashboard (contagem por status) e na visualização do projeto.

### 7.6 Recuperação de senha
1. Usuário seleciona "Esqueci minha senha" na tela de Login e informa o e-mail da conta.
2. Sistema gera um token único de recuperação, vinculado à conta, com validade de 30 minutos (invalidando tokens anteriores não utilizados da conta), e envia e-mail ao endereço informado com o botão "Redefinir minha senha".
3. Sistema exibe mensagem genérica de confirmação, independentemente de o e-mail estar ou não cadastrado.
4. Usuário acessa o link recebido; se o token for válido (não expirado, não utilizado), o sistema exibe o formulário de nova senha e confirmação.
5. Usuário informa a nova senha e a confirmação; sistema valida a política de senha e a coincidência entre os campos, e persiste a alteração.
6. Sistema invalida o token utilizado, exibe mensagem de sucesso e direciona o usuário à tela de Login.

### 7.7 Convite expirado ou inválido
1. Usuário acessa um link de convite cujo token está expirado (mais de 2 dias), é inválido, já foi utilizado ou foi invalidado por um convite mais recente.
2. Sistema impede a criação de conta e o vínculo ao workspace.
3. Sistema exibe a tela "Este convite expirou", com orientação para solicitar um novo convite ao responsável pelo workspace, e o botão "Voltar para o login".
4. Um novo convite só pode ser gerado pelo Proprietário, na tela de Membros — não há reenvio automático a partir do link expirado.

### 7.8 Remoção de membro com reatribuição de tarefas
1. Proprietário acessa a tela de Membros e aciona "Remover" em um membro (o Proprietário não pode remover a si mesmo).
2. Se o membro tiver tarefas sob sua responsabilidade, o sistema lista essas tarefas e solicita o novo responsável: outro membro do workspace ou o próprio Proprietário (opção rápida "Atribuir todas a mim"). Se não houver tarefas, apenas pede a confirmação.
3. Proprietário confirma.
4. Sistema, em uma única operação, reatribui as tarefas ao novo responsável e remove o vínculo do membro com o workspace. Se qualquer etapa falhar, nada é alterado e o Proprietário é informado.
5. O membro deixa de aparecer na listagem; sua conta é mantida, sem workspace. As tarefas que ele criou permanecem registradas com ele como autor.

### 7.9 Usuário sem workspace e aceite de convite por conta existente
1. Usuário removido de um workspace, ao se autenticar (ou na próxima interação com o sistema), é direcionado à tela "Sem Workspace", que apenas informa a situação e oferece "Sair".
2. Para voltar a um workspace, o Proprietário precisa gerar um novo convite para o e-mail dessa conta (permitido, pois o e-mail não pertence a nenhum workspace).
3. Usuário acessa o link do convite. Como já possui conta sem workspace, a página solicita apenas a autenticação (senha), exibindo o e-mail e o workspace do convite.
4. Com token válido e autenticação bem-sucedida, o usuário é vinculado ao workspace do convite como Membro, o convite é marcado como utilizado e o usuário é direcionado ao Dashboard.
5. Se o token estiver expirado, inválido, utilizado ou invalidado, aplica-se o fluxo 7.7.
