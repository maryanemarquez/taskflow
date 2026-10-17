# Processo de Desenvolvimento (sdd-framework)

Desenvolvimento orientado por especificação, com TDD, aprovação humana em pontos fixos (HITL) e verificações automáticas no GitHub. O processo não depende de nenhuma ferramenta de IA: qualquer IA que leia este repositório consegue executá-lo.

Escopo: projetos individuais ou acadêmicos. Itens que só importam em produção estão listados em "Limites conhecidos".

---

## 1. Ideia central

- O **repositório é o canal de comunicação**. Nenhuma IA precisa "lembrar" de conversas anteriores: tudo que importa está em arquivos versionados.
- **Você (humano) orquestra.** Cada papel é executado em uma sessão separada, por qualquer IA, a partir do arquivo do papel.
- **O robô é o juiz.** Quem confere o resultado é a verificação automática do GitHub, não a IA que escreveu o código.

## 2. Camadas do framework

| Camada | Onde | Muda por projeto? |
|---|---|---|
| Núcleo | `ai/processo.md`, `ai/agentes/`, `ai/skills/` (processo), `ai/templates/`, `tools/`, `.github/` | Não |
| Skills de stack | `ai/skills/stack-*` | Você escolhe quais usar por módulo |
| Projeto | `docs/`, `AGENTS.md` | Sim |

Regra de ouro: um projeto **não edita** arquivos do núcleo. Correções de processo nascem no `sdd-framework` e são copiadas para os projetos.

## 3. Fluxo por história

```
Pedido
  → [gerenciador-historias] escreve historia.md          (branch historia/HIST-XXX-<dominio>)
  → PR de história → verificação "historia"
  ► GATE 1: você revisa e faz o merge
  → [construtor] implementa por TDD, por módulo          (branch feature/HIST-XXX-<dominio>)
  → PR de entrega (rascunho) → CI da stack roda testes e cobertura
  → [agente-testes] escreve relatorio-teste.md a partir da evidência
  ► GATE 2 (só se houver falha): você decide o destino
  → PR de entrega pronto → verificação "entrega"
  ► GATE 3: você revisa e faz o merge
```

### 3.1 Gates

| Gate | Quando | O que você avalia | Se aprovado |
|---|---|---|---|
| 1 | PR da história com a verificação `historia` verde | Checklist de Definition of Ready (seção 5) | Merge: a história está oficial |
| 2 | Agente de testes reporta falha | A falha é de código ou de história mal definida? | Volta ao construtor ou ao gerenciador |
| 3 | PR de entrega com todas as verificações verdes e relatório `LIBERADO` | Definition of Done (seção 6) | Merge: a história está encerrada |

Entre gates, o trabalho flui sem esperar aprovação.

## 4. Papéis

| Papel | Arquivo | Entrada | Saída |
|---|---|---|---|
| `gerenciador-historias` | `ai/agentes/gerenciador-historias.md` | Pedido, documentos do projeto, histórias anteriores do mesmo domínio | `docs/historias/HIST-XXX-<dominio>/historia.md` |
| `construtor` | `ai/agentes/construtor.md` | História aprovada, módulo e skill de stack | Código e testes no módulo |
| `agente-testes` | `ai/agentes/agente-testes.md` | História, código, evidência de execução | `relatorio-teste.md` |

O `construtor` é genérico: a tecnologia vem da **skill de stack** do módulo (`ai/skills/stack-*`), indicada no `AGENTS.md` do projeto.

**Paralelismo:** backend e frontend só trabalham em paralelo se a história tiver Contrato de Integração completo, aprovado no Gate 1. Sem contrato, a execução é sequencial.

## 5. Gate 1: Definition of Ready

A estrutura é conferida pela verificação `historia`. O checklist abaixo é para a sua revisão de **conteúdo**:

- [ ] Todo requisito funcional tem critério de aceitação verificável (nenhum `[AMBÍGUO]` sem justificativa aceitável).
- [ ] Cenários cobrem caminho feliz, borda e negativo, onde há lógica de decisão.
- [ ] O domínio identificado faz sentido (ou há `[DOMÍNIO A DEFINIR]` com motivo claro).
- [ ] A seção "Origem" referencia de fato os documentos e seções corretos.
- [ ] O plano de execução condiz com o que a história altera.
- [ ] Se há mais de um módulo em paralelo, o Contrato de Integração está completo e coerente com o padrão de API do projeto.
- [ ] Nenhuma decisão técnica complexa foi "resolvida" sem passar por "Pontos em aberto"; desvios das decisões técnicas do projeto estão registrados lá.

## 6. Gate 3: Definition of Done

