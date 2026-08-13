import type { AtlasRepository } from "../domain/repository";
import type { SearchInput, ServiceSearchInput } from "../domain/models";

export class AtlasService {
  constructor(private readonly repository: AtlasRepository) {}

  async search(input: SearchInput) {
    const items = await this.repository.search(input);
    return { query: input.query, count: items.length, items };
  }

  async findServices(input: ServiceSearchInput) {
    const items = await this.repository.findServices(input);
    return { query: input.need, count: items.length, items, disclaimer: "الخدمات وشروطها قد تتغير؛ تحقق من المصدر وتاريخ المراجعة قبل الإحالة." };
  }

  async checkEligibility(input: { serviceId: string; profile: { nationality?: string | undefined; governorate?: string | undefined } }) {
    const record = await this.repository.getById(input.serviceId);
    if (!record || record.type !== "service") return { found: false, decision: "unknown" as const, reasons: ["الخدمة غير موجودة."] , disclaimer: "هذا الفحص لا يمثل قرارًا نهائيًا بالأهلية." };
    const reasons = ["السجل يوضح شروطًا عامة فقط."];
    if (input.profile.nationality && record.eligibility.includes(input.profile.nationality)) reasons.push("الجنسية مذكورة ضمن الفئات العامة في السجل.");
    return { found: true, decision: "needs_confirmation" as const, reasons, service: record, disclaimer: "هذا الفحص لا يمثل قرارًا نهائيًا بالأهلية؛ الجهة المقدمة للخدمة هي صاحبة القرار." };
  }

  async buildResearchBrief(input: { question: string; limit: number }) {
    const result = await this.search({ query: input.question.replace(/[؟?]/g, ""), types: [], limit: input.limit });
    const citations = result.items.map((item, index) => ({ index: index + 1, title: item.title, url: item.source.url, publisher: item.source.publisher, lastVerified: item.lastVerified }));
    const coverageNotes = [...new Set(result.items.flatMap((item) => item.coverageNotes))];
    const markdown = [`# ${input.question}`, "", ...result.items.map((item, index) => `## ${item.title}\n${item.summary}\n\n[${index + 1}] ${item.source.url}`), "", "## المصادر", ...citations.map((citation) => `${citation.index}. ${citation.title} — ${citation.url}`)].join("\n");
    return { question: input.question, records: result.items, citations, coverageNotes, markdown };
  }

  coverage() { return this.repository.coverage(); }
}
