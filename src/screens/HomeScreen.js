import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  Alert,
  Dimensions,
  Animated,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { useTheme } from '../context/ThemeContext';
import { useVPN } from '../context/VPNContext';
import { useAuth } from '../context/AuthContext';

const { width } = Dimensions.get('window');

const HomeScreen = () => {
  const { colors, isDarkMode } = useTheme();
  const {
    isConnected,
    isConnecting,
    currentServer,
    connectionSpeed,
    currentIP,
    connect,
    disconnect,
    connectionError,
  } = useVPN();
  const { user, isPremium } = useAuth();

  const [scaleAnim] = useState(new Animated.Value(1));
  const [glowAnim] = useState(new Animated.Value(0));

  useEffect(() => {
    if (isConnected) {
      Animated.loop(
        Animated.sequence([
          Animated.timing(glowAnim, {
            toValue: 1,
            duration: 2000,
            useNativeDriver: false,
          }),
          Animated.timing(glowAnim, {
            toValue: 0,
            duration: 2000,
            useNativeDriver: false,
          }),
        ])
      ).start();
    } else {
      glowAnim.setValue(0);
    }
  }, [isConnected]);

  const handleConnect = async () => {
    if (isConnecting) return;

    Animated.sequence([
      Animated.timing(scaleAnim, {
        toValue: 0.95,
        duration: 100,
        useNativeDriver: true,
      }),
      Animated.timing(scaleAnim, {
        toValue: 1,
        duration: 100,
        useNativeDriver: true,
      }),
    ]).start();

    if (isConnected) {
      await disconnect();
    } else {
      await connect();
    }
  };

  const getStatusColor = () => {
    if (isConnecting) return colors.warning;
    return isConnected ? colors.success : colors.danger;
  };

  const getStatusText = () => {
    if (isConnecting) return 'Connecting...';
    return isConnected ? 'Connected' : 'Disconnected';
  };

  const getServerInfo = () => {
    if (!currentServer) return 'No server selected';
    return `${currentServer.name} (${currentServer.city})`;
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.background }}>
      <ScrollView
        contentContainerStyle={{ flexGrow: 1, padding: 20 }}
        showsVerticalScrollIndicator={false}
      >
        {/* Header */}
        <View style={{ marginBottom: 30 }}>
          <Text style={{ fontSize: 28, fontWeight: 'bold', color: colors.text, marginBottom: 5 }}>
            VPN Shield
          </Text>
          <Text style={{ fontSize: 16, color: colors.textSecondary }}>
            Secure your connection with military-grade encryption
          </Text>
        </View>

        {/* Connection Status Card */}
        <View
          style={{
            backgroundColor: colors.surface,
            borderRadius: 20,
            padding: 25,
            marginBottom: 30,
            shadowColor: isDarkMode ? '#000' : '#000',
            shadowOffset: { width: 0, height: 10 },
            shadowOpacity: isDarkMode ? 0.3 : 0.1,
            shadowRadius: 20,
            elevation: 10,
          }}
        >
          <View style={{ alignItems: 'center', marginBottom: 20 }}>
            <View
              style={{
                width: 80,
                height: 80,
                borderRadius: 40,
                backgroundColor: colors.surface,
                justifyContent: 'center',
                alignItems: 'center',
                marginBottom: 15,
                shadowColor: isDarkMode ? '#000' : '#000',
                shadowOffset: { width: 0, height: 8 },
                shadowOpacity: isDarkMode ? 0.3 : 0.15,
                shadowRadius: 15,
                elevation: 8,
              }}
            >
              <Icon
                name={isConnected ? 'shield-check' : 'shield-outline'}
                size={40}
                color={getStatusColor()}
              />
            </View>
            <Text style={{ fontSize: 18, fontWeight: '600', color: colors.text, marginBottom: 5 }}>
              {getStatusText()}
            </Text>
            <Text style={{ fontSize: 14, color: colors.textSecondary }}>
              {getServerInfo()}
            </Text>
          </View>

          {/* Connection Stats */}
          {isConnected && (
            <View style={{ marginBottom: 20 }}>
              <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 10 }}>
                <View style={{ flex: 1, alignItems: 'center' }}>
                  <Text style={{ fontSize: 12, color: colors.textSecondary, marginBottom: 5 }}>
                    Speed
                  </Text>
                  <Text style={{ fontSize: 16, fontWeight: '600', color: colors.text }}>
                    {Math.round(connectionSpeed)} Mbps
                  </Text>
                </View>
                <View style={{ flex: 1, alignItems: 'center' }}>
                  <Text style={{ fontSize: 12, color: colors.textSecondary, marginBottom: 5 }}>
                    IP Address
                  </Text>
                  <Text style={{ fontSize: 16, fontWeight: '600', color: colors.text }}>
                    {currentIP}
                  </Text>
                </View>
              </View>
            </View>
          )}

          {/* Connect Button */}
          <Animated.View style={{ transform: [{ scale: scaleAnim }] }}>
            <TouchableOpacity
              onPress={handleConnect}
              disabled={isConnecting}
              style={{
                backgroundColor: getStatusColor(),
                borderRadius: 15,
                paddingVertical: 18,
                alignItems: 'center',
                shadowColor: getStatusColor(),
                shadowOffset: { width: 0, height: 8 },
                shadowOpacity: 0.3,
                shadowRadius: 15,
                elevation: 8,
              }}
            >
              <Text style={{ fontSize: 18, fontWeight: '600', color: '#ffffff' }}>
                {isConnecting ? 'Connecting...' : isConnected ? 'Disconnect' : 'Connect Now'}
              </Text>
            </TouchableOpacity>
          </Animated.View>

          {connectionError && (
            <Text style={{ color: colors.danger, textAlign: 'center', marginTop: 10 }}>
              {connectionError}
            </Text>
          )}
        </View>

        {/* Quick Actions */}
        <View style={{ marginBottom: 30 }}>
          <Text style={{ fontSize: 20, fontWeight: '600', color: colors.text, marginBottom: 15 }}>
            Quick Actions
          </Text>
          <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
            <TouchableOpacity
              style={{
                flex: 1,
                backgroundColor: colors.surface,
                borderRadius: 15,
                padding: 20,
                marginRight: 10,
                alignItems: 'center',
                shadowColor: isDarkMode ? '#000' : '#000',
                shadowOffset: { width: 0, height: 5 },
                shadowOpacity: isDarkMode ? 0.2 : 0.1,
                shadowRadius: 10,
                elevation: 5,
              }}
            >
              <Icon name="server-network" size={30} color={colors.primary} style={{ marginBottom: 10 }} />
              <Text style={{ fontSize: 14, fontWeight: '500', color: colors.text }}>
                Best Server
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={{
                flex: 1,
                backgroundColor: colors.surface,
                borderRadius: 15,
                padding: 20,
                marginLeft: 10,
                alignItems: 'center',
                shadowColor: isDarkMode ? '#000' : '#000',
                shadowOffset: { width: 0, height: 5 },
                shadowOpacity: isDarkMode ? 0.2 : 0.1,
                shadowRadius: 10,
                elevation: 5,
              }}
            >
              <Icon name="speedometer" size={30} color={colors.primary} style={{ marginBottom: 10 }} />
              <Text style={{ fontSize: 14, fontWeight: '500', color: colors.text }}>
                Speed Test
              </Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Premium Features */}
        {!isPremium && (
          <View
            style={{
              backgroundColor: colors.primary,
              borderRadius: 15,
              padding: 20,
              marginBottom: 20,
            }}
          >
            <Text style={{ fontSize: 18, fontWeight: '600', color: '#ffffff', marginBottom: 10 }}>
              Upgrade to Premium
            </Text>
            <Text style={{ fontSize: 14, color: '#ffffff', opacity: 0.9, marginBottom: 15 }}>
              Get unlimited bandwidth, ad-blocker, and priority support
            </Text>
            <TouchableOpacity
              style={{
                backgroundColor: '#ffffff',
                borderRadius: 10,
                paddingVertical: 12,
                paddingHorizontal: 20,
                alignSelf: 'flex-start',
              }}
            >
              <Text style={{ fontSize: 14, fontWeight: '600', color: colors.primary }}>
                Upgrade Now
              </Text>
            </TouchableOpacity>
          </View>
        )}

        {/* Connection Info */}
        <View
          style={{
            backgroundColor: colors.surface,
            borderRadius: 15,
            padding: 20,
            shadowColor: isDarkMode ? '#000' : '#000',
            shadowOffset: { width: 0, height: 5 },
            shadowOpacity: isDarkMode ? 0.2 : 0.1,
            shadowRadius: 10,
            elevation: 5,
          }}
        >
          <Text style={{ fontSize: 16, fontWeight: '600', color: colors.text, marginBottom: 15 }}>
            Connection Info
          </Text>
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 10 }}>
            <Text style={{ fontSize: 14, color: colors.textSecondary }}>Protocol:</Text>
            <Text style={{ fontSize: 14, color: colors.text, fontWeight: '500' }}>WireGuard</Text>
          </View>
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 10 }}>
            <Text style={{ fontSize: 14, color: colors.textSecondary }}>Encryption:</Text>
            <Text style={{ fontSize: 14, color: colors.text, fontWeight: '500' }}>ChaCha20</Text>
          </View>
          <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
            <Text style={{ fontSize: 14, color: colors.textSecondary }}>Kill Switch:</Text>
            <Text style={{ fontSize: 14, color: colors.text, fontWeight: '500' }}>Enabled</Text>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

export default HomeScreen;