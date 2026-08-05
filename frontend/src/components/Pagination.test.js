import { render, screen, fireEvent } from "@testing-library/react";
import Pagination, { getPageItems } from "./Pagination";

describe("getPageItems", () => {
  test("returns a simple range when total pages fit without ellipsis", () => {
    expect(getPageItems(1, 5)).toEqual([1, 2, 3, 4, 5]);
    expect(getPageItems(3, 7)).toEqual([1, 2, 3, 4, 5, 6, 7]);
  });

  test("renders ellipsis near the start", () => {
    expect(getPageItems(1, 24)).toEqual([1, 2, 3, 4, 5, "ellipsis", 24]);
    expect(getPageItems(2, 24)).toEqual([1, 2, 3, 4, 5, "ellipsis", 24]);
    expect(getPageItems(3, 24)).toEqual([1, 2, 3, 4, 5, "ellipsis", 24]);
  });

  test("renders ellipsis in the middle", () => {
    expect(getPageItems(10, 24)).toEqual([
      1,
      "ellipsis",
      9,
      10,
      11,
      "ellipsis",
      24,
    ]);
  });

  test("renders ellipsis near the end without duplicating the last page", () => {
    // Debug challenge: buggy generators append totalPages even when the
    // sliding window already includes it → "1 … 8 9 10 … 10" (or worse).
    expect(getPageItems(9, 10)).toEqual([1, "ellipsis", 6, 7, 8, 9, 10]);
    expect(getPageItems(10, 10)).toEqual([1, "ellipsis", 6, 7, 8, 9, 10]);
    expect(getPageItems(23, 24)).toEqual([1, "ellipsis", 20, 21, 22, 23, 24]);
    expect(getPageItems(24, 24)).toEqual([1, "ellipsis", 20, 21, 22, 23, 24]);

    const nearEnd = getPageItems(23, 24);
    const numbers = nearEnd.filter((x) => typeof x === "number");
    expect(numbers).toEqual([...new Set(numbers)]);
    expect(numbers.filter((n) => n === 24)).toHaveLength(1);
  });

  test("hides nothing useful for a single page (caller may hide UI)", () => {
    expect(getPageItems(1, 1)).toEqual([1]);
    expect(getPageItems(1, 0)).toEqual([]);
  });
});

describe("Pagination component", () => {
  test("renders nothing when there is only one page", () => {
    const { container } = render(
      <Pagination currentPage={1} totalPages={1} onPageChange={jest.fn()} />
    );
    expect(container).toBeEmptyDOMElement();
  });

  test("disables Previous on the first page and Next on the last page", () => {
    const { rerender } = render(
      <Pagination currentPage={1} totalPages={10} onPageChange={jest.fn()} />
    );
    expect(screen.getByRole("button", { name: /previous page/i })).toBeDisabled();
    expect(screen.getByRole("button", { name: /next page/i })).not.toBeDisabled();

    rerender(
      <Pagination currentPage={10} totalPages={10} onPageChange={jest.fn()} />
    );
    expect(screen.getByRole("button", { name: /previous page/i })).not.toBeDisabled();
    expect(screen.getByRole("button", { name: /next page/i })).toBeDisabled();
  });

  test("clicking a page number calls onPageChange", () => {
    const onPageChange = jest.fn();
    render(
      <Pagination currentPage={1} totalPages={10} onPageChange={onPageChange} />
    );
    fireEvent.click(screen.getByRole("button", { name: "Page 3" }));
    expect(onPageChange).toHaveBeenCalledWith(3);
  });

  test("Previous and Next navigate relative to the current page", () => {
    const onPageChange = jest.fn();
    render(
      <Pagination currentPage={5} totalPages={10} onPageChange={onPageChange} />
    );
    fireEvent.click(screen.getByRole("button", { name: /next page/i }));
    expect(onPageChange).toHaveBeenCalledWith(6);
    fireEvent.click(screen.getByRole("button", { name: /previous page/i }));
    expect(onPageChange).toHaveBeenCalledWith(4);
  });

  test("shows ellipsis markers for large page counts", () => {
    render(
      <Pagination currentPage={10} totalPages={24} onPageChange={jest.fn()} />
    );
    expect(screen.getAllByText("…")).toHaveLength(2);
    expect(screen.getByRole("button", { name: "Page 1" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Page 24" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Page 10" })).toHaveAttribute(
      "aria-current",
      "page"
    );
  });

  test("debug challenge: near-end pages do not render the last page twice", () => {
    render(
      <Pagination currentPage={9} totalPages={10} onPageChange={jest.fn()} />
    );
    const pageButtons = screen
      .getAllByRole("button")
      .map((btn) => btn.getAttribute("aria-label"))
      .filter((label) => label && label.startsWith("Page "));
    const pageTen = pageButtons.filter((label) => label === "Page 10");
    expect(pageTen).toHaveLength(1);
    // Must not look like: 1 … 2 3 4 … 1 / or duplicate last control
    expect(pageButtons).toEqual([
      "Page 1",
      "Page 6",
      "Page 7",
      "Page 8",
      "Page 9",
      "Page 10",
    ]);
  });
});
