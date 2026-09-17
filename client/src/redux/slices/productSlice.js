import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { productService } from '../../services/api';

export const fetchProducts = createAsyncThunk(
  'products/fetchProducts',
  async (params = {}, { rejectWithValue }) => {
    try {
      const response = await productService.getProducts(params);
      return response;
    } catch (err) {
      return rejectWithValue(err.message || 'Failed to fetch products');
    }
  }
);

export const fetchProductById = createAsyncThunk(
  'products/fetchProductById',
  async (id, { rejectWithValue }) => {
    try {
      const response = await productService.getProductById(id);
      return response.product;
    } catch (err) {
      return rejectWithValue(err.message || 'Product not found');
    }
  }
);

const productSlice = createSlice({
  name: 'products',
  initialState: {
    items: [],
    currentProduct: null,
    loading: false,
    detailLoading: false,
    error: null,
    page: 1,
    pages: 1,
    totalProducts: 0,
    filters: {
      category: 'All',
      collection: 'All',
      search: '',
      minPrice: 0,
      maxPrice: 2000,
      size: '',
      color: '',
      sort: 'newest'
    }
  },
  reducers: {
    setFilter: (state, action) => {
      state.filters = { ...state.filters, ...action.payload };
    },
    resetFilters: (state) => {
      state.filters = {
        category: 'All',
        collection: 'All',
        search: '',
        minPrice: 0,
        maxPrice: 2000,
        size: '',
        color: '',
        sort: 'newest'
      };
      state.page = 1;
    },
    clearCurrentProduct: (state) => {
      state.currentProduct = null;
    }
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchProducts.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchProducts.fulfilled, (state, action) => {
        state.loading = false;
        state.items = action.payload.products || [];
        state.page = action.payload.page || 1;
        state.pages = action.payload.pages || 1;
        state.totalProducts = action.payload.totalProducts || 0;
      })
      .addCase(fetchProducts.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addCase(fetchProductById.pending, (state) => {
        state.detailLoading = true;
        state.error = null;
      })
      .addCase(fetchProductById.fulfilled, (state, action) => {
        state.detailLoading = false;
        state.currentProduct = action.payload;
      })
      .addCase(fetchProductById.rejected, (state, action) => {
        state.detailLoading = false;
        state.error = action.payload;
      });
  }
});

export const { setFilter, resetFilters, clearCurrentProduct } = productSlice.actions;
export default productSlice.reducer;
