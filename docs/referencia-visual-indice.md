# Índice da Referência Visual — TaskFlow V1

**Data:** 20/10/2026
**Referência:** `taskflow-trailblazer` (Vite + React + TypeScript), **versionada neste repositório em `docs/referencia-visual/`, somente leitura**
**Telas de destino:** `docs/especificacao/TaskFlow_V1_Especificacao.md`, seção 6
**Frontend de destino:** React Native Web (Expo + Expo Router)

> A fronteira de uso está no `AGENTS.md`, seção "Referência visual".

## 1. Finalidade

Mapeia cada tela da V1 para a parte correspondente da referência e diz o que reaproveitar em React Native Web. Substitui o índice anterior, que era uma classificação preliminar feita só pelos nomes de arquivos da referência antiga. A nova referência foi lida integralmente.

Regras de uso e conteúdo da pasta: `docs/referencia-visual/LEIA-ME.md`.

### Legenda de reuso

| Marca | Significado |
|---|---|
| 🟢 Direto | Reaproveitar com ajustes mínimos (TypeScript puro, textos, dados) |
| 🟡 Adaptar | Reaproveitar a ideia e converter (tokens, rotas) |
| 🔵 Visual | Usar só como referência visual e reescrever em componentes RN |
| ⚪ Fora | Não entra na V1 |

## 2. Telas da V1 → referência

Seções do briefing: `docs/referencia-visual/briefing-referencia-visual.md`, §7. Componentes: `catalogo-componentes.md`.

| Tela da V1 | Variante / componente de referência | Reuso | Observação |
|---|---|---|---|
| 1. Login | `AuthView` · login | 🔵 Visual | Textos 🟢. Ignorar os botões "acessar como". |
| 2. Cadastro (2A, 2B, 2C) | `AuthView` · cadastro, convite conta nova, convite conta existente | 🔵 Visual | A senha tem regra de 8 caracteres, letra e número, máximo de 72 bytes. |
| 3. Convite expirado | `AuthView` · invite-invalid | 🔵 Visual | Mensagem "Este convite expirou". |
| 4. Recuperar senha | `AuthView` · recovery | 🔵 Visual | A mensagem de resposta é sempre a mesma, exista ou não o e-mail. |
| 5. Redefinir senha | `AuthView` · reset, reset-invalid | 🔵 Visual | Confirmação de senha obrigatória. |
| 6. Dashboard | `DashboardView` | 🔵 Visual | Contagem por status, "Minhas tarefas", "Seus projetos". |
| 7. Projetos | `ProjectsView`, `ProjectCard`, `ProjectForm` | 🔵 Visual | Ações de administração só para o Proprietário. |
| 8. Detalhe do projeto | `ProjectView`, `TaskCard`, `TaskList` | 🔵 Visual | Kanban, lista e 5 filtros. |
| 9. Tarefa | `TaskForm`, `TaskDetail` | 🔵 Visual | Sem campo de status no formulário. |
| 10. Membros | `MembersView` | 🔵 Visual | Remoção com reatribuição. |
| 11. Busca global | `Layout` (painel de busca) | 🔵 Visual | Regras de busca em `motor-mock/engine.ts` (`search`). |
| 12. Configurações de perfil | `ProfileView` | 🔵 Visual | Somente nome e senha. |
| 13. Sem workspace | `AuthView` · no-workspace | 🔵 Visual | Botão único "Sair". |

## 3. Arquivos de apoio

| Arquivo em `docs/referencia-visual/` | Reuso | Destino previsto |
|---|---|---|
| `briefing-referencia-visual.md` | 🟢 Direto | Base das histórias e dos cenários Gherkin |
| `motor-mock/engine.ts` | 🟢 Direto (com ajustes) | Mock de desenvolvimento e regras de UX do frontend. Trocar `crypto.randomUUID` e `Intl` por equivalentes de RN. As regras de negócio reais ficam no Spring. |
| `motor-mock/engine.test.ts` | 🟢 Direto | Testes do mock (Jest) e base de cenários Gherkin e de testes de contrato do backend |
| `motor-mock/seed.ts` | 🟢 Direto | Seed do mock e dados de teste |
| `routes.ts` | 🟡 Adaptar | Estrutura de pastas do Expo Router |
| `tokens/index.css` | 🟡 Adaptar | `theme.ts` (cores, raio, espaçamento, sombras, tipografia) |
| `catalogo-componentes.md` | 🔵 Visual | Guia de construção dos componentes RN |

## 4. Itens da referência fora da V1

| Item | Marca | Motivo |
|---|---|---|
| Botões "acessar como" e seletor de papel/cenário | ⚪ Fora | Controles do protótipo |
| Páginas, stores, hooks e integrações do protótipo anterior, `supabase/` | ⚪ Fora | Não foram trazidos |
| Tela inicial provisória do workspace | 🔵 Visual (prevista na V1) | Está na Especificação (§6, tela 6) e no RF-01. É definida na história de `auth`. O briefing não descreve o conteúdo; proposta em `catalogo-componentes.md` ("Telas de apoio"), a aprovar no Gate 1. |
| Sessão expirada | 🟢 Comportamento | Fora das 13 telas. Decisão: **não é tela dedicada**. Quando o refresh do token falha, o app redireciona ao login com a mensagem "Sua sessão expirou. Entre novamente.", reaproveitando a variante `expired-session` do `AuthView`. A confirmar no Gate 1 de `auth`. |

## 5. Regras de uso

1. Da referência usa-se apenas aspecto visual, textos, fluxos e estados. Regras de negócio vivem no backend.
2. Em conflito com a documentação da V1, vale a documentação.
3. Dúvida sobre tela ou componente: registrar em Pontos em Aberto da história, em vez de decidir sozinho.
4. As `[LACUNA]` do briefing (§20) são resolvidas no Gate 1 da história correspondente.
5. A pasta `docs/referencia-visual/` não é alterada por histórias de implementação. Mudanças nela são feitas só por atualização explícita da referência.
