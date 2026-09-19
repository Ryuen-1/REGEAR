import { z } from "zod";

export const productSchema = z.object({
  title: z.string().trim().min(2).max(120),
  slug: z.string().trim().regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, "Use a lowercase URL with hyphens only."),
  description: z.string().trim().min(10).max(5000),
  category: z.string().trim().min(2).max(80),
  size: z.string().trim().max(40).optional(),
  price: z.coerce.number().positive().max(99_999_999),
  condition: z.enum(["Like New", "Excellent", "Good", "Fair"]),
});

export function parseProduct(form: FormData) {
  return productSchema.safeParse({
    title: form.get("title"), slug: form.get("slug"), description: form.get("description"),
    category: form.get("category"), size: String(form.get("size") ?? "") || undefined,
    price: form.get("price"), condition: form.get("condition"),
  });
}

export function productFiles(form: FormData) {
  return form.getAll("images").filter((value): value is File => value instanceof File && value.size > 0);
}

export function validateFiles(files: File[]) {
  const allowed = new Set(["image/jpeg", "image/png", "image/webp", "image/avif"]);
  if (files.some(file => file.size > 10_485_760)) return "Each photo must be 10 MB or smaller.";
  if (files.some(file => !allowed.has(file.type))) return "Photos must be JPEG, PNG, WebP, or AVIF.";
  return null;
}

export function storagePathFromPublicUrl(url: string) {
  const marker = "/storage/v1/object/public/item-images/";
  const index = url.indexOf(marker);
  return index < 0 ? null : decodeURIComponent(url.slice(index + marker.length));
}
