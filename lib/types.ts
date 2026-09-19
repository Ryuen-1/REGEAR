export type ItemStatus = "available" | "reserved" | "sold";
export type ItemCondition = "Like New" | "Excellent" | "Good" | "Fair";

export interface Item {
  id: string;
  title: string;
  slug: string;
  description: string;
  category: string;
  price: number;
  condition: ItemCondition;
  size: string | null;
  images: string[];
  status: ItemStatus;
  reserved_until: string | null;
  created_at: string;
}

export interface Order {
  id: string;
  user_id: string | null;
  item_id: string;
  buyer_email: string;
  buyer_name: string;
  shipping_address: Record<string, string>;
  total_price: number;
  payment_status: "pending" | "paid" | "failed" | "refunded";
  stripe_session_id: string | null;
  created_at: string;
  items?: Pick<Item, "title" | "images" | "slug">;
}
