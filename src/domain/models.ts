export const recordTypes = ["service", "organization", "legal", "dataset", "indicator", "source"] as const;
export type RecordType = (typeof recordTypes)[number];

export interface SourceRef {
  name: string;
  url: string;
  publisher: string;
  publishedAt?: string;
  retrievedAt: string;
}

export interface AtlasRecord {
  id: string;
  type: RecordType;
  title: string;
  summary: string;
  countryCode: "EG";
  language: "ar" | "en";
  source: SourceRef;
  lastVerified: string;
  recordStatus: "source_backed" | "community_submitted" | "demo";
  coverageNotes: string[];
  tags: string[];
}

export interface ServiceRecord extends AtlasRecord {
  type: "service";
  organizationId: string;
  serviceTypes: string[];
  governorates: string[];
  eligibility: string[];
  requirements: string[];
  contact?: { phone?: string; url?: string };
}

export interface LegalRecord extends AtlasRecord {
  type: "legal";
  legalTopics: string[];
  instrument: string;
  articleNumber?: string;
  effectiveDate?: string;
}

export interface GenericAtlasRecord extends AtlasRecord {
  type: Exclude<RecordType, "service" | "legal">;
}

export type AnyAtlasRecord = GenericAtlasRecord | ServiceRecord | LegalRecord;

export interface SearchInput {
  query: string;
  types: RecordType[];
  limit: number;
}

export interface ServiceSearchInput {
  need: string;
  governorate?: string | undefined;
  eligibility?: string | undefined;
  limit: number;
}
