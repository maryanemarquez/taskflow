# TaskFlow — Decisões Técnicas (V1)

**Versão:** V1
**Data:** 17/10/2026
**Referências:** Especificação V1, Requisitos V1, Modelo de Dados V1, Padrão de API V1

## 1. Objetivo

Registrar as decisões técnicas transversais da V1, para que todas as histórias partam da mesma base. Decisões específicas de uma história continuam sendo registradas na própria história (Pontos em Aberto), conforme o processo do framework (`ai/processo.md`).

Cada decisão tem identificador (`DT-XX`). Um desvio de qualquer uma delas em uma história deve ser registrado nos Pontos em Aberto dessa história e aprovado no Gate 1.

## 2. Resumo

| ID | Tema | Decisão |
|---|---|---|
| DT-01 | Plataforma do cliente | Flutter Web |
| DT-02 | Estado no Flutter | Riverpod (`flutter_riverpod`) |
| DT-03 | Rotas no Flutter | `go_router` com URLs sem `#` |
| DT-04 | Cliente HTTP | `dio` com interceptors |
| DT-05 | Sessão | JWT de acesso (15 min) + refresh token opaco (7 dias), com rotação |
| DT-06 | Senhas | BCrypt, política RT-01 (limite em bytes UTF-8) |
| DT-07 | Tokens aleatórios | 32 bytes aleatórios, persistidos como SHA-256 |
| DT-08 | Validades | Acesso 15 min; refresh 7 dias (tolerância de reuso 10 s); convite 2 dias; recuperação 30 min |
| DT-09 | Fuso horário | UTC no backend e no banco; conversão no cliente |
| DT-10 | Banco e migrações | MySQL 8.x + Flyway, `ddl-auto=validate`; política de acentos |
| DT-11 | Testes | JUnit5, Mockito, Testcontainers (MySQL real), JaCoCo |
| DT-12 | E-mail | Spring Mail (SMTP configurável), Mailpit em desenvolvimento |
| DT-13 | Configuração e segredos | Variáveis de ambiente, perfis `dev`, `test` e `prod` |
| DT-14 | Segurança HTTP | Spring Security stateless, CORS restrito, vínculo validado a cada requisição |
| DT-15 | Organização do código | Pacotes/pastas por domínio do backlog |

## 3. Frontend

### DT-01 — Flutter Web como alvo da V1
- **Decisão:** a V1 é entregue como aplicação web, construída com Flutter Web. Mobile nativo e desktop ficam fora do escopo.
- **Motivo:** a especificação descreve uma aplicação web SaaS (RNF-05 e RNF-06), com links por URL (`app.taskflow.com/invite/{token}`).
- **Consequências:** o servidor que hospeda o aplicativo deve reescrever rotas desconhecidas para o `index.html`. O desempenho e a compatibilidade seguem os navegadores do RNF-06.

### DT-02 — Gerenciamento de estado: Riverpod
- **Decisão:** usar Riverpod (`flutter_riverpod`) como única biblioteca de estado. O cumprimento é verificado na revisão do PR.
- **Motivo:** estado reativo e testável, com injeção de dependências, adequado ao TDD; evita portar padrões de estado do React 1:1.
- **Consequências:** qualquer outra biblioteca de estado (Bloc, Provider, GetX etc.) exige atualizar esta decisão (DT-02) e a skill `stack-flutter-web`, com aprovação no Gate 1.

### DT-03 — Rotas: go_router
- **Decisão:** usar `go_router`, com estratégia de URL por caminho (sem `#`).
- **Motivo:** os links de convite e de recuperação de senha precisam abrir diretamente uma tela (`/invite/{token}`, redefinição de senha) e aceitar redirecionamentos de autenticação.
- **Consequências:** guardas de rota: sem sessão → login; sessão sem workspace → tela "Sem Workspace" (RF-39).

### DT-04 — Cliente HTTP: dio
- **Decisão:** usar `dio`, com interceptors para: anexar `Authorization: Bearer`; renovar o token de acesso de forma transparente **somente** ao receber `401` com `codigo = NAO_AUTENTICADO`; converter respostas `application/problem+json` em erros tipados (campo `codigo`).
- **Fila única de renovação:** o interceptor mantém uma única renovação em andamento por vez. Requisições que recebem `401 NAO_AUTENTICADO` durante ela aguardam o resultado e são repetidas uma vez com o novo token. Se a renovação falhar, a sessão é encerrada e o usuário vai ao login.
- **Consequências:** o cliente nunca interpreta o texto de `detail` para decidir comportamento; usa apenas `codigo`. Outros `401` (ex.: `CREDENCIAIS_INVALIDAS` no login) não disparam renovação.

### Datas no cliente
- Datas e horas recebidas em UTC são exibidas em America/Sao_Paulo, usando o pacote `timezone`. `prazo` é tratado como data de calendário, sem conversão (Padrão de API, seção 5).

