/**
 * Système d'espacement pour l'application Lorcana
 * Définit les marges et paddings cohérents pour toute l'application
 */

// Unité de base pour l'espacement (4 points)
const baseUnit = 4;

// Système d'espacement
export const spacing = {
  xs: baseUnit,           // 4
  sm: baseUnit * 2,       // 8
  md: baseUnit * 3,       // 12
  lg: baseUnit * 4,       // 16
  xl: baseUnit * 6,       // 24
  xxl: baseUnit * 8,      // 32
  xxxl: baseUnit * 12,    // 48
};

// Rayons de bordure
export const borderRadius = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 24,
  round: 9999,  // Pour les cercles parfaits
};

// Élévations (ombres)
export const elevation = {
  none: {
    shadowColor: 'transparent',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0,
    shadowRadius: 0,
    elevation: 0,
  },
  xs: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 1,
  },
  sm: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 3,
    elevation: 2,
  },
  md: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 4,
  },
  lg: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 6,
    elevation: 8,
  },
  xl: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 12,
  },
};

// Fonction utilitaire pour créer des styles de padding
export const createPadding = (value) => {
  if (typeof value === 'number') {
    return {
      padding: value,
    };
  }
  
  const { horizontal, vertical, top, right, bottom, left } = value;
  
  return {
    ...(horizontal !== undefined ? { paddingHorizontal: horizontal } : {}),
    ...(vertical !== undefined ? { paddingVertical: vertical } : {}),
    ...(top !== undefined ? { paddingTop: top } : {}),
    ...(right !== undefined ? { paddingRight: right } : {}),
    ...(bottom !== undefined ? { paddingBottom: bottom } : {}),
    ...(left !== undefined ? { paddingLeft: left } : {}),
  };
};

// Fonction utilitaire pour créer des styles de marge
export const createMargin = (value) => {
  if (typeof value === 'number') {
    return {
      margin: value,
    };
  }
  
  const { horizontal, vertical, top, right, bottom, left } = value;
  
  return {
    ...(horizontal !== undefined ? { marginHorizontal: horizontal } : {}),
    ...(vertical !== undefined ? { marginVertical: vertical } : {}),
    ...(top !== undefined ? { marginTop: top } : {}),
    ...(right !== undefined ? { marginRight: right } : {}),
    ...(bottom !== undefined ? { marginBottom: bottom } : {}),
    ...(left !== undefined ? { marginLeft: left } : {}),
  };
};
