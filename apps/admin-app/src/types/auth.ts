/**
 * Usuário autenticado (admin). MVP: mockado no AuthContext.
 */
export interface AuthUser {
  userId: string;
  email: string;
  merchantId: string;
  merchantName: string;
}
