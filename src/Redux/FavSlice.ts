import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { FavItem } from "../types/FavItem";

const initialState = { items: [] as FavItem[] };
const saveUserFav = (items: FavItem[]) => {
  const token = localStorage.getItem("userToken");
  if (!token) return;
  const users = JSON.parse(localStorage.getItem("users") || "[]");
  const index = users.findIndex((u: any) => u.id === token);
  if (index >= 0) {
    users[index].favorites = items;
    localStorage.setItem("users", JSON.stringify(users));
  }
};
const favSlice = createSlice({
  name: "favorites",
  initialState,
  reducers: {
        setFavorites(state, action: PayloadAction<FavItem[]>) {
      state.items = action.payload;
    },
   addToFavorite(state, action: PayloadAction<FavItem>) {
      const exists = state.items.find((i) => i.id === action.payload.id);
      if (!exists) state.items.push(action.payload);
      else state.items = state.items.filter((i) => i.id !== action.payload.id);
      saveUserFav(state.items);
    },
    removeFromFavorite(state, action: PayloadAction<number>) {
      state.items = state.items.filter((i) => i.id !== action.payload);
      saveUserFav(state.items);
    },
    removeAllFavorite(state) {
      state.items = [];
      saveUserFav([]);
    },
    clearFavoritesState(state) {
      state.items = [];
      saveUserFav([]);
    },  },
});

export default favSlice.reducer;
export const { addToFavorite, removeFromFavorite, removeAllFavorite ,setFavorites , clearFavoritesState } =
  favSlice.actions;
