-- ══════════════════════════════════════════════════════════════
-- Gestão da Jaque — Migração Inicial
-- Cria as 4 tabelas core do dashboard
-- ══════════════════════════════════════════════════════════════

-- Extensão para geração de UUIDs
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- ── 1. accounts ──────────────────────────────────────────────
-- Armazena os perfis de Instagram conectados
CREATE TABLE IF NOT EXISTS accounts (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  ig_user_id    TEXT UNIQUE,
  ig_username   TEXT NOT NULL,
  display_name  TEXT,
  profile_pic   TEXT,
  access_token  TEXT,
  token_expiry  TIMESTAMPTZ,
  is_active     BOOLEAN DEFAULT TRUE,
  created_at    TIMESTAMPTZ DEFAULT NOW(),
  updated_at    TIMESTAMPTZ DEFAULT NOW()
);

-- ── 2. metrics_history ───────────────────────────────────────
-- Histórico persistente de métricas diárias por conta
CREATE TABLE IF NOT EXISTS metrics_history (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  account_id      UUID NOT NULL REFERENCES accounts(id) ON DELETE CASCADE,
  date            DATE NOT NULL,
  followers       INTEGER DEFAULT 0,
  follows         INTEGER DEFAULT 0,
  reach           INTEGER DEFAULT 0,
  impressions     INTEGER DEFAULT 0,
  profile_views   INTEGER DEFAULT 0,
  website_clicks  INTEGER DEFAULT 0,
  engagement_rate NUMERIC(5,2) DEFAULT 0,
  posts_count     INTEGER DEFAULT 0,
  stories_count   INTEGER DEFAULT 0,
  reels_count     INTEGER DEFAULT 0,
  created_at      TIMESTAMPTZ DEFAULT NOW(),

  -- Evita duplicatas: uma entrada por conta por dia
  UNIQUE(account_id, date)
);

-- ── 3. content_tags ──────────────────────────────────────────
-- Classificação de posts por tema/categoria
CREATE TABLE IF NOT EXISTS content_tags (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  post_id     TEXT NOT NULL,
  account_id  UUID NOT NULL REFERENCES accounts(id) ON DELETE CASCADE,
  tag         TEXT NOT NULL,
  created_at  TIMESTAMPTZ DEFAULT NOW(),

  -- Evita tag duplicada no mesmo post
  UNIQUE(post_id, tag)
);

-- ── 4. context_notes ─────────────────────────────────────────
-- Anotações de eventos externos vinculadas a datas
CREATE TABLE IF NOT EXISTS context_notes (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  account_id  UUID REFERENCES accounts(id) ON DELETE CASCADE,
  date        DATE NOT NULL,
  note        TEXT NOT NULL,
  category    TEXT DEFAULT 'geral',
  created_at  TIMESTAMPTZ DEFAULT NOW()
);

-- ── Índices de performance ───────────────────────────────────
CREATE INDEX IF NOT EXISTS idx_metrics_account_date ON metrics_history(account_id, date DESC);
CREATE INDEX IF NOT EXISTS idx_tags_account ON content_tags(account_id);
CREATE INDEX IF NOT EXISTS idx_tags_tag ON content_tags(tag);
CREATE INDEX IF NOT EXISTS idx_notes_account_date ON context_notes(account_id, date DESC);
