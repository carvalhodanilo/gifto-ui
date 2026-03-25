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

### Variáveis de ambiente (produção)

O Vite só embute `VITE_*` **no momento do `npm run build`**. Cada ambiente (VM, CI) precisa do ficheiro certo **antes** do build.

**Fluxo recomendado**

1. Versionado no Git: [`apps/sales-app/.env.production.example`](apps/sales-app/.env.production.example) (template com `SEU_IP_OU_DOMINIO`).
2. **Não** versionar: `apps/sales-app/.env.production` (está no [`.gitignore`](.gitignore)) — copie o template e preencha no servidor ou na máquina de build:

```bash
cp apps/sales-app/.env.production.example apps/sales-app/.env.production
# Edite SEU_IP_OU_DOMINIO para o IP ou domínio público (mesma origem do browser).
```

3. Build:

```bash
npm run build:sales
```

**Por que o `.env.production` “não veio” no `git clone`?** Porque o ficheiro real **não deve** ir no repositório (cada deploy tem IP/domínio diferentes). O que vem no clone é o **`.env.production.example`**.

**Alternativa (CI):** exportar as mesmas variáveis `VITE_*` no pipeline antes do `npm run build` — não precisa de ficheiro.

### Keycloak em produção: redirect URIs (obrigatório)

No Keycloak (client web `voucher-platform-sales-web`), use a **mesma origem** que está em `VITE_APP_URL` (ex.: `http://SEU_IP` na porta 80, sem `:80` na URL):

1. `Valid Redirect URIs`: `http://SEU_IP/*`
2. `Web origins`: `http://SEU_IP`
3. `Valid Post Logout Redirect URIs`: `http://SEU_IP/*`

Para evitar falhas por CORS, libere no backend a origem do front (a mesma de `VITE_APP_URL`).

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
