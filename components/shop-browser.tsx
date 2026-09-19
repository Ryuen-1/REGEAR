"use client";

import { Search, SlidersHorizontal, X } from "lucide-react";
import { useMemo, useState } from "react";
import { ProductCard } from "@/components/product-card";
import type { Item } from "@/lib/types";

export function ShopBrowser({ items, initialCategory = "" }: { items: Item[]; initialCategory?: string }) {
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState(initialCategory);
  const [condition, setCondition] = useState("");
  const [sort, setSort] = useState("newest");
  const [filtersOpen, setFiltersOpen] = useState(false);
  const categories = [...new Set(items.map((item) => item.category))];
  const filtered = useMemo(() => items.filter((item) => {
    const query = search.toLowerCase();
    return (!query || `${item.title} ${item.description}`.toLowerCase().includes(query)) && (!category || item.category === category) && (!condition || item.condition === condition);
  }).sort((a,b) => sort === "low" ? a.price-b.price : sort === "high" ? b.price-a.price : +new Date(b.created_at)-+new Date(a.created_at)), [items, search, category, condition, sort]);

  return <main className="mx-auto min-h-screen max-w-[1600px] px-4 py-10 md:px-8 md:py-16"><div className="flex flex-col justify-between gap-8 border-b hairline pb-10 md:flex-row md:items-end"><div><p className="eyebrow">One of one</p><h1 className="display mt-4 text-[clamp(3.5rem,7vw,7rem)]">The whole edit</h1></div><p className="max-w-sm text-sm leading-6 opacity-60">Every piece is available once. Add it to your bag and we’ll hold it for fifteen minutes.</p></div><div className="sticky top-16 z-30 flex flex-wrap items-center gap-3 border-b hairline bg-[var(--paper)] py-4"><label className="flex min-w-64 flex-1 items-center gap-2 border hairline px-3 py-2"><Search size={17}/><input value={search} onChange={(e)=>setSearch(e.target.value)} placeholder="Search garments and objects" className="w-full bg-transparent text-sm outline-none"/></label><button onClick={()=>setFiltersOpen(!filtersOpen)} className="flex items-center gap-2 border hairline px-4 py-2 text-sm"><SlidersHorizontal size={16}/> Filters</button><select aria-label="Sort" value={sort} onChange={(e)=>setSort(e.target.value)} className="border hairline bg-transparent px-4 py-2 text-sm"><option value="newest">Newest</option><option value="low">Price: low to high</option><option value="high">Price: high to low</option></select></div>{filtersOpen && <div className="flex flex-wrap gap-3 border-b hairline py-5"><FilterSelect label="Category" value={category} onChange={setCategory} options={categories}/><FilterSelect label="Condition" value={condition} onChange={setCondition} options={["Like New","Excellent","Good","Fair"]}/>{(category||condition||search) && <button onClick={()=>{setCategory("");setCondition("");setSearch("")}} className="flex items-center gap-1 text-xs underline"><X size={14}/> Clear all</button>}</div>}<div className="flex items-center justify-between py-7 text-xs uppercase tracking-wider opacity-60"><span>{filtered.length} pieces</span><span>Prices in PHP</span></div>{filtered.length ? <div className="grid grid-cols-2 gap-x-3 gap-y-12 md:grid-cols-3 lg:grid-cols-4 md:gap-x-5">{filtered.map((item, index)=><ProductCard key={item.id} item={item} priority={index<4}/>)}</div> : <div className="grid min-h-96 place-items-center text-center"><div><p className="text-2xl font-semibold">Nothing matches that edit.</p><button onClick={()=>{setCategory("");setCondition("");setSearch("")}} className="mt-4 border-b border-black pb-1 text-sm">Reset filters</button></div></div>}</main>;
}

function FilterSelect({label,value,onChange,options}:{label:string;value:string;onChange:(v:string)=>void;options:string[]}) { return <label className="text-xs"><span className="mr-2 opacity-50">{label}</span><select value={value} onChange={(e)=>onChange(e.target.value)} className="bg-transparent font-medium"><option value="">All</option>{options.map(o=><option key={o}>{o}</option>)}</select></label> }
