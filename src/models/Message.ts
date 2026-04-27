export type Message = {
  id: string;
  request: string; // FK: service_request.id
  sender: string; // FK: profiles.id
  content: string;
  created_at: string;
  updated_at: string;
};
