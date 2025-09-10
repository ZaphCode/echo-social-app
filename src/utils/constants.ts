import { Platform } from "react-native";

export const DEV_CLIENT_EMAIL = "zaph@fapi.com";
export const DEV_CLIENT_PASSWORD = "menosfapi33";

export const DEV_PROVIDER_EMAIL = "facu@gmail.com";
export const DEV_PROVIDER_PASSWORD = "password";

export const NOTIFICATIONS_KEY = "notificationsEnabled";

export function getDevEmail(): string {
  return Platform.OS === "android" ? DEV_CLIENT_EMAIL : DEV_PROVIDER_EMAIL;
}

export function getDevPassword(): string {
  return Platform.OS === "android"
    ? DEV_CLIENT_PASSWORD
    : DEV_PROVIDER_PASSWORD;
}
