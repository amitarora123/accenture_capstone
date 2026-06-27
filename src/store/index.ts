import { configureStore } from '@reduxjs/toolkit';
import { useDispatch, useSelector } from 'react-redux';
import type { TypedUseSelectorHook } from 'react-redux';
import menuReducer from './menuSlice';
import cartReducer from './cartSlice';
import ordersReducer from './ordersSlice';

export const store = configureStore({
  reducer: {
    menu: menuReducer,
    cart: cartReducer,
    orders: ordersReducer,
  },
});

store.subscribe(() => {
  try {
    const state = store.getState();
    localStorage.setItem('cart_items', JSON.stringify(state.cart.items));
    localStorage.setItem('orders_history', JSON.stringify(state.orders.items));
  } catch {
    // Ignore write errors
  }
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;

export const useAppDispatch = () => useDispatch<AppDispatch>();
export const useAppSelector: TypedUseSelectorHook<RootState> = useSelector;
