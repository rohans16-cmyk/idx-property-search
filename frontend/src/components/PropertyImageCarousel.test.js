import { MemoryRouter } from "react-router-dom";
import { fireEvent, render, screen } from "@testing-library/react";
import PropertyCard from "./PropertyCard";
import PropertyImageCarousel from "./PropertyImageCarousel";

const photos = JSON.stringify([
  "https://example.com/a.jpg",
  "https://example.com/b.jpg",
  "https://example.com/c.jpg",
]);

describe("PropertyImageCarousel", () => {
  test("cycles photos and shows an X / Y counter", () => {
    render(<PropertyImageCarousel photos={photos} alt="Listing" />);

    expect(screen.getByText("1 / 3")).toBeInTheDocument();
    expect(screen.getByAltText("Listing")).toHaveAttribute(
      "src",
      "https://example.com/a.jpg"
    );

    fireEvent.click(screen.getByRole("button", { name: /next photo/i }));
    expect(screen.getByText("2 / 3")).toBeInTheDocument();
    expect(screen.getByAltText("Listing")).toHaveAttribute(
      "src",
      "https://example.com/b.jpg"
    );

    fireEvent.click(screen.getByRole("button", { name: /previous photo/i }));
    expect(screen.getByText("1 / 3")).toBeInTheDocument();
  });

  test("arrow clicks do not navigate to the detail page", () => {
    render(
      <MemoryRouter
        future={{ v7_startTransition: true, v7_relativeSplatPath: true }}
      >
        <PropertyCard
          property={{
            L_ListingID: "1118422731",
            L_Address: "1461 Laurel Way",
            L_City: "Beverly Hills",
            L_State: "CA",
            L_SystemPrice: 1000000,
            L_Keyword2: 4,
            LM_Dec_3: 3,
            LM_Int2_3: 2000,
            L_Photos: photos,
          }}
        />
      </MemoryRouter>
    );

    const link = screen.getByRole("link");
    expect(link).toHaveAttribute("href", "/property/1118422731");

    fireEvent.click(screen.getByRole("button", { name: /next photo/i }));
    expect(screen.getByText("2 / 3")).toBeInTheDocument();
    expect(link).toHaveAttribute("href", "/property/1118422731");
  });
});
