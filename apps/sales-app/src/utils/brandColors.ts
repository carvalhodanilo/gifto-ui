const HEX = /^#([0-9A-Fa-f]{3}|[0-9A-Fa-f]{6})$/;

/**
 * Converte entrada do utilizador para cor guardada na API ou null (vazio = default da app).
 * @throws Error se preenchido mas formato inválido
 */
export function normalizeColorInput(raw: string): string | null {
  const t = raw.trim();
  if (!t) return null;
  const v = t.startsWith('#') ? t : `#${t}`;
  if (!HEX.test(v)) {
    throw new Error('Cor inválida: use #RGB ou #RRGGBB (ex.: #003366).');
  }
  return v;
}

/** Valor estável para `<input type="color" />` (exige #rrggbb). */
export function hexForColorInput(raw: string, fallbackFullHex: string): string {
  const t = raw.trim();
  if (!t || !HEX.test(t.startsWith('#') ? t : `#${t}`)) {
    return fallbackFullHex.startsWith('#') && fallbackFullHex.length === 7 ? fallbackFullHex : '#003366';
  }
  const v = t.startsWith('#') ? t : `#${t}`;
  if (v.length === 4) {
    const r = v[1];
    const g = v[2];
    const b = v[3];
    return `#${r}${r}${g}${g}${b}${b}`.toLowerCase();
  }
  return v.toLowerCase();
}
