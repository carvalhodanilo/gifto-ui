/** Item retornado por GET /merchants/active */
export interface MerchantOption {
  id: string;
  merchantName: string;
}

export interface GetActiveMerchantsResponse {
  merchantList: MerchantOption[];
}
