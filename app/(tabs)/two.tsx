import React, { useState, useEffect } from 'react';
import { TouchableOpacity, TextInput, Alert, ScrollView, ActivityIndicator } from 'react-native';
import MapView, { Marker, PROVIDER_DEFAULT } from 'react-native-maps';
import * as Location from 'expo-location';
import { THEME, useThemeStyles } from '../../theme';
import { Text, View } from '@/components/Themed';
import { Ionicons } from '@expo/vector-icons';
import { supabase } from '@/lib/supabaseClient';

const DEFAULT_LOCATION = {
  latitude: 37.7749, // San Francisco
  longitude: -122.4194,
  latitudeDelta: 0.0922,
  longitudeDelta: 0.0421,
};

interface UserSettings {
  id?: string;
  latitude: number;
  longitude: number;
  max_solar_power: number;
  max_inverter_power: number;
}

export default function SettingsScreen() {
  const styles = useThemeStyles();
  const [mapRegion, setMapRegion] = useState(DEFAULT_LOCATION);
  const [address, setAddress] = useState('');
  const [maxSolarPower, setMaxSolarPower] = useState('5.0');
  const [maxInverterPower, setMaxInverterPower] = useState('6.0');
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [userId, setUserId] = useState<string | null>(null);
  
  // Get a reverse geocoded address from coordinates
  const getAddressFromCoordinates = async (latitude: number, longitude: number) => {
    try {
      const location = await Location.reverseGeocodeAsync({
        latitude,
        longitude
      });
      
      if (location && location.length > 0) {
        const { street, name, city, region, country, postalCode } = location[0];
        const addressComponents = [
          street || name,
          city,
          region,
          country,
          postalCode
        ].filter(Boolean);
        
        return addressComponents.join(', ');
      }
      return '';
    } catch (error) {
      console.error('Error getting address:', error);
      return '';
    }
  };

  // Search for coordinates from an address string
  const searchAddress = async () => {
    if (!address.trim()) {
      Alert.alert('Error', 'Please enter an address to search');
      return;
    }
    
    try {
      setLoading(true);
      const locations = await Location.geocodeAsync(address);
      
      if (locations && locations.length > 0) {
        const { latitude, longitude } = locations[0];
        setMapRegion({
          ...mapRegion,
          latitude,
          longitude
        });
      } else {
        Alert.alert('Not Found', 'No location found for this address');
      }
    } catch (error) {
      console.error('Error searching address:', error);
      Alert.alert('Error', 'Failed to search for this address');
    } finally {
      setLoading(false);
    }
  };

  // Get current user settings on component mount
  useEffect(() => {
    const fetchUserSettings = async () => {
      try {
        setLoading(true);
        console.log('Fetching user settings...');
        
        // Get current user
        const { data: { user }, error: userError } = await supabase.auth.getUser();
        
        if (userError || !user) {
          console.error("Error getting current user:", userError);
          setLoading(false);
          return;
        }

        console.log('User authenticated:', user.id);
        setUserId(user.id);
        
        // Get user settings - now from the users table
        const { data: userData, error: userDataError } = await supabase
          .from('users')
          .select('*')
          .eq('id', user.id)
          .single();
        
        if (userDataError) {
          console.error("Error fetching user data:", userDataError);
          setLoading(false);
          return;
        }
        
        console.log('User data retrieved:', userData);
        
        // If we have user data with settings
        if (userData) {
          // Check if the user has the required settings fields and they are not null
          if (userData.max_solar_power !== undefined && userData.max_solar_power !== null) {
            console.log('Setting max solar power:', userData.max_solar_power);
            setMaxSolarPower(userData.max_solar_power.toString());
          } else {
            console.log('Using default max solar power');
            // Keep default value
          }
          
          if (userData.max_inverter_power !== undefined && userData.max_inverter_power !== null) {
            console.log('Setting max inverter power:', userData.max_inverter_power);
            setMaxInverterPower(userData.max_inverter_power.toString());
          } else {
            console.log('Using default max inverter power');
            // Keep default value
          }
          
          if (userData.latitude && userData.longitude) {
            console.log('Setting map location:', userData.latitude, userData.longitude);
            const newRegion = {
              latitude: userData.latitude,
              longitude: userData.longitude,
              latitudeDelta: 0.01,
              longitudeDelta: 0.01,
            };
            
            setMapRegion(newRegion);
            
            // Get address for the coordinates
            const addressText = await getAddressFromCoordinates(userData.latitude, userData.longitude);
            setAddress(addressText);
          } else {
            console.log('No location data in user profile, trying to get current location');
            // No location found, try to get current location
            await getCurrentLocation();
          }
        } else {
          console.log('No user data found, trying to get current location');
          // No settings found, try to get current location
          await getCurrentLocation();
        }
      } catch (error) {
        console.error("Error in fetchUserSettings:", error);
      } finally {
        setLoading(false);
      }
    };
    
    // Helper function to get current location
    const getCurrentLocation = async () => {
      try {
        const { status } = await Location.requestForegroundPermissionsAsync();
        
        if (status === 'granted') {
          const location = await Location.getCurrentPositionAsync({});
          const { latitude, longitude } = location.coords;
          
          console.log('Current location obtained:', latitude, longitude);
          
          setMapRegion({
            latitude,
            longitude,
            latitudeDelta: 0.01,
            longitudeDelta: 0.01,
          });
          
          // Get address for current location
          const addressText = await getAddressFromCoordinates(latitude, longitude);
          setAddress(addressText);
        } else {
          console.log('Location permission denied');
        }
      } catch (error) {
        console.error('Error getting current location:', error);
      }
    };

    fetchUserSettings();
  }, []);

  // Save settings to database
  const saveSettings = async () => {
    if (!userId) {
      Alert.alert('Error', 'You must be logged in to save settings');
      return;
    }
    
    // Validate inputs
    const solarPower = parseFloat(maxSolarPower);
    const inverterPower = parseFloat(maxInverterPower);
    
    if (isNaN(solarPower) || solarPower <= 0) {
      Alert.alert('Error', 'Please enter a valid solar power value');
      return;
    }
    
    if (isNaN(inverterPower) || inverterPower <= 0) {
      Alert.alert('Error', 'Please enter a valid inverter power value');
      return;
    }
    
    try {
      setSaving(true);
      console.log('Saving user settings:', {
        userId,
        latitude: mapRegion.latitude,
        longitude: mapRegion.longitude,
        max_solar_power: solarPower,
        max_inverter_power: inverterPower
      });
      
      // Update user data with settings
      const { error } = await supabase
        .from('users')
        .update({
          latitude: mapRegion.latitude,
          longitude: mapRegion.longitude,
          max_solar_power: solarPower,
          max_inverter_power: inverterPower,
        })
        .eq('id', userId);
      
      if (error) {
        console.error('Supabase update error:', error);
        throw error;
      }
      
      console.log('Settings saved successfully');
      Alert.alert('Success', 'Your settings have been saved');
    } catch (error) {
      console.error("Error saving settings:", error);
      Alert.alert('Error', 'Failed to save your settings');
    } finally {
      setSaving(false);
    }
  };

  return (
    <View style={styles.settingsContainer}>
      <ScrollView style={styles.settingsScrollView} contentContainerStyle={styles.settingsScrollContent}>
        {/* Map Section */}
        <View style={styles.settingsCard}>
          <Text style={styles.settingsCardTitle}>Installation Location</Text>
          
          <View style={styles.addressInputContainer}>
            <TextInput
              style={styles.addressInput}
              placeholder="Enter address or location"
              placeholderTextColor={THEME.dark.placeholderTextColor}
              value={address}
              onChangeText={setAddress}
            />
            <TouchableOpacity 
              style={styles.searchButton} 
              onPress={searchAddress}
              disabled={loading}
            >
              {loading ? (
                <ActivityIndicator size="small" color="#fff" />
              ) : (
                <Ionicons name="search" size={20} color="#fff" />
              )}
            </TouchableOpacity>
          </View>
          
          <View style={styles.mapContainer}>
            <MapView 
              style={styles.map}
              region={mapRegion}
              onRegionChangeComplete={setMapRegion}
              mapType="standard"
              provider={PROVIDER_DEFAULT}
            >
              <Marker 
                coordinate={{
                  latitude: mapRegion.latitude,
                  longitude: mapRegion.longitude,
                }}
                draggable
                onDragEnd={(e) => {
                  setMapRegion({
                    ...mapRegion,
                    latitude: e.nativeEvent.coordinate.latitude,
                    longitude: e.nativeEvent.coordinate.longitude,
                  });
                  getAddressFromCoordinates(
                    e.nativeEvent.coordinate.latitude,
                    e.nativeEvent.coordinate.longitude
                  ).then(addr => setAddress(addr));
                }}
              />
            </MapView>
            <View style={styles.mapOverlay}>
              <Text style={styles.coordinatesText}>
                Lat: {mapRegion.latitude.toFixed(5)}, Lng: {mapRegion.longitude.toFixed(5)}
              </Text>
              <Text style={styles.mapHint}>Long press on marker to drag</Text>
            </View>
          </View>
        </View>
        
        {/* System Settings */}
        <View style={styles.settingsCard}>
          <Text style={styles.settingsCardTitle}>System Specifications</Text>
          
          <View style={styles.settingsInputContainer}>
            <Text style={styles.settingsInputLabel}>Maximum Solar Power (kW)</Text>
            <TextInput
              style={styles.settingsInput}
              placeholder="Enter max solar kW"
              placeholderTextColor={THEME.dark.placeholderTextColor}
              keyboardType="decimal-pad"
              value={maxSolarPower}
              onChangeText={setMaxSolarPower}
            />
          </View>
          
          <View style={styles.settingsInputContainer}>
            <Text style={styles.settingsInputLabel}>Maximum Inverter Power (kW)</Text>
            <TextInput
              style={styles.settingsInput}
              placeholder="Enter max inverter kW"
              placeholderTextColor={THEME.dark.placeholderTextColor}
              keyboardType="decimal-pad"
              value={maxInverterPower}
              onChangeText={setMaxInverterPower}
            />
          </View>
          
          <TouchableOpacity 
            style={styles.settingsSaveButton} 
            onPress={saveSettings}
            disabled={saving}
          >
            {saving ? (
              <ActivityIndicator size="small" color="#fff" />
            ) : (
              <Text style={styles.settingsSaveButtonText}>Save Settings</Text>
            )}
          </TouchableOpacity>
        </View>
      </ScrollView>
    </View>
  );
}
