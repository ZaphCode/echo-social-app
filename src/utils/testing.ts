// Mock notifications

import { Notification } from "@/models/Notification";
import { User } from "@/models/User";

export interface DBClient {
  collection: (collection: string) => {
    getFullList: <T>(options?: Record<string, unknown>) => Promise<T[]>;
  };
}

export const mockDBClient: DBClient = {
  collection: (collection: string) => ({
    getFullList: async <T>(options?: Record<string, unknown>): Promise<T[]> => {
      if (collection === "profiles") return mockUsers as unknown as T[];
      else throw new Error("Invalid collection");
    },
  }),
};

const mockUsers: User[] = [
  {
    id: "user123",
    name: "Juan Pérez",
    email: "test@gmail.com",
    avatar: "https://example.com/avatar.jpg",
    email_visibility: true,
    role: "client",
    verified: true,
    created_at: "2023-02-01T00:00:00.000Z",
    updated_at: "2023-02-02T00:00:00.000Z",
  },
  {
    id: "user456",
    name: "María López",
    email: "a@atac.dev",
    avatar: "https://example.com/avatar2.jpg",
    email_visibility: false,
    role: "client",
    verified: false,
    created_at: "2023-02-01T00:00:00.000Z",
    updated_at: "2023-02-02T00:00:00.000Z",
  },
];

export function logError(error: unknown) {
  if (error instanceof Error) {
    console.log("Error message:", error.message);
    console.log("Error name:", error.name);
    console.log("Error cause:", error.cause);
  } else {
    console.log("Unknown error:", error);
  }
}

// Keep backward compat alias
export const logPBError = logError;
