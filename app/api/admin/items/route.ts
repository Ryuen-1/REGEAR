import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { parseProduct, productFiles, validateFiles } from "@/lib/admin-products";

export async function POST(request: Request) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    const { data: profile } = await supabase.from("profiles").select("is_admin").eq("id", user.id).single();
    if (!profile?.is_admin) return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    const form = await request.formData();
    const parsed = parseProduct(form);
    if (!parsed.success) return NextResponse.json({ error: parsed.error.issues[0]?.message ?? "Check the product details." }, { status: 400 });
    const files = productFiles(form);
    if (!files.length) return NextResponse.json({ error: "Add at least one product photo." }, { status: 400 });
    const fileError = validateFiles(files);
    if (fileError) return NextResponse.json({ error: fileError }, { status: 400 });
    const urls: string[] = [];
    for (const file of files) {
      const path = `${crypto.randomUUID()}-${file.name.replace(/[^a-zA-Z0-9.-]/g, "-")}`;
      const { error } = await supabase.storage.from("item-images").upload(path, file, { contentType: file.type, upsert: false });
      if (error) throw error;
      urls.push(supabase.storage.from("item-images").getPublicUrl(path).data.publicUrl);
    }
    const { error } = await supabase.from("items").insert({ ...parsed.data, size: parsed.data.size || null, images: urls });
    if (error) throw error;
    return NextResponse.json({ created: true });
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : "Unable to create product." }, { status: 400 });
  }
}
