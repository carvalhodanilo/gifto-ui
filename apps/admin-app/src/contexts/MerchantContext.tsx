import * as React from 'react';
import type { Merchant } from '../types/merchant';
import type { MerchantOption } from '../types/merchant-api';

export interface MerchantState {
  merchant: Merchant | null;
  setMerchant: (option: MerchantOption | null) => void;
  resetMerchant: () => void;
}

const defaultState: MerchantState = {
  merchant: null,
  setMerchant: () => {},
  resetMerchant: () => {},
};

const MerchantContext = React.createContext<MerchantState>(defaultState);

function merchantFromOption(option: MerchantOption): Merchant {
  return {
    merchantId: option.id,
    merchantName: option.merchantName,
  };
}

export function MerchantProvider({ children }: { children: React.ReactNode }) {
  const [merchant, setMerchantState] = React.useState<Merchant | null>(null);

  const setMerchant = React.useCallback((option: MerchantOption | null) => {
    setMerchantState(option ? merchantFromOption(option) : null);
  }, []);

  const resetMerchant = React.useCallback(() => {
    setMerchantState(null);
  }, []);

  const value = React.useMemo(
    () => ({ merchant, setMerchant, resetMerchant }),
    [merchant, setMerchant, resetMerchant]
  );

  return <MerchantContext.Provider value={value}>{children}</MerchantContext.Provider>;
}

export function useMerchant(): MerchantState {
  const ctx = React.useContext(MerchantContext);
  if (ctx === undefined) {
    throw new Error('useMerchant must be used within MerchantProvider');
  }
  return ctx;
}
