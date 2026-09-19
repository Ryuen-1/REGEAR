import Image from "next/image";
import Link from "next/link";
import { Heart } from "lucide-react";
import { formatPrice } from "@/lib/demo-data";
import type { Item } from "@/lib/types";

export function ProductCard({ item, priority = false }: { item: Item; priority?: boolean }) {
  return <article className="group min-w-0"><Link href={`/item/${item.slug}`} className="block"><div className="relative aspect-[4/5] overflow-hidden bg-[#dedbd1]"><Image src={item.images[0]} alt={item.title} fill priority={priority} sizes="(max-width: 768px) 50vw, 25vw" className="object-cover transition duration-700 ease-out group-hover:scale-105" />{item.status !== "available" && <span className="absolute left-3 top-3 bg-[var(--paper)] px-3 py-1 text-[10px] font-semibold uppercase tracking-wider">{item.status}</span>}<button className="absolute right-3 top-3 grid size-9 place-items-center rounded-full bg-[rgba(242,240,233,.9)] opacity-0 transition group-hover:opacity-100" aria-label="Save item"><Heart size={17}/></button></div><div className="flex justify-between gap-3 pt-3"><div><h3 className="font-medium leading-tight">{item.title}</h3><p className="mt-1 text-xs opacity-55">{item.condition}{item.size ? ` · Size ${item.size}` : ""}</p></div><p className="shrink-0 font-mono text-sm">{formatPrice(item.price)}</p></div></Link></article>;
}
