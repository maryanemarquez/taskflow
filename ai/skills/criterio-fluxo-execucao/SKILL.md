---
name: criterio-fluxo-execucao
description: Usar ao final da redação da história, para decidir objetivamente quais módulos ativar e se a execução pode ser paralela. Critério objetivo, não intuição.
---

# Critério de Fluxo de Execução

Define a seção "Plano de execução" da história com uma regra objetiva. Os módulos disponíveis estão na tabela "Módulos" do `AGENTS.md`.

## Passo 1: quais módulos ativar

| A história altera... | Ativa o módulo que contém... |
|---|---|
| Dado, regra de negócio, endpoint ou integração externa | A lógica de servidor (por exemplo, `backend`) |
| Tela, componente visual ou interação de interface | A interface (por exemplo, `frontend`) |
| Ambos | Os dois módulos |

Uma história que só reorganiza informação já existente na tela, sem novo dado ou regra, ativa só o módulo de interface. Uma história que só expõe um dado existente por uma nova regra, sem interface nova, ativa só o módulo de servidor.

Use sempre os **nomes dos módulos** do `AGENTS.md`.

## Passo 2: paralelo ou sequencial

| Condição | Modo |
|---|---|
| A história ativa um único módulo | `não se aplica` |
| Ativa dois ou mais módulos **e** o Contrato de Integração está completo (endpoint, requisição, resposta, erros) | `paralelo` |
| Ativa dois ou mais módulos **e** o contrato está ausente ou incompleto | `sequencial`: o módulo de servidor primeiro, a interface depois, consumindo o resultado real |

A única condição para o modo paralelo é o contrato estar completo e travado no Gate 1. Nunca marque paralelo "porque parece simples".

## Passo 3: registrar na história

Use exatamente este formato (a verificação `historia` lê estas linhas):

```markdown
## Plano de execução
- Módulos ativados: <nome1, nome2>
- Modo: <não se aplica | paralelo | sequencial>
- Justificativa: <uma frase, citando a condição da tabela do passo 2>
```

## O que nunca fazer

- Nunca decidir paralelismo sem Contrato de Integração completo.
- Nunca ativar todos os módulos "por garantia". Se a história não toca um deles, não o ative.
- Nunca deixar "Modo" em branco.
