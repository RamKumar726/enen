import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { authService, userService, setAccessToken } from '../../services/api';

export const refreshSession = createAsyncThunk('auth/refreshSession', async (_, { rejectWithValue }) => {
  try {
    const response = await authService.refreshToken();
    if (!response.success) return rejectWithValue('Session expired');
    setAccessToken(response.token);
    return response;
  } catch (err) { return rejectWithValue(err.message || 'Session expired'); }
});

export const loginUser = createAsyncThunk(
  'auth/login',
  async (credentials, { rejectWithValue }) => {
    try {
      const response = await authService.login(credentials);
      if (response.success) {
        setAccessToken(response.token);
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
        setAccessToken(response.token);
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
    user: null,
    token: null,
    isAuthenticated: false,
    loading: true,
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
      setAccessToken(null);
    },
    clearAuthError: (state) => {
      state.error = null;
      state.message = null;
    },
    updateUserLocal: (state, action) => {
      state.user = { ...state.user, ...action.payload };
    }
  },
  extraReducers: (builder) => {
    builder
      .addCase(refreshSession.fulfilled, (state, action) => {
        state.loading = false; state.token = action.payload.token; state.user = action.payload.user; state.isAuthenticated = true;
      })
      .addCase(refreshSession.rejected, (state) => {
        state.loading = false; state.token = null; state.user = null; state.isAuthenticated = false;
      })
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
        setAccessToken(action.payload.token);
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
        setAccessToken(action.payload.token);
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
