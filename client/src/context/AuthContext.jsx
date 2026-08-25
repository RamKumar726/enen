import React, { createContext, useContext, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { loginUser, registerUser, logout, fetchUserProfile, clearAuthError } from '../redux/slices/authSlice';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const dispatch = useDispatch();
  const authState = useSelector((state) => state.auth);

  useEffect(() => {
    if (authState.token && !authState.user) {
      dispatch(fetchUserProfile());
    }
  }, [dispatch, authState.token, authState.user]);

  const login = async (credentials) => {
    const result = await dispatch(loginUser(credentials));
    return result;
  };

  const register = async (userData) => {
    const result = await dispatch(registerUser(userData));
    return result;
  };

  const handleLogout = () => {
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
