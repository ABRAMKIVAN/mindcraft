import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  Dimensions,
  Animated,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import MapView, { Marker, PROVIDER_GOOGLE } from 'react-native-maps';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { useTheme } from '../context/ThemeContext';
import { useVPN } from '../context/VPNContext';

const { width, height } = Dimensions.get('window');

const MapScreen = () => {
  const { colors, isDarkMode } = useTheme();
  const { servers, currentServer, isConnected, connect } = useVPN();
  const mapRef = useRef(null);
  const [selectedServer, setSelectedServer] = useState(null);
  const [userLocation, setUserLocation] = useState({
    latitude: 40.7128,
    longitude: -74.0060,
  });

  // Server coordinates (mock data)
  const serverCoordinates = {
    1: { latitude: 40.7128, longitude: -74.0060, name: 'New York' },
    2: { latitude: 51.5074, longitude: -0.1278, name: 'London' },
    3: { latitude: 35.6762, longitude: 139.6503, name: 'Tokyo' },
    4: { latitude: 50.1109, longitude: 8.6821, name: 'Frankfurt' },
    5: { latitude: 1.3521, longitude: 103.8198, name: 'Singapore' },
  };

  const handleServerPress = (server) => {
    setSelectedServer(server);
    if (mapRef.current) {
      mapRef.current.animateToRegion({
        latitude: serverCoordinates[server.id].latitude,
        longitude: serverCoordinates[server.id].longitude,
        latitudeDelta: 10,
        longitudeDelta: 10,
      });
    }
  };

  const handleConnectToServer = async (server) => {
    try {
      await connect(server);
      setSelectedServer(null);
    } catch (error) {
      Alert.alert('Connection Error', 'Failed to connect to server. Please try again.');
    }
  };

  const getMarkerColor = (server) => {
    if (currentServer && currentServer.id === server.id && isConnected) {
      return colors.success;
    }
    return colors.primary;
  };

  const getMarkerSize = (server) => {
    if (currentServer && currentServer.id === server.id && isConnected) {
      return 20;
    }
    return 15;
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.background }}>
      {/* Header */}
      <View style={{ padding: 20, paddingBottom: 10 }}>
        <Text style={{ fontSize: 24, fontWeight: 'bold', color: colors.text, marginBottom: 5 }}>
          World Map
        </Text>
        <Text style={{ fontSize: 14, color: colors.textSecondary }}>
          Select a server location to connect
        </Text>
      </View>

      {/* Map Container */}
      <View style={{ flex: 1, margin: 20, marginTop: 0 }}>
        <MapView
          ref={mapRef}
          provider={PROVIDER_GOOGLE}
          style={{ flex: 1, borderRadius: 20 }}
          initialRegion={{
            latitude: 20,
            longitude: 0,
            latitudeDelta: 80,
            longitudeDelta: 80,
          }}
          mapType="standard"
          showsUserLocation={true}
          showsMyLocationButton={true}
          showsCompass={true}
          showsScale={true}
          showsTraffic={false}
          showsBuildings={false}
          showsIndoors={false}
          showsIndoorLevelPicker={false}
          showsPointsOfInterest={false}
          showsUserLocationButton={true}
          customMapStyle={[
            {
              featureType: 'all',
              elementType: 'geometry',
              stylers: [
                {
                  saturation: -100,
                },
                {
                  lightness: 50,
                },
              ],
            },
            {
              featureType: 'water',
              elementType: 'geometry',
              stylers: [
                {
                  color: '#e9e9e9',
                },
                {
                  lightness: 17,
                },
              ],
            },
            {
              featureType: 'landscape',
              elementType: 'geometry',
              stylers: [
                {
                  color: '#f5f5f5',
                },
                {
                  lightness: 20,
                },
              ],
            },
            {
              featureType: 'road.highway',
              elementType: 'geometry.fill',
              stylers: [
                {
                  color: '#ffffff',
                },
                {
                  lightness: 17,
                },
              ],
            },
            {
              featureType: 'road.highway',
              elementType: 'geometry.stroke',
              stylers: [
                {
                  color: '#ffffff',
                },
                {
                  lightness: 29,
                },
                {
                  weight: 0.2,
                },
              ],
            },
            {
              featureType: 'road.arterial',
              elementType: 'geometry',
              stylers: [
                {
                  color: '#ffffff',
                },
                {
                  lightness: 18,
                },
              ],
            },
            {
              featureType: 'road.local',
              elementType: 'geometry',
              stylers: [
                {
                  color: '#ffffff',
                },
                {
                  lightness: 16,
                },
              ],
            },
            {
              featureType: 'poi',
              elementType: 'geometry',
              stylers: [
                {
                  color: '#f5f5f5',
                },
                {
                  lightness: 21,
                },
              ],
            },
            {
              featureType: 'poi.park',
              elementType: 'geometry',
              stylers: [
                {
                  color: '#dedede',
                },
                {
                  lightness: 21,
                },
              ],
            },
            {
              elementType: 'labels.text.stroke',
              stylers: [
                {
                  visibility: 'on',
                },
                {
                  color: '#ffffff',
                },
                {
                  lightness: 16,
                },
              ],
            },
            {
              elementType: 'labels.text.fill',
              stylers: [
                {
                  saturation: 36,
                },
                {
                  color: '#333333',
                },
                {
                  lightness: 40,
                },
              ],
            },
            {
              elementType: 'labels.icon',
              stylers: [
                {
                  visibility: 'off',
                },
              ],
            },
            {
              featureType: 'transit',
              elementType: 'geometry',
              stylers: [
                {
                  color: '#f2f2f2',
                },
                {
                  lightness: 19,
                },
              ],
            },
            {
              featureType: 'administrative',
              elementType: 'geometry.fill',
              stylers: [
                {
                  color: '#fefefe',
                },
                {
                  lightness: 20,
                },
              ],
            },
            {
              featureType: 'administrative',
              elementType: 'geometry.stroke',
              stylers: [
                {
                  color: '#fefefe',
                },
                {
                  lightness: 17,
                },
                {
                  weight: 1.2,
                },
              ],
            },
          ]}
        >
          {/* Server Markers */}
          {servers.map((server) => {
            const coords = serverCoordinates[server.id];
            if (!coords) return null;

            return (
              <Marker
                key={server.id}
                coordinate={coords}
                onPress={() => handleServerPress(server)}
              >
                <View
                  style={{
                    width: getMarkerSize(server),
                    height: getMarkerSize(server),
                    borderRadius: getMarkerSize(server) / 2,
                    backgroundColor: getMarkerColor(server),
                    justifyContent: 'center',
                    alignItems: 'center',
                    shadowColor: getMarkerColor(server),
                    shadowOffset: { width: 0, height: 4 },
                    shadowOpacity: 0.3,
                    shadowRadius: 8,
                    elevation: 8,
                  }}
                >
                  <Icon
                    name="server"
                    size={getMarkerSize(server) * 0.6}
                    color="#ffffff"
                  />
                </View>
              </Marker>
            );
          })}

          {/* Connection Line */}
          {currentServer && isConnected && userLocation && (
            <MapView.Polyline
              coordinates={[
                userLocation,
                serverCoordinates[currentServer.id],
              ]}
              strokeColor={colors.success}
              strokeWidth={3}
              lineDashPattern={[10, 5]}
            />
          )}
        </MapView>
      </View>

      {/* Server Info Panel */}
      {selectedServer && (
        <View
          style={{
            position: 'absolute',
            bottom: 20,
            left: 20,
            right: 20,
            backgroundColor: colors.surface,
            borderRadius: 15,
            padding: 20,
            shadowColor: isDarkMode ? '#000' : '#000',
            shadowOffset: { width: 0, height: 10 },
            shadowOpacity: isDarkMode ? 0.3 : 0.1,
            shadowRadius: 20,
            elevation: 10,
          }}
        >
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 15 }}>
            <View>
              <Text style={{ fontSize: 18, fontWeight: '600', color: colors.text }}>
                {selectedServer.name}
              </Text>
              <Text style={{ fontSize: 14, color: colors.textSecondary }}>
                {selectedServer.city}, {selectedServer.country}
              </Text>
            </View>
            <TouchableOpacity
              onPress={() => setSelectedServer(null)}
              style={{
                width: 30,
                height: 30,
                borderRadius: 15,
                backgroundColor: colors.border,
                justifyContent: 'center',
                alignItems: 'center',
              }}
            >
              <Icon name="close" size={20} color={colors.text} />
            </TouchableOpacity>
          </View>

          <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 20 }}>
            <View style={{ alignItems: 'center' }}>
              <Text style={{ fontSize: 12, color: colors.textSecondary, marginBottom: 5 }}>
                Ping
              </Text>
              <Text style={{ fontSize: 16, fontWeight: '600', color: colors.text }}>
                {selectedServer.ping}ms
              </Text>
            </View>
            <View style={{ alignItems: 'center' }}>
              <Text style={{ fontSize: 12, color: colors.textSecondary, marginBottom: 5 }}>
                Load
              </Text>
              <Text style={{ fontSize: 16, fontWeight: '600', color: colors.text }}>
                {selectedServer.load}%
              </Text>
            </View>
            <View style={{ alignItems: 'center' }}>
              <Text style={{ fontSize: 12, color: colors.textSecondary, marginBottom: 5 }}>
                IP
              </Text>
              <Text style={{ fontSize: 16, fontWeight: '600', color: colors.text }}>
                {selectedServer.ip}
              </Text>
            </View>
          </View>

          <TouchableOpacity
            onPress={() => handleConnectToServer(selectedServer)}
            style={{
              backgroundColor: colors.primary,
              borderRadius: 10,
              paddingVertical: 15,
              alignItems: 'center',
              shadowColor: colors.primary,
              shadowOffset: { width: 0, height: 4 },
              shadowOpacity: 0.3,
              shadowRadius: 8,
              elevation: 8,
            }}
          >
            <Text style={{ fontSize: 16, fontWeight: '600', color: '#ffffff' }}>
              Connect to {selectedServer.name}
            </Text>
          </TouchableOpacity>
        </View>
      )}

      {/* Connection Status */}
      {isConnected && currentServer && (
        <View
          style={{
            position: 'absolute',
            top: 100,
            right: 20,
            backgroundColor: colors.success,
            borderRadius: 10,
            padding: 15,
            shadowColor: colors.success,
            shadowOffset: { width: 0, height: 4 },
            shadowOpacity: 0.3,
            shadowRadius: 8,
            elevation: 8,
          }}
        >
          <View style={{ flexDirection: 'row', alignItems: 'center' }}>
            <Icon name="shield-check" size={20} color="#ffffff" style={{ marginRight: 8 }} />
            <Text style={{ fontSize: 14, fontWeight: '600', color: '#ffffff' }}>
              Connected to {currentServer.name}
            </Text>
          </View>
        </View>
      )}
    </SafeAreaView>
  );
};

export default MapScreen;