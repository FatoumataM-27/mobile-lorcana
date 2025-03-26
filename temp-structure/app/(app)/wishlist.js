import React, { useState, useEffect } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  ActivityIndicator 
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../../contexts/AuthContext';
import api from '../../services/api';
import CardList from '../../components/CardList';
import { colors } from '../../theme/colors';
import { typography } from '../../theme/typography';
import { spacing } from '../../theme/spacing';

/**
 * Écran Wishlist - Affiche les cartes que l'utilisateur souhaite acquérir
 */
export default function WishlistScreen() {
  const { token } = useAuth();
  
  const [cards, setCards] = useState([]);
  const [filteredCards, setFilteredCards] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  
  // Charger les cartes de la wishlist
  useEffect(() => {
    if (token) {
      loadWishlist();
    }
  }, [token]);
  
  // Filtrer les cartes en fonction de la recherche
  useEffect(() => {
    if (cards.length > 0) {
      filterCards();
    }
  }, [cards, searchQuery]);
  
  /**
   * Charge les cartes de la wishlist depuis l'API
   */
  const loadWishlist = async () => {
    try {
      setLoading(true);
      setError(null);
      
      // Récupérer les cartes de la wishlist
      const wishlistResponse = await api.getWishlist(token);
      
      if (wishlistResponse && wishlistResponse.data) {
        const wishlistCards = wishlistResponse.data;
        
        // Récupérer les cartes de l'utilisateur pour les quantités
        const userCardsResponse = await api.getUserCards(token);
        const userCards = userCardsResponse.data || [];
        
        // Fusionner les données
        const mergedCards = wishlistCards.map(card => {
          const userCard = userCards.find(uc => uc.id === card.id);
          
          return {
            ...card,
            inWishlist: true, // Toutes les cartes sont dans la wishlist
            normalCount: userCard ? userCard.normal || 0 : 0,
            shinyCount: userCard ? userCard.foil || 0 : 0
          };
        });
        
        setCards(mergedCards);
        setFilteredCards(mergedCards);
      } else {
        throw new Error('Format de réponse invalide');
      }
    } catch (err) {
      console.error('Erreur lors du chargement de la wishlist:', err);
      setError(err.message || 'Impossible de charger votre wishlist. Veuillez réessayer.');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };
  
  /**
   * Filtre les cartes en fonction de la recherche
   */
  const filterCards = () => {
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase().trim();
      const filtered = cards.filter(card => 
        card.name?.toLowerCase().includes(query) || 
        (card.number && card.number.toString().includes(query))
      );
      setFilteredCards(filtered);
    } else {
      setFilteredCards(cards);
    }
  };
  
  /**
   * Gère le rafraîchissement des données
   */
  const handleRefresh = () => {
    setRefreshing(true);
    loadWishlist();
  };
  
  /**
   * Gère le changement de recherche
   */
  const handleSearchChange = (text) => {
    setSearchQuery(text);
  };
  
  /**
   * Gère le retrait d'une carte de la wishlist
   */
  const handleWishlistToggle = async (card) => {
    try {
      await api.removeFromWishlist(token, card.id);
      
      // Mettre à jour l'état local
      const updatedCards = cards.filter(c => c.id !== card.id);
      setCards(updatedCards);
      
      // Mettre à jour les cartes filtrées
      if (searchQuery.trim()) {
        const query = searchQuery.toLowerCase().trim();
        const filtered = updatedCards.filter(card => 
          card.name?.toLowerCase().includes(query) || 
          (card.number && card.number.toString().includes(query))
        );
        setFilteredCards(filtered);
      } else {
        setFilteredCards(updatedCards);
      }
    } catch (error) {
      console.error('Erreur lors de la mise à jour de la wishlist:', error);
      throw error;
    }
  };
  
  /**
   * Gère la mise à jour des quantités de cartes dans la collection
   */
  const handleCollectionUpdate = (card) => {
    // Rediriger vers l'écran de détail de la carte
    router.push({
      pathname: `/card/${card.id}`,
      params: { showCollection: true }
    });
  };

  return (
    <View style={styles.container}>
      {/* En-tête */}
      <View style={styles.header}>
        <Text style={styles.title}>Ma Wishlist</Text>
        <View style={styles.statsContainer}>
          <View style={styles.statItem}>
            <Ionicons name="heart" size={24} color={colors.wishlist} />
            <Text style={styles.statValue}>{cards.length}</Text>
            <Text style={styles.statLabel}>Cartes souhaitées</Text>
          </View>
        </View>
      </View>
      
      {/* Liste des cartes avec recherche */}
      <CardList
        data={filteredCards}
        loading={loading}
        error={error}
        searchQuery={searchQuery}
        onSearchChange={handleSearchChange}
        onWishlistToggle={handleWishlistToggle}
        onCollectionUpdate={handleCollectionUpdate}
        onRefresh={handleRefresh}
        refreshing={refreshing}
        filters={[]} // Pas de filtres pour la wishlist
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  header: {
    padding: spacing.lg,
    backgroundColor: colors.background,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  title: {
    ...typography.h1,
    color: colors.textPrimary,
    marginBottom: spacing.md,
  },
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: spacing.sm,
  },
  statItem: {
    alignItems: 'center',
  },
  statValue: {
    ...typography.h3,
    color: colors.textPrimary,
    marginVertical: spacing.xs,
  },
  statLabel: {
    ...typography.caption,
    color: colors.textSecondary,
  },
});
