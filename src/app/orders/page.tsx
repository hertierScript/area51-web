"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
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
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { motion } from "framer-motion";
import {
  Clock,
  CheckCircle2,
  Package,
  Truck,
  XCircle,
  RefreshCw,
  Loader2,
} from "lucide-react";
import { formatPrice } from "@/lib/utils";
import { supabase } from "@/lib/supabase";
import { toast } from "sonner";

type OrderStatus =
  | "pending"
  | "confirmed"
  | "preparing"
  | "ready"
  | "on_the_way"
  | "delivered"
  | "cancelled";

interface OrderItem {
  id: string;
  menu_item_id: string | null;
  quantity: number;
  unit_price: number;
  total_price: number;
  menu_items?: {
    name: string;
    image_url?: string;
  };
}

interface Order {
  id: string;
  status: OrderStatus;
  subtotal: number;
  discount_amount: number;
  total: number;
  notes: string | null;
  delivery_address: string | null;
  created_at: string;
  order_items?: OrderItem[];
}

const statusConfig: Record<
  OrderStatus,
  { label: string; icon: React.ReactNode; color: string }
> = {
  pending: {
    label: "Pending",
    icon: <Clock className="h-4 w-4" />,
    color: "bg-yellow-500/10 text-yellow-500 border-yellow-500/20",
  },
  confirmed: {
    label: "Confirmed",
    icon: <CheckCircle2 className="h-4 w-4" />,
    color: "bg-blue-500/10 text-blue-500 border-blue-500/20",
  },
  preparing: {
    label: "Preparing",
    icon: <RefreshCw className="h-4 w-4" />,
    color: "bg-orange-500/10 text-orange-500 border-orange-500/20",
  },
  ready: {
    label: "Ready",
    icon: <Package className="h-4 w-4" />,
    color: "bg-purple-500/10 text-purple-500 border-purple-500/20",
  },
  on_the_way: {
    label: "On the Way",
    icon: <Truck className="h-4 w-4" />,
    color: "bg-primary/10 text-primary border-primary/20",
  },
  delivered: {
    label: "Delivered",
    icon: <CheckCircle2 className="h-4 w-4" />,
    color: "bg-green-500/10 text-green-500 border-green-500/20",
  },
  cancelled: {
    label: "Cancelled",
    icon: <XCircle className="h-4 w-4" />,
    color: "bg-red-500/10 text-red-500 border-red-500/20",
  },
};

