export type User = {
  id: string;
  email: string;
  avatar: string;
  name: string;
  role: "client" | "provider";
  emailVisibility: boolean;
};
