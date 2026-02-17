"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { Navbar } from "@/components/navbar";
import { Hero } from "@/components/hero";
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
import {
  ShoppingCart,
  Trash2,
  Plus,
  Minus,
  MoveRight,
  Plus as AddIcon,
  Star,
  Clock,
  Percent,
  Zap,
  ChevronLeft,
  ChevronRight,
  Loader2,
  Eye,
} from "lucide-react";
import { Separator } from "@/components/ui/separator";
import Image from "next/image";
import { motion, useAnimation } from "framer-motion";
import { formatPrice } from "@/lib/utils";

// Sample offers
const featuredOffers = [
  {
    id: 1,
    title: "First Order Discount",
    description: "Get 20% off on your first order",
    discount: "20%",
    icon: <Zap className="h-6 w-6" />,
    code: "FIRST20",
    image:
      "https://images.unsplash.com/photo-1568901346375-23c9450c58cd?auto=format&fit=crop&q=80&w=400",
  },
  {
    id: 2,
    title: "Weekend Special",
    description: "Free delivery on orders over 30,000 RWF",
    discount: "FREE",
    icon: <Clock className="h-6 w-6" />,
    code: "WEEKEND",
    image:
      "https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?auto=format&fit=crop&q=80&w=400",
  },
  {
    id: 3,
    title: "Lunch Combo",
    description: "Buy main course, get drink free",
    discount: "BOGO",
    icon: <Percent className="h-6 w-6" />,
    code: "LUNCH",
    image:
      "https://images.unsplash.com/photo-1573080496219-bb080dd4f877?auto=format&fit=crop&q=80&w=400",
  },
  {
    id: 4,
    title: "Family Feast",
    description: "15% off on 4+ items",
    discount: "15%",
    icon: <Zap className="h-6 w-6" />,
    code: "FAMILY15",
    image:
      "https://images.unsplash.com/photo-1567620832903-9fc6debc209f?auto=format&fit=crop&q=80&w=400",
  },
];

// Sample reviews
const reviews = [
  {
    id: 1,
    name: "Tuyishime Aime",
    rating: 5,
    comment:
      "The Alien Burger is out of this world! Best burger I've ever had.",
    date: "2 days ago",
  },
  {
    id: 2,
    name: "Shema Fabrice",
    rating: 5,
    comment:
      "Fast delivery and the food was still hot. The Galactic Pizza is amazing!",
    date: "1 week ago",
  },
  {
    id: 3,
    name: "Keza Happy",
    rating: 4,
    comment: "Great food and unique flavors. The Meteor Shake is a must-try!",
    date: "3 days ago",
  },
  {
    id: 4,
    name: "Ishimwe Belyse",
    rating: 5,
    comment:
      "Excellent service and delicious food. Will definitely order again!",
    date: "5 days ago",
  },
  {
    id: 5,
    name: "Irumva Prince",
    rating: 5,
    comment: "The Nebula Wings are perfectly spiced. Love this place!",
    date: "1 day ago",
  },
  {
    id: 6,
    name: "Kagabo David",
    rating: 4,
    comment:
      "Good portions and great taste. The Cosmic Salad is fresh and tasty.",
    date: "4 days ago",
  },
];

