import { getOutages } from "@/lib/outages";

// Read endpoint for the hourly notification poll in the browser. The page
// itself gets its data on the server and does not call this.
// Segment config must be a literal; keep it equal to OUTAGES_REVALIDATE.
export const revalidate = 300;

export async function GET() {
  try {
    const data = await getOutages();
    return Response.json({ data });
  } catch (error) {
    console.error(error);
    return Response.json(
      { error: "Outage data is unavailable right now." },
      { status: 502 },
    );
  }
}
