import { useRouter } from "expo-router";
import { useEffect } from "react";
import { View, StyleSheet, useColorScheme } from "react-native";
import { THEME } from "../theme";

const ResetToRoot = () => {
  const router = useRouter();
  const colorScheme = useColorScheme();
  const theme = colorScheme === "dark" ? THEME.dark : THEME.light;

  useEffect(() => {
    setTimeout(() => {
      router.replace("/");
    }, 0);
  }, [router]);

  return <View style={[styles.container, { backgroundColor: theme.backgroundColor }]} />;
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
});

export default ResetToRoot;