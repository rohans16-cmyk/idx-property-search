jest.mock("../db/pool", () => ({
  query: jest.fn(),
}));

const request = require("supertest");
const pool = require("../db/pool");
const app = require("../server");

const sampleProperty = {
  L_ListingID: "1174572339",
  L_Address: "123 Main St",
  L_City: "Portland",
  L_State: "OR",
  L_Zip: "97201",
  L_SystemPrice: 450000,
  L_Keyword2: "3",
  LM_Dec_3: "2",
  LM_Int2_3: 1800,
  L_Photos: "[]",
  L_Remarks: "Spacious home",
};

const sampleOpenHouse = {
  id: 1,
  L_ListingID: "1174572339",
  L_DisplayId: "OH-1",
  OpenHouseDate: "2026-09-01",
  OH_StartTime: "10:00:00",
  OH_EndTime: "14:00:00",
  all_data: '{"OpenHouseRemarks":"Welcome"}',
};

beforeEach(() => {
  jest.clearAllMocks();
});

describe("GET /api/properties", () => {
  test("returns paginated results with defaults", async () => {
    pool.query
      .mockResolvedValueOnce([[{ total: 2 }]])
      .mockResolvedValueOnce([[sampleProperty, { ...sampleProperty, L_ListingID: "2" }]]);

    const res = await request(app).get("/api/properties");

    expect(res.status).toBe(200);
    expect(res.body).toMatchObject({
      total: 2,
      limit: 20,
      offset: 0,
      sortBy: "L_ListingID",
      sortOrder: "ASC",
    });
    expect(res.body.results).toHaveLength(2);
    expect(pool.query).toHaveBeenCalledTimes(2);
  });

  test("applies city, zipcode, price, beds, and baths filters", async () => {
    pool.query
      .mockResolvedValueOnce([[{ total: 1 }]])
      .mockResolvedValueOnce([[sampleProperty]]);

    const res = await request(app).get(
      "/api/properties?city=Portland&zipcode=97201&minPrice=300000&maxPrice=900000&beds=3&baths=2"
    );

    expect(res.status).toBe(200);
    expect(res.body.total).toBe(1);

    const countSql = pool.query.mock.calls[0][0];
    expect(countSql).toMatch(/LOWER\(TRIM\(L_City\)\)/);
    expect(countSql).toMatch(/TRIM\(L_Zip\)/);
    expect(countSql).toMatch(/L_SystemPrice >= \?/);
    expect(countSql).toMatch(/L_SystemPrice <= \?/);
    expect(countSql).toMatch(/CAST\(L_Keyword2 AS UNSIGNED\) = \?/);
    expect(countSql).toMatch(/CAST\(LM_Dec_3 AS UNSIGNED\) = \?/);
    expect(pool.query.mock.calls[0][1]).toEqual([
      "Portland",
      "97201",
      300000,
      900000,
      3,
      2,
    ]);
  });

  test("supports minBeds and minBaths filters", async () => {
    pool.query
      .mockResolvedValueOnce([[{ total: 0 }]])
      .mockResolvedValueOnce([[]]);

    const res = await request(app).get(
      "/api/properties?minBeds=6&minBaths=4&limit=10&offset=20"
    );

    expect(res.status).toBe(200);
    expect(res.body.limit).toBe(10);
    expect(res.body.offset).toBe(20);

    const countSql = pool.query.mock.calls[0][0];
    expect(countSql).toMatch(/CAST\(L_Keyword2 AS UNSIGNED\) >= \?/);
    expect(countSql).toMatch(/CAST\(LM_Dec_3 AS UNSIGNED\) >= \?/);
    expect(pool.query.mock.calls[1][1]).toEqual([6, 4, 10, 20]);
  });

  test("applies whitelisted sort columns", async () => {
    pool.query
      .mockResolvedValueOnce([[{ total: 1 }]])
      .mockResolvedValueOnce([[sampleProperty]]);

    const res = await request(app).get(
      "/api/properties?sortBy=L_SystemPrice&sortOrder=DESC"
    );

    expect(res.status).toBe(200);
    expect(res.body.sortBy).toBe("L_SystemPrice");
    expect(res.body.sortOrder).toBe("DESC");

    const selectSql = pool.query.mock.calls[1][0];
    expect(selectSql).toMatch(/ORDER BY L_SystemPrice DESC, L_ListingID ASC/);
  });

  test.each([
    ["limit=0", "limit must be at least 1"],
    ["limit=abc", "limit must be a valid number"],
    ["minPrice=abc", "minPrice must be a valid number"],
    ["sortBy=ListPrice", "sortBy must be one of"],
    ["sortBy=L_SystemPrice&sortOrder=UP", "sortOrder must be ASC or DESC"],
    ["minPrice=500000&maxPrice=100000", "minPrice cannot be greater than maxPrice"],
    ["beds=3&minBeds=4", "beds and minBeds cannot be used together"],
  ])("rejects invalid query %s", async (queryString, expectedError) => {
    const res = await request(app).get(`/api/properties?${queryString}`);

    expect(res.status).toBe(400);
    expect(res.body.error).toMatch(new RegExp(expectedError, "i"));
    expect(pool.query).not.toHaveBeenCalled();
  });

  test("returns 500 when the database throws", async () => {
    pool.query.mockRejectedValueOnce(new Error("connection lost"));

    const res = await request(app).get("/api/properties");

    expect(res.status).toBe(500);
    expect(res.body.error).toBe("Failed to search properties");
  });
});

