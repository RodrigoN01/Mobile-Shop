import { render, screen, cleanup } from "@testing-library/react";
import { describe, it, expect, afterEach, vi } from "vitest";
import userEvent from "@testing-library/user-event";
import SearchBar from "./SearchBar";
import "@testing-library/jest-dom/vitest";

describe("SearchBar", () => {
  afterEach(() => {
    cleanup();
  });

  it("renders the input with the placeholder", () => {
    render(<SearchBar value="" onChange={() => {}} />);
    expect(
      screen.getByPlaceholderText("Search for smartphones...")
    ).toBeInTheDocument();
  });

  it("renders the current value", () => {
    render(<SearchBar value="iPhone" onChange={() => {}} />);
    expect(screen.getByDisplayValue("iPhone")).toBeInTheDocument();
  });

  it("calls onChange when the user types", async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();

    render(<SearchBar value="" onChange={onChange} />);
    await user.type(screen.getByPlaceholderText("Search for smartphones..."), "a");

    expect(onChange).toHaveBeenCalled();
  });
});
