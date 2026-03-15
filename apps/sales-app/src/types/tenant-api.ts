/** Item retornado por GET /tenants (lista de empresas para login). */
export interface TenantOption {
  id: string;
  fantasyName: string;
}

export interface GetTenantsResponse {
  tenants: TenantOption[];
}
