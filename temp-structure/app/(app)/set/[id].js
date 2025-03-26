import React, { useState, useEffect } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  ActivityIndicator,
  TouchableOpacity
} from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../../../contexts/AuthContext';
import api from '../../../services/api';
import CardList from '../../../components/CardList';
import { colors } from '../../../theme/colors';
import { typography } from '../../../theme/typography';
import { spacing, borderRadius } from '../../../theme/spacing';

/**
 * Écran des cartes d'un chapitre
 */
export default function SetScreen() {
  const { id } = useLocalSearchParams();
  const router = useRouter();
  const { token } = useAuth();
  
  const [set, setSet] = useState(null);
  const [cards, setCards] = useState([]);
  const [filteredCards, setFilteredCards] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeFilter, setActiveFilter] = useState('all');
  
  // Charger les détails du chapitre et ses cartes
  useEffect(() => {
    if (token && id) {
      loadSetDetails();
      loadSetCards();
    }
  }, [token, id]);
  
  // Filtrer les cartes en fonction de la recherche et du filtre actif
  useEffect(() => {
    if (cards.length > 0) {
      filterCards();
    }
  }, [cards, searchQuery, activeFilter]);
  
  /**
   * Charge les détails du chapitre depuis l'API
   */
  const loadSetDetails = async () => {
    try {
      const response = await api.getSetDetails(token, id);
      
      if (response && response.data) {
        setSet(response.data);
      } else {
        throw new Error('Format de réponse invalide');
      }
    } catch (err) {
      console.error('Erreur lors du chargement des détails du chapitre:', err);
      setError(err.message || 'Impossible de charger les détails du chapitre.');
    }
  };
  
  /**
   * Charge les cartes du chapitre depuis l'API
   */
  const loadSetCards = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await api.getSetCards(token, id);
      
      if (response && response.data) {
        // Récupérer les cartes de la wishlist pour marquer celles qui y sont
        const wishlistResponse = await api.getWishlist(token);
        const wishlistIds = wishlistResponse.data.map(card => card.id);
        
        // Récupérer les cartes de la collection pour les quantités
        const userCardsResponse = await api.getUserCards(token);
        const userCards = userCardsResponse.data || [];
        
        // Fusionner les données
        const mergedCards = response.data.map(card => {
          const inWishlist = wishlistIds.includes(card.id);
          const userCard = userCards.find(uc => uc.id === card.id);
          
          return {
            ...card,
            inWishlist,
            normalCount: userCard ? userCard.normal || 0 : 0,
            shinyCount: userCard ? userCard.foil || 0 : 0
          };
        });
        
        setCards(mergedCards);
      } else {
        throw new Error('Format de réponse invalide');
      }
    } catch (err) {
      console.error('Erreur lors du chargement des cartes:', err);
      setError(err.message || 'Impossible de charger les cartes. Veuillez réessayer.');
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
        card.name.toLowerCase().includes(query) || 
        (card.number && card.number.toString().includes(query))
      );
    }
    
    // Appliquer le filtre actif
    if (activeFilter === 'wishlist') {
      result = result.filter(card => card.inWishlist);
    } else if (activeFilter === 'owned') {
      result = result.filter(card => card.normalCount > 0 || card.shinyCount > 0);
    }
    
    setFilteredCards(result);
  };
  
  /**
   * Gère le rafraîchissement des données
   */
  const handleRefresh = () => {
    setRefreshing(true);
    loadSetCards();
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
    router.push({
      pathname: `/card/${card.id}`,
      params: { showCollection: true }
    });
  };
  
  // Afficher un indicateur de chargement
  if (loading && !refreshing && cards.length === 0) {
    return (
      <View style={styles.centerContainer}>
        <ActivityIndicator size="large" color={colors.primary} />
        <Text style={styles.loadingText}>Chargement des cartes...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* En-tête avec le nom du chapitre et bouton retour */}
      <View style={styles.header}>
        <TouchableOpacity 
          style={styles.backButton} 
          onPress={() => router.back()}
        >
          <Ionicons name="arrow-back" size={24} color={colors.textPrimary} />
        </TouchableOpacity>
        
        <View style={styles.headerContent}>
          <Text style={styles.title} numberOfLines={1}>
            {set?.name || 'Chapitre'}
          </Text>
          {set && (
            <Text style={styles.subtitle}>
              {set.card_number || 0} cartes
            </Text>
          )}
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
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: spacing.xl,
  },
  loadingText: {
    ...typography.body1,
    color: colors.textSecondary,
    marginTop: spacing.md,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.md,
    paddingTop: spacing.lg,
    paddingBottom: spacing.md,
    backgroundColor: colors.background,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: borderRadius.round,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: spacing.sm,
  },
  headerContent: {
    flex: 1,
  },
  title: {
    ...typography.h2,
    color: colors.textPrimary,
  },
  subtitle: {
    ...typography.body2,
    color: colors.textSecondary,
  },
});