export default function OrdersPage() {
  const router = useRouter();
  const { totalItems, addToCart } = useCart();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null);

  useEffect(() => {
    checkAuthAndFetchOrders();
  }, []);

  async function checkAuthAndFetchOrders() {
    try {
      const {
        data: { session },
      } = await supabase.auth.getSession();

      if (!session) {
        toast.error("Please sign in to view your orders");
        router.push("/login");
        return;
      }

      setIsAuthenticated(true);

      // Get customer by email
      const { data: customer } = await supabase
        .from("customers")
        .select("id")
        .eq("email", session.user.email)
        .single();

      if (customer) {
        // Fetch orders for this customer
        const { data: ordersData, error } = await supabase
          .from("orders")
          .select("*, order_items(*, menu_items(name, image_url))")
          .eq("customer_id", customer.id)
          .order("created_at", { ascending: false });

        if (error) {
          console.error("Error fetching orders:", error);
          toast.error("Failed to load orders");
        } else {
          setOrders(ordersData || []);
        }
      }
    } catch (error) {
      console.error("Error:", error);
      toast.error("Failed to load orders");
    } finally {
      setLoading(false);
    }
  }

  async function handleReorder(order: Order) {
    try {
      // Add all items back to cart
      for (const item of order.order_items || []) {
        if (item.menu_items) {
          addToCart({
            id: item.menu_item_id || item.id,
            name: item.menu_items.name,
            description: "",
            price: item.unit_price,
            category: "",
            image: item.menu_items.image_url || "",
          });
        }
      }

      toast.success("Items added to cart!");
      router.push("/menu");
    } catch (error) {
      console.error("Reorder error:", error);
      toast.error("Failed to add items to cart");
    }
  }

  function handleTrackOrder(order: Order) {
    toast.info("Tracking feature coming soon!");
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-background text-foreground">
        <Navbar cartCount={totalItems} />
        <div className="flex items-center justify-center py-20">
          <div className="text-center">
            <Loader2 className="h-12 w-12 animate-spin text-primary mx-auto mb-4" />
            <p className="text-muted-foreground">Loading your orders...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background text-foreground selection:bg-primary selection:text-primary-foreground">
      <Navbar cartCount={totalItems} />

      <main className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-primary mb-2">My Orders</h1>
          <p className="text-muted-foreground">Track and manage your orders</p>
        </div>

        {orders.length === 0 ? (
          <Card className="p-12 text-center">
            <Package className="h-16 w-16 mx-auto text-muted-foreground mb-4" />
            <h2 className="text-xl font-bold mb-2">No orders yet</h2>
            <p className="text-muted-foreground mb-6">
              Start exploring our menu and place your first order!
            </p>
            <Button
              className="bg-primary text-primary-foreground"
              onClick={() => router.push("/menu")}
            >
              Browse Menu
            </Button>
          </Card>
        ) : (
          <div className="space-y-6">
            {orders.map((order, index) => {
              const status = statusConfig[order.status];
              return (
                <motion.div
                  key={order.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: index * 0.1 }}
                >
                  <Card className="border-primary/20 hover:shadow-[0_0_30px_rgba(0,255,0,0.1)] transition-all duration-300">
                    <CardHeader>
                      <div className="flex items-start justify-between">
                        <div>
                          <CardTitle className="text-xl">
                            Order #{order.id.slice(-8).toUpperCase()}
                          </CardTitle>
                          <CardDescription className="mt-1">
                            {new Date(order.created_at).toLocaleString()}
                          </CardDescription>
                        </div>
                        <Badge
                          className={`${status.color} flex items-center gap-1`}
                        >
                          {status.icon}
                          {status.label}
                        </Badge>
                      </div>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div>
                        <h4 className="text-sm font-medium mb-2">Items</h4>
                        <div className="space-y-2">
                          {order.order_items?.map((item, itemIndex) => (
                            <div
                              key={itemIndex}
                              className="flex justify-between text-sm"
                            >
                              <span className="text-muted-foreground">
                                {item.menu_items?.name || "Unknown Item"} x
                                {item.quantity}
                              </span>
                              <span className="font-medium">
                                {formatPrice(item.total_price)}
                              </span>
                            </div>
                          ))}
                        </div>
                      </div>

                      <Separator />

                      <div className="flex justify-between items-center">
                        <div className="text-sm text-muted-foreground">
                          <span className="block">
                            Delivery to:{" "}
                            {order.delivery_address || "Not specified"}
                          </span>
                        </div>
                        <div className="text-lg font-bold text-primary">
                          Total: {formatPrice(order.total)}
                        </div>
                      </div>

                      {order.status === "on_the_way" && (
                        <div className="pt-2">
                          <Button
                            className="w-full bg-primary text-primary-foreground"
                            onClick={() => handleTrackOrder(order)}
                          >
                            <Truck className="h-4 w-4 mr-2" />
                            Track Order
                          </Button>
                        </div>
                      )}

                      {order.status === "delivered" && (
                        <div className="pt-2">
                          <Button
                            variant="outline"
                            className="w-full border-primary/20 hover:bg-primary/10"
                            onClick={() => handleReorder(order)}
                          >
                            <RefreshCw className="h-4 w-4 mr-2" />
                            Reorder
                          </Button>
                        </div>
                      )}

                      {order.status === "cancelled" && (
                        <div className="pt-2">
                          <Button
                            variant="outline"
                            className="w-full border-primary/20 hover:bg-primary/10"
                            onClick={() => router.push("/menu")}
                          >
                            <Package className="h-4 w-4 mr-2" />
                            Order Again
                          </Button>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                </motion.div>
              );
            })}
          </div>
        )}
      </main>
    </div>
  );
}
