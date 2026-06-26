import { createSlice } from '@reduxjs/toolkit';
import type { PayloadAction } from '@reduxjs/toolkit';
import type { Topping } from './menuSlice';

export interface CartItem {
  id: string; // standard pizza ID or generated custom ID
  type: 'standard' | 'custom';
  name: string;
  basePrice: number; // standard: price, custom: 0
  toppingsPrice: number; // standard: 0, custom: sum of toppings
  quantity: number;
  image: string;
  isVeg: boolean;
  selectedToppings: Topping[]; // only for custom pizzas
}

interface CartState {
  items: CartItem[];
}

const loadCartState = (): CartItem[] => {
  try {
    const serializedState = localStorage.getItem('cart_items');
    if (serializedState === null) {
      return [];
    }
    return JSON.parse(serializedState);
  } catch {
    return [];
  }
};

const initialState: CartState = {
  items: loadCartState(),
};

const cartSlice = createSlice({
  name: 'cart',
  initialState,
  reducers: {
    addToCart: (state, action: PayloadAction<Omit<CartItem, 'quantity'>>) => {
      const existingItem = state.items.find(
        (item) =>
          item.id === action.payload.id &&
          JSON.stringify(item.selectedToppings) === JSON.stringify(action.payload.selectedToppings)
      );

      if (existingItem) {
        existingItem.quantity += 1;
      } else {
        state.items.push({ ...action.payload, quantity: 1 });
      }
    },
    removeFromCart: (state, action: PayloadAction<string>) => {
      state.items = state.items.filter((item) => item.id !== action.payload);
    },
    updateQuantity: (state, action: PayloadAction<{ id: string; quantity: number }>) => {
      const item = state.items.find((item) => item.id === action.payload.id);
      if (item) {
        item.quantity = Math.max(1, action.payload.quantity);
      }
    },
    clearCart: (state) => {
      state.items = [];
    },
  },
});

export const { addToCart, removeFromCart, updateQuantity, clearCart } = cartSlice.actions;
export default cartSlice.reducer;
export const selectCartItems = (state: { cart: CartState }) => state.cart.items;
export const selectCartTotal = (state: { cart: CartState }) =>
  state.cart.items.reduce((total, item) => total + item.quantity * (item.basePrice + item.toppingsPrice), 0);
export const selectCartItemCount = (state: { cart: CartState }) =>
  state.cart.items.reduce((count, item) => count + item.quantity, 0);
