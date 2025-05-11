import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  Image,
  TouchableOpacity,
  StatusBar,
  StyleSheet,
} from "react-native";
import { useRouter } from "expo-router";
import { useThemeStyles } from "../theme"; // Import the custom theme hook
import * as Font from "expo-font";
import { supabase } from "../lib/supabaseClient";
import { AuthChangeEvent, Session } from "@supabase/supabase-js";

export default function LandingPage() {
  const router = useRouter();
  const styles = useThemeStyles();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const checkSession = async () => {
      try {
        const { data, error } = await supabase.auth.getSession();
        if (error) {
          console.error("Error fetching session:", error.message);
          setLoading(false);
          return;
        }

        if (data.session) {
          // console.log("Session found:", data.session); // Debugging
          router.replace("/(tabs)"); // Redirect to the main app
        } else {
          console.log("No session found");
          setLoading(false);
        }
      } catch (error) {
        console.error("Error checking session:", error);
        setLoading(false);
      }
    };

    checkSession();

    // Optional: Listen for auth state changes
    const { data: authListener } = supabase.auth.onAuthStateChange(
      (_event: AuthChangeEvent, session: Session | null) => {
        if (session) {
          // console.log("Auth state changed. Redirecting...");
          router.replace("/(tabs)"); // Redirect to main app on successful login
        }
      }
    );

    // Cleanup auth listener
    return () => {
      authListener?.subscription?.unsubscribe();
    };
  }, [router]);

  const loadFonts = async () => {
    await Font.loadAsync({
      "Century-Gothic": require("../assets/fonts/centurygothic.ttf"),
      "Century-Gothic-Bold": require("../assets/fonts/centurygothic_bold.ttf"),
    });
  };

  useEffect(() => {
    loadFonts();
  }, []);

  return (
    <View style={styles.background}>
      <StatusBar
        barStyle={styles.isDarkMode ? "light-content" : "light-content"}
        backgroundColor="transparent"
        translucent
      />
      {loading ? (
        <View style={styles.loadingIndicator}>
          <Text style={styles.loadingText}>Loading...</Text>
        </View>
      ) : (
      <View style={styles.container}>
        <View style={styles.header}>
          <Image
            source={require("../assets/images/alumo-logo.png")}
            style={styles.image}
            resizeMode="contain"
          />
        </View>
        <View style={styles.buttonContainer}>
          <TouchableOpacity style={styles.button} onPress={() => router.push("/login")}>
            <Text style={styles.buttonText}>Login</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.button} onPress={() => router.push("/signup")}>
            <Text style={styles.buttonText}>Signup</Text>
          </TouchableOpacity>
        </View>
      </View>
      )}
    </View>
  );
}