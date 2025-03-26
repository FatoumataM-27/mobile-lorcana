import React, { useState, useEffect } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  ActivityIndicator
} from 'react-native';
import { useAuth } from '../../contexts/AuthContext';
import api from '../../services/api';
import CardList from '../../components/CardList';
import { colors } from '../../theme/colors';
import { typography } from '../../theme/typography';
import { spacing } from '../../theme/spacing';

/**
 * Écran de collection - Affiche les cartes possédées par l'utilisateur
 */
export default function CollectionScreen() {
  const { token } = useAuth();
  
  const [cards, setCards] = useState([]);
  const [filteredCards, setFilteredCards] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeFilter, setActiveFilter] = useState('all');
  const [stats, setStats] = useState({
    totalCards: 0,
    totalQuantity: 0,
    normalCards: 0,
    foilCards: 0
  });
  
  // Charger les cartes de l'utilisateur
  useEffect(() => {
    if (token) {
      loadUserCards();
    }
  }, [token]);
  
  // Filtrer les cartes en fonction de la recherche et du filtre actif
  useEffect(() => {
    if (cards.length > 0) {
      filterCards();
    }
  }, [cards, searchQuery, activeFilter]);
  
  /**
   * Charge les cartes de l'utilisateur depuis l'API
   */
  const loadUserCards = async () => {
    try {
      setLoading(true);
      setError(null);
      
      // Récupérer les cartes de l'utilisateur
      const userCardsResponse = await api.getUserCards(token);
      
      if (userCardsResponse && userCardsResponse.data) {
        const userCards = userCardsResponse.data;
        
        // Récupérer les cartes de la wishlist pour marquer celles qui y sont
        const wishlistResponse = await api.getWishlist(token);
        const wishlistIds = wishlistResponse.data.map(card => card.id);
        
        // Fusionner les données
        const mergedCards = userCards.map(card => ({
          ...card,
          inWishlist: wishlistIds.includes(card.id),
          normalCount: card.normal || 0,
          shinyCount: card.foil || 0
        }));
        
        // Calculer les statistiques
        const totalNormal = mergedCards.reduce((sum, card) => sum + (card.normal || 0), 0);
        const totalFoil = mergedCards.reduce((sum, card) => sum + (card.foil || 0), 0);
        const uniqueCards = mergedCards.filter(card => card.normal > 0 || card.foil > 0).length;
        
        setStats({
          totalCards: uniqueCards,
          totalQuantity: totalNormal + totalFoil,
          normalCards: totalNormal,
          foilCards: totalFoil
        });
        
        setCards(mergedCards);
      } else {
        throw new Error('Format de réponse invalide');
      }
    } catch (err) {
      console.error('Erreur lors du chargement des cartes:', err);
      setError(err.message || 'Impossible de charger vos cartes. Veuillez réessayer.');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };
  
  /**
   * Filtre les cartes en fonction de la recherche et du filtre actif
   */
  const filterCards = () => {
    let result = [...cards];
    
    // Appliquer le filtre de recherche
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase().trim();
      result = result.filter(card => 
        card.name?.toLowerCase().includes(query) || 
        (card.number && card.number.toString().includes(query))
      );
    }
    
    // Appliquer le filtre actif
    if (activeFilter === 'normal') {
      result = result.filter(card => card.normal > 0);
    } else if (activeFilter === 'foil') {
      result = result.filter(card => card.foil > 0);
    }
    
    setFilteredCards(result);
  };
  
  /**
   * Gère le rafraîchissement des données
   */
  const handleRefresh = () => {
    setRefreshing(true);
    loadUserCards();
  };
  
  /**
   * Gère le changement de recherche
   */
  const handleSearchChange = (text) => {
    setSearchQuery(text);
  };
  
  /**
   * Gère le changement de filtre
   */
  const handleFilterChange = (filter) => {
    setActiveFilter(filter);
  };
  
  /**
   * Gère l'ajout/retrait d'une carte de la wishlist
   */
  const handleWishlistToggle = async (card) => {
    try {
      if (card.inWishlist) {
        await api.removeFromWishlist(token, card.id);
      } else {
        await api.addToWishlist(token, card.id);
      }
      
      // Mettre à jour l'état local
      const updatedCards = cards.map(c => {
        if (c.id === card.id) {
          return { ...c, inWishlist: !c.inWishlist };
        }
        return c;
      });
      
      setCards(updatedCards);
    } catch (error) {
      console.error('Erreur lors de la mise à jour de la wishlist:', error);
      throw error;
    }
  };
  
  /**
   * Gère la mise à jour des quantités de cartes dans la collection
   */
  const handleCollectionUpdate = (card, normal, foil) => {
    // Rediriger vers l'écran de détail de la carte
    router.push({
      pathname: `/card/${card.id}`,
      params: { showCollection: true }
    });
  };
  
  // Filtres personnalisés pour la collection
  const collectionFilters = [
    { id: 'all', label: 'Toutes' },
    { id: 'normal', label: 'Normales' },
    { id: 'foil', label: 'Brillantes' }
  ];

  return (
    <View style={styles.container}>
      {/* En-tête avec statistiques */}
      <View style={styles.header}>
        <Text style={styles.title}>Ma Collection</Text>
        
        <View style={styles.statsContainer}>
          <StatItem 
            value={stats.totalCards} 
            label="Cartes uniques" 
            icon="layers"
          />
          <StatItem 
            value={stats.totalQuantity} 
            label="Total" 
            icon="grid"
          />
          <StatItem 
            value={stats.normalCards} 
            label="Normales" 
            icon="document"
          />
          <StatItem 
            value={stats.foilCards} 
            label="Brillantes" 
            icon="sparkles"
          />
        </View>
      </View>
      
      {/* Liste des cartes avec filtres et recherche */}
      <CardList
        data={filteredCards}
        loading={loading}
        error={error}
        searchQuery={searchQuery}
        onSearchChange={handleSearchChange}
        activeFilter={activeFilter}
        onFilterChange={handleFilterChange}
        onWishlistToggle={handleWishlistToggle}
        onCollectionUpdate={handleCollectionUpdate}
        onRefresh={handleRefresh}
        refreshing={refreshing}
        filters={collectionFilters}
      />
    </View>
  );
}

/**
 * Composant StatItem - Affiche une statistique
 */
function StatItem({ value, label, icon }) {
  return (
    <View style={styles.statItem}>
      <Ionicons name={icon} size={20} color={colors.primary} />
      <Text style={styles.statValue}>{value}</Text>
      <Text style={styles.statLabel}>{label}</Text>
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
    justifyContent: 'space-between',
    marginTop: spacing.sm,
  },
  statItem: {
    alignItems: 'center',
    flex: 1,
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