## 4. Backend

### DT-05 — Sessão: JWT de acesso + refresh token
- **Decisão:**
  - Token de acesso: JWT assinado (HS256), validade de **15 minutos**, contendo apenas o identificador do usuário e as datas de emissão e expiração. O segredo vem da variável de ambiente `JWT_SECRET` (mínimo de 256 bits).
  - Refresh token: valor **opaco** aleatório (DT-07), validade de **7 dias**, persistido na tabela `refresh_token` (apenas o hash).
  - **Rotação:** cada renovação revoga o refresh token usado e emite um novo par. O motivo da revogação é registrado (`motivo_revogacao`: `ROTACAO`, `LOGOUT` ou `REUSO_DETECTADO`).
  - **Janela de tolerância (10 segundos):** o uso de um refresh token revogado por rotação até 10 segundos depois da revogação (ex.: duas abas renovando ao mesmo tempo) responde `401 NAO_AUTENTICADO` sem revogar os demais tokens. Fora da janela, é tratado como reuso: todos os refresh tokens do usuário são revogados com `REUSO_DETECTADO`.
  - Logout revoga o refresh token informado (RF-38).
- **Motivo:** sessão revogável (RF-38, RNF-03) com custo baixo de implementação em Spring.
- **Consequência/risco aceito:** como o cliente é Flutter Web e os tokens trafegam no corpo, eles ficam armazenados no navegador do usuário e estão expostos a XSS. A validade curta do token de acesso e a rotação do refresh token mitigam o risco. Para uma eventual produção, reavaliar o uso de cookie `HttpOnly`.
- O papel e o workspace do usuário **não** vão no JWT (ver DT-14).

### DT-06 — Senhas
- **Decisão:** hash com **BCrypt**, força configurável (padrão 12; valor reduzido nos testes). Política RT-01: no mínimo 8 caracteres e no máximo 72 **bytes em UTF-8**, com ao menos 1 letra e 1 número — o limite de 72 bytes é o do BCrypt. A senha acima do limite é rejeitada, nunca truncada.
- A política é validada no backend (fonte de verdade) e espelhada no formulário do cliente, para dar retorno imediato.

### DT-07 — Tokens aleatórios (convite, recuperação, refresh)
- **Decisão:** gerar 32 bytes com gerador criptograficamente seguro (`SecureRandom`), codificados em Base64 URL-safe. No banco é gravado somente o **SHA-256 em hexadecimal** (64 caracteres, coluna `token_hash` do modelo de dados). A busca do token é feita pelo hash.
- **Motivo:** vazamento do banco não expõe tokens utilizáveis (RNF-13).

### DT-08 — Validades

| Token | Validade | Origem |
|---|---|---|
| Acesso (JWT) | 15 minutos | DT-05 |
| Refresh | 7 dias | DT-05 |
| Convite | 2 dias | RF-06, RNF-11 |
| Recuperação de senha | 30 minutos | RF-31, RNF-12 |
| Tolerância de reuso do refresh token | 10 segundos | DT-05 |

Os valores são parâmetros de configuração (com esses padrões), para facilitar testes.

### DT-09 — Fuso horário
- **Decisão:** UTC em todo o backend e no banco (RT-03, Modelo de Dados seção 7).
- **Implementação:**
  - JVM em UTC (`-Duser.timezone=UTC` ou `TimeZone.setDefault` na inicialização).
  - Hibernate: `hibernate.jdbc.time_zone=UTC`.
  - Conexão MySQL configurada em UTC.
  - Datas e horas tratadas como `Instant`. O tempo atual vem de um `java.time.Clock` **injetado**, para que os testes de expiração (convite, recuperação, tokens) controlem o relógio.
- A conversão para America/Sao_Paulo ocorre apenas no cliente.

### DT-10 — Banco de dados e migrações
- **Decisão:** MySQL 8.x, com esquema versionado por **Flyway** (`db/migration`, arquivos `V1__descricao.sql`). Hibernate com `ddl-auto=validate` (o esquema nunca é gerado pelo ORM).
- **Charset e collation:** `utf8mb4`, com collation padrão do banco `utf8mb4_0900_as_ci` (diferencia acentos, ignora maiúsculas e minúsculas), usada, por exemplo, na unicidade do e-mail.
- **Política de acentos:** `tag.nome` usa `utf8mb4_0900_ai_ci` (ignora acentos e maiúsculas): `ação` e `acao` são a mesma tag. A busca global (RF-24) e o filtro por tag (RF-23) também ignoram acentos e maiúsculas, aplicando `COLLATE utf8mb4_0900_ai_ci` nas comparações.
- **Versões:** Java LTS (21 ou superior), Spring Boot e Flutter na versão estável vigente no início do projeto, fixadas no `pom.xml` e no `pubspec.yaml`; MySQL 8.4 LTS.

