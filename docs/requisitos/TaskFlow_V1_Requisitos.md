# TaskFlow — Requisitos Funcionais e Não Funcionais

**Versão:** V1
**Data:** 17/10/2026 (revisão do documento de 15/10/2026)
**Referência:** TaskFlow — Especificação V1

## 1. Introdução

Este documento define os Requisitos Funcionais (RF) e Não Funcionais (RNF) da V1 do TaskFlow. Os requisitos cobrem o sistema como um todo e estão alinhados à Especificação V1, considerando exclusivamente o Modo Equipe.

## 2. Requisitos Funcionais

### 2.1 Regras Transversais

Regras que se aplicam a mais de um requisito. Os RFs e RNFs que dependem delas as referenciam pelo identificador.

| ID | Regra | Aplica-se a |
|---|---|---|
| RT-01 | **Política de senha:** mínimo de 8 caracteres e máximo de 72 **bytes em UTF-8** (limite do algoritmo de hash), com pelo menos 1 letra e 1 número. Em senhas só com caracteres ASCII, 72 bytes equivalem a 72 caracteres; caracteres acentuados ocupam 2 bytes ou mais. Senha acima do limite é rejeitada, nunca truncada. A senha é armazenada somente como hash (RNF-13). | RF-01, RF-07, RF-26, RF-34 |
| RT-02 | **Escopo de visualização:** todo usuário do workspace (Proprietário ou Membro) visualiza todos os projetos e todas as tarefas do seu workspace. Nenhum usuário acessa dados de outro workspace. | RF-12, RF-17, RF-23, RF-24, RF-25 |
| RT-03 | **Fuso horário:** datas e horas são armazenadas e trafegadas em UTC e exibidas ao usuário em America/Sao_Paulo (UTC−03:00). O prazo da tarefa é data de calendário, sem conversão. | RF-06, RF-31, RF-05 |
| RT-04 | **Limites de campos:** nome do usuário: 1 a 100 caracteres; e-mail: até 150 caracteres; nome do projeto: 1 a 150 caracteres; título da tarefa: 1 a 200 caracteres; descrição da tarefa: até 5.000 caracteres; tags por tarefa: até 10; nome de tag: 1 a 50 caracteres (após remover espaços das pontas). Os limites são validados no backend (fonte de verdade) e espelhados nos formulários. Valores acima dos limites são rejeitados (códigos `TAMANHO_EXCEDIDO` e `LIMITE_EXCEDIDO` do Padrão de API). | RF-01, RF-07, RF-11, RF-14, RF-16, RF-18, RF-26 |

### 2.2 Tabela de Requisitos Funcionais

