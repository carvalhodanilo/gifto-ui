# Core UI - Monorepo

Monorepo com React 18, Vite, Tailwind CSS e shadcn/ui.

## Estrutura

- **apps/admin-app** – Aplicação administrativa
- **apps/sales-app** – Aplicação kiosk (vendas)
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
# Admin (porta 5173)
npm run dev:admin

# Kiosk / Sales (porta 5174)
npm run dev:sales
```

## Build

```bash
# Todas as apps
npm run build

# Por app
npm run build:admin
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
