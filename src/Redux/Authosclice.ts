import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { AppDispatch } from "./Store";
import { setFavorites } from "./FavSlice";
import { setCart } from "./CartSlice";

interface AuthState {
  token: string | null;
}

const initialState: AuthState = {
  token: localStorage.getItem("userToken"), 
};

const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    login(state, action: PayloadAction<string>) {
      state.token = action.payload;
      localStorage.setItem("userToken", action.payload); 
    },
    logout(state) {
      state.token = null;
      localStorage.removeItem("userToken"); 
    },
  },
});

export const { login, logout } = authSlice.actions;
export const loginWithData =
  (email: string) =>
  (dispatch: AppDispatch) => {
    const users = JSON.parse(localStorage.getItem("users") || "[]");
    const user = users.find((u: any) => u.email === email);

    if (user) {
      dispatch(setCart(user.cart || []));
      dispatch(setFavorites(user.favorites || []));

      localStorage.setItem("userToken", user.id);
      dispatch(login(user.id));
    } else {
      console.warn("User not found!");
    }
  };

export default authSlice.reducer;
