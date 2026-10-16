import { useEffect, useState, type ReactNode } from "react";
import { CartContext, type CartItem } from "./cart-context";

const CART_STORAGE_KEY = "racha_cashier_cart";

export function CartProvider({ children }: { children: ReactNode }) {
  const [cartItems, setCartItems] = useState<CartItem[]>(() => {
    try {
      const stored = sessionStorage.getItem(CART_STORAGE_KEY);
      return stored ? (JSON.parse(stored) as CartItem[]) : [];
    } catch {
      return [];
    }
  });

  useEffect(() => {
    try {
      sessionStorage.setItem(CART_STORAGE_KEY, JSON.stringify(cartItems));
    } catch {
      // ignore storage errors
    }
  }, [cartItems]);

  const addToCart = (item: Omit<CartItem, "quantity">, quantity: number) => {
    setCartItems((current) => {
      const existing = current.find((i) => i.pId === item.pId);
      if (existing) {
        return current.map((i) =>
          i.pId === item.pId ? { ...i, quantity: i.quantity + quantity } : i,
        );
      }
      return [...current, { ...item, quantity }];
    });
  };

  const updateCartQuantity = (pId: number, quantity: number) => {
    setCartItems((current) =>
      current.map((item) => (item.pId === pId ? { ...item, quantity } : item)),
    );
  };

  const removeFromCart = (pId: number) => {
    setCartItems((current) => current.filter((item) => item.pId !== pId));
  };

  const clearCart = () => {
    setCartItems([]);
  };

  const cartCount = cartItems.reduce((sum, item) => sum + item.quantity, 0);
  const totalAmount = cartItems.reduce(
    (sum, item) => sum + item.price * item.quantity,
    0,
  );

  return (
    <CartContext.Provider
      value={{
        cartItems,
        addToCart,
        updateCartQuantity,
        removeFromCart,
        setCartItems,
        clearCart,
        cartCount,
        totalAmount,
      }}
    >
      {children}
    </CartContext.Provider>
  );
}
