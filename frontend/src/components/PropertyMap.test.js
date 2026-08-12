import { render, screen } from "@testing-library/react";
import PropertyMap from "./PropertyMap";

describe("PropertyMap", () => {
  test("renders an iframe and Get Directions when lat/lng exist", () => {
    render(
      <PropertyMap
        property={{
          LMD_MP_Latitude: "34.099106",
          LMD_MP_Longitude: "-118.418132",
        }}
      />
    );

    const iframe = screen.getByTitle("Property location");
    expect(iframe).toBeInTheDocument();
    expect(iframe.getAttribute("src")).toContain("34.099106");
    expect(iframe.getAttribute("src")).toContain("-118.418132");

    const directions = screen.getByRole("link", { name: /get directions/i });
    expect(directions).toHaveAttribute("target", "_blank");
    expect(directions.getAttribute("href")).toContain("destination=34.099106");
  });

  test("does not render when latitude or longitude is missing", () => {
    const { container } = render(
      <PropertyMap property={{ LMD_MP_Latitude: "34.1" }} />
    );
    expect(container).toBeEmptyDOMElement();
  });
});
