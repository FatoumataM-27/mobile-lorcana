import React from 'react';
import { 
  View, 
  FlatList, 
  StyleSheet, 
  Text, 
  ActivityIndicator,
  RefreshControl
} from 'react-native';
import Card from './Card';
import SearchBar from './SearchBar';
import { colors } from '../theme/colors';
import { typography } from '../theme/typography';
import { spacing } from '../theme/spacing';

/**
 * Composant CardList - Liste de cartes avec recherche et filtres
 * 
 * @param {Array} data - Liste des cartes à afficher
 * @param {Boolean} loading - Indique si les données sont en cours de chargement
 * @param {String} error - Message d'erreur à afficher (le cas échéant)
 * @param {String} searchQuery - Valeur actuelle de la recherche
 * @param {Function} onSearchChange - Fonction appelée lors du changement de recherche
 * @param {String} activeFilter - Filtre actif
 * @param {Function} onFilterChange - Fonction appelée lors du changement de filtre
 * @param {Function} onWishlistToggle - Fonction appelée lors du toggle wishlist
 * @param {Function} onCollectionUpdate - Fonction appelée lors de la mise à jour de la collection
 * @param {Function} onRefresh - Fonction appelée lors du rafraîchissement
 * @param {Boolean} refreshing - Indique si le rafraîchissement est en cours
 * @param {Array} filters - Liste des filtres disponibles
 */
export default function CardList({
  data = [],
  loading = false,
  error = null,
  searchQuery = '',
  onSearchChange,
  activeFilter = 'all',
  onFilterChange,
  onWishlistToggle,
  onCollectionUpdate,
  onRefresh,
  refreshing = false,
  filters = [
    { id: 'all', label: 'Toutes' },
    { id: 'wishlist', label: 'Wishlist' },
    { id: 'owned', label: 'Collection' }
  ]
}) {
  // Rendu d'une carte
  const renderCard = ({ item }) => (
    <Card
      card={item}
      onWishlistToggle={onWishlistToggle}
      onCollectionUpdate={onCollectionUpdate}
    />
  );

  // Rendu du contenu principal
  const renderContent = () => {
    if (loading && !refreshing && data.length === 0) {
      return (
        <View style={styles.centerContainer}>
          <ActivityIndicator size="large" color={colors.primary} />
          <Text style={styles.loadingText}>Chargement des cartes...</Text>
        </View>
      );
    }

    if (error) {
      return (
        <View style={styles.centerContainer}>
          <Text style={styles.errorText}>{error}</Text>
        </View>
      );
    }

    if (data.length === 0) {
      return (
        <View style={styles.centerContainer}>
          <Text style={styles.emptyText}>
            {activeFilter === 'all' 
              ? 'Aucune carte trouvée.' 
              : activeFilter === 'wishlist' 
                ? 'Aucune carte dans votre wishlist.' 
                : 'Aucune carte dans votre collection.'}
          </Text>
        </View>
      );
    }

    return (
      <FlatList
        data={data}
        renderItem={renderCard}
        keyExtractor={(item) => item.id.toString()}
        numColumns={2}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
        refreshControl={
          onRefresh ? (
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              colors={[colors.primary]}
              tintColor={colors.primary}
            />
          ) : undefined
        }
      />
    );
  };

  return (
    <View style={styles.container}>
      {/* Barre de recherche */}
      {onSearchChange && (
        <SearchBar
          value={searchQuery}
          onChangeText={onSearchChange}
          placeholder="Rechercher une carte..."
          style={styles.searchBar}
        />
      )}

      {/* Filtres */}
      {onFilterChange && filters.length > 0 && (
        <View style={styles.filtersContainer}>
          {filters.map((filter) => (
            <FilterButton
              key={filter.id}
              label={filter.label}
              active={activeFilter === filter.id}
              onPress={() => onFilterChange(filter.id)}
            />
          ))}
        </View>
      )}

      {/* Contenu principal */}
      {renderContent()}
    </View>
  );
}

/**
 * Composant FilterButton - Bouton de filtre
 */
function FilterButton({ label, active, onPress }) {
  return (
    <Text
      style={[
        styles.filterButton,
        active && styles.activeFilterButton,
        { color: active ? colors.primary : colors.textSecondary }
      ]}
      onPress={onPress}
    >
      {label}
    </Text>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  searchBar: {
    margin: spacing.md,
  },
  filtersContainer: {
    flexDirection: 'row',
    paddingHorizontal: spacing.md,
    marginBottom: spacing.md,
  },
  filterButton: {
    ...typography.button,
    marginRight: spacing.lg,
    paddingVertical: spacing.xs,
    fontSize: 14,
  },
  activeFilterButton: {
    borderBottomWidth: 2,
    borderBottomColor: colors.primary,
  },
  listContent: {
    paddingHorizontal: spacing.sm,
    paddingBottom: spacing.xl,
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
  emptyText: {
    ...typography.body1,
    color: colors.textSecondary,
    textAlign: 'center',
  },
});
