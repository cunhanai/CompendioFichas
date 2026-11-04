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

-- ============================================================
-- 0025 — soft delete (lixeira) para itens da biblioteca compartilhada
-- ============================================================
ALTER TABLE "library_classes" ADD COLUMN IF NOT EXISTS "deleted_at" timestamp with time zone;
ALTER TABLE "library_creature_types" ADD COLUMN IF NOT EXISTS "deleted_at" timestamp with time zone;
ALTER TABLE "library_creatures" ADD COLUMN IF NOT EXISTS "deleted_at" timestamp with time zone;
ALTER TABLE "library_feats" ADD COLUMN IF NOT EXISTS "deleted_at" timestamp with time zone;
ALTER TABLE "library_languages" ADD COLUMN IF NOT EXISTS "deleted_at" timestamp with time zone;
ALTER TABLE "library_races" ADD COLUMN IF NOT EXISTS "deleted_at" timestamp with time zone;
ALTER TABLE "library_skills" ADD COLUMN IF NOT EXISTS "deleted_at" timestamp with time zone;
ALTER TABLE "library_special_abilities" ADD COLUMN IF NOT EXISTS "deleted_at" timestamp with time zone;
ALTER TABLE "library_spells" ADD COLUMN IF NOT EXISTS "deleted_at" timestamp with time zone;
ALTER TABLE "library_weapons" ADD COLUMN IF NOT EXISTS "deleted_at" timestamp with time zone;