| ID | Descrição do requisito | Ator | Critério de aceitação |
|---|---|---|---|
| RF-01 | O sistema deve permitir o cadastro de uma conta com nome, e-mail e senha, seguindo a política de senha (RT-01) e os limites de campos (RT-04), e iniciar a sessão do usuário automaticamente após o cadastro. No cadastro sem convite, a conta, o workspace (RF-02) e o vínculo de Proprietário (RF-03) devem ser criados em uma única operação atômica. | Proprietário / Membro | Ao informar dados válidos, a conta deve ser criada e o usuário deve ser autenticado e direcionado ao Dashboard; enquanto o Dashboard (RF-25) não estiver disponível, a uma tela inicial provisória do workspace. No cadastro sem convite, conta, workspace e vínculo são criados juntos ou nenhum deles é criado. Uma senha fora da política (RT-01), campos acima dos limites (RT-04) ou um e-mail já cadastrado não devem resultar em nova conta. |
| RF-02 | O sistema deve criar automaticamente um workspace quando o usuário se cadastrar sem convite, com o nome "Workspace de {nome do usuário}". | Sistema | Após o cadastro sem convite, um workspace deve ser criado automaticamente, na mesma operação do cadastro (RF-01), com o nome padrão definido. |
| RF-03 | O sistema deve definir como Proprietário do workspace criado o usuário que se cadastrar sem convite. | Sistema | O usuário deve assumir o papel de Proprietário do workspace criado. |
| RF-04 | O sistema deve permitir o login por e-mail e senha. | Proprietário / Membro | Credenciais válidas devem permitir o acesso à área autenticada. Credenciais inválidas não devem permitir o acesso. |
| RF-05 | O sistema deve controlar a sessão do usuário autenticado por meio de um token de acesso de curta duração e de um token de renovação (refresh) revogável. | Sistema | Recursos protegidos devem exigir um token de acesso válido. Enquanto o token de renovação for válido, a sessão deve ser renovada sem novo login; token de renovação expirado ou revogado deve exigir novo login. |
| RF-06 | O sistema deve permitir ao Proprietário convidar uma pessoa para o workspace por e-mail, gerando um token único vinculado ao e-mail convidado, ao workspace_id e a uma expiração de 2 dias. Não deve ser possível convidar o e-mail de um usuário que já pertença a um workspace. | Proprietário | Ao enviar o convite, o sistema deve gerar um token único com expiração de 2 dias e enviar um e-mail com link no formato `app.taskflow.com/invite/{token}` contendo o botão "Criar minha conta". Se o e-mail pertencer a um usuário que já faz parte de um workspace, o convite deve ser rejeitado com mensagem ao Proprietário. |
| RF-07 | O sistema deve permitir que a pessoa convidada realize seu cadastro a partir do link de convite, preenchendo apenas nome e senha (RT-01 e RT-04), com e-mail e workspace já identificados pelo token. Se o e-mail do convite já possuir conta sem workspace, o sistema deve solicitar apenas a autenticação, em vez do cadastro. | Membro | Ao acessar um link de convite com token válido, a página deve exibir apenas os campos nome e senha, com o e-mail do convite identificado e não editável, associando automaticamente o e-mail e o workspace do convite. Para e-mail com conta existente sem workspace, a página deve exibir apenas a autenticação. |
| RF-08 | O sistema deve vincular automaticamente ao workspace do convite, como Membro, o usuário que concluir o cadastro por convite ou, se já possuir conta sem workspace, que aceitar o convite após autenticar-se, desde que o token esteja válido. | Sistema | Após a conclusão do cadastro (ou da autenticação) com token válido, o usuário deve pertencer ao workspace do convite com papel de Membro, ser autenticado automaticamente e direcionado ao Dashboard do workspace. O convite utilizado não deve poder ser reaproveitado. |
| RF-09 | O sistema deve permitir a visualização dos membros do workspace. | Proprietário / Membro | O usuário deve visualizar a listagem de membros do seu workspace. |
| RF-10 | O sistema deve permitir ao Proprietário remover membros do workspace. Antes da remoção, as tarefas sob responsabilidade do membro devem ser reatribuídas, em uma única operação, a um novo responsável escolhido pelo Proprietário (outro membro ou o próprio Proprietário). O Proprietário não pode ser removido. | Proprietário | Um membro removido não deve permanecer como membro do workspace, e sua conta deve ser mantida sem vínculo (RF-39). A reatribuição e a remoção devem ocorrer juntas ou nenhuma delas deve ser efetivada. Nenhuma tarefa deve permanecer com o membro removido como responsável. Se o membro não tiver tarefas sob sua responsabilidade, a remoção ocorre sem reatribuição. |
| RF-11 | O sistema deve permitir ao Proprietário criar projetos informando o nome, dentro dos limites de campos (RT-04). | Proprietário | Um projeto criado com nome válido deve ser incluído no workspace. Nome vazio ou acima do limite (RT-04) deve ser rejeitado. |
| RF-12 | O sistema deve permitir a visualização dos projetos do workspace. | Proprietário / Membro | O usuário deve visualizar os projetos do seu workspace. Um workspace sem projetos deve exibir um estado vazio. |
| RF-13 | O sistema deve conceder automaticamente a todos os membros do workspace acesso aos projetos do workspace. | Sistema | Um novo projeto deve ficar acessível automaticamente a todos os membros do workspace. |
| RF-14 | O sistema deve permitir ao Proprietário editar projetos, respeitando os limites de campos (RT-04). | Proprietário | Alterações válidas devem ser persistidas no projeto selecionado. Nome fora dos limites (RT-04) deve ser rejeitado. |
| RF-15 | O sistema deve permitir ao Proprietário remover projetos. | Proprietário | O projeto removido não deve mais aparecer na listagem do workspace. |
| RF-16 | O sistema deve permitir ao Proprietário ou Membro criar tarefas em projetos do workspace, respeitando os limites de campos (RT-04). O Proprietário define o responsável, que pode ser qualquer membro do workspace, inclusive ele mesmo; no caso do Membro, ele próprio é definido como responsável. Quando a prioridade não é informada, assume o valor padrão Média. As tags são informadas por digitação, em número máximo de 10 por tarefa, e criadas automaticamente quando ainda não existirem no workspace. | Proprietário / Membro | Uma tarefa válida deve ser criada no projeto selecionado pelo usuário autorizado, com status inicial "Pendente a iniciar", com responsável definido e, quando a prioridade não for informada, com prioridade Média. Tags novas devem ser criadas no workspace e tags existentes reutilizadas. Mais de 10 tags, ou campos acima dos limites (RT-04), devem ser rejeitados. |
| RF-17 | O sistema deve permitir a visualização das tarefas do workspace por todos os seus usuários (RT-02). | Proprietário / Membro | O Proprietário e o Membro devem visualizar todas as tarefas de todos os projetos do seu workspace. |
| RF-18 | O sistema deve permitir a edição de tarefas conforme as permissões do usuário. A edição abrange título, descrição, prioridade, tags e prazo, respeitando os limites de campos (RT-04), e não permite alterar o projeto, o responsável (RF-20) nem o status (RF-21). | Proprietário / Membro | O Proprietário deve poder editar qualquer tarefa e o Membro apenas tarefas próprias (das quais é autor) ou sob sua responsabilidade. A edição não deve alterar projeto, responsável nem status. Valores fora dos limites (RT-04), inclusive mais de 10 tags, devem ser rejeitados. |
| RF-19 | O sistema deve permitir ao Proprietário excluir tarefas. | Proprietário | Uma tarefa excluída pelo Proprietário deve deixar de ser exibida. |
| RF-20 | O sistema deve permitir ao Proprietário atribuir uma tarefa a qualquer membro do workspace e alterar seu responsável. O Membro não pode alterar o responsável de tarefas. | Proprietário | O responsável definido pelo Proprietário deve ser persistido na tarefa. Uma tentativa do Membro de alterar o responsável deve ser rejeitada. |
| RF-21 | O sistema deve permitir a alteração do status da tarefa conforme o papel e a responsabilidade do usuário, avançando ou retrocedendo um estágio por vez no fluxo Pendente a iniciar ↔ Em desenvolvimento ↔ Em testes ↔ Finalizado. O Proprietário altera o status de qualquer tarefa; o Membro, apenas das tarefas sob sua responsabilidade. | Proprietário / Membro | O status deve mudar apenas para o estágio adjacente (anterior ou seguinte) e ser persistido na tarefa. Salto de estágios, ou alteração por Membro em tarefa que não seja de sua responsabilidade, deve ser rejeitado. |
| RF-22 | O sistema deve permitir visualizar as tarefas de um projeto nas visualizações Kanban e Lista. | Proprietário / Membro | A mesma tarefa deve aparecer na visualização Kanban agrupada por status e na visualização Lista. |
| RF-23 | O sistema deve permitir filtrar tarefas por responsável, status, tag e intervalo de datas, aplicado ao prazo da tarefa. | Proprietário / Membro | A listagem deve apresentar apenas tarefas compatíveis com os filtros selecionados. O filtro de intervalo de datas deve considerar o prazo da tarefa. |
| RF-24 | O sistema deve permitir busca global por título de tarefa, projeto e tags, no escopo do workspace do usuário (RT-02). | Proprietário / Membro | A busca deve retornar resultados correspondentes aos termos informados nos campos previstos, somente do workspace do usuário. |
| RF-25 | O sistema deve disponibilizar um dashboard simplificado com a contagem de tarefas do workspace por status e, em destaque, a contagem das tarefas sob responsabilidade do próprio usuário ("Minhas tarefas"). | Proprietário / Membro | O dashboard deve apresentar a quantidade de tarefas em cada status do fluxo, para o workspace e para o usuário. Status sem tarefas devem exibir zero. |
| RF-26 | O sistema deve permitir ao usuário editar os próprios dados de perfil e conta: nome (RT-04) e senha. A alteração de senha exige a senha atual e segue a política de senha (RT-01). O e-mail não é editável. | Proprietário / Membro | Alterações válidas de nome e senha devem ser persistidas. A alteração de senha sem a senha atual correta, ou fora da política, deve ser rejeitada. |
| RF-27 | O sistema não deve permitir a criação de conta nem a vinculação ao workspace quando o token de convite estiver expirado, inválido, já utilizado ou invalidado. | Sistema | Um acesso com token expirado, inválido, utilizado ou invalidado não deve resultar em conta criada nem em vínculo com o workspace. |
| RF-28 | O sistema deve exibir uma tela informando que o convite não está mais disponível, orientando o usuário a solicitar um novo convite ao responsável pelo workspace, com a opção "Voltar para o login". | Membro (convidado) | Ao acessar um link expirado ou inválido, a tela deve exibir a mensagem "Este convite expirou" com a orientação definida e o botão "Voltar para o login". |
| RF-29 | O sistema deve permitir que o Proprietário gere um novo convite pela tela Membros, sem reenvio automático a partir do link expirado. A tela Membros deve listar os convites pendentes (e-mail, data de criação e expiração). Um novo convite para o mesmo e-mail invalida o anterior. | Proprietário | Um novo convite só deve ser gerado por ação do Proprietário na tela Membros. Os convites pendentes devem ser listados, e o convite anterior para o mesmo e-mail deve deixar de ser válido ao gerar o novo. |
| RF-30 | O sistema deve permitir solicitar a recuperação de senha a partir da tela de login, informando o e-mail da conta. | Proprietário / Membro | Ao selecionar "Esqueci minha senha" e informar um e-mail, a solicitação deve ser registrada pelo sistema. |
| RF-31 | O sistema deve gerar um token único de recuperação de senha, vinculado à conta, com validade de 30 minutos a partir da criação. Uma nova solicitação invalida os tokens anteriores ainda não utilizados da mesma conta. | Sistema | Cada solicitação de recuperação deve gerar um token único com validade de 30 minutos, e os tokens anteriores não utilizados da conta devem deixar de ser válidos. |
| RF-32 | O sistema deve enviar um e-mail ao endereço informado contendo o botão "Redefinir minha senha", direcionando à página de recuperação com o token. | Sistema | O e-mail enviado deve conter o botão "Redefinir minha senha" apontando para a página de recuperação com o token gerado. |
| RF-33 | O sistema deve validar o token ao acessar o link de recuperação, exibindo o formulário de nova senha quando válido e informando que o link não é mais válido quando expirado ou inválido. | Sistema | Um token válido deve exibir o formulário de nova senha; um token expirado ou inválido deve impedir a alteração e informar que o link não é mais válido. |
| RF-34 | O sistema deve permitir informar a nova senha e sua confirmação, aplicando a política de senha (RT-01). | Proprietário / Membro | A nova senha só deve ser aceita se atender à política de senha (RT-01) e coincidir com a confirmação. |
| RF-35 | O sistema deve invalidar o token de recuperação após seu uso, impedindo sua reutilização em novas tentativas de redefinição. | Sistema | Um token já utilizado não deve permitir nova redefinição de senha. |
| RF-36 | O sistema deve informar que a senha foi alterada com sucesso e direcionar o usuário para a tela de login. | Sistema | Após a redefinição bem-sucedida, deve ser exibida mensagem de sucesso e o usuário deve ser direcionado ao login. |
| RF-37 | O sistema não deve informar se o e-mail utilizado na solicitação de recuperação está ou não cadastrado, apresentando mensagem genérica em qualquer caso. | Sistema | A mensagem exibida após a solicitação deve ser a mesma independentemente da existência da conta associada ao e-mail informado. |
| RF-38 | O sistema deve permitir ao usuário autenticado encerrar a sessão (logout). | Proprietário / Membro | Após o logout, o token de renovação da sessão deve ser revogado, e os recursos protegidos não devem ser acessíveis até um novo login. |
| RF-39 | O sistema deve tratar o usuário autenticado que não pertença a nenhum workspace (ex.: membro removido), exibindo uma tela que informa a situação e orienta a solicitar um novo convite ao Proprietário. | Usuário sem workspace | O usuário sem workspace deve ver apenas essa tela e a opção de sair; não deve acessar as demais funcionalidades nem criar um workspace. Ao aceitar um novo convite válido (RF-08), deve ser vinculado ao workspace do convite como Membro. |

