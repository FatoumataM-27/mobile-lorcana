import { View, Text, FlatList, StyleSheet, RefreshControl } from 'react-native';
import React, { useEffect, useState, useCallback } from 'react';
import { useAuth } from '../contexts/AuthContext';
import api from '../services/api';
import Card from '../components/Card';

export default function WishlistScreen() {
  const [wishlist, setWishlist] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { token } = useAuth();

  const loadWishlist = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await api.getWishlist(token);
      if (response && response.data) {
        setWishlist(response.data);
      } else {
        throw new Error('Format de réponse invalide');
      }
    } catch (err) {
      console.error('Erreur lors du chargement de la wishlist:', err);
      setError(err.message || 'Impossible de charger la wishlist. Veuillez réessayer.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (token) {
      loadWishlist();
    }
  }, [token]);

  const handleWishlistUpdate = useCallback(() => {
    loadWishlist();
  }, []);

  if (error) {
    return (
      <View style={styles.container}>
        <Text style={styles.errorText}>{error}</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <FlatList
        data={wishlist}
        renderItem={({ item }) => (
          <Card 
            card={item} 
            onWishlistUpdate={handleWishlistUpdate}
          />
        )}
        keyExtractor={item => item.id.toString()}
        contentContainerStyle={styles.listContainer}
        refreshControl={
          <RefreshControl
            refreshing={loading}
            onRefresh={loadWishlist}
            colors={['#6B3FA0']}
          />
        }
        ListEmptyComponent={
          !loading && (
            <Text style={styles.emptyText}>
              Votre wishlist est vide
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
  listContainer: {
    padding: 15,
  },
  errorText: {
    color: '#ff0000',
    textAlign: 'center',
    marginVertical: 20,
  },
  emptyText: {
    textAlign: 'center',
    marginVertical: 20,
    color: '#666',
  },
});
