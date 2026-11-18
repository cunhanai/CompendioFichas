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
| Retrato visual do que já foi definido, com diagramas no estilo Excalidraw | Artefato "Arquitetura do Tomo": https://claude.ai/artifact/6fDzfefWhi1YUAnMbCG2QF (fonte em [`artefato/arquitetura-do-tomo.html`](./artefato/arquitetura-do-tomo.html)) |
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

1. Logs: Sentry para erros técnicos + atividade/segurança no nosso banco com tela só do master,
   ou tudo no nosso banco? (Q-004, comparação em P-010)
2. Papéis: o desenho de P-018 serve? Mantenedor de todos os sistemas ou de sistemas específicos?
   (Q-016)
3. E-mail: convite por e-mail no lugar da senha temporária (P-021) e criptografia com blind index
   (P-019)? (Q-017)
4. Login com Google opcional, ao lado da senha, só para contas existentes? (Q-018, P-020)
5. Imagens: Cloudflare R2 (só alertas) ou Backblaze B2 (teto de US$ 0)? (Q-005, P-012)
6. GitHub Flow, agora com a diferença explicada? (Q-011, P-014)
7. Material for MkDocs no GitHub Pages, agora com o funcionamento explicado? (Q-012, P-015)
8. Documentação continua em PT e EN, ou só a interface é multi-idioma? (Q-019)
9. Se vender: quem paga a assinatura, cada pessoa ou o mestre pela mesa? (Q-020, P-022)
10. Snapshots de nível sem JSON — a usuária está definindo. (Q-007)
11. Lista de funcionalidades — a usuária está definindo; decide módulos (D-031), tabelas do
    `support` (D-021) e configurações (D-046).

## Próximos passos

1. Receber as respostas acima e registrar em `DECISOES.md`.
2. Quando a usuária trouxer a lista de funcionalidades: fazer as etapas 1 a 3 do roteiro (visão,
   inventário do sistema atual, requisitos) e só então a divisão em módulos.
3. Etapa 0 do roteiro (modelo de ADR, estrutura de `docs/`, ferramentas) pode ser fechada assim
   que as perguntas 6 a 8 forem respondidas (o modelo de ADR já foi confirmado, D-045).
4. Manter o artefato "Arquitetura do Tomo" atualizado quando houver decisões novas: editar
   `docs/tomo/artefato/arquitetura-do-tomo.html`, republicar no mesmo endereço (passando a URL do
   artefato) e commitar o HTML junto. **Pendente:** incluir as decisões D-040 a D-046 e as
   propostas P-018 a P-021 (feito depois das respostas da próxima rodada).
