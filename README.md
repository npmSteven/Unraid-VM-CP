# Unraid VM CP

> **Alpha** — A delegated VM control panel for Unraid. Give users access to specific VMs without sharing your Unraid root credentials.

Unraid VM CP is a web application that sits between your Unraid server and your users. The admin (you) logs in with Unraid credentials, creates local user accounts, links specific VMs to those users, and sets granular permissions for what they can do. Local users log in with their own username/password and see only the VMs you've assigned them.

---

## Features

- **Delegated access** — let friends, family, or colleagues control VMs without giving them your Unraid root password
- **Granular permissions** — per-VM, per-action control: Start, Stop, Restart, Force Stop, Pause, Resume, Hibernate, Remove VM, Remove VM and Disks
- **Multi-user** — create as many local accounts as you need, each with different VM assignments
- **Web UI** — clean SolidJS frontend with VM status indicators, dropdown actions, and user management
- **Reverse proxy ready** — CORS and proxy trust headers supported for nginx, Traefik, Caddy, etc.
- **Docker-first** — single lightweight container (Bun + Alpine), pre-built images on GHCR

---

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Runtime | [Bun](https://bun.sh/) |
| Backend | [Elysia](https://elysiajs.com/) |
| Database | SQLite (Bun native) |
| ORM | [Drizzle ORM](https://orm.drizzle.team/) |
| Frontend | [SolidJS](https://www.solidjs.com/) + [Vite](https://vitejs.dev/) |
| Auth | JWT + bcrypt |
| Container | Docker (Alpine-based) |

---

## Quick Start

```bash
docker run -d \
  --name unraid-vm-cp \
  -p 8787:8787 \
  -e UNRAID_IP=192.168.1.100 \
  -e UNRAID_IS_HTTPS=false \
  -e UNRAID_USERNAME=root \
  -e UNRAID_PASSWORD='your-password' \
  -e JWT_SECRET='a-random-string-at-least-16-chars' \
  ghcr.io/npmsteven/unraid-vm-cp:latest
```

Then open `http://localhost:8787` and log in with your Unraid credentials.

---

## Installation

### Docker Run

```bash
docker run -d \
  --name unraid-vm-cp \
  -p 8787:8787 \
  --env-file .env \
  -v unraid-vm-cp-data:/app/backend \
  ghcr.io/npmsteven/unraid-vm-cp:latest
```

The volume `-v unraid-vm-cp-data:/app/backend` persists the SQLite database so you retain users and VM links across container updates.

### Docker Compose

See [`examples/docker-compose.yml`](examples/docker-compose.yml) for a production-ready compose file with healthchecks, persistent storage, and environment configuration.

### Unraid Docker Template

Place [`unraid-vm-cp.xml`](unraid-vm-cp.xml) in your Unraid flash drive's `/boot/config/plugins/dockerMan/templates-user/` directory, then install it from the Unraid Docker UI. The template prompts for all required environment variables.

---

## Environment Variables

| Variable | Required | Default | Description |
|----------|----------|---------|-------------|
| `UNRAID_IP` | Yes | — | IP address of your Unraid server |
| `UNRAID_IS_HTTPS` | Yes | — | `true` if Unraid uses HTTPS, `false` otherwise |
| `UNRAID_USERNAME` | Yes | — | Unraid root username |
| `UNRAID_PASSWORD` | Yes | — | Unraid root password (stored in plaintext — keep your flash drive secure) |
| `JWT_SECRET` | Yes | — | Random string (min 16 characters) for signing tokens |
| `UNRAID_PORT` | No | — | Custom port if Unraid runs on a non-standard port (e.g. `443`, `8443`) |
| `SERVER_PORT` | No | `8787` | Port the backend listens on |
| `SERVE_FRONTEND` | No | `true` | Set to `false` to serve frontend separately (legacy dual-port mode) |
| `FRONTEND_DIST_PATH` | No | `../frontend/dist` | Path to the frontend build output |
| `CORS_ORIGIN` | No | `*` | CORS allowed origin. Set to your domain behind a reverse proxy |
| `TRUST_PROXY` | No | — | Proxy trust setting: `true`, number of hops, or CIDR string |

---

## Usage

### Admin Workflow

1. **Log in** with your Unraid username and password
2. Go to **Users** → **Create User** to add a local account
3. Click the user's dropdown → **VMs** to see their linked VMs
4. Click **Link a VM** to select an Unraid VM and assign default permissions (Start, Stop, Restart)
5. On the VM card dropdown, click **Permissions** to customize the 9 granular actions
6. The local user can now log in with their own credentials and only see/control their assigned VMs

### Local User Workflow

1. **Log in** with the username/password the admin gave you
2. Your **VMs** page shows only the VMs assigned to you, with status indicators
3. Use the **dropdown** on each VM card to start, stop, restart, etc. (only actions the admin permitted)

---

## Examples

Common setup patterns and usage scenarios. All files in [`examples/`](examples/).

### Deployment

| File | Description |
|------|-------------|
| [`docker-compose.yml`](examples/docker-compose.yml) | Production compose with volumes, healthcheck, env_file |

### Reverse Proxy

| File | Description |
|------|-------------|
| [`nginx-reverse-proxy.conf`](examples/nginx-reverse-proxy.conf) | Nginx config with SSL termination, WebSocket support |
| [`traefik-reverse-proxy.yml`](examples/traefik-reverse-proxy.yml) | Traefik labels for docker-compose |
| [`Caddyfile`](examples/Caddyfile) | Caddy reverse proxy (one-liner) |

### Usage Scenarios

| File | Description |
|------|-------------|
| [`scenario-readonly-access.md`](examples/scenario-readonly-access.md) | Let a friend view VM status but not change anything |
| [`scenario-power-user.md`](examples/scenario-power-user.md) | Give a trusted user full control over specific VMs |
| [`scenario-multi-user-family.md`](examples/scenario-multi-user-family.md) | Family server — different VMs for different household members |

---

## Development

```bash
# Install dependencies
pnpm install
cd backend && bun install
cd ../frontend && bun install

# Run in development (backend on 8787, frontend dev server on 3000 with API proxy)
pnpm run start:all

# Run tests
cd backend && bun test
cd frontend && bun run test
```

### Commands

| Command | Description |
|---------|-------------|
| `pnpm run dev:backend` | Backend with hot reload (`bun --watch`) |
| `pnpm run dev:frontend` | Vite dev server with API proxy |
| `pnpm run start:all` | Both concurrently (dev mode) |
| `pnpm run build:frontend` | Production frontend build |
| `pnpm run start:prod` | Production backend (serves frontend statically) |

---

## Caveats & Limitations

- **Undocumented APIs** — This project uses Unraid's internal, undocumented HTML pages and GraphQL/AJAX endpoints. These may break after Unraid updates. Exercise caution after upgrading Unraid.
- **Plaintext password** — Your Unraid root password is stored as an environment variable in plaintext. Ensure your Docker environment and Unraid flash drive are secure.
- **Alpha software** — This project is in active development. Expect changes, and please report issues.
- **Single Unraid target** — The backend connects to one Unraid server at a time. Multi-server setups would require multiple container instances.
- **Unraid 7.2+ hint** — Unraid OS 7.2 introduced an official GraphQL API. Once stable, this project may transition to using it instead of scraping HTML.

---

## License

GNU AGPL 3.0 — see [LICENSE](LICENSE).

## Author

**Steven Rafferty** — [@npmSteven](https://github.com/npmSteven)

---

*If this project has been helpful, consider [sponsoring](https://www.buymeacoffee.com/npmSteven) so I can keep working on it.*
