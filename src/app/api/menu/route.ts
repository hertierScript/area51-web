import { NextResponse, NextRequest } from "next/server";
import { createClient } from "@supabase/supabase-js";

// Dynamic Supabase client creation to handle runtime environment variables
function getSupabaseClient() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  // Log environment variable status for debugging
  console.log("API Route - Supabase Environment Check:", {
    hasUrl: !!supabaseUrl,
    hasKey: !!supabaseAnonKey,
    urlValue: supabaseUrl || "MISSING",
    keyPrefix: supabaseAnonKey
      ? supabaseAnonKey.substring(0, 20) + "..."
      : "MISSING",
    keyLength: supabaseAnonKey?.length || 0,
  });

  if (!supabaseUrl || supabaseUrl.trim() === "") {
    const error = new Error(
      "Missing NEXT_PUBLIC_SUPABASE_URL environment variable. " +
        "Please set it in your deployment platform.",
    );
    console.error("CRITICAL:", error.message);
    throw error;
  }

  if (!supabaseAnonKey || supabaseAnonKey.trim() === "") {
    const error = new Error(
      "Missing NEXT_PUBLIC_SUPABASE_ANON_KEY environment variable. " +
        "Please set it in your deployment platform.",
    );
    console.error("CRITICAL:", error.message);
    throw error;
  }

  return createClient(supabaseUrl, supabaseAnonKey);
}

// GET - Fetch all available menu items and categories (public endpoint)
export async function GET(request: NextRequest) {
  let supabase;

  try {
    // Create Supabase client dynamically at runtime
    supabase = getSupabaseClient();
  } catch (error) {
    console.error("Failed to initialize Supabase client:", error);
    return NextResponse.json(
      {
        error: "Server configuration error",
        details: error instanceof Error ? error.message : String(error),
        missingVars: {
          url: !process.env.NEXT_PUBLIC_SUPABASE_URL,
          key: !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
        },
      },
      { status: 500 },
    );
  }

  try {
    // Fetch active categories (same as admin dashboard)
    const { data: catData, error: catError } = await supabase
      .from("categories")
      .select("*")
      .eq("is_active", true)
      .order("sort_order", { ascending: true });

    if (catError) {
      console.error("Error fetching categories:", catError);
      return NextResponse.json(
        {
          error: "Failed to fetch categories",
          details: catError.message,
          code: catError.code,
          hint: catError.hint,
        },
        { status: 500 },
      );
    }

    // Fetch menu items with category info
    const { data: itemsData, error: itemsError } = await supabase
      .from("menu_items")
      .select("*, category:categories(*)")
      .eq("is_available", true)
      .order("created_at", { ascending: false });

    if (itemsError) {
      console.error("Error fetching menu items:", itemsError);
      return NextResponse.json(
        {
          error: "Failed to fetch menu items",
          details: itemsError.message,
          code: itemsError.code,
          hint: itemsError.hint,
        },
        { status: 500 },
      );
    }

    console.log(
      `Fetched ${catData?.length || 0} categories and ${itemsData?.length || 0} menu items`,
    );

    return NextResponse.json({
      categories: catData || [],
      menuItems: itemsData || [],
    });
  } catch (error) {
    console.error("GET public menu error:", error);
    return NextResponse.json(
      {
        error: "Internal server error",
        details: error instanceof Error ? error.message : String(error),
        stack:
          process.env.NODE_ENV === "development" && error instanceof Error
            ? error.stack
            : undefined,
      },
      { status: 500 },
    );
  }
}
