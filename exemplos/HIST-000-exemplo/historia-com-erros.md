# HIST-000-exemplo — Reservar sala

## Visão geral

Permite que um usuário autenticado reserve uma sala livre por um período. Serve de exemplo do formato da história e para testar as verificações do repositório.

## Domínio

exemplo

## Origem

Documento fictício "Especificação do exemplo", seção 2; requisitos RF-01 e RF-02.

## Requisitos funcionais

1. O usuário reserva uma sala livre informando sala, horário e duração.
   - Critério de aceitação: com sala e horário livres e duração de até 4 horas, o sistema registra a reserva e exibe "Reserva confirmada".
2. O sistema impede a reserva de sala já ocupada.
   - Critério de aceitação: o sistema trata bem a reserva de sala ocupada [AMBÍGUO].

## Requisitos não-funcionais

Não se aplica.

## Cenários Gherkin

Cenário: [C01] Reservar sala livre
  Dado que a sala "A1" está livre às 10h
  Quando o usuário confirma a reserva da sala "A1" às 10h por 1 hora
  Então a reserva é registrada
  E o sistema exibe a mensagem "Reserva confirmada"

Cenário: [C02] Reservar pelo tempo máximo permitido
  Dado que a sala "A1" está livre e o tempo máximo de reserva é de 4 horas
  Quando o usuário reserva a sala "A1" por exatamente 4 horas
  Então a reserva é registrada

Cenário: [C02] Tentar reservar sala ocupada
  Dado que a sala "A1" já está reservada às 10h
  Quando o usuário tenta reservar a sala "A1" às 10h
  Então o sistema rejeita a reserva com o código "HORARIO_INDISPONIVEL"
  E exibe a mensagem "Horário indisponível"

## Contrato de Integração

### Criar reserva
- Endpoint: `POST /reservas`
- Quem acessa: usuário autenticado
- Requisição: corpo JSON com `salaId` (texto, obrigatório), `inicio` (data e hora UTC, obrigatório) e `horas` (inteiro de 1 a 4, obrigatório)
- Erros: `422 HORARIO_INDISPONIVEL` quando a sala já está reservada no período; `400 VALIDACAO` quando um campo é inválido
- Regras de negócio: uma sala não pode ter duas reservas sobrepostas

## Plano de execução

- Módulos ativados: backend, frontend
- Modo: paralelo
- Justificativa: a história altera dado e tela, e o Contrato de Integração está completo (modo paralelo da skill criterio-fluxo-execucao).

## Pontos em aberto

Nenhum.
