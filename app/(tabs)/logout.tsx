import React, { useCallback, useEffect } from "react";
import { View, Text, Alert, ActivityIndicator, StatusBar } from "react-native";
import { useRouter } from "expo-router";
import { useFocusEffect } from "@react-navigation/native";
import * as SecureStore from "expo-secure-store";
import { supabase } from "../../lib/supabaseClient";
import { useThemeStyles } from "../../theme"; // Import styles from theme.tsx
import { KeyboardAwareScrollView } from "react-native-keyboard-aware-scroll-view";
import * as Font from "expo-font";

export default function Logout() {
  const router = useRouter();
  const styles = useThemeStyles(); // Apply theme styles

  const loadFonts = async () => {
    await Font.loadAsync({
      "Century-Gothic": require("../../assets/fonts/centurygothic.ttf"),
      "Century-Gothic-Bold": require("../../assets/fonts/centurygothic_bold.ttf"),
    });
  };

  useEffect(() => {
    loadFonts();
  }, []);

  const logoutUser = async () => {
    try {
      console.log("Logging out...");

      // Sign out from Supabase
      const { error } = await supabase.auth.signOut();
      if (error) throw error;

      // Remove stored session tokens from SecureStore
      await SecureStore.deleteItemAsync("supabase_token");
      await SecureStore.deleteItemAsync("refresh_token");

      // Clear Supabase session cache
      await supabase.auth.getSession(); // Forces a session refresh

      console.log("Session cleared.");
      router.replace("/resettoroot"); // Redirect to login/reset screen
    } catch (error) {
      console.error("Logout Error:", error instanceof Error ? error.message : "Unknown error");
      Alert.alert("Logout Error", "An error occurred while logging out.");
    }
  };

  useFocusEffect(
    useCallback(() => {
      Alert.alert(
        "Confirm Logout",
        "Are you sure you want to log out?",
        [
          { text: "Cancel", onPress: () => router.replace("/(tabs)"), style: "cancel" },
          { text: "Yes", onPress: logoutUser },
        ],
        { cancelable: false }
      );
    }, [])
  );

  return (
    <View style={styles.background}>
      <StatusBar 
        barStyle="light-content" 
        backgroundColor="transparent" 
        translucent 
      />
      <KeyboardAwareScrollView
        contentContainerStyle={{ flexGrow: 1, justifyContent: "center" }}
        enableOnAndroid={true}
        extraScrollHeight={20} 
        keyboardShouldPersistTaps="handled" 
      >
        {/* Footer */}
        <View style={styles.footer}>
          <Text style={styles.footerText}>Logging out...</Text>
          <ActivityIndicator size="large" color={styles.primaryColor} />
        </View>
      </KeyboardAwareScrollView>
    </View>
  );
}