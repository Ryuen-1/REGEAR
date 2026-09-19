import { NextResponse } from "next/server";
import { z } from "zod";
import { createClient } from "@/lib/supabase/server";
import { parseProduct, productFiles, storagePathFromPublicUrl, validateFiles } from "@/lib/admin-products";

const updateSchema = z.object({ status: z.enum(["available", "reserved", "sold"]) });

async function adminClient() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return null;
  const { data: profile } = await supabase.from("profiles").select("is_admin").eq("id", user.id).single();
  return profile?.is_admin ? supabase : null;
}

export async function PATCH(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const supabase = await adminClient();
  if (!supabase) return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  const parsed = updateSchema.safeParse(await request.json());
  if (!parsed.success) return NextResponse.json({ error: "Invalid status" }, { status: 400 });
  const values = parsed.data.status === "reserved" ? { status: parsed.data.status, reserved_until: new Date(Date.now() + 15 * 60_000).toISOString(), reservation_token: crypto.randomUUID() } : { status: parsed.data.status, reserved_until: null, reserved_by: null, reservation_token: null };
  const { error } = await supabase.from("items").update(values).eq("id", (await params).id);
  if (error) return NextResponse.json({ error: error.message }, { status: 400 });
  return NextResponse.json({ updated: true });
}

export async function PUT(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const supabase = await adminClient();
  if (!supabase) return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  const id = (await params).id;
  const form = await request.formData();
  const parsed = parseProduct(form);
  if (!parsed.success) return NextResponse.json({ error: parsed.error.issues[0]?.message ?? "Check the product details." }, { status: 400 });
  const files = productFiles(form);
  const fileError = validateFiles(files);
  if (fileError) return NextResponse.json({ error: fileError }, { status: 400 });
  const { data: current, error: currentError } = await supabase.from("items").select("images").eq("id", id).single();
  if (currentError) return NextResponse.json({ error: currentError.message }, { status: 404 });
  let images = current.images as string[];
  if (files.length) {
    const uploaded: string[] = [];
    for (const file of files) {
      const path = `${crypto.randomUUID()}-${file.name.replace(/[^a-zA-Z0-9.-]/g, "-")}`;
      const { error } = await supabase.storage.from("item-images").upload(path, file, { contentType: file.type, upsert: false });
      if (error) return NextResponse.json({ error: error.message }, { status: 400 });
      uploaded.push(supabase.storage.from("item-images").getPublicUrl(path).data.publicUrl);
    }
    images = uploaded;
  }
  const { error } = await supabase.from("items").update({ ...parsed.data, size: parsed.data.size || null, images }).eq("id", id);
  if (error) return NextResponse.json({ error: error.message }, { status: 400 });
  if (files.length) {
    const oldPaths = (current.images as string[]).map(storagePathFromPublicUrl).filter((path): path is string => Boolean(path));
    if (oldPaths.length) await supabase.storage.from("item-images").remove(oldPaths);
  }
  return NextResponse.json({ updated: true });
}

export async function DELETE(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  const supabase = await adminClient();
  if (!supabase) return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  const id = (await params).id;
  const { data: item } = await supabase.from("items").select("images").eq("id", id).single();
  const { error } = await supabase.from("items").delete().eq("id", id);
  if (error) return NextResponse.json({ error: error.code === "23503" ? "Products with orders cannot be deleted. Mark it sold instead." : error.message }, { status: 400 });
  const paths = ((item?.images ?? []) as string[]).map(storagePathFromPublicUrl).filter((path): path is string => Boolean(path));
  if (paths.length) await supabase.storage.from("item-images").remove(paths);
  return NextResponse.json({ deleted: true });
}
