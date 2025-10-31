import { createSlice, PayloadAction } from "@reduxjs/toolkit";
export interface CartItem { 
  id: number;
  name: string;
  price: number;
  quantity: number;
  image: string;
}

interface CartState {
  items: CartItem[];
}

const initialState: CartState = {
  items: [],
};

const saveUserCart = (cart: CartItem[]) => {
  const token = localStorage.getItem("userToken");
  if (!token) return;
  const users = JSON.parse(localStorage.getItem("users") || "[]");
  const index = users.findIndex((u: any) => u.id === token);
  if (index >= 0) {
    users[index].cart = cart;
    localStorage.setItem("users", JSON.stringify(users));
  }
};

const cartSlice = createSlice({
  name: "cart",
  initialState,
  reducers: {
      setCart(state, action: PayloadAction<CartItem[]>) {
      state.items = action.payload;
    },
    addToCart(state, action: PayloadAction<CartItem>) {
      const existing = state.items.find((i) => i.id === action.payload.id);
      if (existing) existing.quantity += action.payload.quantity;
      else state.items.push(action.payload);
      saveUserCart(state.items);
    },
    removeFromCart: (state, action: PayloadAction<number>) => {
      state.items = state.items.filter((item) => item.id !== action.payload);
      saveUserCart(state.items);
    },
     changeCartQuantity(state, action: PayloadAction<{ id: number; quantity: number }>) {
      const item = state.items.find((i) => i.id === action.payload.id);
      if (item) item.quantity = action.payload.quantity;
      saveUserCart(state.items);
    },
    updateCartItem: (
      state,
      action: PayloadAction<{ id: number; data: Partial<CartItem> }>
    ) => {
      const item = state.items.find((i) => i.id === action.payload.id);
      if (item) {
        Object.assign(item, action.payload.data);
      }
    },
        clearCartState(state) {
      state.items = [];
    },
  },
});

export const { addToCart, removeFromCart, changeCartQuantity, updateCartItem , setCart , clearCartState } =
  cartSlice.actions;

export default cartSlice.reducer;
