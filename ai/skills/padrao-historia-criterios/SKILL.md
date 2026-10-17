---
name: padrao-historia-criterios
description: Usar sempre ao redigir a estrutura da história e os critérios de aceitação, antes de escrever os cenários Gherkin. Define o formato fixo do arquivo historia.md, que é conferido pela verificação automática "historia".
---

# Padrão de História e Critérios de Aceitação

Define o formato obrigatório de `docs/historias/HIST-XXX-<dominio>/historia.md`. O modelo está em `ai/templates/historia.md`. A estrutura é conferida mecanicamente pela verificação `historia`; a qualidade do conteúdo é conferida por humano no Gate 1.

## Seções obrigatórias (todas, nesta ordem, com título de nível 2)

1. `## Visão geral`
2. `## Domínio`
3. `## Origem`
4. `## Requisitos funcionais`
5. `## Requisitos não-funcionais` (pode ser "Não se aplica")
6. `## Cenários Gherkin`
7. `## Contrato de Integração` (pode ser "Não se aplica", salvo em modo paralelo)
8. `## Plano de execução`
9. `## Decisões técnicas relevantes` (pode ser "Nenhuma")
10. `## Pontos em aberto` (pode ser "Nenhum", salvo se houver marcadores)

O título do arquivo é `# HIST-XXX-<dominio> — <Título curto>`.

## Regra do critério de aceitação verificável

Um critério é válido somente se puder virar um teste objetivo (passa ou falha), sem interpretação subjetiva.

| Inválido | Válido |
|---|---|
| "O sistema deve ser rápido." | "A listagem responde em até 2 segundos com até 500 itens." |
| "O usuário deve conseguir reservar com facilidade." | "Ao confirmar uma reserva com sala e horário livres, o sistema registra a reserva e exibe a mensagem de confirmação." |

Todo requisito sem critério nesse formato recebe `[AMBÍGUO]` e é listado em "Pontos em aberto". O agente nunca resolve a ambiguidade por suposição.

## Marcadores

- `[AMBÍGUO]`: requisito sem critério verificável ou com lacuna.
- `[DOMÍNIO A DEFINIR]`: história sem encaixe claro no vocabulário de domínios do projeto.
- Todo marcador que aparecer no documento **deve** ser listado em "Pontos em aberto". A verificação `historia` falha caso contrário.

## Contrato de Integração

Obrigatório quando a história ativa **mais de um módulo em modo paralelo**. Use o padrão de API do projeto (tabela "Documentos do projeto" do `AGENTS.md`). Modelo:

```markdown
### <Nome da operação>
- Endpoint: `MÉTODO /caminho`
- Quem acessa: <papéis permitidos ou público>
- Requisição: <cabeçalhos, parâmetros e corpo, com tipos, obrigatoriedade e validações>
- Resposta de sucesso: <status e corpo>
- Erros: <status + código + quando ocorre>
- Regras de negócio: <requisitos e regras transversais aplicáveis>
```

Sem o contrato completo, o modo não pode ser paralelo: vira sequencial (skill `criterio-fluxo-execucao`).

## Versionamento

Mudança de escopo depois do Gate 1 gera `historia-v2.md` (depois `-v3`...) na mesma pasta. Nunca edite uma versão já aprovada.

## O que nunca fazer

- Nunca omitir uma seção. Se não se aplica, escreva "Não se aplica".
- Nunca deixar "Origem" genérica: cite documento e seção.
- Nunca resolver ambiguidade por suposição.
