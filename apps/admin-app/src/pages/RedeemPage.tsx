import * as React from 'react';
import { getVoucherByDisplayCode } from '../api/vouchers';
import { VoucherSearchForm } from './redeem/VoucherSearchForm';
import { VoucherResultCard } from './redeem/VoucherResultCard';
import { RedeemVoucherModal } from './redeem/RedeemVoucherModal';
import type { VoucherByDisplayCode } from '../types/voucher-redeem';
import { formatCurrency } from '../utils/format';

/** Página de resgate: buscar por display code → ver saldo → abrir modal → resgatar. */
export function RedeemPage() {
  const inputRef = React.useRef<HTMLInputElement>(null);

  const [displayCode, setDisplayCode] = React.useState('');
  const [voucher, setVoucher] = React.useState<VoucherByDisplayCode | null>(null);
  const [loading, setLoading] = React.useState(false);
  const [searchError, setSearchError] = React.useState<string | null>(null);
  const [modalOpen, setModalOpen] = React.useState(false);
  const [successMessage, setSuccessMessage] = React.useState<{
    amountCents: number;
    newBalanceCents: number;
  } | null>(null);

  React.useEffect(() => {
    inputRef.current?.focus();
  }, []);

  const handleSearch = React.useCallback(async () => {
    const code = displayCode.trim();
    if (!code) return;
    setSearchError(null);
    setLoading(true);
    try {
      const data = await getVoucherByDisplayCode(code);
      setVoucher(data);
    } catch (err) {
      setSearchError(err instanceof Error ? err.message : 'Voucher não encontrado');
      setVoucher(null);
    } finally {
      setLoading(false);
    }
  }, [displayCode]);

  const handleRedeemClick = () => setModalOpen(true);

  const handleRedeemSuccess = (newBalanceCents: number) => {
    const amountRedeemed = voucher ? voucher.balanceCents - newBalanceCents : 0;
    setVoucher((prev) =>
      prev ? { ...prev, balanceCents: newBalanceCents } : null
    );
    setModalOpen(false);
    setSuccessMessage({ amountCents: amountRedeemed, newBalanceCents });
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold text-foreground">Resgate</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Digite o código do voucher para buscar e resgatar o valor.
        </p>
      </div>

      <VoucherSearchForm
        value={displayCode}
        onChange={setDisplayCode}
        onSearch={handleSearch}
        loading={loading}
        inputRef={inputRef}
      />

      {searchError && (
        <div className="rounded-lg border border-destructive/50 bg-destructive/10 p-3 text-sm text-destructive">
          {searchError}
        </div>
      )}

      {voucher && !searchError && (
        <>
          <VoucherResultCard
            voucher={voucher}
            displayCodeUsedForSearch={displayCode.trim()}
            onRedeem={handleRedeemClick}
          />

          {successMessage && (
            <div className="rounded-lg border border-green-200 bg-green-50 p-4 text-sm dark:border-green-800 dark:bg-green-900/20">
              <p className="font-medium text-green-800 dark:text-green-300">Resgate concluído</p>
              <p className="mt-1 text-green-700 dark:text-green-400">
                Valor resgatado: {formatCurrency(successMessage.amountCents)}. Novo saldo:{' '}
                {formatCurrency(successMessage.newBalanceCents)}.
              </p>
            </div>
          )}
        </>
      )}

      {voucher && (
        <RedeemVoucherModal
          open={modalOpen}
          onClose={() => setModalOpen(false)}
          voucher={voucher}
          displayCodeUsedForSearch={displayCode.trim()}
          onSuccess={handleRedeemSuccess}
        />
      )}
    </div>
  );
}
