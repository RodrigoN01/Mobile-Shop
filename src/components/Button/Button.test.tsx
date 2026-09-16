import { render, screen, cleanup } from "@testing-library/react";
import { describe, it, expect, afterEach, vi } from "vitest";
import userEvent from "@testing-library/user-event";
import Button from "./Button";
import "@testing-library/jest-dom/vitest";

describe("Button", () => {
  afterEach(() => {
    cleanup();
  });

  it("renders the children text", () => {
    render(<Button>Add to cart</Button>);
    expect(
      screen.getByRole("button", { name: "Add to cart" })
    ).toBeInTheDocument();
  });

  it("calls onClick when clicked", async () => {
    const user = userEvent.setup();
    const onClick = vi.fn();

    render(<Button onClick={onClick}>Add</Button>);
    await user.click(screen.getByRole("button", { name: "Add" }));

    expect(onClick).toHaveBeenCalledTimes(1);
  });

  it("is disabled and does not call onClick when disabled", async () => {
    const user = userEvent.setup();
    const onClick = vi.fn();

    render(
      <Button onClick={onClick} disabled>
        Add
      </Button>
    );
    const button = screen.getByRole("button", { name: "Add" });

    expect(button).toBeDisabled();
    await user.click(button);
    expect(onClick).not.toHaveBeenCalled();
  });
});
