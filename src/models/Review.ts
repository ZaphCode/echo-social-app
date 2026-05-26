export type Review = {
  id: string;
  service?: string | null; // FK: service.id
  contracting?: string | null; // FK: contracting.id
  request?: string | null; // FK: service_request.id
  reviewer: string; // FK: profiles.id
  reviewed: string; // FK: profiles.id
  comment: string;
  rating: number; // 1-5
  type: "AS_CLIENT" | "AS_PROVIDER";
  created_at: string;
  updated_at: string;
};
