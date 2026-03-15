/**
 * Usuário autenticado (operador/merchant). MVP: dados mockados no AuthContext.
 * Futuro: retorno do backend após POST /auth/login (tenantId identificado pelo backend).
 */
export interface AuthUser {
  userId: string;
  email: string;
  merchantId: string;
  merchantName: string;
}
