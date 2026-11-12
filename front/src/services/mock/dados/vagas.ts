/** Gerado por backend/scripts/gerar-vagas.mjs a partir de docs/cases/*-vagas.md. Não edite à mão. */
import type { TipoVaga } from '../../contratos.ts'

export type VagaInicial = { id: string; areaId: string; empresa: string; titulo: string; local: string; tipo: TipoVaga; url: string; conferidaEm: string }

/** Entram como rascunho: a equipe confere de novo e publica uma a uma. */
export const VAGAS_INICIAIS: VagaInicial[] = [
  {
    "id": "vaga-cf-1",
    "areaId": "corporate-finance",
    "empresa": "Genial Investimentos",
    "titulo": "Analista de Controle Financeiro Jr (contas a receber e faturamento)",
    "local": "São Paulo",
    "tipo": "junior",
    "url": "https://genial.gupy.io/jobs/12777838",
    "conferidaEm": "2026-11-11"
  },
  {
    "id": "vaga-cf-2",
    "areaId": "corporate-finance",
    "empresa": "Genial Investimentos",
    "titulo": "Analista Contábil Júnior",
    "local": "Rio de Janeiro",
    "tipo": "junior",
    "url": "https://genial.gupy.io/jobs/12788102",
    "conferidaEm": "2026-11-11"
  },
  {
    "id": "vaga-cf-3",
    "areaId": "corporate-finance",
    "empresa": "XP Inc.",
    "titulo": "Analista de Estratégia e Performance Júnior",
    "local": "São Paulo",
    "tipo": "junior",
    "url": "https://job-boards.greenhouse.io/xpinc/jobs/8839562002",
    "conferidaEm": "2026-11-11"
  },
  {
    "id": "vaga-cf-4",
    "areaId": "corporate-finance",
    "empresa": "Sicoob UniCentro Br",
    "titulo": "Assistente de Controladoria",
    "local": "Goiânia",
    "tipo": "outro",
    "url": "https://sicoobunicentrobr.gupy.io/jobs/12780982",
    "conferidaEm": "2026-11-11"
  },
  {
    "id": "vaga-cf-5",
    "areaId": "corporate-finance",
    "empresa": "Itaú Unibanco",
    "titulo": "Programa de Estágio Corporativo 2026 (banco de talentos, inclui a carreira Corporativo)",
    "local": "São Paulo",
    "tipo": "estagio",
    "url": "https://vemproitau.gupy.io/jobs/11511312",
    "conferidaEm": "2026-11-11"
  },
  {
    "id": "vaga-st-1",
    "areaId": "sales-trading",
    "empresa": "Rabobank",
    "titulo": "Estágio — Corporate Sales Desk",
    "local": "São Paulo",
    "tipo": "estagio",
    "url": "https://rabobank.jobs/en/job/estagio-corporate-sales-desk/JR_00142377/",
    "conferidaEm": "2026-11-11"
  },
  {
    "id": "vaga-st-2",
    "areaId": "sales-trading",
    "empresa": "XP Inc.",
    "titulo": "Estagiário(a) — Corporate Desk",
    "local": "São Paulo",
    "tipo": "estagio",
    "url": "https://job-boards.greenhouse.io/xpinc/jobs/8639452002",
    "conferidaEm": "2026-11-11"
  },
  {
    "id": "vaga-st-3",
    "areaId": "sales-trading",
    "empresa": "Itaú Unibanco",
    "titulo": "Programa de Estágio Corporativo 2026 (banco de talentos, inclui a carreira Negócios Atacado, onde ficam as mesas)",
    "local": "São Paulo",
    "tipo": "estagio",
    "url": "https://vemproitau.gupy.io/jobs/11511312",
    "conferidaEm": "2026-11-11"
  },
  {
    "id": "vaga-op-1",
    "areaId": "operacoes",
    "empresa": "Genial Investimentos",
    "titulo": "Analista de Back Office Jr (Asset — fundos estruturados)",
    "local": "São Paulo",
    "tipo": "junior",
    "url": "https://genial.gupy.io/jobs/12502759",
    "conferidaEm": "2026-11-11"
  },
  {
    "id": "vaga-op-2",
    "areaId": "operacoes",
    "empresa": "Sicoob UniCentro Br",
    "titulo": "Estágio — Banco de Talentos",
    "local": "Goiânia",
    "tipo": "estagio",
    "url": "https://sicoobunicentrobr.gupy.io/jobs/11014905",
    "conferidaEm": "2026-11-11"
  },
  {
    "id": "vaga-op-3",
    "areaId": "operacoes",
    "empresa": "Oliveira Trust",
    "titulo": "Analista Contábil em Fundos de Investimentos Jr",
    "local": "Rio de Janeiro",
    "tipo": "junior",
    "url": "https://vempraot.gupy.io/jobs/12483303",
    "conferidaEm": "2026-11-11"
  },
  {
    "id": "vaga-op-4",
    "areaId": "operacoes",
    "empresa": "Oliveira Trust",
    "titulo": "Assistente de Auditoria de Administração de Fundos",
    "local": "Rio de Janeiro",
    "tipo": "outro",
    "url": "https://vempraot.gupy.io/jobs/12849177",
    "conferidaEm": "2026-11-11"
  },
  {
    "id": "vaga-op-5",
    "areaId": "operacoes",
    "empresa": "Oliveira Trust",
    "titulo": "Banco de talentos",
    "local": "Rio de Janeiro",
    "tipo": "outro",
    "url": "https://vempraot.gupy.io/jobs/5670237",
    "conferidaEm": "2026-11-11"
  }
]
