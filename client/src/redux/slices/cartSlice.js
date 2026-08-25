import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { cartService } from '../../services/api';

const savedCartItems = JSON.parse(localStorage.getItem('enen_cart_items') || '[]');

export const syncFetchCart = createAsyncThunk(
  'cart/fetchCart',
  async (_, { rejectWithValue }) => {
    try {
      const response = await cartService.getCart();
      return response.cart;
    } catch (err) {
      return rejectWithValue(err.message);
    }
  }
);

export const syncAddToCart = createAsyncThunk(
  'cart/addToCart',
  async (itemData, { rejectWithValue }) => {
    try {
      const response = await cartService.addToCart(itemData);
      return response.cart;
    } catch (err) {
      return rejectWithValue(err.message);
    }
  }
);

const cartSlice = createSlice({
  name: 'cart',
  initialState: {
    items: savedCartItems,
    isOpen: false,
    loading: false,
    error: null,
    discountCode: '',
    discountPercent: 0,
    toastMessage: null
  },
  reducers: {
    toggleCartDrawer: (state) => {
      state.isOpen = !state.isOpen;
    },
    openCartDrawer: (state) => {
      state.isOpen = true;
    },
    closeCartDrawer: (state) => {
      state.isOpen = false;
    },
    addToCartLocal: (state, action) => {
      const { product, size = 'L', color = 'Black', quantity = 1 } = action.payload;
      const existingIndex = state.items.findIndex(
        i => (i.product._id || i.product.id) === (product._id || product.id) && i.size === size && i.color === color
      );

      if (existingIndex > -1) {
        state.items[existingIndex].quantity += quantity;
      } else {
        state.items.push({
          id: `cart_${Date.now()}_${Math.random().toString(36).substring(2, 5)}`,
          product,
          size,
          color,
          quantity
        });
      }

      localStorage.setItem('enen_cart_items', JSON.stringify(state.items));
      state.toastMessage = `Added ${product.name} (${size}) to cart! 🔥`;
    },
    updateQuantityLocal: (state, action) => {
      const { id, quantity } = action.payload;
      const item = state.items.find(i => i.id === id || i._id === id);
      if (item) {
        if (quantity <= 0) {
          state.items = state.items.filter(i => i.id !== id && i._id !== id);
        } else {
          item.quantity = quantity;
        }
      }
      localStorage.setItem('enen_cart_items', JSON.stringify(state.items));
    },
    removeFromCartLocal: (state, action) => {
      const id = action.payload;
      state.items = state.items.filter(i => i.id !== id && i._id !== id);
      localStorage.setItem('enen_cart_items', JSON.stringify(state.items));
      state.toastMessage = 'Item removed from cart';
    },
    clearCartLocal: (state) => {
      state.items = [];
      state.discountCode = '';
      state.discountPercent = 0;
      localStorage.removeItem('enen_cart_items');
    },
    applyPromoCode: (state, action) => {
      const code = action.payload.trim().toUpperCase();
      if (code === 'BLAZE10') {
        state.discountCode = 'BLAZE10';
        state.discountPercent = 10;
        state.toastMessage = 'Flame Code BLAZE10 applied! 10% OFF 🔥';
      } else if (code === 'ANIME20') {
        state.discountCode = 'ANIME20';
        state.discountPercent = 20;
        state.toastMessage = 'Flame Code ANIME20 applied! 20% OFF 🔥';
      } else {
        state.toastMessage = 'Invalid promo code. Try "BLAZE10"';
      }
    },
    clearToastMessage: (state) => {
      state.toastMessage = null;
    }
  },
  extraReducers: (builder) => {
    builder
      .addCase(syncFetchCart.fulfilled, (state, action) => {
        if (action.payload && action.payload.items) {
          state.items = action.payload.items.map(item => ({
            id: item._id,
            product: item.productId,
            size: item.size,
            color: item.color,
            quantity: item.quantity
          }));
          localStorage.setItem('enen_cart_items', JSON.stringify(state.items));
        }
      });
  }
});

export const {
  toggleCartDrawer,
  openCartDrawer,
  closeCartDrawer,
  addToCartLocal,
  updateQuantityLocal,
  removeFromCartLocal,
  clearCartLocal,
  applyPromoCode,
  clearToastMessage
} = cartSlice.actions;

export default cartSlice.reducer;
