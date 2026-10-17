---
name: diagnostico-falha
description: Usar sempre que a auditoria encontrar falha de teste, de rastreabilidade, de cobertura ou de qualidade bloqueante. Define como classificar a causa raiz e exigir citação de origem real, para o Gate 2 humano decidir com informação de verdade.
---

# Diagnóstico de Falha (agente-testes)

## Princípio

O agente de testes nunca decide sozinho para onde o processo volta. Mas a qualidade da decisão humana no Gate 2 depende inteiramente da qualidade do diagnóstico. Um diagnóstico vago obriga o humano a investigar do zero.

## Classificação obrigatória (uma das duas)

### Falha de código

A história e o cenário estavam corretos e sem ambiguidade. A implementação não atende ao que já estava claramente definido.

**Citação exigida:** arquivo e trecho de código, mais o que o cenário pedia versus o que o código faz.

### Falha de história ou critério mal definido

O cenário ou o critério testado era ambíguo, incompleto ou inconsistente com outro critério da mesma história. A implementação pode estar "certa" para uma leitura razoável do que foi pedido.

**Citação exigida:** trecho exato do cenário ou critério, mais a ambiguidade específica. Não vale "estava confuso"; vale "o critério diz X, mas não define o que acontece quando Y".

Se as duas causas coexistirem, registre dois blocos separados e justifique.

## Formato (dentro do `relatorio-teste.md`)

```markdown
### <nome do cenário ou item>

**Classificação:** Falha de código | Falha de história/critério mal definido

**Evidência:**
<citação real: arquivo e linha, ou trecho exato do cenário ou critério>

**Esperado versus ocorrido:**
<comparação objetiva, sem opinião de estilo>

**Recomendação (não vinculante):** <retorno ao construtor | ao gerenciador-historias>
```

## O que nunca fazer

- Nunca escrever "a validação não funcionou como esperado" ou "o teste falhou por inconsistência" sem apontar arquivo e trecho reais.
- Nunca classificar como "falha de história" só porque é mais rápido do que investigar o código. A citação exigida obriga a investigação.
- Nunca omitir a recomendação por receio de "decidir por conta própria": ela é insumo para o Gate 2, e a decisão continua sendo humana.
