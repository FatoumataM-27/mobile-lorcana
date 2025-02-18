import React from 'react';
import { View, Text, Image, TouchableOpacity, StyleSheet } from 'react-native';
import { router } from 'expo-router';
import { FontAwesome } from '@expo/vector-icons';
import { colors } from '@/app/theme/colors';

export default function CardItem({ card, onRemove, onWishlistToggle, showRemoveButton = false, showWishlistButton = true }) {
  return (
    <TouchableOpacity 
      style={styles.container}
      onPress={() => router.push(`/card/${card.id}`)}
    >
      <View style={styles.content}>
        <Image 
          source={{ uri: card.thumbnail }} 
          style={styles.image}
          resizeMode="contain"
        />
        
        <View style={styles.details}>
          <Text style={styles.name}>{card.name}</Text>
          <Text style={styles.type}>{card.type}</Text>
          <Text style={styles.rarity}>{card.rarity}</Text>
          
          <View style={styles.stats}>
            {card.normal_quantity > 0 && (
              <Text style={styles.cost}>Normal: {card.normal_quantity}</Text>
            )}
            {card.foil_quantity > 0 && (
              <Text style={styles.cost}>Brillante: {card.foil_quantity}</Text>
            )}
          </View>
        </View>
      </View>

      {showRemoveButton && (
        <TouchableOpacity 
          style={styles.removeButton}
          onPress={onRemove}
        >
          <FontAwesome name="trash" size={20} color={colors.error} />
        </TouchableOpacity>
      )}
      {showWishlistButton && (
        <TouchableOpacity 
          style={styles.wishlistButton}
          onPress={() => onWishlistToggle(card.id)}
        >
          <FontAwesome 
            name={card.in_wishlist ? "star" : "star-o"} 
            size={24} 
            color={card.in_wishlist ? colors.primary : colors.textSecondary}
          />
        </TouchableOpacity>
      )}
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: colors.background,
    borderRadius: 10,
    marginBottom: 10,
    padding: 15,
    flexDirection: 'row',
    alignItems: 'center',
    shadowColor: colors.primaryDark,
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 3,
    borderWidth: 1,
    borderColor: colors.border,
  },
  content: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
  },
  image: {
    width: 80,
    height: 120,
    marginRight: 15,
    borderRadius: 5,
    backgroundColor: colors.surface,
  },
  details: {
    flex: 1,
  },
  name: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 5,
    color: colors.text,
  },
  type: {
    fontSize: 14,
    color: colors.textSecondary,
    marginBottom: 3,
  },
  rarity: {
    fontSize: 14,
    color: colors.primary,
    marginBottom: 5,
    fontWeight: '500',
  },
  stats: {
    flexDirection: 'row',
    gap: 10,
    backgroundColor: colors.surface,
    padding: 5,
    borderRadius: 5,
  },
  cost: {
    fontSize: 14,
    color: colors.textSecondary,
  },
  removeButton: {
    padding: 10,
    backgroundColor: colors.surface,
    borderRadius: 20,
    marginLeft: 10,
  },
  wishlistButton: {
    padding: 10,
    justifyContent: 'center',
  },
});
