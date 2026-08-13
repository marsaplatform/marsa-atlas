import type { AtlasRepository } from "../domain/repository";
import { DemoRepository } from "./demo-repository";
import { WordPressRepository } from "./wordpress-repository";

export const createRepository = (env: Record<string, string | undefined> = process.env): AtlasRepository => {
  const mode = env.ATLAS_DATA_MODE ?? "demo";
  if (mode === "demo") return new DemoRepository();
  if (mode === "wordpress") {
    const url = env.ATLAS_WORDPRESS_URL;
    if (!url) throw new Error("ATLAS_WORDPRESS_URL is required when ATLAS_DATA_MODE=wordpress");
    return new WordPressRepository(url);
  }
  throw new Error(`Unsupported ATLAS_DATA_MODE: ${mode}`);
};