| Critério | Quem confere |
|---|---|
| Todos os critérios de aceitação atendidos | Você |
| Todo cenário Gherkin tem teste que cita seu ID | Verificação `entrega` |
| Suíte passando e cobertura ≥ mínimo do projeto (padrão 80%) | CI da stack |
| Regras obrigatórias de `padrao-codigo` sem violação (alertas das recomendadas revisados) | CI da stack e agente de testes |
| RNFs mensuráveis listados no `AGENTS.md` verificados, ou não aplicabilidade justificada no relatório | Agente de testes e você |
| `relatorio-teste.md` com `Veredito: LIBERADO` e sem pendência bloqueante | Verificação `entrega` e você |
| Artefatos da história versionados no PR | Você |

A história se encerra no **merge do PR de entrega**. Não há arquivo marcador.

## 7. Verificações automáticas

| Verificação | Quando roda | O que confere |
|---|---|---|
| `historia` | PR do branch `historia/*` | Seções obrigatórias, cenários com ID e sintaxe, marcadores listados em "Pontos em aberto", Contrato de Integração em modo paralelo |
| CI da stack (um job por módulo) | PR que altera a pasta do módulo | Testes, cobertura mínima e regras obrigatórias de `padrao-codigo` (bloqueiam); regras recomendadas apenas alertam |
| `entrega` | PR do branch `feature/*` | Rastreabilidade ID↔teste, relatório com veredito `LIBERADO` em formato único, matriz completa |
| Secret scanning | Todo push (recurso do GitHub) | Segredos no código |

A proteção do branch `main` impede o merge se alguma verificação obrigatória falhar. As mesmas verificações podem ser rodadas na sua máquina antes do push (ver README).

## 8. Branches, PRs e commits

| Item | Padrão |
|---|---|
| Branch da história | `historia/HIST-XXX-<dominio>` |
| Branch da implementação | `feature/HIST-XXX-<dominio>` |
| Commit | `tipo: HIST-XXX-<dominio> - descrição curta` (um commit = uma unidade coerente) |
| PR de história | Contém só `historia.md`; passa no Gate 1 antes de qualquer código |
| PR de entrega | Aberto como rascunho no primeiro push; pronto para revisão quando o relatório estiver `LIBERADO` |

`XXX` é sequencial **por domínio**, começando em `001` (ex.: `HIST-001-auth`, `HIST-002-auth`, `HIST-001-projeto`). O identificador completo, com o domínio, é único no projeto.

## 9. Rastreabilidade por ID

- Cada cenário Gherkin tem um ID local na história: `[C01]`, `[C02]`...
- O teste cita o **ID qualificado**: `HIST-XXX-<dominio>/C01`, no nome ou na descrição do teste. Um teste parametrizado pode citar mais de um ID. O formato exato por tecnologia está na skill de stack.
- A verificação `entrega` falha se algum ID da história não aparece em nenhum teste, ou se um teste cita um ID que não existe na história.

## 10. Regras de ouro

- **Nenhuma etapa avança sem artefato salvo em arquivo.**
- **Nenhuma IA pula um gate.**
- **Escopo imutável durante a implementação.** Mudança de escopo volta ao gerenciador e gera nova versão da história (`historia-v2.md`), sem sobrescrever.
- **Cobertura mínima é critério objetivo**, não sugestão.
- **Máximo de 3 ciclos de retrabalho por história.** Passado disso, pare e reavalie a história com o gerenciador. O número do ciclo é registrado no relatório; a decisão é sua, no Gate 2.
- **Falso positivo de verificação se corrige no script**, nunca contornando com instrução à IA.

## 11. Versionamento das histórias

- `historia.md` é a versão inicial; mudanças de escopo pós-aprovação geram `historia-v2.md`, `historia-v3.md`... na mesma pasta.
- O relatório indica qual versão foi avaliada. A verificação `entrega` usa sempre a versão mais recente.

## 12. O que foi deliberadamente simplificado

- Não há agentes dedicados de revisão de código, segurança ou desempenho. Qualidade fica no checklist da skill de stack e em `padrao-codigo`, aplicados pelo CI e pelo `agente-testes`; segurança básica fica no secret scanning do GitHub e na sua revisão.
- A verificação de comportamento é por rastreabilidade (ID↔teste), não por execução em ferramenta BDD. A exigência de citar o ID reduz a brecha, sem eliminá-la.
- Não há orquestração automática entre papéis: você conduz.

## 13. Limites conhecidos

- O CI garante que o teste existe, cita o cenário e passa. Não garante que o teste seja bom: essa avaliação é do `agente-testes` e sua, no Gate 3.
- Isolamento de material sensível (como uma referência visual externa) é por estrutura e instrução, não por bloqueio técnico.
- Itens de produção (limite de tentativas de login, cookies seguros, limpeza de dados antigos) devem ser tratados nas decisões técnicas do projeto antes de qualquer uso real.
