import { HomeExperience } from "@/components/home-experience";
import { getItems } from "@/lib/data";

export default async function HomePage() { return <HomeExperience items={await getItems()} />; }
