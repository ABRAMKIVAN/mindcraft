import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  FlatList,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { useTheme } from '../context/ThemeContext';
import { useVPN } from '../context/VPNContext';

const ServersScreen = () => {
  const { colors, isDarkMode } = useTheme();
  const {
    servers,
    currentServer,
    isConnected,
    selectedProtocol,
    connect,
    disconnect,
    pingServer,
    updateProtocol,
  } = useVPN();

  const [sortedServers, setSortedServers] = useState([]);
  const [sortBy, setSortBy] = useState('ping'); // ping, load, name
  const [filterProtocol, setFilterProtocol] = useState('all');
  const [pingingServers, setPingingServers] = useState(new Set());

  useEffect(() => {
    sortAndFilterServers();
  }, [servers, sortBy, filterProtocol]);

  const sortAndFilterServers = () => {
    let filtered = [...servers];

    // Filter by protocol
    if (filterProtocol !== 'all') {
      filtered = filtered.filter(server => 
        server.protocols.includes(filterProtocol)
      );
    }

    // Sort servers
    filtered.sort((a, b) => {
      switch (sortBy) {
        case 'ping':
          return a.ping - b.ping;
        case 'load':
          return a.load - b.load;
        case 'name':
          return a.name.localeCompare(b.name);
        default:
          return 0;
      }
    });

    setSortedServers(filtered);
  };

  const handleServerPress = async (server) => {
    if (isConnected && currentServer && currentServer.id === server.id) {
      await disconnect();
    } else {
      try {
        await connect(server);
      } catch (error) {
        Alert.alert('Connection Error', 'Failed to connect to server. Please try again.');
      }
    }
  };

  const handlePingServer = async (server) => {
    if (pingingServers.has(server.id)) return;

    setPingingServers(prev => new Set(prev).add(server.id));
    
    try {
      const ping = await pingServer(server);
      // Update server ping in the list (in a real app, this would update the context)
      console.log(`Ping to ${server.name}: ${ping}ms`);
    } catch (error) {
      console.error('Ping failed:', error);
    } finally {
      setPingingServers(prev => {
        const newSet = new Set(prev);
        newSet.delete(server.id);
        return newSet;
      });
    }
  };

  const getServerStatus = (server) => {
    if (isConnected && currentServer && currentServer.id === server.id) {
      return 'connected';
    }
    return 'available';
  };

  const getStatusColor = (server) => {
    const status = getServerStatus(server);
    switch (status) {
      case 'connected':
        return colors.success;
      case 'available':
        return colors.primary;
      default:
        return colors.textSecondary;
    }
  };

  const renderServerItem = ({ item: server }) => {
    const status = getServerStatus(server);
    const isCurrentServer = currentServer && currentServer.id === server.id;

    return (
      <TouchableOpacity
        onPress={() => handleServerPress(server)}
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
          borderWidth: isCurrentServer && isConnected ? 2 : 0,
          borderColor: colors.success,
        }}
      >
        <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
          <View style={{ flex: 1 }}>
            <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 8 }}>
              <Icon
                name={status === 'connected' ? 'shield-check' : 'server'}
                size={24}
                color={getStatusColor(server)}
                style={{ marginRight: 12 }}
              />
              <View style={{ flex: 1 }}>
                <Text style={{ fontSize: 16, fontWeight: '600', color: colors.text }}>
                  {server.name}
                </Text>
                <Text style={{ fontSize: 14, color: colors.textSecondary }}>
                  {server.city}, {server.country}
                </Text>
              </View>
            </View>

            <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
              <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                <View style={{ marginRight: 20 }}>
                  <Text style={{ fontSize: 12, color: colors.textSecondary, marginBottom: 2 }}>
                    Ping
                  </Text>
                  <Text style={{ fontSize: 14, fontWeight: '500', color: colors.text }}>
                    {pingingServers.has(server.id) ? (
                      <ActivityIndicator size="small" color={colors.primary} />
                    ) : (
                      `${server.ping}ms`
                    )}
                  </Text>
                </View>
                <View style={{ marginRight: 20 }}>
                  <Text style={{ fontSize: 12, color: colors.textSecondary, marginBottom: 2 }}>
                    Load
                  </Text>
                  <Text style={{ fontSize: 14, fontWeight: '500', color: colors.text }}>
                    {server.load}%
                  </Text>
                </View>
                <View>
                  <Text style={{ fontSize: 12, color: colors.textSecondary, marginBottom: 2 }}>
                    IP
                  </Text>
                  <Text style={{ fontSize: 14, fontWeight: '500', color: colors.text }}>
                    {server.ip}
                  </Text>
                </View>
              </View>

              <View style={{ alignItems: 'flex-end' }}>
                <TouchableOpacity
                  onPress={() => handlePingServer(server)}
                  disabled={pingingServers.has(server.id)}
                  style={{
                    padding: 8,
                    borderRadius: 8,
                    backgroundColor: colors.border,
                    marginBottom: 8,
                  }}
                >
                  <Icon
                    name="speedometer"
                    size={16}
                    color={colors.primary}
                  />
                </TouchableOpacity>
                <View style={{ flexDirection: 'row' }}>
                  {server.protocols.map((protocol, index) => (
                    <View
                      key={protocol}
                      style={{
                        width: 8,
                        height: 8,
                        borderRadius: 4,
                        backgroundColor: protocol === selectedProtocol ? colors.primary : colors.border,
                        marginLeft: index > 0 ? 4 : 0,
                      }}
                    />
                  ))}
                </View>
              </View>
            </View>
          </View>
        </View>

        {status === 'connected' && (
          <View
            style={{
              position: 'absolute',
              top: 10,
              right: 10,
              backgroundColor: colors.success,
              borderRadius: 12,
              paddingHorizontal: 8,
              paddingVertical: 4,
            }}
          >
            <Text style={{ fontSize: 10, fontWeight: '600', color: '#ffffff' }}>
              CONNECTED
            </Text>
          </View>
        )}
      </TouchableOpacity>
    );
  };

  const renderSortButton = (title, value) => (
    <TouchableOpacity
      onPress={() => setSortBy(value)}
      style={{
        backgroundColor: sortBy === value ? colors.primary : colors.surface,
        borderRadius: 10,
        paddingHorizontal: 15,
        paddingVertical: 8,
        marginRight: 10,
        shadowColor: isDarkMode ? '#000' : '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: isDarkMode ? 0.2 : 0.1,
        shadowRadius: 5,
        elevation: 3,
      }}
    >
      <Text
        style={{
          fontSize: 12,
          fontWeight: '600',
          color: sortBy === value ? '#ffffff' : colors.text,
        }}
      >
        {title}
      </Text>
    </TouchableOpacity>
  );

  const renderProtocolFilter = (protocol) => (
    <TouchableOpacity
      onPress={() => setFilterProtocol(protocol.id)}
      style={{
        backgroundColor: filterProtocol === protocol.id ? colors.primary : colors.surface,
        borderRadius: 10,
        paddingHorizontal: 15,
        paddingVertical: 8,
        marginRight: 10,
        flexDirection: 'row',
        alignItems: 'center',
        shadowColor: isDarkMode ? '#000' : '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: isDarkMode ? 0.2 : 0.1,
        shadowRadius: 5,
        elevation: 3,
      }}
    >
      <Icon
        name={protocol.icon}
        size={16}
        color={filterProtocol === protocol.id ? '#ffffff' : colors.text}
        style={{ marginRight: 6 }}
      />
      <Text
        style={{
          fontSize: 12,
          fontWeight: '600',
          color: filterProtocol === protocol.id ? '#ffffff' : colors.text,
        }}
      >
        {protocol.name}
      </Text>
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.background }}>
      {/* Header */}
      <View style={{ padding: 20, paddingBottom: 10 }}>
        <Text style={{ fontSize: 24, fontWeight: 'bold', color: colors.text, marginBottom: 5 }}>
          Servers
        </Text>
        <Text style={{ fontSize: 14, color: colors.textSecondary }}>
          Choose from {sortedServers.length} available servers
        </Text>
      </View>

      {/* Sort Options */}
      <View style={{ paddingHorizontal: 20, marginBottom: 15 }}>
        <Text style={{ fontSize: 14, fontWeight: '600', color: colors.text, marginBottom: 10 }}>
          Sort by:
        </Text>
        <View style={{ flexDirection: 'row' }}>
          {renderSortButton('Ping', 'ping')}
          {renderSortButton('Load', 'load')}
          {renderSortButton('Name', 'name')}
        </View>
      </View>

      {/* Protocol Filter */}
      <View style={{ paddingHorizontal: 20, marginBottom: 20 }}>
        <Text style={{ fontSize: 14, fontWeight: '600', color: colors.text, marginBottom: 10 }}>
          Protocol:
        </Text>
        <View style={{ flexDirection: 'row' }}>
          <TouchableOpacity
            onPress={() => setFilterProtocol('all')}
            style={{
              backgroundColor: filterProtocol === 'all' ? colors.primary : colors.surface,
              borderRadius: 10,
              paddingHorizontal: 15,
              paddingVertical: 8,
              marginRight: 10,
              shadowColor: isDarkMode ? '#000' : '#000',
              shadowOffset: { width: 0, height: 2 },
              shadowOpacity: isDarkMode ? 0.2 : 0.1,
              shadowRadius: 5,
              elevation: 3,
            }}
          >
            <Text
              style={{
                fontSize: 12,
                fontWeight: '600',
                color: filterProtocol === 'all' ? '#ffffff' : colors.text,
              }}
            >
              All
            </Text>
          </TouchableOpacity>
          {[
            { id: 'wireguard', name: 'WireGuard', icon: 'shield-check' },
            { id: 'shadowsocks', name: 'ShadowSocks', icon: 'eye-off' },
            { id: 'vless', name: 'VLESS', icon: 'incognito' },
          ].map(renderProtocolFilter)}
        </View>
      </View>

      {/* Server List */}
      <FlatList
        data={sortedServers}
        renderItem={renderServerItem}
        keyExtractor={(item) => item.id.toString()}
        contentContainerStyle={{ padding: 20, paddingTop: 0 }}
        showsVerticalScrollIndicator={false}
      />
    </SafeAreaView>
  );
};

export default ServersScreen;