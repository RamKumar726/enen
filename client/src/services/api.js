import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || (import.meta.env.PROD ? '' : 'http://localhost:5000/api');
if (import.meta.env.PROD) {
  try {
    const parsedApiUrl = new URL(API_URL);
    if (parsedApiUrl.protocol !== 'https:' || !parsedApiUrl.pathname.replace(/\/$/, '').endsWith('/api')) throw new Error('invalid');
  } catch (_) {
    throw new Error('VITE_API_URL must be a public HTTPS API URL ending in /api before building the storefront');
  }
}
let accessToken = null;
let refreshInFlight = null;
export const setAccessToken = (token) => { accessToken = token || null; };

const api = axios.create({
  baseURL: API_URL,
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json'
  }
});

// Interceptor to inject JWT token into all request headers
api.interceptors.request.use(
  (config) => {
    if (accessToken) config.headers.Authorization = `Bearer ${accessToken}`;
    return config;
  },
  (error) => Promise.reject(error)
);

// Interceptor for responses
api.interceptors.response.use(
  (response) => response.data,
  async (error) => {
    const message = error.response?.data?.message || error.message || 'An unexpected error occurred';
    const original = error.config;
    if (error.response?.status === 401 && original && !original._retried &&
      !String(original.url || '').includes('/auth/refresh-token') &&
      !String(original.url || '').includes('/auth/login') && !String(original.url || '').includes('/auth/register')) {
      original._retried = true;
      try {
        if (!refreshInFlight) refreshInFlight = axios.post(`${API_URL}/auth/refresh-token`, {}, { withCredentials: true });
        const refreshed = await refreshInFlight;
        refreshInFlight = null;
        if (!refreshed.data?.success || !refreshed.data?.token) throw new Error('Session expired');
        setAccessToken(refreshed.data.token);
        original.headers.Authorization = `Bearer ${refreshed.data.token}`;
        return api(original);
      } catch (_) {
        refreshInFlight = null;
        setAccessToken(null);
        window.dispatchEvent(new Event('auth:expired'));
      }
    }
    return Promise.reject({ ...error, message });
  }
);

// Auth Services
export const authService = {
  register: (data) => api.post('/auth/register', data),
  login: (data) => api.post('/auth/login', data),
  logout: () => api.post('/auth/logout'),
  refreshToken: () => api.post('/auth/refresh-token'),
  forgotPassword: (email) => api.post('/auth/forgot-password', { email }),
  resetPassword: (token, data) => api.put(`/auth/reset-password/${token}`, data)
};

// Carousel Services
export const carouselService = {
  getActiveBanners: () => api.get('/carousel'),
  getAllBanners: () => api.get('/carousel/all'),
  createBanner: (data) => api.post('/carousel', data),
  updateBanner: (id, data) => api.put(`/carousel/${id}`, data),
  toggleBannerStatus: (id) => api.put(`/carousel/${id}/toggle`),
  deleteBanner: (id) => api.delete(`/carousel/${id}`)
};

// Clan / Category Services
export const clanService = {
  getClans: () => api.get('/clans'),
  getAdminClans: () => api.get('/clans/admin'),
  getClanById: (id) => api.get(`/clans/${id}`),
  createClan: (data) => api.post('/clans', data),
  updateClan: (id, data) => api.put(`/clans/${id}`, data),
  deleteClan: (id) => api.delete(`/clans/${id}`)
};

// Product Services
export const productService = {
  getProducts: (params) => api.get('/products', { params }),
  getProductById: (id) => api.get(`/products/${id}`),
  getAdminProductById: (id) => api.get(`/products/admin/${id}`),
  getAdminProducts: (params) => api.get('/products/admin', { params }),
  createProduct: (data) => api.post('/products', data),
  updateProduct: (id, data) => api.put(`/products/${id}`, data),
  deleteProduct: (id) => api.delete(`/products/${id}`)
};

// User Services
export const userService = {
  getProfile: () => api.get('/users/profile'),
  updateProfile: (data) => api.put('/users/profile', data),
  getAddresses: () => api.get('/users/addresses'),
  addAddress: (data) => api.post('/users/addresses', data),
  deleteAddress: (id) => api.delete(`/users/addresses/${id}`)
};

// Admin Services
export const adminService = {
  getDashboard: () => api.get('/admin/dashboard'),
  getAllUsers: (params) => api.get('/admin/users', { params }),
  updateUserRole: (id, role) => api.put(`/admin/users/${id}/role`, { role })
};

export default api;
