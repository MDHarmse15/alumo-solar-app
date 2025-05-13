import React, { useEffect, useState } from 'react';
import { ActivityIndicator, Image, StatusBar, View as RNView, Animated, Dimensions, StyleSheet, AppState, TouchableOpacity } from 'react-native';
import { supabase } from '@/lib/supabaseClient';
import { THEME, useThemeStyles } from '../../theme';
import { View as DefaultView, Text as DefaultText } from 'react-native';
import * as Font from "expo-font";
import Svg, { Rect, G, Circle, Path, Text, LinearGradient, Stop, Defs, Line } from 'react-native-svg';
import { Ionicons } from '@expo/vector-icons';
import * as Location from 'expo-location';
import { useFocusEffect } from '@react-navigation/native';
import Modal from 'react-native-modal';

// Default location (approximate coordinates for a generic location)
const DEFAULT_LATITUDE = 37.7749; // San Francisco, CA as fallback
const DEFAULT_LONGITUDE = -122.4194;

// Default max power values
const DEFAULT_MAX_SOLAR_POWER = 5.0;
const DEFAULT_MAX_INVERTER_POWER = 6.0;

// Function to estimate sunrise and sunset times based on latitude, day of year, and time zone
const estimateSunriseSunset = (latitude: number, date: Date) => {
  // Day of year (1-366)
  const start = new Date(date.getFullYear(), 0, 0);
  const diff = (date.getTime() - start.getTime()) + ((start.getTimezoneOffset() - date.getTimezoneOffset()) * 60 * 1000);
  const dayOfYear = Math.floor(diff / (1000 * 60 * 60 * 24));
  
  // Rough approximation based on day of year and latitude
  // This is a simplified model using the equation of time and solar declination
  const solarDeclination = 23.45 * Math.sin((360 / 365) * (dayOfYear - 81) * Math.PI / 180);
  const hourAngle = Math.acos(-Math.tan(latitude * Math.PI / 180) * Math.tan(solarDeclination * Math.PI / 180)) * 180 / Math.PI;
  
  // Convert hour angle to hours
  const dayLength = (2 * hourAngle) / 15;
  
  // Estimate sunrise and sunset times (in local hours from midnight)
  const noon = 12; // Solar noon approximation
  const sunriseHour = noon - (dayLength / 2);
  const sunsetHour = noon + (dayLength / 2);
  
  // Format as HH:MM
  const formatTime = (hour: number) => {
    const hours = Math.floor(hour);
    const minutes = Math.round((hour - hours) * 60);
    return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}`;
  };
  
  return {
    sunrise: formatTime(sunriseHour),
    sunset: formatTime(sunsetHour)
  };
};

// Get current time formatted as HH:MM
const getCurrentTime = () => {
  const now = new Date();
  const hours = now.getHours().toString().padStart(2, '0');
  const minutes = now.getMinutes().toString().padStart(2, '0');
  return `${hours}:${minutes}`;
};

// Default data structure (will be replaced with actual data)
const DEFAULT_DATA = {
  battery: {
    level: 60, // percentage
    isCharging: true,
  },
  load: {
    current: 2.4, // kW
    max: 4.5, // kW
    capacity: 6.0, // kW
  },
  solar: {
    current: 3.7, // kW
    max: 5.0, // kW
    capacity: 5.0, // kW
  },
  // DayTime will be dynamically updated in the component
  dayTime: {
    sunrise: "06:30", // Default will be replaced
    sunset: "18:45", // Default will be replaced
    currentTime: "02:20", // Default will be replaced
  }
};

// Interface for solar data from database
interface SolarData {
  battery_percentage: number;
  solar_power: number;
  load_power: number;
  battery_power: number;
  timestamp: string;
  inverter_sn: string;
}

interface PowerStats {
  current: number;
  max: number;
  capacity: number;
}

// Interface for historical data
interface HistoricalData {
  timestamp: string;
  value: number;
}

interface HistoricalDataSet {
  battery: HistoricalData[];
  solar: HistoricalData[];
  load: HistoricalData[];
  batteryCharging: HistoricalData[];
}

// Interface for user settings
interface UserSettings {
  latitude?: number;
  longitude?: number;
  max_solar_power?: number;
  max_inverter_power?: number;
}

export default function TabOneScreen() {
  const [hasDevices, setHasDevices] = useState<boolean | null>(null);
  const [loading, setLoading] = useState(true);
  const [userId, setUserId] = useState<string | null>(null);
  const [userSettings, setUserSettings] = useState<UserSettings>({});
  const [dayTime, setDayTime] = useState(DEFAULT_DATA.dayTime);
  const [batteryData, setBatteryData] = useState(DEFAULT_DATA.battery);
  const [solarData, setSolarData] = useState<PowerStats>(DEFAULT_DATA.solar);
  const [loadData, setLoadData] = useState<PowerStats>(DEFAULT_DATA.load);
  const [deviceSerials, setDeviceSerials] = useState<string[]>([]);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);
  const [appState, setAppState] = useState(AppState.currentState);
  
  // Add a state to track if data loading is complete
  const [dataLoaded, setDataLoaded] = useState(false);
  
  // Modal states
  const [batteryModalVisible, setBatteryModalVisible] = useState(false);
  const [solarModalVisible, setSolarModalVisible] = useState(false);
  const [loadModalVisible, setLoadModalVisible] = useState(false);
  
  // Historical data
  const [historicalData, setHistoricalData] = useState<HistoricalDataSet>({
    battery: [],
    solar: [],
    load: [],
    batteryCharging: []
  });
  
  const styles = useThemeStyles();
  const theme = THEME.dark;

  // Dashboard-specific styles
  const dashboardStyles = StyleSheet.create({
    smallHeader: {
      flexDirection: 'row',
      alignItems: 'center',
      paddingTop: 60,
      paddingHorizontal: 20,
      paddingBottom: 10,
      backgroundColor: 'rgba(0, 0, 0, 0.1)',
    },
    smallLogo: {
      width: 60,
      height: 30,
    },
    headerTitle: {
      fontSize: 24,
      fontFamily: 'Century-Gothic-Bold',
      color: '#fff',
      marginLeft: 15,
    },
    dashboardContainer: {
      flex: 1,
      paddingHorizontal: 10,
      paddingTop: 20,
    },
    dashboardCard: {
      borderWidth: 1,
      borderColor: theme.primaryColor,
      borderRadius: 12,
      padding: 15,
      marginBottom: 15,
      alignItems: 'center',
      backgroundColor: 'transparent',
    },
    cardTitle: {
      fontSize: 18,
      fontFamily: 'Century-Gothic-Bold',
      color: '#fff',
      marginBottom: 15,
    },
    batteryContainer: {
      alignItems: 'center',
    },
    statusIndicator: {
      flexDirection: 'row',
      alignItems: 'center',
      marginTop: 10,
    },
    statusText: {
      fontFamily: 'Century-Gothic',
      marginLeft: 5,
    },
    powerMetricsRow: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      width: '100%',
      marginBottom: 15,
    },
    dialContainer: {
      alignItems: 'center',
    },
    maxValue: {
      fontFamily: 'Century-Gothic',
      color: '#fff',
      marginTop: 10,
      fontSize: 14,
    },
    batteryPercentage: {
      fontSize: 24,
      fontFamily: 'Century-Gothic-Bold',
      marginTop: 10,
    },
    cardHeader: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      width: '100%',
      marginBottom: 15,
    },
    timeRemaining: {
      fontFamily: 'Century-Gothic',
      fontSize: 14,
    },
  });

  const loadFonts = async () => {
    await Font.loadAsync({
    "Century-Gothic": require("../../assets/fonts/centurygothic.ttf"),
    "Century-Gothic-Bold": require("../../assets/fonts/centurygothic_bold.ttf"),
    });
  };

  useEffect(() => {
      loadFonts();
  }, []);

  // Function to fetch today's max values
  const fetchDailyMaxValues = async () => {
    try {
      if (deviceSerials.length === 0) {
        console.log("No device serials available for max values");
        return;
      }
      
      // Get today's date at midnight
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const todayISOString = today.toISOString();
      
      // Fetch maximum solar and load power for today
      const { data, error } = await supabase
        .from('solar_data')
        .select('solar_power, load_power')
        .in('inverter_sn', deviceSerials)
        .gte('timestamp', todayISOString);
        
      if (error) {
        console.error("Error fetching max daily values:", error);
        return;
      }
      
      if (!data || data.length === 0) {
        console.log("No data found for today");
        return;
      }
      
      // Calculate max values
      let maxSolarPower = 0;
      let maxLoadPower = 0;
      
      data.forEach(record => {
        // Convert to kW 
        const solarPower = record.solar_power / 1000;
        const loadPower = record.load_power / 1000;
        
        if (solarPower > maxSolarPower) maxSolarPower = solarPower;
        if (loadPower > maxLoadPower) maxLoadPower = loadPower;
      });
      
      console.log(`Max values for today - Solar: ${maxSolarPower}kW, Load: ${maxLoadPower}kW`);
      
      // Update state with max values
      setSolarData(prevData => ({
        ...prevData,
        max: maxSolarPower
      }));
      
      setLoadData(prevData => ({
        ...prevData,
        max: maxLoadPower
      }));
      
    } catch (error) {
      console.error("Error in fetchDailyMaxValues:", error);
    }
  };

  // Function to fetch historical data for the past day
  const fetchHistoricalData = async () => {
    try {
      if (deviceSerials.length === 0) {
        console.log("No device serials available for historical data");
        return;
      }
      
      // Get yesterday's date and time
      const oneDayAgo = new Date();
      oneDayAgo.setDate(oneDayAgo.getDate() - 1);
      const oneDayAgoISOString = oneDayAgo.toISOString();
      
      console.log("Fetching historical data since:", oneDayAgoISOString);
      
      // Fetch data from the past day
      const { data, error } = await supabase
        .from('solar_data')
        .select('timestamp, battery_percentage, solar_power, load_power, battery_power')
        .in('inverter_sn', deviceSerials)
        .gte('timestamp', oneDayAgoISOString)
        .order('timestamp', { ascending: true });
        
      if (error) {
        console.error("Error fetching historical data:", error);
        return;
      }
      
      if (!data || data.length === 0) {
        console.log("No historical data found");
        return;
      }
      
      console.log(`Found ${data.length} historical data points`);
      
      // Process and format data for graphs
      const batteryData: HistoricalData[] = [];
      const solarData: HistoricalData[] = [];
      const loadData: HistoricalData[] = [];
      const batteryChargingData: HistoricalData[] = [];
      
      data.forEach(record => {
        const timestamp = new Date(record.timestamp);
        
        // Format timestamp as hours:minutes
        const timeString = `${timestamp.getHours()}:${timestamp.getMinutes().toString().padStart(2, '0')}`;
        
        // Battery percentage
        batteryData.push({
          timestamp: timeString,
          value: record.battery_percentage
        });
        
        // Convert power values from watts to kilowatts
        const solarPowerKW = record.solar_power / 1000;
        const loadPowerKW = record.load_power / 1000;
        const batteryPowerKW = record.battery_power / 1000;
        
        // Solar power (in kW)
        solarData.push({
          timestamp: timeString,
          value: solarPowerKW
        });
        
        // Load power (in kW)
        loadData.push({
          timestamp: timeString,
          value: loadPowerKW
        });
        
        // Battery charging/discharging (in kW)
        batteryChargingData.push({
          timestamp: timeString,
          value: batteryPowerKW
        });
      });
      
      // Update historical data state
      setHistoricalData({
        battery: batteryData,
        solar: solarData,
        load: loadData,
        batteryCharging: batteryChargingData
      });
      
    } catch (error) {
      console.error("Error in fetchHistoricalData:", error);
    }
  };

  // Function to fetch solar data and update states
  const fetchSolarData = async () => {
    try {
      if (!deviceSerials || deviceSerials.length === 0) {
        console.log("No device serials available for fetching data");
        return;
      }
      
      // Get the most recent solar data for each device
      const { data: solarDataResults, error: solarError } = await supabase
        .from('solar_data')
        .select('*')
        .in('inverter_sn', deviceSerials)
        .order('timestamp', { ascending: false })
        .limit(deviceSerials.length); // Get one entry per device
      
      if (solarError) {
        console.error("Error fetching solar data:", solarError);
        return;
      }
      
      // If no data is found for any device
      if (!solarDataResults || solarDataResults.length === 0) {
        console.log("No solar data found for devices");
        setDataLoaded(true);
        return;
      }
      
      console.log(`Found solar data for ${solarDataResults.length} devices`);
      
      // For simplicity, we'll just use the first device's data
      // In a real app, you might want to aggregate data from multiple devices
      const latestData = solarDataResults[0] as SolarData;
      
      // Convert watt values to kilowatts
      const solarPowerKW = latestData.solar_power / 1000;
      const loadPowerKW = latestData.load_power / 1000;
      const batteryPowerKW = latestData.battery_power / 1000;
      
      console.log(`Converting power values to kW - Solar: ${solarPowerKW}kW, Load: ${loadPowerKW}kW, Battery: ${batteryPowerKW}kW`);
      
      // Update battery state
      // Correct battery charging logic: 
      // negative battery_power means charging (battery is receiving power)
      // positive battery_power means discharging (battery is providing power)
      const isBatteryCharging = latestData.battery_power < 0;
      console.log(`Battery state: ${isBatteryCharging ? 'Charging' : 'Discharging'}, Power: ${batteryPowerKW}kW`);
      
      setBatteryData({
        level: latestData.battery_percentage,
        isCharging: isBatteryCharging
      });
      
      // Use user settings for max power values if available
      const maxSolarPower = userSettings.max_solar_power || DEFAULT_MAX_SOLAR_POWER;
      const maxInverterPower = userSettings.max_inverter_power || DEFAULT_MAX_INVERTER_POWER;
      
      // Update solar power state
      setSolarData(prevState => ({
        current: solarPowerKW,
        max: prevState.max, // This will be updated by fetchDailyMaxValues
        capacity: maxSolarPower,
      }));
      
      // Update load power state
      setLoadData(prevState => ({
        current: loadPowerKW,
        max: prevState.max, // This will be updated by fetchDailyMaxValues
        capacity: maxInverterPower,
      }));
      
      // Update last updated timestamp
      setLastUpdated(new Date());
      
      // Get the day's maximum values
      await fetchDailyMaxValues();
      
      // Get historical data for the graphs
      await fetchHistoricalData();
      
      // Set data loaded state to true
      setDataLoaded(true);
    } catch (error) {
      console.error("Error in fetchSolarData:", error);
      setDataLoaded(true);
    }
  };

  // Main useEffect for initialization
  useEffect(() => {
    // Check if user has devices and fetch initial data
    const checkUserDevices = async () => {
      try {
        // Get current user
        const { data: { user }, error: userError } = await supabase.auth.getUser();
        
        if (userError || !user) {
          console.error("Error getting current user:", userError);
          setLoading(false);
          return;
        }

        setUserId(user.id);
        
        // Fetch user settings
        await fetchUserSettings(user.id);
        
        // Check if user has any devices
        const { data: devices, error: devicesError } = await supabase
          .from('devices')
          .select('id, serial_number')
          .eq('user_id', user.id);
        
        if (devicesError) {
          console.error("Error checking devices:", devicesError);
          setLoading(false);
          return;
        }
        
        // Set hasDevices based on whether any results were returned
        const hasAnyDevices = devices && devices.length > 0;
        setHasDevices(hasAnyDevices);
        
        if (hasAnyDevices) {
          // Extract device serial numbers
          const serials = devices.map(device => device.serial_number).filter(Boolean);
          setDeviceSerials(serials);
          
          // Fetch initial solar data
          if (serials.length > 0) {
            await fetchSolarData();
          }
        }
        
        setLoading(false);
      } catch (error) {
        console.error("Unexpected error:", error);
        setLoading(false);
      }
    };

    // Function to fetch user settings from database
    const fetchUserSettings = async (userId: string) => {
      try {
        console.log('Fetching user settings...');
        
        // Get user settings from the users table
        const { data: userData, error: userDataError } = await supabase
          .from('users')
          .select('*')
          .eq('id', userId)
          .single();
        
        if (userDataError) {
          console.error("Error fetching user data:", userDataError);
          return;
        }
        
        console.log('User settings retrieved:', userData);
        
        // If we have user data with settings
        if (userData) {
          const settings: UserSettings = {};
          
          // Check if the user has the required settings fields and they are not null
          if (userData.max_solar_power !== undefined && userData.max_solar_power !== null) {
            console.log('Setting max solar power:', userData.max_solar_power);
            settings.max_solar_power = userData.max_solar_power;
          }
          
          if (userData.max_inverter_power !== undefined && userData.max_inverter_power !== null) {
            console.log('Setting max inverter power:', userData.max_inverter_power);
            settings.max_inverter_power = userData.max_inverter_power;
          }
          
          if (userData.latitude && userData.longitude) {
            console.log('Setting location:', userData.latitude, userData.longitude);
            settings.latitude = userData.latitude;
            settings.longitude = userData.longitude;
            
            // Update sunrise and sunset times with user's location
            const sunTimes = estimateSunriseSunset(userData.latitude, new Date());
            setDayTime(prevState => ({
              ...prevState,
              sunrise: sunTimes.sunrise,
              sunset: sunTimes.sunset,
            }));
          }
          
          // Save settings to state
          setUserSettings(settings);
        }
      } catch (error) {
        console.error("Error in fetchUserSettings:", error);
      }
    };

    checkUserDevices();
    
    // Set up AppState change listener for refreshing on app focus
    const subscription = AppState.addEventListener('change', nextAppState => {
      if (appState.match(/inactive|background/) && nextAppState === 'active') {
        console.log('App has come to the foreground!');
        // Refresh data when app comes to foreground
        fetchSolarData();
      }
      
      setAppState(nextAppState);
    });
    
    // Update time every minute
    const timeInterval = setInterval(() => {
      updateCurrentTime();
    }, 60000); // 60 seconds
    
    return () => {
      subscription.remove();
      clearInterval(timeInterval);
    };
  }, [appState]);
  
  // Use Focus Effect to refresh data when tab gains focus
  useFocusEffect(
    React.useCallback(() => {
      console.log('Screen is focused, refreshing data');
      if (hasDevices && deviceSerials.length > 0) {
        fetchSolarData();
      }
      
      return () => {
        // Do nothing on blur
      };
    }, [hasDevices, deviceSerials])
  );

  // Update time every minute and get location on component mount
  useEffect(() => {
    // Update the current time immediately
    updateCurrentTime();
    
    // Request location and update sunrise/sunset times
    const updateLocation = async () => {
      try {
        // First check if we have location from user settings
        if (userSettings.latitude && userSettings.longitude) {
          console.log(`Using user settings location: ${userSettings.latitude}, ${userSettings.longitude}`);
          
          // Calculate sunrise and sunset based on user settings location
          const sunTimes = estimateSunriseSunset(userSettings.latitude, new Date());
          setDayTime(prevState => ({
            ...prevState,
            sunrise: sunTimes.sunrise,
            sunset: sunTimes.sunset,
          }));
          
          return;
        }
        
        // If we don't have location in user settings, try to get current location
        const serviceEnabled = await Location.hasServicesEnabledAsync();
        
        if (!serviceEnabled) {
          console.log("Location services are not enabled");
          // Fall back to default location
          useFallbackLocation();
          return;
        }
        
        // Request foreground permissions with more robust error handling
        let { status } = await Location.requestForegroundPermissionsAsync();
        
        // If denied, try again with a different permission type (for older iOS versions)
        if (status !== 'granted') {
          console.log("Foreground location permission denied, trying alternate permission");
          // Try background permissions as a fallback
          const backgroundPermission = await Location.requestBackgroundPermissionsAsync();
          status = backgroundPermission.status;
        }
        
        if (status === 'granted') {
          // Get current location with a timeout and high accuracy
          const location = await Location.getCurrentPositionAsync({
            accuracy: Location.Accuracy.High,
            timeInterval: 5000
          });
          
          const { latitude, longitude } = location.coords;
          console.log(`Location obtained: ${latitude}, ${longitude}`);
          
          // Calculate sunrise and sunset based on location
          const sunTimes = estimateSunriseSunset(latitude, new Date());
          setDayTime(prevState => ({
            ...prevState,
            sunrise: sunTimes.sunrise,
            sunset: sunTimes.sunset,
          }));
        } else {
          console.log("Location permission denied after multiple attempts");
          useFallbackLocation();
        }
      } catch (error) {
        console.error("Error getting location:", error);
        useFallbackLocation();
      }
    };
    
    // Helper function for fallback location
    const useFallbackLocation = () => {
      console.log("Using fallback location data");
      const sunTimes = estimateSunriseSunset(DEFAULT_LATITUDE, new Date());
      setDayTime(prevState => ({
        ...prevState,
        sunrise: sunTimes.sunrise,
        sunset: sunTimes.sunset,
      }));
    };
    
    // Update the time every minute
    const timeInterval = setInterval(() => {
      updateCurrentTime();
    }, 60000); // 60 seconds
    
    // Call once on mount
    updateLocation();
    
    // Clean up on unmount
    return () => {
      clearInterval(timeInterval);
    };
  }, [userSettings]);
  
  // Function to update current time
  const updateCurrentTime = () => {
    setDayTime(prevState => ({
      ...prevState,
      currentTime: getCurrentTime(),
    }));
  };

  // Graph Modal Component
  const GraphModal = ({ 
    isVisible, 
    onClose, 
    title, 
    data,
    yLabel,
    color,
    domain = undefined,
    lastValue = null,
    lastValueLabel = null,
    lastValueUnit = null
  }: { 
    isVisible: boolean; 
    onClose: () => void; 
    title: string; 
    data: HistoricalData[];
    yLabel: string;
    color: string;
    domain?: { y: [number, number] };
    lastValue?: number | null;
    lastValueLabel?: string | null;
    lastValueUnit?: string | null;
  }) => {
    // Skip rendering if no data is available
    if (data.length === 0) {
      return (
        <Modal
          isVisible={isVisible}
          onBackdropPress={onClose}
          backdropOpacity={0.8}
          animationIn="fadeIn"
          animationOut="fadeOut"
          style={{ margin: 0, justifyContent: 'center', alignItems: 'center' }}
        >
          <DefaultView style={[modalStyles.container, { backgroundColor: styles.background.backgroundColor || '#121212' }]}>
            <DefaultText style={modalStyles.title}>{title}</DefaultText>
            <DefaultText style={modalStyles.noDataText}>No historical data available</DefaultText>
            <TouchableOpacity style={modalStyles.closeButton} onPress={onClose}>
              <Ionicons name="close-circle" size={36} color="#fff" />
            </TouchableOpacity>
          </DefaultView>
        </Modal>
      );
    }
    
    // Chart dimensions
    const chartWidth = screenWidth - 80;
    const chartHeight = 220;
    const paddingLeft = 50;
    const paddingRight = 20;
    const paddingTop = 20;
    const paddingBottom = 40;
    
    // Calculate min and max for Y axis with improved logic
    let yMin = 0; // Default to 0 for most metrics
    let yMax = 0;
    
    if (domain) {
      // Use provided domain if available
      yMin = domain.y[0];
      yMax = domain.y[1];
    } else {
      // Calculate from data
      const values = data.map(d => d.value);
      const dataMin = Math.min(...values);
      const dataMax = Math.max(...values);
      
      // Make sure we show at least the actual min/max values, with some margin
      yMin = Math.floor(dataMin * 0.9); // 10% below min
      yMax = Math.ceil(dataMax * 1.1); // 10% above max
      
      // Force specific ranges for different graphs
      if (title.includes("Solar Power")) {
        // For solar, show full capacity range and ensure it's at least 10% above the max value
        yMin = 0;
        const maxSolar = Math.max(dataMax, solarData.max);
        yMax = Math.max(solarData.capacity, Math.ceil(maxSolar * 1.2));
      }
      else if (title.includes("Load Power")) {
        // For load, also show full capacity range
        yMin = 0;
        const maxLoad = Math.max(dataMax, loadData.max);
        yMax = Math.max(loadData.capacity, Math.ceil(maxLoad * 1.2));
      }
      else if (title.includes("Battery Level")) {
        // For battery, always use 0-100 range
        yMin = 0;
        yMax = 100;
      }
      
      // Ensure we don't go below 0 for power values
      if (yMin < 0 && yLabel === 'kW') {
        yMin = 0;
      }
      
      // Ensure reasonable range even with small differences
      if (yMax - yMin < 1 && yLabel === 'kW') {
        yMax = yMin + 1;
      }
      
      // Ensure we always have nice round numbers
      if (yLabel === 'kW') {
        yMax = Math.ceil(yMax);
      }
    }
    
    // Format the last value text (if provided)
    const formattedLastValue = lastValue !== null 
      ? `${lastValueLabel || 'Current'}: ${lastValue.toFixed(2)} ${lastValueUnit || yLabel}`
      : '';
    
    // Subsample data if there are too many points
    let displayData = [...data];
    if (data.length > 24) {
      const interval = Math.floor(data.length / 24);
      displayData = data.filter((_, index) => index % interval === 0);
      
      // Always include the last point
      if (displayData[displayData.length - 1] !== data[data.length - 1]) {
        displayData.push(data[data.length - 1]);
      }
    }
    
    // Scale data points to fit the chart
    const dataPoints = displayData.map((point, index) => {
      // Ensure we don't divide by zero
      const range = Math.max(0.1, yMax - yMin);
      const x = paddingLeft + (index / Math.max(1, displayData.length - 1)) * (chartWidth - paddingLeft - paddingRight);
      const y = paddingTop + (chartHeight - paddingTop - paddingBottom) * (1 - (point.value - yMin) / range);
      return { x, y, original: point };
    });
    
    // Generate path data for the line
    const pathData = dataPoints.map((point, index) => 
      (index === 0 ? 'M' : 'L') + point.x + ',' + point.y
    ).join(' ');
    
    // Generate Y-axis markers with better formatting
    const yAxisSteps = 5;
    const yAxisMarkers = Array.from({ length: yAxisSteps + 1 }, (_, i) => {
      const value = yMin + (i / yAxisSteps) * (yMax - yMin);
      const y = paddingTop + (chartHeight - paddingTop - paddingBottom) * (1 - (value - yMin) / (yMax - yMin));
      return { y, value };
    });
    
    // Generate X-axis markers with better spacing
    const xAxisInterval = Math.max(1, Math.floor(displayData.length / 6)); // Show max 6 labels
    const xAxisMarkers = dataPoints.filter((_, i) => i % xAxisInterval === 0 || i === dataPoints.length - 1);
    
    return (
      <Modal
        isVisible={isVisible}
        onBackdropPress={onClose}
        backdropOpacity={0.8}
        animationIn="fadeIn"
        animationOut="fadeOut"
        style={{ margin: 0, justifyContent: 'center', alignItems: 'center' }}
      >
        <DefaultView style={[modalStyles.container, { backgroundColor: styles.background.backgroundColor || '#121212' }]}>
          <DefaultText style={modalStyles.title}>{title}</DefaultText>
          
          <DefaultView style={[modalStyles.chartContainer, { backgroundColor: styles.background.backgroundColor || '#121212' }]}>
            <DefaultText style={modalStyles.chartYLabel}>{yLabel}</DefaultText>
            
            <Svg width={chartWidth} height={chartHeight}>
              {/* Background */}
              <Rect
                x={paddingLeft}
                y={paddingTop}
                width={chartWidth - paddingLeft - paddingRight}
                height={chartHeight - paddingTop - paddingBottom}
                fill="transparent"
                stroke="#333"
                strokeWidth="1"
              />
              
              {/* Y axis */}
              <Line
                x1={paddingLeft}
                y1={paddingTop}
                x2={paddingLeft}
                y2={chartHeight - paddingBottom}
                stroke="#444"
                strokeWidth="1"
              />
              
              {/* X axis */}
              <Line
                x1={paddingLeft}
                y1={chartHeight - paddingBottom}
                x2={chartWidth - paddingRight}
                y2={chartHeight - paddingBottom}
                stroke="#444"
                strokeWidth="1"
              />
              
              {/* Y axis grid lines and labels */}
              {yAxisMarkers.map((marker, i) => (
                <React.Fragment key={`y-marker-${i}`}>
                  <Line
                    x1={paddingLeft - 5}
                    y1={marker.y}
                    x2={chartWidth - paddingRight}
                    y2={marker.y}
                    stroke="#444"
                    strokeWidth="1"
                    strokeDasharray={i === 0 ? "0" : "3,3"}
                    opacity={i === 0 ? 1 : 0.5}
                  />
                  <Text
                    x={paddingLeft - 10}
                    y={marker.y + 5}
                    textAnchor="end"
                    fill="#ccc"
                    fontSize="10"
                  >
                    {yLabel === '%' ? marker.value.toFixed(0) : marker.value.toFixed(1)}
                  </Text>
                </React.Fragment>
              ))}
              
              {/* X axis labels */}
              {xAxisMarkers.map((point, i) => (
                <Text
                  key={`x-label-${i}`}
                  x={point.x}
                  y={chartHeight - paddingBottom + 15}
                  textAnchor="middle"
                  fill="#ccc"
                  fontSize="10"
                >
                  {point.original.timestamp}
                </Text>
              ))}
              
              {/* Data line */}
              <Path
                d={pathData}
                stroke={color}
                strokeWidth="3"
                fill="none"
              />
              
              {/* Data points */}
              {dataPoints.map((point, i) => (
                <Circle
                  key={`point-${i}`}
                  cx={point.x}
                  cy={point.y}
                  r="4"
                  fill={color}
                />
              ))}
            </Svg>
          </DefaultView>
          
          {/* Display last value if provided */}
          {lastValue !== null && (
            <DefaultText style={modalStyles.lastValueText}>
              {formattedLastValue}
            </DefaultText>
          )}
          
          <TouchableOpacity style={modalStyles.closeButton} onPress={onClose}>
            <Ionicons name="close-circle" size={36} color="#fff" />
          </TouchableOpacity>
        </DefaultView>
      </Modal>
    );
  };

  // Battery indicator component
  const BatteryIndicator = () => {
    const { level, isCharging } = batteryData;
    
    // Create animation values local to this component
    const [blinkOpacity] = useState(() => new Animated.Value(0.4));
    
    // Create and start the animation when the component mounts or charging state changes
    // But only after data is loaded
    useEffect(() => {
      // Don't start animation until data is fully loaded
      if (!dataLoaded) {
        return;
      }
      
      console.log("Setting up battery animation, charging:", isCharging);
      
      // Create a blinking animation with a pause at full brightness
      const blinkAnimation = Animated.loop(
        Animated.sequence([
          // Fade in to full brightness
          Animated.timing(blinkOpacity, {
            toValue: 1,
            duration: 700,
            useNativeDriver: true,
          }),
          // Hold at full brightness
          Animated.delay(300),
          // Fade out to dim
          Animated.timing(blinkOpacity, {
            toValue: 0.3,
            duration: 900,
            useNativeDriver: true,
          }),
          // Pause briefly at dim before starting again
          Animated.delay(200),
        ])
      );
      
      // Start the animation
      blinkAnimation.start();
      
      // Clean up animation when component unmounts or charging state changes
      return () => {
        console.log("Stopping battery animation");
        blinkAnimation.stop();
      };
    }, [isCharging, blinkOpacity, dataLoaded]); // Add dataLoaded dependency
    
    const batteryWidth = 150;
    const batteryHeight = 75;
    const capWidth = 10;
    const flashColor = isCharging ? theme.primaryColor : theme.dangerColor;
    
    // Calculate the position for the flashing section based on charging state
    const flashPosition = Math.min(
      4 + ((batteryWidth - 8) * (level / 100)), 
      batteryWidth - ((batteryWidth - 8) * 0.12) - 4
    );
    
    return (
      <TouchableOpacity 
        style={dashboardStyles.dashboardCard}
        onPress={() => setBatteryModalVisible(true)}
        activeOpacity={0.7}
      >
        <DefaultText style={[dashboardStyles.cardTitle, { color: theme.textColor }]}>Battery Status</DefaultText>
        
        <DefaultView style={dashboardStyles.batteryContainer}>
          <DefaultView style={{ width: batteryWidth + capWidth, height: batteryHeight, position: 'relative' }}>
            <Svg width={batteryWidth + capWidth} height={batteryHeight}>
              {/* Battery outline */}
              <Rect
                x="0"
                y="0"
                width={batteryWidth}
                height={batteryHeight}
                rx="8"
                ry="8"
                fill="transparent"
                stroke={theme.textColor}
                strokeWidth="4"
              />
              
              {/* Battery cap */}
              <Rect
                x={batteryWidth}
                y={(batteryHeight / 2) - 15}
                width={capWidth}
                height={30}
                rx="3"
                ry="3"
                fill={theme.textColor}
              />
              
              {/* Battery fill */}
              <Rect
                x="4"
                y="4"
                width={(batteryWidth - 8) * (level / 100)}
                height={batteryHeight - 8}
                rx="6"
                ry="6"
                fill={theme.primaryColor}
                opacity="0.8"
              />
            </Svg>
            
            {/* Flashing section separated from SVG */}
            <Animated.View 
              style={{
                position: 'absolute',
                top: 4,
                left: flashPosition,
                width: (batteryWidth - 8) * 0.12,
                height: batteryHeight - 8,
                backgroundColor: flashColor,
                opacity: blinkOpacity,
                borderRadius: 6,
              }} 
            />
          </DefaultView>
          
          {/* Battery percentage text below battery */}
          <DefaultText style={[dashboardStyles.batteryPercentage, { color: theme.textColor }]}>
            {level}%
          </DefaultText>
          
          <DefaultView style={dashboardStyles.statusIndicator}>
            <Ionicons 
              name={isCharging ? "flash" : "flash-off"} 
              size={24} 
              color={flashColor}
            />
            <DefaultText style={[dashboardStyles.statusText, { color: theme.textColor }]}>
              {isCharging ? "Charging" : "Discharging"}
            </DefaultText>
          </DefaultView>
        </DefaultView>
      </TouchableOpacity>
    );
  };

  // DayTimeCard component
  const DayTimeCard = () => {
    const { sunrise, sunset, currentTime } = dayTime;
    const cardWidth = screenWidth - 40; // Full width minus margins
    const cardHeight = 120;
    
    // Convert times to minutes since midnight for calculations
    const timeToMinutes = (time: string) => {
      const [hours, minutes] = time.split(':').map(Number);
      return hours * 60 + minutes;
    };
    
    const sunriseMinutes = timeToMinutes(sunrise);
    const sunsetMinutes = timeToMinutes(sunset);
    const currentMinutes = timeToMinutes(currentTime);
    const dayLength = sunsetMinutes - sunriseMinutes;
    
    // Calculate time remaining
    const getTimeRemaining = () => {
      if (currentMinutes < sunriseMinutes) {
        const minutesUntilSunrise = sunriseMinutes - currentMinutes;
        const hours = Math.floor(minutesUntilSunrise / 60);
        const minutes = minutesUntilSunrise % 60;
        return `${hours}h ${minutes}m until sunrise`;
      } else if (currentMinutes < sunsetMinutes) {
        const minutesUntilSunset = sunsetMinutes - currentMinutes;
        const hours = Math.floor(minutesUntilSunset / 60);
        const minutes = minutesUntilSunset % 60;
        return `${hours}h ${minutes}m of sunlight remaining`;
      } else {
        const minutesUntilNextSunrise = (24 * 60 - currentMinutes) + sunriseMinutes;
        const hours = Math.floor(minutesUntilNextSunrise / 60);
        const minutes = minutesUntilNextSunrise % 60;
        return `${hours}h ${minutes}m until sunrise`;
      }
    };
    
    // Calculate positions
    const sunriseX = (sunriseMinutes / (24 * 60)) * cardWidth;
    const sunsetX = (sunsetMinutes / (24 * 60)) * cardWidth;
    const currentX = (currentMinutes / (24 * 60)) * cardWidth;
    
    // Create the curves with consistent control points
    const curveHeight = 60;
    const baselineY = cardHeight - 20;
    const curveControlY = baselineY - curveHeight;
    
    // Full day curve (24 hours)
    const curvePath = `M 0,${baselineY} 
                      Q ${cardWidth/2},${curveControlY} 
                      ${cardWidth},${baselineY}`;
    
    // Helper function for quadratic bezier curve
    const calculateBezierY = (startX: number, endX: number, controlX: number, 
                              startY: number, controlY: number, endY: number, 
                              x: number) => {
      // If x is outside the range, return the baseline
      if (x <= startX || x >= endX) return baselineY;
      
      // Calculate t parameter (0 to 1) for position along the curve
      const t = (x - startX) / (endX - startX);
      
      // Quadratic Bezier formula: B(t) = (1-t)²P₀ + 2(1-t)tP₁ + t²P₂
      return Math.pow(1-t, 2) * startY + 
             2 * (1-t) * t * controlY + 
             Math.pow(t, 2) * endY;
    };
    
    // Function to calculate Y position along the day curve for any X position
    const getYPositionOnCurve = (x: number) => {
      if (x < sunriseX || x > sunsetX) {
        return baselineY;
      }
      
      return calculateBezierY(
        sunriseX, sunsetX, (sunriseX + sunsetX) / 2,
        baselineY, curveControlY, baselineY,
        x
      );
    };
    
    // Function to calculate Y position along the full day curve
    const getYPositionOnFullCurve = (x: number) => {
      return calculateBezierY(
        0, cardWidth, cardWidth/2,
        baselineY, curveControlY, baselineY,
        x
      );
    };
    
    // Daytime curve - this needs to match the exact shape that the sun follows
    // Important: To match the main curve exactly, we need to use the SAME control point
    // calculations that are used for the full-day curve, just with different start/end points
    const dayPath = (() => {
      // First generate points along the curve at regular intervals
      const numPoints = 20;
      const points = [];
      
      // Sample points along the full curve between sunrise and sunset
      for (let i = 0; i <= numPoints; i++) {
        const t = i / numPoints;
        const x = sunriseX + t * (sunsetX - sunriseX);
        const y = getYPositionOnFullCurve(x);
        points.push(`${x},${y}`);
      }
      
      // Create a polyline path from the calculated points
      return `M ${points[0]} ${points.slice(1).map(p => `L ${p}`).join(' ')}`;
    })();
    
    return (
      <DefaultView style={[dashboardStyles.dashboardCard, { marginBottom: 20 }]}>
        <DefaultText style={[dashboardStyles.cardTitle, { color: theme.textColor }]}>Day Time</DefaultText>
        
        <Svg width={cardWidth} height={cardHeight}>
          {/* Background curve */}
          <Path
            d={curvePath}
            stroke={theme.textColor}
            strokeWidth="2"
            fill="none"
            opacity="0.3"
          />
          
          {/* Daytime highlight - a polyline matching exactly the points along the full curve */}
          <Path
            d={dayPath}
            stroke={theme.primaryColor}
            strokeWidth="3"
            fill="none"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          
          {/* Current time indicator (sun) */}
          <Circle
            cx={currentX}
            cy={getYPositionOnFullCurve(currentX)}
            r="8"
            fill={theme.primaryColor}
          />
          
          {/* Time labels */}
          <Text
            x={sunriseX}
            y={cardHeight - 5}
            textAnchor="middle"
            fill={theme.textColor}
            fontSize="12"
            fontFamily="Century-Gothic"
          >
            {sunrise}
          </Text>
          
          <Text
            x={sunsetX}
            y={cardHeight - 5}
            textAnchor="middle"
            fill={theme.textColor}
            fontSize="12"
            fontFamily="Century-Gothic"
          >
            {sunset}
          </Text>
        </Svg>
        <DefaultText style={[dashboardStyles.timeRemaining, { color: theme.textColor }]}>
            {getTimeRemaining()}
          </DefaultText>
      </DefaultView>
    );
  };

  // Power Dial component
  const PowerDial = ({ 
    title, 
    current, 
    max, 
    capacity,
    color,
    style,
    gradientColors = ["#00E798", undefined],
    onPress
  }: { 
    title: string; 
    current: number; 
    max: number; 
    capacity: number;
    color: string;
    style?: any;
    gradientColors?: [string, string?];
    onPress?: () => void;
  }) => {
    const size = 150;
    const strokeWidth = 15;
    const radius = (size - strokeWidth) / 2;
    const circumference = radius * 2 * Math.PI;
    
    // Clip current value to capacity for the dial display
    const displayPercentage = Math.min(100, (current / capacity) * 100);
    const strokeDashoffset = circumference - (circumference * displayPercentage) / 100;
    
    const finalGradientColors = [
      gradientColors[0],
      gradientColors[1] || color
    ];
    
    return (
      <TouchableOpacity 
        style={[dashboardStyles.dashboardCard, style]}
        onPress={onPress}
        activeOpacity={0.7}
      >
        <DefaultText style={dashboardStyles.cardTitle}>{title}</DefaultText>
        
        <DefaultView style={dashboardStyles.dialContainer}>
          <Svg height={size} width={size}>
            <Defs>
              <LinearGradient id={`grad-${title}`} x1="0" y1="0" x2="1" y2="0">
                <Stop offset="0" stopColor={finalGradientColors[0]} stopOpacity="0.8" />
                <Stop offset="1" stopColor={finalGradientColors[1]} stopOpacity="1" />
              </LinearGradient>
            </Defs>
            
            {/* Background circle */}
            <Circle
              cx={size / 2}
              cy={size / 2}
              r={radius}
              strokeWidth={strokeWidth}
              stroke="rgba(255, 255, 255, 0.2)"
              fill="transparent"
            />
            
            {/* Foreground circle */}
            <Circle
              cx={size / 2}
              cy={size / 2}
              r={radius}
              strokeWidth={strokeWidth}
              stroke={`url(#grad-${title})`}
              fill="transparent"
              strokeDasharray={circumference}
              strokeDashoffset={strokeDashoffset}
              strokeLinecap="round"
              rotation="-90"
              origin={`${size / 2}, ${size / 2}`}
            />
            
            {/* Center text */}
            <Text
              x={size / 2}
              y={size / 2}
              textAnchor="middle"
              fontSize="30"
              fontWeight="bold"
              fill="#FFF"
            >
              {current.toFixed(1)}
            </Text>
            
            <Text
              x={size / 2}
              y={size / 2 + 30}
              textAnchor="middle"
              fontSize="16"
              fill="#FFF"
            >
              kW
            </Text>
          </Svg>
          
          <DefaultView style={{ flexDirection: 'row', justifyContent: 'space-between', width: '100%', paddingHorizontal: 10 }}>
            <DefaultText style={dashboardStyles.maxValue}>
              Max Today: {max.toFixed(1)} kW
            </DefaultText>
          </DefaultView>
        </DefaultView>
      </TouchableOpacity>
    );
  };

  // Loading state
  if (loading) {
    return (
      <DefaultView style={styles.background}>
        <StatusBar
          barStyle="light-content"
          backgroundColor="transparent"
          translucent
        />
        <ActivityIndicator size="large" color={styles.primaryColor} />
        <DefaultText style={styles.loadingText}>Loading...</DefaultText>
      </DefaultView>
    );
  }

  // No devices state
  if (!hasDevices) {
    return (
      <DefaultView style={styles.background}>
        <StatusBar
          barStyle="light-content"
          backgroundColor="transparent"
          translucent
        />
        <DefaultView style={styles.header}>
          <Image
            source={require("../../assets/images/alumo-logo.png")}
            style={styles.image}
            resizeMode="contain"
          />
        </DefaultView>
        
        <DefaultView style={{ flex: 1, padding: 20, alignItems: 'center', justifyContent: 'center' }}>
          <DefaultText style={styles.footerText}>
            Profile Setup Pending
          </DefaultText>
          
          <DefaultText style={styles.footerText}>
            Your profile is awaiting setup by an administrator.
          </DefaultText>
        </DefaultView>
      </DefaultView>
    );
  }

  // Has devices state - show dashboard
  return (
    <DefaultView style={styles.background}>
      <StatusBar
        barStyle="light-content"
        backgroundColor="transparent"
        translucent
      />
      
      {/* Dashboard content */}
      <DefaultView style={dashboardStyles.dashboardContainer}>
        <DayTimeCard />
        <BatteryIndicator />

        <DefaultView style={dashboardStyles.powerMetricsRow}>
          <PowerDial 
            title="Solar Power" 
            current={solarData.current} 
            max={solarData.max} 
            capacity={solarData.capacity}
            color={theme.primaryColor}
            style={{ flex: 1, marginRight: 5 }}
            onPress={() => setSolarModalVisible(true)}
          />
          
          <PowerDial 
            title="Load Power" 
            current={loadData.current} 
            max={loadData.max} 
            capacity={loadData.capacity}
            color={theme.dangerColor}
            style={{ flex: 1, marginLeft: 5 }}
            gradientColors={["#FF5252", "#00E798"]}
            onPress={() => setLoadModalVisible(true)}
          />
        </DefaultView>
        
        {/* Modals */}
        <GraphModal
          isVisible={batteryModalVisible}
          onClose={() => setBatteryModalVisible(false)}
          title="Battery Level (24h)"
          data={historicalData.battery}
          yLabel="%"
          color={theme.primaryColor}
          domain={{ y: [0, 100] }}
          lastValue={Math.abs(historicalData.batteryCharging[historicalData.batteryCharging.length - 1]?.value || 0)}
          lastValueLabel={batteryData.isCharging ? "Current Charging Power" : "Current Discharging Power"}
          lastValueUnit="kW"
        />
        
        <GraphModal
          isVisible={solarModalVisible}
          onClose={() => setSolarModalVisible(false)}
          title="Solar Power (24h)"
          data={historicalData.solar}
          yLabel="kW"
          color="#FFA500"
          lastValue={solarData.current}
          lastValueLabel="Current Solar Power"
        />
        
        <GraphModal
          isVisible={loadModalVisible}
          onClose={() => setLoadModalVisible(false)}
          title="Load Power (24h)"
          data={historicalData.load}
          yLabel="kW"
          color={theme.dangerColor}
          lastValue={loadData.current}
          lastValueLabel="Current Load Power"
        />
      </DefaultView>
    </DefaultView>
  );
}

// Dashboard-specific styles
const screenWidth = Dimensions.get('window').width;

// Dashboard-specific styles - add this at the bottom
const modalStyles = StyleSheet.create({
  container: {
    // Use a darker background matching the app background
    // backgroundColor set dynamically from styles.background.backgroundColor
    width: screenWidth - 40,
    borderRadius: 12,
    padding: 20,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#444'
  },
  title: {
    fontSize: 20,
    fontFamily: 'Century-Gothic-Bold',
    color: '#fff',
    marginBottom: 20
  },
  chartContainer: {
    // backgroundColor set dynamically to match the main background
    borderRadius: 8, 
    padding: 20,
    marginBottom: 15,
    borderWidth: 1,
    borderColor: '#333'
  },
  chartYLabel: {
    color: '#ccc',
    fontSize: 12,
    position: 'absolute',
    left: 5,
    top: '50%',
    transform: [{ rotate: '-90deg' }]
  },
  lastValueText: {
    color: '#fff',
    fontSize: 16,
    fontFamily: 'Century-Gothic',
    marginBottom: 15
  },
  closeButton: {
    position: 'absolute',
    top: 10,
    right: 10,
  },
  noDataText: {
    color: '#ccc',
    marginBottom: 20
  }
});
