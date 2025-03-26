import React, { createContext, useState, useContext, useEffect } from 'react';
import * as SecureStore from 'expo-secure-store';
import api from '../services/api';

// Clés de stockage sécurisé
const TOKEN_KEY = 'lorcana_auth_token';
const USER_KEY = 'lorcana_user_info';

// Création du contexte
const AuthContext = createContext({
  isAuthenticated: false,
  token: null,
  user: null,
  login: async () => {},
  register: async () => {},
  logout: async () => {},
  loading: false,
});

/**
 * Fournisseur du contexte d'authentification
 * Gère l'état d'authentification et les opérations associées
 */
export function AuthProvider({ children }) {
  const [token, setToken] = useState(null);
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // Vérifier si l'utilisateur est déjà connecté au démarrage
  useEffect(() => {
    const loadStoredAuth = async () => {
      try {
        // Récupérer le token stocké
        const storedToken = await SecureStore.getItemAsync(TOKEN_KEY);
        
        if (storedToken) {
          // Récupérer les informations utilisateur stockées
          const storedUser = await SecureStore.getItemAsync(USER_KEY);
          
          if (storedUser) {
            setToken(storedToken);
            setUser(JSON.parse(storedUser));
          } else {
            // Si nous avons un token mais pas d'infos utilisateur, les récupérer
            try {
              const userResponse = await api.getUserInfo(storedToken);
              if (userResponse && userResponse.data) {
                setUser(userResponse.data);
                await SecureStore.setItemAsync(USER_KEY, JSON.stringify(userResponse.data));
              } else {
                // Si la récupération échoue, supprimer le token
                await SecureStore.deleteItemAsync(TOKEN_KEY);
              }
            } catch (error) {
              console.error('Erreur lors de la récupération des infos utilisateur:', error);
              await SecureStore.deleteItemAsync(TOKEN_KEY);
            }
          }
        }
      } catch (error) {
        console.error('Erreur lors du chargement des données d\'authentification:', error);
      } finally {
        setLoading(false);
      }
    };

    loadStoredAuth();
  }, []);

  /**
   * Connexion d'un utilisateur
   * 
   * @param {String} email - Email de l'utilisateur
   * @param {String} password - Mot de passe
   * @returns {Object} - Résultat de la connexion
   */
  const login = async (email, password) => {
    try {
      setLoading(true);
      
      // Appel API pour la connexion
      const response = await api.login(email, password);
      
      if (response && response.data && response.data.token) {
        // Stocker le token
        const newToken = response.data.token;
        await SecureStore.setItemAsync(TOKEN_KEY, newToken);
        setToken(newToken);
        
        // Récupérer les informations utilisateur
        const userResponse = await api.getUserInfo(newToken);
        if (userResponse && userResponse.data) {
          const userData = userResponse.data;
          setUser(userData);
          await SecureStore.setItemAsync(USER_KEY, JSON.stringify(userData));
        }
        
        return { success: true };
      } else {
        throw new Error('Format de réponse invalide');
      }
    } catch (error) {
      console.error('Erreur lors de la connexion:', error);
      return { 
        success: false, 
        error: error.message || 'Erreur lors de la connexion. Veuillez vérifier vos identifiants.' 
      };
    } finally {
      setLoading(false);
    }
  };

  /**
   * Inscription d'un nouvel utilisateur
   * 
   * @param {Object} userData - Données d'inscription
   * @returns {Object} - Résultat de l'inscription
   */
  const register = async (userData) => {
    try {
      setLoading(true);
      
      // Appel API pour l'inscription
      const response = await api.register(userData);
      
      if (response && response.data && response.data.user) {
        return { success: true };
      } else {
        throw new Error('Format de réponse invalide');
      }
    } catch (error) {
      console.error('Erreur lors de l\'inscription:', error);
      return { 
        success: false, 
        error: error.message || 'Erreur lors de l\'inscription. Veuillez réessayer.' 
      };
    } finally {
      setLoading(false);
    }
  };

  /**
   * Déconnexion de l'utilisateur
   * 
   * @returns {Object} - Résultat de la déconnexion
   */
  const logout = async () => {
    try {
      setLoading(true);
      
      if (token) {
        // Appel API pour la déconnexion
        await api.logout(token);
      }
      
      // Supprimer les données stockées
      await SecureStore.deleteItemAsync(TOKEN_KEY);
      await SecureStore.deleteItemAsync(USER_KEY);
      
      // Réinitialiser l'état
      setToken(null);
      setUser(null);
      
      return { success: true };
    } catch (error) {
      console.error('Erreur lors de la déconnexion:', error);
      
      // Même en cas d'erreur, on supprime les données locales
      await SecureStore.deleteItemAsync(TOKEN_KEY);
      await SecureStore.deleteItemAsync(USER_KEY);
      setToken(null);
      setUser(null);
      
      return { 
        success: true, // Considéré comme réussi car l'utilisateur est déconnecté localement
        error: error.message 
      };
    } finally {
      setLoading(false);
    }
  };

  // Valeur du contexte
  const value = {
    isAuthenticated: !!token,
    token,
    user,
    login,
    register,
    logout,
    loading,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

/**
 * Hook pour utiliser le contexte d'authentification
 */
export function useAuth() {
  return useContext(AuthContext);
}

export default AuthContext;
