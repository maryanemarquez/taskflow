# TaskFlow — Regras para qualquer IA

> Fonte única das regras do projeto, lida por qualquer ferramenta de IA (Copilot, Claude, Cursor etc.).
## Projeto

- Nome: `TaskFlow`
- Versão vigente do projeto: `V1`
- Versão do framework (`sdd-framework`): `v0.1.1`
- Idioma dos artefatos (documentos, histórias, relatórios): português do Brasil
- Cobertura mínima de testes: `80%`
- Versão do Java: `21`
- Versão do Flutter: `stable`
- RNFs com meta mensurável exigidos na Definition of Done: RNF-05, RNF-06, RNF-08

## Módulos

Cada módulo usa uma skill de stack. O `construtor` carrega a skill do módulo indicado na tarefa.

| Módulo | Pasta | Skill de stack | Referência externa |
|---|---|---|---|
| `backend` | `backend/` | `stack-java-spring` | não |
| `frontend` | `frontend/` | `stack-flutter-web` | `rf-taskflow`: cópia local fora do repositório (cada desenvolvedor informa o caminho na sessão) |

## Documentos do projeto

Toda história é redigida contra os documentos da **versão vigente (V1)**. O `gerenciador-historias` lê os caminhos desta tabela.

| Documento | Caminho |
|---|---|
| Domínio (visão, vocabulário de domínios, regras de negócio, perfis) | `docs/dominio/TaskFlow_V1_Dominio.md` |
| Especificação (telas, fluxos, permissões) | `docs/especificacao/TaskFlow_V1_Especificacao.md` |
| Requisitos (RF, RNF, regras transversais) | `docs/requisitos/TaskFlow_V1_Requisitos.md` |
| Modelo de dados | `docs/modelo-dados/TaskFlow_V1_Modelo_Dados_ER.md` |
| Padrão de API | `docs/arquitetura/TaskFlow_V1_Padrao_API.md` |
| Decisões técnicas | `docs/arquitetura/TaskFlow_V1_Decisoes_Tecnicas.md` |
| Backlog (domínios e ordem de dependência) | `docs/historias/TaskFlow_V1_Backlog.md` |
| Índice da referência visual | `docs/referencia-visual-indice.md` |

Ao mudar de versão do projeto, atualize apenas esta tabela e a linha "Versão vigente".

## Como o trabalho é organizado

- Processo completo: `ai/processo.md`. Leia antes de agir.
- Papéis: `ai/agentes/` (`gerenciador-historias`, `construtor`, `agente-testes`).
- Skills de processo e de stack: `ai/skills/`.
- Histórias: `docs/historias/HIST-XXX-<dominio>/` (`historia.md`, `relatorio-teste.md`). A numeração é por domínio; o primeiro domínio é `fundacao`.
- Branches: `historia/HIST-XXX-<dominio>` e `feature/HIST-XXX-<dominio>`.
- Commits: `tipo: HIST-XXX-<dominio> - descrição curta`.

## Como acionar cada papel

Abra uma sessão nova para cada papel e use uma destas instruções:

- **Gerenciador de histórias:**
  > Atue como `gerenciador-historias`, seguindo `ai/agentes/gerenciador-historias.md`. Pedido: `<descreva o que a história deve entregar>`.
- **Construtor:**
  > Atue como `construtor`, seguindo `ai/agentes/construtor.md`. História: `docs/historias/HIST-XXX-<dominio>/historia.md`. Módulo: `backend` ou `frontend`.
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
9. Decisões técnicas do projeto (DT-01 a DT-15) estão em `docs/arquitetura/TaskFlow_V1_Decisoes_Tecnicas.md`. Desvio exige registro em "Pontos em aberto" e aprovação no Gate 1.

## Referência externa (material visual ou de outro sistema)

O módulo `frontend` tem referência visual (`rf-taskflow`, em Vite + React + Supabase):

- O material fica **fora do repositório**. Nunca copie, cole ou versione esse conteúdo.
- Somente o `construtor` do módulo `frontend` pode consultá-lo, e só para **aparência**: leiaute, hierarquia visual, espaçamento, estados de tela, paleta e tipografia.
- Nunca reproduza lógica de estado, chamadas de API, dados, autenticação (Supabase), nomes de variáveis, funções ou propriedades.
- O índice de uso (o que é liberado e o que é ignorado) está em `docs/referencia-visual-indice.md`. Item marcado ❌ ou ❓ não é implementado. A validação desse índice é a primeira tarefa do frontend (história de `fundacao`).
- Dúvida sobre uma tela ou componente vai para "Pontos em aberto" da história.