## 3. Matriz de Rastreabilidade

| RF | Seção da Especificação V1 |
|---|---|
| RF-01 | §5 Autenticação; §7.1 Criação de conta sem convite |
| RF-02 | §5 Workspace; §7.1 Criação de conta sem convite |
| RF-03 | §3 Papéis; §7.1 Criação de conta sem convite |
| RF-04 | §5 Autenticação |
| RF-05 | §5 Autenticação |
| RF-06 | §5 Workspace; §7.2 Convite e criação de conta por convite; §7.9 Usuário sem workspace e aceite de convite por conta existente |
| RF-07 | §6 Tela 2 Cadastro; §7.2 Convite e criação de conta por convite; §7.9 Usuário sem workspace e aceite de convite por conta existente |
| RF-08 | §3 Papéis; §7.2 Convite e criação de conta por convite; §7.9 Usuário sem workspace e aceite de convite por conta existente |
| RF-09 | §3.3 Membros; §6 Telas |
| RF-10 | §3.3 Membros; §5 Workspace; §6 Tela 10; §7.8 Remoção de membro com reatribuição de tarefas |
| RF-11 | §5 Projetos; §7.3 Criação de projeto |
| RF-12 | §5 Projetos; §6 Telas (Telas 6 e 7, estado vazio) |
| RF-13 | §4 Regras de negócio; §7.3 Criação de projeto |
| RF-14 | §3.1 Projetos; §5 Projetos |
| RF-15 | §3.1 Projetos; §5 Projetos |
| RF-16 | §3.2 Tarefas; §5 Tarefas; §6 Tela 9; §7.4 Criação de tarefa |
| RF-17 | §3.2 Tarefas; §6 Telas |
| RF-18 | §3.2 Tarefas; §6 Tela 9 |
| RF-19 | §3.2 Tarefas; §5 Tarefas |
| RF-20 | §3.2 Tarefas; §6 Tela 9 |
| RF-21 | §3.2 Tarefas; §5 Tarefas; §7.5 Atualização de status da tarefa |
| RF-22 | §5 Tarefas; §6 Telas |
| RF-23 | §5 Filtros e busca; §6 Telas |
| RF-24 | §5 Filtros e busca; §6 Telas |
| RF-25 | §3.4 Métricas; §5 Dashboard; §6 Tela 6; §7.5 Atualização de status da tarefa |
| RF-26 | §3.5 Configurações; §5 Configurações; §6 Tela 12 |
| RF-27 | §7.2 Convite e criação de conta por convite; §7.7 Convite expirado ou inválido |
| RF-28 | §6 Tela 3; §7.7 Convite expirado ou inválido |
| RF-29 | §3.3 Membros; §6 Tela 10; §7.7 Convite expirado ou inválido |
| RF-30 | §5 Autenticação; §7.6 Recuperação de senha |
| RF-31 | §7.6 Recuperação de senha |
| RF-32 | §7.6 Recuperação de senha |
| RF-33 | §7.6 Recuperação de senha |
| RF-34 | §7.6 Recuperação de senha |
| RF-35 | §7.6 Recuperação de senha |
| RF-36 | §7.6 Recuperação de senha |
| RF-37 | §7.6 Recuperação de senha |
| RF-38 | §5 Autenticação |
| RF-39 | §6 Tela 13 Sem Workspace; §7.9 Usuário sem workspace e aceite de convite por conta existente |

