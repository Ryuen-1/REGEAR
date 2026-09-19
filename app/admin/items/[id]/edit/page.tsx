import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { AdminItemForm } from "@/components/admin-item-form";
import type { Item } from "@/lib/types";

export default async function EditItemPage({params}:{params:Promise<{id:string}>}){const supabase=await createClient();const {data:item}=await supabase.from("items").select("*").eq("id",(await params).id).single();if(!item)notFound();return <main className="admin-page"><div className="admin-container"><header className="admin-page-header admin-reveal"><div className="admin-page-copy"><p className="eyebrow">Catalog manager</p><h1 className="display admin-page-title">Edit product.</h1><p className="admin-page-subtitle">Refine product information, replace imagery, and keep the storefront accurate.</p></div></header><AdminItemForm item={item as Item}/></div></main>}
