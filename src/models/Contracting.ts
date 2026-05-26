export type Contracting = {
  id: string;
  owner: string; // FK: profiles.id
  category: string; // FK: service_category.id
  name: string;
  description: string;
  base_price: number;
  photos: string[];
  is_closed: boolean;
  closed_at?: string | null;
  closed_request?: string | null;
  created_at: string;
  updated_at: string;
};
