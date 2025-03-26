import React, { useState, useEffect } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  ScrollView, 
  TouchableOpacity,
  ActivityIndicator,
  Dimensions
} from 'react-native';
import { Image } from 'expo-image';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../../../contexts/AuthContext';
import api from '../../../services/api';
import { colors } from '../../../theme/colors';
import { typography } from '../../../theme/typography';
import { spacing, borderRadius, elevation } from '../../../theme/spacing';

const { width } = Dimensions.get('window');
const cardWidth = width - (spacing.xl * 2);

/**
 * Écran de détail d'une carte
 */
export default function CardScreen() {
  const { id, showCollection } = useLocalSearchParams();
  const router = useRouter();
  const { token } = useAuth();
  
  const [card, setCard] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [inWishlist, setInWishlist] = useState(false);
  const [normalCount, setNormalCount] = useState(0);
  const [shinyCount, setShinyCount] = useState(0);
  const [updating, setUpdating] = useState(false);
  const [showCollectionSection, setShowCollectionSection] = useState(false);
  
  // Charger les détails de la carte
  useEffect(() => {
    if (token && id) {
      loadCardDetails();
    }
  }, [token, id]);
  
  // Afficher la section collection si demandé via les paramètres
  useEffect(() => {
    if (showCollection === 'true') {
      setShowCollectionSection(true);
    }
  }, [showCollection]);
  
  /**
   * Charge les détails de la carte depuis l'API
   */
  const loadCardDetails = async () => {
    try {
      setLoading(true);
      setError(null);
      
      // Récupérer les cartes de la wishlist pour vérifier si celle-ci y est
      const wishlistResponse = await api.getWishlist(token);
      const wishlistIds = wishlistResponse.data.map(card => card.id);
      const isInWishlist = wishlistIds.includes(parseInt(id));
      setInWishlist(isInWishlist);
      
      // Récupérer les cartes de l'utilisateur pour les quantités
      const userCardsResponse = await api.getUserCards(token);
      const userCard = userCardsResponse.data.find(card => card.id === parseInt(id));
      
      if (userCard) {
        setNormalCount(userCard.normal || 0);
        setShinyCount(userCard.foil || 0);
      }
      
      // Récupérer les détails de la carte
      // Note: Dans une API réelle, il y aurait un endpoint spécifique pour obtenir les détails d'une carte
      // Ici, nous simulons en récupérant toutes les cartes et en filtrant
      const setsResponse = await api.getSets(token);
      
      let foundCard = null;
      
      // Parcourir tous les chapitres pour trouver la carte
      for (const set of setsResponse.data) {
        const setCardsResponse = await api.getSetCards(token, set.id);
        const cardInSet = setCardsResponse.data.find(c => c.id === parseInt(id));
        
        if (cardInSet) {
          foundCard = {
            ...cardInSet,
            set: set.name
          };
          break;
        }
      }
      
      if (foundCard) {
        setCard(foundCard);
      } else {
        throw new Error('Carte non trouvée');
      }
    } catch (err) {
      console.error('Erreur lors du chargement des détails de la carte:', err);
      setError(err.message || 'Impossible de charger les détails de la carte.');
    } finally {
      setLoading(false);
    }
  };
  
  /**
   * Gère l'ajout/retrait de la carte de la wishlist
   */
  const handleWishlistToggle = async () => {
    try {
      setUpdating(true);
      
      if (inWishlist) {
        await api.removeFromWishlist(token, id);
      } else {
        await api.addToWishlist(token, id);
      }
      
      setInWishlist(!inWishlist);
    } catch (error) {
      console.error('Erreur lors de la mise à jour de la wishlist:', error);
    } finally {
      setUpdating(false);
    }
  };
  
  /**
   * Met à jour les quantités de cartes dans la collection
   */
  const updateCollection = async () => {
    try {
      setUpdating(true);
      
      await api.updateOwnedCards(token, id, normalCount, shinyCount);
      
      // Fermer la section collection après mise à jour
      setShowCollectionSection(false);
    } catch (error) {
      console.error('Erreur lors de la mise à jour de la collection:', error);
    } finally {
      setUpdating(false);
    }
  };
  
  /**
   * Gère l'incrémentation/décrémentation des compteurs
   */
  const handleCountChange = (type, increment) => {
    if (type === 'normal') {
      const newCount = increment ? normalCount + 1 : Math.max(0, normalCount - 1);
      setNormalCount(newCount);
    } else {
      const newCount = increment ? shinyCount + 1 : Math.max(0, shinyCount - 1);
      setShinyCount(newCount);
    }
  };
  
  // Afficher un indicateur de chargement
  if (loading) {
    return (
      <View style={styles.centerContainer}>
        <ActivityIndicator size="large" color={colors.primary} />
        <Text style={styles.loadingText}>Chargement des détails de la carte...</Text>
      </View>
    );
  }
  
  // Afficher un message d'erreur
  if (error || !card) {
    return (
      <View style={styles.centerContainer}>
        <Text style={styles.errorText}>{error || 'Carte non trouvée'}</Text>
        <TouchableOpacity 
          style={styles.button} 
          onPress={() => router.back()}
        >
          <Text style={styles.buttonText}>Retour</Text>
        </TouchableOpacity>
      </View>
    );
  }
  
  // Déterminer la couleur de rareté
  const rarityColor = getRarityColor(card.rarity);

  return (
    <View style={styles.container}>
      {/* En-tête avec bouton retour */}
      <View style={styles.header}>
        <TouchableOpacity 
          style={styles.backButton} 
          onPress={() => router.back()}
        >
          <Ionicons name="arrow-back" size={24} color={colors.textPrimary} />
        </TouchableOpacity>
        
        <View style={styles.headerContent}>
          <Text style={styles.title} numberOfLines={1}>
            {card.name}
          </Text>
          <Text style={styles.subtitle}>
            {card.set || 'Chapitre inconnu'}
          </Text>
        </View>
      </View>
      
      <ScrollView 
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Image de la carte */}
        <View style={styles.imageContainer}>
          <Image
            source={{ uri: card.image }}
            style={styles.cardImage}
            contentFit="contain"
            transition={300}
          />
          
          {/* Indicateur de rareté */}
          <View style={[styles.rarityBadge, { backgroundColor: rarityColor }]}>
            <Text style={styles.rarityText}>{card.rarity || 'Common'}</Text>
          </View>
        </View>
        
        {/* Informations de la carte */}
        <View style={styles.infoSection}>
          <InfoItem label="Numéro" value={card.number || '-'} />
          <InfoItem label="Type" value={card.type || '-'} />
          <InfoItem label="Coût" value={card.cost || '-'} />
          <InfoItem label="Encre" value={card.ink || '-'} />
          <InfoItem label="Attaque" value={card.attack || '-'} />
          <InfoItem label="Défense" value={card.defense || '-'} />
          <InfoItem label="Rareté" value={card.rarity || '-'} />
        </View>
        
        {/* Description de la carte */}
        {card.description && (
          <View style={styles.descriptionSection}>
            <Text style={styles.sectionTitle}>Description</Text>
            <Text style={styles.descriptionText}>{card.description}</Text>
          </View>
        )}
        
        {/* Actions (wishlist, collection) */}
        <View style={styles.actionsSection}>
          {/* Bouton Wishlist */}
          <TouchableOpacity 
            style={[styles.actionButton, inWishlist && styles.activeWishlist]} 
            onPress={handleWishlistToggle}
            disabled={updating}
          >
            {updating ? (
              <ActivityIndicator size="small" color={inWishlist ? colors.textLight : colors.wishlist} />
            ) : (
              <>
                <Ionicons 
                  name={inWishlist ? 'heart' : 'heart-outline'} 
                  size={24} 
                  color={inWishlist ? colors.textLight : colors.wishlist} 
                />
                <Text 
                  style={[
                    styles.actionText, 
                    { color: inWishlist ? colors.textLight : colors.wishlist }
                  ]}
                >
                  {inWishlist ? 'Dans la wishlist' : 'Ajouter à la wishlist'}
                </Text>
              </>
            )}
          </TouchableOpacity>
          
          {/* Bouton Collection */}
          <TouchableOpacity 
            style={[
              styles.actionButton, 
              (normalCount > 0 || shinyCount > 0) && styles.activeCollection
            ]} 
            onPress={() => setShowCollectionSection(!showCollectionSection)}
          >
            <Ionicons 
              name={(normalCount > 0 || shinyCount > 0) ? 'folder' : 'folder-outline'} 
              size={24} 
              color={(normalCount > 0 || shinyCount > 0) ? colors.textLight : colors.collection} 
            />
            <Text 
              style={[
                styles.actionText, 
                { 
                  color: (normalCount > 0 || shinyCount > 0) 
                    ? colors.textLight 
                    : colors.collection 
                }
              ]}
            >
              {(normalCount > 0 || shinyCount > 0) 
                ? `Dans ma collection (${normalCount + shinyCount})` 
                : 'Ajouter à ma collection'}
            </Text>
          </TouchableOpacity>
        </View>
        
        {/* Section de gestion de la collection */}
        {showCollectionSection && (
          <View style={styles.collectionSection}>
            <Text style={styles.sectionTitle}>Gérer ma collection</Text>
            
            {/* Compteur pour les cartes normales */}
            <View style={styles.counterContainer}>
              <Text style={styles.counterLabel}>Cartes normales :</Text>
              <View style={styles.counterControls}>
                <TouchableOpacity 
                  style={styles.counterButton}
                  onPress={() => handleCountChange('normal', false)}
                  disabled={normalCount === 0}
                >
                  <Ionicons 
                    name="remove" 
                    size={20} 
                    color={normalCount === 0 ? colors.textTertiary : colors.textPrimary} 
                  />
                </TouchableOpacity>
                <Text style={styles.counterValue}>{normalCount}</Text>
                <TouchableOpacity 
                  style={styles.counterButton}
                  onPress={() => handleCountChange('normal', true)}
                >
                  <Ionicons name="add" size={20} color={colors.textPrimary} />
                </TouchableOpacity>
              </View>
            </View>
            
            {/* Compteur pour les cartes brillantes */}
            <View style={styles.counterContainer}>
              <Text style={styles.counterLabel}>Cartes brillantes :</Text>
              <View style={styles.counterControls}>
                <TouchableOpacity 
                  style={styles.counterButton}
                  onPress={() => handleCountChange('shiny', false)}
                  disabled={shinyCount === 0}
                >
                  <Ionicons 
                    name="remove" 
                    size={20} 
                    color={shinyCount === 0 ? colors.textTertiary : colors.textPrimary} 
                  />
                </TouchableOpacity>
                <Text style={styles.counterValue}>{shinyCount}</Text>
                <TouchableOpacity 
                  style={styles.counterButton}
                  onPress={() => handleCountChange('shiny', true)}
                >
                  <Ionicons name="add" size={20} color={colors.textPrimary} />
                </TouchableOpacity>
              </View>
            </View>
            
            {/* Bouton de mise à jour */}
            <TouchableOpacity 
              style={styles.updateButton}
              onPress={updateCollection}
              disabled={updating}
            >
              {updating ? (
                <ActivityIndicator size="small" color={colors.textLight} />
              ) : (
                <Text style={styles.updateButtonText}>Mettre à jour ma collection</Text>
              )}
            </TouchableOpacity>
          </View>
        )}
      </ScrollView>
    </View>
  );
}

