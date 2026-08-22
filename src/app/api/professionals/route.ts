import { searchProfessionals } from "@/lib/mock-data";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const pricing = searchParams.get("pricing");
  const sort = searchParams.get("sort");
  const data = searchProfessionals({
    query: searchParams.get("q") ?? "",
    category: searchParams.get("category") ?? undefined,
    zone: searchParams.get("zone") ?? undefined,
    pricing: pricing === "from" || pricing === "hourly" || pricing === "fixed" || pricing === "quote" ? pricing : "",
    sort: sort === "rating" || sort === "price" ? sort : "relevance",
  });

  return Response.json({
    data,
    meta: {
      total: data.length,
      source: "mock",
    },
  });
}
