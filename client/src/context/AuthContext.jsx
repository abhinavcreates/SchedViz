/**
 * AuthContext — provides authentication state and methods throughout the app.
 * Stores JWT token in localStorage. Decodes token to get user info.
 */
import React, { createContext, useContext, useState, useEffect } from 'react';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);   // { id, email } or null
  const [token, setToken] = useState(null);
  const [loading, setLoading] = useState(true);

  // On mount, restore auth state from localStorage
  useEffect(() => {
    const savedToken = localStorage.getItem('schedviz_token');
    const savedUser = localStorage.getItem('schedviz_user');
    if (savedToken && savedUser) {
      setToken(savedToken);
      setUser(JSON.parse(savedUser));
    }
    setLoading(false);
  }, []);

  const login = (tokenValue, userData) => {
    localStorage.setItem('schedviz_token', tokenValue);
    localStorage.setItem('schedviz_user', JSON.stringify(userData));
    setToken(tokenValue);
    setUser(userData);
  };

  const logout = () => {
    localStorage.removeItem('schedviz_token');
    localStorage.removeItem('schedviz_user');
    setToken(null);
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, token, login, logout, loading }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
