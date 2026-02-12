"use client"

import { useState, useEffect } from "react"

export type MenuItem = {
  id: string
  name: string
  description: string
  price: number
  category: string
  image: string
}

export type CartItem = MenuItem & {
  quantity: number
}

const CART_STORAGE_KEY = "area51_cart"

function getStoredCart(): CartItem[] {
  if (typeof window === "undefined") return []
  try {
    const stored = localStorage.getItem(CART_STORAGE_KEY)
    return stored ? JSON.parse(stored) : []
  } catch {
    return []
  }
}

function saveCart(cart: CartItem[]) {
  if (typeof window === "undefined") return
  try {
    localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(cart))
  } catch (error) {
    console.error("Failed to save cart:", error)
  }
}

export function useCart() {
  const [cart, setCart] = useState<CartItem[]>(() => getStoredCart())

  // Load cart from localStorage on mount
  useEffect(() => {
    const stored = getStoredCart()
    if (stored.length > 0) {
      setCart(stored)
    }
  }, [])

  // Save cart to localStorage whenever it changes
  useEffect(() => {
    saveCart(cart)
  }, [cart])

  const addToCart = (item: MenuItem) => {
    setCart(prev => {
      const existing = prev.find(i => i.id === item.id)
      if (existing) {
        return prev.map(i => i.id === item.id ? { ...i, quantity: i.quantity + 1 } : i)
      }
      return [...prev, { ...item, quantity: 1 }]
    })
  }

  const removeFromCart = (id: string) => {
    setCart(prev => prev.filter(i => i.id !== id))
  }

  const updateQuantity = (id: string, quantity: number) => {
    if (quantity <= 0) {
      removeFromCart(id)
      return
    }
    setCart(prev => prev.map(i => i.id === id ? { ...i, quantity } : i))
  }

  const clearCart = () => {
    setCart([])
    if (typeof window !== "undefined") {
      localStorage.removeItem(CART_STORAGE_KEY)
    }
  }

  const totalItems = cart.reduce((acc, item) => acc + item.quantity, 0)
  const totalPrice = cart.reduce((acc, item) => acc + item.price * item.quantity, 0)

  return {
    cart,
    addToCart,
    removeFromCart,
    updateQuantity,
    clearCart,
    totalItems,
    totalPrice
  }
}