## 4. Requisitos Não Funcionais

| ID | Categoria | Descrição do requisito | Critério de aceitação |
|---|---|---|---|
| RNF-01 | Segurança | O sistema deve restringir o acesso às funcionalidades e aos dados conforme o papel e as permissões do usuário autenticado, isolando os dados de cada workspace. | Um usuário não deve executar operações que não estejam autorizadas para seu papel, nem acessar dados (inclusive tags) de outro workspace. |
| RNF-02 | Segurança | O sistema deve proteger o acesso à conta por autenticação com e-mail e senha. | Recursos autenticados não devem ser acessíveis sem credenciais válidas. |
| RNF-03 | Segurança | O sistema deve manter a sessão do usuário autenticado por token de acesso de curta duração e token de renovação revogável, de forma que recursos protegidos não sejam acessíveis sem autenticação válida. | Uma requisição sem token de acesso válido deve ser impedida de acessar recursos protegidos; após o logout, o token de renovação não deve permitir nova sessão. |
| RNF-04 | Usabilidade | A interface deve apresentar os fluxos principais de forma clara e compreensível para a execução das operações previstas na V1. | As operações previstas devem poder ser identificadas e executadas sem ambiguidades relevantes na interface. |
| RNF-05 | Usabilidade | A interface deve manter comportamento adequado nas larguras de tela de 360 px (celular), 768 px (tablet) e 1280 px (desktop). | Nas três larguras, as funcionalidades da V1 devem permanecer utilizáveis, sem rolagem horizontal da página e sem perda de funcionalidade. |
| RNF-06 | Compatibilidade | A aplicação web deve funcionar nos navegadores Chrome, Edge e Firefox (últimas 2 versões estáveis) e Safari 16 ou superior. | Os fluxos principais da V1 devem ser executados com sucesso nos navegadores e versões indicados. |
| RNF-07 | Confiabilidade | As informações das tarefas devem permanecer consistentes entre Kanban, Lista e Dashboard após alterações realizadas no sistema. | Uma alteração persistida deve refletir o mesmo estado da tarefa nas três representações. |
| RNF-08 | Desempenho | As operações básicas da V1 devem apresentar tempo de resposta adequado à interação normal do usuário. | Em ambiente local de teste, com massa de referência de até 1.000 tarefas por workspace, 95% das requisições da API devem responder em até 500 ms. |
| RNF-09 | Manutenibilidade | O sistema deve manter organização de código e documentação suficiente para permitir a compreensão e manutenção das funcionalidades da V1. | Código e documentação devem permitir localizar, compreender e manter as funcionalidades implementadas. |
| RNF-10 | Integridade | As operações de criação, edição, exclusão e alteração de status devem manter os dados persistidos de forma consistente. | Após cada operação concluída, os dados persistidos devem refletir o resultado da operação sem inconsistências. |
| RNF-11 | Segurança | O token de convite deve ser válido somente dentro do período de expiração definido (2 dias), não podendo ser reutilizado para cadastro ou vinculação após esse período. | Uma tentativa de uso do token após a expiração não deve permitir cadastro nem vinculação ao workspace. |
| RNF-12 | Segurança | O token de recuperação de senha deve ser válido somente dentro do período de expiração definido (30 minutos) e de uso único, não podendo ser reutilizado após a redefinição ou após expirar. | Uma tentativa de uso do token após a expiração ou após já ter sido utilizado não deve permitir a redefinição da senha. |
| RNF-13 | Segurança | Senhas e tokens (convite, recuperação de senha e renovação de sessão) devem ser armazenados somente como hash, nunca em texto puro. | Nenhum registro persistido deve conter senha ou token em texto puro; a senha deve usar algoritmo de hash adaptativo. |

