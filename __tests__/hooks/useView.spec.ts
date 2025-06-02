import useView from "@/hooks/useView";
import { renderHook } from "@testing-library/react-hooks/native";

describe("useView hook", () => {
  test("should fetch data successfully", async () => {
    const { result, waitForNextUpdate } = renderHook(() =>
      useView("service", "v2r738jd36667n6")
    );

    let [service, { status }] = result.current;

    expect(status).toBe("loading");
    expect(service).toEqual(null);

    await waitForNextUpdate();

    [service, { status }] = result.current;

    expect(status).toBe("success");

    console.log("-- service", service);
  });

  test("should throw an error if id not found", async () => {
    const { result, waitForNextUpdate } = renderHook(() =>
      useView("service", "99999999")
    );

    let [service, { status, error }] = result.current;

    expect(status).toBe("loading");
    expect(service).toEqual(null);

    await waitForNextUpdate();

    [service, { status, error }] = result.current;

    expect(status).toBe("error");

    console.log("-- Error:", error);
  });

  test("should throw an error if collection is invalid", async () => {
    const { result, waitForNextUpdate } = renderHook(() =>
      useView("invalid-coll" as any, "v2r738jd36667n6")
    );

    let [service, { status, error }] = result.current;

    expect(status).toBe("loading");
    expect(service).toEqual(null);

    await waitForNextUpdate();

    [service, { status, error }] = result.current;

    expect(status).toBe("error");

    console.log("-- Error:", error);
  });
});
