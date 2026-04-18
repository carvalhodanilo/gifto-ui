/**
 * Cores da marca vindas da API (hex). Se inválidas ou ausentes, a página usa
 * `OFFICIAL_BRAND_PALETTE` em `@core-ui/ui` (ver `CampaignLandingPage`).
 */
const HEX = /^#([0-9a-fA-F]{3}|[0-9a-fA-F]{6})$/;

export function parseTenantHex(value: string | null | undefined): string | null {
  if (value == null || !value.trim()) return null;
  const v = value.trim();
  return HEX.test(v) ? v : null;
}
