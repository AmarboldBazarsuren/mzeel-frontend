// mzeel-app/src/context/AuthContext.js

import React, { createContext, useState, useEffect, useContext } from 'react';
import { api } from '../api/client';
import { storage } from '../utils/storage';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [token, setToken] = useState(null);

  // App эхлэхэд token шалгах
  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = async () => {
    try {
      const savedToken = await storage.getToken();
      const savedUser = await storage.getUser();

      if (savedToken && savedUser) {
        setToken(savedToken);
        setUser(savedUser);
      }
    } catch (error) {
      console.error('Auth шалгах алдаа:', error);
    } finally {
      setLoading(false);
    }
  };

  // Нэвтрэх
  const login = async (phone, password) => {
    try {
      const response = await api.login(phone, password);
      
      if (response.success) {
        const { token, user } = response.data;
        
        // Storage-д хадгалах
        await storage.saveToken(token);
        await storage.saveUser(user);
        
        // State шинэчлэх
        setToken(token);
        setUser(user);
        
        return { success: true };
      }
      
      return { success: false, message: response.message };
    } catch (error) {
      return { 
        success: false, 
        message: error.message || 'Нэвтрэх амжилтгүй' 
      };
    }
  };

  // Бүртгүүлэх
  const register = async (data) => {
    try {
      const response = await api.register(data);
      
      if (response.success) {
        const { token, user } = response.data;
        
        await storage.saveToken(token);
        await storage.saveUser(user);
        
        setToken(token);
        setUser(user);
        
        return { success: true };
      }
      
      return { success: false, message: response.message };
    } catch (error) {
      return { 
        success: false, 
        message: error.message || 'Бүртгэл амжилтгүй' 
      };
    }
  };

  // Гарах
  const logout = async () => {
    try {
      await storage.clearAll();
      setToken(null);
      setUser(null);
    } catch (error) {
      console.error('Logout алдаа:', error);
    }
  };

  // User мэдээлэл шинэчлэх
  const updateUser = async () => {
    try {
      const response = await api.getMe();
      if (response.success) {
        const updatedUser = response.data.user;
        await storage.saveUser(updatedUser);
        setUser(updatedUser);
      }
    } catch (error) {
      console.error('User шинэчлэх алдаа:', error);
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        loading,
        login,
        register,
        logout,
        updateUser,
        isAuthenticated: !!token,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
};