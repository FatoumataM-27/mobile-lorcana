import { View, Text, StyleSheet, RefreshControl, ScrollView, ActivityIndicator } from 'react-native';
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

  if (loading && !stats) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#6B3FA0" />
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
          onRefresh={loadStats}
          colors={['#6B3FA0']}
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
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#fff',
  },
  header: {
    padding: 20,
    backgroundColor: '#6B3FA0',
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 8,
  },
  email: {
    fontSize: 16,
    color: 'rgba(255, 255, 255, 0.8)',
  },
  statsContainer: {
    padding: 20,
  },
  statCard: {
    backgroundColor: '#f8f8f8',
    borderRadius: 12,
    padding: 20,
    marginBottom: 15,
    alignItems: 'center',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  statValue: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#6B3FA0',
    marginBottom: 8,
  },
  statLabel: {
    fontSize: 16,
    color: '#666',
  },
  errorText: {
    color: '#c62828',
    textAlign: 'center',
    margin: 20,
    fontSize: 16,
  },
  progressSection: {
    marginTop: 20,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#444',
    marginBottom: 15,
  },
  progressItem: {
    marginBottom: 15,
  },
  setName: {
    fontSize: 16,
    color: '#444',
    marginBottom: 8,
  },
  progressBar: {
    height: 8,
    backgroundColor: '#f0f0f0',
    borderRadius: 4,
    overflow: 'hidden',
    marginBottom: 4,
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#6B3FA0',
  },
  progressText: {
    fontSize: 14,
    color: '#666',
    textAlign: 'right',
  },
});
