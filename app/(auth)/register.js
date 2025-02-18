import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert } from 'react-native';
import { useAuth } from '@/app/contexts/AuthContext';
import { router } from 'expo-router';
import { colors } from '@/app/theme/colors';

export default function Register() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [passwordConfirmation, setPasswordConfirmation] = useState('');
  const [error, setError] = useState('');
  const [isRegistrationDisabled, setIsRegistrationDisabled] = useState(true);
  
  const { register } = useAuth();

  const handleRegister = async () => {
    if (isRegistrationDisabled) {
      Alert.alert(
        "Inscription désactivée",
        "Les inscriptions sont temporairement désactivées. Veuillez réessayer plus tard.",
        [{ text: "OK", onPress: () => router.push('/(auth)/login') }]
      );
      return;
    }

    if (!name || !email || !password || !passwordConfirmation) {
      setError('Veuillez remplir tous les champs');
      return;
    }

    if (password !== passwordConfirmation) {
      setError('Les mots de passe ne correspondent pas');
      return;
    }

    const result = await register(name, email, password, passwordConfirmation);
    if (result.success) {
      router.replace('/(app)');
    } else {
      setError(result.error || 'Erreur lors de l\'inscription');
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Inscription</Text>
      
      {isRegistrationDisabled && (
        <Text style={styles.disabledMessage}>
          Les inscriptions sont actuellement désactivées.
        </Text>
      )}
      
      {error ? <Text style={styles.error}>{error}</Text> : null}
      
      <TextInput
        style={[styles.input, isRegistrationDisabled && styles.disabledInput]}
        placeholder="Nom"
        placeholderTextColor={colors.placeholder}
        value={name}
        onChangeText={setName}
        autoCapitalize="words"
        editable={!isRegistrationDisabled}
      />
      
      <TextInput
        style={[styles.input, isRegistrationDisabled && styles.disabledInput]}
        placeholder="Email"
        placeholderTextColor={colors.placeholder}
        value={email}
        onChangeText={setEmail}
        keyboardType="email-address"
        autoCapitalize="none"
        editable={!isRegistrationDisabled}
      />
      
      <TextInput
        style={[styles.input, isRegistrationDisabled && styles.disabledInput]}
        placeholder="Mot de passe"
        placeholderTextColor={colors.placeholder}
        value={password}
        onChangeText={setPassword}
        secureTextEntry
        editable={!isRegistrationDisabled}
      />
      
      <TextInput
        style={[styles.input, isRegistrationDisabled && styles.disabledInput]}
        placeholder="Confirmer le mot de passe"
        placeholderTextColor={colors.placeholder}
        value={passwordConfirmation}
        onChangeText={setPasswordConfirmation}
        secureTextEntry
        editable={!isRegistrationDisabled}
      />
      
      <TouchableOpacity 
        style={[styles.button, isRegistrationDisabled && styles.disabledButton]} 
        onPress={handleRegister}
      >
        <Text style={styles.buttonText}>S'inscrire</Text>
      </TouchableOpacity>
      
      <TouchableOpacity onPress={() => router.push('/(auth)/login')}>
        <Text style={styles.link}>Déjà un compte ? Se connecter</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    justifyContent: 'center',
    backgroundColor: colors.background,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    marginBottom: 30,
    textAlign: 'center',
    color: colors.primary,
  },
  disabledMessage: {
    color: colors.error,
    textAlign: 'center',
    fontSize: 16,
    marginBottom: 20,
    backgroundColor: '#FFE5E5',
    padding: 10,
    borderRadius: 8,
  },
  input: {
    borderWidth: 1,
    borderColor: colors.border,
    padding: 15,
    borderRadius: 8,
    marginBottom: 15,
    backgroundColor: colors.surface,
    color: colors.text,
    fontSize: 16,
  },
  disabledInput: {
    backgroundColor: colors.divider,
    color: colors.disabled,
    borderColor: colors.border,
  },
  button: {
    backgroundColor: colors.primary,
    padding: 15,
    borderRadius: 8,
    marginBottom: 15,
    shadowColor: colors.primaryDark,
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  disabledButton: {
    backgroundColor: colors.disabled,
    shadowOpacity: 0,
    elevation: 0,
  },
  buttonText: {
    color: colors.textLight,
    textAlign: 'center',
    fontWeight: 'bold',
    fontSize: 16,
  },
  error: {
    color: colors.error,
    marginBottom: 15,
    textAlign: 'center',
    backgroundColor: '#FFE5E5',
    padding: 10,
    borderRadius: 8,
  },
  link: {
    color: colors.primary,
    textAlign: 'center',
    fontSize: 16,
    textDecorationLine: 'underline',
  },
});
