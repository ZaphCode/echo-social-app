import useList from "@/hooks/useList";
import { mockPBClient } from "@/utils/testing";
import { renderHook } from "@testing-library/react-hooks/native";

describe("useList", () => {
  it("should fetch data successfully", async () => {
    const { result, waitForNextUpdate } = renderHook(() => useList("users"));

    let [users, { status }] = result.current;

    expect(status).toBe("loading");
    expect(users).toEqual([]);

    await waitForNextUpdate();

    [users, { status }] = result.current;

    expect(status).toBe("success");

    console.log("users", users);
    console.log("test");
  });

  it("should throw be error for invalid collection", async () => {
    const { result, waitForNextUpdate } = renderHook(() =>
      useList("invalid-collection" as any)
    );

    let [_, { status, error }] = result.current;

    expect(status).toBe("loading");

    await waitForNextUpdate();

    [_, { status, error }] = result.current;

    expect(status).toBe("error");

    console.log("Error", error);
  });
});
