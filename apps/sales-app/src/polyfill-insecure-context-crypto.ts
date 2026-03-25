/**
 * Em http://IP (não é secure context), o Chrome não expõe crypto.randomUUID().
 * O keycloak-js usa randomUUID em createLoginUrl (state/nonce) antes do PKCE.
 * crypto.getRandomValues costuma existir mesmo em HTTP — RFC 4122 v4 com bytes seguros.
 */
const c = globalThis.crypto;

if (typeof c !== 'undefined' && typeof c.randomUUID !== 'function') {
  const randomUUID = (): string => {
    if (typeof c.getRandomValues === 'function') {
      const bytes = new Uint8Array(16);
      c.getRandomValues(bytes);
      bytes[6] = (bytes[6]! & 0x0f) | 0x40;
      bytes[8] = (bytes[8]! & 0x3f) | 0x80;
      const h = Array.from(bytes, (b) => b.toString(16).padStart(2, '0')).join('');
      return `${h.slice(0, 8)}-${h.slice(8, 12)}-${h.slice(12, 16)}-${h.slice(16, 20)}-${h.slice(20)}`;
    }
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (ch) => {
      const r = (Math.random() * 16) | 0;
      const v = ch === 'x' ? r : (r & 0x3) | 0x8;
      return v.toString(16);
    });
  };

  Object.defineProperty(c, 'randomUUID', {
    value: randomUUID,
    configurable: true,
    writable: true,
  });
}
