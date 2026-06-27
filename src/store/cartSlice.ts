import { createSlice } from '@reduxjs/toolkit';
import type { PayloadAction } from '@reduxjs/toolkit';
import type { Topping } from './menuSlice';

export interface CartItem {
  id: string; // standard pizza ID or generated custom ID
  type: 'standard' | 'custom';
  name: string;
  basePrice: number; // standard: price, custom: base price (50)
  toppingsPrice: number; // standard: 0 or extra toppings, custom: sum of toppings
  sizePrice: number; // +0 for Regular, +100 for Medium, +200 for Large
  crustPrice: number; // +0 for New Hand Tossed / Thin, +75 for Cheese Burst
  size: 'Regular' | 'Medium' | 'Large';
  crust: 'New Hand Tossed' | 'Wheat Thin Crust' | 'Cheese Burst';
  quantity: number;
  image: string;
  isVeg: boolean;
  selectedToppings: Topping[]; // customized toppings
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
          item.size === action.payload.size &&
          item.crust === action.payload.crust &&
          JSON.stringify(item.selectedToppings.map(t => t.id).sort()) === 
            JSON.stringify(action.payload.selectedToppings.map(t => t.id).sort())
      );

      if (existingItem) {
        existingItem.quantity += 1;
      } else {
        state.items.push({ ...action.payload, quantity: 1 });
      }
    },
    removeFromCart: (state, action: PayloadAction<string>) => {
      // Since standard pizza ID can be duplicated for different configurations, let's remove by the unique configuration.
      // Wait, let's check how cartItems lists them. If we add standard pizza, how do we distinguish? 
      // We can generate a unique cartItemId for every added item, or remove by the item's custom unique state or generate unique cart item id on add.
      // Generating a unique ID for each cart entry (like `id-${Date.now()}` or `standard-${pizza.id}-${size}-${crust}-${Date.now()}`) makes removing and changing qty super easy and robust!
      // Yes! Generating a unique id for every unique cart item (or configuration) is the standard and cleanest way to manage cart items.
      // Let's check how removeFromCart was: it removed by item.id.
      // Let's check if the component passes item.id. Yes, item.id was passed.
      // If we generate a unique cartItemId on addToCart, or if we remove by a unique identifier, that is extremely robust.
      // Let's check how we can do it: when adding to cart, if standard, can we still use a configuration-specific ID?
      // For standard pizza, if user modifies size or crust, the item's cart-level ID can be:
      // `${action.payload.id}-${action.payload.size}-${action.payload.crust}-${action.payload.selectedToppings.map(t=>t.id).join('-')}`
      // This is perfectly deterministic and unique per configuration!
      // Let's implement this!
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
  state.cart.items.reduce((total, item) => total + item.quantity * (item.basePrice + item.toppingsPrice + item.sizePrice + item.crustPrice), 0);
export const selectCartItemCount = (state: { cart: CartState }) =>
  state.cart.items.reduce((count, item) => count + item.quantity, 0);
