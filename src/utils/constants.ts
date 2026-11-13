import { Platform } from "react-native";

export const NOTIFICATIONS_KEY = "notificationsEnabled";
export const SQL_VIEWER_ENABLED_KEY = "echo.sqlViewer.enabled";

/**
 * Dev-only sign-in prefill, read from .env (EXPO_PUBLIC_DEV_*). Android can
 * use a different account (EXPO_PUBLIC_DEV_ANDROID_*) so two simulators can
 * chat with each other. Empty when the variables are missing.
 */
export function getDevEmail(): string {
  const android = process.env.EXPO_PUBLIC_DEV_ANDROID_EMAIL;
  if (Platform.OS === "android" && android) return android;
  return process.env.EXPO_PUBLIC_DEV_EMAIL ?? "";
}

export function getDevPassword(): string {
  const android = process.env.EXPO_PUBLIC_DEV_ANDROID_PASSWORD;
  if (Platform.OS === "android" && android) return android;
  return process.env.EXPO_PUBLIC_DEV_PASSWORD ?? "";
}

export const ECHO_VERSION = process.env.EXPO_PUBLIC_APP_VERSION ?? "2.0";
