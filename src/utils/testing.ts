// Mock notifications

import { Notification } from "@/models/Notification";
import { User } from "@/models/User";

const mockUser: User = {
  id: "user123",
  name: "Juan Pérez",
  email: "test@gmail.com",
  avatar: "https://example.com/avatar.jpg",
  emailVisibility: true,
  role: "client",
};

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
      user: mockUser,
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
      user: mockUser,
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
      user: mockUser,
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
      user: mockUser,
    },
  },
];
