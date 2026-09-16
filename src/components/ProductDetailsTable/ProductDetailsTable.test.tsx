import { render, screen, cleanup } from "@testing-library/react";
import { describe, it, expect, afterEach } from "vitest";
import ProductDetailsTable from "./ProductDetailsTable";
import type { ProductDetails } from "../../types";
import "@testing-library/jest-dom/vitest";

const mockProduct: ProductDetails = {
  id: "1",
  brand: "Apple",
  model: "iPhone 14",
  price: "999",
  imgUrl: "/image1.jpg",
  cpu: "A15",
  ram: "6GB",
  os: "iOS",
  displayResolution: "1170x2532",
  battery: "3279mAh",
  primaryCamera: ["12MP"],
  secondaryCmera: ["12MP"],
  dimentions: "146.7x71.5x7.8mm",
  weight: "172g",
  options: {
    colors: [{ code: 1, name: "Black" }],
    storages: [{ code: 128, name: "128GB" }],
  },
  announced: "2022",
  audioJack: "No",
  bluetooth: ["5.3"],
  chipset: "Apple A15",
  colors: ["Black"],
  displaySize: "6.1",
  displayType: "OLED",
  edge: "Yes",
  externalMemory: "No",
  gprs: "Yes",
  gps: "Yes",
  gpu: "Apple GPU",
  internalMemory: ["128GB"],
  networkSpeed: "5G",
  networkTechnology: "5G",
  nfc: "Yes",
  sim: "Nano-SIM",
  usb: "Lightning",
  wlan: ["Wi-Fi 6"],
  radio: "No",
  sensors: ["Face ID"],
  speaker: "Stereo",
  status: "Available",
};

describe("ProductDetailsTable", () => {
  afterEach(() => {
    cleanup();
  });

  it("renders the description heading", () => {
    render(<ProductDetailsTable product={mockProduct} />);
    expect(screen.getByText("Description")).toBeInTheDocument();
  });

  it("renders all the product spec values", () => {
    render(<ProductDetailsTable product={mockProduct} />);

    expect(screen.getByText("Apple")).toBeInTheDocument();
    expect(screen.getByText("iPhone 14")).toBeInTheDocument();
    expect(screen.getByText("A15")).toBeInTheDocument();
    expect(screen.getByText("6GB")).toBeInTheDocument();
    expect(screen.getByText("iOS")).toBeInTheDocument();
    expect(screen.getByText("1170x2532")).toBeInTheDocument();
    expect(screen.getByText("3279mAh")).toBeInTheDocument();
    expect(screen.getAllByText("12MP")).toHaveLength(2);
    expect(screen.getByText("146.7x71.5x7.8mm")).toBeInTheDocument();
    expect(screen.getByText("172g")).toBeInTheDocument();
  });

  it("renders the expected spec labels", () => {
    render(<ProductDetailsTable product={mockProduct} />);

    expect(screen.getByText("Brand")).toBeInTheDocument();
    expect(screen.getByText("Model")).toBeInTheDocument();
    expect(screen.getByText("CPU")).toBeInTheDocument();
    expect(screen.getByText("RAM")).toBeInTheDocument();
    expect(screen.getByText("OS")).toBeInTheDocument();
    expect(screen.getByText("Resolution")).toBeInTheDocument();
    expect(screen.getByText("Battery")).toBeInTheDocument();
    expect(screen.getByText("Primary Camera")).toBeInTheDocument();
    expect(screen.getByText("Selfie Camera")).toBeInTheDocument();
    expect(screen.getByText("Dimensions")).toBeInTheDocument();
    expect(screen.getByText("Weight")).toBeInTheDocument();
  });
});
