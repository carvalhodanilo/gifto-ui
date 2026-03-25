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

O `keycloak-js` usa `checkLoginIframe` conforme **`VITE_CHECK_LOGIN_IFRAME`** no build (`true` só com HTTPS — ver abaixo). Por omissão (ou variável ausente) fica `false`, necessário em **HTTP** para evitar o passo *third-party cookies* (`3p-cookies/step1.html`), que usa a Storage Access API e **falha em contexto não seguro** (ecrã infinito em “Autenticando…”).

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

Use o template em [`deploy/nginx/sales-app-spa.conf`](deploy/nginx/sales-app-spa.conf) e adapte apenas o path onde o build será colocado (ex.: `/var/www/sales-app/dist`). O mesmo ficheiro inclui comentários para evoluir para **443/TLS**.

### HTTPS e domínio (checklist para migração)

Objetivo: passar de `http://IP` para `https://teu-dominio.tld` com certificado válido (ex. Let’s Encrypt via Certbot) no **Nginx do Docker** (`reverse-proxy` no repositório do backend).

**1. Front (`core-ui`, este repo)**

| Passo | Ação |
|--------|------|
| `.env.production` | Trocar **todas** as URLs de `http://` para `https://` e usar o **mesmo host** que o browser vai usar (sem porta se for 443). Ex.: `VITE_APP_URL=https://app.exemplo.com`, `VITE_API_BASE_URL=https://app.exemplo.com/api`, `VITE_KEYCLOAK_URL=https://app.exemplo.com/auth`. |
| `VITE_CHECK_LOGIN_IFRAME` | Definir `VITE_CHECK_LOGIN_IFRAME=true` no `.env.production` **após** TLS estar a funcionar (iframe de sessão / deteção de logout noutro separador). Sem HTTPS, não ativar. |
| Build + deploy | `npm run build:sales` e voltar a publicar o `dist` (ex. `rsync` para o volume do Nginx). |

**2. Keycloak Admin (client `voucher-platform-sales-web`)**

Atualizar para a **nova origem HTTPS** (e pode manter temporariamente as entradas HTTP para transição, se quiseres):

- `Valid Redirect URIs`: `https://teu-dominio.tld/*`
- `Web origins`: `https://teu-dominio.tld`
- `Valid Post Logout Redirect URIs`: `https://teu-dominio.tld/*`

**3. Backend (CORS)**

Garantir que a API aceita a origem `https://teu-dominio.tld` (mesma regra que hoje para o IP HTTP).

**4. Stack Docker / Keycloak (repositório do backend, ex. `deploy/lightsail`)**

Rever variáveis de ambiente do Keycloak e do proxy conforme a documentação do Keycloak 26 para **hostname e proxy atrás de TLS** (ex. `KC_HOSTNAME`, `KC_PROXY_HEADERS`, URLs públicas em `https`). O issuer OIDC (`/.well-known/openid-configuration`) tem de refletir **https** e o host certo, senão o browser e o `keycloak-js` desalinhavam.

**5. Nginx**

- `listen 443 ssl http2;` + `ssl_certificate` / `ssl_certificate_key` (Certbot costuma gerir includes).
- Redirecionar `http://` → `https://` (porta 80 só redirect).
- Manter `location /api/` e `/auth/` como hoje; o `root` do SPA igual.

**6. DNS**

`A` ou `AAAA` do domínio para o IP público da Lightsail **antes** do Certbot (ou validação DNS).

---

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
