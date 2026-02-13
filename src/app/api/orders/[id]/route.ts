import { NextResponse } from "next/server";
import { createServerClient } from "@supabase/ssr";

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await params;

    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!,
      {
        cookies: {
          getAll() {
            return [];
          },
          setAll() {},
        },
      },
    );

    const { data, error } = await supabase
      .from("orders")
      .select(
        `
        id,
        status,
        subtotal,
        discount_amount,
        total,
        delivery_address,
        notes,
        created_at,
        customer:customers(name, phone, email),
        order_items(
          id,
          quantity,
          unit_price,
          total_price,
          menu_items(name)
        )
      `,
      )
      .eq("id", id)
      .single();

    if (error) {
      console.error("Error fetching order:", error);
      return NextResponse.json({ error: "Order not found" }, { status: 404 });
    }

    return NextResponse.json({ data });
  } catch (error) {
    console.error("Error fetching order:", error);
    return NextResponse.json(
      { error: "Failed to fetch order" },
      { status: 500 },
    );
  }
}