### DT-11 — Estratégia de testes
- **Backend:** JUnit5 + Mockito para testes de unidade; **Testcontainers com MySQL real** (mesma versão do ambiente) para testes de integração. H2 não é usado. Cobertura medida com JaCoCo (≥80%).
- **Frontend:** `flutter test` com cobertura (`--coverage`, ≥80%).
- **Tempo:** o `Clock` injetado (DT-09) é usado em todo teste que dependa de expiração.
- **E-mail:** o envio é feito por uma interface (porta `EmailSender`), substituída por um dublê nos testes.

### DT-12 — E-mail
- **Decisão:** Spring Mail (SMTP) configurável por variáveis de ambiente (`MAIL_HOST`, `MAIL_PORT`, `MAIL_USER`, `MAIL_PASSWORD`, `MAIL_FROM`). Em desenvolvimento, usa-se **Mailpit** (SMTP local, com interface web para ler os e-mails).
- Os links dos e-mails usam a variável `APP_BASE_URL` (`https://app.taskflow.com` em produção; endereço local em desenvolvimento).
- O envio é **assíncrono**. Falha de envio é registrada em log e não altera a resposta ao usuário — requisito do RF-37 (resposta idêntica com ou sem conta). No convite, se o e-mail não chegar, o Proprietário gera um novo convite pela tela Membros (RF-29).
- Templates de e-mail em HTML simples, com o botão "Criar minha conta" (RF-06) e "Redefinir minha senha" (RF-32).

### DT-13 — Configuração e segredos
- **Decisão:** toda credencial e segredo (banco, JWT, SMTP) vem de variáveis de ambiente. Os arquivos de configuração trazem apenas nomes de variáveis, sem valores sensíveis. O repositório contém um `.env.example` sem valores reais.
- **Perfis:** `dev`, `test`, `prod`.
- A detecção de segredos no repositório usa o secret scanning nativo do GitHub (push protection), com a revisão do PR.

### DT-14 — Segurança HTTP
- **Decisão:** Spring Security em modo **stateless** (sem sessão de servidor). O vínculo do usuário com o workspace e o papel são **consultados a cada requisição** — a remoção de um membro tem efeito imediato (o usuário recebe `403 SEM_WORKSPACE` e o cliente o leva à tela "Sem Workspace").
- Autorização por papel e por posse no backend; o frontend só oculta ações. Recursos de outro workspace respondem `404`.
- CORS restrito à origem do aplicativo, por ambiente.
- **Risco aceito na V1:** não há limitação de tentativas (rate limiting) em login e recuperação de senha, por se tratar de projeto acadêmico sem produção. Deve ser tratado antes de qualquer uso em produção.

### DT-15 — Organização do código
- Backend e frontend se organizam **por domínio**, acompanhando o backlog (`auth`, `workspace`, `membros`, `projeto`, `tarefa`, `busca-filtros`, `dashboard`, `configuracoes`).
- Backend: separar controladores, serviços e repositórios; DTOs separados das entidades de persistência.
- Frontend: organização por funcionalidade (dados, domínio, apresentação).
- O domínio técnico `fundacao` reúne a estrutura inicial e não tem pacote próprio de negócio.
- O detalhamento fica nas skills de stack `stack-java-spring` e `stack-flutter-web`.

## 5. Riscos aceitos na V1

| Risco | Tratamento |
|---|---|
| Tokens armazenados no navegador (DT-05) | Mitigado por validade curta e rotação; reavaliar cookie `HttpOnly` antes de produção |
| Sem rate limiting (DT-14) | Aceito (projeto acadêmico); tratar antes de produção |
| Envio de e-mail sem fila e sem reenvio automático (DT-12) | Aceito; o Proprietário gera novo convite |
| Tokens expirados não são removidos do banco (`refresh_token`, `convite`, `recuperacao_senha`) | Aceito na V1; os índices por `usuario_id` mantêm as consultas rápidas. Rotina de limpeza antes de produção |

## 6. Onde cada decisão é aplicada

As decisões são aplicadas pelo framework SDD e pelo `AGENTS.md` do projeto, sem hooks locais:

| Decisão | Onde é aplicada |
|---|---|
| DT-01 a DT-04, DT-15 (frontend) | Skill `stack-flutter-web`; módulo `frontend` no `AGENTS.md`; Riverpod validado na revisão do PR |
| DT-05 a DT-10, DT-12, DT-14 (backend) | Skill `stack-java-spring`; módulo `backend` no `AGENTS.md`; história `HIST-XXX-fundacao` para a base técnica |
| DT-11 (testes e cobertura) | Verificação `entrega` (rastreabilidade) e cobertura mínima do `AGENTS.md`, nos checks do PR |
| DT-13 (segredos) | Variáveis de ambiente e secret scanning nativo do GitHub |
| Qualidade de código | Skill `padrao-codigo` e verificação `qualidade` |
| Rastreabilidade cenário ↔ teste | Agente `agente-testes` e verificação `entrega` |
