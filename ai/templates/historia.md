# HIST-XXX-<dominio> — <Título curto>

## Visão geral

<2 a 4 frases: o que esta história entrega e por quê.>

## Domínio

<domínio do vocabulário do projeto, ou [DOMÍNIO A DEFINIR]>

## Origem

<seções exatas dos documentos do projeto que originaram esta história. Exemplo: "Especificação, seção 5; Requisitos, RF-10 a RF-12".>

## Requisitos funcionais

1. <requisito>
   - Critério de aceitação: <verificável: passa ou falha, sem interpretação subjetiva>
2. <requisito>
   - Critério de aceitação: <verificável>

## Requisitos não-funcionais

<só o que for exigível de fato, com meta mensurável; ou "Não se aplica">

## Cenários Gherkin

Cenário: [C01] <nome curto e único dentro da história>
  Dado <estado inicial observável>
  Quando <uma única ação>
  Então <resultado verificável>
  E <resultado adicional, se houver>

Cenário: [C02] <caso de borda>
  Dado <estado inicial>
  Quando <ação no limite>
  Então <resultado esperado>

Cenário: [C03] <caso negativo>
  Dado <estado inicial>
  Quando <ação inválida ou não permitida>
  Então <rejeição com o erro específico esperado>

## Contrato de Integração

<"Não se aplica" se a história toca um único módulo ou a execução é sequencial. Se for paralela, preencha conforme a skill padrao-historia-criterios.>

## Plano de execução

- Módulos ativados: <nomes dos módulos, separados por vírgula>
- Modo: <não se aplica | paralelo | sequencial>
- Justificativa: <uma frase, citando a condição da skill criterio-fluxo-execucao>

## Decisões técnicas relevantes

<decisões simples e objetivas; ou "Nenhuma">

## Pontos em aberto

<liste aqui todo [AMBÍGUO] e todo [DOMÍNIO A DEFINIR] que aparece no documento; ou "Nenhum">
