# Referência Visual — TaskFlow V1 (React)

**Origem:** pacote `taskflow-trailblazer` (Vite + React 18 + TypeScript + Tailwind + shadcn/ui), gerado como protótipo navegável com dados fictícios.
**Destino da V1:** frontend em **React Native Web** (Expo + Expo Router).

## Regra de uso

1. Esta pasta é **somente leitura**. Não é compilada, não é importada pelo app e não tem `package.json`.
2. Nenhum arquivo daqui é copiado sem adaptação. Código reaproveitado vai para o módulo `frontend` e passa pelo fluxo normal (história, Gherkin, testes, gates).
3. Das telas, usa-se **aspecto visual, textos, fluxos e estados**. Nunca lógica de servidor: as regras de negócio reais ficam no backend Java/Spring.
4. Em conflito entre a referência e a documentação da V1 (`docs/especificacao`, `docs/requisitos`, Padrão de API), **vale a documentação**. Registrar o conflito em Pontos em Aberto da história.
5. Divergências e lacunas (`[LACUNA]` do briefing, §20) são resolvidas no Gate 1 da história correspondente.

## Conteúdo

| Caminho | O que é | Uso previsto |
|---|---|---|
| `briefing-referencia-visual.md` | Especificação das 13 telas, papéis, validações, fluxos, erros, estados e dados fictícios | Base das histórias e dos cenários Gherkin |
| `motor-mock/engine.ts` | Regras simuladas no cliente (validações, permissões, transições, convites, recuperação, filtros, busca) | Mock de desenvolvimento e regras de UX. **Não substitui o backend.** |
| `motor-mock/engine.test.ts` | 38 testes de regra (vitest) | Fonte de cenários Gherkin e de testes de contrato do backend |
| `motor-mock/seed.ts` | Massa de dados fictícios (Maria, João, Ana, Carlos) | Seed do mock e dos testes do frontend |
| `routes.ts` | Mapa central de rotas | Base do mapa do Expo Router |
| `tokens/index.css` | Cores, tipografia, espaçamento, sombras e estilos `.tf-*` | Fonte para o `theme.ts` do frontend |
| `catalogo-componentes.md` | Descrição dos componentes visuais e de seus estados | Substitui o código `.tsx` da UI web |
| `ADAPTACAO-RN.md` | Ajustes necessários para portar o motor mock e os testes para React Native Web | Guia do `construtor` na história de `fundacao` |

## O que ficou de fora de propósito

| Item | Motivo |
|---|---|
| Componentes `.tsx` da UI, `Prototype.tsx`, `usePrototype.ts` | DOM, Tailwind e Radix não rodam em React Native. Descritos em `catalogo-componentes.md`. |
| Configurações Vite, Vitest, Tailwind, Playwright, shadcn | Específicas de web puro |
| Páginas, stores, hooks e integrações do protótipo anterior, e a pasta `supabase/` | Legado fora do escopo da V1 |
| `.env` e arquivos de lock | Segredos e arquivos gerados |

## Observações sobre os arquivos copiados

- `motor-mock/engine.ts` usa `crypto.randomUUID()`, `Intl.DateTimeFormat` e `TextEncoder`. Ver as soluções em `ADAPTACAO-RN.md`.
- `motor-mock/seed.ts` tem datas fixas de outubro de 2026 e senha fictícia comum. É só para dados de teste.
- `tokens/index.css` contém também estilos específicos de web. Aproveitar apenas as variáveis de design (cores, raio, espaçamento, sombras).
