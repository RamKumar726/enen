import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';

const WishlistContext = createContext(null);

export const WishlistProvider = ({ children }) => {
  const [wishlistItems, setWishlistItems] = useState(() => {
    try {
      const stored = localStorage.getItem('enen_wishlist');
      return stored ? JSON.parse(stored) : [];
    } catch {
      return [];
    }
  });

  useEffect(() => {
    localStorage.setItem('enen_wishlist', JSON.stringify(wishlistItems));
  }, [wishlistItems]);

  const isWishlisted = useCallback(
    (productId) => wishlistItems.some((item) => (item._id || item.id) === productId),
    [wishlistItems]
  );

  const toggleWishlist = useCallback((product) => {
    const pid = product._id || product.id;
    setWishlistItems((prev) => {
      const exists = prev.some((item) => (item._id || item.id) === pid);
      if (exists) return prev.filter((item) => (item._id || item.id) !== pid);
      return [...prev, product];
    });
  }, []);

  const removeFromWishlist = useCallback((productId) => {
    setWishlistItems((prev) => prev.filter((item) => (item._id || item.id) !== productId));
  }, []);

  const clearWishlist = useCallback(() => setWishlistItems([]), []);

  return (
    <WishlistContext.Provider
      value={{
        wishlistItems,
        wishlistCount: wishlistItems.length,
        isWishlisted,
        toggleWishlist,
        removeFromWishlist,
        clearWishlist,
      }}
    >
      {children}
    </WishlistContext.Provider>
  );
};

export const useWishlist = () => {
  const ctx = useContext(WishlistContext);
  if (!ctx) throw new Error('useWishlist must be used inside WishlistProvider');
  return ctx;
};
