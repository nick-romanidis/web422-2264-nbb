let vehicleData = [
  {
    id: 1,
    year: 1994,
    make: "Suzuki",
    model: "SJ",
    vin: "JN8AZ2KR6CT544012",
  },
  {
    id: 2,
    year: 1999,
    make: "Chrysler",
    model: "300",
    vin: "1B3CC5FB5AN648885",
  },
  {
    id: 3,
    year: 2005,
    make: "BMW",
    model: "X3",
    vin: "JTHBP5C29E5152916",
  },
];

export default function handler(req, res) {
  const { method } = req;

  switch (method) {
    case "GET":
      res.status(200).json(vehicleData);
      break;

    default:
      res.setHeader("Allow", ["GET"]);
      res.status(405).end(`Method ${method} Not Allowed`);
  }
}
