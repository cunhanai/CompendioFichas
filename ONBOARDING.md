# Onboarding — Compêndio de Fichas

Bem-vindo(a) ao projeto. Este documento é o ponto de partida: dá uma visão de alto nível (o que é
o produto, pra quem) e de baixo nível (como o código é organizado, como o fluxo de trabalho
funciona, como o deploy funciona), e aponta pra onde ir quando precisar de mais detalhe.

**Ordem de leitura sugerida**: este arquivo primeiro (inteiro — não é longo), depois
[`CLAUDE.md`](./CLAUDE.md) antes de mexer em qualquer coisa não-trivial no código (é o guia de
arquitetura mais denso e tecnicamente detalhado que existe no projeto), e [`DESIGN_NOTES.md`](./DESIGN_NOTES.md)
quando precisar entender _por que_ uma tela/fluxo específico é do jeito que é. [`BACKLOG.md`](./BACKLOG.md)
lista o que está pendente.

## Índice

1. [O que é este projeto](#1-o-que-é-este-projeto)
2. [Arquitetura, em poucas palavras](#2-arquitetura-em-poucas-palavras)
3. [Fluxo de trabalho do dia a dia](#3-fluxo-de-trabalho-do-dia-a-dia)
4. [Deploy](#4-deploy)
5. [Estado do projeto: feito, planejado, faltando](#5-estado-do-projeto-feito-planejado-faltando)
6. [Onde procurar o quê](#6-onde-procurar-o-quê)
7. [Mapa da documentação](#7-mapa-da-documentação)

---

## 1. O que é este projeto

**Compêndio de Fichas** é uma SPA (single-page app) para gerenciar fichas de personagem de RPG de
mesa — multi-usuário e, na intenção do produto, multi-sistema (Pathfinder, Dune: Aventuras,
Tormenta20, Vampiro: A Máscara...). **Na prática, hoje, só Pathfinder 1ª Edição está
implementado** — os outros sistemas existem só como placeholders "em breve" na navegação e nos
dados semente, para o produto já parecer multi-sistema visualmente. Não assuma que mexer em algo
"genérico" automaticamente cobre outro sistema — não há nenhum outro sistema de verdade pra
testar contra.

Características centrais do produto (documentadas em detalhe em
[`DESIGN_NOTES.md` → "Regras de produto"](./DESIGN_NOTES.md#regras-de-produto-fornecidas-pelo-usuário)):

- Um usuário acessa os sistemas disponíveis pra ele; dentro de um sistema, vê sua lista de
  personagens e uma **biblioteca compartilhada** por sistema (magias, talentos, perícias,
  habilidades, armas, idiomas, criaturas, classes) — itens cadastrados por qualquer jogador ficam
  disponíveis pra todo mundo naquele sistema.
- Uma ficha de personagem pode estar ativa/inativa (inativa = arquivada, somente leitura),
  favoritada, e compartilhada com outro usuário específico (sempre somente leitura pra quem
  recebe — nunca existiu, e foi removido de propósito, um link público).
- A ficha cobre tudo que uma ficha de Pathfinder 1e cobre: identidade, classes/nível, atributos
  (com dano/dreno), pontos de vida (letal/não letal), CA, Jogadas de Resistência, BBA/BMC/DMC,
  Resistência a Magia, deslocamento, perícias, talentos, habilidades especiais, magias
  (grimórios), armas, inventário/carga, dinheiro, histórico de sessões e **snapshots por nível**
  (uma árvore com fork/restore, não uma lista linear — ver `entities/character/model/snapshots.ts`).
- Há uma camada de administração (gestão de usuários, log de auditoria, alertas de segurança por
  força bruta) — não é feature de jogador, é operação da plataforma.

Não existe cadastro público: só um admin cria contas. Não existe "visitante"; todo acesso passa
por login.

## 2. Arquitetura, em poucas palavras

Esta seção é propositalmente curta — a referência completa e sempre atualizada é
[`CLAUDE.md`](./CLAUDE.md). Leia-o antes de mexer em `api/**`, `db/**`, no provider de dados
(`app/providers`), ou no sistema de snapshots.

- **Stack**: Vite + React 19 + TypeScript no front; Vercel Serverless Functions + Drizzle ORM +
  Postgres (Neon) no back. Tailwind CSS v4 + Base UI para a UI.
- **Front-end em Feature-Sliced Design**: `src/` é organizado em camadas
  `app → pages → widgets → features → entities → shared`, cada uma só pode importar de si mesma ou
  de uma camada abaixo. Dentro de `shared/ui`, Atomic Design (`atoms/`, `molecules/`, `organisms/`).
- **Um objeto `Character` grande, uma API relacional por baixo**: o front-end inteiro (todas as
  ~10 abas da ficha, ~35 popups) trabalha com um único objeto `Character` aninhado
  (`entities/character/model/types.ts`). No banco, isso é totalmente relacional — uma tabela por
  seção de lista (classes, perícias, armas, talentos, etc.), nunca um blob JSONB. A camada
  `api/_lib/characterRepo.ts` é a única que monta/desmonta esse objeto a partir das tabelas; nada
  em `src/` precisa saber disso.
- **Toda mutação é otimista**: alterar algo na UI atualiza o estado local imediatamente e dispara
  a chamada de API sem esperar a resposta (`AppDataProvider`). Não existe refetch depois de salvar.
- **Biblioteca compartilhada**: uma tabela Postgres por categoria (`library_spells`,
  `library_feats`, etc.), cada uma com uma FK simples `system_id` — não há tabela intermediária,
  porque a relação sistema→item é um-para-muitos.
- **Backend como dispatchers finos**: o plano Vercel Hobby usado neste projeto tem um teto de 12
  funções serverless por deploy — já estourado uma vez. Por isso, `api/**/*.ts` quase nunca ganha
  um arquivo novo por endpoint; a lógica vive em `api/_lib/routes/<área>.ts` e um dispatcher
  (`api/characters/[...path].ts`, por exemplo) roteia por método/caminho. Ver a seção
  "Backend" de `CLAUDE.md` antes de criar qualquer rota nova.
- **Testes** ficam ao lado do código que cobrem (`algo.ts` + `algo.test.ts`), não numa pasta
  `__tests__` separada. Cobertura é concentrada no motor de cálculo
  (`entities/character/model/calculations.ts`), nos snapshots, e em alguns componentes/
  helpers compartilhados — não há (ainda) testes de integração ponta-a-ponta.

## 3. Fluxo de trabalho do dia a dia

Este projeto é desenvolvido majoritariamente via **Claude Code** (incluindo sessões no navegador,
sem acesso interativo a um Postgres real nem a um navegador de verdade para testar) — isso molda
algumas convenções abaixo.

- **Branch + PR, nunca push direto em `main`**. `vercel.json`'s `git.deploymentEnabled` só builda
  `main` — outras branches não geram preview/deploy.
- **Toda mudança de produto/design pedida pelo usuário deve ser registrada em
  [`DESIGN_NOTES.md`](./DESIGN_NOTES.md)**, à medida que é feita — regra permanente, documentada
  no próprio arquivo (seção "Regra permanente de processo") e repetida em `CLAUDE.md`. Isso não é
  opcional nem precisa ser pedido a cada vez.
- **Pipeline de verificação antes de qualquer commit** (não existe ambiente de navegador real
  disponível na maior parte do desenvolvimento, então isto é a rede de segurança):
  ```bash
  npx tsc -b       # typecheck (tsconfig.app.json + tsconfig.node.json)
  npm run lint     # ESLint
  npm test         # Vitest
  npm run build    # build de produção
  ```
  Quando há mudança de UI e um navegador real está disponível, também vale testar manualmente —
  mas isso raramente é possível neste projeto hoje (ver gap na seção 4).
- **Perícias e algumas outras listas são "auto-curáveis"**: mudanças no catálogo de perícias
  (`entities/character/model/skillCatalog.ts`) não migram fichas já salvas automaticamente — existe
  uma função `reconcileSkills`, chamada em todo personagem vindo da API, que reconcilia fichas
  antigas contra o catálogo atual na hora de abrir. Esse é o padrão a seguir se outro catálogo
  similar precisar mudar de forma incompatível no futuro.

## 4. Deploy

- **Vercel, a partir do GitHub, só a partir de `main`.** Cada push em `main` builda e publica
  automaticamente — não há etapa manual de "aprovar deploy".
- **Postgres é o Neon, integrado como Vercel Storage.** A variável de conexão chega como
  `COMPENDIO_DB_DATABASE_URL` em produção (não `DATABASE_URL` puro — a integração foi conectada com
  um prefixo customizado; ver `db/env.ts`).
- ⚠️ **Migrações de banco NÃO rodam automaticamente no deploy.** `npm run db:migrate` é um script
  manual (`drizzle-kit migrate`, lendo `.env.development.local`) — o build da Vercel (`tsc -b && vite build`)
  não o chama. **Isso já causou uma queda de produção real**: um PR que adicionava colunas novas
  (`prerequisite`/`benefit` em talentos) foi mergeado e buildado, mas a migração correspondente só
  foi aplicada ao banco depois, manualmente — nesse intervalo, toda chamada que tocava a tabela
  afetada (incluindo `GET /api/bootstrap`, carregado em todo login) quebrava com um erro de coluna
  inexistente, e o site inteiro ficou fora do ar até alguém rodar o SQL da migração.
  **Checklist para qualquer PR que mexe em `db/schema.ts`**: gerar a migração
  (`drizzle-kit generate`, ver nota em `CLAUDE.md` sobre quando ela precisa de TTY), revisar o SQL
  gerado em `db/migrations/`, e — assim que o PR for mergeado e buildado — aplicar essa migração no
  banco de produção **antes ou imediatamente depois** do deploy ir ao ar (idealmente antes: a API
  antiga tolera colunas novas que ainda não usa; a API nova não tolera colunas que ainda não
  existem). Como ninguém neste projeto tem hoje acesso de terminal a um ambiente com
  `DATABASE_URL` de produção configurado, a forma mais confiável até agora tem sido **gerar o SQL
  da migração e entregá-lo pronto pra colar no editor SQL do Neon** — não presuma que
  `npm run db:migrate` rodou sozinho em algum lugar.
- **Teto de 12 funções serverless (plano Hobby)** — ver seção 2 acima e `CLAUDE.md`. Um novo
  endpoint quase sempre deve entrar num dispatcher já existente, não um arquivo novo em `api/`.
- **Variáveis de ambiente usadas em produção** (ver `db/env.ts`, `api/_lib/rateLimit.ts`):
  - `DATABASE_URL` ou `COMPENDIO_DB_DATABASE_URL` — obrigatória.
  - `UPSTASH_DB_KV_REST_API_URL`/`_TOKEN` (ou os fallbacks `KV_REST_API_URL`/`UPSTASH_REDIS_REST_URL`
    e seus tokens) — opcional; sem elas, o rate limiting de login fica **desligado** (não bloqueia
    nada), não quebra o app.
- **Gap conhecido de ambiente de desenvolvimento local**: não há hoje um `.env.example` nem um
  fluxo documentado de "rodar o backend localmente" — `npm run dev` só sobe o Vite (front-end
  puro); as chamadas a `/api/...` não têm pra onde ir sem algo tipo `vercel dev` (não configurado
  neste repo) servindo as Serverless Functions junto. Se você for o primeiro a precisar de um
  ambiente local completo, vale configurar isso e atualizar esta seção.

## 5. Estado do projeto: feito, planejado, faltando

### Feito

Praticamente toda a ficha de Pathfinder 1e descrita na seção 1 está implementada e em uso em
produção: autenticação (sem cadastro público), gestão de usuários/admin com auditoria e rate
limiting, biblioteca compartilhada por sistema (8 categorias), toda a ficha (identidade, combate,
perícias, magias, talentos/habilidades, inventário/carga, histórico com snapshots em árvore),
compartilhamento de ficha usuário-a-usuário (somente leitura), galeria de fotos do personagem, e
upload de foto com validação real (decodifica a imagem no navegador antes de aceitar). O histórico
completo, decisão por decisão, está em [`DESIGN_NOTES.md`](./DESIGN_NOTES.md) — é longo demais
pra resumir aqui sem perder informação; a lista de títulos de seção do arquivo já serve como um
índice cronológico razoável.

### Planejado / pendente

A lista detalhada, com o motivo de cada item ainda não ter sido feito (precisa de decisão de
produto, é grande, ou é pequeno mas não priorizado ainda), vive em
**[`BACKLOG.md`](./BACKLOG.md)**. Resumo por categoria:

- **Precisam de uma decisão de produto antes de começar**: tipos de modificador de atributo
  (temporário vs. classe vs. racial...) e redesenho do popup; criptografia dos dados da ficha no
  banco; onde exatamente "ver dados de vida" deveria aparecer que hoje não aparece.
- **Bem definidos, mas grandes**: cortar/posicionar foto ao fazer upload (crop interativo);
  galeria de fotos virar uma aba da ficha (hoje é só um popup) com seleção de foto de perfil a
  partir dela; habilidades tipo magia (spell-like) ainda não têm um fluxo de UI dedicado (usam o
  genérico de habilidade especial); história do personagem ainda é texto puro, sem
  negrito/itálico.
- **Pequenos, mesmo padrão já usado em outro lugar**: raça ainda não vem da biblioteca
  compartilhada (é texto livre); idiomas também continuam texto livre, não ligados à biblioteca
  (confirmado — não é mais "preciso checar", é um fato); um campo "Tipo" na Identidade vindo da
  biblioteca.
- **Toda a biblioteca compartilhada (tela própria, fora da ficha) ainda só permite adicionar — não
  editar nem remover nenhum item.** Habilidades especiais criadas direto na ficha (não puxadas da
  biblioteca) continuam "avulsas", sem vínculo nenhum com a biblioteca compartilhada.

### Faltando / gaps conhecidos (registrados em `DESIGN_NOTES.md`, não em `BACKLOG.md`)

- Nenhum ambiente de desenvolvimento local com backend funcional está documentado (ver seção 4).
- O padrão geral de "atualização otimista + erro só no console" significa que a maioria das
  mutações do app não mostra nenhum feedback visual de erro ao usuário se a chamada de API falhar
  (alguns pontos específicos, como edição de usuário, já foram corrigidos individualmente; o
  padrão geral não).
- Fichas de monstro (visão do mestre) e plano de evolução por nível estão reservados no layout mas
  **não implementados**.
- PDF de exportação é um botão sem função, por design original — nunca foi prometido como
  funcional.

## 6. Onde procurar o quê

| Pergunta                                                        | Onde olhar                                                                                 |
| --------------------------------------------------------------- | ------------------------------------------------------------------------------------------ |
| "Como o cálculo de X funciona?" (CA, perícia, carga...)         | `entities/character/model/calculations.ts` + testes ao lado                                |
| "Por que essa tela é assim?"                                    | `DESIGN_NOTES.md` — busque pelo nome da feature/tela                                       |
| "Como adiciono um endpoint novo?"                               | `CLAUDE.md` → seção Backend — quase sempre um dispatcher existente, não um arquivo novo    |
| "Como os dados do personagem viram linhas no banco?"            | `api/_lib/characterRepo.ts` + `db/schema.ts`                                               |
| "Como funcionam os snapshots por nível?"                        | `entities/character/model/snapshots.ts` + `CLAUDE.md` → "Level snapshots"                  |
| "O que falta fazer?"                                            | `BACKLOG.md`                                                                               |
| "Como faço deploy / o que pode quebrar?"                        | Seção 4 deste arquivo                                                                      |
| "Por que uma rota com sub-caminho está dando 405/400 estranho?" | `CLAUDE.md` → a seção sobre `getPathSegments` — já foi um bug de produção real, duas vezes |

## 7. Mapa da documentação

| Arquivo                                | Pra quem                                                 | O que tem                                                                        |
| -------------------------------------- | -------------------------------------------------------- | -------------------------------------------------------------------------------- |
| [`README.md`](./README.md)             | Qualquer pessoa chegando no repo                         | Stack, como rodar, aponta pra cá                                                 |
| **`ONBOARDING.md`** (este arquivo)     | Gente nova no projeto                                    | Visão geral alto e baixo nível, fluxo de trabalho, deploy, status                |
| [`CLAUDE.md`](./CLAUDE.md)             | Quem vai mexer no código (humano ou Claude Code)         | Arquitetura detalhada, comandos, padrões obrigatórios do backend                 |
| [`DESIGN_NOTES.md`](./DESIGN_NOTES.md) | Quem precisa da história/razão de uma decisão de produto | Regras de produto + log cronológico completo de toda decisão de design já tomada |
| [`BACKLOG.md`](./BACKLOG.md)           | Quem vai decidir o que fazer a seguir                    | Pedidos pendentes, organizados por tamanho/ambiguidade                           |
