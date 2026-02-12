"use client";

import React, { useState, useEffect } from "react";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Plus, Loader2, Search } from "lucide-react";
import { supabase, MenuItem as DBMenuItem, Category } from "@/lib/supabase";
import { formatPrice } from "@/lib/utils";

// Cart item type (simplified for cart use)
export type CartMenuItem = {
  id: string;
  name: string;
  description: string;
  price: number;
  category: string;
  image: string;
};

export function Menu({
  onAddToCart,
}: {
  onAddToCart: (item: CartMenuItem) => void;
}) {
  const [activeCategory, setActiveCategory] = useState("All");
  const [searchQuery, setSearchQuery] = useState("");
  const [menuItems, setMenuItems] = useState<DBMenuItem[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchData() {
      setLoading(true);
      try {
        // Fetch data from public API route (same as MenuPage)
        const response = await fetch("/api/menu");

        if (response.ok) {
          const data = await response.json();
          setCategories(data.categories);
          setMenuItems(data.menuItems);
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

  const allCategories = ["All", ...categories.map((c) => c.name)];

  const filteredItems = menuItems.filter((item) => {
    const matchesCategory =
      activeCategory === "All" || item.category?.name === activeCategory;
    const matchesSearch =
      searchQuery === "" ||
      item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (item.description &&
        item.description.toLowerCase().includes(searchQuery.toLowerCase()));
    return matchesCategory && matchesSearch;
  });

  const handleAddToCart = (item: DBMenuItem) => {
    onAddToCart({
      id: item.id,
      name: item.name,
      description: item.description || "",
      price: Number(item.price),
      category: item.category?.name || "Uncategorized",
      image: item.image_url || "",
    });
  };

  if (loading) {
    return (
      <section id="menu" className="py-20 bg-background">
        <div className="container mx-auto px-4 flex flex-col items-center justify-center min-h-[400px]">
          <Loader2 className="h-12 w-12 text-primary animate-spin" />
          <p className="mt-4 text-muted-foreground">
            Loading classified menu...
          </p>
        </div>
      </section>
    );
  }

  return (
    <section id="menu" className="py-20 bg-background">
      <div className="container mx-auto px-4">
        <div className="flex flex-col items-center mb-12">
          <h2 className="text-3xl font-bold tracking-tight text-foreground sm:text-4xl mb-4">
            The <span className="text-primary">Classified</span> Menu
          </h2>
          <p className="text-muted-foreground text-center max-w-2xl">
            Choose your mission. Our chefs have traveled light-years to bring
            these flavors to Earth.
          </p>
        </div>

        <Tabs
          defaultValue="All"
          className="w-full mb-12"
          onValueChange={setActiveCategory}
        >
          <div className="flex justify-center">
            <TabsList className="bg-muted border border-border">
              {allCategories.map((cat) => (
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
                    {item.image_url && (
                      <Image
                        src={item.image_url}
                        alt={item.name}
                        fill
                        className="object-cover group-hover:scale-110 transition-transform duration-500"
                      />
                    )}
                    <div className="absolute top-2 right-2">
                      <Badge className="bg-black/70 text-primary border-primary">
                        {item.category?.name || "Special"}
                      </Badge>
                    </div>
                  </div>
                  <CardHeader>
                    <div className="flex justify-between items-start">
                      <CardTitle className="text-xl font-bold group-hover:text-primary transition-colors">
                        {item.name}
                      </CardTitle>
                      <span className="text-primary font-bold">
                        {formatPrice(Number(item.price))}
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
                      <Plus className="h-4 w-4" />
                      Add to Cart
                    </Button>
                  </CardFooter>
                </Card>
              ))
            )}
          </div>
        </Tabs>
      </div>
    </section>
  );
}
