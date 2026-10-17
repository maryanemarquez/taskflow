---
name: dominio-projeto
description: Consultar sempre, no início de toda história, antes de redigir qualquer requisito. Indica onde estão os documentos do projeto (domínio, especificação, requisitos, modelo de dados, padrão de API, decisões técnicas e backlog) e como usá-los.
---

# Domínio do Projeto

Esta skill **não contém conhecimento do projeto**. Ela é uma indireção: os caminhos dos documentos vigentes estão na tabela "Documentos do projeto" do `AGENTS.md`. Quando o projeto muda de versão, só aquela tabela muda; esta skill continua igual.

## O que ler e para quê

| Documento (tabela do `AGENTS.md`) | Use para |
|---|---|
| Domínio | Visão do produto, **vocabulário fixo de domínios** (nomes válidos para `HIST-XXX-<dominio>`), entidades, regras de negócio e perfis |
| Especificação | Telas, fluxos, permissões finas por papel |
| Requisitos | RFs e RNFs com critério de aceitação, regras transversais e matriz de rastreabilidade (use para preencher "Origem") |
| Modelo de dados | Entidades, atributos, relacionamentos e regras de integridade. São vinculantes: não redefina estrutura divergente numa história. |
| Padrão de API | Convenções de API e modelo do Contrato de Integração |
| Decisões técnicas | Decisões transversais. Um desvio exige registro em "Pontos em aberto" da história |
| Backlog | Escopo e ordem dos domínios; quais RFs pertencem a cada domínio |

## Como usar

1. Leia, na íntegra e a cada história nova, os documentos que dizem respeito ao domínio. Nunca confie em memória de sessões anteriores.
2. Nunca contradiga uma regra já registrada sem sinalizar o conflito explicitamente na história.
3. Se a história introduzir um conceito novo (entidade, regra, vocabulário) que os documentos não cobrem, registre em "Pontos em aberto" que o documento pode precisar de atualização. **A atualização é feita pelo humano**, para manter a base estável e revisada.
4. Se um documento não cobre o que a história precisa, trate como ausente: use `[DOMÍNIO A DEFINIR]` ou `[AMBÍGUO]`. Nunca suponha o conteúdo.
5. Se um caminho da tabela não existir, pare e avise o humano.
