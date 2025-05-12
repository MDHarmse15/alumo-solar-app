import React, { useEffect, useState } from 'react';
import { ActivityIndicator, Image, StatusBar, View as RNView, Animated, Dimensions, StyleSheet } from 'react-native';
import { supabase } from '@/lib/supabaseClient';
import { useThemeStyles } from '../../theme';
import { View as DefaultView, Text as DefaultText } from 'react-native';
import * as Font from "expo-font";
import Svg, { Rect, G, Circle, Path, Text, LinearGradient, Stop, Defs } from 'react-native-svg';
import { Ionicons } from '@expo/vector-icons';

// Mock data for the dashboard
const MOCK_DATA = {
  battery: {
    level: 72, // percentage
    isCharging: true,
  },
  load: {
    current: 2.4, // kW
    max: 4.5, // kW
  },
  solar: {
    current: 3.7, // kW
    max: 5.0, // kW
  }
};

export default function TabOneScreen() {
  const [hasDevices, setHasDevices] = useState<boolean | null>(null);
  const [loading, setLoading] = useState(true);
  const [userId, setUserId] = useState<string | null>(null);
  const styles = useThemeStyles();
  const [blinkOpacity] = useState(new Animated.Value(0.4));

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

  // Battery indicator component
  const BatteryIndicator = () => {
    const { level, isCharging } = MOCK_DATA.battery;
    const batteryWidth = 150;
    const batteryHeight = 75;
    const capWidth = 10;
    const fillColor = isCharging ? '#4CAF50' : '#F44336';
    
    return (
      <DefaultView style={dashboardStyles.dashboardCard}>
        <DefaultText style={dashboardStyles.cardTitle}>Battery Status</DefaultText>
        
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
              stroke="#FFF"
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
              fill="#FFF"
            />
            
            {/* Battery fill */}
            <Rect
              x="4"
              y="4"
              width={(batteryWidth - 8) * (level / 100)}
              height={batteryHeight - 8}
              rx="6"
              ry="6"
              fill="#00E798"
            />
            
            {/* Top 5% fill with charging/discharging color */}
            <RNView style={{
              position: 'absolute', 
              top: 4, 
              left: 4, 
              width: (batteryWidth - 8), 
              height: (batteryHeight - 8) * 0.05
            }}>
              <Animated.View style={{
                backgroundColor: fillColor,
                opacity: blinkOpacity,
                borderTopLeftRadius: 6,
                borderTopRightRadius: 6,
                width: '100%',
                height: '100%'
              }} />
            </RNView>
            
            {/* Battery percentage text */}
            <Text
              x={batteryWidth / 2}
              y={batteryHeight / 2 + 7}
              textAnchor="middle"
              fontSize="24"
              fontWeight="bold"
              fill="#FFF"
            >
              {level}%
            </Text>
          </Svg>
          
          <DefaultView style={dashboardStyles.statusIndicator}>
            <Ionicons 
              name={isCharging ? "flash" : "flash-off"} 
              size={24} 
              color={isCharging ? "#4CAF50" : "#F44336"} 
            />
            <DefaultText style={dashboardStyles.statusText}>
              {isCharging ? "Charging" : "Discharging"}
            </DefaultText>
          </DefaultView>
        </DefaultView>
      </DefaultView>
    );
  };

  // Power Dial component
  const PowerDial = ({ 
    title, 
    current, 
    max, 
    color 
  }: { 
    title: string; 
    current: number; 
    max: number; 
    color: string; 
  }) => {
    const size = 150;
    const strokeWidth = 15;
    const radius = (size - strokeWidth) / 2;
    const circumference = radius * 2 * Math.PI;
    const currentPercentage = (current / max) * 100;
    const strokeDashoffset = circumference - (circumference * currentPercentage) / 100;
    
    return (
      <DefaultView style={dashboardStyles.dashboardCard}>
        <DefaultText style={dashboardStyles.cardTitle}>{title}</DefaultText>
        
        <DefaultView style={dashboardStyles.dialContainer}>
          <Svg height={size} width={size}>
            <Defs>
              <LinearGradient id="grad" x1="0" y1="0" x2="1" y2="0">
                <Stop offset="0" stopColor="#00E798" stopOpacity="0.8" />
                <Stop offset="1" stopColor={color} stopOpacity="1" />
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
              stroke="url(#grad)"
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
              y={size / 2 - 10}
              textAnchor="middle"
              fontSize="30"
              fontWeight="bold"
              fill="#FFF"
            >
              {current.toFixed(1)}
            </Text>
            
            <Text
              x={size / 2}
              y={size / 2 + 20}
              textAnchor="middle"
              fontSize="16"
              fill="#FFF"
            >
              kW
            </Text>
          </Svg>
          
          <DefaultText style={dashboardStyles.maxValue}>
            Max Today: {max.toFixed(1)} kW
          </DefaultText>
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
      
      {/* Smaller header with logo */}
      <DefaultView style={dashboardStyles.smallHeader}>
        <Image
          source={require("../../assets/images/alumo-logo.png")}
          style={dashboardStyles.smallLogo}
          resizeMode="contain"
        />
        <DefaultText style={dashboardStyles.headerTitle}>Dashboard</DefaultText>
      </DefaultView>
      
      {/* Dashboard content */}
      <DefaultView style={dashboardStyles.dashboardContainer}>
        <BatteryIndicator />

        <DefaultView style={dashboardStyles.powerMetricsRow}>
          <PowerDial 
            title="Load Power" 
            current={MOCK_DATA.load.current} 
            max={MOCK_DATA.load.max} 
            color="#F44336" 
          />
          
          <PowerDial 
            title="Solar Power" 
            current={MOCK_DATA.solar.current} 
            max={MOCK_DATA.solar.max} 
            color="#FF9800" 
          />
        </DefaultView>
      </DefaultView>
    </DefaultView>
  );
}

// Dashboard-specific styles
const screenWidth = Dimensions.get('window').width;
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
    backgroundColor: 'rgba(0, 0, 0, 0.3)',
    borderRadius: 12,
    padding: 15,
    marginBottom: 15,
    alignItems: 'center',
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
    color: '#fff',
    marginLeft: 5,
  },
  powerMetricsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
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
});
