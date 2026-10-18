# TaskFlow — Domínio do Sistema (V1)

## 1. Visão do Produto

TaskFlow é uma aplicação web SaaS de gestão de tarefas e projetos. Existem dois modos de uso previstos para o produto — Modo Equipe e Modo Pessoal —, mas **esta versão (V1) constrói exclusivamente o Modo Equipe**, com escopo mínimo funcional: um usuário consegue criar sua conta, ter um workspace, criar projetos, convidar colegas, criar tarefas e acompanhá-las até a conclusão.

## 2. Vocabulário de Domínios (V1)

| # | Domínio | Slug | Definição |
|---|---|---|---|
| 1 | **Autenticação** | `auth` | Cadastro e login de usuários, recuperação de senha, controle de sessão e logout |
| 2 | **Workspace** | — | Ambiente administrado por um Proprietário, contém projetos e membros. Não gera histórias próprias: a criação do workspace (RF-02 e RF-03) pertence ao domínio `auth`. |
| 3 | **Modo Equipe** | — | Único modo existente nesta versão; workspace colaborativo padrão. Não gera histórias próprias. |
| 4 | **Membros e Convite** | `membros` | Convite de novos usuários para o workspace (na V1, sempre como Membro; a definição de papel no convite chega na V2); aceite do convite; listagem e remoção de membros |
| 5 | **Projeto** | `projeto` | Unidade de organização de tarefas dentro de um workspace |
| 6 | **Tarefa** | `tarefa` | Unidade de trabalho, único tipo existente: Simples |
| 7 | **Busca e Filtros** | `busca-filtros` | Localização de tarefas/projetos por critérios diversos |
| 8 | **Dashboard** | `dashboard` | Visão consolidada e simplificada do estado das tarefas |
| 9 | **Fundação** (`fundacao`) | `fundacao` | Domínio técnico, sem funcionalidade de negócio: estrutura dos módulos, integração contínua, configuração de ambientes, migração inicial do banco e demais bases exigidas pelas decisões técnicas. Gera histórias de infraestrutura, sem requisitos funcionais |

Domínio presente mas ainda sem funcionalidade própria: **Configurações** (apenas edição de nome e senha do próprio perfil/conta) (slug `configuracoes`).

O **slug** é o nome usado no identificador das histórias (`HIST-XXX-<slug>`) e na ordem de dependência do Backlog. Domínios sem slug não geram histórias.

## 3. Entidades Principais

### Usuário
- Campos: nome, e-mail, senha.
- O e-mail é único e não pode ser alterado após o cadastro.
- Pertence a **no máximo 1 workspace** nesta versão. Pode ficar **sem workspace** (ex.: após ser removido), situação em que só consegue voltar a um workspace por meio de um novo convite.
- Papel no workspace: Proprietário ou Membro (ver seção 5).

### Workspace
- Criado automaticamente quando um usuário se cadastra sem vir de um convite, com o nome "Workspace de {nome do usuário}".
- Tem exatamente 1 Proprietário (quem criou), que não pode ser removido, e 0 ou mais Membros.
- Contém 0 ou mais Projetos (nasce sem projetos).
- Possui suas próprias tags, que não são compartilhadas com outros workspaces.

### Projeto
- Campos: nome.
- Membros: **todo membro do workspace tem acesso automático** a todos os projetos (sem vínculo seletivo nesta versão).
- Contém 0 ou mais Tarefas.

### Tarefa
- Único tipo existente: **Simples** (título, descrição).
- Campos adicionais: projeto, responsável, prioridade, status, tags, prazo.
- Toda tarefa tem um responsável. Na criação por Membro, o responsável é o próprio Membro; o Proprietário pode definir qualquer membro do workspace.
- Status possíveis: Pendente a iniciar ↔ Em desenvolvimento ↔ Em testes ↔ Finalizado. A mudança ocorre um estágio por vez, avançando ou retrocedendo.
- A tarefa não muda de projeto nesta versão.
- Visualização: Kanban (por status) ou Lista.

## 4. Regras de Negócio (V1)

- Um usuário pertence a no máximo um workspace.
- Quem cria conta **sem** convite vira automaticamente Proprietário do próprio workspace.
- Quem cria conta **por convite** entra automaticamente como Membro do workspace que o convidou.
- Quem já tem conta e está sem workspace entra como Membro ao aceitar um convite.
- Não é possível convidar o e-mail de um usuário que já pertença a um workspace.
- Não é possível criar um workspace adicional depois do cadastro (multi-workspace só existe na V3); o usuário sem workspace só ingressa em um por convite.
- Todo membro do workspace acessa automaticamente todos os projetos e tarefas do workspace (vínculo seletivo por projeto só existe na V2).
- O Proprietário é único em cada workspace e não pode ser removido nem transferir a propriedade nesta versão.
- Ao remover um membro, todas as tarefas sob sua responsabilidade são reatribuídas, na mesma operação, a outro membro ou ao Proprietário. A conta do membro removido é mantida, sem workspace.
- O status da tarefa muda de forma manual, um estágio por vez, avançando ou retrocedendo: Pendente a iniciar ↔ Em desenvolvimento ↔ Em testes ↔ Finalizado.
- A senha segue a política: mínimo de 8 caracteres e máximo de 72 bytes em UTF-8, com pelo menos 1 letra e 1 número.
- Tarefa não tem subtarefas, comentários, anexos ou standby nesta versão.

## 5. Perfis de Usuário e Permissões (V1)

Apenas dois papéis fixos, sem customização (cargos customizados só existem a partir da V2):

### Proprietário
- Acesso administrativo total dentro do seu workspace.
- Pode: criar/editar/remover projetos; criar/editar/remover qualquer tarefa; atribuir tarefas e alterar responsável (qualquer membro do workspace, inclusive ele mesmo); alterar o status de qualquer tarefa; convidar e remover membros do workspace (exceto a si mesmo), com reatribuição das tarefas do membro removido; visualizar e gerar convites pendentes; editar o próprio perfil.
- Não existe administração do workspace nesta versão (ex.: edição do nome do workspace ou transferência de propriedade ficam para a V2).

### Membro
- Acesso operacional restrito ao que cria ou ao que é de sua responsabilidade.
- Pode: visualizar todos os projetos e tarefas do workspace; criar tarefas (ficando como responsável por elas); editar apenas as próprias tarefas ou as que é responsável; alterar status (avançando ou retrocedendo um estágio) apenas das tarefas sob sua responsabilidade; visualizar membros do workspace; editar o próprio perfil (nome e senha).
- Não pode: administrar o workspace, convidar/remover membros, atribuir ou alterar o responsável de tarefas, remover tarefas de terceiros, editar/remover projetos.

### Usuário sem workspace
- Não possui papel. Acessa apenas a tela informativa "Sem Workspace" e a opção de sair, até aceitar um novo convite.

---

*Este documento é autocontido para a V1. Ao evoluir para a V2, substituir por `TaskFlow_V2_Dominio.md`, que inclui todo este conteúdo mais os acréscimos daquela versão.*
