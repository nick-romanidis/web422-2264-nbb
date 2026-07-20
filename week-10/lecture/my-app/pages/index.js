import { removeToken } from "@/lib/authenticate";
import { useRouter } from "next/router";
import Link from "next/link";

export default function Home() {
  const router = useRouter();

  function logout() {
    removeToken();
    router.push("/login");
  }

  return (
    <>
      <h2>Vehicles UI</h2>
      <p>A front-end for our secured Vehicles API.</p>
      <p>
        Please <Link href="/login">log in</Link> to continue.
      </p>
      <p>
        <button onClick={logout}>Logout</button>
      </p>
      <p>
        <Link href="/vehicles">View the vehicles</Link>
      </p>
    </>
  );
}
