'use client';
import { createContext, useState, useEffect, ReactNode } from 'react';
import Cookies from 'js-cookie';
import { api } from '../lib/axios';

export const AuthContext = createContext<any>(null);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<any>(null);
  const [authLoading, setAuthLoading] = useState(true);

  const login = async (email: string, password: string) => {
    try {
      // Passwords should NEVER be lowercased automatically
      const res = await api.post('/auth/login', { email, password });
      const userData = { ...res.data.user, token: res.data.token };
      
      Cookies.set('token', res.data.token, { expires: 7 });
      setUser(userData);
      return res.data;
    } catch (error: any) {
      console.error("Login failed:", error.response?.data);
      throw error;
    }
  };

  const logout = () => {
    Cookies.remove('token');
    setUser(null);
  };

  const register = async (name: string, email: string, password: string) => {
    return await api.post('/auth/register', { name, email, password });
  };

  useEffect(() => {
    const checkAuth = () => {
      const token = Cookies.get('token');
      if (token) {
        // In a real app, you'd usually call an /me endpoint here 
        // to get the full user profile using the token.
        setUser({ token }); 
      }
      setAuthLoading(false);
    };
    checkAuth();
  }, []);

  return (
    <AuthContext.Provider value={{ user, login, logout, register, authLoading }}>
      {children}
    </AuthContext.Provider>
  );
};