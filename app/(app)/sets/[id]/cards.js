import { View, Text, FlatList, StyleSheet, RefreshControl, TextInput, ActivityIndicator } from 'react-native';
import React, { useEffect, useState, useCallback } from 'react';
import { useLocalSearchParams } from 'expo-router';
import { useAuth } from '../../../contexts/AuthContext';
import api from '../../../services/api';
import Card from '../../../components/Card';

export default function SetCardsScreen() {
  const { id } = useLocalSearchParams();
  const [cards, setCards] = useState([]);
  const [filteredCards, setFilteredCards] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [retryCount, setRetryCount] = useState(0);
  const { token } = useAuth();

  const loadCards = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await api.getSetCards(token, id);
      if (response && response.data) {
        setCards(response.data);
        setFilteredCards(response.data);
      } else {
        throw new Error('Format de réponse invalide');
      }
    } catch (err) {
      console.error('Erreur lors du chargement des cartes:', err);
      setError(err.message || 'Impossible de charger les cartes. Veuillez réessayer.');
      
      // Réessayer automatiquement après 5 secondes si c'est une erreur de serveur
      if (err.message.includes('temporairement indisponible') && retryCount < 3) {
        setTimeout(() => {
          setRetryCount(prev => prev + 1);
          loadCards();
        }, 5000);
      }
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = useCallback((text) => {
    setSearchQuery(text);
    if (!text.trim()) {
      setFilteredCards(cards);
      return;
    }

    const searchTerms = text.toLowerCase().split(' ');
    const filtered = cards.filter(card => {
      const cardName = card.name?.toLowerCase() || '';
      const cardType = card.type?.toLowerCase() || '';
      const cardEffect = card.effect?.toLowerCase() || '';
      const cardLore = card.lore?.toLowerCase() || '';

      return searchTerms.every(term =>
        cardName.includes(term) ||
        cardType.includes(term) ||
        cardEffect.includes(term) ||
        cardLore.includes(term)
      );
    });

    setFilteredCards(filtered);
  }, [cards]);

  useEffect(() => {
    if (token && id) {
      loadCards();
    }
  }, [token, id]);

  const handleWishlistUpdate = useCallback(() => {
    // Cette fonction sera appelée quand une carte est ajoutée/retirée de la wishlist
    loadCards(); // Refresh the cards to get updated wishlist status
  }, []);

  const handleCollectionUpdate = useCallback(() => {
    // Cette fonction sera appelée quand une carte est ajoutée/retirée de la collection
    loadCards(); // Refresh the cards to get updated collection status
  }, []);

  if (error) {
    return (
      <View style={styles.container}>
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>{error}</Text>
          {retryCount < 3 && (
            <Text style={styles.retryText}>
              Nouvelle tentative dans quelques secondes...
            </Text>
          )}
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.searchContainer}>
        <TextInput
          style={styles.searchInput}
          placeholder="Rechercher une carte..."
          value={searchQuery}
          onChangeText={handleSearch}
          placeholderTextColor="#666"
        />
      </View>

      <FlatList
        data={filteredCards}
        renderItem={({ item }) => (
          <Card 
            card={item} 
            onWishlistUpdate={handleWishlistUpdate}
            onCollectionUpdate={handleCollectionUpdate}
          />
        )}
        keyExtractor={item => item.id.toString()}
        contentContainerStyle={styles.listContainer}
        refreshControl={
          <RefreshControl
            refreshing={loading}
            onRefresh={loadCards}
            colors={['#6B3FA0']}
          />
        }
        ListEmptyComponent={
          loading ? (
            <View style={styles.loadingContainer}>
              <ActivityIndicator size="large" color="#6B3FA0" />
              <Text style={styles.loadingText}>Chargement des cartes...</Text>
            </View>
          ) : (
            <Text style={styles.emptyText}>
              {searchQuery 
                ? 'Aucune carte ne correspond à votre recherche'
                : 'Aucune carte disponible dans ce set'
              }
            </Text>
          )
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  searchContainer: {
    padding: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  searchInput: {
    backgroundColor: '#f5f5f5',
    padding: 12,
    borderRadius: 8,
    fontSize: 16,
    color: '#000',
  },
  listContainer: {
    padding: 15,
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  errorText: {
    color: '#ff0000',
    textAlign: 'center',
    marginBottom: 10,
    fontSize: 16,
  },
  retryText: {
    color: '#666',
    textAlign: 'center',
    fontSize: 14,
  },
  loadingContainer: {
    padding: 20,
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 10,
    color: '#666',
    fontSize: 16,
  },
  emptyText: {
    textAlign: 'center',
    marginVertical: 20,
    color: '#666',
  },
});
