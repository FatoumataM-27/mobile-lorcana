import React from 'react';
import { 
  View, 
  TextInput, 
  StyleSheet, 
  TouchableOpacity 
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '../theme/colors';
import { typography } from '../theme/typography';
import { spacing, borderRadius, elevation } from '../theme/spacing';

/**
 * Composant SearchBar - Barre de recherche réutilisable
 * 
 * @param {String} value - Valeur actuelle de la recherche
 * @param {Function} onChangeText - Fonction appelée lors du changement de texte
 * @param {String} placeholder - Texte d'indication
 * @param {Function} onClear - Fonction appelée lors du clic sur le bouton de suppression
 * @param {Object} style - Styles supplémentaires
 */
export default function SearchBar({ 
  value, 
  onChangeText, 
  placeholder = 'Rechercher...', 
  onClear,
  style 
}) {
  // Gérer le clic sur le bouton de suppression
  const handleClear = () => {
    if (onClear) {
      onClear();
    } else if (onChangeText) {
      onChangeText('');
    }
  };

  return (
    <View style={[styles.container, style]}>
      {/* Icône de recherche */}
      <Ionicons 
        name="search" 
        size={20} 
        color={colors.textSecondary} 
        style={styles.searchIcon} 
      />
      
      {/* Champ de recherche */}
      <TextInput
        style={styles.input}
        value={value}
        onChangeText={onChangeText}
        placeholder={placeholder}
        placeholderTextColor={colors.textSecondary}
        returnKeyType="search"
        clearButtonMode="never" // Nous utilisons notre propre bouton de suppression
      />
      
      {/* Bouton de suppression (visible uniquement si la valeur n'est pas vide) */}
      {value ? (
        <TouchableOpacity onPress={handleClear} style={styles.clearButton}>
          <Ionicons name="close-circle" size={18} color={colors.textSecondary} />
        </TouchableOpacity>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.card,
    borderRadius: borderRadius.md,
    paddingHorizontal: spacing.md,
    height: 48,
    ...elevation.xs,
  },
  searchIcon: {
    marginRight: spacing.sm,
  },
  input: {
    flex: 1,
    ...typography.body1,
    color: colors.textPrimary,
    padding: 0, // Enlever le padding par défaut sur Android
  },
  clearButton: {
    padding: spacing.xs,
  },
});
