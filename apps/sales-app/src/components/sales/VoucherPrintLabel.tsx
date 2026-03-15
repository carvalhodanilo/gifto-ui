import { QRCodeSVG } from 'qrcode.react';
import { getApiBaseUrl } from '../../config/api';
import { formatCurrency, formatDateOnly } from '../../utils/format';

export interface VoucherPrintLabelProps {
  shoppingName: string;
  publicToken: string;
  displayCode: string;
  amountCents: number;
  expiresAt: string;
  /** Tamanho do QR em px; adequado para etiqueta térmica pequena. */
  qrSize?: number;
}

/**
 * Layout de impressão para etiqueta térmica pequena.
 * Preto e branco, compacto; usado apenas na impressão (window.print).
 * QR Code contém: {apiBase}/vouchers/{publicToken}
 */
export function VoucherPrintLabel({
  shoppingName,
  publicToken,
  displayCode,
  amountCents,
  expiresAt,
  qrSize = 80,
}: VoucherPrintLabelProps) {
  const voucherUrl = `${getApiBaseUrl()}/vouchers/${publicToken}`;

  return (
    <div className="voucher-print-root">
      <div className="voucher-print-label">
        <h1 className="voucher-print-title">VALE PRESENTE</h1>
        <p className="voucher-print-subtitle">{shoppingName}</p>
        <div className="voucher-print-qr">
          <QRCodeSVG
            value={voucherUrl}
            size={qrSize}
            level="M"
            bgColor="#ffffff"
            fgColor="#000000"
            includeMargin={false}
          />
        </div>
        <p className="voucher-print-code-label">Código:</p>
        <p className="voucher-print-code">{displayCode}</p>
        <p className="voucher-print-line">
          Valor: {formatCurrency(amountCents)}
        </p>
        <p className="voucher-print-line">
          Exp: {formatDateOnly(expiresAt)}
        </p>
      </div>
    </div>
  );
}
