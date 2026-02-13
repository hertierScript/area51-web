import { NextResponse } from "next/server";
import { createServerClient } from "@supabase/ssr";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const {
      name,
      email,
      phone,
      address,
      city,
      notes,
      cart,
      subtotal,
      discountAmount,
      finalTotal,
    } = body;

    // Validate required fields (email is optional)
    if (!name || !phone || !address || !city) {
      return NextResponse.json(
        { error: "Please fill in all required fields" },
        { status: 400 },
      );
    }

    // Create Supabase client with service role key
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

    // Get or create customer only if email is provided
    let customerId: string | null = null;

    if (email) {
      // Try to find existing customer by email
      const { data: existingCustomer } = await supabase
        .from("customers")
        .select("id")
        .eq("email", email)
        .single();

      if (existingCustomer) {
        customerId = existingCustomer.id;
        await supabase
          .from("customers")
          .update({ name, phone, address })
          .eq("id", customerId);
      } else {
        // Create new customer with email
        const { data: newCustomer, error: customerError } = await supabase
          .from("customers")
          .insert({ email, name, phone, address })
          .select("id")
          .single();

        if (customerError) {
          console.error("Error creating customer:", customerError);
          return NextResponse.json(
            { error: "Failed to create customer" },
            { status: 500 },
          );
        }
        customerId = newCustomer.id;
      }
    }
    // If no email is provided, customerId remains null (guest checkout)

    // Create order
    console.log("Creating order with:", {
      customer_id: customerId,
      customer_name: name,
      customer_phone: phone,
      customer_address: address,
      status: "pending",
      subtotal,
      discount_amount: discountAmount,
      total: finalTotal,
      notes,
      delivery_address: `${address}, ${city}`,
    });

    const { data: order, error: orderError } = await supabase
      .from("orders")
      .insert({
        customer_id: customerId,
        customer_name: name,
        customer_phone: phone,
        customer_address: address,
        status: "pending",
        subtotal,
        discount_amount: discountAmount,
        total: finalTotal,
        notes,
        delivery_address: `${address}, ${city}`,
      })
      .select("id")
      .single();

    if (orderError) {
      console.error("Error creating order:", orderError);
      return NextResponse.json(
        { error: "Failed to create order: " + orderError.message },
        { status: 500 },
      );
    }

    console.log("Order created successfully:", order.id);

    // Create order items
    const orderItems = cart.map(
      (item: { id: string; quantity: number; price: number }) => ({
        order_id: order.id,
        menu_item_id: item.id,
        quantity: item.quantity,
        unit_price: item.price,
        total_price: item.price * item.quantity,
      }),
    );

    const { error: orderItemsError } = await supabase
      .from("order_items")
      .insert(orderItems);

    if (orderItemsError) {
      console.error("Error creating order items:", orderItemsError);
      return NextResponse.json(
        { error: "Failed to create order items" },
        { status: 500 },
      );
    }

    return NextResponse.json({ success: true, orderId: order.id });
  } catch (error) {
    console.error("Checkout error:", error);
    return NextResponse.json(
      { error: "Failed to process checkout" },
      { status: 500 },
    );
  }
}
