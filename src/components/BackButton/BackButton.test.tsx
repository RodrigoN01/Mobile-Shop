import { render, screen, cleanup } from "@testing-library/react";
import { MemoryRouter } from "react-router";
import { describe, it, expect, afterEach } from "vitest";
import BackButton from "./BackButton";
import "@testing-library/jest-dom/vitest";

describe("BackButton", () => {
  afterEach(() => {
    cleanup();
  });

  it("renders the back button test", () => {
    render(
      <MemoryRouter>
        <BackButton />
      </MemoryRouter>
    );
    expect(screen.getByText("Back")).toBeInTheDocument();
  });

  it("navigates to home when clicked", () => {
    render(
      <MemoryRouter>
        <BackButton />
      </MemoryRouter>
    );
    const link = screen.getByRole("link", { name: /back/i });
    expect(link).toHaveAttribute("href", "/");
  });
});
