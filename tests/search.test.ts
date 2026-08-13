import { describe, expect, test } from "bun:test";
import { AtlasService } from "../src/application/atlas-service";
import { DemoRepository } from "../src/infrastructure/demo-repository";

describe("AtlasService search", () => {
  test("returns Arabic source-grounded records", async () => {
    const service = new AtlasService(new DemoRepository());
    const result = await service.search({ query: "تعليم", types: [], limit: 10 });

    expect(result.items.length).toBeGreaterThan(0);
    expect(result.items[0]?.source.url).toStartWith("https://");
    expect(result.items[0]?.lastVerified).toMatch(/^\d{4}-\d{2}-\d{2}$/);
  });

  test("filters by record type", async () => {
    const service = new AtlasService(new DemoRepository());
    const result = await service.search({ query: "مصر", types: ["legal"], limit: 10 });

    expect(result.items.every((item) => item.type === "legal")).toBe(true);
  });
});
