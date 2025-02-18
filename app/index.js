import { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { useRouter, Redirect } from 'expo-router';
import { useAuth } from './contexts/AuthContext';
import { colors } from '@/app/theme/colors';

export default function SplashScreen() {
  const router = useRouter();
  const { token } = useAuth();
  const [showButtons, setShowButtons] = useState(true);

  useEffect(() => {
    if (token) {
      setShowButtons(false);
      setTimeout(() => {
        router.replace('/(app)');
      }, 1000);
    }
  }, [token]);

  if (token) {
    return <Redirect href="/(app)" />;
  }

  return (
    <View style={styles.container}>
      <View style={styles.content}>
        <Text style={styles.title}>Bienvenue sur Lorcana</Text>
        <Text style={styles.subtitle}>
          Gérez votre collection de cartes Disney Lorcana
        </Text>
      </View>

      {showButtons && (
        <View style={styles.buttonContainer}>
          <TouchableOpacity
            style={styles.button}
            onPress={() => router.push('/(auth)/login')}
          >
            <Text style={styles.buttonText}>Se connecter</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.button, styles.signupButton]}
            onPress={() => router.push('/(auth)/register')}
          >
            <Text style={styles.buttonText}>S'inscrire</Text>
          </TouchableOpacity>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
    justifyContent: 'center',
  },
  content: {
    alignItems: 'center',
    padding: 20,
    marginBottom: 20,
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    color: colors.primary,
    textAlign: 'center',
    marginBottom: 6,
  },
  subtitle: {
    fontSize: 18,
    color: colors.textSecondary,
    textAlign: 'center',
    marginBottom: 20,
    maxWidth: '80%',
  },
  buttonContainer: {
    width: '100%',
    padding: 20,
    paddingTop: 0,
    gap: 16,
  },
  button: {
    backgroundColor: colors.primary,
    padding: 16,
    borderRadius: 8,
    alignItems: 'center',
    shadowColor: colors.primaryDark,
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  signupButton: {
    backgroundColor: colors.primaryDark,
  },
  buttonText: {
    color: colors.textLight,
    fontSize: 16,
    fontWeight: 'bold',
  },
});
