import React, { useState, useEffect } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  TouchableOpacity, 
  ActivityIndicator,
  Alert,
  ScrollView
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useAuth } from '../../contexts/AuthContext';
import api from '../../services/api';
import { colors } from '../../theme/colors';
import { typography } from '../../theme/typography';
import { spacing, borderRadius, elevation } from '../../theme/spacing';

/**
 * Écran de compte utilisateur
 */
export default function AccountScreen() {
  const { user, logout, token } = useAuth();
  const router = useRouter();
  
  const [stats, setStats] = useState({
    totalCards: 0,
    totalQuantity: 0,
    normalCards: 0,
    foilCards: 0,
    wishlistCount: 0
  });
  const [loading, setLoading] = useState(true);
  const [loggingOut, setLoggingOut] = useState(false);
  
  // Charger les statistiques de l'utilisateur
  useEffect(() => {
    if (token) {
      loadUserStats();
    }
  }, [token]);
  
  /**
   * Charge les statistiques de l'utilisateur
   */
  const loadUserStats = async () => {
    try {
      setLoading(true);
      
      // Récupérer les cartes de l'utilisateur
      const userCardsResponse = await api.getUserCards(token);
      const userCards = userCardsResponse.data || [];
      
      // Récupérer la wishlist
      const wishlistResponse = await api.getWishlist(token);
      const wishlist = wishlistResponse.data || [];
      
      // Calculer les statistiques
      const totalNormal = userCards.reduce((sum, card) => sum + (card.normal || 0), 0);
      const totalFoil = userCards.reduce((sum, card) => sum + (card.foil || 0), 0);
      const uniqueCards = userCards.filter(card => card.normal > 0 || card.foil > 0).length;
      
      setStats({
        totalCards: uniqueCards,
        totalQuantity: totalNormal + totalFoil,
        normalCards: totalNormal,
        foilCards: totalFoil,
        wishlistCount: wishlist.length
      });
    } catch (error) {
      console.error('Erreur lors du chargement des statistiques:', error);
    } finally {
      setLoading(false);
    }
  };
  
  /**
   * Gère la déconnexion de l'utilisateur
   */
  const handleLogout = async () => {
    Alert.alert(
      'Déconnexion',
      'Êtes-vous sûr de vouloir vous déconnecter ?',
      [
        { text: 'Annuler', style: 'cancel' },
        { 
          text: 'Déconnexion', 
          style: 'destructive',
          onPress: async () => {
            try {
              setLoggingOut(true);
              const result = await logout();
              
              if (result.success) {
                router.replace('/');
              } else {
                Alert.alert('Erreur', result.error || 'Une erreur est survenue lors de la déconnexion.');
              }
            } catch (error) {
              console.error('Erreur lors de la déconnexion:', error);
              Alert.alert('Erreur', 'Une erreur est survenue lors de la déconnexion.');
            } finally {
              setLoggingOut(false);
            }
          }
        }
      ]
    );
  };
  
  // Afficher un indicateur de chargement
  if (loading) {
    return (
      <View style={styles.centerContainer}>
        <ActivityIndicator size="large" color={colors.primary} />
        <Text style={styles.loadingText}>Chargement de votre compte...</Text>
      </View>
    );
  }

  return (
    <ScrollView 
      style={styles.container}
      contentContainerStyle={styles.contentContainer}
      showsVerticalScrollIndicator={false}
    >
      {/* En-tête avec informations utilisateur */}
      <View style={styles.header}>
        <View style={styles.avatarContainer}>
          <Text style={styles.avatarText}>
            {user?.name ? user.name.charAt(0).toUpperCase() : 'U'}
          </Text>
        </View>
        
        <Text style={styles.userName}>{user?.name || 'Utilisateur'}</Text>
        <Text style={styles.userEmail}>{user?.email || 'Aucun email'}</Text>
      </View>
      
      {/* Statistiques */}
      <View style={styles.statsContainer}>
        <Text style={styles.sectionTitle}>Statistiques</Text>
        
        <View style={styles.statsGrid}>
          <StatCard 
            icon="layers" 
            value={stats.totalCards} 
            label="Cartes uniques" 
            color={colors.primary}
          />
          <StatCard 
            icon="grid" 
            value={stats.totalQuantity} 
            label="Total" 
            color={colors.primary}
          />
          <StatCard 
            icon="document" 
            value={stats.normalCards} 
            label="Normales" 
            color={colors.primary}
          />
          <StatCard 
            icon="sparkles" 
            value={stats.foilCards} 
            label="Brillantes" 
            color={colors.primary}
          />
        </View>
      </View>
      
      {/* Raccourcis */}
      <View style={styles.shortcutsContainer}>
        <Text style={styles.sectionTitle}>Raccourcis</Text>
        
        <View style={styles.shortcuts}>
          <ShortcutButton 
            icon="heart" 
            label="Wishlist" 
            count={stats.wishlistCount}
            color={colors.wishlist}
            onPress={() => router.push('/wishlist')}
          />
          <ShortcutButton 
            icon="folder" 
            label="Collection" 
            count={stats.totalCards}
            color={colors.collection}
            onPress={() => router.push('/collection')}
          />
          <ShortcutButton 
            icon="home" 
            label="Chapitres" 
            color={colors.primary}
            onPress={() => router.push('/')}
          />
        </View>
      </View>
      
      {/* Bouton de déconnexion */}
      <TouchableOpacity 
        style={styles.logoutButton}
        onPress={handleLogout}
        disabled={loggingOut}
      >
        {loggingOut ? (
          <ActivityIndicator size="small" color={colors.textLight} />
        ) : (
          <>
            <Ionicons name="log-out-outline" size={20} color={colors.textLight} />
            <Text style={styles.logoutText}>Déconnexion</Text>
          </>
        )}
      </TouchableOpacity>
      
      {/* Version de l'application */}
      <Text style={styles.versionText}>Version 1.0.0</Text>
    </ScrollView>
  );
}

