import React, { useState, useEffect } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  FlatList, 
  RefreshControl,
  ActivityIndicator
} from 'react-native';
import { useAuth } from '../../contexts/AuthContext';
import api from '../../services/api';
import SetCard from '../../components/SetCard';
import { colors } from '../../theme/colors';
import { typography } from '../../theme/typography';
import { spacing } from '../../theme/spacing';

/**
 * Écran principal - Liste des chapitres (sets)
 */
export default function ChaptersScreen() {
  const [sets, setSets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState(null);
  const { token } = useAuth();

  // Charger les chapitres au montage du composant
  useEffect(() => {
    if (token) {
      loadSets();
    }
  }, [token]);

  /**
   * Charge la liste des chapitres depuis l'API
   */
  const loadSets = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await api.getSets(token);
      
      if (response && response.data) {
        // Trier les chapitres par date de sortie (du plus récent au plus ancien)
        const sortedSets = response.data.sort((a, b) => {
          if (!a.release_date) return 1;
          if (!b.release_date) return -1;
          return new Date(b.release_date) - new Date(a.release_date);
        });
        
        setSets(sortedSets);
      } else {
        throw new Error('Format de réponse invalide');
      }
    } catch (err) {
      console.error('Erreur lors du chargement des chapitres:', err);
      setError(err.message || 'Impossible de charger les chapitres. Veuillez réessayer.');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  /**
   * Gère le rafraîchissement de la liste
   */
  const handleRefresh = () => {
    setRefreshing(true);
    loadSets();
  };

  /**
   * Rendu d'un chapitre dans la liste
   */
  const renderSetCard = ({ item }) => (
    <SetCard set={item} />
  );

  // Afficher un indicateur de chargement
  if (loading && !refreshing && sets.length === 0) {
    return (
      <View style={styles.centerContainer}>
        <ActivityIndicator size="large" color={colors.primary} />
        <Text style={styles.loadingText}>Chargement des chapitres...</Text>
      </View>
    );
  }

  // Afficher un message d'erreur
  if (error) {
    return (
      <View style={styles.centerContainer}>
        <Text style={styles.errorText}>{error}</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <FlatList
        data={sets}
        renderItem={renderSetCard}
        keyExtractor={(item) => item.id.toString()}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={handleRefresh}
            colors={[colors.primary]}
            tintColor={colors.primary}
          />
        }
        ListHeaderComponent={
          <View style={styles.header}>
            <Text style={styles.title}>Chapitres</Text>
            <Text style={styles.subtitle}>
              Découvrez tous les chapitres disponibles de Lorcana
            </Text>
          </View>
        }
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyText}>
              Aucun chapitre disponible pour le moment.
            </Text>
          </View>
        }
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
  errorText: {
    ...typography.body1,
    color: colors.error,
    textAlign: 'center',
  },
  listContent: {
    padding: spacing.lg,
    paddingBottom: spacing.xxxl,
  },
  header: {
    marginBottom: spacing.xl,
  },
  title: {
    ...typography.h1,
    color: colors.textPrimary,
    marginBottom: spacing.xs,
  },
  subtitle: {
    ...typography.body1,
    color: colors.textSecondary,
  },
  emptyContainer: {
    padding: spacing.xl,
    alignItems: 'center',
  },
  emptyText: {
    ...typography.body1,
    color: colors.textSecondary,
    textAlign: 'center',
  },
});
