/**
 * Palette de couleurs pour l'application Lorcana
 * Inspirée de l'univers Lorcana avec des tons bleus, violets et dorés
 */

export const colors = {
  // Couleurs principales
  primary: '#4361EE',       // Bleu principal
  secondary: '#7209B7',     // Violet secondaire
  accent: '#F9A826',        // Doré/Accent
  
  // Arrière-plans
  background: '#F8F9FA',    // Fond clair
  card: '#FFFFFF',          // Fond de carte
  cardDark: '#E9ECEF',      // Fond de carte secondaire
  
  // Texte
  textPrimary: '#212529',   // Texte principal
  textSecondary: '#6C757D', // Texte secondaire
  textLight: '#F8F9FA',     // Texte clair (sur fond foncé)
  
  // États
  success: '#38B000',       // Succès
  warning: '#FF9914',       // Avertissement
  error: '#E63946',         // Erreur
  info: '#4CC9F0',          // Information
  
  // Bordures et séparateurs
  border: '#DEE2E6',        // Bordure standard
  separator: '#E9ECEF',     // Séparateur
  
  // Éléments spécifiques
  wishlist: '#FF5D8F',      // Couleur wishlist (rose)
  collection: '#38B000',    // Couleur collection (vert)
  
  // Cartes rares (pour indiquer la rareté)
  common: '#ADB5BD',        // Commun (gris)
  uncommon: '#4CC9F0',      // Peu commun (bleu clair)
  rare: '#7209B7',          // Rare (violet)
  superRare: '#F9A826',     // Super rare (doré)
  legendary: '#FF5D8F',     // Légendaire (rose)
  
  // Ombres
  shadow: 'rgba(0, 0, 0, 0.1)',
};

// Thèmes
export const lightTheme = {
  ...colors,
};

export const darkTheme = {
  ...colors,
  background: '#212529',
  card: '#343A40',
  cardDark: '#495057',
  textPrimary: '#F8F9FA',
  textSecondary: '#ADB5BD',
  border: '#495057',
  separator: '#343A40',
};