/**
 * Composant StatCard - Affiche une statistique
 */
function StatCard({ icon, value, label, color }) {
  return (
    <View style={styles.statCard}>
      <View style={[styles.iconContainer, { backgroundColor: color + '20' }]}>
        <Ionicons name={icon} size={24} color={color} />
      </View>
      <Text style={styles.statValue}>{value}</Text>
      <Text style={styles.statLabel}>{label}</Text>
    </View>
  );
}

/**
 * Composant ShortcutButton - Bouton de raccourci
 */
function ShortcutButton({ icon, label, count, color, onPress }) {
  return (
    <TouchableOpacity 
      style={styles.shortcutButton}
      onPress={onPress}
      activeOpacity={0.8}
    >
      <View style={[styles.shortcutIcon, { backgroundColor: color + '20' }]}>
        <Ionicons name={icon} size={24} color={color} />
      </View>
      <Text style={styles.shortcutLabel}>{label}</Text>
      {count !== undefined && (
        <View style={[styles.countBadge, { backgroundColor: color }]}>
          <Text style={styles.countText}>{count}</Text>
        </View>
      )}
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  contentContainer: {
    padding: spacing.lg,
    paddingBottom: spacing.xxxl,
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
  header: {
    alignItems: 'center',
    marginBottom: spacing.xl,
  },
  avatarContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: spacing.md,
    ...elevation.md,
  },
  avatarText: {
    ...typography.h1,
    color: colors.textLight,
  },
  userName: {
    ...typography.h2,
    color: colors.textPrimary,
    marginBottom: spacing.xs,
  },
  userEmail: {
    ...typography.body1,
    color: colors.textSecondary,
  },
  sectionTitle: {
    ...typography.h3,
    color: colors.textPrimary,
    marginBottom: spacing.md,
  },
  statsContainer: {
    marginBottom: spacing.xl,
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  statCard: {
    width: '48%',
    backgroundColor: colors.card,
    borderRadius: borderRadius.md,
    padding: spacing.md,
    marginBottom: spacing.md,
    alignItems: 'center',
    ...elevation.sm,
  },
  iconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: spacing.sm,
  },
  statValue: {
    ...typography.h2,
    color: colors.textPrimary,
  },
  statLabel: {
    ...typography.caption,
    color: colors.textSecondary,
  },
  shortcutsContainer: {
    marginBottom: spacing.xl,
  },
  shortcuts: {
    backgroundColor: colors.card,
    borderRadius: borderRadius.md,
    ...elevation.sm,
  },
  shortcutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  shortcutIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: spacing.md,
  },
  shortcutLabel: {
    ...typography.body1,
    color: colors.textPrimary,
    flex: 1,
  },
  countBadge: {
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    borderRadius: borderRadius.round,
    minWidth: 24,
    alignItems: 'center',
  },
  countText: {
    ...typography.caption,
    color: colors.textLight,
    fontWeight: 'bold',
  },
  logoutButton: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: colors.error,
    borderRadius: borderRadius.md,
    padding: spacing.md,
    marginBottom: spacing.xl,
    ...elevation.sm,
  },
  logoutText: {
    ...typography.button,
    color: colors.textLight,
    marginLeft: spacing.sm,
  },
  versionText: {
    ...typography.caption,
    color: colors.textTertiary,
    textAlign: 'center',
  },
});
