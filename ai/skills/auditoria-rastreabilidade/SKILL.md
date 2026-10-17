---
name: auditoria-rastreabilidade
description: Usar sempre que o agente-testes avaliar a entrega de um construtor. Define a evidência aceita, a matriz cenário↔teste por ID, a conferência de cobertura, o uso do checklist da skill de stack e o formato exato do relatorio-teste.md.
---

# Auditoria e Rastreabilidade (agente-testes)

## Princípio central

Esta skill **não define** padrão de qualidade. Ela aplica, de forma independente, o checklist da **skill de stack** do módulo e as regras da skill `padrao-codigo`. Se um item de qualidade não está em nenhuma delas, não é achado de auditoria: é sinal de que a skill precisa ser atualizada, o que é feito fora do fluxo da história, pelo humano.

## O que o robô já confere (não repita, apenas registre)

- O CI da stack executa testes e falha abaixo da cobertura mínima.
- A verificação `entrega` confere os IDs e o formato do relatório.

A sua função é o que o robô não faz: ler o corpo dos testes, avaliar qualidade e diagnosticar.

## Passo 1: evidência de execução

Aceitas, nesta ordem de preferência:

1. **Resultado do CI do PR** (link ou texto), com os números por módulo.
2. **Execução local** dos comandos da skill de stack, com a saída registrada literalmente.

Registre a fonte em "Fonte da evidência". Sem evidência, não escreva o relatório. Resultado factual sempre com números: quantos testes, quantos passaram, quantos falharam. "Os testes passam" não é evidência.

## Passo 2: matriz cenário ↔ teste, por ID

Para cada cenário da história (versão mais recente), com ID qualificado `HIST-XXX-<dominio>/Cxx`:

1. Localize o teste que cita esse ID (arquivo e nome do teste).
2. **Leia o corpo do teste** e confirme que ele verifica o "Então" do cenário, não só que o nome combina.
3. Classifique:

| Status | Significado |
|---|---|
| `Rastreado e correto` | O teste existe e verifica o que o cenário pede |
| `Rastreado mas insuficiente` | O teste existe, mas a asserção não cobre o "Então" por completo |
| `Não rastreado` | Nenhum teste cita o ID |

Também registre qualquer teste que cite um ID inexistente na história. Cenário `Não rastreado` ou `Rastreado mas insuficiente` é pendência.

## Passo 3: cobertura

Confira a cobertura **medida** (relatório do CI ou da ferramenta de cobertura), nunca a declarada pelo construtor. Abaixo do mínimo do `AGENTS.md` é pendência bloqueante, mesmo com todos os testes passando.

## Passo 4: checklist de qualidade

Aplique, item a item, o checklist da skill de stack do módulo ao código entregue (o diff do PR). Para as regras de `padrao-codigo` que a ferramenta verifica (Q-01 a Q-09), registre o resultado do job de CI; para as que só a leitura alcança (Q-10, Q-11, Q-14 a Q-18), leia o código e os testes. Registre cada achado com localização exata (arquivo e trecho). Nada genérico.

## Passo 5: RNFs mensuráveis

Para cada RNF listado no `AGENTS.md` como exigido na Definition of Done, registre se se aplica à história e como foi verificado, ou a justificativa de não aplicabilidade.

## Passo 6: classificação de pendência

| Tipo de achado | Bloqueia o Gate 3? |
|---|---|
| Cenário não rastreado ou insuficiente | Sim |
| Cobertura abaixo do mínimo | Sim |
| Teste falhando | Sim |
| Violação do checklist que compromete corretude ou manutenibilidade | Sim |
| Violação de regra **obrigatória** de `padrao-codigo` (Q-01 a Q-09) | Sim |
| Violação de regra **recomendada** de `padrao-codigo` | Não, salvo se comprometer corretude ou manutenibilidade; registre como alerta |
| Violação meramente estilística | Não; registre a diferença explicitamente |

## Formato do relatório

Use `ai/templates/relatorio-teste.md`. Pontos que a verificação `entrega` confere:

- Existe **uma única** linha começando com `Veredito:`, com `LIBERADO` ou `BLOQUEADO`. Exemplos válidos: `Veredito: LIBERADO` e `Veredito: BLOQUEADO`. Sem emoji, sem negrito, sem texto antes da palavra `Veredito`.
- A matriz de rastreabilidade lista **todos** os IDs da história.
- Com `BLOQUEADO`, existe pelo menos um bloco "Diagnóstico de falha" com `**Classificação:**` e `**Evidência:**` preenchidos (skill `diagnostico-falha`).
- Registre o número do ciclo. Passado o terceiro, recomende reavaliar a história.

## O que nunca fazer

- Nunca aceitar "já rodei e passou" sem evidência.
- Nunca fechar a matriz com lacuna sem registrar.
- Nunca criar critério de qualidade próprio.
- Nunca alterar código para "ajudar" a passar.
