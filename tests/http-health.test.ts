import { afterAll, beforeAll, describe, expect, test } from "bun:test";
import { AtlasService } from "../src/application/atlas-service";
import { DemoRepository } from "../src/infrastructure/demo-repository";
import { startHttpServer } from "../src/interfaces/http";

describe("health probes", () => {
  let server: ReturnType<typeof Bun.serve>;
  let baseUrl = "";

  beforeAll(() => {
    server = startHttpServer(new AtlasService(new DemoRepository()), 0);
    baseUrl = `http://127.0.0.1:${server.port}`;
  });

  afterAll(() => server.stop(true));

  for (const path of ["/health", "/healthz", "/readyz"]) {
    test(`${path} reports service readiness`, async () => {
      const response = await fetch(`${baseUrl}${path}`);
      const body = await response.json();

      expect(response.status).toBe(200);
      expect(body).toEqual({ ok: true, service: "marsa-atlas", version: "0.1.0" });
      expect(response.headers.get("cache-control")).toBe("no-store");
    });
  }
});
