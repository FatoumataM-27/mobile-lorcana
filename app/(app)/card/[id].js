import React, { useState, useEffect } from 'react';
import { View, Text, Image, ScrollView, TouchableOpacity, StyleSheet } from 'react-native';
import { useLocalSearchParams } from 'expo-router';
import { useAuth } from '../../contexts/AuthContext';
import { api } from '../../services/api';
import { FontAwesome } from '@expo/vector-icons';

export default function CardDetails() {
  const { id } = useLocalSearchParams();
  const { token } = useAuth();
  const [card, setCard] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadCard();
  }, [id]);

  const loadCard = async () => {
    try {
      // Nous devons d'abord obtenir les détails de la carte
      const cards = await api.getSetCards(token, card.set_id);
      const cardDetails = cards.find(c => c.id.toString() === id);
      setCard(cardDetails);
    } catch (error) {
      console.error('Erreur lors du chargement de la carte:', error);
    } finally {
      setLoading(false);
    }
  };

  const updateQuantities = async (type, value) => {
    try {
      const newQuantities = {
        normal: type === 'normal' ? value : card.normal_quantity,
        foil: type === 'foil' ? value : card.foil_quantity
      };

      await api.updateOwnedCards(token, card.id, newQuantities);
      setCard(prev => ({
        ...prev,
        normal_quantity: newQuantities.normal,
        foil_quantity: newQuantities.foil
      }));
    } catch (error) {
      console.error('Erreur lors de la mise à jour des quantités:', error);
    }
  };

  const toggleWishlist = async () => {
    try {
      if (card.in_wishlist) {
        await api.removeFromWishlist(token, card.id);
      } else {
        await api.addToWishlist(token, card.id);
      }
      setCard(prev => ({
        ...prev,
        in_wishlist: !prev.in_wishlist
      }));
    } catch (error) {
      console.error('Erreur lors de la mise à jour de la wishlist:', error);
    }
  };

  if (loading || !card) {
    return (
      <View style={styles.container}>
        <Text>Chargement...</Text>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container}>
      <Image 
        source={{ uri: card.image }}
        style={styles.image}
        resizeMode="contain"
      />

      <View style={styles.infoContainer}>
        <View style={styles.header}>
          <View>
            <Text style={styles.name}>{card.name}</Text>
            <Text style={styles.subtitle}>#{card.number} • {card.rarity}</Text>
          </View>
          <TouchableOpacity
            style={styles.wishlistButton}
            onPress={toggleWishlist}
          >
            <FontAwesome 
              name={card.in_wishlist ? "star" : "star-o"}
              size={30}
              color={card.in_wishlist ? "#FFD700" : "#666"}
            />
          </TouchableOpacity>
        </View>

        <View style={styles.quantitySection}>
          <Text style={styles.sectionTitle}>Quantités possédées</Text>
          
          <View style={styles.quantityContainer}>
            <View style={styles.quantityControl}>
              <Text style={styles.quantityLabel}>Normal</Text>
              <View style={styles.quantityButtons}>
                <TouchableOpacity
                  style={styles.quantityButton}
                  onPress={() => updateQuantities('normal', Math.max(0, (card.normal_quantity || 0) - 1))}
                >
                  <Text style={styles.quantityButtonText}>-</Text>
                </TouchableOpacity>
                <Text style={styles.quantityValue}>{card.normal_quantity || 0}</Text>
                <TouchableOpacity
                  style={styles.quantityButton}
                  onPress={() => updateQuantities('normal', (card.normal_quantity || 0) + 1)}
                >
                  <Text style={styles.quantityButtonText}>+</Text>
                </TouchableOpacity>
              </View>
            </View>

            <View style={styles.quantityControl}>
              <Text style={styles.quantityLabel}>Brillante</Text>
              <View style={styles.quantityButtons}>
                <TouchableOpacity
                  style={styles.quantityButton}
                  onPress={() => updateQuantities('foil', Math.max(0, (card.foil_quantity || 0) - 1))}
                >
                  <Text style={styles.quantityButtonText}>-</Text>
                </TouchableOpacity>
                <Text style={styles.quantityValue}>{card.foil_quantity || 0}</Text>
                <TouchableOpacity
                  style={styles.quantityButton}
                  onPress={() => updateQuantities('foil', (card.foil_quantity || 0) + 1)}
                >
                  <Text style={styles.quantityButtonText}>+</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </View>

        {card.description && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Description</Text>
            <Text style={styles.description}>{card.description}</Text>
          </View>
        )}

        {card.story && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Histoire</Text>
            <Text style={styles.story}>{card.story}</Text>
          </View>
        )}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  image: {
    width: '100%',
    height: 400,
    backgroundColor: 'white',
  },
  infoContainer: {
    padding: 15,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  name: {
    fontSize: 24,
    fontWeight: 'bold',
  },
  subtitle: {
    color: '#666',
    fontSize: 16,
  },
  wishlistButton: {
    padding: 10,
  },
  section: {
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  description: {
    fontSize: 16,
    lineHeight: 24,
  },
  story: {
    fontSize: 16,
    lineHeight: 24,
    fontStyle: 'italic',
  },
  quantitySection: {
    backgroundColor: 'white',
    borderRadius: 10,
    padding: 15,
    marginBottom: 20,
  },
  quantityContainer: {
    gap: 15,
  },
  quantityControl: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  quantityLabel: {
    fontSize: 16,
  },
  quantityButtons: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 15,
  },
  quantityButton: {
    backgroundColor: '#007AFF',
    width: 30,
    height: 30,
    borderRadius: 15,
    justifyContent: 'center',
    alignItems: 'center',
  },
  quantityButtonText: {
    color: 'white',
    fontSize: 20,
    fontWeight: 'bold',
  },
  quantityValue: {
    fontSize: 18,
    fontWeight: 'bold',
    minWidth: 30,
    textAlign: 'center',
  },
});
