# Compêndio de Fichas

SPA para gerenciar fichas de personagem de RPG de mesa, multi-usuário e multi-sistema. Hoje, só o
sistema **Pathfinder 1ª Edição** está de fato implementado; outros sistemas aparecem apenas como
contexto de navegação (marcados "em breve").

A aplicação tem um backend real (Postgres/Neon + Vercel Serverless Functions) — não é um mockup
local. **Novo no projeto? Comece por [`ONBOARDING.md`](./ONBOARDING.md)** — visão geral de alto e
baixo nível, fluxo de trabalho e deploy. Para arquitetura detalhada, veja [`CLAUDE.md`](./CLAUDE.md);
para o histórico completo de decisões de produto/design, [`DESIGN_NOTES.md`](./DESIGN_NOTES.md);
para o que está pendente, [`BACKLOG.md`](./BACKLOG.md).

## Stack

- [Vite](https://vite.dev) + [React 19](https://react.dev) + TypeScript
- [Tailwind CSS v4](https://tailwindcss.com)
- [Base UI](https://base-ui.com) para primitivos de dialog/switch/tabs/popover
- [react-hook-form](https://react-hook-form.com) + [zod](https://zod.dev) para formulários
- [@dnd-kit/react](https://dndkit.com) para reordenação por arrastar
- [lucide-react](https://lucide.dev) para ícones
- [Vitest](https://vitest.dev) + Testing Library para testes

## Rodando localmente

```bash
npm install
npm run dev
```

`npm run dev` sobe só o front-end (Vite). As chamadas a `/api/...` precisam de um backend rodando
junto — não há hoje um fluxo local documentado para isso (ver "Gap conhecido de ambiente de
desenvolvimento local" em [`ONBOARDING.md`](./ONBOARDING.md#4-deploy)). O desenvolvimento deste
projeto tem acontecido majoritariamente sem um navegador/backend real disponível, validado via
typecheck, lint, testes automatizados e build de produção (ver `ONBOARDING.md` → "Fluxo de
trabalho").

## Scripts

- `npm run dev` — servidor de desenvolvimento (só front-end, ver acima)
- `npm run build` — typecheck + build de produção
- `npm run preview` — preview do build de produção
- `npm run lint` — ESLint
- `npm run format` — Prettier
- `npm test` — Vitest (execução única)
- `npm run test:watch` — Vitest (modo watch)
- `npm run db:migrate` — aplica migrações pendentes (`drizzle-kit migrate`, lendo
  `.env.development.local`) — **não roda automaticamente no deploy**, ver `ONBOARDING.md` → Deploy
- `npm run db:seed` — popula dados de exemplo (`db/seed.ts`)

## Estado do projeto

Backend real: Postgres (Neon) acessado via Vercel Serverless Functions, com Drizzle como ORM —
autenticação por sessão (cookie), sem cadastro público. Deploy automático a partir de `main` na
Vercel. Detalhes de arquitetura em [`CLAUDE.md`](./CLAUDE.md); o que já está implementado vs.
pendente está resumido em [`ONBOARDING.md`](./ONBOARDING.md#5-estado-do-projeto-feito-planejado-faltando)
e detalhado em [`BACKLOG.md`](./BACKLOG.md).
