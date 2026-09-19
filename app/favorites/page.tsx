import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { hasSupabaseEnv } from "@/lib/supabase/env";
import { ProductCard } from "@/components/product-card";
import type { Item } from "@/lib/types";
export default async function FavoritesPage(){if(!hasSupabaseEnv)redirect("/account");const supabase=await createClient();const {data:{user}}=await supabase.auth.getUser();if(!user)redirect("/account");const {data}=await supabase.from("favorites").select("items(*)").eq("user_id",user.id);const items=(data??[]).map((row)=>row.items).filter(Boolean) as unknown as Item[];return <main className="mx-auto min-h-[80vh] max-w-[1600px] px-5 py-16 md:px-8"><p className="eyebrow">Saved for later</p><h1 className="display mt-4 text-7xl">Favorites</h1>{items.length?<div className="mt-12 grid grid-cols-2 gap-4 md:grid-cols-4">{items.map(i=><ProductCard key={i.id} item={i}/>)}</div>:<p className="mt-16 opacity-55">No saved pieces yet.</p>}</main>}
