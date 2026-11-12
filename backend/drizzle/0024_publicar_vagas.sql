-- As vagas importadas foram conferidas pela equipe e passam a aparecer para participantes.
UPDATE jobs
SET status = 'aberta', checked_at = CURRENT_DATE
WHERE status = 'rascunho';
