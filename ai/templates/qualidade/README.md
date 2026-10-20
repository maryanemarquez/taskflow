# Modelos de configuração de qualidade

Configurações que verificam as regras obrigatórias da skill `padrao-codigo`. Elas ficam no framework, e cada projeto **copia** para o seu módulo (projetos não editam arquivos do framework).

| Stack | Copie para o módulo | O que faz |
|---|---|---|
| Java/Spring | `java/checkstyle.xml` → `<modulo>/config/checkstyle.xml` | Q-01, Q-03, Q-04, Q-05 (números), Q-08, Q-09 (imports) |
| Java/Spring | `java/pmd-ruleset.xml` → `<modulo>/config/pmd-ruleset.xml` | Q-09 (código morto) |
| Java/Spring | `java/QualidadeArquiteturaTest.java.txt` → `<modulo>/src/test/java/<pacote>/QualidadeArquiteturaTest.java` | Q-06 (log centralizado, sem saída direta) |
| Java/Spring | `java/pom-plugins.xml` | Trechos do `pom.xml`: Checkstyle, PMD, CPD (alerta), JaCoCo com mínimo, ArchUnit; o mínimo de cobertura vem da propriedade cobertura.minima |
| React Native Web | `react-native-web/eslint.config.js` → `<modulo>/eslint.config.js` | Q-01 a Q-09 (limites de linha, função e parâmetros, texto fixo, log, nomes e código morto) |
| React Native Web | `react-native-web/prettierrc.json` → `<modulo>/.prettierrc.json` | Q-01 (formatação de 120 colunas) |
| React Native Web | `react-native-web/tsconfig.json` → `<modulo>/tsconfig.json` | Q-09 (`noUnusedLocals`, `noUnusedParameters`) e `strict` |
| React Native Web | `react-native-web/jest.config.js` → `<modulo>/jest.config.js` | Testes em `__tests__/` e cobertura em `coverage/lcov.info` |

As regras Q-02 (tamanho de classe), Q-05/Q-07 (texto fixo) e Q-01 a Q-04 de Java são verificadas pelo modo `qualidade` do `tools/gates/verificar.js`, que não precisa de configuração. No frontend, essas regras são verificadas pelo ESLint do modelo acima (o modo `qualidade` não analisa TypeScript).

## Obrigatórias × recomendadas

- **Obrigatórias** fazem o build falhar: Checkstyle, PMD (código morto), ArchUnit, ESLint, `tsc` e modo `qualidade`.
- **Recomendadas** só alertam: o detector de duplicação (CPD) aparece no log e nos relatórios, sem falhar.

## Exceções

- Elemento (método, classe): comentário `// qualidade-exceção: <motivo>` até 3 linhas acima da declaração.
- Arquivo inteiro (classe gerada): o comentário nas primeiras 15 linhas vale para o modo `qualidade`. Para o Checkstyle, exclua o arquivo no `pom.xml` (`<excludes>`) com um comentário XML dizendo o motivo.

## Calibração

Os arquivos foram escritos a partir da documentação das ferramentas e não foram executados em projeto real. O `eslint.config.js` de React Native Web foi exercitado com ESLint 9 e `typescript-eslint` em arquivos de exemplo (limites de linha, função, arquivo e parâmetros, `console`, texto fixo em JSX, atributos e `Alert`, variáveis sem uso e descrição obrigatória nas exceções); os demais modelos de React Native Web (`tsconfig`, `jest.config.js`) não foram executados em projeto real. Texto fixo de uma palavra em atributo não é detectado: fica para a leitura do `agente-testes`. Ajuste no primeiro PR se uma ferramenta contar de modo diferente da regra: corrija a configuração, nunca a regra.
