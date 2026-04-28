import { Platform } from "react-native";

export const DEV_CLIENT_EMAIL = "cliente@test.com";
export const DEV_CLIENT_PASSWORD = "echo_de_one_123";

export const DEV_PROVIDER_EMAIL = "proveedor@test.com";
export const DEV_PROVIDER_PASSWORD = "echo_de_one_123";

export const NOTIFICATIONS_KEY = "notificationsEnabled";

export function getDevEmail(): string {
  return Platform.OS === "android" ? DEV_CLIENT_EMAIL : DEV_PROVIDER_EMAIL;
}

export function getDevPassword(): string {
  return Platform.OS === "android"
    ? DEV_CLIENT_PASSWORD
    : DEV_PROVIDER_PASSWORD;
}
