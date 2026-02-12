"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { Navbar } from "@/components/navbar";
import { useCart } from "@/hooks/use-cart";
import { CartMenuItem } from "@/components/menu";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
  SheetFooter,
} from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import {
  ShoppingCart,
  Trash2,
  Plus,
  Minus,
  MoveRight,
  Plus as AddIcon,
  Loader2,
  Search,
} from "lucide-react";
import { Separator } from "@/components/ui/separator";
import Image from "next/image";
import { Category } from "@/lib/supabase";
import { formatPrice } from "@/lib/utils";

export default function MenuPage() {
  const {
    cart,
    addToCart,
    removeFromCart,
    updateQuantity,
    totalItems,
    totalPrice,
  } = useCart();

  const [isCartOpen, setIsCartOpen] = useState(false);
  const [activeCategory, setActiveCategory] = useState("All");
  const [searchQuery, setSearchQuery] = useState("");
  const [menuItems, setMenuItems] = useState<CartMenuItem[]>([]);
  const [categories, setCategories] = useState<string[]>(["All"]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchData() {
      setLoading(true);
      try {
        // Fetch data from public API route
        const response = await fetch("/api/menu");

        if (response.ok) {
          const data = await response.json();
          const allCategories = [
            "All",
            ...data.categories.map((c: Category) => c.name),
          ];
          const cartItems: CartMenuItem[] = data.menuItems.map((item: any) => ({
            id: item.id,
            name: item.name,
            description: item.description || "",
            price: Number(item.price),
            category: item.category?.name || "Uncategorized",
            image: item.image_url || "",
          }));

          setCategories(allCategories);
          setMenuItems(cartItems);
        } else {
          console.error(
            "Error fetching data:",
            response.status,
            response.statusText,
          );
        }
      } catch (error) {
        console.error("Error fetching menu data:", error);
      }

      setLoading(false);
    }

    fetchData();
  }, []);

  const filteredItems = menuItems.filter((item) => {
    const matchesCategory =
      activeCategory === "All" || item.category === activeCategory;
    const matchesSearch =
      searchQuery === "" ||
      item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.description.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  const handleAddToCart = (item: CartMenuItem) => {
    addToCart(item);
    setIsCartOpen(true);
  };

  return (
    <div className="min-h-screen bg-background text-foreground selection:bg-primary selection:text-primary-foreground">
      <Navbar cartCount={totalItems} onCartClick={() => setIsCartOpen(true)} />

      <main className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-primary mb-2">Our Menu</h1>
          <p className="text-muted-foreground">
            Explore our classified selection of delicious dishes
          </p>
        </div>

        {loading ? (
          <div className="flex flex-col items-center justify-center min-h-[400px]">
            <Loader2 className="h-12 w-12 text-primary animate-spin" />
            <p className="mt-4 text-muted-foreground">
              Loading classified menu...
            </p>
          </div>
        ) : (
          <>
            <Tabs
              defaultValue="All"
              className="w-full mb-12"
              onValueChange={setActiveCategory}
            >
              <div className="flex justify-center">
                <TabsList className="bg-muted border border-border">
                  {categories.map((cat) => (
                    <TabsTrigger
                      key={cat}
                      value={cat}
                      className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"
                    >
                      {cat}
                    </TabsTrigger>
                  ))}
                </TabsList>
              </div>

              {/* Search Bar */}
              <div className="mt-6 max-w-2xl mx-auto">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                  <Input
                    type="text"
                    placeholder="Search for dishes..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-10 bg-muted/50 border-border focus:border-primary"
                  />
                </div>
              </div>

              <div className="mt-10 grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-3">
                {filteredItems.length === 0 ? (
                  <div className="col-span-full text-center py-12">
                    <Search className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
                    <h3 className="text-xl font-semibold text-foreground mb-2">
                      No dishes found
                    </h3>
                    <p className="text-muted-foreground">
                      {searchQuery
                        ? `No results for "${searchQuery}"`
                        : "No items available in this category"}
                    </p>
                  </div>
                ) : (
                  filteredItems.map((item) => (
                    <Card
                      key={item.id}
                      className="overflow-hidden border-border bg-card/50 hover:border-primary/50 transition-all duration-300 group"
                    >
                      <div className="relative h-48 w-full overflow-hidden">
                        {item.image && (
                          <Image
                            src={item.image}
                            alt={item.name}
                            fill
                            className="object-cover group-hover:scale-110 transition-transform duration-500"
                          />
                        )}
                        <div className="absolute top-2 right-2">
                          <Badge className="bg-black/70 text-primary border-primary">
                            {item.category}
                          </Badge>
                        </div>
                      </div>
                      <CardHeader>
                        <div className="flex justify-between items-start">
                          <CardTitle className="text-xl font-bold group-hover:text-primary transition-colors">
                            {item.name}
                          </CardTitle>
                          <span className="text-primary font-bold">
                            {formatPrice(item.price)}
                          </span>
                        </div>
                        <CardDescription className="line-clamp-2">
                          {item.description}
                        </CardDescription>
                      </CardHeader>
                      <CardFooter>
                        <Button
                          onClick={() => handleAddToCart(item)}
                          className="w-full bg-primary/10 text-primary border border-primary/20 hover:bg-primary hover:text-primary-foreground transition-all gap-2"
                        >
                          <AddIcon className="h-4 w-4" />
                          Add to Cart
                        </Button>
                      </CardFooter>
                    </Card>
                  ))
                )}
              </div>
            </Tabs>
          </>
        )}
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
                {cart.map((item) => (
                  <div key={item.id} className="flex gap-4 items-center">
                    <div className="relative h-16 w-16 rounded-md overflow-hidden border border-border shrink-0">
                      <Image
                        src={item.image}
                        alt={item.name}
                        fill
                        className="object-cover"
                      />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h4 className="font-bold text-sm truncate">
                        {item.name}
                      </h4>
                      <p className="text-primary text-sm font-medium">
                        {formatPrice(item.price)}
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      <Button
                        size="icon"
                        variant="outline"
                        className="h-8 w-8 rounded-full border-primary/20"
                        onClick={() =>
                          updateQuantity(item.id, item.quantity - 1)
                        }
                      >
                        <Minus className="h-3 w-3" />
                      </Button>
                      <span className="w-4 text-center text-sm font-bold">
                        {item.quantity}
                      </span>
                      <Button
                        size="icon"
                        variant="outline"
                        className="h-8 w-8 rounded-full border-primary/20"
                        onClick={() =>
                          updateQuantity(item.id, item.quantity + 1)
                        }
                      >
                        <Plus className="h-3 w-3" />
                      </Button>
                    </div>
                    <Button
                      size="icon"
                      variant="ghost"
                      className="text-muted-foreground hover:text-destructive"
                      onClick={() => removeFromCart(item.id)}
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
