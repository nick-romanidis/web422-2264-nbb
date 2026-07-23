import Link from "next/link";
import ClickCounter from "@/components/ClickCounter";

export default function Home() {
  return (
    <>
      <h1>Vehicles UI</h1>
      <p>
        A small app we will test this week. It has a public home page, a login
        form, and a protected vehicles list.
      </p>

      <p>Here is a little component with some behaviour worth unit-testing:</p>
      <ClickCounter />

      <p style={{ marginTop: "1.5rem" }}>
        <Link href="/vehicles">View the vehicles</Link> (you will be asked to
        log in first).
      </p>
    </>
  );
}
