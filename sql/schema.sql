CREATE TABLE IF NOT EXISTS guides (
  id         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project    TEXT NOT NULL CHECK (length(trim(project)) > 0),
  cost       TEXT NOT NULL DEFAULT '',
  link       TEXT NOT NULL,
  status     TEXT NOT NULL DEFAULT 'Live',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS guides_created_at_idx ON guides (created_at DESC, id DESC);

CREATE OR REPLACE FUNCTION set_updated_at() RETURNS trigger AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS guides_set_updated_at ON guides;
CREATE TRIGGER guides_set_updated_at
  BEFORE UPDATE ON guides
  FOR EACH ROW EXECUTE FUNCTION set_updated_at();
