# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Build & Run

### Full stack (recommended)
```bash
cp .env.example .env
docker compose up --build        # first run — ~10 min (Maven downloads inside Docker)
docker compose up                # subsequent runs (cached layers)
docker compose up --build <svc>  # rebuild one service, e.g. user-service
docker compose down -v           # stop and wipe volumes (resets DBs)
```

### Individual backend service (local dev, requires Java 21 + Maven)
Services must start in this order: `discovery-service` → `api-gateway` → others.
```bash
cd backend/<service-name>
mvn spring-boot:run
```

### Build all backend modules (skip tests)
```bash
cd backend
mvn install -DskipTests
```

### Frontend dev server (proxies to gateway at :8080)
```bash
cd frontend/ecommerce-app
npm install
npm start       # http://localhost:4200, proxy defined in proxy.conf.json
npm run build   # production build → dist/ecommerce-app/browser/
```

## Architecture

### Request flow
Every browser request goes through a single entry point:

```
Browser → API Gateway (:8080) → [lb://service-name via Eureka] → DB
```

The gateway (`backend/api-gateway/src/main/resources/application.yml`) owns all routing, CORS, and coarse-grained JWT validation. Individual services perform fine-grained authorization themselves (e.g. `@PreAuthorize("hasRole('ADMIN')")`).

### JWT across services
`common-security` is a shared Maven library (not a running service). Every backend service except `discovery-service` depends on it. The two key classes:
- `JwtUtils` — generates and validates tokens using HS256 + `JWT_SECRET`
- `JwtAuthFilter` — `OncePerRequestFilter` that populates `SecurityContextHolder` from the `Authorization: Bearer` header

The token carries `sub` (UUID user id), `email`, and `role` (`USER` or `ADMIN`). In controllers, `Authentication.getName()` returns the user UUID.

### Inter-service communication
Only `order-service` calls another service at runtime. It uses a `@LoadBalanced WebClient` resolved through Eureka:

```
order-service → WebClient("http://product-service") → Eureka → product-service
```

Configured in `backend/order-service/src/main/java/com/pfe/ecommerce/order/config/WebClientConfig.java`.

### Databases
| Service | Database | Why |
|---------|----------|-----|
| user-service | PostgreSQL `users_db` | Relational — users, addresses, roles |
| order-service | PostgreSQL `orders_db` | ACID required for order totals |
| product-service | MongoDB `products_db` | Flexible product attributes per category |

`docker/postgres/init.sql` creates both Postgres databases. `docker/mongo/init.js` seeds 15 products across 6 French categories.

Schema evolution is handled via `spring.jpa.hibernate.ddl-auto=update` (Postgres services). MongoDB is schemaless.

### Docker build context
Each service Dockerfile lives inside `backend/<service>/Dockerfile` but is built with context `./backend`. This lets each Dockerfile access both `common-security/` (which it installs first) and its own sources. The build sequence inside every Dockerfile:
```dockerfile
RUN mvn -pl common-security install -DskipTests -q
RUN mvn -pl <service-name> package -DskipTests -q
```

### Frontend patterns
- **All components are standalone** (`standalone: true`) — no NgModules.
- **State uses Angular signals**: `AuthService` exposes `isLoggedIn`, `currentUser`, `isAdmin` as computed signals. `CartService` exposes `items`, `count`, `total` as computed signals backed by `localStorage`.
- **Lazy-loaded routes** — every feature component is loaded via `loadComponent()` in `app.routes.ts`. Guards: `authGuard` (checks `isLoggedIn()`), `adminGuard` (checks `isAdmin()`).
- **HTTP calls use relative paths** (e.g. `/products`, `/orders/me`) — resolved via the dev proxy (`proxy.conf.json`) or nginx (`nginx.conf`) in production.
- **Tailwind preflight is disabled** (`corePlugins.preflight: false` in `tailwind.config.js`) to avoid conflicts with Angular Material's global reset.
- French i18n strings live in `src/assets/i18n/fr.json` via ngx-translate.

## Environment Variables
All services read `JWT_SECRET` from the environment. The default value in `.env.example` decodes to `mysupersecretkeyforphfeecommerce2024`. All five backend services must share the same value.

| Variable | Used by | Default |
|----------|---------|---------|
| `JWT_SECRET` | all backend services | base64 value in `.env.example` |
| `DB_HOST` | user-service, order-service | `localhost` |
| `DB_USER` / `DB_PASSWORD` | user-service, order-service | `postgres` |
| `MONGO_HOST` | product-service | `localhost` |
| `EUREKA_URL` | all non-discovery services | `http://localhost:8761/eureka/` |

## Default Accounts
- Admin: `admin@pfe.local` / `admin123` (seeded on `user-service` startup by `DataInitializer`)
- Regular users: created via `/auth/register`
