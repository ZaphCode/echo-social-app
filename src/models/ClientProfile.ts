export type ClientProfile = {
  id: string;
  user: string; // FK: profiles.id
  phone: string;
  state: string;
  city: string;
  address: string;
  zip: string;
  updated_at: string;
  created_at: string;
};
