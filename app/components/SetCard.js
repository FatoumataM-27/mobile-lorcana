import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image } from 'react-native';
import { useRouter } from 'expo-router';
import { colors } from '@/app/theme/colors';

function formatDate(dateString) {
  if (!dateString) return 'Date non disponible';
  
  const date = new Date(dateString);
  const options = { 
    day: 'numeric', 
    month: 'long', 
    year: 'numeric'
  };
  
  return date.toLocaleDateString('fr-FR', options);
}

export default function SetCard({ set }) {
  const router = useRouter();

  const navigateToCards = () => {
    router.push(`/sets/${set.id}/cards`);
  };

  return (
    <TouchableOpacity 
      style={styles.card}
      onPress={navigateToCards}
    >
      {set.image && (
        <Image
          source={{ uri: set.image }}
          style={styles.image}
          resizeMode="cover"
        />
      )}
      <View style={styles.content}>
        <Text style={styles.title}>{set.name}</Text>
        <Text style={styles.releaseDate}>
          Date de sortie : {formatDate(set.releaseDate)}
        </Text>
        <Text style={styles.description} numberOfLines={2}>
          {set.description || 'Aucune description disponible'}
        </Text>
        <TouchableOpacity style={styles.button} onPress={navigateToCards}>
          <Text style={styles.buttonText}>Voir les cartes</Text>
        </TouchableOpacity>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.surface,
    borderRadius: 12,
    marginBottom: 16,
    overflow: 'hidden',
    elevation: 3,
    shadowColor: colors.primaryDark,
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
  image: {
    width: '100%',
    height: 150,
  },
  content: {
    padding: 16,
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    color: colors.primary,
    marginBottom: 4,
  },
  releaseDate: {
    fontSize: 14,
    color: colors.textSecondary,
    marginBottom: 8,
    fontStyle: 'italic',
  },
  description: {
    fontSize: 14,
    color: colors.text,
    lineHeight: 20,
  },
  button: {
    backgroundColor: colors.primary,
    borderRadius: 8,
    padding: 8,
    marginTop: 8,
  },
  buttonText: {
    fontSize: 14,
    color: colors.surface,
  },
});
