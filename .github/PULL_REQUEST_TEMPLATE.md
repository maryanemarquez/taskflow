## Tipo de PR

- [ ] **História** (branch `historia/HIST-XXX-<dominio>`): só `historia.md`. Gate 1.
- [ ] **Entrega** (branch `feature/HIST-XXX-<dominio>`): código, testes e `relatorio-teste.md`. Gate 3.
- [ ] Outro (documentação ou framework)

História: `HIST-XXX-<dominio>`

## Checklist do Gate 1 (PR de história)

- [ ] Todo requisito tem critério de aceitação verificável; nenhum `[AMBÍGUO]` sem justificativa.
- [ ] Cenários cobrem caminho feliz, borda e negativo onde há lógica de decisão.
- [ ] A seção "Origem" cita os documentos e seções corretos.
- [ ] O plano de execução condiz com o que a história altera.
- [ ] Em modo paralelo, o Contrato de Integração está completo e coerente com o padrão de API.
- [ ] Desvios das decisões técnicas do projeto estão em "Pontos em aberto".

## Checklist do Gate 3 (PR de entrega)

- [ ] Todas as verificações estão verdes (`entrega`, jobs da stack).
- [ ] O `relatorio-teste.md` tem `Veredito: LIBERADO` e sem pendência bloqueante.
- [ ] Os alertas das regras recomendadas de `padrao-codigo` foram revisados.
- [ ] Todos os critérios de aceitação foram atendidos.
- [ ] Os RNFs exigidos foram verificados ou têm não aplicabilidade justificada.
