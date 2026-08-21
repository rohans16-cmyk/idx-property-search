/**
 * @jest-environment jsdom
 */
import { render, screen } from "@testing-library/react";
import ErrorBoundary from "./ErrorBoundary";

function Boom() {
  throw new Error("render boom");
}

test("ErrorBoundary shows recovery UI on render error", () => {
  // Suppress expected React error noise for this intentional throw.
  const spy = jest.spyOn(console, "error").mockImplementation(() => {});

  render(
    <ErrorBoundary>
      <Boom />
    </ErrorBoundary>
  );

  expect(screen.getByRole("alert")).toHaveTextContent(/something went wrong/i);
  expect(screen.getByRole("button", { name: /try again/i })).toBeInTheDocument();

  spy.mockRestore();
});
