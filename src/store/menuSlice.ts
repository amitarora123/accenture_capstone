import { createSlice } from '@reduxjs/toolkit';

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
  pizzas: [
    {
      id: 'paneer-tikka',
      name: 'Paneer Tikka',
      description: 'This is popular italian pizza flavoured with marinated tikka sauce and paneer',
      price: 290.00,
      type: 'veg',
      ingredients: ['dough/flour', 'pizza sauce', 'pizza sauce seasoning', 'cheese'],
      toppings: ['Paneer', 'Fried Onion', 'Green olive', 'Capsicum', 'Red peprika'],
      image: '/pizza_menu_default.png',
    },
    {
      id: 'chicken-italiaona',
      name: 'Chicken Italiaona',
      description: 'This is popular italian pizza flavoured with light sugary taste and creamy touch',
      price: 350.00,
      type: 'non-veg',
      ingredients: ['deep dish pizza mix', 'pizza sauce', 'pizza sauce seasoning', 'cheese', 'sugar and cinnamon blend', 'plain butter'],
      toppings: ['Pepperoni', 'Chicken Sausage', 'Mushroom', 'Capsicum', 'Black beans'],
      image: '/pizza_menu_default.png',
    },
    {
      id: 'veggie-supreme',
      name: 'Veggie Supreme',
      description: 'This is popular italian pizza flavoured with crushed garlic, with multiple herbs topped up with sweet corn',
      price: 310.00,
      type: 'veg',
      ingredients: ['deep dish pizza mix', 'pizza sauce', 'pizza sauce seasoning', 'cheese', 'garlic herbs', 'flavored butter'],
      toppings: ['Fried Onion', 'Sweet corn', 'Mushroom', 'Capsicum', 'Black olive'],
      image: '/pizza_menu_default.png',
    },
    {
      id: 'tripple-chicken-feast',
      name: 'Tripple Chicken Feast',
      description: 'This is popular italian pizza flavoured with unique greek dressing topped up with keema and meat ball',
      price: 400.00,
      type: 'non-veg',
      ingredients: ['low carb pizza dough', 'pizza sauce', 'pizza sauce seasoning', 'cheese', 'greek dressing', 'cajun'],
      toppings: ['Chicken keema', 'Fried Onion', 'Chicken Meat ball', 'Capsicum', 'Sweet corn'],
      image: '/pizza_menu_default.png',
    },
    {
      id: 'ultimate-chicken',
      name: 'Ultimate Chicken',
      description: 'This is popular italian pizza flavoured with BBQ sauce, flavoured butter. It has spongy base which gives unique taste with multiple toppings',
      price: 625.00,
      type: 'non-veg',
      ingredients: ['deep dish pizza mix', 'pizza sauce', 'pizza sauce seasoning', 'cheese', 'BBQ sauce', 'cajun', 'flavored butter'],
      toppings: ['Pepperoni', 'Fried Onion', 'Chicken Meat ball', 'Chicken Sausage', 'Chicken keema'],
      image: '/pizza_menu_default.png',
    },
  ],
  toppings: [
    { id: 'pepperoni', name: 'Pepperoni', price: 110.00, image: 'pepperoni' },
    { id: 'mushroom', name: 'Mushroom', price: 35.00, image: 'mushroom' },
    { id: 'black-beans', name: 'Black beans', price: 45.00, image: 'black_beans' },
    { id: 'black-olive', name: 'Black olive', price: 25.00, image: 'black_olive' },
    { id: 'green-olive', name: 'Green olive', price: 50.00, image: 'green_olive' },
    { id: 'jalapeno', name: 'Jalapeno', price: 45.00, image: 'jalapeno' },
    { id: 'chicken', name: 'Chicken', price: 60.00, image: 'chicken', defaultChecked: true },
    { id: 'tomato', name: 'Tomato', price: 20.00, image: 'tomato', defaultChecked: true },
    { id: 'red-peprika', name: 'Red peprika', price: 30.00, image: 'red_peprika' },
    { id: 'paneer', name: 'Paneer', price: 45.00, image: 'paneer' },
    { id: 'fried-onion', name: 'Fried Onion', price: 18.00, image: 'fried_onion' },
    { id: 'capsicum', name: 'Capsicum', price: 15.00, image: 'capsicum' },
    { id: 'sweet-corn', name: 'Sweet corn', price: 38.00, image: 'sweet_corn' },
  ],
};

const menuSlice = createSlice({
  name: 'menu',
  initialState,
  reducers: {},
});

export default menuSlice.reducer;
export const selectPizzas = (state: { menu: MenuState }) => state.menu.pizzas;
export const selectToppings = (state: { menu: MenuState }) => state.menu.toppings;
