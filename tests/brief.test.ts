import { describe, expect, test } from "bun:test";
import { AtlasService } from "../src/application/atlas-service";
import { DemoRepository } from "../src/infrastructure/demo-repository";

test("research brief includes citations and coverage notes", async () => {
  const service = new AtlasService(new DemoRepository());
  const result = await service.buildResearchBrief({ question: "ما خدمات التعليم المتاحة؟", limit: 5 });

  expect(result.citations.length).toBeGreaterThan(0);
  expect(result.coverageNotes.length).toBeGreaterThan(0);
  expect(result.markdown).toContain("المصادر");
});
