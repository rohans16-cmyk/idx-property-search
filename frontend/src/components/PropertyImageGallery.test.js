import { fireEvent, render, screen } from "@testing-library/react";
import PropertyImageGallery from "./PropertyImageGallery";

const photos = JSON.stringify([
  "https://example.com/a.jpg",
  "https://example.com/b.jpg",
]);

describe("PropertyImageGallery", () => {
  test("thumbnail click updates the main image", () => {
    render(<PropertyImageGallery photos={photos} alt="Listing" />);

    expect(screen.getByRole("img", { name: "Listing" })).toHaveAttribute(
      "src",
      "https://example.com/a.jpg"
    );

    fireEvent.click(screen.getByRole("button", { name: /show photo 2 of 2/i }));
    expect(screen.getByRole("img", { name: "Listing" })).toHaveAttribute(
      "src",
      "https://example.com/b.jpg"
    );
  });

  test("clicking the main image opens a lightbox that closes on Escape", () => {
    render(<PropertyImageGallery photos={photos} alt="Listing" />);

    fireEvent.click(screen.getByRole("button", { name: /open photo lightbox/i }));
    const dialog = screen.getByRole("dialog", { name: /photo lightbox/i });
    expect(dialog).toBeInTheDocument();
    expect(dialog).toHaveAttribute("tabIndex", "0");

    fireEvent.keyDown(dialog, { key: "Escape" });
    expect(
      screen.queryByRole("dialog", { name: /photo lightbox/i })
    ).not.toBeInTheDocument();
  });

  test("clicking the lightbox backdrop closes it", () => {
    render(<PropertyImageGallery photos={photos} alt="Listing" />);
    fireEvent.click(screen.getByRole("button", { name: /open photo lightbox/i }));

    fireEvent.click(screen.getByRole("dialog"));
    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
  });
});
