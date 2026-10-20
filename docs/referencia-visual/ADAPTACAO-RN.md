# Adaptação para React Native Web

Guia para portar `motor-mock/` (`engine.ts`, `engine.test.ts`, `seed.ts`) e `routes.ts` para o módulo `frontend` (Expo + Expo Router + Jest). A pasta `docs/referencia-visual/` **não é alterada**: o código adaptado nasce em `frontend/`, na história de `fundacao`, pelo `construtor`.

## Papel do motor no frontend

| Parte | Destino |
|---|---|
| Validações de campo e contadores (limites de RT-01 e RT-04), mensagens | Regras de UX no frontend (antes de enviar) |
| Permissões, transições de status, convites, recuperação, remoção de membro | **Backend (Spring)**. No frontend só existem no mock de desenvolvimento. |
| Mock completo | Adaptador de desenvolvimento, trocável pelo cliente real da API (axios) |
| `engine.test.ts` | Teste do mock (Jest) e fonte de cenários Gherkin e de testes de contrato do backend |

## Ajustes por item

| Origem | Problema | Solução |
|---|---|---|
| `import ... from 'vitest'` | O projeto usa Jest | Remover o import (`describe`, `it`, `expect` são globais no Jest) e ajustar `it.each` se necessário |
| `crypto.randomUUID()` | Indisponível em alguns runtimes de RN | `randomUUID` do `expo-crypto`, atrás de uma função `novoToken()` |
| `Intl.DateTimeFormat` com `timeZone` (`timestamp`) | Suporte irregular no Hermes | Função isolada de formatação com fuso `America/Sao_Paulo`; testar no alvo web e no nativo |
| `TextEncoder` (limite de 72 bytes da senha) | Pode faltar no runtime | Função própria de contagem de bytes UTF-8 ou polyfill |
| `Date.now()` e datas fixas em `seed.ts` | Datas de outubro de 2026 envelhecem; relógio não controlável | Relógio injetado (alinhado à DT de UTC com `Clock`) e datas relativas ao relógio |
| Senhas fictícias em `seed.ts` | Dados de teste | Usar só em mock e testes; nunca em código de produção |
| `routes.ts` (React Router) | Rotas viram arquivos no Expo Router | Mapear cada rota para um arquivo em `app/`. Parâmetros: `[id]`, `[token]`. |
| Tipos `Status`, `Role`, `Priority` | Risco de divergir dos enums do Java | Gerar tipos a partir do OpenAPI do Spring; o mock passa a usá-los |
| Estilos `tokens/index.css` | Variáveis CSS e classes `.tf-*` não existem em RN | Converter só as variáveis para `theme.ts` (cores, raio, espaçamento, sombras, tipografia) |

## Ordem sugerida (história de `fundacao`)

1. Criar o projeto Expo com Expo Router e Jest + React Native Testing Library.
2. Criar `theme.ts` a partir dos tokens.
3. Portar `engine.ts`, `seed.ts` e o teste, com os ajustes da tabela, e fazer o teste passar.
4. Criar a estrutura de rotas.
5. Registrar as decisões em "Pontos em aberto" e levá-las ao Gate 1.
