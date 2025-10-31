import { createSlice, PayloadAction, createAsyncThunk } from "@reduxjs/toolkit";
import axios from "axios";

export interface OrderItem {
  id: string | number;  
  name: string;
  quantity: number;
  price: number;
}

export interface Order {
  id: string;
  userId: string;
  userName: string;
  items: OrderItem[];
  total: number;
  date: string;
  status: string;
}

interface OrdersState {
  orders: Order[];
  loading: boolean;
  error: string | null;
}

const initialState: OrdersState = {
  orders:[],
  loading: false,
  error: null,
};

const updateProductStock = async (item: OrderItem, increment: boolean) => {
  const productRes = await axios.get(
    `https://68f278b4b36f9750deecbed2.mockapi.io/data/api/products/${item.id}`
  );
  const product = productRes.data;
  const newStock = increment 
    ? Number(product.stock) + item.quantity 
    : Number(product.stock) - item.quantity;

  if (!increment && Number(product.stock) < item.quantity) {
    throw new Error(`Insufficient stock for product: ${item.name}. Available: ${product.stock}`);
  }

  await axios.put(
    `https://68f278b4b36f9750deecbed2.mockapi.io/data/api/products/${item.id}`,
    { ...product, stock: newStock }
  );
};

export const addOrderAsync = createAsyncThunk(
  "orders/addOrderAsync",
  async (order: Order, { rejectWithValue }) => {
    try {
      for (const item of order.items) {
        await updateProductStock(item, false); 
      }

      const response = await axios.post(
        "https://68f278b4b36f9750deecbed2.mockapi.io/data/api/orders",
        order
      );

      return response.data as Order;
    } catch (error: any) {
      return rejectWithValue(error.message);
    }
  }
);

export const fetchOrdersAsync = createAsyncThunk<Order[]>(
  "orders/fetchOrdersAsync",
  async (userId, { rejectWithValue }) => {
    try {
      const response = await axios.get(
        `https://68f278b4b36f9750deecbed2.mockapi.io/data/api/orders`
      );
      return response.data as Order[];
    } catch (error: any) {
      return rejectWithValue(error.message);
    }
  }
);



export const updateOrderAsync = createAsyncThunk(
  "orders/updateOrderAsync",
  async (order: Order, { rejectWithValue }) => {
    try {
      const oldOrderRes = await axios.get(
        `https://68f278b4b36f9750deecbed2.mockapi.io/data/api/orders/${order.id}`
      );
      const oldOrder: Order = oldOrderRes.data;

      if (oldOrder.status === "pending" && order.status === "canceled") {
        for (const item of oldOrder.items) {
          await updateProductStock(item, true); 
        }
      }

      if (oldOrder.status === "canceled" && order.status === "pending") {
        for (const item of oldOrder.items) {
          await updateProductStock(item, false);
        }
      }

      const response = await axios.put(
        `https://68f278b4b36f9750deecbed2.mockapi.io/data/api/orders/${order.id}`,
        order
      );

      return response.data as Order;
    } catch (error: any) {
      return rejectWithValue(error.message);
    }
  }
);

export const deleteOrderAsync = createAsyncThunk(
  "orders/deleteOrderAsync",
  async (orderId: string, { rejectWithValue }) => {
    try {
      const oldOrderRes = await axios.get(
        `https://68f278b4b36f9750deecbed2.mockapi.io/data/api/orders/${orderId}`
      );
      const oldOrder: Order = oldOrderRes.data;

      if (oldOrder.status === "pending") {
        for (const item of oldOrder.items) {
          const productRes = await axios.get(
            `https://68f278b4b36f9750deecbed2.mockapi.io/data/api/products/${item.id}`
          );
          const product = productRes.data;
          const newStock = Number(product.stock) + item.quantity;
          await axios.put(
            `https://68f278b4b36f9750deecbed2.mockapi.io/data/api/products/${item.id}`,
            { ...product, stock: newStock }
          );
        }
      }

      await axios.delete(
        `https://68f278b4b36f9750deecbed2.mockapi.io/data/api/orders/${orderId}`
      );

      return orderId;
    } catch (error: any) {
      return rejectWithValue(error.message);
    }
  }
);

const orderSlice = createSlice({
  name: "orders",
  initialState,
  reducers: {
    setOrders: (state, action: PayloadAction<Order[]>) => {
      state.orders = action.payload;
      localStorage.setItem("orders", JSON.stringify(state.orders));
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(addOrderAsync.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(addOrderAsync.fulfilled, (state, action: PayloadAction<Order>) => {
        state.loading = false;
        state.orders.push(action.payload);
        localStorage.setItem("orders", JSON.stringify(state.orders));
      })
      .addCase(addOrderAsync.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      .addCase(fetchOrdersAsync.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchOrdersAsync.fulfilled, (state, action: PayloadAction<Order[]>) => {
        state.loading = false;
        state.orders = action.payload;
        localStorage.setItem("orders", JSON.stringify(state.orders));
      })
      .addCase(fetchOrdersAsync.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      .addCase(updateOrderAsync.fulfilled, (state, action) => {
        const index = state.orders.findIndex(o => o.id === action.payload.id);
        if (index >= 0) state.orders[index] = action.payload;
        localStorage.setItem("orders", JSON.stringify(state.orders));
      })
      .addCase(deleteOrderAsync.fulfilled, (state, action: PayloadAction<string>) => {
  state.orders = state.orders.filter(order => order.id !== action.payload);
  localStorage.setItem("orders", JSON.stringify(state.orders));
});

  },
});

export const { setOrders } = orderSlice.actions;
export default orderSlice.reducer;
