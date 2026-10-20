# HIST-002-fundacao — Base transversal do backend

## Visão geral

Entrega as capacidades transversais do `backend` de que as histórias de negócio dependem: persistência versionada (MySQL e Flyway, Hibernate em `validate`), erros HTTP em RFC 7807, `Clock` injetável em UTC, porta de e-mail com implementação Spring Mail e configuração por perfil (`dev`, `test`, `prod`) sem segredos versionados. Não cria tabelas de negócio.

Fora de escopo: tabelas de usuário, workspace, convite, projeto, tarefa, tag e tokens (cada domínio cria as suas); envio funcional de convite e recuperação de senha (`membros` e `auth`); endpoint de saúde ou de negócio; rate limiting e limpeza de tokens (riscos aceitos da V1); alterações em `.github/`, `ai/` e `tools/`.

Dependência: `HIST-001-fundacao`.

## Domínio

fundacao

## Origem

- Backlog, "Ordem de dependência" (linha `fundacao`) e "Observações".
- Decisões técnicas, DT-07 e DT-09 a DT-14.
- Padrão de API, seções 6 e 8.
- Modelo de dados, seções 1, 2 e 5.
- Requisitos, RNF-08 e RNF-13.

## Requisitos funcionais

1. O backend aplica as migrações Flyway ao iniciar e valida o esquema com Hibernate em `ddl-auto=validate`, sem criação automática pelo ORM.
   - Critério de aceitação: com MySQL 8.x disponível, a aplicação inicia, o Flyway aplica as migrações pendentes e o Hibernate valida o esquema; esquema divergente do mapeamento faz a inicialização falhar.
2. Erros tratados respondem em RFC 7807 (`application/problem+json`) com o campo `codigo`, conforme o Padrão de API.
   - Critério de aceitação: uma requisição que produz erro tratado recebe `type`, `title`, `status`, `detail`, `instance` e `codigo`, sem stack trace, SQL ou dados sensíveis.
3. Erros inesperados respondem com corpo genérico.
   - Critério de aceitação: uma falha interna resulta em `500` com corpo genérico no formato RFC 7807, sem detalhes internos.
4. O tempo atual vem de um `java.time.Clock` injetável, configurado em UTC (DT-09).
   - Critério de aceitação: um componente que consulta o horário usa o `Clock` injetado; um teste que fornece `Clock` fixo obtém exatamente o instante configurado; o `Clock` padrão está em UTC.
5. O envio de e-mail é feito por uma porta (`EmailSender`) substituível, com implementação Spring Mail configurada por variáveis de ambiente (DT-12).
   - Critério de aceitação: um teste com dublê da porta não abre conexão SMTP; uma falha de envio é registrada em log, sem segredos, e não altera a resposta ao usuário.
6. Os perfis `dev`, `test` e `prod` obtêm credenciais e segredos somente de variáveis de ambiente (DT-13).
   - Critério de aceitação: os arquivos de configuração versionados contêm apenas nomes de variáveis, sem valores reais de segredo; existe um `.env.example` sem valores reais; uma variável obrigatória ausente faz a inicialização falhar com mensagem que cita o nome da variável, sem valor.
7. A primeira migração (`V1__base_tecnica.sql`, apenas `SELECT 1;`) não cria tabelas de negócio.
   - Critério de aceitação: após a migração inicial, o esquema não contém as tabelas `usuario`, `workspace`, `usuario_workspace`, `convite`, `projeto`, `tarefa`, `tag`, `tarefa_tag`, `recuperacao_senha` nem `refresh_token`.

## Requisitos não-funcionais

- RNF-08: não se aplica. A história não entrega endpoints nem operações de negócio.
- RNF-13: nenhuma senha ou token é persistido em texto puro, e nenhum segredo entra em arquivo versionado ou log.
- Cobertura mínima de 80%, sem excluir código de produção da medição.

## Cenários Gherkin

Cenário: [C01] Inicializar o esquema versionado
  Dado que o MySQL 8.x está disponível e a configuração do backend está definida
  Quando a aplicação é inicializada
  Então o Flyway aplica as migrações pendentes
  E o Hibernate valida o esquema sem criá-lo

