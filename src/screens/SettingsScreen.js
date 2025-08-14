import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  Switch,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { useTheme } from '../context/ThemeContext';
import { useVPN } from '../context/VPNContext';
import { useAuth } from '../context/AuthContext';

const SettingsScreen = () => {
  const { colors, isDarkMode, toggleTheme } = useTheme();
  const {
    selectedProtocol,
    protocols,
    killSwitch,
    autoProtocol,
    updateProtocol,
    updateKillSwitch,
    updateAutoProtocol,
  } = useVPN();
  const { user, signOut, isPremium } = useAuth();

  const [dnsProtection, setDnsProtection] = useState(true);
  const [notifications, setNotifications] = useState(true);
  const [autoConnect, setAutoConnect] = useState(false);

  const handleSignOut = () => {
    Alert.alert(
      'Sign Out',
      'Are you sure you want to sign out?',
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Sign Out', style: 'destructive', onPress: signOut },
      ]
    );
  };

  const renderSettingItem = ({ icon, title, subtitle, value, onPress, type = 'button' }) => (
    <TouchableOpacity
      onPress={onPress}
      style={{
        backgroundColor: colors.surface,
        borderRadius: 15,
        padding: 20,
        marginBottom: 15,
        flexDirection: 'row',
        alignItems: 'center',
        shadowColor: isDarkMode ? '#000' : '#000',
        shadowOffset: { width: 0, height: 5 },
        shadowOpacity: isDarkMode ? 0.2 : 0.1,
        shadowRadius: 10,
        elevation: 5,
      }}
    >
      <View
        style={{
          width: 40,
          height: 40,
          borderRadius: 20,
          backgroundColor: colors.primary,
          justifyContent: 'center',
          alignItems: 'center',
          marginRight: 15,
        }}
      >
        <Icon name={icon} size={20} color="#ffffff" />
      </View>
      <View style={{ flex: 1 }}>
        <Text style={{ fontSize: 16, fontWeight: '600', color: colors.text, marginBottom: 2 }}>
          {title}
        </Text>
        {subtitle && (
          <Text style={{ fontSize: 14, color: colors.textSecondary }}>
            {subtitle}
          </Text>
        )}
      </View>
      {type === 'switch' ? (
        <Switch
          value={value}
          onValueChange={onPress}
          trackColor={{ false: colors.border, true: colors.primary }}
          thumbColor="#ffffff"
        />
      ) : (
        <View style={{ flexDirection: 'row', alignItems: 'center' }}>
          <Text style={{ fontSize: 14, color: colors.textSecondary, marginRight: 8 }}>
            {value}
          </Text>
          <Icon name="chevron-right" size={20} color={colors.textSecondary} />
        </View>
      )}
    </TouchableOpacity>
  );

  const renderProtocolOption = (protocol) => (
    <TouchableOpacity
      key={protocol.id}
      onPress={() => updateProtocol(protocol.id)}
      style={{
        backgroundColor: selectedProtocol === protocol.id ? colors.primary : colors.surface,
        borderRadius: 12,
        padding: 15,
        marginBottom: 10,
        flexDirection: 'row',
        alignItems: 'center',
        shadowColor: isDarkMode ? '#000' : '#000',
        shadowOffset: { width: 0, height: 3 },
        shadowOpacity: isDarkMode ? 0.2 : 0.1,
        shadowRadius: 8,
        elevation: 3,
      }}
    >
      <Icon
        name={protocol.icon}
        size={24}
        color={selectedProtocol === protocol.id ? '#ffffff' : colors.primary}
        style={{ marginRight: 12 }}
      />
      <View style={{ flex: 1 }}>
        <Text
          style={{
            fontSize: 16,
            fontWeight: '600',
            color: selectedProtocol === protocol.id ? '#ffffff' : colors.text,
            marginBottom: 2,
          }}
        >
          {protocol.name}
        </Text>
        <Text
          style={{
            fontSize: 14,
            color: selectedProtocol === protocol.id ? '#ffffff' : colors.textSecondary,
          }}
        >
          {protocol.description}
        </Text>
      </View>
      {selectedProtocol === protocol.id && (
        <Icon name="check-circle" size={24} color="#ffffff" />
      )}
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.background }}>
      <ScrollView
        contentContainerStyle={{ padding: 20 }}
        showsVerticalScrollIndicator={false}
      >
        {/* Header */}
        <View style={{ marginBottom: 30 }}>
          <Text style={{ fontSize: 28, fontWeight: 'bold', color: colors.text, marginBottom: 5 }}>
            Settings
          </Text>
          <Text style={{ fontSize: 16, color: colors.textSecondary }}>
            Customize your VPN experience
          </Text>
        </View>

        {/* Protocol Selection */}
        <View style={{ marginBottom: 30 }}>
          <Text style={{ fontSize: 18, fontWeight: '600', color: colors.text, marginBottom: 15 }}>
            VPN Protocol
          </Text>
          {protocols.map(renderProtocolOption)}
        </View>

        {/* Connection Settings */}
        <View style={{ marginBottom: 30 }}>
          <Text style={{ fontSize: 18, fontWeight: '600', color: colors.text, marginBottom: 15 }}>
            Connection Settings
          </Text>
          {renderSettingItem({
            icon: 'shield-off',
            title: 'Kill Switch',
            subtitle: 'Block internet if VPN disconnects',
            value: killSwitch,
            onPress: () => updateKillSwitch(!killSwitch),
            type: 'switch',
          })}
          {renderSettingItem({
            icon: 'auto-fix',
            title: 'Auto Protocol',
            subtitle: 'Automatically select best protocol',
            value: autoProtocol,
            onPress: () => updateAutoProtocol(!autoProtocol),
            type: 'switch',
          })}
          {renderSettingItem({
            icon: 'dns',
            title: 'DNS Protection',
            subtitle: 'Use secure DNS servers',
            value: dnsProtection,
            onPress: () => setDnsProtection(!dnsProtection),
            type: 'switch',
          })}
          {renderSettingItem({
            icon: 'bell',
            title: 'Notifications',
            subtitle: 'Connection alerts and updates',
            value: notifications,
            onPress: () => setNotifications(!notifications),
            type: 'switch',
          })}
          {renderSettingItem({
            icon: 'wifi',
            title: 'Auto Connect',
            subtitle: 'Connect to VPN on startup',
            value: autoConnect,
            onPress: () => setAutoConnect(!autoConnect),
            type: 'switch',
          })}
        </View>

        {/* App Settings */}
        <View style={{ marginBottom: 30 }}>
          <Text style={{ fontSize: 18, fontWeight: '600', color: colors.text, marginBottom: 15 }}>
            App Settings
          </Text>
          {renderSettingItem({
            icon: 'theme-light-dark',
            title: 'Dark Mode',
            subtitle: 'Switch between light and dark themes',
            value: isDarkMode ? 'On' : 'Off',
            onPress: toggleTheme,
          })}
          {renderSettingItem({
            icon: 'information',
            title: 'About',
            subtitle: 'App version and information',
            value: 'v1.0.0',
            onPress: () => Alert.alert('About', 'VPN Shield v1.0.0\nSecure VPN for everyone'),
          })}
          {renderSettingItem({
            icon: 'help-circle',
            title: 'Help & Support',
            subtitle: 'Get help and contact support',
            value: '',
            onPress: () => Alert.alert('Support', 'Contact us at support@vpnshield.com'),
          })}
        </View>

        {/* Premium Features */}
        {!isPremium && (
          <View style={{ marginBottom: 30 }}>
            <Text style={{ fontSize: 18, fontWeight: '600', color: colors.text, marginBottom: 15 }}>
              Premium Features
            </Text>
            <View
              style={{
                backgroundColor: colors.primary,
                borderRadius: 15,
                padding: 20,
                shadowColor: colors.primary,
                shadowOffset: { width: 0, height: 8 },
                shadowOpacity: 0.3,
                shadowRadius: 15,
                elevation: 8,
              }}
            >
              <Text style={{ fontSize: 18, fontWeight: '600', color: '#ffffff', marginBottom: 10 }}>
                Upgrade to Premium
              </Text>
              <Text style={{ fontSize: 14, color: '#ffffff', opacity: 0.9, marginBottom: 15 }}>
                • Unlimited bandwidth\n• Ad-blocker\n• Priority support\n• Advanced features
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
          </View>
        )}

        {/* Account */}
        <View style={{ marginBottom: 30 }}>
          <Text style={{ fontSize: 18, fontWeight: '600', color: colors.text, marginBottom: 15 }}>
            Account
          </Text>
          {user ? (
            <>
              <View
                style={{
                  backgroundColor: colors.surface,
                  borderRadius: 15,
                  padding: 20,
                  marginBottom: 15,
                  shadowColor: isDarkMode ? '#000' : '#000',
                  shadowOffset: { width: 0, height: 5 },
                  shadowOpacity: isDarkMode ? 0.2 : 0.1,
                  shadowRadius: 10,
                  elevation: 5,
                }}
              >
                <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                  <View
                    style={{
                      width: 50,
                      height: 50,
                      borderRadius: 25,
                      backgroundColor: colors.primary,
                      justifyContent: 'center',
                      alignItems: 'center',
                      marginRight: 15,
                    }}
                  >
                    <Icon name="account" size={24} color="#ffffff" />
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text style={{ fontSize: 16, fontWeight: '600', color: colors.text }}>
                      {user.email || 'Anonymous User'}
                    </Text>
                    <Text style={{ fontSize: 14, color: colors.textSecondary }}>
                      {isPremium ? 'Premium User' : 'Free User'}
                    </Text>
                  </View>
                </View>
              </View>
              {renderSettingItem({
                icon: 'account-edit',
                title: 'Edit Profile',
                subtitle: 'Update your account information',
                value: '',
                onPress: () => Alert.alert('Profile', 'Profile editing coming soon'),
              })}
              {renderSettingItem({
                icon: 'logout',
                title: 'Sign Out',
                subtitle: 'Sign out of your account',
                value: '',
                onPress: handleSignOut,
              })}
            </>
          ) : (
            renderSettingItem({
              icon: 'login',
              title: 'Sign In',
              subtitle: 'Sign in to sync settings',
              value: '',
              onPress: () => Alert.alert('Sign In', 'Sign in functionality coming soon'),
            })
          )}
        </View>

        {/* Legal */}
        <View style={{ marginBottom: 30 }}>
          <Text style={{ fontSize: 18, fontWeight: '600', color: colors.text, marginBottom: 15 }}>
            Legal
          </Text>
          {renderSettingItem({
            icon: 'file-document',
            title: 'Privacy Policy',
            subtitle: 'How we protect your data',
            value: '',
            onPress: () => Alert.alert('Privacy Policy', 'Privacy policy coming soon'),
          })}
          {renderSettingItem({
            icon: 'file-document-outline',
            title: 'Terms of Service',
            subtitle: 'Terms and conditions',
            value: '',
            onPress: () => Alert.alert('Terms of Service', 'Terms of service coming soon'),
          })}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

export default SettingsScreen;