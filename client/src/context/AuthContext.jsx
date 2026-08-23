import React, { createContext, useContext, useState, useEffect } from 'react';
import api from '../services/api';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [admin, setAdmin] = useState(null);
  const [token, setToken] = useState(localStorage.getItem('hanout60_admin_token') || null);
  const [loading, setLoading] = useState(true);

  // Check auth state on mount
  useEffect(() => {
    const checkAuth = async () => {
      const storedToken = localStorage.getItem('hanout60_admin_token');
      if (storedToken) {
        try {
          const res = await api.get('/auth/me');
          if (res.data.success) {
            setAdmin(res.data.data);
            setToken(storedToken);
          }
        } catch (error) {
          console.error('Session expired or invalid token');
          localStorage.removeItem('hanout60_admin_token');
          localStorage.removeItem('hanout60_admin_user');
          setAdmin(null);
          setToken(null);
        }
      }
      setLoading(false);
    };

    checkAuth();
  }, []);

  // Login method
  const login = async (username, password) => {
    try {
      const res = await api.post('/auth/login', {
        username: username.trim(),
        password: password.trim(),
      });
      if (res.data.success) {
        const { token: newToken, ...userData } = res.data.data;
        localStorage.setItem('hanout60_admin_token', newToken);
        localStorage.setItem('hanout60_admin_user', JSON.stringify(userData));
        setToken(newToken);
        setAdmin(userData);
        return { success: true, message: res.data.message };
      }
    } catch (error) {
      console.error('Login error details:', error);
      let msg = 'فشل تسجيل الدخول، تحقق من البيانات';
      if (error.response?.data?.message) {
        msg = error.response.data.message;
      } else if (error.message === 'Network Error' || !error.response) {
        msg = 'تعذر الاتصال بالخادم (Network Error). يرجى التأكد من تشغيل خادم Render وضبط متغير VITE_API_URL في Vercel.';
      }
      return { success: false, message: msg };
    }
  };

  // Logout method
  const logout = () => {
    localStorage.removeItem('hanout60_admin_token');
    localStorage.removeItem('hanout60_admin_user');
    setAdmin(null);
    setToken(null);
  };

  return (
    <AuthContext.Provider
      value={{
        admin,
        token,
        isAuthenticated: !!admin,
        loading,
        login,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
