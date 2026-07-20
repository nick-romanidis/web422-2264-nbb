import { useState } from "react";
import { useRouter } from "next/router";
import { Card, Form, Button, Alert } from "react-bootstrap";
import { authenticateUser } from "@/lib/authenticate";

export default function Login() {
  const [userName, setUserName] = useState("bob");
  const [password, setPassword] = useState("");
  const [warning, setWarning] = useState("");
  const router = useRouter();

  async function handleSubmit(e) {
    e.preventDefault();

    try {
      await authenticateUser(userName, password);
      router.push("/vehicles");
    } catch (err) {
      setWarning(err.message);
    }
  }

  return (
    <Card bg="light" style={{ maxWidth: "30rem", margin: "2rem auto" }}>
      <Card.Body>
        <h2>Login</h2>
        Enter your login information below:
      </Card.Body>
      <Card.Body>
        <Form onSubmit={handleSubmit}>
          <Form.Group className="mb-3">
            <Form.Label>User:</Form.Label>
            <Form.Control
              type="text"
              value={userName}
              onChange={(e) => setUserName(e.target.value)}
            />
          </Form.Group>
          <Form.Group className="mb-3">
            <Form.Label>Password:</Form.Label>
            <Form.Control
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </Form.Group>

          {warning && <Alert variant="danger">{warning}</Alert>}

          <Button variant="primary" type="submit">
            Login
          </Button>
        </Form>
      </Card.Body>
    </Card>
  );
}
