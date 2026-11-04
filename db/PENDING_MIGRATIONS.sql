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

-- ============================================================
-- 0026 — item da biblioteca em mais de um idioma (PT/EN)
-- ============================================================
ALTER TABLE "library_classes" ADD COLUMN IF NOT EXISTS "locale" text DEFAULT 'pt' NOT NULL;
ALTER TABLE "library_classes" ADD COLUMN IF NOT EXISTS "group_id" uuid DEFAULT gen_random_uuid() NOT NULL;
ALTER TABLE "library_creature_types" ADD COLUMN IF NOT EXISTS "locale" text DEFAULT 'pt' NOT NULL;
ALTER TABLE "library_creature_types" ADD COLUMN IF NOT EXISTS "group_id" uuid DEFAULT gen_random_uuid() NOT NULL;
ALTER TABLE "library_creatures" ADD COLUMN IF NOT EXISTS "locale" text DEFAULT 'pt' NOT NULL;
ALTER TABLE "library_creatures" ADD COLUMN IF NOT EXISTS "group_id" uuid DEFAULT gen_random_uuid() NOT NULL;
ALTER TABLE "library_feats" ADD COLUMN IF NOT EXISTS "locale" text DEFAULT 'pt' NOT NULL;
ALTER TABLE "library_feats" ADD COLUMN IF NOT EXISTS "group_id" uuid DEFAULT gen_random_uuid() NOT NULL;
ALTER TABLE "library_languages" ADD COLUMN IF NOT EXISTS "locale" text DEFAULT 'pt' NOT NULL;
ALTER TABLE "library_languages" ADD COLUMN IF NOT EXISTS "group_id" uuid DEFAULT gen_random_uuid() NOT NULL;
ALTER TABLE "library_races" ADD COLUMN IF NOT EXISTS "locale" text DEFAULT 'pt' NOT NULL;
ALTER TABLE "library_races" ADD COLUMN IF NOT EXISTS "group_id" uuid DEFAULT gen_random_uuid() NOT NULL;
ALTER TABLE "library_skills" ADD COLUMN IF NOT EXISTS "locale" text DEFAULT 'pt' NOT NULL;
ALTER TABLE "library_skills" ADD COLUMN IF NOT EXISTS "group_id" uuid DEFAULT gen_random_uuid() NOT NULL;
ALTER TABLE "library_special_abilities" ADD COLUMN IF NOT EXISTS "locale" text DEFAULT 'pt' NOT NULL;
ALTER TABLE "library_special_abilities" ADD COLUMN IF NOT EXISTS "group_id" uuid DEFAULT gen_random_uuid() NOT NULL;
ALTER TABLE "library_spells" ADD COLUMN IF NOT EXISTS "locale" text DEFAULT 'pt' NOT NULL;
ALTER TABLE "library_spells" ADD COLUMN IF NOT EXISTS "group_id" uuid DEFAULT gen_random_uuid() NOT NULL;
ALTER TABLE "library_weapons" ADD COLUMN IF NOT EXISTS "locale" text DEFAULT 'pt' NOT NULL;
ALTER TABLE "library_weapons" ADD COLUMN IF NOT EXISTS "group_id" uuid DEFAULT gen_random_uuid() NOT NULL;
ALTER TABLE "users" ADD COLUMN IF NOT EXISTS "library_locale" text DEFAULT 'pt' NOT NULL;

-- ============================================================
-- 0027 — índice único parcial contra corrida no restore de item traduzido
-- ============================================================
CREATE UNIQUE INDEX IF NOT EXISTS "library_classes_active_group_locale_unique" ON "library_classes" USING btree ("system_id","group_id","locale") WHERE "library_classes"."deleted_at" IS NULL;
CREATE UNIQUE INDEX IF NOT EXISTS "library_creature_types_active_group_locale_unique" ON "library_creature_types" USING btree ("system_id","group_id","locale") WHERE "library_creature_types"."deleted_at" IS NULL;
CREATE UNIQUE INDEX IF NOT EXISTS "library_creatures_active_group_locale_unique" ON "library_creatures" USING btree ("system_id","group_id","locale") WHERE "library_creatures"."deleted_at" IS NULL;
CREATE UNIQUE INDEX IF NOT EXISTS "library_feats_active_group_locale_unique" ON "library_feats" USING btree ("system_id","group_id","locale") WHERE "library_feats"."deleted_at" IS NULL;
CREATE UNIQUE INDEX IF NOT EXISTS "library_languages_active_group_locale_unique" ON "library_languages" USING btree ("system_id","group_id","locale") WHERE "library_languages"."deleted_at" IS NULL;
CREATE UNIQUE INDEX IF NOT EXISTS "library_races_active_group_locale_unique" ON "library_races" USING btree ("system_id","group_id","locale") WHERE "library_races"."deleted_at" IS NULL;
CREATE UNIQUE INDEX IF NOT EXISTS "library_skills_active_group_locale_unique" ON "library_skills" USING btree ("system_id","group_id","locale") WHERE "library_skills"."deleted_at" IS NULL;
CREATE UNIQUE INDEX IF NOT EXISTS "library_special_abilities_active_group_locale_unique" ON "library_special_abilities" USING btree ("system_id","group_id","locale") WHERE "library_special_abilities"."deleted_at" IS NULL;
CREATE UNIQUE INDEX IF NOT EXISTS "library_spells_active_group_locale_unique" ON "library_spells" USING btree ("system_id","group_id","locale") WHERE "library_spells"."deleted_at" IS NULL;
CREATE UNIQUE INDEX IF NOT EXISTS "library_weapons_active_group_locale_unique" ON "library_weapons" USING btree ("system_id","group_id","locale") WHERE "library_weapons"."deleted_at" IS NULL;
