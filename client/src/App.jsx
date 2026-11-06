import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import ProtectedRoute from './components/ProtectedRoute';
import CursorGlow from './components/CursorGlow';
import ScrollTop from './components/ScrollTop';

import Home from './pages/Home';
import Shop from './pages/Shop';
import CollectionPage from './pages/CollectionPage';
import ProductDetail from './pages/ProductDetail';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import ForgotPasswordPage from './pages/ForgotPasswordPage';
import ProfilePage from './pages/ProfilePage';
import NotFound from './pages/NotFound';
import ResetPasswordPage from './pages/ResetPasswordPage';
import WishlistPage from './pages/WishlistPage';
import ClansPage from './pages/ClansPage';
import PrivacyPolicy from './pages/PrivacyPolicy';
import TermsPage from './pages/TermsPage';
import ReturnPolicy from './pages/ReturnPolicy';
import ShippingPolicy from './pages/ShippingPolicy';

// Admin Suite Components
import AdminLayout from './admin/AdminLayout';
import AdminHome from './admin/pages/AdminHome';
import CarouselManagement from './admin/pages/CarouselManagement';
import AddEditCarousel from './admin/pages/AddEditCarousel';
import ClanManagement from './admin/pages/ClanManagement';
import ProductManagement from './admin/pages/ProductManagement';
import AddEditProduct from './admin/pages/AddEditProduct';
import UserManagement from './admin/pages/UserManagement';

function App() {
  return (
    <Router>
      <Routes>
        {/* ADMIN DASHBOARD ROUTES */}
        <Route
          path="/admin/*"
          element={
            <ProtectedRoute adminOnly={true}>
              <AdminLayout />
            </ProtectedRoute>
          }
        >
          <Route index element={<AdminHome />} />
          <Route path="carousel" element={<CarouselManagement />} />
          <Route path="carousel/new" element={<AddEditCarousel />} />
          <Route path="carousel/edit/:id" element={<AddEditCarousel />} />
          <Route path="clans" element={<ClanManagement />} />
          <Route path="products" element={<ProductManagement />} />
          <Route path="products/new" element={<AddEditProduct />} />
          <Route path="products/edit/:id" element={<AddEditProduct />} />
          <Route path="users" element={<UserManagement />} />
        </Route>

        {/* PUBLIC STOREFRONT ROUTES */}
        <Route
          path="*"
          element={
            <div className="flex flex-col min-h-screen transition-colors duration-400"
              style={{ backgroundColor: 'var(--bg-base)', color: 'var(--text-primary)' }}>
              <CursorGlow />
              <ScrollTop />
              <Navbar />
              <main className="flex-1">
                <Routes>
                  <Route path="/" element={<Home />} />
                  <Route path="/shop" element={<Shop />} />
                  <Route path="/collection/:collectionName" element={<CollectionPage />} />
                  <Route path="/product/:id" element={<ProductDetail />} />
                  <Route path="/login" element={<LoginPage />} />
                  <Route path="/register" element={<RegisterPage />} />
                  <Route path="/forgot-password" element={<ForgotPasswordPage />} />
                  <Route path="/reset-password/:token" element={<ResetPasswordPage />} />
                  <Route path="/privacy-policy" element={<PrivacyPolicy />} />
                  <Route path="/terms" element={<TermsPage />} />
                  <Route path="/return-policy" element={<ReturnPolicy />} />
                  <Route path="/shipping-policy" element={<ShippingPolicy />} />
                  <Route path="/clans" element={<ClansPage />} />
                  <Route path="/wishlist" element={<WishlistPage />} />

                  <Route
                    path="/profile"
                    element={
                      <ProtectedRoute>
                        <ProfilePage />
                      </ProtectedRoute>
                    }
                  />

                  <Route path="*" element={<NotFound />} />
                </Routes>
              </main>

              <Footer />
            </div>
          }
        />
      </Routes>
    </Router>
  );
}

export default App;
