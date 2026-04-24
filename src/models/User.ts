export type User = {
  id: string;
  email: string;
  avatar: string;
  name: string;
  role: "client" | "provider";
  email_visibility: boolean;
  verified: boolean;
  created_at: string;
  updated_at: string;
  location?: {
    lat: number;
    lon: number;
  };
};
