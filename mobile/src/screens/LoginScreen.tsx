import React, { useState } from 'react';
import {
  View,
  StyleSheet,
  Image,
  Alert,
  Dimensions,
} from 'react-native';
import {
  Button,
  Text,
  Surface,
  ActivityIndicator,
} from 'react-native-paper';
import { useAuth } from '../contexts/AuthContext';

const { width, height } = Dimensions.get('window');

export const LoginScreen: React.FC = () => {
  const { loginWithGoogle, state } = useAuth();
  const [isLoading, setIsLoading] = useState(false);

  const handleGoogleLogin = async () => {
    try {
      setIsLoading(true);
      await loginWithGoogle();
    } catch (error) {
      console.error('Login error:', error);
      Alert.alert(
        'Erro no Login',
        'Não foi possível fazer login com o Google. Tente novamente.',
        [{ text: 'OK' }]
      );
    } finally {
      setIsLoading(false);
    }
  };

  if (state.isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#10b981" />
        <Text style={styles.loadingText}>Carregando...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Surface style={styles.surface}>
        <View style={styles.logoContainer}>
          <Text style={styles.logo}>💰</Text>
          <Text style={styles.appName}>TimeCash King</Text>
          <Text style={styles.tagline}>Controle financeiro simplificado</Text>
        </View>

        <View style={styles.content}>
          <Text style={styles.welcomeText}>
            Bem-vindo ao TimeCash King!
          </Text>
          <Text style={styles.descriptionText}>
            Gerencie suas finanças de forma inteligente e mantenha o controle total dos seus gastos e receitas.
          </Text>

          <View style={styles.featuresContainer}>
            <Text style={styles.featuresTitle}>Principais recursos:</Text>
            <Text style={styles.feature}>• Controle de receitas e despesas</Text>
            <Text style={styles.feature}>• Categorização inteligente</Text>
            <Text style={styles.feature}>• Relatórios detalhados</Text>
            <Text style={styles.feature}>• Notificações personalizadas</Text>
            <Text style={styles.feature}>• Sincronização em tempo real</Text>
          </View>
        </View>

        <View style={styles.buttonContainer}>
          <Button
            mode="contained"
            onPress={handleGoogleLogin}
            disabled={isLoading}
            loading={isLoading}
            style={styles.googleButton}
            icon="google"
            contentStyle={styles.buttonContent}
          >
            {isLoading ? 'Entrando...' : 'Entrar com Google'}
          </Button>

          <Text style={styles.termsText}>
            Ao continuar, você concorda com nossos{' '}
            <Text style={styles.linkText}>Termos de Uso</Text> e{' '}
            <Text style={styles.linkText}>Política de Privacidade</Text>
          </Text>
        </View>

        <View style={styles.footer}>
          <Text style={styles.footerText}>
            © 2024 TimeCash King. Todos os direitos reservados.
          </Text>
        </View>
      </Surface>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8fafc',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f8fafc',
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: '#6b7280',
  },
  surface: {
    flex: 1,
    margin: 20,
    borderRadius: 16,
    elevation: 4,
    backgroundColor: 'white',
  },
  logoContainer: {
    alignItems: 'center',
    paddingTop: 60,
    paddingBottom: 40,
  },
  logo: {
    fontSize: 80,
    marginBottom: 16,
  },
  appName: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#10b981',
    marginBottom: 8,
  },
  tagline: {
    fontSize: 16,
    color: '#6b7280',
    textAlign: 'center',
  },
  content: {
    flex: 1,
    paddingHorizontal: 32,
  },
  welcomeText: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1f2937',
    textAlign: 'center',
    marginBottom: 16,
  },
  descriptionText: {
    fontSize: 16,
    color: '#6b7280',
    textAlign: 'center',
    lineHeight: 24,
    marginBottom: 32,
  },
  featuresContainer: {
    marginBottom: 32,
  },
  featuresTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1f2937',
    marginBottom: 16,
    textAlign: 'center',
  },
  feature: {
    fontSize: 14,
    color: '#6b7280',
    marginBottom: 8,
    textAlign: 'center',
  },
  buttonContainer: {
    paddingHorizontal: 32,
    paddingBottom: 32,
  },
  googleButton: {
    backgroundColor: '#10b981',
    borderRadius: 12,
    marginBottom: 16,
  },
  buttonContent: {
    height: 56,
  },
  termsText: {
    fontSize: 12,
    color: '#9ca3af',
    textAlign: 'center',
    lineHeight: 18,
  },
  linkText: {
    color: '#10b981',
    textDecorationLine: 'underline',
  },
  footer: {
    paddingHorizontal: 32,
    paddingBottom: 20,
  },
  footerText: {
    fontSize: 12,
    color: '#9ca3af',
    textAlign: 'center',
  },
});
