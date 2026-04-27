export type Service = {
  id: string;
  provider: string; // FK: profiles.id
  category: string; // FK: service_category.id
  name: string;
  description: string;
  base_price: number;
  photos: string[];
  created_at: string;
  updated_at: string;
};
