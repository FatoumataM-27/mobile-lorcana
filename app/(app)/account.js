import { View, Text, StyleSheet, RefreshControl, ScrollView } from 'react-native';
import React, { useEffect, useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import api from '../services/api';

export default function AccountScreen() {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { token, user } = useAuth();

  const loadStats = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await api.getCollectionStats(token);
      if (response && response.data) {
        setStats(response.data);
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

  useEffect(() => {
    if (token) {
      loadStats();
    }
  }, [token]);

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
          onRefresh={loadStats}
          colors={['#6B3FA0']}
        />
      }
    >
      <View style={styles.header}>
        <Text style={styles.username}>{user?.username || 'Utilisateur'}</Text>
      </View>

      <View style={styles.statsContainer}>
        <View style={styles.statCard}>
          <Text style={styles.statValue}>{stats?.totalCards || 0}</Text>
          <Text style={styles.statLabel}>Cartes totales</Text>
        </View>

        <View style={styles.statCard}>
          <Text style={styles.statValue}>{stats?.normalCards || 0}</Text>
          <Text style={styles.statLabel}>Cartes normales</Text>
        </View>

        <View style={styles.statCard}>
          <Text style={styles.statValue}>{stats?.shinyCards || 0}</Text>
          <Text style={styles.statLabel}>Cartes brillantes</Text>
        </View>
      </View>

      <View style={styles.collectionProgress}>
        <Text style={styles.sectionTitle}>Progression de la collection</Text>
        
        {stats?.setProgress?.map((set) => (
          <View key={set.id} style={styles.setProgress}>
            <Text style={styles.setName}>{set.name}</Text>
            <View style={styles.progressBar}>
              <View 
                style={[
                  styles.progressFill,
                  { width: `${(set.collected / set.total) * 100}%` }
                ]}
              />
            </View>
            <Text style={styles.progressText}>
              {set.collected}/{set.total} ({Math.round((set.collected / set.total) * 100)}%)
            </Text>
          </View>
        ))}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  header: {
    padding: 20,
    backgroundColor: '#6B3FA0',
    alignItems: 'center',
  },
  username: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#fff',
  },
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    padding: 20,
    backgroundColor: '#fff',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  statCard: {
    alignItems: 'center',
  },
  statValue: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#6B3FA0',
  },
  statLabel: {
    fontSize: 14,
    color: '#666',
    marginTop: 4,
  },
  collectionProgress: {
    padding: 20,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#444',
    marginBottom: 15,
  },
  setProgress: {
    marginBottom: 15,
  },
  setName: {
    fontSize: 16,
    color: '#444',
    marginBottom: 5,
  },
  progressBar: {
    height: 8,
    backgroundColor: '#f0f0f0',
    borderRadius: 4,
    overflow: 'hidden',
    marginBottom: 5,
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#6B3FA0',
  },
  progressText: {
    fontSize: 14,
    color: '#666',
  },
  errorText: {
    color: '#ff0000',
    textAlign: 'center',
    marginVertical: 20,
  },
});
