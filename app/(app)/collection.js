import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, FlatList, TextInput, TouchableOpacity, ActivityIndicator } from 'react-native';
import { useAuth } from '../contexts/AuthContext';
import api from '../services/api';
import Card from '../components/Card';
import { colors } from '../theme/colors';

export default function CollectionScreen() {
  const [cards, setCards] = useState([]);
  const [filteredCards, setFilteredCards] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeFilter, setActiveFilter] = useState('all'); // 'all', 'normal', 'foil'
  const [collectionStats, setCollectionStats] = useState({
    totalCards: 0,
    normalCards: 0,
    foilCards: 0
  });
  const { token } = useAuth();

  useEffect(() => {
    loadCollection();
  }, [token]);

  const loadCollection = async () => {
    try {
      setLoading(true);
      setError(null);
      
      // Charger les cartes de la collection
      const response = await api.getUserCards(token);
      
      if (response && response.data) {
        // Filtrer les cartes qui ont au moins une quantité (normale ou brillante)
        const ownedCards = response.data.filter(item => item.normal > 0 || item.foil > 0);
        
        // Récupérer les détails de toutes les cartes
        const allCardsResponse = await api.getAllCards(token);
        const allCardsMap = new Map(allCardsResponse.data.map(card => [card.id, card]));
        
        // Combiner les données de collection avec les détails des cartes
        const collectionCards = ownedCards.map(item => {
          const cardDetails = allCardsMap.get(item.card_id);
          if (!cardDetails) return null;
          
          return {
            ...cardDetails,
            normalCount: item.normal || 0,
            shinyCount: item.foil || 0,
            id: item.card_id
          };
        }).filter(card => card !== null); // Filtrer les cartes qui n'ont pas été trouvées
        
        // Calculer les statistiques de la collection
        const stats = {
          totalCards: collectionCards.length,
          normalCards: collectionCards.reduce((sum, card) => sum + (card.normalCount > 0 ? 1 : 0), 0),
          foilCards: collectionCards.reduce((sum, card) => sum + (card.shinyCount > 0 ? 1 : 0), 0)
        };
        
        setCollectionStats(stats);
        setCards(collectionCards);
        applyFilters(collectionCards, searchQuery, activeFilter);
      } else {
        throw new Error('Format de réponse invalide');
      }
    } catch (err) {
      console.error('Erreur lors du chargement de la collection:', err);
      setError(err.message || 'Impossible de charger votre collection. Veuillez réessayer.');
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

  const applyFilters = (cardsData, query, filter) => {
    let filtered = [...cardsData];
    
    // Appliquer le filtre de recherche
    if (query) {
      filtered = filtered.filter(card => 
        card.name.toLowerCase().includes(query.toLowerCase())
      );
    }
    
    // Appliquer le filtre de type
    switch (filter) {
      case 'normal':
        filtered = filtered.filter(card => card.normalCount > 0);
        break;
      case 'foil':
        filtered = filtered.filter(card => card.shinyCount > 0);
        break;
      // Pour 'all', on garde toutes les cartes
    }
    
    setFilteredCards(filtered);
  };

  const onCollectionUpdate = () => {
    // Recharger la collection pour avoir les données à jour
    loadCollection();
  };

  const onWishlistUpdate = () => {
    // Pas besoin de recharger la collection pour les mises à jour de wishlist
  };

  return (
    <View style={styles.container}>
      <View style={styles.statsContainer}>
        <View style={styles.statItem}>
          <Text style={styles.statValue}>{collectionStats.totalCards}</Text>
          <Text style={styles.statLabel}>Total</Text>
        </View>
        <View style={styles.statItem}>
          <Text style={styles.statValue}>{collectionStats.normalCards}</Text>
          <Text style={styles.statLabel}>Normal</Text>
        </View>
        <View style={styles.statItem}>
          <Text style={styles.statValue}>{collectionStats.foilCards}</Text>
          <Text style={styles.statLabel}>Brillant</Text>
        </View>
      </View>

      <TextInput
        style={styles.searchInput}
        placeholder="Rechercher dans ma collection..."
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
          ]}>Toutes</Text>
        </TouchableOpacity>
        
        <TouchableOpacity 
          style={[
            styles.filterButton, 
            activeFilter === 'normal' && styles.activeFilterButton
          ]}
          onPress={() => handleFilterChange('normal')}
        >
          <Text style={[
            styles.filterText,
            activeFilter === 'normal' && styles.activeFilterText
          ]}>Normal</Text>
        </TouchableOpacity>
        
        <TouchableOpacity 
          style={[
            styles.filterButton, 
            activeFilter === 'foil' && styles.activeFilterButton
          ]}
          onPress={() => handleFilterChange('foil')}
        >
          <Text style={[
            styles.filterText,
            activeFilter === 'foil' && styles.activeFilterText
          ]}>Brillant</Text>
        </TouchableOpacity>
      </View>
      
      {loading ? (
        <ActivityIndicator size="large" color={colors.primary} style={styles.loader} />
      ) : error ? (
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>{error}</Text>
          <TouchableOpacity style={styles.retryButton} onPress={loadCollection}>
            <Text style={styles.retryButtonText}>Réessayer</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <>
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
                {searchQuery 
                  ? "Aucune carte ne correspond à votre recherche." 
                  : "Votre collection est vide. Ajoutez des cartes depuis l'écran des cartes."}
              </Text>
            }
          />
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
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    backgroundColor: colors.surface,
    borderRadius: 10,
    padding: 15,
    marginBottom: 15,
    elevation: 2,
  },
  statItem: {
    alignItems: 'center',
  },
  statValue: {
    fontSize: 20,
    fontWeight: 'bold',
    color: colors.primary,
  },
  statLabel: {
    fontSize: 14,
    color: colors.textSecondary,
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
    padding: 20,
  },
});
