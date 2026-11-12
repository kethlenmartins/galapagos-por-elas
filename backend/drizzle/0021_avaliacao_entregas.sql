-- Avaliação pela equipe: nota com casas decimais e quem aprovou.
ALTER TABLE deliveries ALTER COLUMN grade TYPE real USING grade::real;
ALTER TABLE deliveries ADD COLUMN IF NOT EXISTS reviewed_by uuid;
ALTER TABLE deliveries ADD COLUMN IF NOT EXISTS reviewed_at timestamp with time zone;
ALTER TABLE review_requests ADD COLUMN IF NOT EXISTS resolved_at timestamp with time zone;
