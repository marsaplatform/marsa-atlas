import { describe, expect, test } from "bun:test";
import { WordPressRepository } from "../src/infrastructure/wordpress-repository";

const payload = {
  items: [{
    id: 57, type: "marsa_service", title: "دعم نفسي", excerpt: "خدمة موثقة",
    url: "https://marsaplatform.com/services/57", source_url: "https://example.org/source.pdf",
    last_verified: "2026-08-14", meta: { source_name: "دليل الخدمات", record_status: "source_backed", phone: "17365", documents: "اتصل أولًا" },
    terms: {
      marsa_governorate: [{ name: "القاهرة", slug: "cairo" }],
      marsa_service_type: [{ name: "دعم نفسي", slug: "mental-health" }],
      marsa_eligibility: [{ name: "جميع الجنسيات", slug: "all" }],
      marsa_organization: [{ name: "مرسال", slug: "mersal" }],
    },
  }],
  total: 1, pages: 1,
};

describe("WordPressRepository", () => {
  test("maps the Marsa Core REST contract to an Atlas service", async () => {
    const fetcher = async () => new Response(JSON.stringify(payload));
    const repository = new WordPressRepository("https://marsaplatform.com/", fetcher);
    const results = await repository.findServices({ need: "دعم", governorate: "القاهرة", limit: 5 });
    expect(results[0]?.id).toBe("wp:marsa_service:57");
    expect(results[0]?.source.url).toBe("https://example.org/source.pdf");
    expect(results[0]?.governorates).toEqual(["القاهرة"]);
    expect(results[0]?.recordStatus).toBe("source_backed");
  });

  test("rejects malformed upstream data", async () => {
    const fetcher = async () => new Response(JSON.stringify({ items: [{}], total: 1, pages: 1 }));
    const repository = new WordPressRepository("https://marsaplatform.com", fetcher);
    expect(repository.coverage()).rejects.toThrow();
  });
});
