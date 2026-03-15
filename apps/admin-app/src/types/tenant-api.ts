/** Item retornado por GET /tenants (lista para login). */
export interface TenantOption {
  id: string;
  fantasyName: string;
}

export interface GetTenantsResponse {
  tenants: TenantOption[];
}
