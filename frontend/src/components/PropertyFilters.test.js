import { render, screen, fireEvent } from "@testing-library/react";
import PropertyFilters, {
  EMPTY_FILTERS,
  sanitizeFilters,
} from "./PropertyFilters";

describe("sanitizeFilters", () => {
  test("removes empty string values but keeps real filters", () => {
    expect(
      sanitizeFilters({
        city: "Austin",
        zipcode: "",
        minPrice: "100000",
        maxPrice: "",
        beds: "3",
        baths: "",
      })
    ).toEqual({
      city: "Austin",
      minPrice: "100000",
      beds: "3",
    });
  });

  test('maps beds/baths "6+" to minBeds/minBaths', () => {
    expect(
      sanitizeFilters({
        ...EMPTY_FILTERS,
        beds: "6+",
        baths: "6+",
      })
    ).toEqual({
      minBeds: 6,
      minBaths: 6,
    });
  });
});

describe("PropertyFilters", () => {
  const baseProps = () => ({
    filters: { ...EMPTY_FILTERS },
    onChange: jest.fn(),
    onSearch: jest.fn(),
    onClear: jest.fn(),
  });

  test("renders all six filter inputs", () => {
    render(<PropertyFilters {...baseProps()} />);

    expect(screen.getByLabelText("City")).toBeInTheDocument();
    expect(screen.getByLabelText("ZIP code")).toBeInTheDocument();
    expect(screen.getByLabelText("Min price")).toBeInTheDocument();
    expect(screen.getByLabelText("Max price")).toBeInTheDocument();
    expect(screen.getByLabelText("Beds")).toBeInTheDocument();
    expect(screen.getByLabelText("Baths")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /search/i })).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: /clear filters/i })
    ).toBeInTheDocument();
  });

  test("Search submits sanitized filters and omits empty values", () => {
    const props = {
      ...baseProps(),
      filters: {
        ...EMPTY_FILTERS,
        city: "Austin",
        zipcode: "",
        minPrice: "250000",
        beds: "3",
      },
    };

    render(<PropertyFilters {...props} />);
    fireEvent.click(screen.getByRole("button", { name: /search/i }));

    expect(props.onSearch).toHaveBeenCalledTimes(1);
    expect(props.onSearch).toHaveBeenCalledWith({
      city: "Austin",
      minPrice: "250000",
      beds: "3",
    });
  });

  test("typing updates filters via onChange with the spread object", () => {
    const props = baseProps();
    render(<PropertyFilters {...props} />);

    fireEvent.change(screen.getByLabelText("City"), {
      target: { name: "city", value: "Dallas" },
    });

    expect(props.onChange).toHaveBeenCalledWith({
      ...EMPTY_FILTERS,
      city: "Dallas",
    });
  });

  test("Clear Filters calls onClear", () => {
    const props = baseProps();
    render(<PropertyFilters {...props} />);

    fireEvent.click(screen.getByRole("button", { name: /clear filters/i }));
    expect(props.onClear).toHaveBeenCalledTimes(1);
  });

  test("beds and baths dropdowns include 1–5 and 6+", () => {
    render(<PropertyFilters {...baseProps()} />);

    const bedOptions = Array.from(screen.getByLabelText("Beds").options).map(
      (o) => o.textContent
    );
    const bathOptions = Array.from(screen.getByLabelText("Baths").options).map(
      (o) => o.textContent
    );

    expect(bedOptions).toEqual(["Any", "1", "2", "3", "4", "5", "6+"]);
    expect(bathOptions).toEqual(["Any", "1", "2", "3", "4", "5", "6+"]);
  });
});
