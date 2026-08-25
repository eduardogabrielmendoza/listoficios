import { connection } from "next/server";
import { DiscoveryExperience } from "@/components/discovery-experience";
import { listProfessionals } from "@/data/professionals";
import type { ServiceProfile } from "@/lib/app-types";
import type { Category } from "@/lib/mock-data";

export async function ConnectedDiscoveryExperience({ categories }: { categories: Category[]; initialProfessionals?: ServiceProfile[] }) {
  await connection();
  const featured = await listProfessionals({ limit: 3 });
  return <DiscoveryExperience categories={categories} initialProfessionals={featured.data} />;
}
