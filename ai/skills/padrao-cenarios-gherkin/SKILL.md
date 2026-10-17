---
name: padrao-cenarios-gherkin
description: Usar sempre ao escrever a seção "Cenários Gherkin" da história, depois dos critérios de aceitação. Define o formato exato dos cenários, os IDs e a regra de triangulação, que alimentam a rastreabilidade automática.
---

# Padrão de Cenários Gherkin

Este é um **contrato de formato**, não só uma convenção de escrita. A verificação `historia` valida a sintaxe, e a verificação `entrega` cruza os IDs com os testes. Divergir do formato quebra a rastreabilidade.

## Estrutura de cada cenário

```gherkin
Cenário: [C01] <nome curto e único na história>
  Dado <estado inicial observável>
  Quando <uma única ação do usuário ou evento do sistema>
  Então <resultado verificável>
  E <resultado adicional, se houver>
```

Regras:

- A linha começa com `Cenário:` seguido do **ID local** entre colchetes: `[C01]`, `[C02]`... Dois ou mais dígitos. O ID é **único dentro da história** e nunca é reaproveitado.
- O ID qualificado, usado nos testes, é `HIST-XXX-<dominio>/C01` (o identificador da história, uma barra e o ID local).
- O nome do cenário é único e descritivo. Evite "Cenário 1".
- **Dado:** estado observável, nunca implementação. "O usuário está autenticado", não "o token está no cabeçalho".
- **Quando:** uma ação por cenário. Ações independentes viram cenários separados.
- **Então:** resultado específico e verificável, ligado a um critério de aceitação. "Funciona corretamente" não é verificável.
- Palavras-chave em português: `Cenário`, `Dado`, `Quando`, `Então`, `E`.
- Nunca altere o ID de um cenário já aprovado no Gate 1 sem gerar nova versão da história: o construtor rastreia o teste pelo ID.

## Regra de triangulação

Para cada requisito com lógica de decisão (validação, permissão, limite), escreva no mínimo:

1. **Caminho feliz:** o sucesso principal.
2. **Caso de borda:** vazio, máximo, mínimo, zero, duplicado.
3. **Caso negativo:** entrada inválida ou não permitida, com o erro esperado explícito.

Requisitos puramente declarativos (por exemplo, um texto estático) podem ter só o caminho feliz, por decisão consciente, não por omissão.

## Exemplo (domínio fictício de reserva de salas)

```gherkin
## Cenários Gherkin

Cenário: [C01] Reservar sala livre
  Dado que a sala "A1" está livre no horário das 10h
  Quando o usuário confirma a reserva da sala "A1" às 10h
  Então a reserva é registrada
  E o sistema exibe a mensagem "Reserva confirmada"

Cenário: [C02] Reservar por exatamente o tempo máximo permitido
  Dado que a sala "A1" está livre e o tempo máximo de reserva é de 4 horas
  Quando o usuário reserva a sala "A1" por exatamente 4 horas
  Então a reserva é registrada

Cenário: [C03] Tentar reservar sala já ocupada
  Dado que a sala "A1" já está reservada às 10h
  Quando o usuário tenta reservar a sala "A1" às 10h
  Então o sistema rejeita a reserva
  E exibe a mensagem "Horário indisponível"
```

## O que nunca fazer

- Nunca escrever só o caminho feliz quando há lógica de decisão.
- Nunca misturar duas ações no mesmo "Quando".
- Nunca deixar o "Então" vago.
- Nunca repetir um ID na mesma história.
