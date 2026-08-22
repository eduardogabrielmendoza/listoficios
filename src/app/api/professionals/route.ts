import { listProfessionals } from "@/data/professionals";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const pricing = searchParams.get("pricing");
  const sort = searchParams.get("sort");
  const result = await listProfessionals({
    query: searchParams.get("q") ?? "",
    category: searchParams.get("category") ?? undefined,
    zone: searchParams.get("zone") ?? undefined,
    pricing: pricing === "from" || pricing === "hourly" || pricing === "fixed" || pricing === "quote" ? pricing : "",
    sort: sort === "rating" || sort === "price" ? sort : "relevance",
  });

  return Response.json({
    data: result.data,
    meta: {
      total: result.total,
      nextCursor: result.nextCursor,
      source: result.source,
    },
  });
}
