---
name: stack-java-spring
description: Usar ao implementar ou auditar um módulo de servidor em Java com Spring Boot, MySQL e Flyway. Define padrões de código, TDD com Testcontainers, formato de citação dos IDs de cenário nos testes, comandos de teste e cobertura, e o checklist de qualidade usado pelo agente-testes.
---

# Stack: Java + Spring Boot

Esta skill é a régua de um módulo de servidor Java. O `construtor` a segue; o `agente-testes` a aplica na auditoria. Decisões específicas do projeto (versões exatas, camadas, esquema de erros, segurança) ficam nos documentos do projeto listados no `AGENTS.md`. Em caso de conflito, **vale o documento do projeto**, e a divergência é registrada em "Pontos em aberto".

## 1. Estrutura e padrões

- **Camadas:** `controller` (HTTP) → `service` (regra de negócio) → `repository` (persistência). Controller não acessa repository. Regra de negócio não fica em controller nem em entidade JPA anêmica sem motivo.
- **DTOs** de entrada e saída separados das entidades. Nunca devolver entidade JPA na API.
- **Validação de entrada** com Bean Validation (`@Valid`) nos DTOs. Regras de negócio no service.
- **Erros** no formato do padrão de API do projeto (por padrão, RFC 7807 `application/problem+json`), centralizados em um único `@RestControllerAdvice`. Nenhum stack trace na resposta.
- **Banco:** MySQL. Todo esquema muda **somente por migração Flyway** versionada (`V<n>__descricao.sql`). Nunca editar migração já aplicada; criar nova. `spring.jpa.hibernate.ddl-auto` deve ser `validate` ou `none`.
- **Tempo:** injetar `java.time.Clock` e usar `Instant`/UTC. Proibido `LocalDateTime.now()`, `new Date()` e `System.currentTimeMillis()` na lógica de negócio. Isso torna o tempo testável.
- **Senhas:** BCrypt (`PasswordEncoder`). Nunca registrar senha, token ou segredo em log.
- **Tokens opacos (por exemplo, refresh):** persistir apenas o **hash** (SHA-256 ou superior), nunca o valor.
- **Configuração:** por propriedades e variáveis de ambiente. Nenhum segredo no código ou em arquivo versionado. `application.yml` só com valores não sensíveis.
- **Transações:** `@Transactional` no service, no menor escopo que preserve a consistência. Operações de leitura com `readOnly = true`.
- **Dependências:** só as necessárias. Não adicionar mensageria, cache ou outra infraestrutura que a história não exija.
- **Logs:** SLF4J. Sem `System.out` e sem `printStackTrace`.
- **Nomes:** pacotes por domínio (`...<dominio>.controller|service|repository|dto`), classes em inglês ou português conforme o projeto, de forma consistente.

## 2. TDD (ordem obrigatória)

Para cada cenário da história:

1. **Vermelho:** escreva o teste que traduz o "Dado/Quando/Então". Rode e veja **falhar pelo motivo certo**.
2. **Verde:** escreva o mínimo de código de produção que o faz passar.
3. **Refatore** mantendo tudo verde.

Tipos de teste:

| Tipo | Quando | Ferramentas |
|---|---|---|
| Unitário | Regra de negócio isolada no service | JUnit 5, Mockito, AssertJ |
| Integração | Fluxo HTTP → banco; migrações; consultas | `@SpringBootTest` ou `@WebMvcTest`/`@DataJpaTest`, **Testcontainers MySQL** |

Regras:

- Cenário com efeito no banco ou na API é testado em **integração**, com MySQL real em Testcontainers. Não usar H2 como substituto do MySQL.
- Um cenário pode ter mais de um teste, mas todo cenário tem ao menos um que verifica o "Então" completo.
- Testes independentes entre si e sem ordem implícita. Tempo controlado por `Clock` fixo.
- Use `@ParameterizedTest` para variações de dados e helpers/builders para montar cenários, mantendo cada teste simples e legível.
- Estrutura Arrange-Act-Assert em cada teste.
- Asserções específicas (AssertJ). Proibido teste sem asserção ou que só verifica "não lançou exceção" quando o cenário pede um resultado.

## 3. Citação do ID do cenário no teste

O ID qualificado `HIST-XXX-<dominio>/Cxx` deve aparecer no **`@DisplayName`** do teste. Exemplo:

```java
@Test
@DisplayName("HIST-003-projeto/C02 - criar projeto com nome no tamanho máximo")
void criaProjetoComNomeNoLimite() {
    // ...
}
```

Regras:

- O ID aparece **no texto do `@DisplayName`** (ou, se o teste for parametrizado, no `@ParameterizedTest(name = ...)` / `@DisplayName` da classe aninhada que o contém).
- Um teste cita o ID do cenário que verifica. Um teste **parametrizado** pode cobrir variações do mesmo cenário (um ID) ou cenários diferentes (IDs separados por vírgula: `HIST-003-projeto/C02, HIST-003-projeto/C03 - ...`), desde que as asserções cubram o "Então" de cada um.
- Nome do teste: ID, depois cenário e resultado esperado (`HIST-003-projeto/C02 - nome no limite máximo resulta em projeto criado`).
- Nenhum teste existe sem cenário de origem. Se a infraestrutura (por exemplo, uma migração) precisa de teste, ele cita o cenário que a exige. Única exceção: `QualidadeArquiteturaTest`, o teste de arquitetura do modelo `ai/templates/qualidade/java/`.

