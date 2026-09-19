import Link from "next/link";
import { ArrowUpRight, Boxes, MessageSquare, PackagePlus, Settings, ShoppingBag, Sparkles } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { formatPrice } from "@/lib/demo-data";

export default async function AdminPage() {
  const supabase = await createClient();
  const [{ data: items }, { data: orders }, { data: conversations }] = await Promise.all([
    supabase.from("items").select("id,status").order("created_at", { ascending: false }),
    supabase.from("orders").select("id,buyer_name,total_price,payment_status,created_at").order("created_at", { ascending: false }).limit(6),
    supabase.from("conversations").select("id").order("updated_at", { ascending: false }),
  ]);
  const revenue = orders?.filter(order => order.payment_status === "paid").reduce((sum, order) => sum + Number(order.total_price), 0) ?? 0;
  const available = items?.filter(item => item.status === "available").length ?? 0;
  const sold = items?.filter(item => item.status === "sold").length ?? 0;

  return <main className="admin-page">
    <div className="admin-container">
      <header className="admin-page-header admin-reveal">
        <div className="admin-page-copy"><p className="eyebrow">Store overview</p><h1 className="display admin-page-title">Admin dashboard.</h1><p className="admin-page-subtitle">Manage inventory, customer conversations, and store activity from one focused workspace.</p></div>
        <Link href="/admin/items/new" className="admin-button"><PackagePlus size={17}/> Add product</Link>
      </header>

      <section className="admin-section grid grid-flow-dense gap-px bg-black/15 md:grid-cols-12">
        <div className="admin-stack flex min-h-80 flex-col justify-between bg-[var(--ink)] p-8 text-white md:col-span-7 md:p-10"><Sparkles size={24}/><div><p className="text-sm text-white/45">Paid revenue</p><p className="display mt-4 text-[clamp(3.5rem,6vw,6.25rem)]">{formatPrice(revenue)}</p></div></div>
        <div className="admin-stack flex min-h-80 flex-col justify-between bg-[var(--acid)] p-8 md:col-span-5 md:p-10"><p className="eyebrow">Store pulse</p><div className="grid grid-cols-3 gap-5 border-t border-black/20 pt-6"><Metric value={items?.length ?? 0} label="Products"/><Metric value={available} label="Available"/><Metric value={sold} label="Sold"/></div></div>
        <Module href="/admin/items" icon={<Boxes/>} title="Products" description="Add, edit, price, and publish inventory."/>
        <Module href="/admin/messages" icon={<MessageSquare/>} title="Messages" description={`${conversations?.length ?? 0} customer conversations.`}/>
        <Module href="/admin/settings" icon={<Settings/>} title="Settings" description="Storefront and administrator controls."/>
      </section>

      <section className="admin-section"><div className="admin-reveal flex items-end justify-between"><div><p className="eyebrow">Latest activity</p><h2 className="display mt-3 text-5xl md:text-7xl">Orders</h2></div><ShoppingBag className="opacity-25" size={30}/></div><div className="admin-panel mt-8 overflow-x-auto px-6"><table className="w-full min-w-[680px] text-left text-sm"><thead className="border-b hairline text-[10px] uppercase tracking-[.15em] opacity-50"><tr><th className="py-5">Buyer</th><th>Status</th><th>Total</th><th>Date</th></tr></thead><tbody>{orders?.map(order=><tr key={order.id} className="admin-row border-b hairline"><td className="py-6 font-medium">{order.buyer_name}</td><td className="uppercase tracking-[.1em]">{order.payment_status}</td><td className="font-mono">{formatPrice(Number(order.total_price))}</td><td>{new Date(order.created_at).toLocaleDateString()}</td></tr>)}</tbody></table>{!orders?.length&&<p className="py-14 text-sm opacity-50">No orders yet.</p>}</div></section>
    </div>
  </main>;
}

function Metric({value,label}:{value:number;label:string}){return <div><p className="text-4xl font-semibold">{value}</p><p className="mt-2 text-xs opacity-55">{label}</p></div>}
function Module({href,icon,title,description}:{href:string;icon:React.ReactNode;title:string;description:string}){return <Link href={href} className="admin-stack group flex min-h-52 flex-col justify-between bg-[var(--admin-surface)] p-8 md:col-span-4"><div className="flex items-start justify-between">{icon}<ArrowUpRight className="transition-transform duration-300 group-hover:-translate-y-1 group-hover:translate-x-1"/></div><div><p className="text-2xl font-semibold">{title}</p><p className="mt-2 text-sm opacity-50">{description}</p></div></Link>}
