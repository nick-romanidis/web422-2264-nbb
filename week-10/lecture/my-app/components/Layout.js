import Link from "next/link";
import { useRouter } from "next/router";
import { Navbar, Nav, Container } from "react-bootstrap";
import { readToken, removeToken } from "@/lib/authenticate";

export default function Layout(props) {
  const router = useRouter();
  const token = readToken();

  function logout() {
    removeToken();
    router.push("/login");
  }

  return (
    <>
      <Navbar bg="light" expand="lg">
        <Container>
          <Navbar.Brand as={Link} href="/">
            Vehicles UI {token && <>&mdash; Welcome {token.userName}</>}
          </Navbar.Brand>
          <Navbar.Toggle aria-controls="navbar-nav" />
          <Navbar.Collapse id="navbar-nav">
            <Nav className="me-auto">
              <Nav.Link as={Link} href="/">
                Home
              </Nav.Link>
              {token && (
                <Nav.Link as={Link} href="/vehicles">
                  Vehicles
                </Nav.Link>
              )}
            </Nav>
            <Nav className="ms-auto">
              {!token && (
                <Nav.Link as={Link} href="/login">
                  Login
                </Nav.Link>
              )}
              {token && <Nav.Link onClick={logout}>Logout</Nav.Link>}
            </Nav>
          </Navbar.Collapse>
        </Container>
      </Navbar>
      <Container style={{ paddingTop: "1rem" }}>{props.children}</Container>
    </>
  );
}
