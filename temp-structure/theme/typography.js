/**
 * Système typographique pour l'application Lorcana
 * Définit les styles de texte cohérents pour toute l'application
 */

import { Platform } from 'react-native';

// Famille de polices
const fontFamily = Platform.OS === 'ios' 
  ? { 
      regular: 'System', 
      medium: 'System', 
      bold: 'System',
    }
  : { 
      regular: 'Roboto', 
      medium: 'Roboto_Medium', 
      bold: 'Roboto_Bold',
    };

// Tailles de police
const fontSize = {
  xs: 12,
  sm: 14,
  md: 16,
  lg: 18,
  xl: 20,
  xxl: 24,
  xxxl: 32,
};

// Styles de texte
export const typography = {
  // Titres
  h1: {
    fontFamily: fontFamily.bold,
    fontSize: fontSize.xxxl,
    lineHeight: fontSize.xxxl * 1.2,
    fontWeight: 'bold',
  },
  h2: {
    fontFamily: fontFamily.bold,
    fontSize: fontSize.xxl,
    lineHeight: fontSize.xxl * 1.2,
    fontWeight: 'bold',
  },
  h3: {
    fontFamily: fontFamily.bold,
    fontSize: fontSize.xl,
    lineHeight: fontSize.xl * 1.2,
    fontWeight: 'bold',
  },
  h4: {
    fontFamily: fontFamily.medium,
    fontSize: fontSize.lg,
    lineHeight: fontSize.lg * 1.2,
    fontWeight: '600',
  },
  
  // Corps de texte
  body1: {
    fontFamily: fontFamily.regular,
    fontSize: fontSize.md,
    lineHeight: fontSize.md * 1.5,
  },
  body2: {
    fontFamily: fontFamily.regular,
    fontSize: fontSize.sm,
    lineHeight: fontSize.sm * 1.5,
  },
  
  // Texte d'accent
  subtitle1: {
    fontFamily: fontFamily.medium,
    fontSize: fontSize.md,
    lineHeight: fontSize.md * 1.5,
    fontWeight: '500',
  },
  subtitle2: {
    fontFamily: fontFamily.medium,
    fontSize: fontSize.sm,
    lineHeight: fontSize.sm * 1.5,
    fontWeight: '500',
  },
  
  // Texte de légende
  caption: {
    fontFamily: fontFamily.regular,
    fontSize: fontSize.xs,
    lineHeight: fontSize.xs * 1.5,
  },
  
  // Boutons
  button: {
    fontFamily: fontFamily.medium,
    fontSize: fontSize.md,
    fontWeight: '600',
    textTransform: 'uppercase',
  },
  
  // Liens
  link: {
    fontFamily: fontFamily.regular,
    fontSize: fontSize.md,
    textDecorationLine: 'underline',
  },
};

// Fonction utilitaire pour combiner des styles typographiques
export const combineTypography = (baseStyle, customStyle) => {
  return {
    ...typography[baseStyle],
    ...customStyle,
  };
};
