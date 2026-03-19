/**
 * Utilitários para período em formato ISO week (YYYY-Wnn).
 * Semana = segunda a domingo (ISO 8601).
 */

/**
 * Retorna o ano e o número da semana ISO para uma data.
 */
export function getISOWeek(date: Date): { year: number; week: number } {
  const d = new Date(date);
  d.setHours(0, 0, 0, 0);
  // Quinta-feira da semana (ISO: semana começa na segunda)
  d.setDate(d.getDate() + 4 - (d.getDay() || 7));
  const yearStart = new Date(d.getFullYear(), 0, 1);
  const weekNo = Math.ceil((((d.getTime() - yearStart.getTime()) / 86400000) + 1) / 7);
  return { year: d.getFullYear(), week: weekNo };
}

/**
 * Formata como periodKey: YYYY-Wnn (nn com zero-pad).
 */
export function toPeriodKey(date: Date): string {
  const { year, week } = getISOWeek(date);
  return `${year}-W${String(week).padStart(2, '0')}`;
}

/**
 * Retorna o periodKey da semana atual (hoje).
 */
export function getCurrentPeriodKey(): string {
  return toPeriodKey(new Date());
}

/**
 * Retorna os últimos N periodKeys (incluindo o atual).
 * Ex.: getLastPeriodKeys(3) => [atual, anterior, anterior-2].
 */
export function getLastPeriodKeys(count: number): Array<{ periodKey: string; label: string }> {
  const result: Array<{ periodKey: string; label: string }> = [];
  const now = new Date();
  for (let i = 0; i < count; i++) {
    const d = new Date(now);
    d.setDate(d.getDate() - 7 * i);
    const key = toPeriodKey(d);
    const { year, week } = getISOWeek(d);
    result.push({ periodKey: key, label: `${year} – Semana ${week}` });
  }
  return result;
}

/**
 * Retorna os últimos N periodKeys fechados (excluindo a semana atual, ainda aberta).
 * Usado no seletor de Liquidação para mostrar apenas períodos já encerrados.
 * Ex.: getLastClosedPeriodKeys(3) => [semana passada, 2 atrás, 3 atrás].
 */
export function getLastClosedPeriodKeys(count: number): Array<{ periodKey: string; label: string }> {
  const result: Array<{ periodKey: string; label: string }> = [];
  const now = new Date();
  for (let i = 1; i <= count; i++) {
    const d = new Date(now);
    d.setDate(d.getDate() - 7 * i);
    const key = toPeriodKey(d);
    const { year, week } = getISOWeek(d);
    result.push({ periodKey: key, label: `${year} – Semana ${week}` });
  }
  return result;
}

/**
 * periodKey do último período fechado (semana passada). Útil como valor inicial na Liquidação.
 */
export function getLastClosedPeriodKey(): string {
  const [first] = getLastClosedPeriodKeys(1);
  return first?.periodKey ?? getCurrentPeriodKey();
}
