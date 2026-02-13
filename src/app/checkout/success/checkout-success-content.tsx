"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { Navbar } from "@/components/navbar";
import { useCart } from "@/hooks/use-cart";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  CheckCircle2,
  MapPin,
  Phone,
  Mail,
  Clock,
  ShoppingBag,
  ArrowRight,
  Loader2,
} from "lucide-react";
import { formatPrice } from "@/lib/utils";
import { Separator } from "@/components/ui/separator";

type Order = {
  id: string;
  status: string;
  subtotal: number;
  discount_amount: number;
  total: number;
  delivery_address: string;
  notes: string;
  created_at: string;
  customer_name: string | null;
  customer_phone: string | null;
  customer_address: string | null;
  customer?: {
    name: string;
    phone: string;
    email: string;
  };
  order_items?: {
    id: string;
    quantity: number;
    unit_price: number;
    total_price: number;
    menu_items?: {
      name: string;
    };
  }[];
};

export default function CheckoutSuccessContent() {
  const searchParams = useSearchParams();
  const { totalItems } = useCart();
  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const orderId = searchParams.get("order_id");

  useEffect(() => {
    if (!orderId) {
      setError("No order ID provided");
      setLoading(false);
      return;
    }

    const fetchOrder = async () => {
      try {
        const response = await fetch(`/api/orders/${orderId}`);
        const result = await response.json();

        if (!response.ok) {
          throw new Error(result.error || "Failed to fetch order");
        }

        setOrder(result.data);
      } catch (err) {
        console.error("Error fetching order:", err);
        setError("Failed to load order details");
      } finally {
        setLoading(false);
      }
    };

    fetchOrder();
  }, [orderId]);

  if (loading) {
    return (
      <div className="min-h-screen bg-background text-foreground">
        <Navbar cartCount={totalItems} />
        <div className="flex items-center justify-center py-20">
          <div className="text-center">
            <Loader2 className="h-12 w-12 animate-spin text-primary mx-auto mb-4" />
            <p className="text-muted-foreground">Loading order details...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error || !order) {
    return (
      <div className="min-h-screen bg-background text-foreground">
        <Navbar cartCount={totalItems} />
        <div className="container mx-auto px-4 py-16">
          <div className="max-w-md mx-auto text-center">
            <div className="h-24 w-24 bg-destructive/10 rounded-full flex items-center justify-center mx-auto mb-6">
              <CheckCircle2 className="h-12 w-12 text-destructive" />
            </div>
            <h1 className="text-3xl font-bold mb-4">Order Not Found</h1>
            <p className="text-muted-foreground mb-8">
              {error || "We couldn't find your order details."}
            </p>
            <Link href="/menu">
              <Button className="bg-primary text-primary-foreground">
                Browse Menu
              </Button>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  // Get customer info from orders table first, then fall back to customers table
  const customerName =
    order.customer_name || order.customer?.name || "Customer";
  const customerPhone = order.customer_phone || order.customer?.phone;
  const customerEmail = order.customer?.email;

  return (
    <div className="min-h-screen bg-background text-foreground">
      <Navbar cartCount={totalItems} />

      <main className="container mx-auto px-4 py-8">
        {/* Success Header */}
        <div className="text-center mb-8">
          <div className="h-24 w-24 bg-green-500/10 rounded-full flex items-center justify-center mx-auto mb-6">
            <CheckCircle2 className="h-16 w-16 text-green-500" />
          </div>
          <h1 className="text-4xl font-bold tracking-tight mb-2">
            Order <span className="text-green-500">Confirmed!</span>
          </h1>
          <p className="text-muted-foreground">
            Thank you for your order. We've received your order and will begin
            preparing it right away.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column - Order Details */}
          <div className="lg:col-span-2 space-y-6">
            {/* Order Info */}
            <Card className="border-primary/20 bg-card/50">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <ShoppingBag className="h-5 w-5 text-primary" />
                  Order Details
                </CardTitle>
                <CardDescription>
                  Order #{order.id.slice(0, 8).toUpperCase()}
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between p-4 bg-primary/5 rounded-lg">
                  <div className="flex items-center gap-3">
                    <div className="h-10 w-10 rounded-full bg-primary/20 flex items-center justify-center">
                      <Clock className="h-5 w-5 text-primary" />
                    </div>
                    <div>
                      <p className="font-medium">Estimated Delivery</p>
                      <p className="text-sm text-muted-foreground">
                        30-45 minutes
                      </p>
                    </div>
                  </div>
                  <span className="text-sm font-medium px-3 py-1 bg-primary/10 text-primary rounded-full capitalize">
                    {order.status}
                  </span>
                </div>

                {/* Order Items */}
                <div className="space-y-3">
                  <h4 className="font-medium">Order Items</h4>
                  {order.order_items?.map((item) => (
                    <div
                      key={item.id}
                      className="flex justify-between items-center py-2 border-b border-border/50 last:border-0"
                    >
                      <div className="flex items-center gap-3">
                        <span className="text-sm text-muted-foreground">
                          {item.quantity}x
                        </span>
                        <span className="font-medium">
                          {item.menu_items?.name || "Unknown Item"}
                        </span>
                      </div>
                      <span className="text-sm">
                        {formatPrice(item.total_price)}
                      </span>
                    </div>
                  ))}
                </div>

                {/* Price Breakdown */}
                <div className="bg-muted/30 rounded-lg p-4 space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Subtotal</span>
                    <span>{formatPrice(order.subtotal)}</span>
                  </div>
                  {order.discount_amount > 0 && (
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Discount</span>
                      <span className="text-green-500">
                        -{formatPrice(order.discount_amount)}
                      </span>
                    </div>
                  )}
                  <Separator />
                  <div className="flex justify-between font-bold">
                    <span>Total</span>
                    <span className="text-primary">
                      {formatPrice(order.total)}
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Delivery Address */}
            <Card className="border-primary/20 bg-card/50">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <MapPin className="h-5 w-5 text-primary" />
                  Delivery Address
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-foreground">{order.delivery_address}</p>
                {order.notes && (
                  <div className="mt-4 p-3 bg-muted/30 rounded-lg">
                    <p className="text-sm text-muted-foreground">
                      <span className="font-medium">Special Instructions:</span>{" "}
                      {order.notes}
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Right Column - Customer Info & Actions */}
          <div className="space-y-6">
            {/* Customer Info */}
            <Card className="border-primary/20 bg-card/50 sticky top-4">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Phone className="h-5 w-5 text-primary" />
                  Contact Information
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                    <span className="font-medium text-primary">
                      {customerName.charAt(0).toUpperCase()}
                    </span>
                  </div>
                  <div>
                    <p className="font-medium">{customerName}</p>
                    {customerEmail && (
                      <p className="text-sm text-muted-foreground">
                        {customerEmail}
                      </p>
                    )}
                  </div>
                </div>
                {customerPhone && (
                  <div className="flex items-center gap-3">
                    <Phone className="h-4 w-4 text-muted-foreground shrink-0" />
                    <span className="text-sm">{customerPhone}</span>
                  </div>
                )}
                {customerEmail && (
                  <div className="flex items-center gap-3">
                    <Mail className="h-4 w-4 text-muted-foreground shrink-0" />
                    <span className="text-sm">{customerEmail}</span>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Actions */}
            <Card className="border-primary/20 bg-card/50">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Phone className="h-5 w-5 text-primary" />
                  Payment Options
                </CardTitle>
                <CardDescription>
                  Complete your payment using our MOMO code
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Pay on Code */}
                <a
                  href={`tel:*182*8*1*011896*${Math.round(order.total)}#`}
                  className="block"
                >
                  <Button
                    variant="outline"
                    className="w-full border-green-600 text-green-600 hover:bg-green-50"
                  >
                    <Phone className="h-4 w-4 mr-2" />
                    Pay on Code
                  </Button>
                </a>

                <Separator className="my-4" />

                <Link href="/menu" className="block">
                  <Button className="w-full bg-primary text-primary-foreground">
                    <ShoppingBag className="h-4 w-4 mr-2" />
                    Continue Shopping
                  </Button>
                </Link>
                <Link href="/" className="block">
                  <Button variant="outline" className="w-full">
                    Back to Home
                    <ArrowRight className="h-4 w-4 ml-2" />
                  </Button>
                </Link>
              </CardContent>
            </Card>

            {/* Help */}
            <div className="text-center text-sm text-muted-foreground">
              <p>Need help? Call us at</p>
              <p className="font-medium text-foreground">+250 796711896</p>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
