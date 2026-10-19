# sdd-framework

Um fluxo de desenvolvimento **orientado por especificação**, com TDD, aprovação humana em pontos fixos e verificações automáticas no GitHub. Funciona com qualquer IA (Copilot, Claude, Cursor e outras), porque tudo o que a IA precisa saber está em arquivos Markdown do repositório.

Este repositório é um **modelo (template)**: você cria um projeto novo a partir dele e preenche só o que é específico do projeto.

---

## 1. Princípios

1. **O repositório é o canal.** Nada depende da memória de uma conversa.
2. **Você orquestra.** Cada papel (gerenciador de histórias, construtor, agente de testes) roda em uma sessão separada.
3. **O robô é o juiz.** Testes, cobertura e rastreabilidade são conferidos pelo GitHub, não pela IA que escreveu o código.
4. **Tecnologia é detalhe de skill.** Os papéis são genéricos; Java, Flutter, Python etc. entram por uma skill de stack.

## 2. Estrutura

| Pasta ou arquivo | Dono | O que é |
|---|---|---|
| `ai/processo.md` | Framework | Processo completo, gates e Definition of Done |
| `ai/agentes/` | Framework | Os 3 papéis |
| `ai/skills/` | Framework | Skills de processo e `stack-*` (uma por tecnologia) |
| `ai/templates/` | Framework | Modelos de `historia.md` e `relatorio-teste.md`, e configurações de qualidade (`qualidade/`) |
| `tools/gates/` | Framework | Script de verificação (`verificar.js`) e seus testes |
| `.github/` | Framework | Workflows de CI, modelo de PR e instruções do Copilot |
| `CLAUDE.md`, `.claude/agents/` | Framework | Adaptadores finos para o Claude Code (só apontam para `AGENTS.md` e `ai/`) |
| `exemplos/` | Framework | Histórias de exemplo para testar as verificações (apague no projeto) |
| `AGENTS.template.md` | Framework | Modelo do `AGENTS.md` do projeto |
| `AGENTS.md` | **Projeto** | Regras, módulos e documentos do projeto |
| `docs/` | **Projeto** | Domínio, especificação, requisitos, histórias etc. |
| `backend/`, `frontend/`... | **Projeto** | Código, por módulo |

**Regra de ouro:** o projeto não edita os arquivos do framework. Se algo estiver errado neles, a correção é feita aqui e copiada para os projetos.

## 3. O fluxo de uma história

```
Pedido
  → gerenciador-historias escreve historia.md      branch historia/HIST-XXX-<dominio>
  → PR da história → verificação "historia"
  ► GATE 1: você revisa e faz o merge
  → construtor implementa por TDD                  branch feature/HIST-XXX-<dominio>
  → PR de entrega (rascunho) → CI roda testes e cobertura
  → agente-testes escreve relatorio-teste.md
  ► GATE 2 (só se houver falha): você decide o destino
  → PR de entrega pronto → verificação "entrega"
  ► GATE 3: você revisa e faz o merge
```

| Gate | Onde você decide | O que o robô já conferiu |
|---|---|---|
| 1 | PR da história | Estrutura da história, cenários e IDs |
| 2 | Conversa com o diagnóstico do agente de testes | Testes que falharam |
| 3 | PR de entrega | Testes, cobertura, rastreabilidade, veredito do relatório |

Detalhes e checklists: [`ai/processo.md`](ai/processo.md).

## 4. Os papéis e como acioná-los

Abra uma **sessão nova** na sua IA para cada papel e cole a instrução:

| Papel | Instrução |
|---|---|
| Gerenciador de histórias | `Atue como gerenciador-historias, seguindo ai/agentes/gerenciador-historias.md. Pedido: <o que a história deve entregar>.` |
| Construtor | `Atue como construtor, seguindo ai/agentes/construtor.md. História: docs/historias/HIST-XXX-<dominio>/historia.md. Módulo: <nome>.` |
| Agente de testes | `Atue como agente-testes, seguindo ai/agentes/agente-testes.md. História: docs/historias/HIST-XXX-<dominio>/historia.md. Evidência: <resultado do CI>.` |

A IA lê o arquivo do papel, o `AGENTS.md` do projeto e as skills que o papel manda usar. Você pode usar uma IA diferente em cada sessão.

## 5. Verificações automáticas

| Verificação | Quando roda | Para que serve |
|---|---|---|
| `historia` | PR de branch `historia/*` | Impede história mal estruturada (seções, cenários com ID, marcadores) |
| Job da stack (ex.: `java-spring`, `flutter-web`) | PR que altera a pasta do módulo | Roda testes, exige a cobertura mínima e as regras obrigatórias de estilo (`padrao-codigo`); regras recomendadas só geram alerta |
| `entrega` | PR de branch `feature/*` | Confere se todo cenário tem teste que o cita e se o relatório está `LIBERADO` |
| Secret scanning do GitHub | Todo push | Bloqueia segredos no código |

Você também pode rodar o script na sua máquina antes do push (precisa do Node.js):

```
node tools/gates/verificar.js historia docs/historias/HIST-001-auth/historia.md
node tools/gates/verificar.js entrega docs/historias/HIST-001-auth --testes auto
node tools/gates/verificar.js entrega docs/historias/HIST-001-auth --testes backend/src/test,frontend/test
node tools/gates/verificar.js lcov frontend/coverage/lcov.info --min 80
node tools/gates/verificar.js qualidade backend/src frontend/lib frontend/test
node tools/gates/verificar.js modulos stack-java-spring
```

