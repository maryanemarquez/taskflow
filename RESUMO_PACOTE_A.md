# Entrega 4 — Pacote A: resumo das mudanças

Data: 17/10/2026. Base: framework `sdd-framework` v0.1.0.

## Arquivos (10)

| Arquivo | Tipo | Mudanças |
|---|---|---|
| `AGENTS.md` | Novo | Projeto TaskFlow V1; módulos `backend` (stack-java-spring) e `frontend` (stack-flutter-web, referência externa fora do repo); caminhos dos documentos; DoD com RNF-05/06/08; regra de fronteira da referência visual |
| `CLAUDE.md` | Novo | Apenas importa `@AGENTS.md` |
| `docs/requisitos/TaskFlow_V1_Requisitos.md` | Alterado | RT-01 em bytes UTF-8; **novo RT-04** (limites); RF-01 atômico + redirecionamento; RF-02 alinhado; RF-16 prioridade `MEDIA` e ≤10 tags; RT-04 citado em RF-01, 07, 11, 14, 16, 18, 26; histórico |
| `docs/especificacao/TaskFlow_V1_Especificacao.md` | Alterado | Senha em bytes; prioridade padrão e limite de tags (seção 5 e Tela 9) |
| `docs/dominio/TaskFlow_V1_Dominio.md` | Alterado | Convite sempre como Membro na V1; domínio `fundacao` no vocabulário; senha em bytes; rodapé `TaskFlow_V2_Dominio.md` |
| `docs/modelo-dados/TaskFlow_V1_Modelo_Dados_ER.md` | Alterado | Referência corrigida; `usuario.nome` 100; nota de criação atômica; prioridade padrão `MEDIA`; descrição ≤5.000; `tag.nome` com `utf8mb4_0900_ai_ci`; `refresh_token` com `revogado_em` + `motivo_revogacao`; índices por `usuario_id`; nota de papel do convite na V2; diagrama e seções 5 e 8 |
| `docs/historias/TaskFlow_V1_Backlog.md` | Alterado | Novo domínio `fundacao` (ordem 1, sem RF); `workspace` removido, RF-02/03 em `auth`; ordens renumeradas; endpoints auxiliares em `tarefa` e `membros`; referências corrigidas |
| `docs/arquitetura/TaskFlow_V1_Decisoes_Tecnicas.md` | Alterado | DT-02/DT-13 sem hooks; DT-04 fila única e renovação só em `NAO_AUTENTICADO`; DT-05 janela de 10 s e motivo; DT-06 bytes; DT-08 parâmetro; DT-10 política de acentos; DT-15 skills `stack-*`; risco de tokens expirados; seção 6 reescrita |
| `docs/arquitetura/TaskFlow_V1_Padrao_API.md` | Alterado | 2.1 endpoints transversais; seção 4 (401/refresh); 403 para permissão, 422 só regra de negócio; ordem 404→403→400→422; códigos `TAMANHO_EXCEDIDO`/`LIMITE_EXCEDIDO` (nova seção 6.3); busca ignora acentos |
| `docs/referencia-visual-indice.md` | Alterado | Referência fora do repo; sem `reference-guard`; validação do índice como 1ª tarefa do frontend |

## Remoções (feitas por você; o repositório criado do template não tem esses arquivos)

- `docs/processo.md` (agora `ai/processo.md` no framework)
- `.claude/hooks/*` e os hooks do `settings.json`

## Pontos para você conferir

1. **Índices por `usuario_id`:** aplicados em `recuperacao_senha` e `refresh_token`. O `convite` não tem `usuario_id`; mantém o índice (`email_convidado`, `workspace_id`).
2. **RT-04 além da lista:** acrescentei e-mail ≤150, e citei RT-04 também em RF-07 e RF-26 (campo nome).
3. **`SENHA_FORA_DA_POLITICA` e `FORMATO_INVALIDO`:** adicionados na seção 6.3 do Padrão de API junto dos dois códigos pedidos.
4. **Referência externa do frontend:** o `AGENTS.md` não fixa caminho (cada desenvolvedor informa). Defina um se preferir.
5. **Datas** dos documentos alteradas para 17/10/2026.
