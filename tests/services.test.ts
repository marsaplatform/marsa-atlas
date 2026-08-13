import { describe, expect, test } from "bun:test";
import { AtlasService } from "../src/application/atlas-service";
import { DemoRepository } from "../src/infrastructure/demo-repository";

describe("service discovery", () => {
  test("filters by need and governorate", async () => {
    const service = new AtlasService(new DemoRepository());
    const result = await service.findServices({ need: "تعليم", governorate: "القاهرة", limit: 10 });

    expect(result.items.length).toBe(1);
    expect(result.items[0]?.governorates).toContain("القاهرة");
  });

  test("never claims final eligibility", async () => {
    const service = new AtlasService(new DemoRepository());
    const result = await service.checkEligibility({ serviceId: "service-education-1", profile: { nationality: "سوداني" } });

    expect(result.decision).toBe("needs_confirmation");
    expect(result.disclaimer).toContain("لا يمثل قرارًا نهائيًا");
  });
});
