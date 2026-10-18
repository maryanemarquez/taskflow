# Backlog — TaskFlow V1

> Fonte: `docs/especificacao/TaskFlow_V1_Especificacao.md`, `docs/dominio/TaskFlow_V1_Dominio.md` e `docs/requisitos/TaskFlow_V1_Requisitos.md` (RF/RNF e matriz de rastreabilidade).
> Este backlog define escopo previsto e ordem de dependência entre domínios — a quebra fina em histórias individuais (`HIST-XXX-<dominio>`), com critérios de aceitação e cenários Gherkin, é feita pelo `gerenciador-historias` no momento de cada Gate 1.

## Ordem de dependência

| Ordem | Domínio | Escopo previsto (V1) | Depende de |
|---|---|---|---|
| 1 | `fundacao` | Domínio técnico, sem RF: estrutura dos módulos `backend` e `frontend`, integração contínua, configuração por ambiente e segredos (DT-13), migração inicial do banco (Flyway), tratador de erros RFC 7807, `Clock` em UTC, porta de e-mail, base do cliente HTTP e das rotas. Cobre os RNFs e as decisões técnicas transversais. **Primeira tarefa do frontend:** validar o índice da referência visual (`docs/referencia-visual-indice.md`) | — |
| 2 | `auth` | Cadastro de conta sem convite, em operação atômica que cria usuário, workspace (RF-02, nome padrão "Workspace de {nome}") e vínculo de Proprietário (RF-03), com política de senha e limites de campos e início de sessão automático; redirecionamento ao Dashboard ou, enquanto ele não existir, a uma tela inicial provisória; login por e-mail/senha, controle de sessão (token de acesso + token de renovação), logout, recuperação de senha (solicitação, token de 30 minutos, redefinição) | `fundacao` |
| 3 | `membros` | Convite de membro (Proprietário, via e-mail, token de 2 dias, invalidação do convite anterior), cadastro por convite (nome e senha) e aceite por conta existente sem workspace, convite expirado/inválido, listagem de membros e de convites pendentes, remoção de membro, tela "Sem Workspace"; endpoints auxiliares: validação do token de convite (`POST /convites/validar`) e, previsto, aceite | `auth` |
| 4 | `projeto` | Criação, listagem (com estado vazio), edição e remoção de projeto; acesso automático de todo membro do workspace | `auth` |
| 5 | `tarefa` | Criação, edição, remoção de tarefa Simples (tags por digitação, responsável conforme o papel); mudança de status (Pendente a iniciar ↔ Em desenvolvimento ↔ Em testes ↔ Finalizado, um estágio por vez); visualização em Kanban e Lista; reatribuição de tarefas na remoção de membro (complemento do RF-10); endpoints auxiliares: listagem de tags do workspace (`GET /tags`) e troca de responsável (`PATCH /tarefas/{id}/responsavel`) | `projeto`, `membros` |
| 6 | `busca-filtros` | Filtros por responsável, status, tag e intervalo de datas (prazo); busca global por título de tarefa, projeto e tags | `tarefa` |
| 7 | `dashboard` | Contagem de tarefas do workspace por status e "Minhas tarefas" (visão simplificada) | `tarefa` |
| 8 | `configuracoes` | Edição de nome e senha do próprio perfil/conta | `auth` |

## Rastreabilidade RF → domínio

Todo RF da V1 pertence a um domínio. Nenhum RF fica sem domínio responsável. O domínio `fundacao` é a exceção intencional: não tem RF.

| Domínio | Requisitos Funcionais |
|---|---|
| `fundacao` | Nenhum (domínio técnico: cobre RNFs e decisões técnicas) |
| `auth` | RF-01, RF-02, RF-03, RF-04, RF-05, RF-30, RF-31, RF-32, RF-33, RF-34, RF-35, RF-36, RF-37, RF-38 |
| `membros` | RF-06, RF-07, RF-08, RF-09, RF-10 (remoção do vínculo), RF-27, RF-28, RF-29, RF-39 |
| `projeto` | RF-11, RF-12, RF-13, RF-14, RF-15 |
| `tarefa` | RF-16, RF-17, RF-18, RF-19, RF-20, RF-21, RF-22, RF-10 (reatribuição das tarefas do membro removido) |
| `busca-filtros` | RF-23, RF-24 |
| `dashboard` | RF-25 |
| `configuracoes` | RF-26 |

Os RNFs são transversais e valem para todas as histórias aplicáveis (por exemplo, RNF-01 e RNF-13 em toda história que toque dados protegidos; RNF-05 e RNF-06 em toda história de frontend). As Regras Transversais RT-01 a RT-04 do documento de Requisitos também valem para todas as histórias que as referenciem.

## Observações

- A ordem acima é a sequência recomendada de execução — um domínio não deve ser iniciado antes dos domínios dos quais depende estarem com Gate 1 aprovado (não precisa estar com Gate 3/DoD fechado).
- **Workspace não é um domínio de histórias:** a criação do workspace e do vínculo de Proprietário (RF-02, RF-03) acontece no cadastro e pertence a `auth`, em operação atômica com a criação do usuário (RF-01).
- **Tela inicial provisória:** como o Dashboard (RF-25) é entregue por último, o cadastro e o login redirecionam, até lá, a uma tela inicial provisória do workspace; a troca pelo Dashboard faz parte de `dashboard`.
- Permissões finas por papel (Proprietário/Membro) para cada funcionalidade estão detalhadas em `docs/especificacao/TaskFlow_V1_Especificacao.md`, seção 3 — o `gerenciador-historias` deve consultá-las ao redigir os critérios de aceitação de cada história.
- **Cadastro por convite:** o cadastro sem convite pertence a `auth`; o cadastro por convite (RF-07 e RF-08) pertence a `membros`, que estende o cadastro de `auth`. Com isso, não há dependência circular entre `auth` e `membros`.
- **Remoção de membro com reatribuição (RF-10):** como `tarefa` vem depois de `membros`, a história de remoção em `membros` entrega o vínculo, a confirmação e a transação atômica, sem tarefas a reatribuir. A reatribuição das tarefas do membro removido é entregue em `tarefa`, que completa o RF-10.
- **Tela "Sem Workspace" (RF-39):** pertence a `membros`; o redirecionamento do usuário sem vínculo e o aceite de novo convite fazem parte do mesmo domínio.
- Este backlog não é um contrato fechado: se, durante a redação de uma história, o `gerenciador-historias` identificar necessidade de quebrar um domínio em mais de uma história (ex: `HIST-001-auth` para cadastro/login e `HIST-002-auth` para sessão; a numeração é por domínio), isso é decisão normal do processo — não exige atualizar este arquivo.
- Domínio `configuracoes` tem escopo mínimo na V1 (só edição de nome e senha do perfil) — baixa prioridade de execução apesar de não ter dependências pendentes além de `auth`.
- O domínio "Modo Equipe" do vocabulário (Domínio V1, seção 2) não tem funcionalidade própria e, por isso, não gera histórias; seu comportamento está distribuído nos demais domínios.
