# Compêndio de Fichas

SPA para gerenciar fichas de personagem de RPG de mesa, multi-usuário e multi-sistema. Esta
rodada implementa o sistema **Pathfinder 1ª Edição**; outros sistemas aparecem apenas como
contexto de navegação (alguns marcados "em breve").

Ver `DESIGN_NOTES.md` para as regras de produto e decisões de design completas.

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

## Scripts

- `npm run dev` — servidor de desenvolvimento
- `npm run build` — typecheck + build de produção
- `npm run preview` — preview do build de produção
- `npm run lint` — ESLint
- `npm run format` — Prettier
- `npm test` — Vitest (execução única)
- `npm run test:watch` — Vitest (modo watch)

## Estado do projeto

Aplicação de frontend com dados de exemplo em memória (sem backend real) — login, cadastro e
persistência são simulados via `localStorage`, mantendo o mesmo escopo do mockup original em
Tailwind (`Compendio de Fichas.dc.html`), agora implementado como componentes React reais em vez
de HTML estático.
