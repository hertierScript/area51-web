"use client";

import React, { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import Image from "next/image";
import {
  ShoppingCart,
  Menu as MenuIcon,
  X,
  User,
  LogOut,
  Settings,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { ThemeToggle } from "./theme-toggle";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { cn } from "@/lib/utils";
import { supabase } from "@/lib/supabase";

type UserSession = {
  id: string;
  email: string;
  user_metadata: {
    full_name?: string;
    name?: string;
  };
};

// Helper functions outside component
function getUserInitials(email: string, name?: string) {
  if (name) {
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  }
  return email[0]?.toUpperCase() || "?";
}

function getUserDisplayName(email: string, name?: string) {
  return name || email?.split("@")[0] || "User";
}

export function Navbar({
  cartCount = 0,
  onCartClick,
}: {
  cartCount?: number;
  onCartClick?: () => void;
}) {
  const pathname = usePathname();
  const router = useRouter();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [userSession, setUserSession] = useState<UserSession | null>(null);
  const [isAuthLoading, setIsAuthLoading] = useState(true);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const navLinks = [
    { href: "/", label: "Home" },
    { href: "/menu", label: "Menu" },
    { href: "/offers", label: "Offers" },
    { href: "/orders", label: "My Orders" },
  ];

  // Check authentication status on mount
  useEffect(() => {
    const checkAuth = async () => {
      try {
        const {
          data: { session },
        } = await supabase.auth.getSession();
        if (session?.user) {
          setUserSession({
            id: session.user.id,
            email: session.user.email || "",
            user_metadata: session.user.user_metadata || {},
          });
        } else {
          setUserSession(null);
        }
      } catch (error) {
        console.error("Auth check error:", error);
        setUserSession(null);
      } finally {
        setIsAuthLoading(false);
      }
    };

    checkAuth();

    // Subscribe to auth state changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      if (session?.user) {
        setUserSession({
          id: session.user.id,
          email: session.user.email || "",
          user_metadata: session.user.user_metadata || {},
        });
      } else {
        setUserSession(null);
      }
    });

    return () => subscription.unsubscribe();
  }, [router]);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        // Dropdown will close automatically via onOpenChange
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const isActive = (href: string) => {
    if (href === "/") return pathname === "/";
    return pathname.startsWith(href);
  };

  const handleLinkClick = () => {
    setMobileMenuOpen(false);
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    setUserSession(null);
    router.push("/");
    router.refresh();
  };

  // Show loading state while checking auth
  if (isAuthLoading) {
    return (
      <nav className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container mx-auto flex h-16 items-center justify-between px-4">
          <div className="flex items-center gap-4">
            <Link href="/" className="flex items-center space-x-2">
              <div className="relative h-10 w-10 overflow-hidden rounded-full border-2 border-primary/30 shadow-sm">
                <Image
                  src="https://slelguoygbfzlpylpxfs.supabase.co/storage/v1/render/image/public/document-uploads/logo3-1770214165568.PNG?width=80&height=80&resize=contain"
                  alt="Area 51 Logo"
                  fill
                  className="object-cover"
                />
              </div>
              <span className="text-xl font-bold tracking-tighter text-primary">
                AREA 51
              </span>
            </Link>
          </div>
          <div className="flex items-center space-x-3">
            <ThemeToggle />
            <Button variant="ghost" size="icon" className="animate-pulse">
              <ShoppingCart className="h-5 w-5" />
            </Button>
          </div>
        </div>
      </nav>
    );
  }

  return (
    <nav className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container mx-auto flex h-16 items-center justify-between px-4">
        {/* Logo */}
        <div className="flex items-center gap-4">
          <Link href="/" className="flex items-center space-x-2">
            <div className="relative h-10 w-10 overflow-hidden rounded-full border-2 border-primary/30 shadow-sm">
              <Image
                src="https://slelguoygbfzlpylpxfs.supabase.co/storage/v1/render/image/public/document-uploads/logo3-1770214165568.PNG?width=80&height=80&resize=contain"
                alt="Area 51 Logo"
                fill
                className="object-cover"
              />
            </div>
            <span className="text-xl font-bold tracking-tighter text-primary">
              AREA 51
            </span>
          </Link>
        </div>

        {/* Desktop nav */}
        <div className="hidden md:flex items-center space-x-8 text-sm font-medium">
          {navLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className={cn(
                "transition-all duration-300 relative py-1.5 px-1",
                isActive(link.href)
                  ? "text-primary font-semibold after:absolute after:bottom-0 after:left-0 after:h-0.5 after:w-full after:bg-primary after:rounded-full"
                  : "text-muted-foreground hover:text-primary",
              )}
            >
              {link.label}
            </Link>
          ))}
        </div>

        {/* Right side actions */}
        <div className="flex items-center space-x-3">
          <ThemeToggle />

          <Button
            variant="ghost"
            size="icon"
            className="relative text-primary hover:bg-primary/10 hover:text-primary"
            onClick={onCartClick}
          >
            <ShoppingCart className="h-5 w-5" />
            {cartCount > 0 && (
              <Badge className="absolute -top-1 -right-1 h-5 w-5 flex items-center justify-center p-0 text-[10px] bg-primary text-primary-foreground shadow-sm">
                {cartCount}
              </Badge>
            )}
          </Button>

          {/* User Profile / Auth Button */}
          {userSession ? (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button className="flex items-center gap-2 rounded-full border border-primary/30 bg-primary/10 px-2 py-1 hover:bg-primary/20 transition-colors">
                  <Avatar className="h-8 w-8">
                    <AvatarFallback className="bg-primary text-primary-foreground text-sm font-semibold">
                      {getUserInitials(
                        userSession.email,
                        userSession.user_metadata.full_name ||
                          userSession.user_metadata.name,
                      )}
                    </AvatarFallback>
                  </Avatar>
                  <span className="hidden lg:block text-sm font-medium text-primary">
                    {getUserDisplayName(
                      userSession.email,
                      userSession.user_metadata.full_name ||
                        userSession.user_metadata.name,
                    )}
                  </span>
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56">
                <DropdownMenuLabel>
                  <div className="flex flex-col space-y-1">
                    <p className="text-sm font-medium">
                      {getUserDisplayName(
                        userSession.email,
                        userSession.user_metadata.full_name ||
                          userSession.user_metadata.name,
                      )}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {userSession.email}
                    </p>
                  </div>
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem asChild>
                  <Link href="/orders" className="flex items-center cursor-pointer">
                    <ShoppingCart className="mr-2 h-4 w-4" />
                    My Orders
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link href="/profile" className="flex items-center cursor-pointer">
                    <User className="mr-2 h-4 w-4" />
                    Profile
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link href="/settings" className="flex items-center cursor-pointer">
                    <Settings className="mr-2 h-4 w-4" />
                    Settings
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  onClick={handleLogout}
                  className="cursor-pointer text-destructive focus:text-destructive"
                >
                  <LogOut className="mr-2 h-4 w-4" />
                  Log out
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          ) : (
            <Link href="/login">
              <Button
                variant="outline"
                className="border-primary/40 text-primary hover:bg-primary/10 hover:text-primary transition-colors"
              >
                Sign In
              </Button>
            </Link>
          )}

          {/* Mobile Menu Trigger */}
          <Sheet open={mobileMenuOpen} onOpenChange={setMobileMenuOpen}>
            <SheetTrigger asChild>
              <Button className="md:hidden" variant="ghost" size="icon">
                <MenuIcon className="h-6 w-6 text-primary" />
              </Button>
            </SheetTrigger>

            <SheetContent
              side="right"
              className="w-[85vw] max-w-sm bg-gradient-to-b from-background to-background/95 border-l border-primary/20 p-0"
            >
              <div className="flex flex-col h-full">
                {/* Header */}
                <SheetHeader className="p-6 border-b border-border/50 bg-gradient-to-r from-primary/5 to-transparent">
                  <div className="flex items-center justify-between">
                    <SheetTitle className="text-2xl font-bold tracking-tight text-primary flex items-center gap-3">
                      <div className="relative h-9 w-9 rounded-full overflow-hidden border border-primary/30 shadow-sm">
                        <Image
                          src="https://slelguoygbfzlpylpxfs.supabase.co/storage/v1/render/image/public/document-uploads/logo3-1770214165568.PNG?width=80&height=80&resize=contain"
                          alt="Area 51 Logo"
                          fill
                          className="object-cover"
                        />
                      </div>
                      AREA 51
                    </SheetTitle>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => setMobileMenuOpen(false)}
                    >
                      <X className="h-5 w-5" />
                    </Button>
                  </div>
                </SheetHeader>

                {/* User Info (if logged in) */}
                {userSession && (
                  <div className="px-3 py-4 border-b border-border/50">
                    <div className="flex items-center gap-3 p-3 bg-primary/5 rounded-xl">
                      <Avatar className="h-10 w-10">
                        <AvatarFallback className="bg-primary text-primary-foreground font-semibold">
                          {getUserInitials(
                            userSession.email,
                            userSession.user_metadata.full_name ||
                              userSession.user_metadata.name,
                          )}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium truncate">
                          {getUserDisplayName(
                            userSession.email,
                            userSession.user_metadata.full_name ||
                              userSession.user_metadata.name,
                          )}
                        </p>
                        <p className="text-xs text-muted-foreground truncate">
                          {userSession.email}
                        </p>
                      </div>
                    </div>
                  </div>
                )}

                {/* Navigation links */}
                <nav className="flex-1 px-3 py-6 space-y-1.5 overflow-y-auto">
                  {navLinks.map((link) => (
                    <Link
                      key={link.href}
                      href={link.href}
                      onClick={handleLinkClick}
                      className={cn(
                        "group flex items-center gap-3 px-4 py-3.5 rounded-xl text-lg font-medium transition-all duration-200",
                        isActive(link.href)
                          ? "bg-primary/15 text-primary font-semibold shadow-sm border-l-4 border-primary pl-3"
                          : "text-muted-foreground hover:bg-muted/70 hover:text-foreground hover:pl-5",
                      )}
                    >
                      {link.label}
                    </Link>
                  ))}
                </nav>

                {/* Footer action */}
                <div className="p-6 border-t border-border/50 mt-auto">
                  {userSession ? (
                    <Button
                      variant="outline"
                      className="w-full border-destructive/50 text-destructive hover:bg-destructive/10 hover:text-destructive"
                      onClick={() => {
                        handleLogout();
                        setMobileMenuOpen(false);
                      }}
                    >
                      <LogOut className="mr-2 h-4 w-4" />
                      Log out
                    </Button>
                  ) : (
                    <Link
                      href="/login"
                      onClick={handleLinkClick}
                      className="block"
                    >
                      <Button
                        variant="default"
                        className="w-full bg-primary hover:bg-primary/90 text-primary-foreground text-base py-6"
                      >
                        Sign In / Register
                      </Button>
                    </Link>
                  )}
                </div>
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </nav>
  );
}
