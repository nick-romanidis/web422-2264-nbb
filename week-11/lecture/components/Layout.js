import Link from "next/link";
import { useRouter } from "next/router";
import { isAuthenticated, removeToken } from "@/lib/authenticate";

export default function Layout(props) {
  const router = useRouter();
  // Read on every render so the navbar reflects login state after navigation.
  const loggedIn = isAuthenticated();

  function logout() {
    removeToken();
    router.push("/login");
  }

  return (
    <>
      <nav>
        <div className="nav-inner">
          <Link href="/">Home</Link>
          {loggedIn && <Link href="/vehicles">Vehicles</Link>}
          <span className="spacer" />
          {!loggedIn && <Link href="/login">Login</Link>}
          {loggedIn && (
            <button className="linklike" onClick={logout}>
              Logout
            </button>
          )}
        </div>
      </nav>
      <main>{props.children}</main>
    </>
  );
}
