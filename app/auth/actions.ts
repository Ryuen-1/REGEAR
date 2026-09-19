"use server";

import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

export async function signIn(formData:FormData){const supabase=await createClient();const {error}=await supabase.auth.signInWithPassword({email:String(formData.get("email")),password:String(formData.get("password"))});if(error)redirect(`/account?error=${encodeURIComponent(error.message)}`);redirect("/account")}
export async function signUp(formData:FormData){const supabase=await createClient();const {error}=await supabase.auth.signUp({email:String(formData.get("email")),password:String(formData.get("password")),options:{data:{display_name:String(formData.get("name"))}}});if(error)redirect(`/account?error=${encodeURIComponent(error.message)}`);redirect("/account?message=Check your email to confirm your account.")}
export async function signOut(){const supabase=await createClient();await supabase.auth.signOut();redirect("/")}