/**
 * Composant pour afficher une information de carte
 */
function InfoItem({ label, value }) {
  return (
    <View style={styles.infoItem}>
      <Text style={styles.infoLabel}>{label}</Text>
      <Text style={styles.infoValue}>{value}</Text>
    </View>
  );
}

/**
 * Détermine la couleur en fonction de la rareté
 */
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
    marginBottom: spacing.lg,
  },
  button: {
    backgroundColor: colors.primary,
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.xl,
    borderRadius: borderRadius.md,
  },
  buttonText: {
    ...typography.button,
    color: colors.textLight,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.md,
    paddingTop: spacing.lg,
    paddingBottom: spacing.md,
    backgroundColor: colors.background,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: borderRadius.round,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: spacing.sm,
  },
  headerContent: {
    flex: 1,
  },
  title: {
    ...typography.h2,
    color: colors.textPrimary,
  },
  subtitle: {
    ...typography.body2,
    color: colors.textSecondary,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: spacing.lg,
    paddingBottom: spacing.xxxl,
  },
  imageContainer: {
    position: 'relative',
    alignItems: 'center',
    marginBottom: spacing.xl,
  },
  cardImage: {
    width: cardWidth,
    height: cardWidth * 1.4,
    borderRadius: borderRadius.md,
    ...elevation.md,
  },
  rarityBadge: {
    position: 'absolute',
    top: spacing.md,
    right: spacing.md,
    paddingVertical: spacing.xs,
    paddingHorizontal: spacing.md,
    borderRadius: borderRadius.sm,
    ...elevation.xs,
  },
  rarityText: {
    ...typography.caption,
    color: colors.textLight,
    fontWeight: 'bold',
  },
  infoSection: {
    backgroundColor: colors.card,
    borderRadius: borderRadius.md,
    padding: spacing.lg,
    marginBottom: spacing.lg,
    ...elevation.sm,
  },
  infoItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: spacing.sm,
  },
  infoLabel: {
    ...typography.body2,
    color: colors.textSecondary,
  },
  infoValue: {
    ...typography.body2,
    color: colors.textPrimary,
    fontWeight: 'bold',
  },
  descriptionSection: {
    backgroundColor: colors.card,
    borderRadius: borderRadius.md,
    padding: spacing.lg,
    marginBottom: spacing.lg,
    ...elevation.sm,
  },
  sectionTitle: {
    ...typography.h4,
    color: colors.textPrimary,
    marginBottom: spacing.md,
  },
  descriptionText: {
    ...typography.body1,
    color: colors.textPrimary,
  },
  actionsSection: {
    marginBottom: spacing.lg,
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.card,
    borderRadius: borderRadius.md,
    padding: spacing.md,
    marginBottom: spacing.md,
    ...elevation.sm,
  },
  activeWishlist: {
    backgroundColor: colors.wishlist,
  },
  activeCollection: {
    backgroundColor: colors.collection,
  },
  actionText: {
    ...typography.button,
    marginLeft: spacing.md,
  },
  collectionSection: {
    backgroundColor: colors.card,
    borderRadius: borderRadius.md,
    padding: spacing.lg,
    ...elevation.sm,
  },
  counterContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.lg,
  },
  counterLabel: {
    ...typography.body1,
    color: colors.textPrimary,
  },
  counterControls: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  counterButton: {
    width: 36,
    height: 36,
    borderRadius: borderRadius.round,
    backgroundColor: colors.cardAlt,
    justifyContent: 'center',
    alignItems: 'center',
  },
  counterValue: {
    ...typography.h4,
    color: colors.textPrimary,
    marginHorizontal: spacing.md,
    minWidth: 30,
    textAlign: 'center',
  },
  updateButton: {
    backgroundColor: colors.primary,
    borderRadius: borderRadius.md,
    padding: spacing.md,
    alignItems: 'center',
    marginTop: spacing.md,
  },
  updateButtonText: {
    ...typography.button,
    color: colors.textLight,
  },
});
