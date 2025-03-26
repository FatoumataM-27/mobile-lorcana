import axios from 'axios';

const BASE_URL = 'https://lorcana.brybry.fr/api';

// Créer une instance axios avec la configuration de base
const axiosInstance = axios.create({
  baseURL: BASE_URL,
  timeout: 10000, // 10 secondes timeout
  headers: {
    'Content-Type': 'application/json',
  }
});

// Intercepteur pour logger les requêtes
axiosInstance.interceptors.request.use(
  (config) => {
    console.log('Request:', {
      method: config.method.toUpperCase(),
      url: config.url,
      baseURL: config.baseURL,
      headers: config.headers,
    });
    return config;
  },
  (error) => {
    console.error('Request Error:', error);
    return Promise.reject(error);
  }
);

// Intercepteur pour gérer les erreurs
axiosInstance.interceptors.response.use(
  (response) => {
    console.log('Response:', {
      status: response.status,
      url: response.config.url,
      data: response.data,
    });
    return response;
  },
  (error) => {
    console.error('Erreur API:', error);
    
    // Si la réponse n'est pas du JSON valide
    if (error.response?.data && typeof error.response.data === 'string' && error.response.data.includes('<!DOCTYPE')) {
      throw new Error('Le serveur est temporairement indisponible. Veuillez réessayer plus tard.');
    }

    // Si nous avons une réponse d'erreur
    if (error.response) {
      const message = error.response.data?.message || 'Une erreur est survenue';
      throw new Error(message);
    }

    // Si nous n'avons pas de réponse (erreur réseau)
    if (error.request) {
      throw new Error('Impossible de contacter le serveur. Vérifiez votre connexion internet.');
    }

    // Pour toute autre erreur
    throw new Error('Une erreur inattendue est survenue');
  }
);

const api = {
  // Auth endpoints
  register: async (userData) => {
    try {
      const response = await axiosInstance.post('/register', userData);
      return response.data;
    } catch (error) {
      console.error('Erreur inscription:', error);
      throw error;
    }
  },

  login: async (email, password) => {
    try {
      const response = await axiosInstance.post('/login', {
        email,
        password
      });
      return response.data;
    } catch (error) {
      console.error('Erreur connexion:', error);
      throw error;
    }
  },

  logout: async (token) => {
    try {
      const response = await axiosInstance.post('/logout', null, {
        headers: { Authorization: `Bearer ${token}` }
      });
      return response.data;
    } catch (error) {
      console.error('Erreur déconnexion:', error);
      throw error;
    }
  },

  // User endpoints
  getUserInfo: async (token) => {
    try {
      const response = await axiosInstance.get('/me', {
        headers: { Authorization: `Bearer ${token}` }
      });
      return response.data;
    } catch (error) {
      console.error('Erreur informations utilisateur:', error);
      throw error;
    }
  },

  getUserCards: async (token) => {
    try {
      const response = await axiosInstance.get('/me/cards', {
        headers: { Authorization: `Bearer ${token}` }
      });
      return response.data;
    } catch (error) {
      console.error('Erreur cartes utilisateur:', error);
      throw error;
    }
  },

  updateOwnedCards: async (token, cardId, quantities) => {
    try {
      const response = await axiosInstance.post(`/me/${cardId}/update-owned`, quantities, {
        headers: { Authorization: `Bearer ${token}` }
      });
      return response.data;
    } catch (error) {
      console.error('Erreur mise à jour cartes possédées:', error);
      throw error;
    }
  },

  // Sets endpoints
  getSets: async (token) => {
    try {
      const response = await axiosInstance.get('/sets', {
        headers: { Authorization: `Bearer ${token}` }
      });
      return response.data;
    } catch (error) {
      console.error('Erreur récupération des sets:', error);
      throw error;
    }
  },

  getSetDetails: async (token, setId) => {
    try {
      const response = await axiosInstance.get(`/sets/${setId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      return response.data;
    } catch (error) {
      console.error('Erreur détails set:', error);
      throw error;
    }
  },

  getSetCards: async (token, setId) => {
    try {
      const response = await axiosInstance.get(`/sets/${setId}/cards`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      return response.data;
    } catch (error) {
      console.error('Erreur cartes set:', error);
      throw error;
    }
  },

  // Wishlist endpoints
  getWishlist: async (token) => {
    try {
      const response = await axiosInstance.get('/wishlist', {
        headers: { Authorization: `Bearer ${token}` }
      });
      return response.data;
    } catch (error) {
      console.error('Erreur wishlist:', error);
      throw error;
    }
  },

  addToWishlist: async (token, cardId) => {
    try {
      // API docs show the endpoint is /wishlist/add with card_id parameter
      const response = await axiosInstance.post('/wishlist/add', 
        { card_id: cardId },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      return response.data;
    } catch (error) {
      console.error('Erreur ajout wishlist:', error);
      throw error;
    }
  },

  removeFromWishlist: async (token, cardId) => {
    try {
      // API docs show the endpoint is /wishlist/remove with card_id parameter
      const response = await axiosInstance.post('/wishlist/remove', 
        { card_id: cardId },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      return response.data;
    } catch (error) {
      console.error('Erreur suppression wishlist:', error);
      throw error;
    }
  },

  // Collection endpoints
  getCollection: async (token) => {
    try {
      // API docs show endpoint is /me/cards
      const response = await axiosInstance.get('/me/cards', {
        headers: { Authorization: `Bearer ${token}` }
      });
      return response.data;
    } catch (error) {
      console.error('Erreur collection:', error);
      throw error;
    }
  },

  addToCollection: async (token, cardId, quantity = 1, isShiny = false) => {
    try {
      // API docs show endpoint is /me/{id}/update-owned with normal and foil parameters
      const response = await axiosInstance.post(`/me/${cardId}/update-owned`, 
        { 
          normal: isShiny ? 0 : quantity,
          foil: isShiny ? quantity : 0
        },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      return response.data;
    } catch (error) {
      console.error('Erreur ajout collection:', error);
      throw error;
    }
  },

  updateCollectionCard: async (token, cardId, quantity, isShiny) => {
    try {
      // API docs show endpoint is /me/{id}/update-owned with normal and foil parameters
      const response = await axiosInstance.post(`/me/${cardId}/update-owned`,
        { 
          normal: isShiny ? 0 : quantity,
          foil: isShiny ? quantity : 0
        },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      return response.data;
    } catch (error) {
      console.error('Erreur mise à jour carte collection:', error);
      throw error;
    }
  },

  removeFromCollection: async (token, cardId) => {
    try {
      // API docs show endpoint is /me/{id}/update-owned with normal and foil parameters set to 0
      const response = await axiosInstance.post(`/me/${cardId}/update-owned`, 
        { normal: 0, foil: 0 },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      return response.data;
    } catch (error) {
      console.error('Erreur suppression collection:', error);
      throw error;
    }
  },

  getCollectionStats: async (token) => {
    try {
      const response = await axiosInstance.get('/me/cards', {
        headers: { Authorization: `Bearer ${token}` }
      });
      return response.data;
    } catch (error) {
      console.error('Erreur statistiques collection:', error);
      throw error;
    }
  },

  // Cards endpoints
  getAllCards: async (token) => {
    try {
      const response = await axiosInstance.get('/me/cards', {
        headers: { Authorization: `Bearer ${token}` }
      });
      return response.data;
    } catch (error) {
      console.error('Erreur récupération de toutes les cartes:', error);
      throw error;
    }
  },
};

export default api;
