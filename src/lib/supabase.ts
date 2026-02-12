import { createClient } from "@supabase/supabase-js";

// Validate environment variables
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || supabaseUrl.trim() === "") {
  throw new Error(
    "Missing NEXT_PUBLIC_SUPABASE_URL environment variable. " +
      "Please set it in your .env.local file or deployment platform.",
  );
}

if (!supabaseAnonKey || supabaseAnonKey.trim() === "") {
  throw new Error(
    "Missing NEXT_PUBLIC_SUPABASE_ANON_KEY environment variable. " +
      "Please set it in your .env.local file or deployment platform.",
  );
}

// Log environment variable status (without exposing the actual keys)
console.log("Supabase Configuration:", {
  url: supabaseUrl,
  keyPrefix: supabaseAnonKey.substring(0, 20) + "...",
  keyLength: supabaseAnonKey.length,
});

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Types for our database
export type Category = {
  id: string;
  name: string;
  created_at: string;
};

export type MenuItem = {
  id: string;
  name: string;
  description: string | null;
  price: number;
  category_id: string | null;
  image_url: string | null;
  is_available: boolean;
  created_at: string;
  updated_at: string;
  category?: Category;
};

export type Order = {
  id: string;
  customer_name: string | null;
  customer_email: string | null;
  customer_phone: string | null;
  delivery_address: string | null;
  status: string;
  total_amount: number;
  notes: string | null;
  created_at: string;
  updated_at: string;
};

export type OrderItem = {
  id: string;
  order_id: string;
  menu_item_id: string | null;
  item_name: string;
  item_price: number;
  quantity: number;
  created_at: string;
};
