"use client";

import { useState } from "react";
import { ArrowRight, LoaderCircle } from "lucide-react";
import { useCart } from "@/components/cart-provider";
import type { Item } from "@/lib/types";

export function AddToCart({ item }: { item: Item }) {
  const { add } = useCart(); const [loading,setLoading]=useState(false); const [error,setError]=useState("");
  const unavailable = item.status !== "available";
  return <div><button disabled={unavailable||loading} onClick={async()=>{setLoading(true);setError("");try{await add(item)}catch(e){setError(e instanceof Error?e.message:"Unable to reserve item") }finally{setLoading(false)}}} className="flex w-full items-center justify-between bg-[var(--ink)] px-5 py-4 text-white disabled:cursor-not-allowed disabled:opacity-40"><span>{unavailable ? item.status === "reserved" ? "Someone is checking out" : "This piece has sold" : "Reserve & add to bag"}</span>{loading?<LoaderCircle className="animate-spin" size={19}/>:<ArrowRight size={19}/>}</button>{error&&<p className="mt-3 text-sm text-red-700">{error}</p>}</div>;
}
