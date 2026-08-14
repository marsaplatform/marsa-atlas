import { WebStandardStreamableHTTPServerTransport } from "@modelcontextprotocol/sdk/server/webStandardStreamableHttp.js";
import type { AtlasService } from "../application/atlas-service";
import { createMcpServer } from "./mcp";

const json = (value: unknown, status = 200): Response => Response.json(value, { status, headers: { "access-control-allow-origin": "*", "cache-control": "no-store" } });

export function startHttpServer(service: AtlasService, port: number): ReturnType<typeof Bun.serve> {
  return Bun.serve({
    port,
    async fetch(request) {
      const url = new URL(request.url);
      if (request.method === "OPTIONS") return new Response(null, { status: 204, headers: { "access-control-allow-origin": "*", "access-control-allow-methods": "GET,POST,OPTIONS", "access-control-allow-headers": "content-type,mcp-protocol-version" } });
      if (["/health", "/healthz", "/readyz"].includes(url.pathname)) {
        return json({ ok: true, service: "marsa-atlas", version: "0.1.0" });
      }
      if (url.pathname === "/api/v1/coverage" && request.method === "GET") return json(await service.coverage());
      if (url.pathname === "/api/v1/search" && request.method === "GET") {
        const query = url.searchParams.get("q")?.trim() ?? "";
        if (query.length < 2) return json({ error: "q must contain at least 2 characters" }, 400);
        return json(await service.search({ query, types: [], limit: Math.min(Number(url.searchParams.get("limit") ?? 10), 50) }));
      }
      if (url.pathname === "/api/v1/services" && request.method === "GET") {
        const need = url.searchParams.get("need")?.trim() ?? "";
        if (need.length < 2) return json({ error: "need must contain at least 2 characters" }, 400);
        return json(await service.findServices({ need, governorate: url.searchParams.get("governorate") ?? undefined, eligibility: url.searchParams.get("eligibility") ?? undefined, limit: 20 }));
      }
      if (url.pathname === "/mcp") {
        const server = createMcpServer(service);
        const transport = new WebStandardStreamableHTTPServerTransport({ enableJsonResponse: true });
        await server.connect(transport);
        return transport.handleRequest(request);
      }
      if (url.pathname === "/") return new Response(landing(), { headers: { "content-type": "text/html; charset=utf-8" } });
      return json({ error: "not_found" }, 404);
    },
  });
}

function landing(): string {
  return `<!doctype html><html lang="ar" dir="rtl"><meta charset="utf-8"><meta name="viewport" content="width=device-width"><title>أطلس مرسى — Marsa Atlas</title><style>body{margin:0;background:#f7f5ef;color:#102e3a;font-family:system-ui;line-height:1.8}main{max-width:960px;margin:auto;padding:8vw 24px}p:first-child{font-family:monospace;color:#176071}h1{font-size:clamp(42px,8vw,92px);line-height:1.1;margin:.2em 0}section{border-top:1px solid #102e3a;margin-top:56px;padding-top:24px}code{direction:ltr;display:inline-block;background:#102e3a;color:white;padding:4px 8px}a{color:#176071}</style><main><p>MARSA / ATLAS / EGYPT</p><h1>اسأل. افحص المصدر. ابنِ الإحالة.</h1><p>بنية معلومات موثقة للخدمات والأدلة المتعلقة بالهجرة واللجوء في مصر.</p><section><h2>واجهات المنتج</h2><p><code>POST /mcp</code> Streamable HTTP</p><p><code>GET /api/v1/search?q=تعليم</code></p><p><code>GET /api/v1/services?need=تعليم</code></p><p><code>GET /api/v1/coverage</code></p></section></main></html>`;
}
