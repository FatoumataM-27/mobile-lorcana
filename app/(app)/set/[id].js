import React, { useState, useEffect } from 'react';
import { View, FlatList, StyleSheet } from 'react-native';
import { useLocalSearchParams } from 'expo-router';
import { useAuth } from '../../contexts/AuthContext';
import { api } from '../../services/api';
import CardItem from '../../components/CardItem';
import CardFilters from '../../components/CardFilters';

export default function SetCards() {
  const { id } = useLocalSearchParams();
  const { token } = useAuth();
  const [cards, setCards] = useState([]);
  const [filteredCards, setFilteredCards] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [filter, setFilter] = useState('all');

  useEffect(() => {
    loadCards();
  }, [id]);

  const loadCards = async () => {
    try {
      const cardsData = await api.getSetCards(token, id);
      setCards(cardsData);
      setFilteredCards(cardsData);
    } catch (error) {
      console.error('Erreur lors du chargement des cartes:', error);
    }
  };

  const handleSearch = (query) => {
    setSearchQuery(query);
    filterCards(query, filter);
  };

  const handleFilterChange = (newFilter) => {
    setFilter(newFilter);
    filterCards(searchQuery, newFilter);
  };

  const filterCards = (query, filterType) => {
    let filtered = cards;
    
    // Appliquer le filtre de recherche
    if (query) {
      filtered = filtered.filter(card => 
        card.name.toLowerCase().includes(query.toLowerCase())
      );
    }
    
    // Appliquer le filtre de type
    switch (filterType) {
      case 'owned':
        filtered = filtered.filter(card => 
          card.normal_quantity > 0 || card.foil_quantity > 0
        );
        break;
      case 'wishlist':
        filtered = filtered.filter(card => card.in_wishlist);
        break;
    }
    
    setFilteredCards(filtered);
  };

  const handleWishlistToggle = async (cardId) => {
    try {
      const card = cards.find(c => c.id === cardId);
      if (card) {
        if (card.in_wishlist) {
          await api.removeFromWishlist(token, cardId);
        } else {
          await api.addToWishlist(token, cardId);
        }
        
        // Mettre à jour l'état local
        const updatedCards = cards.map(c => 
          c.id === cardId 
            ? { ...c, in_wishlist: !c.in_wishlist }
            : c
        );
        setCards(updatedCards);
        filterCards(searchQuery, filter);
      }
    } catch (error) {
      console.error('Erreur lors de la mise à jour de la wishlist:', error);
    }
  };

  return (
    <View style={styles.container}>
      <CardFilters
        searchQuery={searchQuery}
        onSearchChange={handleSearch}
        activeFilter={filter}
        onFilterChange={handleFilterChange}
      />
      
      <FlatList
        data={filteredCards}
        renderItem={({ item }) => (
          <CardItem
            card={item}
            onWishlistToggle={handleWishlistToggle}
          />
        )}
        keyExtractor={item => item.id.toString()}
        contentContainerStyle={styles.list}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  list: {
    padding: 15,
  },
});
