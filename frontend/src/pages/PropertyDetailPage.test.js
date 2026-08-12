import { MemoryRouter, Route, Routes } from "react-router-dom";
import { render, screen, waitFor } from "@testing-library/react";
import PropertyDetailPage from "./PropertyDetailPage";
import * as api from "../api/client";

jest.mock("../api/client");

function renderAt(path) {
  return render(
    <MemoryRouter
      initialEntries={[path]}
      future={{ v7_startTransition: true, v7_relativeSplatPath: true }}
    >
      <Routes>
        <Route path="/property/:id" element={<PropertyDetailPage />} />
      </Routes>
    </MemoryRouter>
  );
}

describe("PropertyDetailPage", () => {
  afterEach(() => {
    jest.resetAllMocks();
  });

  test("shows an error for an invalid id instead of crashing", async () => {
    api.fetchPropertyDetail.mockRejectedValue(
      new Error("Listing ID contains invalid characters")
    );
    api.fetchOpenHouses.mockRejectedValue(
      new Error("Listing ID contains invalid characters")
    );

    renderAt("/property/invalid-id!");

    expect(await screen.findByRole("alert")).toHaveTextContent(
      /invalid characters/i
    );
    expect(screen.getByRole("link", { name: /back to listings/i })).toHaveAttribute(
      "href",
      "/"
    );
  });

  test("renders property fields and empty open-house copy", async () => {
    api.fetchPropertyDetail.mockResolvedValue({
      L_ListingID: "1118422731",
      L_Address: "1461 Laurel Way",
      L_City: "Beverly Hills",
      L_State: "CA",
      L_Zip: "90210",
      L_SystemPrice: 2500000,
      L_Keyword2: 4,
      LM_Dec_3: 3,
      LM_Int2_3: 3200,
      YearBuilt: 1973,
      L_Type_: "SingleFamilyResidence",
      L_Status: "Active",
      L_Remarks: "A hillside home.",
      L_Photos: JSON.stringify(["https://example.com/a.jpg"]),
      LMD_MP_Latitude: 34.099106,
      LMD_MP_Longitude: -118.418132,
    });
    api.fetchOpenHouses.mockResolvedValue([]);

    renderAt("/property/1118422731");

    expect(await screen.findByRole("heading", { name: "1461 Laurel Way" })).toBeInTheDocument();
    expect(screen.getByText("A hillside home.")).toBeInTheDocument();
    expect(screen.getByText("No open houses scheduled")).toBeInTheDocument();
    expect(screen.getByTitle("Property location")).toBeInTheDocument();
  });

  test("shows open-house remarks parsed from all_data", async () => {
    api.fetchPropertyDetail.mockResolvedValue({
      L_ListingID: "1174690153",
      L_Address: "1 Main St",
      L_SystemPrice: 1,
    });
    api.fetchOpenHouses.mockResolvedValue([
      {
        id: 9,
        OpenHouseDate: "2026-06-20",
        OH_StartTime: "14:00:00",
        OH_EndTime: "16:00:00",
        all_data: JSON.stringify({
          OpenHouseRemarks: "Welcome — light refreshments.",
        }),
      },
    ]);

    renderAt("/property/1174690153");

    await waitFor(() => {
      expect(
        screen.getByText("Welcome — light refreshments.")
      ).toBeInTheDocument();
    });
    expect(screen.getByText(/2:00 PM/)).toBeInTheDocument();
    expect(screen.getByText(/4:00 PM/)).toBeInTheDocument();
  });
});
