// Mock notifications

import { Notification } from "@/models/Notification";
import { User } from "@/models/User";
import { RecordFullListOptions } from "pocketbase";

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
  },
  {
    id: "user456",
    name: "María López",
    email: "a@atac.dev",
    avatar: "https://example.com/avatar2.jpg",
    emailVisibility: false,
    role: "client",
  },
];

export const mockNotifications: Notification[] = [
  {
    id: "notif1",
    user: "user123",
    message: "Has recibido una nueva oferta en tu publicación.",
    type: "offer",
    read: false,
    created: "2025-05-18T10:30:00Z",
    updated: "2025-05-18T10:30:00Z",
    expand: {
      user: mockUsers[0],
    },
  },
  {
    id: "notif2",
    user: "user123",
    message: "Tienes un nuevo mensaje del cliente.",
    type: "message",
    read: true,
    created: "2025-05-17T15:45:00Z",
    updated: "2025-05-17T16:00:00Z",
    expand: {
      user: mockUsers[0],
    },
  },
  {
    id: "notif3",
    user: "user123",
    message: "Tu solicitud ha cambiado de estado a 'completada'.",
    type: "status",
    read: false,
    created: "2025-05-16T09:20:00Z",
    updated: "2025-05-16T09:20:00Z",
    expand: {
      user: mockUsers[0],
    },
  },
  {
    id: "notif4",
    user: "user123",
    message: "Has recibido una nueva reseña.",
    type: "review",
    read: true,
    created: "2025-05-15T08:00:00Z",
    updated: "2025-05-15T08:00:00Z",
    expand: {
      user: mockUsers[0],
    },
  },
];
