import { render, screen, cleanup } from "@testing-library/react";
import { describe, it, expect, afterEach } from "vitest";
import ProductCard from "./ProductCard";
import "@testing-library/jest-dom/vitest";

describe("ProductCard", () => {
  afterEach(() => {
    cleanup();
  });

  it("renders the brand and model", () => {
    render(
      <ProductCard
        brand="Apple"
        model="iPhone 14"
        price="999"
        imgUrl="/image1.jpg"
      />
    );
    expect(screen.getByText("Apple")).toBeInTheDocument();
    expect(screen.getByText("iPhone 14")).toBeInTheDocument();
  });

  it("renders the image with the correct src and alt", () => {
    render(
      <ProductCard
        brand="Apple"
        model="iPhone 14"
        price="999"
        imgUrl="/image1.jpg"
      />
    );
    const image = screen.getByAltText("iPhone 14");
    expect(image).toHaveAttribute("src", "/image1.jpg");
  });

  it("renders the price formatted as EUR currency", () => {
    render(
      <ProductCard
        brand="Apple"
        model="iPhone 14"
        price="999"
        imgUrl="/image1.jpg"
      />
    );
    expect(screen.getByText("€999.00")).toBeInTheDocument();
  });

  it("does not render a price when price is empty", () => {
    render(
      <ProductCard brand="Apple" model="iPhone 14" price="" imgUrl="/image1.jpg" />
    );
    expect(screen.queryByText(/€/)).not.toBeInTheDocument();
  });
});
