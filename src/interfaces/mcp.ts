import { McpServer, ResourceTemplate } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";
import type { AtlasService } from "../application/atlas-service";
import { recordTypes } from "../domain/models";

const readOnly = { readOnlyHint: true, destructiveHint: false, idempotentHint: true, openWorldHint: false };
const toolResult = (value: Record<string, unknown>) => ({ content: [{ type: "text" as const, text: JSON.stringify(value, null, 2) }], structuredContent: value });

export function createMcpServer(service: AtlasService): McpServer {
  const server = new McpServer({ name: "marsa-atlas", version: "0.1.0" });

  server.registerTool("search_atlas", {
    title: "Search Marsa Atlas",
    description: "بحث عربي موحد وموثق في الخدمات والجهات والقانون والبيانات المرتبطة بالهجرة واللجوء في مصر.",
    inputSchema: { query: z.string().min(2).max(500), types: z.array(z.enum(recordTypes)).default([]), limit: z.number().int().min(1).max(50).default(10) },
    outputSchema: { query: z.string(), count: z.number(), items: z.array(z.unknown()) },
    annotations: readOnly,
  }, async (input) => toolResult(await service.search(input)));

  server.registerTool("find_services", {
    title: "Find migration services in Egypt",
    description: "اكتشاف خدمات حسب الاحتياج والمحافظة والأهلية مع المصدر وتاريخ آخر تحقق.",
    inputSchema: { need: z.string().min(2).max(300), governorate: z.string().min(2).optional(), eligibility: z.string().min(2).optional(), limit: z.number().int().min(1).max(50).default(10) },
    outputSchema: { query: z.string(), count: z.number(), items: z.array(z.unknown()), disclaimer: z.string() },
    annotations: readOnly,
  }, async (input) => toolResult(await service.findServices(input)));

  server.registerTool("check_eligibility", {
    title: "Check indicative eligibility",
    description: "فحص إرشادي غير ملزم لأهلية خدمة. لا يمثل قرارًا نهائيًا من الجهة.",
    inputSchema: { serviceId: z.string().min(2), profile: z.object({ nationality: z.string().optional(), governorate: z.string().optional() }) },
    outputSchema: { found: z.boolean(), decision: z.enum(["unknown", "needs_confirmation"]), reasons: z.array(z.string()), service: z.unknown().optional(), disclaimer: z.string() },
    annotations: readOnly,
  }, async (input) => toolResult(await service.checkEligibility(input)));

  server.registerTool("build_research_brief", {
    title: "Build a source-grounded research brief",
    description: "بناء موجز بحثي عربي يحافظ على المصادر وتواريخ التحقق وحدود التغطية.",
    inputSchema: { question: z.string().min(5).max(1000), limit: z.number().int().min(1).max(20).default(8) },
    outputSchema: { question: z.string(), records: z.array(z.unknown()), citations: z.array(z.unknown()), coverageNotes: z.array(z.string()), markdown: z.string() },
    annotations: readOnly,
  }, async (input) => toolResult(await service.buildResearchBrief(input)));

  server.registerTool("get_coverage", {
    title: "Get Atlas coverage",
    description: "عرض حجم وتوزيع وتاريخ تغطية بيانات Marsa Atlas.",
    inputSchema: {},
    outputSchema: { records: z.number(), byType: z.record(z.string(), z.number()), lastUpdated: z.string() },
    annotations: readOnly,
  }, async () => toolResult(await service.coverage()));

  server.registerResource("coverage", "marsa://coverage", { title: "Marsa Atlas Coverage", mimeType: "application/json" }, async (uri) => ({ contents: [{ uri: uri.href, mimeType: "application/json", text: JSON.stringify(await service.coverage()) }] }));
  server.registerResource("record", new ResourceTemplate("marsa://records/{id}", { list: undefined }), { title: "Marsa Atlas Record", mimeType: "application/json" }, async (uri, { id }) => ({ contents: [{ uri: uri.href, mimeType: "application/json", text: JSON.stringify({ id, note: "Record resources will use the shared repository in the next milestone." }) }] }));

  return server;
}