## 5. Observações

* Os requisitos deste documento abrangem exclusivamente a V1 e o Modo Equipe.
* Funcionalidades explicitamente fora do escopo da V1 não são consideradas requisitos deste documento, incluindo subtarefas, tarefas refinadas, comentários, anexos, cargos customizados, relatórios e métricas avançadas, notificações, integração com IA, múltiplos workspaces por usuário, edição do workspace, transferência de propriedade, mudança de e-mail da conta e mover tarefa entre projetos.
* Os RNFs 05, 06 e 08 passaram a ter parâmetros verificáveis nesta revisão. Os demais RNFs permanecem qualitativos, sem metas numéricas presumidas.
* Os mecanismos técnicos (duração dos tokens, bibliotecas, infraestrutura) são definidos em `docs/arquitetura/TaskFlow_V1_Decisoes_Tecnicas.md`.

## 6. Histórico de Revisões

| Data | Alteração |
|---|---|
| 15/09/2026 | Versão inicial (RF-01 a RF-37, RNF-01 a RNF-12). |
| 15/10/2026 | Incluídas as Regras Transversais RT-01 a RT-03; novos RF-38 (logout) e RF-39 (usuário sem workspace); novo RNF-13 (hash de senhas e tokens). Ajustados RF-01, 02, 05, 06, 07, 08, 10, 12, 16, 17, 18, 20, 21, 23, 24, 25, 26, 27, 29, 31 e 34, e RNF-01, 03, 05, 06 e 08. Matriz de rastreabilidade atualizada e removida a menção à "Declaração de Escopo". |
| 17/10/2026 | Política de senha (RT-01) com limite em bytes UTF-8. Nova Regra Transversal RT-04 (limites de campos), referenciada em RF-01, 07, 11, 14, 16, 18 e 26. RF-01 com criação atômica de conta, workspace e vínculo e redirecionamento ao Dashboard ou a tela inicial provisória; RF-02 alinhado à criação atômica. RF-16 com prioridade padrão Média e máximo de 10 tags. |
