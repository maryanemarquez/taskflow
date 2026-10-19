# Exemplos

Arquivos para **testar as verificações** do repositório e para ver o formato de uma história. Em um projeto novo, apague esta pasta.

| Arquivo | Para quê |
|---|---|
| `HIST-000-exemplo/historia.md` | História válida: deve passar na verificação `historia` |
| `HIST-000-exemplo/historia-com-erros.md` | A mesma história com 4 defeitos de propósito: deve **falhar** |

## Teste de ponta a ponta do Gate 1 (primeiro uso no GitHub)

1. Crie o branch: `git switch -c historia/HIST-000-exemplo`.
2. Copie o exemplo válido: crie a pasta `docs/historias/HIST-000-exemplo/` e copie para lá o `historia.md`.
3. Faça o commit, o push e abra um Pull Request para a `main`.
4. Na aba *Checks* do PR, o `historia` deve ficar verde. É aqui que você confere os nomes exatos dos checks para a regra de proteção da `main` (README, seção 7).
5. Troque o conteúdo de `docs/historias/HIST-000-exemplo/historia.md` pelo de `historia-com-erros.md`, faça novo commit e push. O `historia` deve ficar **vermelho**, listando os 4 problemas.
6. Feche o PR sem mesclar e apague o branch.

## Rodando na sua máquina (precisa do Node.js 18 ou superior)

```
node tools/gates/verificar.js historia exemplos/HIST-000-exemplo/historia.md
node tools/gates/verificar.js historia exemplos/HIST-000-exemplo/historia-com-erros.md
```
