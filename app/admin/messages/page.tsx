import { createClient } from "@/lib/supabase/server";
import { MessagingPanel, type ConversationView } from "@/components/messaging-panel";

export default async function AdminMessagesPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  const { data } = await supabase.from("conversations").select("id,customer_id,updated_at,items(title,slug),messages(id,body,sender_id,created_at)").order("updated_at", { ascending: false }).order("created_at", { referencedTable: "messages", ascending: true });
  return <main className="admin-page"><div className="admin-container"><header className="admin-page-header admin-reveal"><div className="admin-page-copy"><p className="eyebrow">Customer care</p><h1 className="display admin-page-title">Messages.</h1><p className="admin-page-subtitle">Reply in context. Each conversation stays attached to the product that started it.</p></div></header><div className="admin-stack"><MessagingPanel conversations={(data ?? []) as unknown as ConversationView[]} currentUserId={user!.id} admin/></div></div></main>;
}
