import React from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  TouchableOpacity,
  Dimensions
} from 'react-native';
import { Image } from 'expo-image';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '../theme/colors';
import { typography } from '../theme/typography';
import { spacing, borderRadius, elevation } from '../theme/spacing';

const { width } = Dimensions.get('window');
const cardWidth = width - (spacing.lg * 2);

/**
 * Composant SetCard - Affiche un chapitre (set) avec ses informations
 * 
 * @param {Object} set - Données du chapitre
 */
export default function SetCard({ set }) {
  const router = useRouter();
  
  // Extraire les propriétés du chapitre
  const { 
    id, 
    name, 
    code,
    release_date,
    card_number = 0,
    image_url
  } = set;
  
  // Formater la date de sortie
  const formattedDate = release_date ? new Date(release_date).toLocaleDateString() : 'Date inconnue';
  
  // Gérer le clic sur le chapitre
  const handlePress = () => {
    router.push(`/set/${id}`);
  };

  return (
    <TouchableOpacity 
      style={styles.container} 
      onPress={handlePress}
      activeOpacity={0.8}
    >
      {/* Image du chapitre (si disponible) */}
      {image_url && (
        <Image
          source={{ uri: image_url }}
          style={styles.image}
          contentFit="cover"
          transition={200}
        />
      )}
      
      {/* Informations du chapitre */}
      <View style={styles.infoContainer}>
        <Text style={styles.name}>{name}</Text>
        
        <View style={styles.detailsRow}>
          {code && (
            <View style={styles.detailItem}>
              <Ionicons name="code" size={16} color={colors.textSecondary} />
              <Text style={styles.detailText}>Code: {code}</Text>
            </View>
          )}
          
          <View style={styles.detailItem}>
            <Ionicons name="calendar" size={16} color={colors.textSecondary} />
            <Text style={styles.detailText}>{formattedDate}</Text>
          </View>
        </View>
        
        <View style={styles.cardCount}>
          <Ionicons name="layers" size={16} color={colors.primary} />
          <Text style={styles.cardCountText}>{card_number} cartes</Text>
        </View>
      </View>
      
      {/* Icône pour accéder aux cartes du chapitre */}
      <View style={styles.arrowContainer}>
        <Ionicons name="chevron-forward" size={24} color={colors.primary} />
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    width: cardWidth,
    backgroundColor: colors.card,
    borderRadius: borderRadius.md,
    marginBottom: spacing.md,
    flexDirection: 'row',
    overflow: 'hidden',
    ...elevation.sm,
  },
  image: {
    width: 80,
    height: '100%',
  },
  infoContainer: {
    flex: 1,
    padding: spacing.md,
  },
  name: {
    ...typography.h4,
    color: colors.textPrimary,
    marginBottom: spacing.xs,
  },
  detailsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: spacing.sm,
  },
  detailItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: spacing.md,
    marginBottom: spacing.xs,
  },
  detailText: {
    ...typography.body2,
    color: colors.textSecondary,
    marginLeft: spacing.xs,
  },
  cardCount: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  cardCountText: {
    ...typography.subtitle2,
    color: colors.primary,
    marginLeft: spacing.xs,
  },
  arrowContainer: {
    justifyContent: 'center',
    paddingHorizontal: spacing.md,
  },
});
