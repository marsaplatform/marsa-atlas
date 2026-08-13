import type { AnyAtlasRecord, SearchInput, ServiceRecord, ServiceSearchInput } from "./models";

export interface AtlasRepository {
  search(input: SearchInput): Promise<AnyAtlasRecord[]>;
  findServices(input: ServiceSearchInput): Promise<ServiceRecord[]>;
  getById(id: string): Promise<AnyAtlasRecord | undefined>;
  coverage(): Promise<{ records: number; byType: Record<string, number>; lastUpdated: string }>;
}
