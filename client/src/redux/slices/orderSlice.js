import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { orderService } from '../../services/api';

export const createNewOrder = createAsyncThunk(
  'orders/createOrder',
  async (orderData, { rejectWithValue }) => {
    try {
      const response = await orderService.createOrder(orderData);
      return response;
    } catch (err) {
      return rejectWithValue(err.message || 'Order creation failed');
    }
  }
);

export const fetchUserOrders = createAsyncThunk(
  'orders/fetchUserOrders',
  async (page = 1, { rejectWithValue }) => {
    try {
      return await orderService.getUserOrders({ page, limit: 20 });
    } catch (err) {
      return rejectWithValue(err.message || 'Failed to load order history');
    }
  }
);

export const fetchOrderById = createAsyncThunk(
  'orders/fetchOrderById',
  async (id, { rejectWithValue }) => {
    try {
      const response = await orderService.getOrderById(id);
      return response.order;
    } catch (err) {
      return rejectWithValue(err.message || 'Order details not found');
    }
  }
);

const orderSlice = createSlice({
  name: 'orders',
  initialState: {
    orders: [],
    currentOrder: null,
    loading: false,
    error: null,
    successMessage: null,
    page: 1,
    pages: 1,
    totalOrders: 0
  },
  reducers: {
    clearOrderState: (state) => {
      state.currentOrder = null;
      state.error = null;
      state.successMessage = null;
    },
    setOrdersPage: (state, action) => { state.page = action.payload; }
  },
  extraReducers: (builder) => {
    builder
      .addCase(createNewOrder.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(createNewOrder.fulfilled, (state, action) => {
        state.loading = false;
        state.currentOrder = action.payload.order;
        state.successMessage = action.payload.message;
        state.orders.unshift(action.payload.order);
      })
      .addCase(createNewOrder.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addCase(fetchUserOrders.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchUserOrders.fulfilled, (state, action) => {
        state.loading = false;
        state.orders = action.payload.orders || [];
        state.page = action.payload.page || 1;
        state.pages = action.payload.pages || 1;
        state.totalOrders = action.payload.totalOrders || 0;
      })
      .addCase(fetchUserOrders.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addCase(fetchOrderById.fulfilled, (state, action) => {
        state.currentOrder = action.payload;
      });
  }
});

export const { clearOrderState, setOrdersPage } = orderSlice.actions;
export default orderSlice.reducer;
