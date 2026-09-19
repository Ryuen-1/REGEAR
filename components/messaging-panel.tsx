"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowUpRight, MessageSquare, Send } from "lucide-react";

export interface ConversationView {
  id: string;
  customer_id: string;
  updated_at: string;
  items: { title: string; slug: string } | null;
  messages: { id: number; body: string; sender_id: string; created_at: string }[];
}

export function MessagingPanel({ conversations, currentUserId, admin = false }: { conversations: ConversationView[]; currentUserId: string; admin?: boolean }) {
  const router = useRouter();
  const [selectedId, setSelectedId] = useState(conversations[0]?.id ?? "");
  const [body, setBody] = useState("");
  const [sending, setSending] = useState(false);
  const [error, setError] = useState("");
  const selected = useMemo(() => conversations.find(conversation => conversation.id === selectedId) ?? conversations[0], [conversations, selectedId]);
  if (!conversations.length) return <div className={`${admin?"admin-panel admin-section":"mt-12 border hairline"} px-6 py-24 text-center`}><MessageSquare className="mx-auto opacity-25" size={38}/><p className="mt-6 text-2xl font-semibold">No conversations yet.</p><p className="mt-2 text-sm opacity-55">Messages about individual pieces will appear here.</p></div>;
  return <div className={`${admin?"admin-panel admin-section":"mt-12 border hairline"} grid min-h-[650px] overflow-hidden lg:grid-cols-[360px_1fr]`}>
    <aside className="border-b hairline lg:border-b-0 lg:border-r"><div className="border-b hairline px-5 py-4 text-[10px] uppercase tracking-[.16em] opacity-50">Conversations</div>{conversations.map(conversation=><button key={conversation.id} onClick={()=>setSelectedId(conversation.id)} className={`w-full border-b hairline p-5 text-left transition-colors ${selected?.id===conversation.id?"bg-[var(--acid)]":"hover:bg-white"}`}><p className="font-semibold">{conversation.items?.title ?? "Removed item"}</p><p className="mt-2 line-clamp-1 text-xs opacity-55">{conversation.messages.at(-1)?.body ?? "Conversation started"}</p><p className="mt-3 text-[10px] uppercase tracking-[.12em] opacity-45">{admin?`Customer ${conversation.customer_id.slice(0,8)}`:new Date(conversation.updated_at).toLocaleDateString()}</p></button>)}</aside>
    {selected&&<section className="flex min-h-[580px] flex-col"><header className="flex items-center justify-between border-b hairline bg-white/35 px-6 py-5"><div><p className="text-lg font-semibold">{selected.items?.title ?? "Removed item"}</p>{admin&&<p className="text-xs opacity-50">Customer {selected.customer_id.slice(0,8)}</p>}</div>{selected.items&&<Link href={`/item/${selected.items.slug}`} className="inline-flex items-center gap-1 text-xs underline underline-offset-4">View piece <ArrowUpRight size={13}/></Link>}</header><div className="flex-1 space-y-5 overflow-y-auto p-5 md:p-8">{selected.messages.map(message=>{const own=message.sender_id===currentUserId;return <div key={message.id} className={`max-w-[78%] ${own?"ml-auto":""}`}><div className={`${own?"bg-[var(--ink)] text-white":"bg-white shadow-sm"} p-4 text-sm leading-6`}>{message.body}</div><p className={`mt-1 text-[10px] opacity-40 ${own?"text-right":""}`}>{own?"You":admin?"Customer":"REGEAR"} · {new Date(message.created_at).toLocaleString()}</p></div>})}</div><form className="border-t hairline bg-white/30 p-4" onSubmit={async event=>{event.preventDefault();if(!selected)return;setSending(true);setError("");const response=await fetch("/api/messages",{method:"POST",headers:{"content-type":"application/json"},body:JSON.stringify({conversationId:selected.id,body})});const data=await response.json();setSending(false);if(response.ok){setBody("");router.refresh();}else setError(data.error)}}><div className="flex gap-2"><textarea aria-label="Reply" value={body} onChange={event=>setBody(event.target.value)} rows={2} required maxLength={2000} placeholder="Write a reply…" className="admin-field min-h-14 flex-1 resize-none p-3 text-sm"/><button disabled={sending} className="grid w-14 place-items-center bg-[var(--ink)] text-white transition-colors hover:bg-[var(--rust)] disabled:opacity-50" aria-label="Send reply"><Send size={18}/></button></div>{error&&<p className="mt-2 text-xs text-[var(--rust)]">{error}</p>}</form></section>}
  </div>;
}
