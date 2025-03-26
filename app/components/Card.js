import React, { useState, useEffect } from 'react';
import { View, Text, Image, StyleSheet, Dimensions, TouchableOpacity, Modal, ScrollView, ActivityIndicator } from 'react-native';
import { useAuth } from '../contexts/AuthContext';
import api from '../services/api';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '../theme/colors';

const { width } = Dimensions.get('window');
const cardWidth = (width / 2) - 15;

export default function Card({ card, onWishlistUpdate, onCollectionUpdate }) {
  const [isInWishlist, setIsInWishlist] = useState(card.inWishlist || false);
  const [loading, setLoading] = useState(false);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [showCollectionModal, setShowCollectionModal] = useState(false);
  const [normalCount, setNormalCount] = useState(card.normalCount || 0);
  const [shinyCount, setShinyCount] = useState(card.shinyCount || 0);
  const { token } = useAuth();
  
  // Utiliser l'URL d'image appropriée
  const imageUrl = card.image_url || card.imageUrl || card.image || card.artwork_url;
  
  // Vérifier si la carte est dans la wishlist au chargement
  useEffect(() => {
    checkWishlistStatus();
  }, []);
  
  const checkWishlistStatus = async () => {
    try {
      const wishlistResponse = await api.getWishlist(token);
      const isInList = wishlistResponse.data.some(item => item.id === card.id);
      setIsInWishlist(isInList);
    } catch (error) {
      console.error('Erreur vérification wishlist:', error);
    }
  };

  const toggleWishlist = async () => {
    if (loading) return;
    
    try {
      setLoading(true);
      
      // Update UI state immediately for better user experience
      const newWishlistState = !isInWishlist;
      setIsInWishlist(newWishlistState);
      
      try {
        if (newWishlistState) {
          // Adding to wishlist
          console.log('Adding to wishlist:', card.id);
          await api.addToWishlist(token, card.id);
        } else {
          // Removing from wishlist
          console.log('Removing from wishlist:', card.id);
          await api.removeFromWishlist(token, card.id);
        }
        
        // Notify parent component about the update
        if (onWishlistUpdate) {
          onWishlistUpdate();
        }
      } catch (error) {
        // Special handling for "already in wishlist" error
        if (error.message && error.message.includes("already in wishlist")) {
          console.log("Card is already in wishlist, keeping UI state as is");
          // Don't revert the UI state since the card is actually in the wishlist
        } else {
          // Revert UI state for other errors
          setIsInWishlist(!newWishlistState);
          throw error; // Re-throw to be caught by outer catch block
        }
      }
    } catch (error) {
      console.error('Erreur wishlist:', error);
      // Don't show alert for "already in wishlist" error
      if (!error.message || !error.message.includes("already in wishlist")) {
        alert('Erreur lors de la mise à jour de la wishlist: ' + (error.message || 'Erreur inconnue'));
      }
    } finally {
      setLoading(false);
    }
  };

  const updateCollection = async (isShiny, increment) => {
    try {
      setLoading(true);
      const currentCount = isShiny ? shinyCount : normalCount;
      const newCount = Math.max(0, currentCount + (increment ? 1 : -1));
      
      console.log('Updating collection:', {
        cardId: card.id,
        isShiny,
        currentCount,
        newCount,
        increment
      });
      
      // Update local state immediately for better user experience
      if (isShiny) {
        setShinyCount(newCount);
      } else {
        setNormalCount(newCount);
      }
      
      // Then update the backend
      try {
        // Préparer les quantités pour l'API
        const quantities = {
          normal: isShiny ? normalCount : newCount,
          foil: isShiny ? newCount : shinyCount
        };
        
        // Utiliser l'endpoint correct pour mettre à jour les quantités
        console.log(`Updating card ${card.id} with quantities:`, quantities);
        await api.updateOwnedCards(token, card.id, quantities);

        // Notify parent component about the update
        if (onCollectionUpdate) {
          onCollectionUpdate();
        }
      } catch (error) {
        // Handle specific collection errors
        if (error.message && (
            error.message.includes("already in collection") || 
            error.message.includes("already exists")
          )) {
          console.log("Card collection state already matches desired state, keeping UI as is");
          // Don't revert the UI state since the server state matches what we want
        } else {
          // Revert local state for other errors
          if (isShiny) {
            setShinyCount(currentCount);
          } else {
            setNormalCount(currentCount);
          }
          throw error; // Re-throw to be caught by outer catch block
        }
      }
    } catch (error) {
      console.error('Erreur collection:', error);
      // Don't show alert for specific expected errors
      if (!error.message || !(
          error.message.includes("already in collection") || 
          error.message.includes("already exists")
        )) {
        alert('Erreur lors de la mise à jour de la collection: ' + (error.message || 'Erreur inconnue'));
      }
    } finally {
      setLoading(false);
    }
  };

  const openDetailsModal = () => {
    setShowDetailsModal(true);
  };

  const openCollectionModal = () => {
    setShowCollectionModal(true);
  };

  return (
    <View style={styles.cardContainer}>
      <Image 
        source={{ uri: imageUrl }} 
        style={styles.cardImage} 
        resizeMode="cover"
      />
      <Text style={styles.cardName} numberOfLines={1}>{card.name}</Text>
      
      <View style={styles.actionContainer}>
        <TouchableOpacity 
          style={styles.actionButton} 
          onPress={openDetailsModal}
        >
          <Ionicons name="eye" size={24} color="black" />
        </TouchableOpacity>
        
        <TouchableOpacity 
          style={styles.actionButton} 
          onPress={toggleWishlist}
          disabled={loading}
        >
          <Ionicons 
            name={isInWishlist ? "heart" : "heart-outline"} 
            size={24} 
            color={isInWishlist ? "red" : "black"} 
          />
          {loading && <ActivityIndicator size="small" color="#999" style={styles.loader} />}
        </TouchableOpacity>
      </View>
      
      {/* Modal pour les détails de la carte */}
      <Modal
        visible={showDetailsModal}
        transparent={true}
        animationType="slide"
        onRequestClose={() => setShowDetailsModal(false)}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <ScrollView>
              <Image 
                source={{ uri: imageUrl }} 
                style={styles.modalImage} 
                resizeMode="contain"
              />
              
              <Text style={styles.modalTitle}>{card.name}</Text>
              
              <View style={styles.detailRow}>
                <Text style={styles.detailLabel}>Type:</Text>
                <Text style={styles.detailValue}>{card.type || 'Non spécifié'}</Text>
              </View>
              
              <View style={styles.detailRow}>
                <Text style={styles.detailLabel}>Rareté:</Text>
                <Text style={styles.detailValue}>{card.rarity || 'Non spécifiée'}</Text>
              </View>
              
              <View style={styles.detailRow}>
                <Text style={styles.detailLabel}>Coût:</Text>
                <Text style={styles.detailValue}>{card.cost || 'Non spécifié'}</Text>
              </View>
              
              <View style={styles.detailRow}>
                <Text style={styles.detailLabel}>Puissance:</Text>
                <Text style={styles.detailValue}>{card.strength || 'N/A'}</Text>
              </View>
              
              <View style={styles.detailRow}>
                <Text style={styles.detailLabel}>Défense:</Text>
                <Text style={styles.detailValue}>{card.willpower || 'N/A'}</Text>
              </View>
              
              <Text style={styles.detailLabel}>Description:</Text>
              <Text style={styles.description}>{card.description || 'Aucune description disponible'}</Text>
              
              <View style={styles.collectionSection}>
                <Text style={styles.sectionTitle}>Ma collection</Text>
                <View style={styles.quantityRow}>
                  <Text>Normal: {normalCount}</Text>
                  <View style={styles.quantityButtons}>
                    <TouchableOpacity 
                      style={[styles.quantityButton, normalCount === 0 && styles.disabledButton]} 
                      onPress={() => updateCollection(false, false)}
                      disabled={normalCount === 0 || loading}
                    >
                      <Text style={styles.quantityButtonText}>-</Text>
                    </TouchableOpacity>
                    <TouchableOpacity 
                      style={styles.quantityButton} 
                      onPress={() => updateCollection(false, true)}
                      disabled={loading}
                    >
                      <Text style={styles.quantityButtonText}>+</Text>
                    </TouchableOpacity>
                  </View>
                </View>
                
                <View style={styles.quantityRow}>
                  <Text>Brillant: {shinyCount}</Text>
                  <View style={styles.quantityButtons}>
                    <TouchableOpacity 
                      style={[styles.quantityButton, shinyCount === 0 && styles.disabledButton]} 
                      onPress={() => updateCollection(true, false)}
                      disabled={shinyCount === 0 || loading}
                    >
                      <Text style={styles.quantityButtonText}>-</Text>
                    </TouchableOpacity>
                    <TouchableOpacity 
                      style={styles.quantityButton} 
                      onPress={() => updateCollection(true, true)}
                      disabled={loading}
                    >
                      <Text style={styles.quantityButtonText}>+</Text>
                    </TouchableOpacity>
                  </View>
                </View>
              </View>
              
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

const styles = StyleSheet.create({
  cardContainer: {
    width: cardWidth,
    margin: 5,
    backgroundColor: '#fff',
    borderRadius: 10,
    overflow: 'hidden',
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  cardImage: {
    width: '100%',
    height: cardWidth * 1.4, // Ratio carte
    borderTopLeftRadius: 10,
    borderTopRightRadius: 10,
  },
  cardName: {
    fontSize: 14,
    fontWeight: 'bold',
    textAlign: 'center',
    padding: 8,
  },
  actionContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingBottom: 8,
  },
  actionButton: {
    padding: 5,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
  },
  loader: {
    position: 'absolute',
  },
  modalContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  modalContent: {
    width: '90%',
    maxHeight: '90%',
    backgroundColor: '#fff',
    borderRadius: 10,
    padding: 15,
  },
  modalImage: {
    width: '100%',
    height: 300,
    marginBottom: 15,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 15,
    textAlign: 'center',
  },
  detailRow: {
    flexDirection: 'row',
    marginBottom: 8,
  },
  detailLabel: {
    fontWeight: 'bold',
    marginRight: 5,
    fontSize: 16,
  },
  detailValue: {
    fontSize: 16,
  },
  description: {
    marginTop: 5,
    marginBottom: 15,
    fontSize: 14,
    lineHeight: 20,
  },
  collectionSection: {
    marginTop: 15,
    padding: 10,
    backgroundColor: '#f5f5f5',
    borderRadius: 8,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  quantityRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  quantityButtons: {
    flexDirection: 'row',
  },
  quantityButton: {
    width: 30,
    height: 30,
    backgroundColor: colors.primary,
    borderRadius: 15,
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 10,
  },
  quantityButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
  disabledButton: {
    backgroundColor: '#ccc',
  },
  closeButton: {
    backgroundColor: colors.primary,
    padding: 12,
    borderRadius: 25,
    alignItems: 'center',
    marginTop: 20,
  },
  closeButtonText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 16,
  },
});
