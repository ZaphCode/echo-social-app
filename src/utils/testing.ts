// Mock notifications

import { Notification } from "@/models/Notification";
import { User } from "@/models/User";
import { ClientResponseError, RecordFullListOptions } from "pocketbase";

export interface PBClient {
  collection: (collection: string) => {
    getFullList: <T>(options?: RecordFullListOptions) => Promise<T[]>;
  };
}

export const mockPBClient: PBClient = {
  collection: (collection: string) => ({
    getFullList: async <T>(options?: any): Promise<T[]> => {
      if (collection === "users") return mockUsers as unknown as T[];
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
    emailVisibility: true,
    role: "client",
    verified: true,
    created: "2023-02-01T00:00:00.000Z",
    updated: "2023-02-02T00:00:00.000Z",
  },
  {
    id: "user456",
    name: "María López",
    email: "a@atac.dev",
    avatar: "https://example.com/avatar2.jpg",
    emailVisibility: false,
    role: "client",
    verified: false,
    created: "2023-02-01T00:00:00.000Z",
    updated: "2023-02-02T00:00:00.000Z",
  },
];

export function logPBError(error: unknown) {
  if (error instanceof ClientResponseError) {
    console.log("PB Error message:", error.message);
    console.log("PB Error data:", error.data);
    console.log("PB Error originalError:", error.originalError);
    console.log("PB Error cause:", error.cause);
    console.log("PB Error name:", error.name);
    console.log("PB Error status:", error.status);
    console.log("PB Error response:", error.response);
  } else {
    console.log("Unknown error:", error);
  }
}
