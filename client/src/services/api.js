import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json'
  }
});

// Interceptor to inject JWT token into all request headers
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('enen_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Interceptor for responses
api.interceptors.response.use(
  (response) => response.data,
  (error) => {
    const message = error.response?.data?.message || error.message || 'An unexpected error occurred';
    if (error.response?.status === 401) {
      if (localStorage.getItem('enen_token')) {
        localStorage.removeItem('enen_token');
        localStorage.removeItem('enen_user');
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
  refreshToken: (refreshToken) => api.post('/auth/refresh-token', { refreshToken }),
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
  addReview: (id, reviewData) => api.post(`/products/${id}/reviews`, reviewData),
  createProduct: (data) => api.post('/products', data),
  updateProduct: (id, data) => api.put(`/products/${id}`, data),
  deleteProduct: (id) => api.delete(`/products/${id}`)
};

// Cart Services
export const cartService = {
  getCart: () => api.get('/cart'),
  addToCart: (data) => api.post('/cart', data),
  updateCartItem: (itemId, quantity) => api.put(`/cart/${itemId}`, { quantity }),
  removeFromCart: (itemId) => api.delete(`/cart/${itemId}`),
  clearCart: () => api.delete('/cart/clear')
};

// Order Services
export const orderService = {
  createOrder: (orderData) => api.post('/orders', orderData),
  getUserOrders: () => api.get('/orders'),
  getOrderById: (id) => api.get(`/orders/${id}`),
  cancelOrder: (id, data) => api.post(`/orders/${id}/cancel`, data),
  requestReturn: (id, data) => api.post(`/orders/${id}/return`, data),
  updateOrderStatus: (id, statusData) => api.put(`/orders/${id}`, statusData)
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
  getAnalytics: () => api.get('/admin/analytics'),
  getAllOrders: (params) => api.get('/admin/orders', { params }),
  getAllUsers: () => api.get('/admin/users'),
  updateUserRole: (id, role) => api.put(`/admin/users/${id}/role`, { role })
};

// Payment Services
export const paymentService = {
  createRazorpayOrder: (data) => api.post('/payment/razorpay-order', data),
  verifyRazorpayPayment: (data) => api.post('/payment/razorpay-verify', data)
};

export default api;
