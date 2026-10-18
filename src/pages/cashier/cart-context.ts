import { createContext, useContext } from "react";

export interface CartItem {
  pId: number;
  name: string;
  price: number;
  quantity: number;
}

export interface CartContextValue {
  cartItems: CartItem[];
  addToCart: (item: Omit<CartItem, "quantity">, quantity: number) => void;
  updateCartQuantity: (pId: number, quantity: number) => void;
  removeFromCart: (pId: number) => void;
  setCartItems: React.Dispatch<React.SetStateAction<CartItem[]>>;
  clearCart: () => void;
  cartCount: number;
  totalAmount: number;
}

export const CartContext = createContext<CartContextValue | null>(null);

export function useCart() {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error("useCart must be used within a CartProvider");
  }
  return context;
}
