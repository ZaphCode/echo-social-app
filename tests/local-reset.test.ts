import { describe, expect, test } from "bun:test";

import { decideLocalReset, isDeletedUserAuthError } from "../src/utils/localReset";

describe("reset de la base local", () => {
  test("recuerda la época la primera vez", () => {
    expect(
      decideLocalReset({ localEpoch: null, serverEpoch: "a", sessionUserMissing: false })
    ).toBe("remember");
  });

  test("no hace nada si la época coincide", () => {
    expect(
      decideLocalReset({ localEpoch: "a", serverEpoch: "a", sessionUserMissing: false })
    ).toBe("keep");
  });

  test("borra si el servidor fue reseteado", () => {
    expect(
      decideLocalReset({ localEpoch: "a", serverEpoch: "b", sessionUserMissing: false })
    ).toBe("wipe");
  });

  test("nunca borra sin conexión", () => {
    expect(
      decideLocalReset({ localEpoch: "a", serverEpoch: null, sessionUserMissing: false })
    ).toBe("keep");
    expect(
      decideLocalReset({ localEpoch: null, serverEpoch: null, sessionUserMissing: false })
    ).toBe("keep");
  });

  test("borra si el usuario de la sesión ya no existe", () => {
    expect(
      decideLocalReset({ localEpoch: "a", serverEpoch: "a", sessionUserMissing: true })
    ).toBe("wipe");
  });

  test("detecta usuario borrado y no confunde otros errores", () => {
    expect(isDeletedUserAuthError({ code: "user_not_found", status: 403 })).toBe(true);
    expect(
      isDeletedUserAuthError({
        status: 403,
        message: "User from sub claim in JWT does not exist",
      })
    ).toBe(true);
    expect(isDeletedUserAuthError({ status: 401, message: "JWT expired" })).toBe(false);
    expect(isDeletedUserAuthError({ status: 0, message: "Failed to fetch" })).toBe(false);
    expect(isDeletedUserAuthError(null)).toBe(false);
  });
});
