import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  TextInput,
  Image,
  Alert,
  Keyboard,
  StatusBar,
  TouchableWithoutFeedback,
  TouchableOpacity,
  Platform,
  ScrollView,
} from "react-native";
import { useRouter } from "expo-router";
import { KeyboardAwareScrollView } from "react-native-keyboard-aware-scroll-view";
import { supabase } from "../lib/supabaseClient";
import * as SecureStore from "expo-secure-store";
import { useThemeStyles } from "../theme"; // Import theme hook
import * as Font from "expo-font";

export default function Login() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const styles = useThemeStyles();
  
  const loadFonts = async () => {
    await Font.loadAsync({
    "Century-Gothic": require("../assets/fonts/centurygothic.ttf"),
    "Century-Gothic-Bold": require("../assets/fonts/centurygothic_bold.ttf"),
    });
  };

    useEffect(() => {
        loadFonts();
    }, []);

  const handleLogin = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        Alert.alert("Login Failed", error.message);
      } else if (data.session) {
        await SecureStore.setItemAsync(
          "supabase_token",
          data.session.access_token
        );
        router.replace("/(tabs)");
      } else {
        Alert.alert("Login Error", "Unexpected response from server.");
      }
    } catch (err: any) {
      Alert.alert("Login Error", err.message || "Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.background}>
      <StatusBar
        barStyle={styles.isDarkMode ? "light-content" : "light-content"}
        backgroundColor="transparent"
        translucent
      />
      <KeyboardAwareScrollView
        contentContainerStyle={{ flexGrow: 1, justifyContent: "center" }}
        enableOnAndroid={true}
        extraScrollHeight={20} // Adds extra space between the input and the keyboard
        keyboardShouldPersistTaps="handled" // Allows dismissing the keyboard by tapping outside
      >
        {/* Header */}
        <View style={styles.header}>
          <Image
            source={require("../assets/images/alumo-logo.png")}
            style={styles.image}
            resizeMode="contain"
          />
        </View>

        {/* Form */}
        <View style={styles.formContainer}>
          <TextInput
            style={styles.input}
            placeholder="Email"
            placeholderTextColor={styles.placeholder.color}
            value={email}
            onChangeText={setEmail}
            keyboardType="email-address"
            autoCapitalize="none"
          />
          <TextInput
            style={styles.input}
            placeholder="Password"
            placeholderTextColor={styles.placeholder.color}
            value={password}
            onChangeText={setPassword}
            secureTextEntry
          />

          {/* Login Button */}
          <TouchableOpacity
            style={styles.button}
            onPress={handleLogin}
            disabled={loading}
          >
            <Text style={styles.buttonText}>
              {loading ? "Logging In..." : "Log In"}
            </Text>
          </TouchableOpacity>
        </View>

        {/* Footer */}
        <View style={styles.footer}>
          <Text style={styles.footerText}>
            Don't have an account?{" "}
            <Text
              style={styles.footerLink}
              onPress={() => router.push("/signup")}
            >
              Sign up
            </Text>
          </Text>
        </View>
      </KeyboardAwareScrollView>
    </View>
  );
}