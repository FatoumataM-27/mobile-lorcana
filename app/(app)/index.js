import React, { useEffect, useState } from 'react';
import { View, Text, FlatList, StyleSheet, RefreshControl, TouchableOpacity } from 'react-native';
import { useAuth } from '@/app/contexts/AuthContext';
import api from '@/app/services/api';
import SetCard from '@/app/components/SetCard';
import { colors } from '@/app/theme/colors';

export default function Sets() {
  const [sets, setSets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { token } = useAuth();

  const loadSets = async () => {
    try {
      setLoading(true);
      setError(null);
      console.log('Chargement des sets avec token:', token);
      
      const response = await api.getSets(token);
      console.log('Réponse des sets:', response);
      
      if (response && response.data) {
        setSets(response.data);
      } else {
        throw new Error('Format de réponse invalide');
      }
    } catch (err) {
      console.error('Erreur lors du chargement des sets:', err);
      setError(err.message || 'Impossible de charger les sets. Veuillez réessayer.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (token) {
      loadSets();
    }
  }, [token]);

  const renderItem = ({ item }) => (
    <SetCard set={item} />
  );

  if (error) {
    return (
      <View style={styles.container}>
        <Text style={styles.errorText}>{error}</Text>
        <TouchableOpacity 
          style={styles.retryButton} 
          onPress={loadSets}
        >
          <Text style={styles.retryText}>Réessayer</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <FlatList
        data={sets}
        renderItem={renderItem}
        keyExtractor={item => item.id.toString()}
        contentContainerStyle={styles.listContainer}
        refreshControl={
          <RefreshControl
            refreshing={loading}
            onRefresh={loadSets}
            colors={[colors.primary]}
            tintColor={colors.primary}
          />
        }
        ListEmptyComponent={
          !loading && (
            <Text style={styles.emptyText}>
              Aucun set disponible
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
    backgroundColor: colors.background,
    padding: 10,
  },
  listContainer: {
    padding: 10,
  },
  errorText: {
    color: colors.error,
    textAlign: 'center',
    marginVertical: 20,
  },
  emptyText: {
    textAlign: 'center',
    marginVertical: 20,
    color: colors.textSecondary,
  },
  retryButton: {
    backgroundColor: colors.primary,
    padding: 10,
    borderRadius: 5,
    marginHorizontal: 50,
  },
  retryText: {
    color: colors.textLight,
    textAlign: 'center',
  },
});
