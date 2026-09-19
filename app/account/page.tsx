import Link from "next/link";
import { redirect } from "next/navigation";
import { AuthForm } from "@/components/auth-form";
import { hasSupabaseEnv } from "@/lib/supabase/env";
import { createClient } from "@/lib/supabase/server";
import { signOut } from "@/app/auth/actions";

export default async function AccountPage({searchParams}:{searchParams:Promise<{error?:string;message?:string}>}) {
  const params=await searchParams;
  if(!hasSupabaseEnv) return <main className="min-h-[80vh] px-5 py-20"><AuthForm error="Add your Supabase publishable key to .env.local to enable authentication."/></main>;
  const supabase=await createClient();
  const {data:{user}}=await supabase.auth.getUser();
  if(!user) return <main className="min-h-[80vh] px-5 py-20"><AuthForm {...params}/></main>;
  const {data:profile}=await supabase.from("profiles").select("is_admin").eq("id",user.id).single();
  if(profile?.is_admin) redirect("/admin");
  return <main className="mx-auto min-h-[80vh] max-w-5xl px-5 py-20"><p className="eyebrow">Signed in as {user.email}</p><h1 className="display mt-4 text-7xl">Your corner.</h1><div className="mt-12 grid gap-px bg-black/15 md:grid-cols-2"><Link href="/orders" className="bg-[var(--paper)] p-8 text-3xl font-semibold hover:bg-[var(--acid)]">Order history</Link><Link href="/favorites" className="bg-[var(--paper)] p-8 text-3xl font-semibold hover:bg-[var(--acid)]">Saved pieces</Link><Link href="/messages" className="bg-[var(--paper)] p-8 text-3xl font-semibold hover:bg-[var(--acid)] md:col-span-2">Messages</Link></div><form action={signOut}><button className="mt-8 text-sm underline">Sign out</button></form></main>;
}
