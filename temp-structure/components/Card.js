import React, { useState } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  TouchableOpacity, 
  Dimensions,
  ActivityIndicator
} from 'react-native';
import { Image } from 'expo-image';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '../theme/colors';
import { typography } from '../theme/typography';
import { spacing, borderRadius, elevation } from '../theme/spacing';

const { width } = Dimensions.get('window');
const cardWidth = (width / 2) - spacing.lg;

/**
 * Composant Card - Affiche une carte Lorcana en format grille
 * 
 * @param {Object} card - Données de la carte
 * @param {Function} onWishlistToggle - Fonction appelée lors du toggle wishlist
 * @param {Function} onCollectionUpdate - Fonction appelée lors de la mise à jour de la collection
 * @param {Boolean} showControls - Afficher les contrôles (wishlist, collection)
 */
export default function Card({ 
  card, 
  onWishlistToggle, 
  onCollectionUpdate,
  showControls = true
}) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  
  // Extraire les propriétés de la carte
  const { 
    id, 
    name, 
    image, 
    thumbnail, 
    rarity, 
    inWishlist = false,
    normalCount = 0,
    shinyCount = 0
  } = card;
  
  // URL de l'image (utiliser thumbnail si disponible, sinon image)
  const imageUrl = thumbnail || image;
  
  // Déterminer si la carte est dans la collection
  const isInCollection = normalCount > 0 || shinyCount > 0;
  
  // Couleur de rareté
  const rarityColor = getRarityColor(rarity);
  
  // Gérer le clic sur la carte
  const handleCardPress = () => {
    router.push(`/card/${id}`);
  };
  
  // Gérer le toggle wishlist
  const handleWishlistToggle = async () => {
    if (loading) return;
    
    setLoading(true);
    try {
      await onWishlistToggle(card);
    } catch (error) {
      console.error('Erreur lors du toggle wishlist:', error);
    } finally {
      setLoading(false);
    }
  };
  
  // Gérer le clic sur le bouton collection
  const handleCollectionPress = () => {
    router.push({
      pathname: `/card/${id}`,
      params: { showCollection: true }
    });
  };

  return (
    <TouchableOpacity 
      style={styles.container} 
      onPress={handleCardPress}
      activeOpacity={0.8}
    >
      {/* Image de la carte */}
      <View style={styles.imageContainer}>
        <Image
          source={{ uri: imageUrl }}
          style={styles.image}
          contentFit="cover"
          transition={200}
          placeholder={{ uri: 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNk+A8AAQUBAScY42YAAAAASUVORK5CYII=' }}
        />
        
        {/* Indicateur de rareté */}
        <View style={[styles.rarityIndicator, { backgroundColor: rarityColor }]} />
        
        {/* Contrôles (wishlist, collection) */}
        {showControls && (
          <View style={styles.controls}>
            {/* Bouton Wishlist */}
            <TouchableOpacity 
              style={[styles.controlButton, inWishlist && styles.activeWishlist]} 
              onPress={handleWishlistToggle}
              disabled={loading}
            >
              {loading ? (
                <ActivityIndicator size="small" color={colors.textLight} />
              ) : (
                <Ionicons 
                  name={inWishlist ? 'heart' : 'heart-outline'} 
                  size={18} 
                  color={inWishlist ? colors.textLight : colors.wishlist} 
                />
              )}
            </TouchableOpacity>
            
            {/* Bouton Collection */}
            <TouchableOpacity 
              style={[styles.controlButton, isInCollection && styles.activeCollection]} 
              onPress={handleCollectionPress}
            >
              <Ionicons 
                name={isInCollection ? 'folder' : 'folder-outline'} 
                size={18} 
                color={isInCollection ? colors.textLight : colors.collection} 
              />
            </TouchableOpacity>
          </View>
        )}
      </View>
      
      {/* Informations de la carte */}
      <View style={styles.infoContainer}>
        <Text style={styles.cardName} numberOfLines={2}>{name}</Text>
        
        {/* Compteurs (normal/brillant) si dans la collection */}
        {isInCollection && (
          <View style={styles.counters}>
            {normalCount > 0 && (
              <View style={styles.counter}>
                <Text style={styles.counterText}>{normalCount}</Text>
                <Text style={styles.counterLabel}>Normal</Text>
              </View>
            )}
            {shinyCount > 0 && (
              <View style={styles.counter}>
                <Text style={styles.counterText}>{shinyCount}</Text>
                <Text style={styles.counterLabel}>Brillant</Text>
              </View>
            )}
          </View>
        )}
      </View>
    </TouchableOpacity>
  );
}

// Fonction pour déterminer la couleur en fonction de la rareté
function getRarityColor(rarity) {
  switch (rarity?.toLowerCase()) {
    case 'common':
      return colors.common;
    case 'uncommon':
      return colors.uncommon;
    case 'rare':
      return colors.rare;
    case 'super rare':
      return colors.superRare;
    case 'legendary':
      return colors.legendary;
    default:
      return colors.common;
  }
}

const styles = StyleSheet.create({
  container: {
    width: cardWidth,
    margin: spacing.sm,
    backgroundColor: colors.card,
    borderRadius: borderRadius.md,
    overflow: 'hidden',
    ...elevation.sm,
  },
  imageContainer: {
    position: 'relative',
    width: '100%',
    height: cardWidth * 1.4, // Ratio d'aspect pour les cartes
    borderTopLeftRadius: borderRadius.md,
    borderTopRightRadius: borderRadius.md,
    overflow: 'hidden',
  },
  image: {
    width: '100%',
    height: '100%',
  },
  rarityIndicator: {
    position: 'absolute',
    top: spacing.sm,
    left: spacing.sm,
    width: spacing.lg,
    height: spacing.lg,
    borderRadius: borderRadius.round,
    ...elevation.xs,
  },
  controls: {
    position: 'absolute',
    bottom: spacing.sm,
    right: spacing.sm,
    flexDirection: 'row',
  },
  controlButton: {
    width: 36,
    height: 36,
    borderRadius: borderRadius.round,
    backgroundColor: 'rgba(255, 255, 255, 0.8)',
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: spacing.xs,
    ...elevation.xs,
  },
  activeWishlist: {
    backgroundColor: colors.wishlist,
  },
  activeCollection: {
    backgroundColor: colors.collection,
  },
  infoContainer: {
    padding: spacing.md,
  },
  cardName: {
    ...typography.subtitle1,
    color: colors.textPrimary,
    marginBottom: spacing.xs,
  },
  counters: {
    flexDirection: 'row',
    marginTop: spacing.xs,
  },
  counter: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: spacing.md,
  },
  counterText: {
    ...typography.subtitle2,
    color: colors.textPrimary,
    marginRight: spacing.xs,
  },
  counterLabel: {
    ...typography.caption,
    color: colors.textSecondary,
  },
});
