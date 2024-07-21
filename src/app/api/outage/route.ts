export async function GET(request: Request) {
  const API_ENDPOINT =
    "https://raw.githubusercontent.com/MrSunshyne/mauritius-dataset-electricity/main/data/power-outages.json";

  const res = await fetch(API_ENDPOINT);
  const data = await res.json();

  return Response.json({ data });
}
