"use client";

import React from "react";
import { Navbar } from "@/components/navbar";
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
import { motion } from "framer-motion";
import { Clock, Percent, Zap } from "lucide-react";

const offers = [
  {
    id: 1,
    title: "First Order Discount",
    description: "Get 20% off on your first order",
    discount: "20%",
    icon: <Zap className="h-8 w-8" />,
    validUntil: "Limited Time",
    code: "FIRST20",
    color: "bg-primary/10 border-primary/20",
    image:
      "https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=600&h=400&fit=crop",
  },
  {
    id: 2,
    title: "Weekend Special",
    description: "Free delivery on all orders over 30,000 RWF",
    discount: "FREE",
    icon: <Clock className="h-8 w-8" />,
    validUntil: "Sat & Sun",
    code: "WEEKEND",
    color: "bg-primary/10 border-primary/20",
    image:
      "https://images.unsplash.com/photo-1606787366850-de6330128bfc?w=600&h=400&fit=crop",
  },
  {
    id: 3,
    title: "Lunch Combo",
    description: "Buy any main course and get a drink free",
    discount: "BOGO",
    icon: <Percent className="h-8 w-8" />,
    validUntil: "11AM - 3PM",
    code: "LUNCH",
    color: "bg-primary/10 border-primary/20",
    image:
      "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=600&h=400&fit=crop",
  },
  {
    id: 4,
    title: "Family Feast",
    description: "15% off on orders of 4 or more items",
    discount: "15%",
    icon: <Zap className="h-8 w-8" />,
    validUntil: "Always",
    code: "FAMILY15",
    color: "bg-primary/10 border-primary/20",
    image:
      "https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=600&h=400&fit=crop",
  },
];

export default function OffersPage() {
  return (
    <div className="min-h-screen bg-background text-foreground selection:bg-primary selection:text-primary-foreground">
      <Navbar onCartClick={() => {}} />

      <main className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-primary mb-2">
            Special Offers
          </h1>
          <p className="text-muted-foreground">
            Exclusive deals for our valued customers
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {offers.map((offer, index) => (
            <motion.div
              key={offer.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
            >
              <Card
                className={`${offer.color} hover:shadow-[0_0_30px_rgba(0,255,0,0.2)] transition-all duration-300 overflow-hidden`}
              >
                <div className="relative h-48 w-full overflow-hidden">
                  <img
                    src={offer.image}
                    alt={offer.title}
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute top-3 right-3">
                    <Badge className="bg-primary text-primary-foreground text-lg px-3 py-1">
                      {offer.discount}
                    </Badge>
                  </div>
                </div>
                <CardHeader>
                  <div className="flex items-start gap-3">
                    <div className="p-3 rounded-full bg-primary/20 text-primary">
                      {offer.icon}
                    </div>
                    <div>
                      <CardTitle className="text-xl">{offer.title}</CardTitle>
                      <CardDescription className="mt-1">
                        {offer.description}
                      </CardDescription>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Clock className="h-4 w-4" />
                    <span>Valid: {offer.validUntil}</span>
                  </div>
                </CardContent>
                <CardFooter className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="text-sm text-muted-foreground">Code:</span>
                    <code className="px-3 py-1 bg-background rounded border border-primary/20 text-primary font-mono font-bold">
                      {offer.code}
                    </code>
                  </div>
                  <Button className="bg-primary text-primary-foreground hover:bg-primary/90">
                    Apply Now
                  </Button>
                </CardFooter>
              </Card>
            </motion.div>
          ))}
        </div>

        <div className="mt-12 p-6 rounded-lg bg-primary/5 border border-primary/20">
          <h2 className="text-xl font-bold text-primary mb-2">
            Terms & Conditions
          </h2>
          <ul className="text-sm text-muted-foreground space-y-1">
            <li>• Offers cannot be combined with other promotions</li>
            <li>• Valid only on online orders</li>
            <li>• Management reserves the right to modify or cancel offers</li>
            <li>• Apply promo code at checkout to avail the offer</li>
          </ul>
        </div>
      </main>
    </div>
  );
}
