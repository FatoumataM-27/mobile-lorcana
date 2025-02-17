import React, { useState } from 'react';
import { View, Text, Image, StyleSheet, Dimensions, TouchableOpacity, Modal, ScrollView } from 'react-native';
import { useAuth } from '../contexts/AuthContext';
import api from '../services/api';

const windowWidth = Dimensions.get('window').width;
const windowHeight = Dimensions.get('window').height;
const cardWidth = windowWidth - 30;
const imageHeight = windowHeight * 0.5; // 50% de la hauteur de l'écran

export default function Card({ card, onWishlistUpdate, onCollectionUpdate }) {
  const [isInWishlist, setIsInWishlist] = useState(false);
  const [loading, setLoading] = useState(false);
  const [showCollectionModal, setShowCollectionModal] = useState(false);
  const [showImageModal, setShowImageModal] = useState(false);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [normalCount, setNormalCount] = useState(card.normalCount || 0);
  const [shinyCount, setShinyCount] = useState(card.shinyCount || 0);
  const { token } = useAuth();
  const imageUrl = card.image_url || card.imageUrl || card.image || card.artwork_url;

  const toggleWishlist = async () => {
    if (loading) return;
    
    try {
      setLoading(true);
      if (isInWishlist) {
        await api.removeFromWishlist(token, card.id);
      } else {
        await api.addToWishlist(token, card.id);
      }
      setIsInWishlist(!isInWishlist);
      if (onWishlistUpdate) {
        onWishlistUpdate();
      }
    } catch (error) {
      console.error('Erreur wishlist:', error);
    } finally {
      setLoading(false);
    }
  };

  const updateCollection = async (isShiny, increment) => {
    try {
      setLoading(true);
      const currentCount = isShiny ? shinyCount : normalCount;
      const newCount = Math.max(0, currentCount + (increment ? 1 : -1));
      
      if (newCount === 0) {
        await api.removeFromCollection(token, card.id);
      } else {
        await api.updateCollectionCard(token, card.id, newCount, isShiny);
      }

      if (isShiny) {
        setShinyCount(newCount);
      } else {
        setNormalCount(newCount);
      }

      if (onCollectionUpdate) {
        onCollectionUpdate();
      }
    } catch (error) {
      console.error('Erreur collection:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.card}>
      <View style={styles.buttonContainer}>
        <TouchableOpacity 
          style={[
            styles.wishlistButton,
            isInWishlist && styles.wishlistButtonActive
          ]}
          onPress={toggleWishlist}
          disabled={loading}
        >
          <Text style={[
            styles.wishlistButtonText,
            isInWishlist && styles.wishlistButtonTextActive
          ]}>
            {loading ? '...' : (isInWishlist ? '★' : '☆')}
          </Text>
        </TouchableOpacity>

        <TouchableOpacity 
          style={styles.collectionButton}
          onPress={() => setShowCollectionModal(true)}
        >
          <Text style={styles.collectionButtonText}>
            {normalCount + shinyCount > 0 ? `${normalCount + shinyCount}×` : '+'}
          </Text>
        </TouchableOpacity>
      </View>

      {imageUrl ? (
        <TouchableOpacity 
          onPress={() => setShowImageModal(true)}
          style={[styles.imageContainer, { height: imageHeight }]}
        >
          <Image
            source={{ uri: imageUrl }}
            style={styles.cardImage}
            resizeMode="contain"
          />
        </TouchableOpacity>
      ) : (
        <View style={[styles.noImageContainer, { height: imageHeight * 0.6 }]}>
          <Text style={styles.noImageText}>Image non disponible</Text>
        </View>
      )}
      
      <TouchableOpacity 
        style={styles.cardInfo}
        onPress={() => setShowDetailsModal(true)}
      >
        <Text style={styles.name} numberOfLines={1}>
          {card.name}
        </Text>

        <View style={styles.mainInfo}>
          <View style={styles.costContainer}>
            <Text style={styles.costLabel}>COÛT</Text>
            <Text style={styles.costValue}>{card.cost || 'N/A'}</Text>
          </View>
          {card.power && (
            <View style={styles.powerContainer}>
              <Text style={styles.powerLabel}>FORCE</Text>
              <Text style={styles.powerValue}>{card.power}</Text>
            </View>
          )}
          {card.ink && (
            <View style={styles.inkContainer}>
              <Text style={styles.inkLabel}>ENCRE</Text>
              <Text style={styles.inkValue}>{card.ink}</Text>
            </View>
          )}
        </View>

        <View style={styles.badges}>
          <Text style={[
            styles.type,
            card.type ? styles.typeBackground : styles.unknownBackground
          ]}>
            {card.type || 'Type inconnu'}
          </Text>
          <Text style={[
            styles.rarity,
            getRarityStyle(card.rarity)
          ]}>
            {card.rarity || 'Rareté inconnue'}
          </Text>
        </View>

        {card.effect && (
          <View style={styles.effectContainer}>
            <Text style={styles.effectLabel}>EFFET</Text>
            <Text style={styles.effect} numberOfLines={2}>
              {card.effect}
            </Text>
          </View>
        )}
      </TouchableOpacity>

      {/* Modal pour la collection */}
      <Modal
        visible={showCollectionModal}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setShowCollectionModal(false)}
      >
        <TouchableOpacity 
          style={styles.modalOverlay}
          activeOpacity={1}
          onPress={() => setShowCollectionModal(false)}
        >
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Collection</Text>
            
            <View style={styles.collectionType}>
              <Text style={styles.collectionLabel}>Normal</Text>
              <View style={styles.countControls}>
                <TouchableOpacity 
                  style={styles.countButton}
                  onPress={() => updateCollection(false, false)}
                  disabled={normalCount === 0}
                >
                  <Text style={styles.countButtonText}>-</Text>
                </TouchableOpacity>
                <Text style={styles.countText}>{normalCount}</Text>
                <TouchableOpacity 
                  style={styles.countButton}
                  onPress={() => updateCollection(false, true)}
                >
                  <Text style={styles.countButtonText}>+</Text>
                </TouchableOpacity>
              </View>
            </View>

            <View style={styles.collectionType}>
              <Text style={styles.collectionLabel}>Brillant</Text>
              <View style={styles.countControls}>
                <TouchableOpacity 
                  style={styles.countButton}
                  onPress={() => updateCollection(true, false)}
                  disabled={shinyCount === 0}
                >
                  <Text style={styles.countButtonText}>-</Text>
                </TouchableOpacity>
                <Text style={styles.countText}>{shinyCount}</Text>
                <TouchableOpacity 
                  style={styles.countButton}
                  onPress={() => updateCollection(true, true)}
                >
                  <Text style={styles.countButtonText}>+</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </TouchableOpacity>
      </Modal>

      {/* Modal pour l'image plein écran */}
      <Modal
        visible={showImageModal}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setShowImageModal(false)}
      >
        <TouchableOpacity 
          style={styles.imageModalOverlay}
          activeOpacity={1}
          onPress={() => setShowImageModal(false)}
        >
          <Image
            source={{ uri: imageUrl }}
            style={styles.fullscreenImage}
            resizeMode="contain"
          />
        </TouchableOpacity>
      </Modal>

      {/* Modal pour les détails complets */}
      <Modal
        visible={showDetailsModal}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setShowDetailsModal(false)}
      >
        <View style={styles.detailsModalOverlay}>
          <View style={styles.detailsModalContent}>
            <ScrollView>
              <Text style={styles.detailsTitle}>{card.name}</Text>
              
              {imageUrl && (
                <Image
                  source={{ uri: imageUrl }}
                  style={styles.detailsImage}
                  resizeMode="contain"
                />
              )}

              <View style={styles.detailsStats}>
                <View style={styles.statItem}>
                  <Text style={styles.statLabel}>COÛT</Text>
                  <Text style={styles.statValue}>{card.cost || 'N/A'}</Text>
                </View>
                {card.power && (
                  <View style={styles.statItem}>
                    <Text style={styles.statLabel}>FORCE</Text>
                    <Text style={styles.statValue}>{card.power}</Text>
                  </View>
                )}
                {card.ink && (
                  <View style={styles.statItem}>
                    <Text style={styles.statLabel}>ENCRE</Text>
                    <Text style={styles.statValue}>{card.ink}</Text>
                  </View>
                )}
              </View>

              <View style={styles.detailsBadges}>
                <Text style={[
                  styles.type,
                  card.type ? styles.typeBackground : styles.unknownBackground
                ]}>
                  {card.type || 'Type inconnu'}
                </Text>
                <Text style={[
                  styles.rarity,
                  getRarityStyle(card.rarity)
                ]}>
                  {card.rarity || 'Rareté inconnue'}
                </Text>
              </View>

              {card.effect && (
                <View style={styles.detailsSection}>
                  <Text style={styles.sectionTitle}>EFFET</Text>
                  <Text style={styles.sectionText}>{card.effect}</Text>
                </View>
              )}

              {card.lore && (
                <View style={styles.detailsSection}>
                  <Text style={styles.sectionTitle}>LORE</Text>
                  <Text style={styles.sectionText}>{card.lore}</Text>
                </View>
              )}

              {card.artist && (
                <View style={styles.detailsSection}>
                  <Text style={styles.sectionTitle}>ARTISTE</Text>
                  <Text style={styles.sectionText}>{card.artist}</Text>
                </View>
              )}

              {card.set && (
                <View style={styles.detailsSection}>
                  <Text style={styles.sectionTitle}>SET</Text>
                  <Text style={styles.sectionText}>{card.set}</Text>
                </View>
              )}

              <TouchableOpacity 
                style={styles.closeButton}
                onPress={() => setShowDetailsModal(false)}
              >
                <Text style={styles.closeButtonText}>Fermer</Text>
              </TouchableOpacity>
            </ScrollView>
          </View>
        </View>
      </Modal>
    </View>
  );
}

