/**
 * Service API pour l'application Lorcana
 * Gère toutes les communications avec le backend
 */

const BASE_URL = 'https://lorcana.brybry.fr/api';

/**
 * Effectue une requête API avec gestion des erreurs
 * 
 * @param {String} endpoint - Endpoint API
 * @param {Object} options - Options fetch (method, headers, body)
 * @param {String} token - Token d'authentification (optionnel)
 * @returns {Promise} - Promesse contenant la réponse
 */
async function apiRequest(endpoint, options = {}, token = null) {
  try {
    // Préparer les headers
    const headers = {
      'Content-Type': 'application/json',
      ...(token ? { 'Authorization': `Bearer ${token}` } : {}),
      ...options.headers
    };

    // Effectuer la requête
    const response = await fetch(`${BASE_URL}${endpoint}`, {
      ...options,
      headers
    });

    // Vérifier si la réponse est OK (status 200-299)
    if (!response.ok) {
      // Essayer de parser le message d'erreur
      let errorData;
      try {
        errorData = await response.json();
      } catch (e) {
        throw new Error(`Erreur ${response.status}: ${response.statusText}`);
      }
      
      throw new Error(errorData.message || `Erreur ${response.status}: ${response.statusText}`);
    }

    // Parser la réponse JSON
    const data = await response.json();
    return { data, status: response.status };
  } catch (error) {
    console.error('Erreur API:', error);
    throw error;
  }
}

// Service API
const api = {
  // ===== AUTHENTIFICATION =====
  
  /**
   * Inscription d'un nouvel utilisateur
   * 
   * @param {Object} userData - Données d'inscription (name, email, password, password_confirmation)
   * @returns {Promise} - Promesse contenant la réponse
   */
  register: async (userData) => {
    return apiRequest('/register', {
      method: 'POST',
      body: JSON.stringify(userData)
    });
  },
  
  /**
   * Connexion d'un utilisateur
   * 
   * @param {String} email - Email de l'utilisateur
   * @param {String} password - Mot de passe
   * @returns {Promise} - Promesse contenant la réponse avec le token
   */
  login: async (email, password) => {
    return apiRequest('/login', {
      method: 'POST',
      body: JSON.stringify({ email, password })
    });
  },
  
  /**
   * Déconnexion d'un utilisateur
   * 
   * @param {String} token - Token d'authentification
   * @returns {Promise} - Promesse contenant la réponse
   */
  logout: async (token) => {
    return apiRequest('/logout', {
      method: 'POST'
    }, token);
  },
  
  // ===== UTILISATEUR =====
  
  /**
   * Récupère les informations de l'utilisateur connecté
   * 
   * @param {String} token - Token d'authentification
   * @returns {Promise} - Promesse contenant les informations de l'utilisateur
   */
  getUserInfo: async (token) => {
    return apiRequest('/me', {
      method: 'GET'
    }, token);
  },
  
  /**
   * Récupère les cartes de l'utilisateur connecté
   * 
   * @param {String} token - Token d'authentification
   * @returns {Promise} - Promesse contenant les cartes de l'utilisateur
   */
  getUserCards: async (token) => {
    return apiRequest('/me/cards', {
      method: 'GET'
    }, token);
  },
  
  /**
   * Met à jour les quantités de cartes possédées
   * 
   * @param {String} token - Token d'authentification
   * @param {Number} cardId - ID de la carte
   * @param {Number} normal - Quantité normale
   * @param {Number} foil - Quantité brillante
   * @returns {Promise} - Promesse contenant la réponse
   */
  updateOwnedCards: async (token, cardId, normal, foil) => {
    return apiRequest(`/me/${cardId}/update-owned`, {
      method: 'POST',
      body: JSON.stringify({ normal, foil })
    }, token);
  },
  
  // ===== CHAPITRES =====
  
  /**
   * Récupère tous les chapitres
   * 
   * @param {String} token - Token d'authentification
   * @returns {Promise} - Promesse contenant les chapitres
   */
  getSets: async (token) => {
    return apiRequest('/sets', {
      method: 'GET'
    }, token);
  },
  
  /**
   * Récupère les détails d'un chapitre
   * 
   * @param {String} token - Token d'authentification
   * @param {Number} setId - ID du chapitre
   * @returns {Promise} - Promesse contenant les détails du chapitre
   */
  getSetDetails: async (token, setId) => {
    return apiRequest(`/sets/${setId}`, {
      method: 'GET'
    }, token);
  },
  
  /**
   * Récupère les cartes d'un chapitre
   * 
   * @param {String} token - Token d'authentification
   * @param {Number} setId - ID du chapitre
   * @returns {Promise} - Promesse contenant les cartes du chapitre
   */
  getSetCards: async (token, setId) => {
    return apiRequest(`/sets/${setId}/cards`, {
      method: 'GET'
    }, token);
  },
  
  // ===== WISHLIST =====
  
  /**
   * Récupère la wishlist de l'utilisateur
   * 
   * @param {String} token - Token d'authentification
   * @returns {Promise} - Promesse contenant la wishlist
   */
  getWishlist: async (token) => {
    return apiRequest('/wishlist', {
      method: 'GET'
    }, token);
  },
  
  /**
   * Ajoute une carte à la wishlist
   * 
   * @param {String} token - Token d'authentification
   * @param {Number} cardId - ID de la carte
   * @returns {Promise} - Promesse contenant la réponse
   */
  addToWishlist: async (token, cardId) => {
    return apiRequest('/wishlist/add', {
      method: 'POST',
      body: JSON.stringify({ card_id: cardId })
    }, token);
  },
  
  /**
   * Retire une carte de la wishlist
   * 
   * @param {String} token - Token d'authentification
   * @param {Number} cardId - ID de la carte
   * @returns {Promise} - Promesse contenant la réponse
   */
  removeFromWishlist: async (token, cardId) => {
    return apiRequest('/wishlist/remove', {
      method: 'POST',
      body: JSON.stringify({ card_id: cardId })
    }, token);
  },
  
  // ===== CARTES =====
  
  /**
   * Récupère toutes les cartes
   * 
   * @param {String} token - Token d'authentification
   * @returns {Promise} - Promesse contenant toutes les cartes
   */
  getAllCards: async (token) => {
    // Note: cet endpoint n'est pas spécifié dans la documentation,
    // mais nous supposons qu'il existe ou qu'il pourrait être ajouté
    return apiRequest('/cards', {
      method: 'GET'
    }, token);
  },
  
  /**
   * Récupère les statistiques de la collection
   * 
   * @param {String} token - Token d'authentification
   * @returns {Promise} - Promesse contenant les statistiques
   */
  getCollectionStats: async (token) => {
    // Note: cet endpoint n'est pas spécifié dans la documentation,
    // mais nous pouvons le calculer à partir des cartes de l'utilisateur
    try {
      const response = await api.getUserCards(token);
      
      if (response && response.data) {
        const cards = response.data;
        const totalNormal = cards.reduce((sum, card) => sum + (card.normal || 0), 0);
        const totalFoil = cards.reduce((sum, card) => sum + (card.foil || 0), 0);
        const uniqueCards = cards.filter(card => card.normal > 0 || card.foil > 0).length;
        
        return {
          data: {
            totalCards: uniqueCards,
            totalQuantity: totalNormal + totalFoil,
            normalCards: totalNormal,
            foilCards: totalFoil
          },
          status: 200
        };
      }
      
      return { data: { totalCards: 0, totalQuantity: 0, normalCards: 0, foilCards: 0 }, status: 200 };
    } catch (error) {
      console.error('Erreur lors du calcul des statistiques:', error);
      throw error;
    }
  }
};

export default api;
