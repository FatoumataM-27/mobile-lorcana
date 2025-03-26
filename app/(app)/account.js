import { View, Text, StyleSheet, RefreshControl, ScrollView, ActivityIndicator, TouchableOpacity, FlatList } from 'react-native';
import React, { useEffect, useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { router } from 'expo-router';
import api from '../services/api';
import Card from '../components/Card';
import { colors } from '../theme/colors';

export default function AccountScreen() {
  const [stats, setStats] = useState(null);
  const [recentCards, setRecentCards] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { token, user } = useAuth();

  const loadStats = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await api.getCollectionStats(token);
      console.log('Collection stats response:', response);
      
      // Traitement des données pour calculer les statistiques
      if (response && response.data) {
        // Calculer les statistiques à partir des données de la collection
        const cards = response.data;
        const stats = {
          totalCards: 0,
          uniqueCards: cards.length,
          shinyCards: 0
        };
        
        // Calculer le nombre total de cartes et de cartes brillantes
        cards.forEach(card => {
          stats.totalCards += (card.normal_quantity || 0) + (card.foil_quantity || 0);
          if (card.foil_quantity > 0) {
            stats.shinyCards += 1;
          }
        });
        
        console.log('Calculated stats:', stats);
        setStats(stats);
      } else {
        throw new Error('Format de réponse invalide');
      }
    } catch (err) {
      console.error('Erreur lors du chargement des statistiques:', err);
      setError(err.message || 'Impossible de charger les statistiques. Veuillez réessayer.');
    } finally {
      setLoading(false);
    }
  };

  const loadRecentCards = async () => {
    try {
      // Récupérer les cartes de la collection
      const collectionResponse = await api.getUserCards(token);
      
      if (collectionResponse && collectionResponse.data) {
        // Filtrer les cartes qui ont au moins une quantité (normale ou brillante)
        const ownedCards = collectionResponse.data.filter(item => item.normal > 0 || item.foil > 0);
        
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
            id: item.card_id,
            imageUrl: cardDetails.thumbnail || cardDetails.image_url || cardDetails.image
          };
        }).filter(card => card !== null); // Filtrer les cartes qui n'ont pas été trouvées
        
        // Trier les cartes par date d'ajout (si disponible) ou par ID
        const sortedCards = collectionCards.sort((a, b) => {
          if (a.added_at && b.added_at) {
            return new Date(b.added_at) - new Date(a.added_at);
          }
          return b.id - a.id; // Par défaut, trier par ID décroissant
        });
        
        // Prendre les 6 cartes les plus récentes
        const recentCards = sortedCards.slice(0, 6);
        setRecentCards(recentCards);
      }
    } catch (err) {
      console.error('Erreur lors du chargement des cartes récentes:', err);
    }
  };

  useEffect(() => {
    if (token) {
      loadStats();
      loadRecentCards();
    }
  }, [token]);

  const handleRefresh = () => {
    loadStats();
    loadRecentCards();
  };

  const onCollectionUpdate = () => {
    // Recharger les statistiques et les cartes récentes
    loadStats();
    loadRecentCards();
  };

  const onWishlistUpdate = () => {
    // Pas besoin de recharger pour les mises à jour de wishlist
  };

  if (loading && !stats) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.container}>
        <Text style={styles.errorText}>{error}</Text>
      </View>
    );
  }

  return (
    <ScrollView 
      style={styles.container}
      refreshControl={
        <RefreshControl
          refreshing={loading}
          onRefresh={handleRefresh}
          colors={[colors.primary]}
        />
      }
    >
      <View style={styles.header}>
        <Text style={styles.title}>Mon Compte</Text>
        {user?.email && (
          <Text style={styles.email}>{user.email}</Text>
        )}
      </View>

      {stats && (
        <View style={styles.statsContainer}>
          <View style={styles.statCard}>
            <Text style={styles.statValue}>{stats.totalCards || 0}</Text>
            <Text style={styles.statLabel}>Cartes totales</Text>
          </View>

          <View style={styles.statCard}>
            <Text style={styles.statValue}>{stats.uniqueCards || 0}</Text>
            <Text style={styles.statLabel}>Cartes uniques</Text>
          </View>

          <View style={styles.statCard}>
            <Text style={styles.statValue}>{stats.shinyCards || 0}</Text>
            <Text style={styles.statLabel}>Cartes brillantes</Text>
          </View>

          {stats.setProgress && (
            <View style={styles.progressSection}>
              <Text style={styles.sectionTitle}>Progression par set</Text>
              {Object.entries(stats.setProgress).map(([setName, progress]) => (
                <View key={setName} style={styles.progressItem}>
                  <Text style={styles.setName}>{setName}</Text>
                  <View style={styles.progressBar}>
                    <View 
                      style={[
                        styles.progressFill,
                        { width: `${Math.min(100, progress * 100)}%` }
                      ]} 
                    />
                  </View>
                  <Text style={styles.progressText}>{Math.round(progress * 100)}%</Text>
                </View>
              ))}
            </View>
          )}
        </View>
      )}

      <View style={styles.recentCardsSection}>
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Mes cartes récentes</Text>
          <TouchableOpacity 
            style={styles.viewAllButton}
            onPress={() => router.push('/collection')}
          >
            <Text style={styles.viewAllText}>Voir tout</Text>
          </TouchableOpacity>
        </View>

        {recentCards.length > 0 ? (
          <FlatList
            data={recentCards}
            renderItem={({ item }) => (
              <Card 
                card={item} 
                onCollectionUpdate={onCollectionUpdate}
                onWishlistUpdate={onWishlistUpdate}
              />
            )}
            keyExtractor={item => item.id.toString()}
            numColumns={2}
            scrollEnabled={false}
            contentContainerStyle={styles.cardList}
          />
        ) : (
          <View style={styles.emptyCardsContainer}>
            <Text style={styles.emptyCardsText}>
              Vous n'avez pas encore de cartes dans votre collection.
            </Text>
            <TouchableOpacity 
              style={styles.browseCardsButton}
              onPress={() => router.push('/cards')}
            >
              <Text style={styles.browseCardsButtonText}>Parcourir les cartes</Text>
            </TouchableOpacity>
          </View>
        )}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: colors.background,
  },
  header: {
    padding: 20,
    backgroundColor: colors.primary,
    borderBottomLeftRadius: 20,
    borderBottomRightRadius: 20,
    marginBottom: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: colors.textLight,
    marginBottom: 5,
  },
  email: {
    fontSize: 16,
    color: colors.textLight,
    opacity: 0.8,
  },
  statsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    padding: 15,
    backgroundColor: colors.surface,
    borderRadius: 15,
    margin: 15,
    marginTop: 0,
    elevation: 2,
  },
  statCard: {
    width: '30%',
    alignItems: 'center',
    marginBottom: 15,
  },
  statValue: {
    fontSize: 24,
    fontWeight: 'bold',
    color: colors.primary,
  },
  statLabel: {
    fontSize: 14,
    color: colors.textSecondary,
    textAlign: 'center',
  },
  progressSection: {
    width: '100%',
    marginTop: 10,
  },
  progressItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  setName: {
    width: '30%',
    fontSize: 14,
    color: colors.text,
  },
  progressBar: {
    flex: 1,
    height: 10,
    backgroundColor: '#e0e0e0',
    borderRadius: 5,
    marginHorizontal: 10,
  },
  progressFill: {
    height: '100%',
    backgroundColor: colors.primary,
    borderRadius: 5,
  },
  progressText: {
    width: '10%',
    fontSize: 14,
    color: colors.text,
    textAlign: 'right',
  },
  errorText: {
    padding: 20,
    fontSize: 16,
    color: colors.error,
    textAlign: 'center',
  },
  recentCardsSection: {
    padding: 15,
    backgroundColor: colors.surface,
    borderRadius: 15,
    margin: 15,
    marginBottom: 30,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 15,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: colors.text,
  },
  viewAllButton: {
    padding: 8,
    backgroundColor: colors.primary,
    borderRadius: 20,
  },
  viewAllText: {
    color: colors.textLight,
    fontSize: 14,
    fontWeight: '500',
  },
  cardList: {
    paddingBottom: 10,
  },
  emptyCardsContainer: {
    padding: 20,
    alignItems: 'center',
  },
  emptyCardsText: {
    fontSize: 16,
    color: colors.textSecondary,
    textAlign: 'center',
    marginBottom: 15,
  },
  browseCardsButton: {
    backgroundColor: colors.primary,
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 25,
  },
  browseCardsButtonText: {
    color: colors.textLight,
    fontWeight: 'bold',
  },
});
