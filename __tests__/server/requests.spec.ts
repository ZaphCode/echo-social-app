const baseUrl = "http://localhost:8090/api/collections";

describe("Category creation", () => {
  it("should create and delete a category", async () => {
    const response = await fetch(baseUrl + "/service_category/records", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name: "test-category" }),
    });

    expect(response.ok).toBe(true); // status code 2xx
    const json = await response.json();

    console.log("Response JSON:", json);
    expect(json).toHaveProperty("id");

    const deleteResponse = await fetch(
      `${baseUrl}/service_category/records/${json.id}`,
      {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
      }
    );

    expect(deleteResponse.ok).toBe(true);

    const deleteJson = await deleteResponse.json();

    console.log("Delete Response JSON:", deleteJson);
  });
});
