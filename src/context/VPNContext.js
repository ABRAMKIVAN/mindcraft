import React, { createContext, useContext, useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import NetInfo from '@react-native-netinfo/netinfo';

const VPNContext = createContext();

export const useVPN = () => {
  const context = useContext(VPNContext);
  if (!context) {
    throw new Error('useVPN must be used within a VPNProvider');
  }
  return context;
};

export const VPNProvider = ({ children }) => {
  const [isConnected, setIsConnected] = useState(false);
  const [currentServer, setCurrentServer] = useState(null);
  const [selectedProtocol, setSelectedProtocol] = useState('wireguard');
  const [connectionSpeed, setConnectionSpeed] = useState(0);
  const [currentIP, setCurrentIP] = useState('');
  const [killSwitch, setKillSwitch] = useState(false);
  const [autoProtocol, setAutoProtocol] = useState(true);
  const [isConnecting, setIsConnecting] = useState(false);
  const [connectionError, setConnectionError] = useState(null);

  // Available protocols
  const protocols = [
    { id: 'wireguard', name: 'WireGuard', description: 'Fast & Secure', icon: 'shield-check' },
    { id: 'shadowsocks', name: 'ShadowSocks', description: 'Obfuscation', icon: 'eye-off' },
    { id: 'vless', name: 'VLESS+Reality', description: 'Anti-Detection', icon: 'incognito' },
  ];

  // Mock server list
  const servers = [
    { id: 1, name: 'United States', country: 'US', city: 'New York', ip: '192.168.1.1', ping: 45, load: 65, protocols: ['wireguard', 'shadowsocks', 'vless'] },
    { id: 2, name: 'United Kingdom', country: 'UK', city: 'London', ip: '192.168.1.2', ping: 52, load: 45, protocols: ['wireguard', 'shadowsocks'] },
    { id: 3, name: 'Japan', country: 'JP', city: 'Tokyo', ip: '192.168.1.3', ping: 78, load: 30, protocols: ['wireguard', 'vless'] },
    { id: 4, name: 'Germany', country: 'DE', city: 'Frankfurt', ip: '192.168.1.4', ping: 38, load: 55, protocols: ['wireguard', 'shadowsocks', 'vless'] },
    { id: 5, name: 'Singapore', country: 'SG', city: 'Singapore', ip: '192.168.1.5', ping: 120, load: 25, protocols: ['wireguard', 'shadowsocks'] },
  ];

  useEffect(() => {
    loadVPNSettings();
    checkCurrentIP();
    const unsubscribe = NetInfo.addEventListener(state => {
      if (!state.isConnected && isConnected) {
        handleDisconnect();
      }
    });

    return () => unsubscribe();
  }, []);

  const loadVPNSettings = async () => {
    try {
      const savedProtocol = await AsyncStorage.getItem('selectedProtocol');
      const savedKillSwitch = await AsyncStorage.getItem('killSwitch');
      const savedAutoProtocol = await AsyncStorage.getItem('autoProtocol');

      if (savedProtocol) setSelectedProtocol(savedProtocol);
      if (savedKillSwitch) setKillSwitch(savedKillSwitch === 'true');
      if (savedAutoProtocol) setAutoProtocol(savedAutoProtocol === 'true');
    } catch (error) {
      console.error('Error loading VPN settings:', error);
    }
  };

  const checkCurrentIP = async () => {
    try {
      const response = await fetch('https://api.ipify.org?format=json');
      const data = await response.json();
      setCurrentIP(data.ip);
    } catch (error) {
      console.error('Error checking IP:', error);
      setCurrentIP('Unknown');
    }
  };

  const connect = async (server = null) => {
    setIsConnecting(true);
    setConnectionError(null);

    try {
      const targetServer = server || getBestServer();
      
      // Simulate connection process
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      setCurrentServer(targetServer);
      setIsConnected(true);
      setIsConnecting(false);
      
      // Simulate speed test
      simulateSpeedTest();
      
      // Save connection state
      await AsyncStorage.setItem('currentServer', JSON.stringify(targetServer));
      await AsyncStorage.setItem('isConnected', 'true');
      
    } catch (error) {
      setConnectionError('Connection failed. Please try again.');
      setIsConnecting(false);
    }
  };

  const disconnect = async () => {
    try {
      // Simulate disconnection
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      setIsConnected(false);
      setCurrentServer(null);
      setConnectionSpeed(0);
      
      await AsyncStorage.removeItem('currentServer');
      await AsyncStorage.setItem('isConnected', 'false');
      
    } catch (error) {
      console.error('Error disconnecting:', error);
    }
  };

  const handleDisconnect = () => {
    if (killSwitch) {
      // Implement kill switch logic here
      console.log('Kill switch activated - blocking internet access');
    }
    disconnect();
  };

  const getBestServer = () => {
    // Simple algorithm to find best server based on ping and load
    return servers.reduce((best, server) => {
      const score = (100 - server.ping) * 0.7 + (100 - server.load) * 0.3;
      const bestScore = best ? (100 - best.ping) * 0.7 + (100 - best.load) * 0.3 : 0;
      return score > bestScore ? server : best;
    }, null);
  };

  const simulateSpeedTest = () => {
    const interval = setInterval(() => {
      const speed = Math.random() * 100 + 50; // 50-150 Mbps
      setConnectionSpeed(speed);
    }, 5000);

    setTimeout(() => clearInterval(interval), 30000);
  };

  const updateProtocol = async (protocol) => {
    setSelectedProtocol(protocol);
    await AsyncStorage.setItem('selectedProtocol', protocol);
  };

  const updateKillSwitch = async (enabled) => {
    setKillSwitch(enabled);
    await AsyncStorage.setItem('killSwitch', enabled.toString());
  };

  const updateAutoProtocol = async (enabled) => {
    setAutoProtocol(enabled);
    await AsyncStorage.setItem('autoProtocol', enabled.toString());
  };

  const pingServer = async (server) => {
    // Simulate ping test
    return new Promise(resolve => {
      setTimeout(() => {
        resolve(Math.floor(Math.random() * 50) + 20);
      }, 1000);
    });
  };

  const value = {
    isConnected,
    isConnecting,
    currentServer,
    selectedProtocol,
    connectionSpeed,
    currentIP,
    killSwitch,
    autoProtocol,
    connectionError,
    protocols,
    servers,
    connect,
    disconnect,
    updateProtocol,
    updateKillSwitch,
    updateAutoProtocol,
    pingServer,
    getBestServer,
  };

  return (
    <VPNContext.Provider value={value}>
      {children}
    </VPNContext.Provider>
  );
};