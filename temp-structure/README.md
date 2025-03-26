# Application Lorcana

Application mobile pour gérer votre collection de cartes Lorcana.

## Structure du projet

```
app/
├── (auth)/                 # Écrans d'authentification
│   ├── _layout.js          # Layout pour les écrans d'auth
│   ├── login.js            # Écran de connexion
│   └── register.js         # Écran d'inscription
├── (app)/                  # Écrans principaux (après connexion)
│   ├── _layout.js          # Layout avec navigation par onglets
│   ├── index.js            # Liste des chapitres (écran principal)
│   ├── cards.js            # Toutes les cartes
│   ├── wishlist.js         # Wishlist de l'utilisateur
│   ├── collection.js       # Collection de l'utilisateur
│   ├── account.js          # Profil et statistiques
│   ├── card/
│   │   └── [id].js         # Détails d'une carte
│   └── set/
│       └── [id].js         # Cartes d'un chapitre
├── components/             # Composants réutilisables
│   ├── Card.js             # Composant de carte (aperçu)
│   ├── CardDetail.js       # Composant détaillé d'une carte
│   ├── CardList.js         # Liste de cartes avec filtres
│   ├── CollectionControls.js # Contrôles de collection
│   ├── SearchBar.js        # Barre de recherche
│   ├── SetCard.js          # Aperçu d'un chapitre
│   └── StatsCard.js        # Carte de statistiques
├── contexts/               # Gestion d'état global
│   ├── AuthContext.js      # Contexte d'authentification
│   └── CollectionContext.js # Contexte de collection
├── services/               # Services
│   └── api.js              # Service API
├── hooks/                  # Hooks personnalisés
│   ├── useCollection.js    # Gestion de la collection
│   ├── useWishlist.js      # Gestion de la wishlist
│   └── useSearch.js        # Logique de recherche
├── utils/                  # Utilitaires
│   ├── storage.js          # Stockage local
│   └── formatters.js       # Formatage des données
└── theme/                  # Thème et styles
    ├── colors.js           # Palette de couleurs
    ├── typography.js       # Typographie
    └── spacing.js          # Espacement
```

## Design System

- **Palette de couleurs** : Inspirée de l'univers Lorcana avec des tons bleus, violets et dorés
- **Typographie** : Police principale lisible avec hiérarchie claire
- **Composants** : Design cohérent pour tous les éléments d'interface
- **Accessibilité** : Contraste suffisant, taille de texte adaptable, feedback tactile

## Fonctionnalités

- **Authentification** : Inscription, connexion, déconnexion
- **Gestion des cartes** : Affichage, filtrage, recherche, ajout à la collection
- **Gestion des chapitres** : Liste des chapitres disponibles
- **Collection** : Visualisation et gestion de votre collection
- **Wishlist** : Gestion de votre liste de souhaits

## Technologies

- **Expo** : Framework React Native
- **Expo Router** : Navigation
- **Expo Image** : Gestion optimisée des images
- **Context API** : Gestion d'état global
- **Fetch API** : Communication avec le backend
