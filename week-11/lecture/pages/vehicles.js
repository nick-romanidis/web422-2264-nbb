import { useState, useEffect } from "react";

export default function Vehicles() {
  const [vehicles, setVehicles] = useState(null);
  const [error, setError] = useState(false);

  useEffect(() => {
    fetch("/api/vehicles")
      .then((res) => res.json())
      .then((data) => setVehicles(data))
      .catch(() => setError(true));
  }, []);

  if (error) return <p>Failed to load vehicles.</p>;
  if (!vehicles) return <p>Loading...</p>;

  return (
    <>
      <h1>Vehicles</h1>
      <ul>
        {vehicles.map((vehicle) => (
          <li key={vehicle.id}>
            {vehicle.year} {vehicle.make} {vehicle.model} &mdash; VIN:{" "}
            {vehicle.vin}
          </li>
        ))}
      </ul>
    </>
  );
}
