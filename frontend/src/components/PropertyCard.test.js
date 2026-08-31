/**
 * @jest-environment jsdom
 */
import { fireEvent, render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import PropertyCard from "./PropertyCard";

const sample = {
  L_ListingID: "111",
  L_Address: "123 Main St",
  L_City: "Austin",
  L_State: "TX",
  L_SystemPrice: 450000,
  L_Keyword2: 3,
  LM_Dec_3: 2,
  LM_Int2_3: 1800,
  L_Photos: "[]",
};

test("favorite heart toggles without navigating", () => {
  const onToggleFavorite = jest.fn();
  render(
    <MemoryRouter
      future={{ v7_startTransition: true, v7_relativeSplatPath: true }}
    >
      <PropertyCard
        property={sample}
        isFavorite={false}
        onToggleFavorite={onToggleFavorite}
      />
    </MemoryRouter>
  );

  fireEvent.click(screen.getByRole("button", { name: /add to favorites/i }));
  expect(onToggleFavorite).toHaveBeenCalledWith("111");
});

test("renders property data and links to the detail page", () => {
  render(
    <MemoryRouter
      initialEntries={["/"]}
      future={{ v7_startTransition: true, v7_relativeSplatPath: true }}
    >
      <PropertyCard property={sample} />
    </MemoryRouter>
  );

  expect(screen.getByText("$450,000")).toBeInTheDocument();
  expect(screen.getByText("123 Main St")).toBeInTheDocument();
  expect(screen.getByText("Austin, TX")).toBeInTheDocument();
  expect(screen.getByText("3 bd · 2 ba · 1,800 sqft")).toBeInTheDocument();

  const link = screen.getByRole("link", { name: /123 Main St/i });
  expect(link).toHaveAttribute("href", "/property/111");
});

test("filled heart reflects favorite state", () => {
  render(
    <MemoryRouter
      future={{ v7_startTransition: true, v7_relativeSplatPath: true }}
    >
      <PropertyCard
        property={sample}
        isFavorite
        onToggleFavorite={() => {}}
      />
    </MemoryRouter>
  );

  expect(
    screen.getByRole("button", { name: /remove from favorites/i })
  ).toHaveAttribute("aria-pressed", "true");
});
