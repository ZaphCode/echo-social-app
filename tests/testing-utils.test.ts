import { describe, expect, test } from "bun:test";

import { logError, logPBError, mockDBClient } from "../src/utils/testing";

describe("utilidades de soporte", () => {
  test("devuelve usuarios mock para la colección de perfiles", async () => {
    const users = await mockDBClient.collection("profiles").getFullList();

    expect(users).toHaveLength(2);
    expect(users[0]).toMatchObject({ id: "user123", role: "client" });
  });

  test("rechaza colecciones no configuradas", async () => {
    await expect(
      mockDBClient.collection("unknown").getFullList()
    ).rejects.toThrow("Invalid collection");
  });

  test("mantiene el alias de logging compatible", () => {
    expect(logPBError).toBe(logError);
  });
});
