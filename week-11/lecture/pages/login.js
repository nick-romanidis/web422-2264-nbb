import { useState } from "react";
import { useRouter } from "next/router";
import { authenticateUser } from "@/lib/authenticate";

export default function Login() {
  const [userName, setUserName] = useState("");
  const [password, setPassword] = useState("");
  const [warning, setWarning] = useState("");
  const router = useRouter();

  async function handleSubmit(e) {
    e.preventDefault();
    setWarning("");

    try {
      await authenticateUser(userName, password);
      router.push("/vehicles");
    } catch (err) {
      setWarning(err.message);
    }
  }

  return (
    <>
      <h1>Login</h1>
      <p>
        Sign in with <strong>bob</strong> / <strong>myPassword</strong>.
      </p>

      <form onSubmit={handleSubmit}>
        <label htmlFor="username">User:</label>
        <input
          id="username"
          name="username"
          type="text"
          value={userName}
          onChange={(e) => setUserName(e.target.value)}
        />

        <label htmlFor="password">Password:</label>
        <input
          id="password"
          name="password"
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />

        {warning && <p className="warning">{warning}</p>}

        <p style={{ marginTop: "1rem" }}>
          <button type="submit">Login</button>
        </p>
      </form>
    </>
  );
}
