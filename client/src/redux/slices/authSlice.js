import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { authService, userService } from '../../services/api';

const savedUser = JSON.parse(localStorage.getItem('enen_user') || 'null');
const savedToken = localStorage.getItem('enen_token') || null;

export const loginUser = createAsyncThunk(
  'auth/login',
  async (credentials, { rejectWithValue }) => {
    try {
      const response = await authService.login(credentials);
      if (response.success) {
        localStorage.setItem('enen_token', response.token);
        localStorage.setItem('enen_user', JSON.stringify(response.user));
        return response;
      }
      return rejectWithValue(response.message);
    } catch (err) {
      return rejectWithValue(err.message || 'Login failed');
    }
  }
);

export const registerUser = createAsyncThunk(
  'auth/register',
  async (userData, { rejectWithValue }) => {
    try {
      const response = await authService.register(userData);
      if (response.success) {
        localStorage.setItem('enen_token', response.token);
        localStorage.setItem('enen_user', JSON.stringify(response.user));
        return response;
      }
      return rejectWithValue(response.message);
    } catch (err) {
      return rejectWithValue(err.message || 'Registration failed');
    }
  }
);

export const fetchUserProfile = createAsyncThunk(
  'auth/fetchProfile',
  async (_, { rejectWithValue }) => {
    try {
      const response = await userService.getProfile();
      if (response.success) {
        localStorage.setItem('enen_user', JSON.stringify(response.user));
        return response.user;
      }
      return rejectWithValue('Failed to fetch profile');
    } catch (err) {
      return rejectWithValue(err.message || 'Error loading profile');
    }
  }
);

const authSlice = createSlice({
  name: 'auth',
  initialState: {
    user: savedUser,
    token: savedToken,
    isAuthenticated: !!savedToken,
    loading: false,
    error: null,
    message: null
  },
  reducers: {
    logout: (state) => {
      state.user = null;
      state.token = null;
      state.isAuthenticated = false;
      state.error = null;
      state.message = 'Logged out successfully';
      localStorage.removeItem('enen_token');
      localStorage.removeItem('enen_user');
    },
    clearAuthError: (state) => {
      state.error = null;
      state.message = null;
    },
    updateUserLocal: (state, action) => {
      state.user = { ...state.user, ...action.payload };
      localStorage.setItem('enen_user', JSON.stringify(state.user));
    }
  },
  extraReducers: (builder) => {
    builder
      // Login
      .addCase(loginUser.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(loginUser.fulfilled, (state, action) => {
        state.loading = false;
        state.user = action.payload.user;
        state.token = action.payload.token;
        state.isAuthenticated = true;
        state.message = action.payload.message;
      })
      .addCase(loginUser.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Register
      .addCase(registerUser.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(registerUser.fulfilled, (state, action) => {
        state.loading = false;
        state.user = action.payload.user;
        state.token = action.payload.token;
        state.isAuthenticated = true;
        state.message = action.payload.message;
      })
      .addCase(registerUser.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Profile
      .addCase(fetchUserProfile.fulfilled, (state, action) => {
        state.user = action.payload;
      });
  }
});

export const { logout, clearAuthError, updateUserLocal } = authSlice.actions;
export default authSlice.reducer;
