import type { VoucherListItem } from '../types/voucher';

/**
 * Lista mockada de vouchers emitidos para a página principal de Vendas.
 * Futuro: substituir por chamada à API de listagem (ex.: GET /v1/vouchers?page=1&limit=10).
 * A resposta da API deve ser mapeada para VoucherListItem[] e a paginação tratada aqui.
 */
export function getMockVouchersList(): VoucherListItem[] {
  const now = new Date();
  return [
    {
      voucherId: 'mock-v1',
      displayCode: 'ABC1-XYZ9',
      campaignName: 'Natal 2025',
      amountCents: 10000,
      issuedAt: new Date(now.getTime() - 3600000).toISOString(),
      status: 'Emitido',
    },
    {
      voucherId: 'mock-v2',
      displayCode: 'DEF2-UVW8',
      campaignName: 'Dia das Mães',
      amountCents: 5000,
      issuedAt: new Date(now.getTime() - 7200000).toISOString(),
      status: 'Emitido',
    },
    {
      voucherId: 'mock-v3',
      displayCode: 'GHI3-RST7',
      campaignName: 'Black Friday',
      amountCents: 30000,
      issuedAt: new Date(now.getTime() - 86400000).toISOString(),
      status: 'Emitido',
    },
  ];
}
