"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Boxes, LayoutDashboard, MessageSquare, Settings, Store } from "lucide-react";
import { AdminMotion } from "@/components/admin-motion";

const links = [
  { href: "/admin", label: "Dashboard", icon: LayoutDashboard, exact: true },
  { href: "/admin/items", label: "Products", icon: Boxes },
  { href: "/admin/messages", label: "Messages", icon: MessageSquare },
  { href: "/admin/settings", label: "Settings", icon: Settings },
];

export function AdminShell({ children, email }: { children: React.ReactNode; email: string }) {
  const pathname = usePathname();
  return <div className="admin-world min-h-screen overflow-x-hidden">
    <header className="relative z-30 border-b hairline bg-[rgba(242,240,233,.94)] backdrop-blur-xl">
      <div className="mx-auto flex h-16 max-w-[1600px] items-center justify-between px-4 md:px-8">
        <div className="flex items-center gap-3"><span className="grid size-9 place-items-center bg-[var(--ink)] text-white"><Store size={16}/></span><div><p className="text-sm font-bold tracking-[-.02em]">REGEAR Admin</p><p className="hidden text-[10px] opacity-45 sm:block">{email}</p></div></div>
        <nav className="flex items-center gap-1 overflow-x-auto" aria-label="Admin navigation">{links.map(({href,label,icon:Icon,exact})=>{const active=exact?pathname===href:pathname.startsWith(href);return <Link key={href} href={href} className={`group flex min-h-10 items-center gap-2 px-3 text-xs font-medium transition-colors md:px-4 ${active?"bg-[var(--acid)] text-[var(--ink)]":"opacity-55 hover:bg-white hover:opacity-100"}`}><Icon size={15} className="transition-transform duration-300 group-hover:scale-110"/><span className="hidden sm:inline">{label}</span></Link>})}</nav>
      </div>
    </header>
    <AdminMotion>{children}</AdminMotion>
  </div>;
}