describe("GET /api/properties/:id", () => {
  test("returns a property when found", async () => {
    pool.query.mockResolvedValueOnce([[sampleProperty]]);

    const res = await request(app).get("/api/properties/1174572339");

    expect(res.status).toBe(200);
    expect(res.body.L_ListingID).toBe("1174572339");
    expect(pool.query).toHaveBeenCalledWith(
      "SELECT * FROM rets_property WHERE L_ListingID = ? LIMIT 1",
      ["1174572339"]
    );
  });

  test("returns 404 when the property is missing", async () => {
    pool.query.mockResolvedValueOnce([[]]);

    const res = await request(app).get("/api/properties/9999999999");

    expect(res.status).toBe(404);
    expect(res.body.error).toMatch(/not found/i);
  });

  test("returns 400 for malformed listing IDs", async () => {
    const res = await request(app).get("/api/properties/abc%2Fopenhouses");

    expect(res.status).toBe(400);
    expect(res.body.error).toMatch(/invalid characters/i);
    expect(pool.query).not.toHaveBeenCalled();
  });

  test("returns 500 when the database throws", async () => {
    pool.query.mockRejectedValueOnce(new Error("timeout"));

    const res = await request(app).get("/api/properties/1174572339");

    expect(res.status).toBe(500);
    expect(res.body.error).toBe("Failed to fetch property");
  });
});

describe("GET /api/properties/:id/openhouses", () => {
  test("returns open houses for a known property", async () => {
    pool.query
      .mockResolvedValueOnce([[{ L_ListingID: "1174572339" }]])
      .mockResolvedValueOnce([[sampleOpenHouse]]);

    const res = await request(app).get("/api/properties/1174572339/openhouses");

    expect(res.status).toBe(200);
    expect(res.body).toEqual([sampleOpenHouse]);
    expect(pool.query).toHaveBeenCalledTimes(2);
  });

  test("returns an empty array when the property exists but has no open houses", async () => {
    pool.query
      .mockResolvedValueOnce([[{ L_ListingID: "1174572339" }]])
      .mockResolvedValueOnce([[]]);

    const res = await request(app).get("/api/properties/1174572339/openhouses");

    expect(res.status).toBe(200);
    expect(res.body).toEqual([]);
  });

  test("returns 404 when the property does not exist", async () => {
    pool.query.mockResolvedValueOnce([[]]);

    const res = await request(app).get("/api/properties/9999999999/openhouses");

    expect(res.status).toBe(404);
    expect(res.body.error).toMatch(/not found/i);
    expect(pool.query).toHaveBeenCalledTimes(1);
  });

  test("returns 400 for invalid listing IDs", async () => {
    const res = await request(app).get(
      `/api/properties/${"9".repeat(40)}/openhouses`
    );

    expect(res.status).toBe(400);
    expect(res.body.error).toMatch(/too long/i);
  });

  test("returns 500 when the database throws", async () => {
    pool.query
      .mockResolvedValueOnce([[{ L_ListingID: "1174572339" }]])
      .mockRejectedValueOnce(new Error("serialize failure"));

    const res = await request(app).get("/api/properties/1174572339/openhouses");

    expect(res.status).toBe(500);
    expect(res.body.error).toBe("Failed to fetch open houses");
  });
});
