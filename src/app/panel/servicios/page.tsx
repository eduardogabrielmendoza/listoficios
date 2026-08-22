import { getOwnProfile } from "@/data/me";import { requireServerSession } from "@/lib/auth-server";import { ServicesManager } from "@/components/services-manager";
export default async function ServicesPage(){const session=await requireServerSession();const data=await getOwnProfile(session.user.id);return <ServicesManager initial={data?.services??[]}/>}