- `--testes auto` e `--min auto` leem os módulos e a cobertura mínima do `AGENTS.md`.
- Saída `0` = ok, `1` = violação, `2` = erro de uso ou de ambiente (o script nunca aprova por engano).
- O próprio script tem testes: `node --test tools/gates/verificar.test.js`. O job `autoteste` os roda em todo PR.
- Em caso de falso positivo, corrija o script no `sdd-framework`; nunca contorne com instrução à IA.

## 6. Criando um projeto novo

1. No GitHub, abra o repositório `sdd-framework` e clique em **Use this template → Create a new repository**.
2. Escolha o nome e a visibilidade do projeto e crie.
3. Clone o projeto na sua máquina e abra a pasta na IDE.
4. Renomeie `AGENTS.template.md` para `AGENTS.md` e preencha: nome, versão, módulos (com a skill de stack de cada um) e caminhos dos documentos.
5. Crie os documentos do projeto em `docs/` (domínio, especificação, requisitos etc.).
   Copie também as configurações de qualidade de cada stack para o módulo (veja `ai/templates/qualidade/README.md`).
6. Apague a pasta `exemplos/`, se existir.
7. Configure o repositório (seção 7).
8. Peça a primeira história ao gerenciador.

## 7. Configurando o repositório no GitHub

Faça uma vez por repositório.

1. **Proteger a `main`:** Settings → Rules → Rulesets → New branch ruleset.
   - Alvo: branch `main`.
   - Marque *Require a pull request before merging*, **sem** exigir aprovações (você trabalha sozinha).
   - Marque *Require status checks to pass* e adicione as verificações: `historia`, `entrega` e o job de cada stack em uso (`java-spring`, `flutter-web`). Jobs pulados (por exemplo, `historia` em um branch `feature/*`) contam como sucesso. Confira os nomes exatos na aba *Checks* do primeiro PR.
2. **Segredos:** Settings → Code security → ative *Secret scanning* e *Push protection*.
3. **Modelo (só no `sdd-framework`):** Settings → General → marque *Template repository*.
4. **Apagar branches mesclados:** Settings → General → *Automatically delete head branches*.

5. **Versão do framework (só no `sdd-framework`):** depois que as verificações estiverem validadas no primeiro PR real, marque a versão: `git tag v0.1.0` e `git push origin v0.1.0`. Os projetos registram essa versão no `AGENTS.md`.

Em repositório público, esses recursos são gratuitos. Em repositório privado, algumas regras podem exigir plano pago: confira antes.

## 8. Rotina de uma história, passo a passo

1. **Criar o branch da história:**
   ```
   git checkout main
   git pull
   git checkout -b historia/HIST-001-auth
   ```
2. **Pedir a história** ao gerenciador (seção 4). Ele cria `docs/historias/HIST-001-auth/historia.md`.
3. **Enviar e abrir o PR:**
   ```
   git add .
   git commit -m "docs: HIST-001-auth - história"
   git push -u origin historia/HIST-001-auth
   ```
   No GitHub, clique em **Compare & pull request**.
4. **Gate 1:** espere o ✅ da verificação `historia`, revise o texto com o checklist do PR e faça **Merge**.
5. **Criar o branch da implementação** a partir da `main` atualizada:
   ```
   git checkout main
   git pull
   git checkout -b feature/HIST-001-auth
   ```
6. **Acionar o construtor** (um módulo por vez, no começo). Ele escreve os testes antes do código e faz commits pequenos.
7. **Abrir o PR de entrega como rascunho** (*Create draft pull request*) no primeiro push. O CI roda os testes e a cobertura.
8. **Acionar o agente de testes** com o resultado do CI. Ele escreve `relatorio-teste.md`.
   - Se o veredito for `BLOQUEADO`, vá ao Gate 2: você decide se volta ao construtor ou ao gerenciador.
9. **Gate 3:** com todas as verificações verdes e `Veredito: LIBERADO`, marque o PR como pronto, revise com o checklist e faça **Merge**.

## 9. Atualizando o framework num projeto

O modelo do GitHub copia os arquivos uma vez e não atualiza depois.

1. Veja a versão do framework registrada no `AGENTS.md` do projeto.
2. No `sdd-framework`, confira se há uma versão mais nova (aba *Releases* ou tags).
3. Copie para o projeto apenas as pastas do framework (`ai/`, `tools/`, `.github/`), sem tocar em `docs/` nem em `AGENTS.md`.
4. Atualize a linha "Versão do framework" no `AGENTS.md` e faça o commit.

## 10. Limites conhecidos

- O CI garante que o teste existe, cita o cenário e passa. A **qualidade** do teste continua sendo revisada por você no Gate 3.
- Material externo sensível (como uma referência visual) é isolado por estrutura e por instrução, não por bloqueio técnico: mantenha-o fora do repositório.
- Itens de produção (limite de tentativas de login, armazenamento seguro de sessão, limpeza de dados antigos) precisam ser tratados pelo projeto antes de qualquer uso real.

## 11. Licença

Defina a licença ao criar o repositório (por exemplo, MIT).
