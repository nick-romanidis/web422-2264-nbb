import Home from "@/pages/index";
import { render } from "@testing-library/react";

describe("Home Page", () => {
  test("renders the 'Vehicles UI' heading", () => {
    const { container } = render(<Home />);

    const heading = container.querySelector("h1");

    expect(heading).toBeTruthy();
    expect(heading.textContent).toBe("Vehicles UI");
  });

  test("renders a link to the /vehicles page", () => {
    const { container } = render(<Home />);

    const links = container.querySelectorAll("a");

    expect(links.length).toBeGreaterThan(0);

    let vehicleLinks = 0;

    links.forEach((link) => {
      if (link.getAttribute("href") === "/vehicles") {
        vehicleLinks++;
      }
    });

    expect(vehicleLinks).toBeGreaterThan(0);
  });
});
