import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router";
import { CartProvider } from "../../context/CartContext";
import Header from "./Header";
import { describe, it, expect } from "vitest";
import "@testing-library/jest-dom/vitest";

describe("Header", () => {
  it("should render the logo text", () => {
    render(
      <MemoryRouter>
        <CartProvider>
          <Header />
        </CartProvider>
      </MemoryRouter>
    );
    expect(screen.getByText("Mobile Shop")).toBeInTheDocument();
  });

  it("should render cart link when not on cart page", () => {
    render(
      <MemoryRouter initialEntries={["/"]}>
        <CartProvider>
          <Header />
        </CartProvider>
      </MemoryRouter>
    );
    const cartLinks = screen.getAllByRole("link");
    const cartLink = cartLinks.find(
      (link) => link.getAttribute("href") === "/cart"
    );
    expect(cartLink).toBeInTheDocument();
  });

  it("should display the correct cart count", () => {
    render(
      <MemoryRouter initialEntries={["/"]}>
        <CartProvider>
          <Header />
        </CartProvider>
      </MemoryRouter>
    );
    expect(screen.queryByText("0")).not.toBeInTheDocument();
  });
});
