export async function GET() {
  const API_ENDPOINT =
    "https://raw.githubusercontent.com/MrSunshyne/mauritius-dataset-electricity/main/data/power-outages.latest.json";

  const res = await fetch(API_ENDPOINT);
  const data = await res.json();

  return Response.json({ data });
}