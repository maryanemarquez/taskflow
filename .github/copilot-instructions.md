# Instruções para o GitHub Copilot

As regras deste repositório estão em `AGENTS.md` (fonte única, vale para qualquer IA). Leia-o antes de qualquer tarefa.

Este repositório segue um fluxo orientado por especificação com três papéis. O humano diz qual papel você assume:

- `gerenciador-historias`: siga `ai/agentes/gerenciador-historias.md`.
- `construtor`: siga `ai/agentes/construtor.md`, com a skill de stack do módulo indicada no `AGENTS.md`.
- `agente-testes`: siga `ai/agentes/agente-testes.md`.

Skills (padrões detalhados) ficam em `ai/skills/<nome>/SKILL.md`. Leia as que o papel manda usar, incluindo `ai/skills/padrao-codigo/SKILL.md` ao escrever ou auditar código.

Regras que sempre valem: nunca invente requisito; nunca altere `ai/`, `tools/` ou `.github/`; nunca escreva segredos em arquivos; o escopo de uma história aprovada é imutável; nenhum gate é pulado; na dúvida, pare e pergunte.
