import {
  fetchProperties,
  fetchPropertyDetail,
  fetchOpenHouses,
} from "./client";

describe("api client", () => {
  const originalFetch = global.fetch;

  beforeEach(() => {
    global.fetch = jest.fn();
  });

  afterEach(() => {
    global.fetch = originalFetch;
    jest.clearAllMocks();
  });

  function mockJson(body, { ok = true, status = 200 } = {}) {
    global.fetch.mockResolvedValue({
      ok,
      status,
      headers: {
        get: () => "application/json",
      },
      json: async () => body,
      text: async () => JSON.stringify(body),
    });
  }

  test("fetchProperties builds a query string and returns JSON on success", async () => {
    const payload = { total: 1, results: [{ L_ListingID: 1 }] };
    mockJson(payload);

    const result = await fetchProperties({
      city: "Austin",
      minPrice: 200000,
      limit: 20,
      offset: 0,
    });

    expect(global.fetch).toHaveBeenCalledTimes(1);
    const calledUrl = global.fetch.mock.calls[0][0];
    expect(calledUrl).toContain("/api/properties?");
    expect(calledUrl).toContain("city=Austin");
    expect(calledUrl).toContain("minPrice=200000");
    expect(calledUrl).toContain("limit=20");
    expect(result).toEqual(payload);
  });

  test("fetchProperties omits empty filter values from the query string", async () => {
    mockJson({ total: 0, results: [] });

    await fetchProperties({
      city: "Austin",
      zipcode: "",
      minPrice: "",
      beds: undefined,
      baths: null,
    });

    const calledUrl = global.fetch.mock.calls[0][0];
    expect(calledUrl).toBe("/api/properties?city=Austin");
    expect(calledUrl).not.toContain("zipcode=");
    expect(calledUrl).not.toContain("minPrice=");
    expect(calledUrl).not.toContain("beds=");
    expect(calledUrl).not.toContain("baths=");
  });

  test("fetchProperties throws a meaningful error when the API returns non-OK", async () => {
    mockJson({ error: "minPrice cannot be greater than maxPrice" }, {
      ok: false,
      status: 400,
    });

    await expect(
      fetchProperties({ minPrice: 500000, maxPrice: 100000 })
    ).rejects.toThrow("minPrice cannot be greater than maxPrice");
  });

  test("fetchPropertyDetail and fetchOpenHouses encode the listing id", async () => {
    mockJson({ L_ListingID: "1174572339" });
    await fetchPropertyDetail("1174572339");
    expect(global.fetch.mock.calls[0][0]).toBe("/api/properties/1174572339");

    mockJson([]);
    await fetchOpenHouses("1174572339");
    expect(global.fetch.mock.calls[1][0]).toBe(
      "/api/properties/1174572339/openhouses"
    );
  });

  test("request throws a friendly message when fetch itself fails", async () => {
    global.fetch.mockRejectedValue(new TypeError("Failed to fetch"));

    await expect(fetchProperties({})).rejects.toThrow(
      /Unable to reach the API server/
    );
  });
});
