# Relatório de Teste — HIST-XXX-<dominio>

- História avaliada: <historia.md | historia-vN.md>
- Ciclo: <1, 2, 3...>
- Fonte da evidência: <CI do PR (link) | execução local (comandos executados)>

## Resultado da reexecução

| Módulo | Comando | Testes | Passaram | Falharam | Cobertura | Mínimo |
|---|---|---|---|---|---|---|
| <módulo> | <comando da skill de stack> | <n> | <n> | <n> | <xx%> | <80%> |

## Rastreabilidade cenário ↔ teste

Status permitidos: `Rastreado e correto`, `Rastreado mas insuficiente`, `Não rastreado`.

| ID | Teste (arquivo e nome) | Status |
|---|---|---|
| HIST-XXX-<dominio>/C01 | <caminho do arquivo: nome do teste> | <Rastreado e correto | Rastreado mas insuficiente | Não rastreado> |

## RNFs verificados

| RNF | Aplica-se? | Como foi verificado ou justificativa |
|---|---|---|
| <RNF-xx> | <sim | não> | <evidência ou motivo> |

## Achados de qualidade

| Item do checklist | Local (arquivo e trecho) | Bloqueante? |
|---|---|---|
| <item> | <local exato> | <sim | não> |

## Diagnóstico de falha

<Se o veredito for LIBERADO, escreva "Não se aplica". Se for BLOQUEADO, preencha um bloco por falha, conforme a skill diagnostico-falha:>

### <nome do cenário ou item>

**Classificação:** <Falha de código | Falha de história/critério mal definido>

**Evidência:**
<citação real: arquivo e linha, ou trecho exato do cenário ou critério>

**Esperado versus ocorrido:**
<comparação objetiva>

**Recomendação (não vinculante):** <retorno ao construtor | ao gerenciador-historias>

## Veredito

Veredito: <LIBERADO ou BLOQUEADO>
