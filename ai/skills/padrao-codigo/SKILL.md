---
name: padrao-codigo
description: Usar sempre ao escrever ou auditar código e testes de qualquer módulo, junto com a skill de stack. Define as regras de estilo inegociáveis, comuns a todos os projetos e linguagens (SOLID, Clean Code, limites de tamanho, hard code, log e mensagens centralizados, nomes, testes), e separa regras obrigatórias (bloqueiam o merge) de recomendadas (apenas alertam).
---

# Padrão de Código

Regras de estilo **comuns a todos os projetos e linguagens**. Não dependem de tecnologia. Como cada regra é verificada em cada stack está na skill de stack do módulo (seção "Padrão de código") e nos modelos de configuração do framework.

- **Obrigatória (O):** verificada por ferramenta; violação **bloqueia o merge**.
- **Recomendada (R):** violação gera **alerta**. O `agente-testes` registra o achado e só o torna bloqueante se comprometer corretude ou manutenibilidade.

## Contagem de linhas

Os limites de classe e de método contam **linhas de código**: excluem comentários, linhas em branco e imports. O limite de 120 caracteres vale para toda linha.

## Regras obrigatórias

| ID | Regra |
|---|---|
| Q-01 | Linha com no máximo **120 caracteres**. |
| Q-02 | Classe com no máximo **100 linhas** (código de produção). Excedeu: decomponha em subclasses ou colaboradores. |
| Q-03 | Método com no máximo **20 linhas** (produção e teste). Excedeu: decomponha em submétodos. |
| Q-04 | Método com no máximo **3 parâmetros**. Excedeu: agrupe em objeto de parâmetros ou redesenhe a responsabilidade. |
| Q-05 | **Sem hard code** de valor com significado de negócio (textos, URLs, credenciais, limites, códigos de status). Use constantes, enums ou arquivo de configuração. Literais triviais são permitidos: `0`, `1`, `-1`, `""`, `true`, `false`. |
| Q-06 | **Todo log passa pela classe centralizada de logging.** Proibido `print`, `System.out`, `System.err`, `printStackTrace` e equivalentes. |
| Q-07 | **Toda mensagem** exibida ao usuário ou lançada em exceção vem de classe ou recurso **centralizado de mensagens**. Sem texto solto no código. |
| Q-08 | Nomes descritivos e consistentes. A **convenção de escrita** (maiúsculas, separadores) segue as boas práticas da tecnologia e está declarada na skill de stack do módulo. |
| Q-09 | Sem código morto (variável, método, parâmetro, import ou classe sem uso; código comentado). |

## Regras recomendadas

| ID | Regra |
|---|---|
| Q-10 | **SOLID** e Clean Code. Métodos e classes com responsabilidade única. |
| Q-11 | **Abstração só quando há motivo:** duplicação comprovada, múltiplas implementações ou necessidade de inversão de dependência. Prefira composição a herança e dependa de interfaces. |
| Q-12 | Sem código duplicado. |
| Q-13 | Annotations quando eliminam código repetitivo ou declaram comportamento (injeção, validação, mapeamento). Evite excesso que prejudique a leitura. |
| Q-14 | Testes no padrão **Arrange-Act-Assert**. |
| Q-15 | Nome do teste descreve **cenário e resultado esperado**. |
| Q-16 | Testes independentes e determinísticos (sem ordem implícita, sem relógio, rede ou aleatoriedade reais). |
| Q-17 | **Testes parametrizados** para variações de dados do mesmo comportamento. |
| Q-18 | **Helpers e builders** para montar cenários, desde que o teste continue simples e legível isoladamente. |

## Testes: reaproveitamento com simplicidade

- Reaproveitar é bem-vindo: parametrize variações de dados e extraia montagem de cenário para helpers ou builders.
- Um teste pode verificar mais de um aspecto do mesmo comportamento. O que importa é que seja **simples e funcional**.
- Quem lê um teste deve entender o cenário e o resultado sem abrir mais de um helper. Se o reaproveitamento esconde o que está sendo verificado, desfaça-o.
- Cada teste é verificado pela rastreabilidade: ele cita o ID do cenário (formato na skill de stack) e sua asserção cobre o "Então" correspondente.

## Exceções (com justificativa)

Podem exceder, **mediante comentário de justificativa** no próprio arquivo ou elemento:

| Exceção | Regras que podem ser excedidas |
|---|---|
| Classe gerada automaticamente | Q-01, Q-02, Q-03, Q-04 |
| Classe de configuração ou de constantes | Q-02 |
| DTO ou entidade com muitos atributos | Q-02, Q-04 |
| Método que é `switch` ou mapeamento declarativo | Q-03 |
| Construtor de injeção de dependências ou de widget | Q-04 |

Formato do comentário (reconhecido pelas verificações):

```
qualidade-exceção: <motivo em uma frase>
```

Exceção **sem motivo** é violação. Exceção não listada na tabela também.

Classes de teste não estão sujeitas a Q-02. Q-01, Q-03 e Q-04 valem para o código de teste.

## Como decompor quando um limite é excedido

1. **Método longo:** extraia trechos com nome que diga o que fazem (`validarPeriodo`, `montarResposta`). Cada submétodo tem uma responsabilidade.
2. **Classe longa:** identifique responsabilidades distintas e extraia colaboradores injetados (composição). Não crie herança só para dividir linhas.
3. **Muitos parâmetros:** agrupe os que viajam juntos em um objeto com nome de domínio.
4. **Duplicação:** extraia só quando a repetição existe de fato (Q-11). Duas ocorrências parecidas não exigem abstração; três com o mesmo motivo de mudança, sim.

## Classes centralizadas de logging e de mensagens

O nome e o local dessas classes ficam nos documentos de decisões técnicas do projeto (tabela "Documentos do projeto" do `AGENTS.md`). Se ainda não existirem, o `construtor` as cria na primeira história que precisar e registra o fato em "Decisões técnicas relevantes" da história. Depois disso, ninguém contorna: log e mensagem passam sempre por elas.

## Quem aplica

- `construtor`: escreve o código dentro destas regras desde o início (não "limpa depois").
- CI: executa as verificações da stack. Violação obrigatória reprova o PR; violação recomendada aparece como alerta.
- `agente-testes`: aplica o checklist da stack, que mapeia cada regra Q-xx ao item verificável, e lê o que a ferramenta não alcança (Q-10, Q-11, Q-14 a Q-18).

## O que nunca fazer

- Nunca desligar, afrouxar ou excluir arquivos de uma verificação para passar.
- Nunca usar `qualidade-exceção` sem motivo real.
- Nunca criar abstração "para o futuro" sem duplicação, múltiplas implementações ou inversão de dependência.
- Nunca esconder texto de negócio em constante genérica sem significado (`TEXTO_1`).
