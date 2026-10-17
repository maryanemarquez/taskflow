# <Nome do projeto> — Regras para qualquer IA

> **Como usar este modelo:** renomeie este arquivo para `AGENTS.md`, substitua tudo que estiver entre `<...>` e apague esta nota. Este é o arquivo lido por qualquer ferramenta de IA (Copilot, Claude, Cursor etc.). É a fonte única das regras do projeto.

## Projeto

- Nome: `<nome do projeto>`
- Versão vigente do projeto: `<V1>`
- Versão do framework (`sdd-framework`): `<v0.1.0>`
- Idioma dos artefatos (documentos, histórias, relatórios): português do Brasil
- Cobertura mínima de testes: `80%`
- RNFs com meta mensurável exigidos na Definition of Done: `<ex.: RNF-05, RNF-06, RNF-08 — ou "nenhum">`

## Módulos

Cada módulo usa uma skill de stack. O `construtor` carrega a skill do módulo indicado na tarefa.

| Módulo | Pasta | Skill de stack | Referência externa |
|---|---|---|---|
| `<backend>` | `<backend/>` | `<stack-java-spring>` | `<não>` |
| `<frontend>` | `<frontend/>` | `<stack-flutter-web>` | `<caminho local fora do repositório, ou "não">` |

## Documentos do projeto

Toda história é redigida contra os documentos da **versão vigente**. O `gerenciador-historias` lê os caminhos desta tabela.

| Documento | Caminho |
|---|---|
| Domínio (visão, vocabulário de domínios, regras de negócio, perfis) | `<docs/dominio/...>` |
| Especificação (telas, fluxos, permissões) | `<docs/especificacao/...>` |
| Requisitos (RF, RNF, regras transversais) | `<docs/requisitos/...>` |
| Modelo de dados | `<docs/modelo-dados/...>` |
| Padrão de API | `<docs/arquitetura/...>` |
| Decisões técnicas | `<docs/arquitetura/...>` |
| Backlog (domínios e ordem de dependência) | `<docs/historias/...>` |

Ao mudar de versão do projeto, atualize apenas esta tabela e a linha "Versão vigente".

## Como o trabalho é organizado

- Processo completo: `ai/processo.md`. Leia antes de agir.
- Papéis: `ai/agentes/` (`gerenciador-historias`, `construtor`, `agente-testes`).
- Skills de processo e de stack: `ai/skills/`.
- Histórias: `docs/historias/HIST-XXX-<dominio>/` (`historia.md`, `relatorio-teste.md`).
- Branches: `historia/HIST-XXX-<dominio>` e `feature/HIST-XXX-<dominio>`.
- Commits: `tipo: HIST-XXX-<dominio> - descrição curta`.

## Como acionar cada papel

Abra uma sessão nova para cada papel e use uma destas instruções:

- **Gerenciador de histórias:**
  > Atue como `gerenciador-historias`, seguindo `ai/agentes/gerenciador-historias.md`. Pedido: `<descreva o que a história deve entregar>`.
- **Construtor:**
  > Atue como `construtor`, seguindo `ai/agentes/construtor.md`. História: `docs/historias/HIST-XXX-<dominio>/historia.md`. Módulo: `<nome do módulo>`.
- **Agente de testes:**
  > Atue como `agente-testes`, seguindo `ai/agentes/agente-testes.md`. História: `docs/historias/HIST-XXX-<dominio>/historia.md`. Evidência: `<link ou texto do resultado do CI>`.

## Regras que valem para qualquer IA, sempre

1. Nunca invente requisito, regra de negócio ou critério. Lacuna vira `[AMBÍGUO]` na história.
2. Nunca altere arquivos do núcleo do framework (`ai/`, `tools/`, `.github/`). Se achar um problema neles, descreva-o ao humano.
3. Nunca escreva segredos (senhas, chaves, tokens, strings de conexão com credencial) em arquivos. Use variáveis de ambiente e `.env.example` sem valores reais.
4. O escopo de uma história aprovada é imutável. Mudança de escopo exige nova versão da história.
5. Nenhum gate é pulado. Quem aprova os Gates 1 e 3 é o humano.
6. Todo teste cita o ID qualificado do cenário (`HIST-XXX-<dominio>/Cxx`), no formato da skill de stack.
7. Todo código e teste segue a skill `padrao-codigo` (estilo comum a todos os projetos). Regras obrigatórias bloqueiam o merge; as recomendadas alertam.
8. Em caso de dúvida, pare e pergunte, em vez de decidir sozinho.

## Referência externa (material visual ou de outro sistema)

Se algum módulo tem "Referência externa" preenchida:

- O material fica **fora do repositório**. Nunca copie, cole ou versione esse conteúdo.
- Somente o `construtor` do módulo indicado pode consultá-lo, e só para **aparência**: leiaute, hierarquia visual, espaçamento, estados de tela, paleta e tipografia.
- Nunca reproduza lógica de estado, chamadas de API, dados, autenticação, nomes de variáveis, funções ou propriedades.
- Um índice de uso (o que é liberado e o que é ignorado) fica nos documentos do projeto: `<caminho do índice, se houver>`.
- Dúvida sobre uma tela ou componente vai para "Pontos em aberto" da história.
