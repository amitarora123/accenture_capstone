import { createSlice } from '@reduxjs/toolkit';
import type { PayloadAction } from '@reduxjs/toolkit';

export interface OrderItemDetails {
  name: string;
  quantity: number;
  size: string;
  crust: string;
}

export interface Order {
  id: string;
  name: string;
  address: string;
  phone: string;
  amount: number;
  items: OrderItemDetails[];
  status: 'received' | 'preparing' | 'baking' | 'out_for_delivery' | 'delivered';
  createdAt: string;
}

interface OrdersState {
  items: Order[];
}

const loadOrdersState = (): Order[] => {
  try {
    const serializedState = localStorage.getItem('orders_history');
    if (serializedState === null) {
      return [];
    }
    return JSON.parse(serializedState);
  } catch {
    return [];
  }
};

const initialState: OrdersState = {
  items: loadOrdersState(),
};

const ordersSlice = createSlice({
  name: 'orders',
  initialState,
  reducers: {
    addOrder: (state, action: PayloadAction<Order>) => {
      state.items.push(action.payload);
      try {
        localStorage.setItem('orders_history', JSON.stringify(state.items));
      } catch {
        // Ignore errors
      }
    },
    updateOrderStatus: (
      state,
      action: PayloadAction<{ orderId: string; status: Order['status'] }>
    ) => {
      const order = state.items.find((o) => o.id === action.payload.orderId);
      if (order) {
        order.status = action.payload.status;
        try {
          localStorage.setItem('orders_history', JSON.stringify(state.items));
        } catch {
          // Ignore errors
        }
      }
    },
  },
});

export const { addOrder, updateOrderStatus } = ordersSlice.actions;
export default ordersSlice.reducer;
export const selectAllOrders = (state: { orders: OrdersState }) => state.orders.items;
export const selectOrderById = (state: { orders: OrdersState }, orderId: string) =>
  state.orders.items.find((o) => o.id === orderId);