Cenário: [C02] Rejeitar divergência de esquema
  Dado que o esquema do banco não corresponde ao mapeamento do backend
  Quando a aplicação é inicializada
  Então a inicialização falha na validação do esquema
  E nenhum objeto é criado automaticamente pelo Hibernate

Cenário: [C03] Devolver erro tratado em RFC 7807
  Dado que uma requisição produz um erro tratado
  Quando a resposta é enviada
  Então o corpo usa `application/problem+json` com `type`, `title`, `status`, `detail`, `instance` e `codigo`

Cenário: [C04] Não expor detalhes internos no erro tratado
  Dado que uma requisição produz um erro tratado
  Quando a resposta é enviada
  Então o corpo não contém stack trace, SQL nem dados sensíveis

Cenário: [C05] Responder erro inesperado de forma genérica
  Dado que uma requisição provoca uma exceção não prevista
  Quando a resposta é enviada
  Então o status é 500
  E o corpo é genérico, em RFC 7807, sem detalhes internos

Cenário: [C06] Controlar o tempo em teste
  Dado um componente que depende do instante atual
  Quando o teste fornece um `Clock` fixo em UTC
  Então o componente usa exatamente o instante fornecido

Cenário: [C07] Usar UTC no relógio padrão
  Dado a aplicação com a configuração padrão
  Quando o `Clock` injetado é consultado
  Então seu fuso é UTC

Cenário: [C08] Substituir o envio de e-mail em teste
  Dado um componente que depende da porta de e-mail
  Quando o teste fornece um dublê da porta
  Então o componente usa o dublê sem abrir conexão SMTP

Cenário: [C09] Tolerar falha no envio de e-mail
  Dado que o envio de e-mail falha
  Quando a operação que o solicitou é concluída
  Então a falha é registrada em log sem segredos
  E a resposta ao usuário permanece a mesma de um envio bem-sucedido

Cenário: [C10] Referenciar segredos por variável de ambiente
  Dado os perfis `dev`, `test` e `prod`
  Quando a configuração versionada do backend é inspecionada
  Então ela referencia variáveis de ambiente e não contém valores reais de segredo

Cenário: [C11] Não criar tabelas de negócio
  Dado a migração inicial aplicada
  Quando o esquema do banco é inspecionado
  Então nenhuma tabela de negócio existe

Cenário: [C12] Falhar na inicialização sem variável obrigatória
  Dado um perfil com uma variável de ambiente obrigatória ausente
  Quando a aplicação é inicializada
  Então a inicialização falha com mensagem que cita o nome da variável
  E a mensagem não contém valores de segredo

## Contrato de Integração

Não se aplica. A história não define endpoints.

## Plano de execução

- Módulos ativados: backend
- Modo: não se aplica
- Justificativa: a história altera somente o módulo `backend` (skill `criterio-fluxo-execucao`, passo 2, módulo único).

## Decisões técnicas relevantes

- MySQL 8.x, Flyway e Hibernate `ddl-auto=validate` (DT-10); migrações em `db/migration`, arquivos `V<n>__descricao.sql`.
- `Clock` injetado e `Instant` em UTC; JVM, Hibernate e conexão MySQL em UTC (DT-09).
- Porta `EmailSender` com Spring Mail, envio assíncrono e `APP_BASE_URL` para links (DT-12).
- Perfis `dev`, `test` e `prod` e segredos por variáveis de ambiente (DT-13).
- Testes de integração com Testcontainers MySQL, sem H2 (DT-11).
- As classes centralizadas de logging e de mensagens (Q-06 e Q-07 de `padrao-codigo`) são criadas aqui, pois o tratador RFC 7807 as exige, e o fato é registrado nesta seção na implementação.
- A migração inicial é `V1__base_tecnica.sql`, com apenas `SELECT 1;`, para que o Flyway tenha um histórico. As migrações dos domínios começam em `V2`.
- Segredos (`DB_PASSWORD`, `JWT_SECRET`, `MAIL_PASSWORD`) usam placeholders sem valor padrão; só valores locais não sensíveis (host, porta, nome do banco) podem ter padrão. O teste usa Testcontainers e valores gerados no próprio teste.
## Pontos em aberto

Nenhum.
