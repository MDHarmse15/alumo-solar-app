import React, { useEffect, useState } from 'react';
import { ActivityIndicator, Image, StatusBar, View as RNView, Animated, Dimensions, StyleSheet } from 'react-native';
import { supabase } from '@/lib/supabaseClient';
import { THEME, useThemeStyles } from '../../theme';
import { View as DefaultView, Text as DefaultText } from 'react-native';
import * as Font from "expo-font";
import Svg, { Rect, G, Circle, Path, Text, LinearGradient, Stop, Defs } from 'react-native-svg';
import { Ionicons } from '@expo/vector-icons';
import * as Location from 'expo-location';

// Default location (approximate coordinates for a generic location)
const DEFAULT_LATITUDE = 37.7749; // San Francisco, CA as fallback
const DEFAULT_LONGITUDE = -122.4194;

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

// Mock data for the dashboard
const MOCK_DATA = {
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

export default function TabOneScreen() {
  const [hasDevices, setHasDevices] = useState<boolean | null>(null);
  const [loading, setLoading] = useState(true);
  const [userId, setUserId] = useState<string | null>(null);
  const [dayTime, setDayTime] = useState(MOCK_DATA.dayTime);
  const styles = useThemeStyles();
  const theme = THEME.dark;
  const [blinkOpacity] = useState(new Animated.Value(0.4));

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

  // Start blinking animation
  useEffect(() => {
    const blinkAnimation = Animated.loop(
      Animated.sequence([
        Animated.timing(blinkOpacity, {
          toValue: 1,
          duration: 800,
          useNativeDriver: true,
        }),
        Animated.timing(blinkOpacity, {
          toValue: 0.4,
          duration: 800,
          useNativeDriver: true,
        }),
      ])
    );
    
    blinkAnimation.start();
    
    return () => {
      blinkAnimation.stop();
    };
  }, []);

  const loadFonts = async () => {
    await Font.loadAsync({
    "Century-Gothic": require("../../assets/fonts/centurygothic.ttf"),
    "Century-Gothic-Bold": require("../../assets/fonts/centurygothic_bold.ttf"),
    });
  };

  useEffect(() => {
      loadFonts();
  }, []);

  useEffect(() => {
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
        
        // Check if user has any devices
        const { data: devices, error: devicesError } = await supabase
          .from('devices')
          .select('id')
          .eq('user_id', user.id)
          .limit(1);
        
        if (devicesError) {
          console.error("Error checking devices:", devicesError);
          setLoading(false);
          return;
        }
        
        // Set hasDevices based on whether any results were returned
        setHasDevices(devices && devices.length > 0);
        setLoading(false);
      } catch (error) {
        console.error("Unexpected error:", error);
        setLoading(false);
      }
    };

    checkUserDevices();
  }, []);

  // Update time every minute and get location on component mount
  useEffect(() => {
    // Update the current time immediately
    updateCurrentTime();
    
    // Request location and update sunrise/sunset times
    const updateLocation = async () => {
      try {
        // First check if location services are enabled
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
  }, []);
  
  // Function to update current time
  const updateCurrentTime = () => {
    setDayTime(prevState => ({
      ...prevState,
      currentTime: getCurrentTime(),
    }));
  };

  // Battery indicator component
  const BatteryIndicator = () => {
    const { level, isCharging } = MOCK_DATA.battery;
    const batteryWidth = 150;
    const batteryHeight = 75;
    const capWidth = 10;
    const flashColor = isCharging ? theme.primaryColor : theme.dangerColor;
    
    // Calculate the position for the flashing section based on charging state
    const flashSectionStyle = {
      position: 'absolute' as const,
      top: 4,
      left: 4 + ((batteryWidth - 8) * (level / 100)), // Position after the filled section
      width: (batteryWidth - 8) * 0.10, // 10% of battery width
      height: batteryHeight - 8,
      borderTopRightRadius: 6,
      borderBottomRightRadius: 6,
    };
    
    return (
      <DefaultView style={dashboardStyles.dashboardCard}>
        <DefaultText style={[dashboardStyles.cardTitle, { color: theme.textColor }]}>Battery Status</DefaultText>
        
        <DefaultView style={dashboardStyles.batteryContainer}>
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
            
            {/* Flashing section - always show */}
            <RNView style={{
              position: 'absolute' as const,
              top: 4,
              left: Math.min(4 + ((batteryWidth - 8) * (level / 100)), batteryWidth - ((batteryWidth - 8) * 0.10) - 4), // Position after fill or at end of battery
              width: (batteryWidth - 8) * 0.10, // 10% of battery width
              height: batteryHeight - 8,
              borderTopRightRadius: 6,
              borderBottomRightRadius: 6,
              borderTopLeftRadius: 6,
              borderBottomLeftRadius: 6,
            }}>
              <Animated.View style={{
                backgroundColor: flashColor,
                opacity: blinkOpacity,
                width: '100%',
                height: '100%',
                borderTopRightRadius: 6,
                borderBottomRightRadius: 6,
                borderTopLeftRadius: 6,
                borderBottomLeftRadius: 6,
              }} />
            </RNView>
          </Svg>
          
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
      </DefaultView>
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
    gradientColors = ["#00E798", undefined]
  }: { 
    title: string; 
    current: number; 
    max: number; 
    capacity: number;
    color: string;
    style?: any;
    gradientColors?: [string, string?];
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
      <DefaultView style={[dashboardStyles.dashboardCard, style]}>
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
      </DefaultView>
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
            current={MOCK_DATA.solar.current} 
            max={MOCK_DATA.solar.max} 
            capacity={MOCK_DATA.solar.capacity}
            color={theme.primaryColor}
            style={{ flex: 1, marginRight: 5 }}
          />
          
          <PowerDial 
            title="Load Power" 
            current={MOCK_DATA.load.current} 
            max={MOCK_DATA.load.max} 
            capacity={MOCK_DATA.load.capacity}
            color={theme.dangerColor}
            style={{ flex: 1, marginLeft: 5 }}
            gradientColors={["#FF5252", "#00E798"]}
          />
        </DefaultView>
      </DefaultView>
    </DefaultView>
  );
}

// Dashboard-specific styles
const screenWidth = Dimensions.get('window').width;
