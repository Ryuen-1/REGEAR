import { NextResponse } from "next/server";
import { z } from "zod";
import { createClient } from "@/lib/supabase/server";

const messageSchema = z.object({ body: z.string().trim().min(1).max(2000), itemId: z.string().uuid().optional(), conversationId: z.string().uuid().optional() }).refine(value => value.itemId || value.conversationId, "A conversation or item is required.");

export async function POST(request: Request) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Sign in to send a message." }, { status: 401 });
  const parsed = messageSchema.safeParse(await request.json());
  if (!parsed.success) return NextResponse.json({ error: "Write a message before sending." }, { status: 400 });
  let conversationId = parsed.data.conversationId;
  if (!conversationId && parsed.data.itemId) {
    const { data: existing } = await supabase.from("conversations").select("id").eq("item_id", parsed.data.itemId).eq("customer_id", user.id).maybeSingle();
    conversationId = existing?.id;
    if (!conversationId) {
      const { data: created, error } = await supabase.from("conversations").insert({ item_id: parsed.data.itemId, customer_id: user.id }).select("id").single();
      if (error) return NextResponse.json({ error: error.message }, { status: 403 });
      conversationId = created.id;
    }
  }
  const { error } = await supabase.from("messages").insert({ conversation_id: conversationId, sender_id: user.id, body: parsed.data.body });
  if (error) return NextResponse.json({ error: error.message }, { status: 403 });
  await supabase.from("conversations").update({ updated_at: new Date().toISOString() }).eq("id", conversationId!);
  return NextResponse.json({ sent: true, conversationId });
}
