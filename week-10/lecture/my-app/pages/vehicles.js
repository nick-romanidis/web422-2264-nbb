import useSWR from "swr";
import { getToken } from "@/lib/authenticate";

const fetcher = (url) =>
  fetch(url, {
    headers: { Authorization: `JWT ${getToken()}` },
  }).then((res) => res.json());

export default function Vehicles() {
  const { data, error } = useSWR(
    `${process.env.NEXT_PUBLIC_API_URL}/api/vehicles`,
    fetcher,
  );

  if (error) return <p>Failed to load vehicles.</p>;
  if (!data) return <p>Loading...</p>;

  return (
    <>
      <h2>Vehicles</h2>
      <ul>
        {data.map((vehicle) => (
          <li key={vehicle.id}>
            {vehicle.year} {vehicle.make} {vehicle.model} &mdash; VIN:{" "}
            {vehicle.vin}
          </li>
        ))}
      </ul>
    </>
  );
}
