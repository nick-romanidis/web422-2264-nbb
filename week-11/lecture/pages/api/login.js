// A stand-in for the real Week 9 / Week 10 login route. It validates one
// hard-coded user so the demo is self-contained. In a real app this is where
// you would check the database and sign a JWT.

export default function handler(req, res) {
  const { method } = req;

  if (method !== "POST") {
    res.setHeader("Allow", ["POST"]);
    return res.status(405).end(`Method ${method} Not Allowed`);
  }

  const { userName, password } = req.body;

  if (userName === "bob" && password === "myPassword") {
    // A fake, non-verifiable token; enough to demonstrate the flow.
    return res.status(200).json({ message: "login successful", token: "demo-token" });
  }

  return res.status(422).json({ message: `Login failed for user ${userName}` });
}
