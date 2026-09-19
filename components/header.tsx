"use client";

import Link from "next/link";
import { Heart, Menu, Search, ShoppingBag, UserRound, X } from "lucide-react";
import { useState } from "react";
import { useCart } from "@/components/cart-provider";

export function Header() {
  const [open, setOpen] = useState(false);
  const { count, openCart } = useCart();
  return (
    <header className="sticky top-0 z-40 border-b hairline bg-[rgba(242,240,233,.9)] backdrop-blur-xl">
      <div className="mx-auto flex h-16 max-w-[1600px] items-center justify-between px-4 md:px-8">
        <button className="md:hidden" onClick={() => setOpen(!open)} aria-label="Toggle menu">{open ? <X /> : <Menu />}</button>
        <nav className="hidden items-center gap-7 text-sm font-medium md:flex">
          <Link href="/shop">Shop all</Link><Link href="/shop?category=Jackets">Jackets</Link><Link href="/shop?category=Accessories">Accessories</Link>
        </nav>
        <Link href="/" className="absolute left-1/2 -translate-x-1/2 text-xl font-black tracking-[-.08em]">REGEAR</Link>
        <div className="flex items-center gap-4">
          <Link href="/shop" aria-label="Search"><Search size={19} /></Link>
          <Link href="/favorites" className="hidden sm:block" aria-label="Favorites"><Heart size={19} /></Link>
          <Link href="/account" className="hidden sm:block" aria-label="Account"><UserRound size={19} /></Link>
          <button onClick={openCart} className="relative" aria-label={`Cart with ${count} item`}><ShoppingBag size={20} /><span className="absolute -right-2 -top-2 grid size-4 place-items-center rounded-full bg-[var(--ink)] text-[9px] text-white">{count}</span></button>
        </div>
      </div>
      {open && <nav className="grid gap-4 border-t hairline px-5 py-6 text-2xl font-semibold md:hidden"><Link onClick={() => setOpen(false)} href="/shop">Shop all</Link><Link onClick={() => setOpen(false)} href="/shop?category=Jackets">Jackets</Link><Link onClick={() => setOpen(false)} href="/shop?category=Accessories">Accessories</Link><Link onClick={() => setOpen(false)} href="/account">Account</Link></nav>}
    </header>
  );
}
