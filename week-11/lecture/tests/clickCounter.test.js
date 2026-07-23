import ClickCounter from "@/components/ClickCounter";
import userEvent from "@testing-library/user-event";
import { render } from "@testing-library/react";

describe("ClickCounter Component", () => {
  test("increase count by 1 when click", async () => {
    const { container } = render(<ClickCounter />);

    // Find the button in the component/DOM
    const button = container.querySelector("button");

    // Ensure the button exists
    expect(button).toBeTruthy();

    // Ensure that the button contains "0", before clicking.
    expect(button.innerHTML).toContain("0");

    // Simulate a button click
    await userEvent.click(button);

    // Ensure that the button now contains "1"
    expect(button.innerHTML).toContain("1");
  });
});