## 4. Comandos (executados na pasta do módulo)

| Objetivo | Comando |
|---|---|
| Suíte completa + cobertura + estilo (Checkstyle, PMD, ArchUnit) + verificação do mínimo | `./mvnw verify` |
| Só testes | `./mvnw test` |
| Teste específico | `./mvnw -Dtest=NomeDaClasse test` |
| Relatório de cobertura | `target/site/jacoco/index.html` |

- Exige Docker em execução (Testcontainers).
- O `pom.xml` deve configurar o **JaCoCo** com a regra `check` no `verify`, usando o mínimo de cobertura do `AGENTS.md`. Cobertura abaixo do mínimo **faz o build falhar**.
- O CI executa exatamente `./mvnw verify`. Se passa localmente com esse comando, passa no CI (salvo diferença de ambiente).

## 5. Padrão de código (`padrao-codigo`)

Aplicam-se todas as regras da skill `padrao-codigo`. Verificação nesta stack (configurações-modelo em `ai/templates/qualidade/java/`, entregues com o CI):

| Regra | Verificação | Tipo |
|---|---|---|
| Q-01 linha ≤ 120 | Checkstyle `LineLength` | O |
| Q-02 classe ≤ 100 linhas | `node tools/gates/verificar.js qualidade` (conta linhas de código sem comentários, brancos e imports) | O |
| Q-03 método ≤ 20 linhas | Checkstyle `MethodLength` (`countEmpty=false`) | O |
| Q-04 ≤ 3 parâmetros | Checkstyle `ParameterNumber` | O |
| Q-05 hard code | Checkstyle `MagicNumber` (ignora 0, 1, -1); textos de negócio: modo `qualidade` | O |
| Q-06 log centralizado | ArchUnit: sem `System.out`/`System.err`/`printStackTrace` e só a classe de logging usa a API de log | O |
| Q-07 mensagens centralizadas | ArchUnit e modo `qualidade` (texto solto em exceção ou resposta) | O |
| Q-08 nomes | Convenção Java: classes em `PascalCase`; métodos, parâmetros e variáveis em `camelCase`; constantes em `UPPER_SNAKE_CASE`; pacotes em minúsculas. Checkstyle `TypeName`, `MethodName`, `LocalVariableName`, `ConstantName`, `PackageName` | O |
| Q-09 código morto | PMD (`UnusedPrivateField`, `UnusedPrivateMethod`, `UnusedLocalVariable`, `UnusedFormalParameter`) e Checkstyle `UnusedImports` | O |
| Q-12 duplicação | PMD CPD | R |
| Q-10, Q-11, Q-13 a Q-18 | Leitura do `agente-testes` | R |

- O marcador `qualidade-exceção: <motivo>` é reconhecido pelo Checkstyle (`SuppressWithNearbyCommentFilter`).
- A configuração exata das ferramentas é validada no primeiro PR real; se uma ferramenta contar linhas de modo diferente da regra, corrige-se a configuração, nunca a regra.

## 6. Checklist de qualidade (usado pelo agente-testes)

Classificação: **B** = bloqueante (compromete corretude, segurança ou manutenibilidade); **E** = estilístico (registrar, não bloqueia).

| ID | Item | Tipo |
|---|---|---|
| J-01 | Controller não acessa repository nem contém regra de negócio | B |
| J-02 | Nenhuma entidade JPA exposta na API (usa DTO) | B |
| J-03 | Entradas externas validadas (Bean Validation e/ou service), com limites do contrato | B |
| J-04 | Erros no formato do padrão de API, via handler central, sem stack trace | B |
| J-05 | Esquema alterado apenas por migração Flyway nova; nenhuma migração antiga editada | B |
| J-06 | Sem `ddl-auto` que altere esquema (`validate` ou `none`) | B |
| J-07 | Tempo via `Clock`/`Instant` UTC; sem `now()` direto na lógica | B |
| J-08 | Senhas com BCrypt; tokens opacos persistidos só como hash | B |
| J-09 | Nenhum segredo, senha ou token em código, log ou arquivo versionado | B |
| J-10 | Autorização verificada no servidor para cada operação protegida (papel e pertencimento ao recurso) | B |
| J-11 | Consultas sem N+1 evidente nas listagens do contrato | B |
| J-12 | Testes de integração usam MySQL real (Testcontainers), não H2 | B |
| J-13 | Todo teste tem asserção significativa e cita um ID de cenário (exceto `QualidadeArquiteturaTest`) | B |
| J-14 | Sem dependência ou infraestrutura não exigida pela história | E |
| J-15 | Regras obrigatórias Q-01 a Q-09 sem violação (resultado do job de CI; cite o job e o local) | B |
| J-16 | Transações no service e no menor escopo | E |
| J-17 | Nomes e pacotes consistentes com o restante do módulo | E |
| J-18 | Regras recomendadas Q-10 a Q-18: cada alerta registrado com local (bloqueante só se compromete corretude ou manutenção) | E |

## O que nunca fazer

- Nunca usar H2 no lugar do MySQL nos testes de integração.
- Nunca editar migração Flyway já aplicada.
- Nunca escrever código de produção antes do teste vermelho.
- Nunca baixar o mínimo de cobertura ou excluir classes da medição para passar.
- Nunca registrar segredo ou token em log.
- Nunca desligar, afrouxar ou excluir arquivos de Checkstyle, PMD ou ArchUnit para passar.
- Nunca criar endpoint, campo ou regra que a história aprovada não pede.
