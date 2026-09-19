import { cache } from "react";
import { demoItems } from "@/lib/demo-data";
import { hasSupabaseEnv } from "@/lib/supabase/env";
import { createClient } from "@/lib/supabase/server";
import type { Item } from "@/lib/types";

export const getItems = cache(async (): Promise<Item[]> => {
  if (!hasSupabaseEnv) return demoItems;
  const supabase = await createClient();
  const { data, error } = await supabase.from("items").select("*").order("created_at", { ascending: false });
  if (error) return demoItems;
  return (data ?? []) as Item[];
});

export const getItem = cache(async (slug: string): Promise<Item | null> => {
  const items = await getItems();
  return items.find((item) => item.slug === slug) ?? null;
});