function getRarityStyle(rarity) {
  switch (rarity?.toLowerCase()) {
    case 'commune':
      return styles.rarityCommon;
    case 'inhabituelle':
      return styles.rarityUncommon;
    case 'rare':
      return styles.rarityRare;
    case 'très rare':
      return styles.rarityVeryRare;
    case 'légendaire':
      return styles.rarityLegendary;
    default:
      return styles.rarityUnknown;
  }
}

const styles = StyleSheet.create({
  card: {
    width: cardWidth,
    backgroundColor: '#fff',
    borderRadius: 12,
    marginBottom: 15,
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    alignSelf: 'center',
  },
  buttonContainer: {
    position: 'absolute',
    right: 10,
    top: 10,
    zIndex: 1,
    flexDirection: 'row',
    gap: 8,
  },
  wishlistButton: {
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 2,
  },
  wishlistButtonActive: {
    backgroundColor: '#6B3FA0',
  },
  wishlistButtonText: {
    fontSize: 24,
    color: '#6B3FA0',
  },
  wishlistButtonTextActive: {
    color: '#fff',
  },
  collectionButton: {
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 2,
  },
  collectionButtonText: {
    fontSize: 18,
    color: '#6B3FA0',
    fontWeight: 'bold',
  },
  imageContainer: {
    width: '100%',
    backgroundColor: '#f8f8f8',
    borderTopLeftRadius: 12,
    borderTopRightRadius: 12,
    overflow: 'hidden',
  },
  noImageContainer: {
    width: '100%',
    backgroundColor: '#f0f0f0',
    borderTopLeftRadius: 12,
    borderTopRightRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  noImageText: {
    color: '#666',
    fontSize: 16,
  },
  cardImage: {
    width: '100%',
    height: '100%',
  },
  imageModalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.9)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  fullscreenImage: {
    width: windowWidth,
    height: windowHeight,
  },
  cardInfo: {
    padding: 12,
    gap: 12,
  },
  name: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#6B3FA0',
    textAlign: 'center',
  },
  mainInfo: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 20,
  },
  costContainer: {
    alignItems: 'center',
  },
  powerContainer: {
    alignItems: 'center',
  },
  inkContainer: {
    alignItems: 'center',
  },
  costLabel: {
    fontSize: 12,
    color: '#666',
    fontWeight: '600',
  },
  powerLabel: {
    fontSize: 12,
    color: '#666',
    fontWeight: '600',
  },
  inkLabel: {
    fontSize: 12,
    color: '#666',
    fontWeight: '600',
  },
  costValue: {
    fontSize: 20,
    color: '#444',
    fontWeight: 'bold',
  },
  powerValue: {
    fontSize: 20,
    color: '#e74c3c',
    fontWeight: 'bold',
  },
  inkValue: {
    fontSize: 20,
    color: '#3498db',
    fontWeight: 'bold',
  },
  badges: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 10,
    flexWrap: 'wrap',
  },
  type: {
    fontSize: 14,
    color: '#666',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
  },
  typeBackground: {
    backgroundColor: '#f0f0f0',
  },
  unknownBackground: {
    backgroundColor: '#f8f8f8',
  },
  rarity: {
    fontSize: 14,
    color: '#fff',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
  },
  rarityCommon: {
    backgroundColor: '#95a5a6',
  },
  rarityUncommon: {
    backgroundColor: '#2ecc71',
  },
  rarityRare: {
    backgroundColor: '#3498db',
  },
  rarityVeryRare: {
    backgroundColor: '#9b59b6',
  },
  rarityLegendary: {
    backgroundColor: '#f1c40f',
  },
  rarityUnknown: {
    backgroundColor: '#bdc3c7',
  },
  effectContainer: {
    backgroundColor: '#f8f8f8',
    padding: 12,
    borderRadius: 8,
  },
  effectLabel: {
    fontSize: 12,
    color: '#666',
    fontWeight: '600',
    marginBottom: 4,
  },
  effect: {
    fontSize: 14,
    color: '#444',
    lineHeight: 20,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 20,
    width: '80%',
    maxWidth: 300,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#6B3FA0',
    marginBottom: 20,
    textAlign: 'center',
  },
  collectionType: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 15,
  },
  collectionLabel: {
    fontSize: 16,
    color: '#444',
  },
  countControls: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  countButton: {
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: '#6B3FA0',
    justifyContent: 'center',
    alignItems: 'center',
  },
  countButtonText: {
    fontSize: 20,
    color: '#fff',
    fontWeight: 'bold',
  },
  countText: {
    fontSize: 18,
    color: '#444',
    fontWeight: 'bold',
    minWidth: 30,
    textAlign: 'center',
  },
  detailsModalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.9)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  detailsModalContent: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 20,
    width: '90%',
    maxHeight: '90%',
    maxWidth: 400,
  },
  detailsTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#6B3FA0',
    textAlign: 'center',
    marginBottom: 20,
  },
  detailsImage: {
    width: '100%',
    height: windowWidth * 1.4,
    marginBottom: 20,
  },
  detailsStats: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: 20,
  },
  statItem: {
    alignItems: 'center',
  },
  statLabel: {
    fontSize: 14,
    color: '#666',
    fontWeight: '600',
  },
  statValue: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#444',
  },
  detailsBadges: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 10,
    marginBottom: 20,
  },
  detailsSection: {
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#6B3FA0',
    marginBottom: 8,
  },
  sectionText: {
    fontSize: 16,
    color: '#444',
    lineHeight: 24,
  },
  closeButton: {
    backgroundColor: '#6B3FA0',
    padding: 15,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 20,
  },
  closeButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
});
