"use client";

import Image from "next/image";
import Link from "next/link";
import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import { ArrowRight, Clock3, X } from "lucide-react";
import type { Item } from "@/lib/types";
import { formatPrice } from "@/lib/demo-data";

type CartEntry = { item: Item; token: string; expiresAt: string };
type CartContextValue = { cart: CartEntry | null; count: number; add: (item: Item) => Promise<void>; remove: () => Promise<void>; openCart: () => void };
const CartContext = createContext<CartContextValue | null>(null);

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [cart, setCart] = useState<CartEntry | null>(null);
  const [open, setOpen] = useState(false);
  useEffect(() => { const saved = localStorage.getItem("regear-cart"); if (saved) { try { setCart(JSON.parse(saved)); } catch {} } }, []);
  useEffect(() => { if (cart) localStorage.setItem("regear-cart", JSON.stringify(cart)); else localStorage.removeItem("regear-cart"); }, [cart]);

  const add = useCallback(async (item: Item) => {
    if (cart?.item.id === item.id) { setOpen(true); return; }
    if (cart) await fetch("/api/reservations", { method: "DELETE", headers: { "content-type": "application/json" }, body: JSON.stringify({ itemId: cart.item.id, token: cart.token }) });
    const token = crypto.randomUUID();
    const response = await fetch("/api/reservations", { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ itemId: item.id, token }) });
    const payload = await response.json();
    if (!response.ok) throw new Error(payload.error ?? "This piece is no longer available.");
    setCart({ item, token, expiresAt: payload.expiresAt }); setOpen(true);
  }, [cart]);

  const remove = useCallback(async () => {
    if (cart) await fetch("/api/reservations", { method: "DELETE", headers: { "content-type": "application/json" }, body: JSON.stringify({ itemId: cart.item.id, token: cart.token }) });
    setCart(null);
  }, [cart]);

  const value = useMemo(() => ({ cart, count: cart ? 1 : 0, add, remove, openCart: () => setOpen(true) }), [cart, add, remove]);
  return <CartContext.Provider value={value}>{children}{open && <><button className="fixed inset-0 z-40 bg-black/35" onClick={() => setOpen(false)} aria-label="Close cart" /><aside className="fixed right-0 top-0 z-50 flex h-full w-full max-w-md flex-col bg-[var(--paper)] p-6 shadow-2xl"><div className="flex items-center justify-between border-b hairline pb-5"><h2 className="text-2xl font-semibold tracking-tight">Your hold</h2><button onClick={() => setOpen(false)} aria-label="Close cart"><X /></button></div>{cart ? <><div className="mt-6 flex gap-4"><div className="relative h-36 w-28 shrink-0 overflow-hidden bg-black/5"><Image src={cart.item.images[0]} alt="" fill className="object-cover" /></div><div><p className="font-semibold">{cart.item.title}</p><p className="mt-1 text-sm opacity-60">{cart.item.condition}{cart.item.size ? ` · ${cart.item.size}` : ""}</p><p className="mt-4 font-mono">{formatPrice(cart.item.price)}</p><button className="mt-3 text-xs underline underline-offset-4" onClick={remove}>Release item</button></div></div><div className="mt-6 flex items-center gap-2 border-y hairline py-4 text-sm"><Clock3 size={17}/><span>Reserved for 15 minutes while you checkout.</span></div><Link href="/checkout" onClick={() => setOpen(false)} className="mt-auto flex items-center justify-between bg-[var(--ink)] px-5 py-4 text-white">Checkout securely <ArrowRight size={19}/></Link></> : <div className="grid flex-1 place-items-center text-center"><div><ShoppingBagIcon /><p className="mt-5 text-xl font-semibold">Your bag is empty</p><p className="mt-2 text-sm opacity-60">Every piece is one of one. Don’t wait too long.</p><Link href="/shop" onClick={() => setOpen(false)} className="mt-6 inline-block border-b border-black pb-1 text-sm">Explore the edit</Link></div></div>}</aside></>}</CartContext.Provider>;
}

function ShoppingBagIcon() { return <div className="mx-auto grid size-20 place-items-center rounded-full border hairline"><span className="text-3xl">0</span></div>; }
export function useCart() { const value = useContext(CartContext); if (!value) throw new Error("useCart must be inside CartProvider"); return value; }
