"use client";

import Image from "next/image";
import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { ImagePlus, LoaderCircle, Trash2 } from "lucide-react";
import type { Item } from "@/lib/types";

export function AdminItemForm({ item }: { item?: Item }) {
  const router = useRouter();
  const [title, setTitle] = useState(item?.title ?? "");
  const [slug, setSlug] = useState(item?.slug ?? "");
  const [slugEdited, setSlugEdited] = useState(Boolean(item));
  const [files, setFiles] = useState<File[]>([]);
  const [message, setMessage] = useState("");
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const previews = useMemo(() => files.map(file => ({ name: file.name, url: URL.createObjectURL(file) })), [files]);

  function updateTitle(value: string) {
    setTitle(value);
    if (!slugEdited) setSlug(value.toLowerCase().trim().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, ""));
  }

  return <form onSubmit={async event => {
    event.preventDefault(); setSaving(true); setMessage("");
    const response = await fetch(item ? `/api/admin/items/${item.id}` : "/api/admin/items", { method: item ? "PUT" : "POST", body: new FormData(event.currentTarget) });
    const data = await response.json(); setSaving(false);
    if (response.ok) { router.push("/admin/items"); router.refresh(); } else setMessage(data.error);
  }} className="admin-stack admin-section grid gap-8 lg:grid-cols-[minmax(0,1fr)_380px]">
    <div className="admin-panel grid gap-7 p-6 shadow-[0_20px_70px_rgba(23,25,21,.06)] md:p-8">
      <div className="grid gap-5 border-t hairline pt-6 md:grid-cols-2"><Field name="title" label="Product name" value={title} onChange={updateTitle}/><Field name="slug" label="Storefront URL" value={slug} onChange={value=>{setSlugEdited(true);setSlug(value)}} hint="Lowercase letters, numbers, and hyphens"/></div>
      <label className="grid gap-2 text-xs font-medium">Description<textarea defaultValue={item?.description} required name="description" rows={7} placeholder="Describe the material, fit, details, and condition." className="admin-field p-4 text-base leading-7"/></label>
      <div className="grid gap-5 md:grid-cols-2"><label className="grid gap-2 text-xs font-medium">Category<select name="category" defaultValue={item?.category ?? "Jackets"} className="admin-field p-4 text-base">{["Jackets","Shirts","Knitwear","Bottoms","Footwear","Accessories","Objects"].map(category=><option key={category}>{category}</option>)}</select></label><Field name="size" label="Size" value={item?.size ?? ""} required={false} placeholder="M, 30, OS, EU 42"/></div>
      <div className="grid gap-5 md:grid-cols-2"><Field name="price" label="Price in PHP" type="number" value={item ? String(item.price) : ""} min="1" step="0.01"/><label className="grid gap-2 text-xs font-medium">Condition<select name="condition" defaultValue={item?.condition ?? "Excellent"} className="admin-field p-4 text-base">{["Like New","Excellent","Good","Fair"].map(condition=><option key={condition}>{condition}</option>)}</select></label></div>
      <label className="group grid min-h-64 cursor-pointer place-items-center border border-dashed border-black/30 bg-white/20 p-8 text-center transition-all duration-500 hover:border-black hover:bg-white/70"><input required={!item} multiple name="images" type="file" accept="image/jpeg,image/png,image/webp,image/avif" className="sr-only" onChange={event=>setFiles(Array.from(event.target.files ?? []))}/><span><ImagePlus className="mx-auto transition-transform duration-500 group-hover:scale-110" size={32}/><b className="mt-4 block text-base">{files.length ? `${files.length} photo${files.length===1?"":"s"} selected` : item ? "Upload replacement photos" : "Upload product photos"}</b><span className="mt-2 block text-xs opacity-50">JPEG, PNG, WebP, or AVIF · 10 MB maximum each</span></span></label>
      {(previews.length>0||Boolean(item?.images.length))&&<div className="grid grid-cols-3 gap-2 md:grid-cols-5">{(previews.length?previews:item!.images.map((url,index)=>({name:`Existing photo ${index+1}`,url}))).map(preview=><div key={preview.url} className="relative aspect-[4/5] overflow-hidden bg-[#dedbd1]"><Image src={preview.url} alt={preview.name} fill unoptimized={previews.length>0} className="object-cover"/></div>)}</div>}
    </div>
    <aside className="h-fit bg-[var(--ink)] p-8 text-white lg:sticky lg:top-36"><p className="eyebrow text-white/45">Storefront visibility</p><h2 className="mt-5 text-3xl font-semibold">{item ? "Update product" : "Publish product"}</h2><p className="mt-4 text-sm leading-7 text-white/50">{item ? "Changes appear in the customer catalog immediately after saving." : "Once published, customers can find this product, add it to their cart, and buy it."}</p><button disabled={saving||deleting} className="mt-8 flex min-h-12 w-full items-center justify-center gap-2 bg-[var(--acid)] px-5 text-sm font-semibold text-[var(--ink)] transition-colors hover:bg-white disabled:opacity-50">{saving&&<LoaderCircle className="animate-spin" size={17}/>} {saving?"Saving…":item?"Save product":"Publish product"}</button>{item&&<button type="button" disabled={saving||deleting} onClick={async()=>{if(!confirm(`Delete ${item.title}? This cannot be undone.`))return;setDeleting(true);setMessage("");const response=await fetch(`/api/admin/items/${item.id}`,{method:"DELETE"});const data=await response.json();if(response.ok){router.push("/admin/items");router.refresh()}else{setDeleting(false);setMessage(data.error)}}} className="mt-3 flex min-h-12 w-full items-center justify-center gap-2 border border-white/20 px-5 text-sm text-white/65 transition-colors hover:border-[var(--rust)] hover:text-white disabled:opacity-50"><Trash2 size={16}/>{deleting?"Deleting…":"Delete product"}</button>}{message&&<p className="mt-4 text-sm leading-5 text-[#ff9b7d]">{message}</p>}</aside>
  </form>;
}

function Field({name,label,type="text",value,onChange,hint,required=true,placeholder,min,step}:{name:string;label:string;type?:string;value?:string;onChange?:(value:string)=>void;hint?:string;required?:boolean;placeholder?:string;min?:string;step?:string}) {
  return <label className="grid gap-2 text-xs font-medium">{label}<input required={required} name={name} type={type} value={onChange?value:undefined} defaultValue={onChange?undefined:value} onChange={onChange?event=>onChange(event.target.value):undefined} placeholder={placeholder} min={min} step={step} className="admin-field p-4 text-base"/>{hint&&<span className="font-normal opacity-45">{hint}</span>}</label>;
}
