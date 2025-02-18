import { Redirect, Tabs } from 'expo-router';
import { useAuth } from '@/app/contexts/AuthContext';
import { FontAwesome } from '@expo/vector-icons';
import { colors } from '@/app/theme/colors';

export default function AppLayout() {
  const { isAuthenticated, token } = useAuth();

  if (!isAuthenticated || !token) {
    return <Redirect href="/(auth)/login" />;
  }

  return (
    <Tabs
      screenOptions={{
        headerStyle: {
          backgroundColor: colors.primary,
        },
        headerTintColor: colors.textLight,
        headerTitleStyle: {
          fontWeight: 'bold',
        },
        tabBarStyle: {
          backgroundColor: colors.background,
          borderTopColor: colors.border,
        },
        tabBarActiveTintColor: colors.primary,
        tabBarInactiveTintColor: colors.textSecondary,
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: 'Chapitres',
          tabBarIcon: ({ color, size }) => (
            <FontAwesome name="book" size={size} color={color} />
          ),
        }}
      />
      
      <Tabs.Screen
        name="wishlist"
        options={{
          title: 'Wishlist',
          tabBarIcon: ({ color, size }) => (
            <FontAwesome name="star" size={size} color={color} />
          ),
        }}
      />
      
      <Tabs.Screen
        name="account"
        options={{
          title: 'Mon Compte',
          tabBarIcon: ({ color, size }) => (
            <FontAwesome name="user" size={size} color={color} />
          ),
        }}
      />

      <Tabs.Screen
        name="set/[id]"
        options={{
          title: 'Détails du chapitre',
          href: null,
        }}
      />

      <Tabs.Screen
        name="card/[id]"
        options={{
          title: 'Détails de la carte',
          href: null,
        }}
      />
    </Tabs>
  );
}
