import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { MessagingPanel, type ConversationView } from "@/components/messaging-panel";

export default async function MessagesPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/account");
  const { data } = await supabase.from("conversations").select("id,customer_id,updated_at,items(title,slug),messages(id,body,sender_id,created_at)").order("updated_at", { ascending: false }).order("created_at", { referencedTable: "messages", ascending: true });
  return <main className="mx-auto min-h-[80vh] max-w-[1400px] px-5 py-16 md:px-8"><p className="eyebrow">Your account</p><h1 className="display mt-4 text-[clamp(4rem,8vw,8rem)]">Messages.</h1><p className="mt-5 max-w-xl text-sm leading-6 opacity-60">Every conversation stays connected to the piece you asked about.</p><MessagingPanel conversations={(data ?? []) as unknown as ConversationView[]} currentUserId={user.id}/></main>;
}
