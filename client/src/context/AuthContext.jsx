import React, { createContext, useContext, useEffect, useRef } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { loginUser, registerUser, logout, fetchUserProfile, clearAuthError, refreshSession } from '../redux/slices/authSlice';
import { authService } from '../services/api';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const dispatch = useDispatch();
  const authState = useSelector((state) => state.auth);
  const sessionStarted = useRef(false);

  useEffect(() => {
    if (sessionStarted.current) return;
    sessionStarted.current = true;
    dispatch(refreshSession());
  }, [dispatch]);

  useEffect(() => {
    if (authState.token && !authState.user) {
      dispatch(fetchUserProfile());
    }
  }, [dispatch, authState.token, authState.user]);

  useEffect(() => {
    const expire = () => dispatch(logout());
    window.addEventListener('auth:expired', expire);
    return () => window.removeEventListener('auth:expired', expire);
  }, [dispatch]);

  const login = async (credentials) => {
    const result = await dispatch(loginUser(credentials));
    return result;
  };

  const register = async (userData) => {
    const result = await dispatch(registerUser(userData));
    return result;
  };

  const handleLogout = async () => {
    await authService.logout().catch(() => {});
    dispatch(logout());
  };

  const clearError = () => {
    dispatch(clearAuthError());
  };

  return (
    <AuthContext.Provider value={{
      user: authState.user,
      token: authState.token,
      isAuthenticated: authState.isAuthenticated,
      loading: authState.loading,
      error: authState.error,
      message: authState.message,
      login,
      register,
      logout: handleLogout,
      clearError
    }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
