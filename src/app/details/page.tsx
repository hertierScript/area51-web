"use client";

import { useEffect, useState, Suspense } from "react";
import Link from "next/link";
import { useSearchParams, useRouter } from "next/navigation";
import Image from "next/image";
import { Navbar } from "@/components/navbar";
import { useCart, type MenuItem } from "@/hooks/use-cart";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
  SheetFooter,
} from "@/components/ui/sheet";
import {
  ArrowLeft,
  Plus,
  Minus,
  ShoppingCart,
  Loader2,
  Tag,
  Trash2,
  MoveRight,
} from "lucide-react";
import { supabase } from "@/lib/supabase";
import { toast } from "sonner";
import { formatPrice } from "@/lib/utils";

function LoadingFallback() {
  return (
    <div className="min-h-screen bg-background text-foreground">
      <Navbar cartCount={0} />
      <div className="flex items-center justify-center py-20">
        <div className="text-center">
          <Loader2 className="h-12 w-12 animate-spin text-primary mx-auto mb-4" />
          <p className="text-muted-foreground">Loading item details...</p>
        </div>
      </div>
    </div>
  );
}

function DetailsContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const {
    addToCart,
    removeFromCart,
    updateQuantity,
    totalItems,
    totalPrice,
    cart,
  } = useCart();
  const [item, setItem] = useState<MenuItem | null>(null);
  const [loading, setLoading] = useState(true);
  const [quantity, setQuantity] = useState(1);
  const [adding, setAdding] = useState(false);
  const [isCartOpen, setIsCartOpen] = useState(false);

  const itemId = searchParams.get("id");

  useEffect(() => {
    if (!itemId) {
      setLoading(false);
      return;
    }

    const fetchItem = async () => {
      try {
        const { data, error } = await supabase
          .from("menu_items")
          .select(
            `
            id,
            name,
            description,
            price,
            image_url,
            category:categories(name)
          `,
          )
          .eq("id", itemId)
          .single();

        if (error) throw error;

        const categoryData = (data.category as unknown) as Array<{ name: string }> | { name: string } | null;
        const categoryName = Array.isArray(categoryData)
          ? categoryData[0]?.name
          : categoryData?.name || "Uncategorized";

        const menuItem: MenuItem = {
          id: data.id,
          name: data.name,
          description: data.description || "",
          price: data.price,
          category: categoryName,
          image: data.image_url || "/placeholder-food.jpg",
        };

        setItem(menuItem);
      } catch (err) {
        console.error("Error fetching item:", err);
        toast.error("Failed to load item details");
      } finally {
        setLoading(false);
      }
    };

    fetchItem();
  }, [itemId]);

  const handleQuantityChange = (delta: number) => {
    setQuantity((prev) => Math.max(1, prev + delta));
  };

  const handleAddToCart = async () => {
    if (!item) return;

    setAdding(true);
    try {
      // Add item multiple times based on quantity
      for (let i = 0; i < quantity; i++) {
        addToCart(item);
      }
      toast.success(
        `Added ${quantity} ${quantity === 1 ? "item" : "items"} to cart!`,
      );
      // Open cart drawer after adding
      setIsCartOpen(true);
    } catch (err) {
      console.error("Error adding to cart:", err);
      toast.error("Failed to add to cart");
    } finally {
      setAdding(false);
    }
  };

  if (loading) {
    return <LoadingFallback />;
  }

  if (!item) {
    return (
      <div className="min-h-screen bg-background text-foreground">
        <Navbar
          cartCount={totalItems}
          onCartClick={() => setIsCartOpen(true)}
        />
        <div className="container mx-auto px-4 py-16">
          <div className="max-w-md mx-auto text-center">
            <h1 className="text-3xl font-bold mb-4">Item Not Found</h1>
            <p className="text-muted-foreground mb-8">
              The item you're looking for doesn't exist or has been removed.
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

  return (
    <div className="min-h-screen bg-background text-foreground">
      <Navbar cartCount={totalItems} onCartClick={() => setIsCartOpen(true)} />

      <main className="container mx-auto px-4 py-8">
        {/* Back button */}
        <Link
          href="/menu"
          className="inline-flex items-center text-sm text-muted-foreground hover:text-primary mb-6 transition-colors"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Menu
        </Link>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Image Section */}
          <div className="relative">
            <div className="relative h-[400px] lg:h-[500px] rounded-2xl overflow-hidden shadow-xl">
              <Image
                src={item.image}
                alt={item.name}
                fill
                className="object-cover"
                priority
              />
              <Badge className="absolute top-4 left-4 bg-primary/90 text-primary-foreground">
                <Tag className="h-3 w-3 mr-1" />
                {item.category}
              </Badge>
            </div>
          </div>

          {/* Details Section */}
          <div className="space-y-6">
            <div>
              <h1 className="text-4xl font-bold tracking-tight mb-2">
                {item.name}
              </h1>
              <p className="text-3xl font-bold text-primary">
                {formatPrice(item.price)}
              </p>
            </div>

            <Card className="border-primary/20 bg-card/50">
              <CardContent className="pt-6">
                <h3 className="font-medium mb-3">Description</h3>
                <p className="text-muted-foreground leading-relaxed">
                  {item.description ||
                    "No description available for this item."}
                </p>
              </CardContent>
            </Card>

            {/* Quantity Selector */}
            <div className="flex items-center gap-4">
              <span className="font-medium">Quantity:</span>
              <div className="flex items-center gap-3">
                <Button
                  variant="outline"
                  size="icon"
                  onClick={() => handleQuantityChange(-1)}
                  disabled={quantity <= 1}
                >
                  <Minus className="h-4 w-4" />
                </Button>
                <span className="text-xl font-bold w-12 text-center">
                  {quantity}
                </span>
                <Button
                  variant="outline"
                  size="icon"
                  onClick={() => handleQuantityChange(1)}
                >
                  <Plus className="h-4 w-4" />
                </Button>
              </div>
            </div>

            {/* Add to Cart Button */}
            <Button
              onClick={handleAddToCart}
              disabled={adding}
              className="w-full bg-primary text-primary-foreground py-6 text-lg font-bold hover:bg-primary/90 transition-all"
            >
              {adding ? (
                <>
                  <Loader2 className="h-5 w-5 mr-2 animate-spin" />
                  Adding...
                </>
              ) : (
                <>
                  <ShoppingCart className="h-5 w-5 mr-2" />
                  Add to Cart - {formatPrice(item.price * quantity)}
                </>
              )}
            </Button>

            {/* Continue Shopping */}
            <Link href="/menu" className="block">
              <Button variant="outline" className="w-full">
                Continue Shopping
              </Button>
            </Link>
          </div>
        </div>
      </main>

      {/* Cart Drawer */}
      <Sheet open={isCartOpen} onOpenChange={setIsCartOpen}>
        <SheetContent className="w-full sm:max-w-md bg-background border-l border-primary/20 flex flex-col">
          <SheetHeader className="pb-6 border-b">
            <SheetTitle className="flex items-center gap-2 text-2xl font-bold">
              <ShoppingCart className="h-6 w-6 text-primary" />
              Your mission log
            </SheetTitle>
          </SheetHeader>

          <div className="flex-1 overflow-y-auto py-6">
            {cart.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center text-center space-y-4">
                <div className="h-20 w-20 bg-muted rounded-full flex items-center justify-center">
                  <ShoppingCart className="h-10 w-10 text-muted-foreground" />
                </div>
                <h3 className="text-xl font-medium">Empty payload</h3>
                <p className="text-muted-foreground">
                  Add some items from the classified menu to begin your mission.
                </p>
                <Button
                  onClick={() => setIsCartOpen(false)}
                  className="bg-primary text-primary-foreground"
                >
                  Browse Menu
                </Button>
              </div>
            ) : (
              <div className="space-y-6">
                {cart.map((cartItem) => (
                  <div key={cartItem.id} className="flex gap-4 items-center">
                    <div className="relative h-16 w-16 rounded-md overflow-hidden border border-border shrink-0">
                      <Image
                        src={cartItem.image}
                        alt={cartItem.name}
                        fill
                        className="object-cover"
                      />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h4 className="font-bold text-sm truncate">
                        {cartItem.name}
                      </h4>
                      <p className="text-primary text-sm font-medium">
                        {formatPrice(cartItem.price)}
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      <Button
                        size="icon"
                        variant="outline"
                        className="h-8 w-8 rounded-full border-primary/20"
                        onClick={() =>
                          updateQuantity(cartItem.id, cartItem.quantity - 1)
                        }
                      >
                        <Minus className="h-3 w-3" />
                      </Button>
                      <span className="w-4 text-center text-sm font-bold">
                        {cartItem.quantity}
                      </span>
                      <Button
                        size="icon"
                        variant="outline"
                        className="h-8 w-8 rounded-full border-primary/20"
                        onClick={() =>
                          updateQuantity(cartItem.id, cartItem.quantity + 1)
                        }
                      >
                        <Plus className="h-3 w-3" />
                      </Button>
                    </div>
                    <Button
                      size="icon"
                      variant="ghost"
                      className="text-muted-foreground hover:text-destructive"
                      onClick={() => removeFromCart(cartItem.id)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {cart.length > 0 && (
            <SheetFooter className="pt-6 border-t block sm:flex-none">
              <div className="space-y-4">
                <div className="flex justify-between items-center text-lg font-bold">
                  <span>Total Extraction Cost</span>
                  <span className="text-primary">
                    {formatPrice(totalPrice)}
                  </span>
                </div>
                <Link href="/checkout" onClick={() => setIsCartOpen(false)}>
                  <Button className="w-full bg-primary text-primary-foreground py-6 text-lg font-bold gap-2">
                    Initiate Delivery
                    <MoveRight className="h-5 w-5" />
                  </Button>
                </Link>
                <p className="text-[10px] text-center text-muted-foreground uppercase tracking-widest">
                  Secure encrypted transmission
                </p>
              </div>
            </SheetFooter>
          )}
        </SheetContent>
      </Sheet>
    </div>
  );
}

export default function DetailsPage() {
  return (
    <Suspense fallback={<LoadingFallback />}>
      <DetailsContent />
    </Suspense>
  );
}
