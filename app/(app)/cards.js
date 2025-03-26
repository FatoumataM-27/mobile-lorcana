import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, FlatList, TextInput, TouchableOpacity, ActivityIndicator } from 'react-native';
import { useAuth } from '../contexts/AuthContext';
import api from '../services/api';
import Card from '../components/Card';
import { colors } from '../theme/colors';

export default function CardsScreen() {
  const [cards, setCards] = useState([]);
  const [filteredCards, setFilteredCards] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeFilter, setActiveFilter] = useState('all'); // 'all', 'wishlist', 'owned'
  const { token } = useAuth();

  useEffect(() => {
    loadCards();
  }, [token]);

  const loadCards = async () => {
    try {
      setLoading(true);
      setError(null);
      
      // Charger toutes les cartes
      const response = await api.getAllCards(token);
      if (response && response.data) {
        setCards(response.data);
        applyFilters(response.data, searchQuery, activeFilter);
      } else {
        throw new Error('Format de réponse invalide');
      }
    } catch (err) {
      console.error('Erreur lors du chargement des cartes:', err);
      setError(err.message || 'Impossible de charger les cartes. Veuillez réessayer.');
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

  const renderCard = ({ item }) => (
    <Card 
      card={item} 
      onCollectionUpdate={onCollectionUpdate}
      onWishlistUpdate={onWishlistUpdate}
    />
  );

  return (
    <View style={styles.container}>
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
        <>
          <FlatList
            data={filteredCards}
            renderItem={renderCard}
            keyExtractor={item => item.id.toString()}
            numColumns={2}
            contentContainerStyle={styles.cardList}
            ListEmptyComponent={
              <Text style={styles.emptyText}>
                Aucune carte ne correspond à votre recherche.
              </Text>
            }
          />
          
          {activeFilter === 'all' && (
            <TouchableOpacity 
              style={styles.collectionButton}
              onPress={() => handleFilterChange('owned')}
            >
              <Text style={styles.collectionButtonText}>Voir ma collection</Text>
            </TouchableOpacity>
          )}
        </>
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
    paddingBottom: 80,
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
    color: 'red',
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
    color: '#666',
    marginTop: 30,
  },
  collectionButton: {
    position: 'absolute',
    bottom: 20,
    left: 20,
    right: 20,
    backgroundColor: colors.primary,
    paddingVertical: 12,
    borderRadius: 25,
    alignItems: 'center',
  },
  collectionButtonText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 16,
  },
});
