# Marsa Atlas — أطلس مرسى

Source-grounded migration services, evidence, and referral infrastructure for Egypt.

أطلس مرسى هو منتج مستقل جديد داخل مؤسسة مرسى. يربط الخدمات والجهات والقانون والبيانات بمصادرها وتاريخ التحقق، ويقدمها عبر MCP وREST من نفس طبقة التطبيق.

## Product principles

- Source and `lastVerified` travel with every record.
- Egypt-first and Arabic-first.
- No personal case data.
- Eligibility checks are indicative, never final decisions.
- Public reads; reviewed update suggestions only.
- WordPress remains the editorial system of record.

## Quick start

```bash
bun install
bun test
bun run dev:http
```

Open `http://localhost:3000` or connect an MCP client to `http://localhost:3000/mcp`.

Local stdio:

```bash
bun run dev
```

Production data from Marsa WordPress:

```bash
ATLAS_DATA_MODE=wordpress ATLAS_WORDPRESS_URL=https://marsaplatform.com bun run dev:http
```

## Initial tools

| Tool | Purpose |
|---|---|
| `search_atlas` | Unified source-grounded search |
| `find_services` | Service discovery by need, location and eligibility |
| `check_eligibility` | Indicative eligibility with mandatory disclaimer |
| `build_research_brief` | Research brief with citations and coverage notes |
| `get_coverage` | Dataset coverage and freshness |

## REST

- `GET /health`, `GET /healthz`, `GET /readyz`
- `GET /api/v1/coverage`
- `GET /api/v1/search?q=تعليم`
- `GET /api/v1/services?need=تعليم&governorate=القاهرة`
- `POST /mcp`

## Architecture

```text
Marsa WordPress / demo fixtures
            ↓
       AtlasRepository
            ↓
        AtlasService
         ↙       ↘
       MCP       REST/Web
```

The demo repository makes the project runnable and testable without production access. The read-only WordPress connector consumes the public `marsa/v1` API and validates every upstream response before mapping it into the Atlas domain.

## Docker / Coolify

Deploy the repository with its `Dockerfile`, expose port `3000`, and set:

- `ATLAS_DATA_MODE=wordpress`
- `ATLAS_WORDPRESS_URL=https://marsaplatform.com`
- `ATLAS_PORT=3000`

Health probes are available at `GET /health`, `GET /healthz`, and `GET /readyz`. No WordPress credentials are required for public reads.

## Status

`0.1.0` foundation release. Demo data is explicitly marked and must not be represented as current operational guidance.
