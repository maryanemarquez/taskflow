# Modelos de configuração de qualidade

Configurações que verificam as regras obrigatórias da skill `padrao-codigo`. Elas ficam no framework, e cada projeto **copia** para o seu módulo (projetos não editam arquivos do framework).

| Stack | Copie para o módulo | O que faz |
|---|---|---|
| Java/Spring | `java/checkstyle.xml` → `<modulo>/config/checkstyle.xml` | Q-01, Q-03, Q-04, Q-05 (números), Q-08, Q-09 (imports) |
| Java/Spring | `java/pmd-ruleset.xml` → `<modulo>/config/pmd-ruleset.xml` | Q-09 (código morto) |
| Java/Spring | `java/QualidadeArquiteturaTest.java.txt` → `<modulo>/src/test/java/<pacote>/QualidadeArquiteturaTest.java` | Q-06 (log centralizado, sem saída direta) |
| Java/Spring | `java/pom-plugins.xml` | Trechos do `pom.xml`: Checkstyle, PMD, CPD (alerta), JaCoCo com mínimo, ArchUnit |
| Flutter Web | `flutter/analysis_options.yaml` → `<modulo>/analysis_options.yaml` | Q-06, Q-08, Q-09 e formatação de 120 colunas |

As regras Q-02 (tamanho de classe), Q-05/Q-07 (texto fixo) e as de Flutter para Q-01 a Q-04 são verificadas pelo modo `qualidade` do `tools/gates/verificar.js`, que não precisa de configuração.

## Obrigatórias × recomendadas

- **Obrigatórias** fazem o build falhar: Checkstyle, PMD (código morto), ArchUnit, lints do analisador e modo `qualidade`.
- **Recomendadas** só alertam: o detector de duplicação (CPD) aparece no log e nos relatórios, sem falhar.

## Exceções

- Elemento (método, classe): comentário `// qualidade-exceção: <motivo>` até 3 linhas acima da declaração.
- Arquivo inteiro (classe gerada): o comentário nas primeiras 15 linhas vale para o modo `qualidade`. Para o Checkstyle, exclua o arquivo no `pom.xml` (`<excludes>`) com um comentário XML dizendo o motivo.

## Calibração

Os arquivos foram escritos a partir da documentação das ferramentas e não foram executados em projeto real. Ajuste no primeiro PR se uma ferramenta contar de modo diferente da regra: corrija a configuração, nunca a regra.
