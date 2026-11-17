# Tomo — onde paramos (passagem de bastão entre sessões)

Leia este arquivo primeiro ao retomar o trabalho do Tomo numa sessão nova. Atualizado em
2026-11-17.

## O que é

O Compêndio de Fichas (este repositório) vai ser reconstruído do zero, num repositório novo,
como **Tomo**. Estamos na fase de **definição da arquitetura**. Nenhum código do Tomo foi escrito
ainda, e o repositório novo ainda não existe.

## Onde está cada coisa

| O quê | Onde |
| --- | --- |
| Todas as decisões (confirmadas, propostas, abertas, descartadas), glossário e histórico | [`DECISOES.md`](./DECISOES.md) |
| Roteiro de definição da arquitetura (etapas 0 a 17, arc42 + C4 + ADR) | [`ROTEIRO-ARQUITETURA.md`](./ROTEIRO-ARQUITETURA.md) |
| Retrato visual do que já foi definido, com diagramas no estilo Excalidraw | Artefato "Arquitetura do Tomo": https://claude.ai/artifact/6fDzfefWhi1YUAnMbCG2QF |
| Detalhamento funcional das telas atuais (insumo para o inventário) | Documento "Compêndio de Fichas — detalhamento funcional das telas": https://claude.ai/artifact/JmYdjAk6JTDcQHpuMsEaBH |
| Redesenho visual (paleta #99, telas já desenhadas) | Projeto no Claude Design; decisões em `DESIGN_NOTES.md`, seção "Redesenho de frontend com Claude Design" |
| Plano anterior (backend TypeScript), **superado** | Documento "Tomo — Plano de migração e nova arquitetura": https://claude.ai/artifact/3f2DfgueS1hd2pEr5WX8tJ |

Tudo isso está na branch `claude/focused-albattani-atp3py` deste repositório (ainda não foi para
a `main`).

## Como a usuária trabalha

- Usa só a nuvem (claude.ai/code); não roda nada localmente.
- Quer qualidade de empresa, apresentável como portfólio.
- Decide tudo explicitamente: só entra no Tomo o que ela **confirmar**. Propostas ficam marcadas
  como propostas até ela responder.
- Toda decisão nova vai para `DECISOES.md` na hora, com data.
- Gosta de receber as perguntas pendentes numeradas, para responder pelo número.
- Rejeita JSON dentro do Postgres (nem JSONB, nem JSON serializado).

## Perguntas em aberto (refazer na próxima conversa)

1. Logs e erros: Sentry gratuito + logs na Vercel, sem armazenamento próprio de logs? (P-010)
2. E-mail: redefinição de senha e verificação de e-mail com Resend? Exige voltar a guardar o
   e-mail dos usuários. (P-011)
3. Imagens, onde guardar: Cloudflare R2 (proposto) ou Vercel Blob? (P-012)
4. Imagens, tamanhos: exibição 1600–2048 px em WebP + miniatura, sem guardar o original? (P-012)
5. Pipeline: deploy só pelo GitHub Actions, previews com dados fictícios, sem staging, Redis só
   em produção? (P-013)
6. Fluxo de branches: GitHub Flow em vez de Git Flow? (P-014)
7. Site da documentação: Material for MkDocs no GitHub Pages? (P-015)
8. Código e banco só em inglês; documentação e interface em PT e EN? (Q-013)
9. Modelo de ADR: contexto, opções, decisão, consequências, status? (Q-014)
10. Configurações da plataforma: a lista final sai das funcionalidades? (P-017)
11. Snapshots de nível sem JSON — a usuária está definindo. (Q-007)
12. Lista de funcionalidades do Tomo — a usuária está definindo; ela decide os módulos e
    schemas da plataforma (D-031) e as tabelas do `support` (D-021).

## Próximos passos

1. Receber as respostas acima e registrar em `DECISOES.md`.
2. Quando a usuária trouxer a lista de funcionalidades: fazer as etapas 1 a 3 do roteiro (visão,
   inventário do sistema atual, requisitos) e só então a divisão em módulos.
3. Etapa 0 do roteiro (modelo de ADR, estrutura de `docs/`, ferramentas) pode ser fechada assim
   que as perguntas 6 a 9 forem respondidas.
4. Manter o artefato "Arquitetura do Tomo" atualizado quando houver decisões novas (o HTML-fonte
   ficou no scratchpad da sessão anterior; numa sessão nova, ler o artefato pela URL e republicar
   no mesmo endereço).
