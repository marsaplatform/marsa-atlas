# ADR 0002: Runtime and transports

## Status

Accepted — 2026-08-14

## Decision

- TypeScript على Bun.
- MCP SDK `1.29.0` مثبت الإصدار.
- stdio للتشغيل المحلي.
- Streamable HTTP stateless على `/mcp` للتشغيل البعيد.
- REST v1 على `/api/v1` من نفس services.
- لا framework ويب إضافي في الإصدار الأول؛ نستخدم `Bun.serve`.
