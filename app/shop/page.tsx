import { ShopBrowser } from "@/components/shop-browser";
import { getItems } from "@/lib/data";

export default async function ShopPage({ searchParams }: { searchParams: Promise<{ category?: string }> }) {
  const { category } = await searchParams;
  return <ShopBrowser items={await getItems()} initialCategory={category ?? ""}/>;
}
