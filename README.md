# Core UI - Monorepo

Monorepo com React 18, Vite, Tailwind CSS e shadcn/ui.

## Estrutura

- **apps/sales-app** – Aplicação (vendas + resgate + histórico)
- **packages/ui** – Componentes compartilhados (estilo shadcn/ui)
- **packages/api-client** – Cliente HTTP compartilhado para APIs

## Pré-requisitos

- Node.js 18+
- npm 9+ (ou pnpm/yarn com workspaces)

## Instalação

```bash
npm install
```

## Desenvolvimento
```bash
# App (porta 5174)
npm run dev:sales
```

## Keycloak (login hospedado)

O app `sales-app` usa `keycloak-js` com `onLoad: login-required`.
Não existe mais tela/rota própria de login (`/login`).

### Variáveis de ambiente (local)

Cada app já tem `.env.development` com o padrão abaixo:

- `VITE_KEYCLOAK_URL=http://localhost:8081`
- `VITE_KEYCLOAK_REALM=gifto`
- `VITE_KEYCLOAK_CLIENT_ID=voucher-platform-sales-web`
- `VITE_APP_URL=http://localhost:5174`

### Variáveis de ambiente (produção MVP no Lightsail)

Para o `sales-app` em produção, estas variáveis são embutidas no build do Vite.
Mantenha `VITE_APP_URL` exatamente igual à origem pública usada no browser (protocolo + host + porta, se houver).

```env
VITE_APP_URL=http://3.239.44.109
VITE_API_BASE_URL=http://3.239.44.109/api
VITE_KEYCLOAK_URL=http://3.239.44.109/auth
VITE_KEYCLOAK_REALM=gifto
VITE_KEYCLOAK_CLIENT_ID=voucher-platform-sales-web
```

### Keycloak em produção: redirect URIs (obrigatório)

No Keycloak (client web `voucher-platform-sales-web`), configure:

1. `Valid Redirect URIs`:
   - `http://3.239.44.109/*`
2. `Web origins`:
   - `http://3.239.44.109`
3. `Valid Post Logout Redirect URIs`:
   - `http://3.239.44.109/*`

Para evitar falhas por CORS, libere no backend pelo menos a origem do front:
`http://3.239.44.109`

### Nginx (SPA + rotas do backend)

Para casar o `sales-app` com o backend e o Keycloak no mesmo host, o Nginx deve:

1. Servir o `dist` do `sales-app` na rota `/` com fallback para `index.html` (SPA).
2. Manter as rotas/proxy existentes para:
   - `/api/*` (API do backend)
   - `/auth/*` (Keycloak em PROD)

Use o template em [`deploy/nginx/sales-app-spa.conf`](deploy/nginx/sales-app-spa.conf) e adapte apenas o path onde o build será colocado (ex.: `/var/www/sales-app/dist`).

### O que configurar no Keycloak local

Para os clients web:

1. `voucher-platform-sales-web`

Garanta:

- `Valid Redirect URIs` (local de dev):
  - `http://localhost:5174/*`
- `Web Origins`:
  - `http://localhost:5174`
- `Valid Post Logout Redirect URIs`:
  - `http://localhost:5174/*`

Com isso, ao acessar o app sem sessão, ele é redirecionado ao Keycloak e volta autenticado.

## Build

```bash
# App
npm run build

# Por workspace
npm run build:sales
```

## Lint e formatação

```bash
npm run lint
npm run format        # formata arquivos
npm run format:check  # apenas verifica
```

## Tecnologias

- **React 18** + **Vite 5**
- **Tailwind CSS** + **shadcn/ui** (Button, Card, utilitário `cn`)
- **React Router v6**
- **ESLint** + **Prettier**
- **TypeScript 5**
