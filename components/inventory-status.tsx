"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import type { ItemStatus } from "@/lib/types";

export function InventoryStatus({ id, initialStatus }: { id: string; initialStatus: ItemStatus }) {
  const router = useRouter();
  const [status, setStatus] = useState(initialStatus);
  const [saving, setSaving] = useState(false);
  return <select aria-label="Item status" value={status} disabled={saving} onChange={async event => {
    const next = event.target.value as ItemStatus;
    setStatus(next); setSaving(true);
    const response = await fetch(`/api/admin/items/${id}`, { method: "PATCH", headers: { "content-type": "application/json" }, body: JSON.stringify({ status: next }) });
    if (!response.ok) setStatus(initialStatus);
    setSaving(false); router.refresh();
  }} className="admin-field h-10 min-h-10 bg-white px-3 text-[10px] font-semibold uppercase tracking-[.12em] disabled:opacity-50">
    <option value="available">Available</option><option value="reserved">Reserved</option><option value="sold">Sold</option>
  </select>;
}
