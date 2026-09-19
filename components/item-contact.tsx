"use client";

import Link from "next/link";
import { useState } from "react";
import { MessageSquare, Send } from "lucide-react";

export function ItemContact({ itemId, signedIn }: { itemId: string; signedIn: boolean }) {
  const [open, setOpen] = useState(false); const [body, setBody] = useState(""); const [message, setMessage] = useState(""); const [sending, setSending] = useState(false);
  if (!signedIn) return <Link href="/account" className="mt-3 flex w-full items-center justify-center gap-2 border hairline py-4 text-sm font-medium hover:bg-white"><MessageSquare size={17}/> Sign in to ask about this piece</Link>;
  return <div className="mt-3 border hairline"><button onClick={() => setOpen(value => !value)} className="flex w-full items-center justify-center gap-2 py-4 text-sm font-medium hover:bg-white"><MessageSquare size={17}/>{open ? "Close message" : "Ask about this piece"}</button>{open&&<form className="border-t hairline p-4" onSubmit={async event=>{event.preventDefault();setSending(true);setMessage("");const response=await fetch("/api/messages",{method:"POST",headers:{"content-type":"application/json"},body:JSON.stringify({itemId,body})});const data=await response.json();setSending(false);if(response.ok){setBody("");setMessage("Message sent. View the conversation in your account.");}else setMessage(data.error)}}><label className="text-xs font-medium">Your message<textarea value={body} onChange={event=>setBody(event.target.value)} required maxLength={2000} rows={4} placeholder="Ask about fit, condition, delivery, or anything else." className="mt-2 w-full resize-none border hairline bg-transparent p-3 text-sm leading-6"/></label><button disabled={sending} className="mt-3 inline-flex items-center gap-2 bg-[var(--ink)] px-4 py-3 text-sm text-white disabled:opacity-50"><Send size={15}/>{sending?"Sending…":"Send message"}</button>{message&&<p className="mt-3 text-xs leading-5">{message}</p>}</form>}</div>;
}
