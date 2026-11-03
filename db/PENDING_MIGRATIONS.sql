-- Compêndio de Fichas — SQL manual pendente desta PR (claude/changelog-notification-banner).
--
-- Não é um arquivo de migration do drizzle-kit (não aparece no journal/meta) — é só uma cópia
-- acumulada, pronta para rodar manualmente (ex: console do Neon), de tudo que as migrations
-- desta PR adicionam ao banco. Existe porque o fluxo de trabalho é só em nuvem: não há como
-- rodar `npm run db:migrate` localmente, então cada migration gerada ao longo desta PR é
-- replicada aqui, na ordem em que foi criada.
--
-- Todo statement abaixo é idempotente (IF NOT EXISTS / equivalente) e nenhum apaga dados — pode
-- rodar o arquivo inteiro de uma vez, mesmo que parte já tenha sido aplicada antes. Vai sendo
-- ampliado conforme mais migrations entrarem nesta PR; roda tudo de uma vez só quando a PR
-- estiver pronta.

-- ============================================================
-- 0024 — notificação de novidades (banner de changelog)
-- ============================================================
ALTER TABLE "users" ADD COLUMN IF NOT EXISTS "last_seen_changelog_version" text;
