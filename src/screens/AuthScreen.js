import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  TextInput,
  ScrollView,
  Alert,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { useTheme } from '../context/ThemeContext';
import { useAuth } from '../context/AuthContext';

const AuthScreen = ({ navigation }) => {
  const { colors, isDarkMode } = useTheme();
  const { user, signIn, signUp, signInAnonymously, isLoading } = useAuth();

  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [username, setUsername] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (user) {
      navigation.replace('Main');
    }
  }, [user, navigation]);

  const handleSubmit = async () => {
    if (!email || !password) {
      Alert.alert('Error', 'Please fill in all fields');
      return;
    }

    setIsSubmitting(true);
    try {
      if (isLogin) {
        const { error } = await signIn(email, password);
        if (error) throw new Error(error);
      } else {
        if (!username) {
          Alert.alert('Error', 'Please enter a username');
          setIsSubmitting(false);
          return;
        }
        const { error } = await signUp(email, password, username);
        if (error) throw new Error(error);
        Alert.alert('Success', 'Account created! Please check your email to verify your account.');
      }
    } catch (error) {
      Alert.alert('Error', error.message || 'An error occurred. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleAnonymousSignIn = async () => {
    setIsSubmitting(true);
    try {
      const { error } = await signInAnonymously();
      if (error) throw new Error(error);
    } catch (error) {
      Alert.alert('Error', error.message || 'Failed to sign in anonymously');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return (
      <SafeAreaView style={{ flex: 1, backgroundColor: colors.background, justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator size="large" color={colors.primary} />
        <Text style={{ marginTop: 20, fontSize: 16, color: colors.text }}>
          Loading...
        </Text>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.background }}>
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        <ScrollView
          contentContainerStyle={{ flexGrow: 1, padding: 20 }}
          showsVerticalScrollIndicator={false}
        >
          {/* Header */}
          <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', marginBottom: 40 }}>
            <View
              style={{
                width: 100,
                height: 100,
                borderRadius: 50,
                backgroundColor: colors.primary,
                justifyContent: 'center',
                alignItems: 'center',
                marginBottom: 20,
                shadowColor: colors.primary,
                shadowOffset: { width: 0, height: 10 },
                shadowOpacity: 0.3,
                shadowRadius: 20,
                elevation: 10,
              }}
            >
              <Icon name="shield-check" size={50} color="#ffffff" />
            </View>
            <Text style={{ fontSize: 32, fontWeight: 'bold', color: colors.text, marginBottom: 10 }}>
              VPN Shield
            </Text>
            <Text style={{ fontSize: 16, color: colors.textSecondary, textAlign: 'center' }}>
              Secure your connection with military-grade encryption
            </Text>
          </View>

          {/* Auth Form */}
          <View style={{ marginBottom: 30 }}>
            <View style={{ marginBottom: 20 }}>
              <Text style={{ fontSize: 24, fontWeight: 'bold', color: colors.text, marginBottom: 5 }}>
                {isLogin ? 'Welcome Back' : 'Create Account'}
              </Text>
              <Text style={{ fontSize: 14, color: colors.textSecondary }}>
                {isLogin ? 'Sign in to continue' : 'Sign up to get started'}
              </Text>
            </View>

            {!isLogin && (
              <View style={{ marginBottom: 15 }}>
                <Text style={{ fontSize: 14, fontWeight: '600', color: colors.text, marginBottom: 8 }}>
                  Username
                </Text>
                <TextInput
                  value={username}
                  onChangeText={setUsername}
                  placeholder="Enter username"
                  placeholderTextColor={colors.textSecondary}
                  style={{
                    backgroundColor: colors.surface,
                    borderRadius: 12,
                    padding: 15,
                    fontSize: 16,
                    color: colors.text,
                    borderWidth: 1,
                    borderColor: colors.border,
                  }}
                />
              </View>
            )}

            <View style={{ marginBottom: 15 }}>
              <Text style={{ fontSize: 14, fontWeight: '600', color: colors.text, marginBottom: 8 }}>
                Email
              </Text>
              <TextInput
                value={email}
                onChangeText={setEmail}
                placeholder="Enter email"
                placeholderTextColor={colors.textSecondary}
                keyboardType="email-address"
                autoCapitalize="none"
                style={{
                  backgroundColor: colors.surface,
                  borderRadius: 12,
                  padding: 15,
                  fontSize: 16,
                  color: colors.text,
                  borderWidth: 1,
                  borderColor: colors.border,
                }}
              />
            </View>

            <View style={{ marginBottom: 20 }}>
              <Text style={{ fontSize: 14, fontWeight: '600', color: colors.text, marginBottom: 8 }}>
                Password
              </Text>
              <TextInput
                value={password}
                onChangeText={setPassword}
                placeholder="Enter password"
                placeholderTextColor={colors.textSecondary}
                secureTextEntry
                style={{
                  backgroundColor: colors.surface,
                  borderRadius: 12,
                  padding: 15,
                  fontSize: 16,
                  color: colors.text,
                  borderWidth: 1,
                  borderColor: colors.border,
                }}
              />
            </View>

            <TouchableOpacity
              onPress={handleSubmit}
              disabled={isSubmitting}
              style={{
                backgroundColor: colors.primary,
                borderRadius: 12,
                padding: 18,
                alignItems: 'center',
                marginBottom: 15,
                shadowColor: colors.primary,
                shadowOffset: { width: 0, height: 8 },
                shadowOpacity: 0.3,
                shadowRadius: 15,
                elevation: 8,
              }}
            >
              {isSubmitting ? (
                <ActivityIndicator color="#ffffff" />
              ) : (
                <Text style={{ fontSize: 16, fontWeight: '600', color: '#ffffff' }}>
                  {isLogin ? 'Sign In' : 'Create Account'}
                </Text>
              )}
            </TouchableOpacity>

            <TouchableOpacity
              onPress={() => setIsLogin(!isLogin)}
              style={{ alignItems: 'center' }}
            >
              <Text style={{ fontSize: 14, color: colors.primary }}>
                {isLogin ? "Don't have an account? Sign Up" : 'Already have an account? Sign In'}
              </Text>
            </TouchableOpacity>
          </View>

          {/* Divider */}
          <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 30 }}>
            <View style={{ flex: 1, height: 1, backgroundColor: colors.border }} />
            <Text style={{ marginHorizontal: 15, fontSize: 14, color: colors.textSecondary }}>
              OR
            </Text>
            <View style={{ flex: 1, height: 1, backgroundColor: colors.border }} />
          </View>

          {/* Anonymous Sign In */}
          <TouchableOpacity
            onPress={handleAnonymousSignIn}
            disabled={isSubmitting}
            style={{
              backgroundColor: colors.surface,
              borderRadius: 12,
              padding: 18,
              alignItems: 'center',
              marginBottom: 20,
              borderWidth: 1,
              borderColor: colors.border,
            }}
          >
            <Text style={{ fontSize: 16, fontWeight: '600', color: colors.text }}>
              Continue as Guest
            </Text>
            <Text style={{ fontSize: 12, color: colors.textSecondary, marginTop: 5 }}>
              Limited features, no account required
            </Text>
          </TouchableOpacity>

          {/* Features */}
          <View style={{ marginBottom: 30 }}>
            <Text style={{ fontSize: 18, fontWeight: '600', color: colors.text, marginBottom: 15, textAlign: 'center' }}>
              Why Choose VPN Shield?
            </Text>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
              <View style={{ flex: 1, alignItems: 'center', marginHorizontal: 5 }}>
                <Icon name="shield-check" size={30} color={colors.primary} style={{ marginBottom: 8 }} />
                <Text style={{ fontSize: 12, color: colors.text, textAlign: 'center', fontWeight: '500' }}>
                  Military-grade encryption
                </Text>
              </View>
              <View style={{ flex: 1, alignItems: 'center', marginHorizontal: 5 }}>
                <Icon name="server-network" size={30} color={colors.primary} style={{ marginBottom: 8 }} />
                <Text style={{ fontSize: 12, color: colors.text, textAlign: 'center', fontWeight: '500' }}>
                  Global servers
                </Text>
              </View>
              <View style={{ flex: 1, alignItems: 'center', marginHorizontal: 5 }}>
                <Icon name="eye-off" size={30} color={colors.primary} style={{ marginBottom: 8 }} />
                <Text style={{ fontSize: 12, color: colors.text, textAlign: 'center', fontWeight: '500' }}>
                  No logs policy
                </Text>
              </View>
            </View>
          </View>

          {/* Footer */}
          <View style={{ alignItems: 'center' }}>
            <Text style={{ fontSize: 12, color: colors.textSecondary, textAlign: 'center' }}>
              By continuing, you agree to our Terms of Service and Privacy Policy
            </Text>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

export default AuthScreen;