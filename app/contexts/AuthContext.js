import React, { createContext, useContext, useState } from 'react';
import api from '../services/api';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [token, setToken] = useState(null);
  const [user, setUser] = useState(null);

  const login = async (email, password) => {
    try {
      const response = await api.login(email, password);
      
      if (response.token) {
        setToken(response.token);
        setUser(response.user);
        return { success: true };
      } else {
        console.error('Pas de token dans la réponse:', response);
        return { success: false, error: 'Identifiants invalides' };
      }
    } catch (error) {
      console.error('Erreur login:', error);
      return { 
        success: false, 
        error: error.message || 'Erreur de connexion'
      };
    }
  };

  const logout = () => {
    setToken(null);
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{
      token,
      user,
      login,
      logout,
      isAuthenticated: !!token
    }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth doit être utilisé dans un AuthProvider');
  }
  return context;
}