export default function Home() {
  const {
    cart,
    addToCart,
    removeFromCart,
    updateQuantity,
    totalItems,
    totalPrice,
  } = useCart();

  const [isCartOpen, setIsCartOpen] = useState(false);
  const [offersScrollPosition, setOffersScrollPosition] = useState(0);
  const [featuredMenuItems, setFeaturedMenuItems] = useState<CartMenuItem[]>(
    [],
  );
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchFeaturedItems() {
      try {
        // Fetch data from public API route
        const response = await fetch("/api/menu");
        const data = await response.json();

        if (response.ok && data) {
          console.log("API Response:", {
            categoriesCount: data.categories?.length || 0,
            menuItemsCount: data.menuItems?.length || 0,
          });

          const cartItems: CartMenuItem[] = data.menuItems
            .slice(0, 8)
            .map((item: any) => ({
              id: item.id,
              name: item.name,
              description: item.description || "",
              price: Number(item.price),
              category: item.category?.name || "Uncategorized",
              image: item.image_url || "",
            }));
          setFeaturedMenuItems(cartItems);
        } else {
          console.error("Error fetching featured items:", {
            status: response.status,
            error: data.error,
            details: data.details,
          });
        }
      } catch (error) {
        console.error("Error fetching featured menu data:", error);
      } finally {
        setLoading(false);
      }
    }

    fetchFeaturedItems();
  }, []);

  const handleAddToCart = (item: CartMenuItem) => {
    addToCart(item);
    setIsCartOpen(true);
  };

  const scrollOffers = (direction: "left" | "right") => {
    const container = document.getElementById("offers-container");
    if (container) {
      const scrollAmount = 300;
      if (direction === "left") {
        container.scrollBy({ left: -scrollAmount, behavior: "smooth" });
      } else {
        container.scrollBy({ left: scrollAmount, behavior: "smooth" });
      }
    }
  };

  return (
    <div className="min-h-screen bg-background text-foreground selection:bg-primary selection:text-primary-foreground">
      <Navbar cartCount={totalItems} onCartClick={() => setIsCartOpen(true)} />

      <main>
        <Hero />

        {/* Featured Menu Section */}
        <section id="featured-dishes" className="py-16 bg-background">
          <div className="container mx-auto px-4">
            <div className="flex items-center justify-between mb-8">
              <div>
                <h2 className="text-3xl font-bold tracking-tight text-foreground sm:text-4xl mb-2">
                  Featured <span className="text-primary">Dishes</span>
                </h2>
                <p className="text-muted-foreground">
                  Try our most popular items from across the galaxy
                </p>
              </div>
              <Link href="/menu">
                <Button
                  variant="outline"
                  className="border-primary text-primary hover:bg-primary/10 gap-2"
                >
                  View More
                  <MoveRight className="h-4 w-4" />
                </Button>
              </Link>
            </div>

            {loading ? (
              <div className="flex items-center justify-center min-h-[300px]">
                <Loader2 className="h-12 w-12 text-primary animate-spin" />
              </div>
            ) : featuredMenuItems.length === 0 ? (
              <div className="text-center py-12">
                <p className="text-muted-foreground">
                  No featured dishes available at the moment.
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                {featuredMenuItems.slice(0, 8).map((item, index) => (
                  <motion.div
                    key={item.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, delay: index * 0.1 }}
                  >
                    <Card className="overflow-hidden border-border bg-card/50 hover:border-primary/50 transition-all duration-300 group h-full flex flex-col">
                      <div className="relative h-40 w-full overflow-hidden shrink-0">
                        {item.image ? (
                          <Image
                            src={item.image}
                            alt={item.name}
                            fill
                            unoptimized
                            className="object-cover group-hover:scale-110 transition-transform duration-500"
                            onError={(e) => {
                              const target = e.target as HTMLImageElement;
                              target.style.display = 'none';
                            }}
                          />
                        ) : (
                          <div className="w-full h-full bg-muted flex items-center justify-center">
                            <span className="text-muted-foreground text-sm">No image</span>
                          </div>
                        )}
                        <div className="absolute top-2 right-2">
                          <Badge className="bg-black/70 text-primary border-primary text-xs">
                            {item.category}
                          </Badge>
                        </div>
                      </div>
                      <CardHeader className="pb-3">
                        <div className="flex justify-between items-start">
                          <CardTitle className="text-lg font-bold group-hover:text-primary transition-colors line-clamp-1">
                            {item.name}
                          </CardTitle>
                          <span className="text-primary font-bold text-sm">
                            {formatPrice(item.price)}
                          </span>
                        </div>
                        <CardDescription className="line-clamp-2 text-sm">
                          {item.description}
                        </CardDescription>
                      </CardHeader>
                      <CardFooter className="pt-0 mt-auto grid grid-cols-2 gap-2">
                        <Link href={`/details?id=${item.id}`}>
                          <Button
                            variant="outline"
                            className="w-full border-primary/20 hover:bg-primary/10 gap-2 text-sm"
                          >
                            <Eye className="h-4 w-4" />
                            Details
                          </Button>
                        </Link>
                        <Button
                          onClick={() => handleAddToCart(item)}
                          className="w-full bg-primary text-primary-foreground hover:bg-primary/90 gap-2 text-sm"
                        >
                          <AddIcon className="h-4 w-4" />
                          Add
                        </Button>
                      </CardFooter>
                    </Card>
                  </motion.div>
                ))}
              </div>
            )}
          </div>
        </section>

        {/* Offers Section */}
        <section className="py-16 bg-muted/30">
          <div className="container mx-auto px-4">
            <div className="mb-8">
              <h2 className="text-3xl font-bold tracking-tight text-foreground sm:text-4xl mb-2">
                Special <span className="text-primary">Offers</span>
              </h2>
              <p className="text-muted-foreground">
                Exclusive deals for our valued customers
              </p>
            </div>

            <div className="relative">
              <Button
                variant="outline"
                size="icon"
                className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-4 z-10 bg-background border-primary/20 hover:bg-primary/10"
                onClick={() => scrollOffers("left")}
              >
                <ChevronLeft className="h-5 w-5 text-primary" />
              </Button>

              <div
                id="offers-container"
                className="flex gap-6 overflow-x-auto pb-4 px-2 scroll-smooth scrollbar-hide"
                style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
              >
                {featuredOffers.map((offer, index) => (
                  <motion.div
                    key={offer.id}
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.5, delay: index * 0.1 }}
                    className="flex-shrink-0 w-80"
                  >
                    <Card className="border-primary/20 bg-primary/5 hover:shadow-[0_0_30px_rgba(0,255,0,0.2)] transition-all duration-300 h-full overflow-hidden">
                      <div className="relative h-40 w-full overflow-hidden">
                        {offer.image && (
                          <Image
                            src={offer.image}
                            alt={offer.title}
                            fill
                            className="object-cover"
                          />
                        )}
                        <div className="absolute inset-0 bg-gradient-to-t from-background/90 to-transparent" />
                        <div className="absolute top-3 right-3">
                          <Badge className="bg-primary text-primary-foreground text-sm px-2 py-1">
                            {offer.discount}
                          </Badge>
                        </div>
                      </div>
                      <CardHeader className="pb-3">
                        <div className="flex items-start gap-3">
                          <div className="p-2 rounded-full bg-primary/20 text-primary shrink-0">
                            {offer.icon}
                          </div>
                          <div>
                            <CardTitle className="text-lg">
                              {offer.title}
                            </CardTitle>
                            <CardDescription className="mt-1 text-sm">
                              {offer.description}
                            </CardDescription>
                          </div>
                        </div>
                      </CardHeader>
                      <CardContent>
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <span className="text-xs text-muted-foreground">
                              Code:
                            </span>
                            <code className="px-2 py-1 bg-background rounded border border-primary/20 text-primary text-xs font-mono font-bold">
                              {offer.code}
                            </code>
                          </div>
                          <Link href="/offers">
                            <Button
                              variant="ghost"
                              size="sm"
                              className="text-primary hover:bg-primary/10 text-xs"
                            >
                              View All
                            </Button>
                          </Link>
                        </div>
                      </CardContent>
                    </Card>
                  </motion.div>
                ))}
              </div>

              <Button
                variant="outline"
                size="icon"
                className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-4 z-10 bg-background border-primary/20 hover:bg-primary/10"
                onClick={() => scrollOffers("right")}
              >
                <ChevronRight className="h-5 w-5 text-primary" />
              </Button>
            </div>
          </div>
        </section>

        {/* Customer Reviews Section */}
        <section className="py-16 bg-background overflow-hidden">
          <div className="container mx-auto px-4">
            <div className="mb-8">
              <h2 className="text-3xl font-bold tracking-tight text-foreground sm:text-4xl mb-2">
                Customer <span className="text-primary">Reviews</span>
              </h2>
              <p className="text-muted-foreground">
                What our customers are saying about us
              </p>
            </div>

            <div className="relative">
              <motion.div
                className="flex gap-6"
                animate={{
                  x: [0, -(reviews.length * 320 + 6 * 24)],
                }}
                transition={{
                  duration: 60,
                  repeat: Infinity,
                  ease: "linear",
                }}
              >
                {[...reviews, ...reviews, ...reviews].map((review, index) => (
                  <div
                    key={`${review.id}-${index}`}
                    className="flex-shrink-0 w-80"
                  >
                    <Card className="border-primary/20 bg-card/50 h-full">
                      <CardHeader>
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <div className="h-10 w-10 rounded-full bg-primary/20 flex items-center justify-center text-primary font-bold">
                              {review.name.charAt(0)}
                            </div>
                            <div>
                              <CardTitle className="text-base">
                                {review.name}
                              </CardTitle>
                              <CardDescription className="text-xs">
                                {review.date}
                              </CardDescription>
                            </div>
                          </div>
                          <div className="flex items-center gap-1">
                            {[...Array(5)].map((_, i) => (
                              <Star
                                key={i}
                                className={`h-4 w-4 ${
                                  i < review.rating
                                    ? "fill-primary text-primary"
                                    : "text-muted-foreground"
                                }`}
                              />
                            ))}
                          </div>
                        </div>
                      </CardHeader>
                      <CardContent>
                        <p className="text-sm text-muted-foreground">
                          "{review.comment}"
                        </p>
                      </CardContent>
                    </Card>
                  </div>
                ))}
              </motion.div>

              {/* Fade effect on edges */}
              <div className="absolute inset-y-0 left-0 w-24 bg-gradient-to-r from-background to-transparent pointer-events-none" />
              <div className="absolute inset-y-0 right-0 w-24 bg-gradient-to-l from-background to-transparent pointer-events-none" />
            </div>
          </div>
        </section>
      </main>

      <footer className="border-t py-12 bg-background">
        <div className="container mx-auto px-4 text-center">
          <div className="flex justify-center mb-6">
            <div className="relative h-12 w-12 overflow-hidden rounded-full border border-primary">
              <Image
                src="https://slelguoygbfzlpylpxfs.supabase.co/storage/v1/render/image/public/document-uploads/logo3-1770214165568.PNG?width=100&height=100&resize=contain"
                alt="Area 51 Logo"
                fill
                className="object-cover"
              />
            </div>
          </div>
          <p className="text-primary font-bold tracking-widest mb-4">AREA 51</p>
          <p className="text-muted-foreground text-sm">
            © 2026 Area 51 Classified Restaurant. All rights reserved.
          </p>
        </div>
      </footer>

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
                      {item.image ? (
                        <Image
                          src={item.image}
                          alt={item.name}
                          fill
                          unoptimized
                          className="object-cover"
                          onError={(e) => {
                            const target = e.target as HTMLImageElement;
                            target.style.display = 'none';
                          }}
                        />
                      ) : (
                        <div className="w-full h-full bg-muted flex items-center justify-center">
                          <span className="text-muted-foreground text-xs">No image</span>
                        </div>
                      )}
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
