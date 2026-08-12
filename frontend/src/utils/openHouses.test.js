import { getOpenHouseRemarks } from "./openHouses";

describe("getOpenHouseRemarks", () => {
  test("reads OpenHouseRemarks from an all_data JSON string", () => {
    const blob = JSON.stringify({
      OpenHouseStatus: "Active",
      OpenHouseRemarks: "Come see the backyard patio.",
    });
    expect(getOpenHouseRemarks(blob)).toBe("Come see the backyard patio.");
  });

  test("accepts an already-parsed object", () => {
    expect(
      getOpenHouseRemarks({ OpenHouseRemarks: "  Light refreshments  " })
    ).toBe("Light refreshments");
  });

  test("returns null when remarks are missing, empty, or JSON is invalid", () => {
    expect(getOpenHouseRemarks(null)).toBeNull();
    expect(getOpenHouseRemarks("")).toBeNull();
    expect(getOpenHouseRemarks("{not json")).toBeNull();
    expect(getOpenHouseRemarks({ OpenHouseStatus: "Active" })).toBeNull();
    expect(getOpenHouseRemarks({ OpenHouseRemarks: "   " })).toBeNull();
  });
});
