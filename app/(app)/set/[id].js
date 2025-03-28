import React, { useState, useEffect } from 'react';
import { View, FlatList, StyleSheet, Text, ActivityIndicator, TextInput, TouchableOpacity } from 'react-native';
import { useLocalSearchParams } from 'expo-router';
import { useAuth } from '../../contexts/AuthContext';
import api from '../../services/api';
import Card from '../../components/Card';
import { colors } from '../../theme/colors';

export default function SetCards() {
  const { id } = useLocalSearchParams();
  const { token } = useAuth();
  const [cards, setCards] = useState([]);
  const [filteredCards, setFilteredCards] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeFilter, setActiveFilter] = useState('all'); // 'all', 'wishlist', 'owned'
  const [setDetails, setSetDetails] = useState(null);

  useEffect(() => {
    loadSetDetails();
    loadCards();
  }, [id]);

  const loadSetDetails = async () => {
    try {
      const response = await api.getSetDetails(token, id);
      if (response && response.data) {
        setSetDetails(response.data);
      }
    } catch (error) {
      console.error('Erreur lors du chargement des détails du set:', error);
    }
  };

  const loadCards = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await api.getSetCards(token, id);
      if (response && response.data) {
        // Formater les données des cartes pour qu'elles soient compatibles avec le composant Card
        const formattedCards = response.data.map(card => ({
          ...card,
          normalCount: card.normal_quantity || 0,
          shinyCount: card.foil_quantity || 0,
          inWishlist: card.in_wishlist || false,
          imageUrl: card.thumbnail || card.image_url || card.image
        }));
        
        setCards(formattedCards);
        applyFilters(formattedCards, searchQuery, activeFilter);
      } else {
        throw new Error('Format de réponse invalide');
      }
    } catch (error) {
      console.error('Erreur lors du chargement des cartes:', error);
      setError(error.message || 'Impossible de charger les cartes. Veuillez réessayer.');
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (text) => {
    setSearchQuery(text);
    applyFilters(cards, text, activeFilter);
  };

  const handleFilterChange = (filter) => {
    setActiveFilter(filter);
    applyFilters(cards, searchQuery, filter);
  };

  const applyFilters = async (cardsData, query, filter) => {
    try {
      let filtered = [...cardsData];
      
      // Appliquer le filtre de recherche
      if (query) {
        filtered = filtered.filter(card => 
          card.name.toLowerCase().includes(query.toLowerCase())
        );
      }
      
      // Appliquer le filtre de type
      if (filter === 'wishlist') {
        const wishlistResponse = await api.getWishlist(token);
        const wishlistIds = wishlistResponse.data.map(item => item.id);
        filtered = filtered.filter(card => wishlistIds.includes(card.id));
      } else if (filter === 'owned') {
        const collectionResponse = await api.getUserCards(token);
        const ownedIds = collectionResponse.data
          .filter(item => item.normal > 0 || item.foil > 0)
          .map(item => item.card_id);
        filtered = filtered.filter(card => ownedIds.includes(card.id));
      }
      
      setFilteredCards(filtered);
    } catch (error) {
      console.error('Erreur lors de l\'application des filtres:', error);
      // En cas d'erreur, on garde les cartes filtrées uniquement par la recherche
      const textFiltered = cards.filter(card => 
        !query || card.name.toLowerCase().includes(query.toLowerCase())
      );
      setFilteredCards(textFiltered);
    }
  };

  const onCollectionUpdate = () => {
    // Recharger les cartes si nécessaire ou juste réappliquer les filtres
    if (activeFilter === 'owned') {
      applyFilters(cards, searchQuery, activeFilter);
    }
  };

  const onWishlistUpdate = () => {
    // Recharger les cartes si nécessaire ou juste réappliquer les filtres
    if (activeFilter === 'wishlist') {
      applyFilters(cards, searchQuery, activeFilter);
    }
  };

  return (
    <View style={styles.container}>
      {setDetails && (
        <View style={styles.setHeader}>
          <Text style={styles.setTitle}>{setDetails.name}</Text>
          {setDetails.release_date && (
            <Text style={styles.setSubtitle}>
              Sortie le {new Date(setDetails.release_date).toLocaleDateString('fr-FR')}
            </Text>
          )}
        </View>
      )}

      <TextInput
        style={styles.searchInput}
        placeholder="Rechercher des cartes..."
        value={searchQuery}
        onChangeText={handleSearch}
      />
      
      <View style={styles.filterContainer}>
        <TouchableOpacity 
          style={[
            styles.filterButton, 
            activeFilter === 'all' && styles.activeFilterButton
          ]}
          onPress={() => handleFilterChange('all')}
        >
          <Text style={[
            styles.filterText,
            activeFilter === 'all' && styles.activeFilterText
          ]}>Tout afficher</Text>
        </TouchableOpacity>
        
        <TouchableOpacity 
          style={[
            styles.filterButton, 
            activeFilter === 'wishlist' && styles.activeFilterButton
          ]}
          onPress={() => handleFilterChange('wishlist')}
        >
          <Text style={[
            styles.filterText,
            activeFilter === 'wishlist' && styles.activeFilterText
          ]}>Wishlist</Text>
        </TouchableOpacity>
        
        <TouchableOpacity 
          style={[
            styles.filterButton, 
            activeFilter === 'owned' && styles.activeFilterButton
          ]}
          onPress={() => handleFilterChange('owned')}
        >
          <Text style={[
            styles.filterText,
            activeFilter === 'owned' && styles.activeFilterText
          ]}>Possédées</Text>
        </TouchableOpacity>
      </View>
      
      {loading ? (
        <ActivityIndicator size="large" color={colors.primary} style={styles.loader} />
      ) : error ? (
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>{error}</Text>
          <TouchableOpacity style={styles.retryButton} onPress={loadCards}>
            <Text style={styles.retryButtonText}>Réessayer</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <FlatList
          data={filteredCards}
          renderItem={({ item }) => (
            <Card 
              card={item} 
              onCollectionUpdate={onCollectionUpdate}
              onWishlistUpdate={onWishlistUpdate}
            />
          )}
          keyExtractor={item => item.id.toString()}
          numColumns={2}
          contentContainerStyle={styles.cardList}
          ListEmptyComponent={
            <Text style={styles.emptyText}>
              Aucune carte ne correspond à votre recherche.
            </Text>
          }
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
    padding: 10,
  },
  setHeader: {
    marginBottom: 15,
    padding: 10,
    backgroundColor: colors.surface,
    borderRadius: 10,
    elevation: 2,
  },
  setTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: colors.primary,
    textAlign: 'center',
  },
  setSubtitle: {
    fontSize: 14,
    color: colors.textSecondary,
    textAlign: 'center',
    marginTop: 5,
  },
  searchInput: {
    backgroundColor: '#fff',
    borderRadius: 25,
    paddingHorizontal: 15,
    paddingVertical: 10,
    marginBottom: 10,
    fontSize: 16,
  },
  filterContainer: {
    flexDirection: 'row',
    backgroundColor: colors.primary,
    borderRadius: 25,
    marginBottom: 15,
    overflow: 'hidden',
  },
  filterButton: {
    flex: 1,
    paddingVertical: 10,
    alignItems: 'center',
  },
  activeFilterButton: {
    backgroundColor: colors.primaryDark,
  },
  filterText: {
    color: '#fff',
    fontWeight: '500',
  },
  activeFilterText: {
    fontWeight: 'bold',
  },
  cardList: {
    paddingBottom: 20,
  },
  loader: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  errorText: {
    fontSize: 16,
    color: colors.error,
    textAlign: 'center',
    marginBottom: 20,
  },
  retryButton: {
    backgroundColor: colors.primary,
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 25,
  },
  retryButtonText: {
    color: '#fff',
    fontWeight: 'bold',
  },
  emptyText: {
    textAlign: 'center',
    fontSize: 16,
    color: colors.textSecondary,
    marginTop: 30,
  },
});
