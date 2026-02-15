"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
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
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { GooglePlacesAutocomplete } from "@/components/google-places-autocomplete";
import {
  ShoppingCart,
  MapPin,
  Phone,
  Mail,
  User,
  CreditCard,
  Percent,
  Check,
  ArrowLeft,
  Truck,
  Clock,
  Shield,
  Loader2,
  UserCheck,
} from "lucide-react";
import Image from "next/image";
import { toast } from "sonner";
import { supabase } from "@/lib/supabase";
import { formatPrice } from "@/lib/utils";

type Promotion = {
  id: string;
  name: string;
  description: string;
  type: "percentage" | "fixed";
  value: number;
  code?: string;
  min_order_amount: number;
  is_active: boolean;
};

export default function CheckoutPage() {
  const router = useRouter();
  const {
    cart,
    removeFromCart,
    updateQuantity,
    totalItems,
    totalPrice,
    clearCart,
  } = useCart();

  // Form state - declared at top level
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    address: "",
    city: "",
    notes: "",
  });
  const [couponCode, setCouponCode] = useState("");
  const [discount, setDiscount] = useState(0);
  const [discountAmount, setDiscountAmount] = useState(0);
  const [couponApplied, setCouponApplied] = useState(false);
  const [loading, setLoading] = useState(false);
  const [promotions, setPromotions] = useState<Promotion[]>([]);
  const [activePromotion, setActivePromotion] = useState<Promotion | null>(
    null,
  );

  // Fetch promotions from database
  useEffect(() => {
    const fetchPromotions = async () => {
      try {
        const { data, error } = await supabase
          .from("promotions")
          .select("*")
          .eq("is_active", true)
          .or("end_date.is.null,end_date.gt." + new Date().toISOString());

        if (error) {
          console.error("Error fetching promotions:", error);
          return;
        }

        if (data) {
          setPromotions(data);
        }
      } catch (error) {
        console.error("Error fetching promotions:", error);
      }
    };

    fetchPromotions();
  }, []);

  // Computed values - no delivery fee
  const subtotal = totalPrice;
  const finalTotal = subtotal - discountAmount;

  // Show empty cart state
  if (cart.length === 0) {
    return (
      <div className="min-h-screen bg-background text-foreground">
        <Navbar cartCount={totalItems} />
        <div className="container mx-auto px-4 py-16">
          <div className="max-w-md mx-auto text-center">
            <div className="h-24 w-24 bg-muted rounded-full flex items-center justify-center mx-auto mb-6">
              <ShoppingCart className="h-12 w-12 text-muted-foreground" />
            </div>
            <h1 className="text-3xl font-bold mb-4">Your cart is empty</h1>
            <p className="text-muted-foreground mb-8">
              Add some delicious items to your cart before checking out.
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

  // Handler functions
  const handleCouponApply = async () => {
    if (!couponCode.trim()) {
      toast.error("Please enter a coupon code");
      return;
    }

    // Find coupon in promotions from database
    const coupon = promotions.find(
      (p) =>
        p.name.toUpperCase() === couponCode.toUpperCase() ||
        p.code?.toUpperCase() === couponCode.toUpperCase(),
    );

    if (!coupon) {
      toast.error("Invalid coupon code");
      setDiscount(0);
      setDiscountAmount(0);
      setCouponApplied(false);
      setActivePromotion(null);
      return;
    }

    // Check if minimum order amount is met
    if (subtotal < coupon.min_order_amount) {
      toast.error(
        `Minimum order amount of ${formatPrice(coupon.min_order_amount)} required`,
      );
      return;
    }

    // Calculate discount
    const discountValue =
      coupon.type === "percentage"
        ? subtotal * (coupon.value / 100)
        : coupon.value;

    setDiscount(coupon.value);
    setDiscountAmount(discountValue);
    setCouponApplied(true);
    setActivePromotion(coupon);
    toast.success(
      `Coupon applied: ${coupon.description || `${coupon.value}% off`}`,
    );
  };

  const handleCouponRemove = () => {
    setCouponCode("");
    setDiscount(0);
    setDiscountAmount(0);
    setCouponApplied(false);
    setActivePromotion(null);
    toast.info("Coupon removed");
  };

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
  ) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    if (
      !formData.name ||
      !formData.phone ||
      !formData.address ||
      !formData.city
    ) {
      toast.error("Please fill in all required fields");
      setLoading(false);
      return;
    }

    try {
      console.log("Submitting order...");

      // Use server-side API route with service role
      const response = await fetch("/api/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: formData.name,
          email: formData.email || "",
          phone: formData.phone,
          address: formData.address,
          city: formData.city,
          notes: formData.notes,
          cart,
          subtotal,
          discountAmount,
          finalTotal,
        }),
      });

      const result = await response.json();

      if (!response.ok) {
        console.error("Checkout error:", result.error);
        throw new Error(result.error || "Failed to place order");
      }

      console.log("Order created successfully:", result.orderId);

      // Clear cart and show success
      clearCart();
      toast.success("Order placed successfully! Your food is on the way.");

      // Redirect to success page with order ID
      router.push(`/checkout/success?order_id=${result.orderId}`);
    } catch (error) {
      console.error("Checkout error:", error);
      toast.error(
        error instanceof Error
          ? error.message
          : "Failed to place order. Please try again.",
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background text-foreground">
      <Navbar cartCount={totalItems} />

      <main className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <Link
            href="/"
            className="inline-flex items-center text-sm text-muted-foreground hover:text-primary mb-4 transition-colors"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Home
          </Link>
          <h1 className="text-4xl font-bold tracking-tight mb-2">
            Checkout <span className="text-primary">Mission</span>
          </h1>
          <p className="text-muted-foreground">
            Complete your order for interstellar delivery
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column - Form */}
          <div className="lg:col-span-2 space-y-6">
            {/* Delivery Information */}
            <Card className="border-primary/20 bg-card/50">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <MapPin className="h-5 w-5 text-primary" />
                  Delivery Information
                </CardTitle>
                <CardDescription>
                  Where should we beam your order?
                </CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="name" className="flex items-center gap-2">
                        <User className="h-4 w-4" />
                        Full Name <span className="text-destructive">*</span>
                      </Label>
                      <Input
                        id="name"
                        name="name"
                        value={formData.name}
                        onChange={handleInputChange}
                        placeholder="John Doe"
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label
                        htmlFor="phone"
                        className="flex items-center gap-2"
                      >
                        <Phone className="h-4 w-4" />
                        Phone Number <span className="text-destructive">*</span>
                      </Label>
                      <Input
                        id="phone"
                        name="phone"
                        type="tel"
                        value={formData.phone}
                        onChange={handleInputChange}
                        placeholder="+1 234 567 8900"
                        required
                      />
                    </div>
                  </div>

                  {/* Email field hidden - keeping for potential future use */}
                  {/*
                  <div className="space-y-2">
                    <Label htmlFor="email" className="flex items-center gap-2">
                      <Mail className="h-4 w-4" />
                      Email Address <span className="text-destructive">*</span>
                    </Label>
                    <Input
                      id="email"
                      name="email"
                      type="email"
                      value={formData.email}
                      onChange={handleInputChange}
                      placeholder="john@example.com"
                      required
                    />
                  </div>
                  */}

                  <div className="space-y-2">
                    <Label
                      htmlFor="address"
                      className="flex items-center gap-2"
                    >
                      <MapPin className="h-4 w-4" />
                      Street Address <span className="text-destructive">*</span>
                    </Label>
                    <GooglePlacesAutocomplete
                      id="address"
                      value={formData.address}
                      onChange={(value) =>
                        setFormData((prev) => ({ ...prev, address: value }))
                      }
                      onSelect={(address, placeId) => {
                        setFormData((prev) => {
                          const parts = address.split(",");
                          let city = prev.city;
                          if (parts.length > 1) {
                            city = parts[parts.length - 2].trim();
                          }
                          return { ...prev, address, city };
                        });
                      }}
                      placeholder="Start typing your address..."
                      className="h-10"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="city" className="flex items-center gap-2">
                      <MapPin className="h-4 w-4" />
                      City <span className="text-destructive">*</span>
                    </Label>
                    <Input
                      id="city"
                      name="city"
                      value={formData.city}
                      onChange={handleInputChange}
                      placeholder="New York"
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="notes">Special Instructions</Label>
                    <Textarea
                      id="notes"
                      name="notes"
                      value={formData.notes}
                      onChange={handleInputChange}
                      placeholder="Any special requests or delivery instructions..."
                      rows={3}
                    />
                  </div>
                </form>
              </CardContent>
            </Card>

            {/* Payment Method */}
            <Card className="border-primary/20 bg-card/50">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <CreditCard className="h-5 w-5 text-primary" />
                  Payment Method
                </CardTitle>
                <CardDescription>Choose how you want to pay</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex items-center justify-between p-4 border border-primary/30 rounded-lg bg-primary/5 cursor-pointer hover:bg-primary/10 transition-colors">
                    <div className="flex items-center gap-3">
                      <div className="h-10 w-10 rounded-full bg-primary/20 flex items-center justify-center">
                        <CreditCard className="h-5 w-5 text-primary" />
                      </div>
                      <div>
                        <p className="font-medium">Mobile Payment</p>
                        <p className="text-sm text-muted-foreground">
                          Complete payment after placing your order.
                        </p>
                      </div>
                    </div>
                    <Check className="h-5 w-5 text-primary" />
                  </div>
                  {/* <div className="flex items-center justify-between p-4 border border-border rounded-lg cursor-not-allowed opacity-50">
                    <div className="flex items-center gap-3">
                      <div className="h-10 w-10 rounded-full bg-muted flex items-center justify-center">
                        <CreditCard className="h-5 w-5 text-muted-foreground" />
                      </div>
                      <div>
                        <p className="font-medium">Mobile Payment</p>
                        <p className="text-sm text-muted-foreground">
                          Coming soon
                        </p>
                      </div>
                    </div>
                  </div> */}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Right Column - Order Summary */}
          <div className="space-y-6">
            {/* Contact Information Card */}
            {(formData.name || formData.phone) && (
              <Card className="border-primary/20 bg-card/50">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <UserCheck className="h-5 w-5 text-primary" />
                    Contact Information
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  {formData.name && (
                    <div className="flex items-center gap-3">
                      <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center">
                        <User className="h-4 w-4 text-primary" />
                      </div>
                      <div>
                        <p className="font-medium">{formData.name}</p>
                      </div>
                    </div>
                  )}
                  {formData.phone && (
                    <div className="flex items-center gap-3">
                      <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center">
                        <Phone className="h-4 w-4 text-primary" />
                      </div>
                      <div>
                        <p className="font-medium">{formData.phone}</p>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            )}

            {/* Order Summary */}
            <Card className="border-primary/20 bg-card/50 sticky top-4">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <ShoppingCart className="h-5 w-5 text-primary" />
                  Order Summary
                </CardTitle>
                <CardDescription>
                  {totalItems} item{totalItems !== 1 ? "s" : ""} in your cart
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Cart Items */}
                <div className="space-y-3 max-h-64 overflow-y-auto">
                  {cart.map((item) => (
                    <div key={item.id} className="flex gap-3 items-start">
                      <div className="relative h-16 w-16 rounded-md overflow-hidden border border-border shrink-0">
                        {item.image ? (
                          <Image
                            src={item.image}
                            alt={item.name}
                            fill
                            unoptimized
                            className="object-cover"
                            onError={(e) => {
                              const target = e.target as HTMLImageElement;
                              target.style.display = "none";
                            }}
                          />
                        ) : (
                          <div className="w-full h-full bg-muted flex items-center justify-center">
                            <span className="text-muted-foreground text-xs">
                              No image
                            </span>
                          </div>
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <h4 className="font-medium text-sm truncate">
                          {item.name}
                        </h4>
                        <p className="text-xs text-muted-foreground">
                          {item.category}
                        </p>
                        <div className="flex items-center justify-between mt-1">
                          <div className="flex items-center gap-2">
                            <button
                              type="button"
                              onClick={() =>
                                updateQuantity(item.id, item.quantity - 1)
                              }
                              className="h-6 w-6 rounded-full border border-primary/20 flex items-center justify-center hover:bg-primary/10 transition-colors"
                            >
                              <span className="text-xs">-</span>
                            </button>
                            <span className="text-sm font-medium w-4 text-center">
                              {item.quantity}
                            </span>
                            <button
                              type="button"
                              onClick={() =>
                                updateQuantity(item.id, item.quantity + 1)
                              }
                              className="h-6 w-6 rounded-full border border-primary/20 flex items-center justify-center hover:bg-primary/10 transition-colors"
                            >
                              <span className="text-xs">+</span>
                            </button>
                          </div>
                          <span className="text-sm font-bold text-primary">
                            {formatPrice(item.price * item.quantity)}
                          </span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                <Separator />

                {/* Coupon Code */}
                <div className="space-y-2">
                  <Label className="flex items-center gap-2">
                    <Percent className="h-4 w-4" />
                    Coupon Code
                  </Label>
                  {couponApplied ? (
                    <div className="flex items-center justify-between p-3 bg-primary/10 border border-primary/30 rounded-lg">
                      <div className="flex items-center gap-2">
                        <Check className="h-4 w-4 text-primary" />
                        <span className="text-sm font-medium text-primary">
                          {activePromotion?.name || couponCode.toUpperCase()}
                        </span>
                        <Badge variant="outline" className="text-xs">
                          -{formatPrice(discountAmount)}
                        </Badge>
                      </div>
                      <button
                        type="button"
                        onClick={handleCouponRemove}
                        className="text-xs text-muted-foreground hover:text-destructive transition-colors"
                      >
                        Remove
                      </button>
                    </div>
                  ) : (
                    <div className="flex gap-2">
                      <Input
                        value={couponCode}
                        onChange={(e) => setCouponCode(e.target.value)}
                        placeholder="Enter code"
                        className="flex-1"
                      />
                      <Button
                        type="button"
                        variant="outline"
                        onClick={handleCouponApply}
                        className="border-primary/20 text-primary hover:bg-primary/10"
                      >
                        Apply
                      </Button>
                    </div>
                  )}
                </div>

                <Separator />

                {/* Price Breakdown */}
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Subtotal</span>
                    <span>{formatPrice(subtotal)}</span>
                  </div>
                  {discountAmount > 0 && (
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Discount</span>
                      <span className="text-green-500">
                        -{formatPrice(discountAmount)}
                      </span>
                    </div>
                  )}
                  <Separator />
                  <div className="flex justify-between text-lg font-bold">
                    <span>Total</span>
                    <span className="text-primary">
                      {formatPrice(finalTotal)}
                    </span>
                  </div>
                </div>

                {/* Delivery Info */}
                <div className="bg-muted/30 rounded-lg p-3 space-y-2">
                  <div className="flex items-center gap-2 text-sm">
                    <Truck className="h-4 w-4 text-primary" />
                    <span className="text-muted-foreground">
                      Estimated delivery: 30-45 mins
                    </span>
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    <Shield className="h-4 w-4 text-primary" />
                    <span className="text-muted-foreground">
                      Secure & encrypted payment
                    </span>
                  </div>
                </div>

                {/* Submit Button */}
                <Button
                  type="submit"
                  onClick={handleSubmit}
                  disabled={loading}
                  className="w-full bg-primary text-primary-foreground py-6 text-lg font-bold hover:bg-primary/90 transition-all"
                >
                  {loading ? (
                    <>
                      <span className="animate-pulse">Processing...</span>
                    </>
                  ) : (
                    <>Place Order - {formatPrice(finalTotal)}</>
                  )}
                </Button>

                <p className="text-[10px] text-center text-muted-foreground uppercase tracking-widest">
                  By placing this order, you agree to our Terms of Service
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
    </div>
  );
}
