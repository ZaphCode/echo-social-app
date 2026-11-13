import { beforeEach, describe, expect, test } from "bun:test";

import {
  getOfflineNetworkState,
  isLikelyNetworkError,
  setOfflineNetworkState,
} from "../src/offline/network";
import { isAuthError } from "../src/api/common";

describe("estado de red y errores comunes", () => {
  beforeEach(() => {
    setOfflineNetworkState(true);
  });

  test("inicia conectado y permite cambiar el estado", () => {
    expect(getOfflineNetworkState()).toBe(true);

    setOfflineNetworkState(false);

    expect(getOfflineNetworkState()).toBe(false);
  });

  test("identifica errores de red por mensaje", () => {
    expect(isLikelyNetworkError(new Error("Failed to fetch"))).toBe(true);
    expect(isLikelyNetworkError("connection lost")).toBe(true);
    expect(isLikelyNetworkError("INTERNET unavailable")).toBe(true);
    expect(isLikelyNetworkError({ message: "offline" })).toBe(false);
    expect(isLikelyNetworkError(new Error("Validation failed"))).toBe(false);
    expect(isLikelyNetworkError(0)).toBe(false);
    expect(isLikelyNetworkError(null)).toBe(false);
  });

  test("identifica errores de autenticación", () => {
    expect(isAuthError(new Error("JWT expired"))).toBe(true);
    expect(isAuthError("row-level security policy")).toBe(true);
    expect(isAuthError({ message: "Permission denied" })).toBe(false);
    expect(isAuthError("Something went wrong")).toBe(false);
    expect(isAuthError(undefined)).toBe(false);
  });
});
