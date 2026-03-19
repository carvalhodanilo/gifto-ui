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
