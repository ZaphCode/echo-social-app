export type Contracting = {
  id: string;
  owner: string; // FK: profiles.id
  category: string; // FK: service_category.id
  name: string;
  description: string;
  base_price: number;
  photos: string[];
  /** Approximate (snapped to ~500 m) public location; null when unknown. */
  lat?: number | null;
  lon?: number | null;
  is_closed: boolean;
  closed_at?: string | null;
  closed_request?: string | null;
  created_at: string;
  updated_at: string;
};
