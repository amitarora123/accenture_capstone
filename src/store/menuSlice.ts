import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';

export interface Pizza {
  id: string;
  name: string;
  description: string;
  price: number;
  type: 'veg' | 'non-veg';
  ingredients: string[];
  toppings: string[];
  image: string;
}

export interface Topping {
  id: string;
  name: string;
  price: number;
  image: string;
  defaultChecked?: boolean;
}

interface MenuState {
  pizzas: Pizza[];
  toppings: Topping[];
}

const initialState: MenuState = {
  pizzas: [],
  toppings: [],
};

export const fetchMenuData = createAsyncThunk(
  'menu/fetchMenuData',
  async () => {
    const [pizzasRes, toppingsRes] = await Promise.all([
      fetch('/pizza.json'),
      fetch('/ingredients.json'),
    ]);

    if (!pizzasRes.ok || !toppingsRes.ok) {
      throw new Error('Failed to fetch menu data');
    }

    const pizzasRaw = await pizzasRes.json();
    const toppingsRaw = await toppingsRes.json();

    const cleanUrl = (url: string) => {
      if (url.endsWith('%22')) {
        return url.slice(0, -3);
      }
      return url;
    };

    const pizzas: Pizza[] = pizzasRaw.map((p: any) => ({
      id: String(p.id),
      name: String(p.name),
      description: String(p.description),
      price: Number(p.price),
      type: p.type === 'veg' ? 'veg' : 'non-veg',
      ingredients: Array.isArray(p.ingredients) ? p.ingredients : [],
      toppings: Array.isArray(p.topping) ? p.topping : [],
      image: cleanUrl(String(p.image)),
    }));

    const toppings: Topping[] = toppingsRaw.map((t: any) => ({
      id: String(t.id),
      name: String(t.tname),
      price: Number(t.price),
      image: cleanUrl(String(t.image)),
      defaultChecked: t.tname === 'Chicken' || t.tname === 'Tomato',
    }));

    return { pizzas, toppings };
  }
);

const menuSlice = createSlice({
  name: 'menu',
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder.addCase(fetchMenuData.fulfilled, (state, action) => {
      state.pizzas = action.payload.pizzas;
      state.toppings = action.payload.toppings;
    });
  },
});

export default menuSlice.reducer;
export const selectPizzas = (state: { menu: MenuState }) => state.menu.pizzas;
export const selectToppings = (state: { menu: MenuState }) => state.menu.toppings;
