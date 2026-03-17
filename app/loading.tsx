import { Feather } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { useRouter } from "expo-router";
import { useEffect, useRef } from "react";
import {
    Animated,
    Easing,
    SafeAreaView,
    StyleSheet,
    Text,
    View,
} from "react-native";

export default function LoadingScreen() {
  const router = useRouter();
  const progress = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.timing(progress, {
      toValue: 1,
      duration: 2200,
      easing: Easing.out(Easing.ease),
      useNativeDriver: false,
    }).start(() => {
      router.replace("/onboarding");
    });
  }, []);

  const widthInterpolation = progress.interpolate({
    inputRange: [0, 1],
    outputRange: ["0%", "100%"],
  });

  return (
    <LinearGradient
      colors={["#4338CA", "#6D28D9"]} // EXACT SAME AS LOGIN
      style={{ flex: 1 }}
    >
      <SafeAreaView style={styles.container}>
        {/* CENTER CONTENT */}
        <View style={styles.centerSection}>
          <View style={styles.logoCircle}>
            <Feather name="shield" size={42} color="#6D28D9" />
          </View>

          <Text style={styles.title}>RxGuardian</Text>

          <Text style={styles.subtitle}>DECODE. PROTECT. ADHERE.</Text>
        </View>

        {/* BOTTOM SECTION */}
        <View style={styles.bottomSection}>
          <View style={styles.progressTrack}>
            <Animated.View
              style={[styles.progressFill, { width: widthInterpolation }]}
            />
          </View>

          <Text style={styles.statusText}>
            Establishing secure connection...
          </Text>

          <Text style={styles.version}>V2.0.4 • AI-POWERED</Text>
        </View>
      </SafeAreaView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "space-between",
    paddingVertical: 80,
    paddingHorizontal: 24, // match login horizontal padding
  },

  centerSection: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },

  logoCircle: {
    width: 110, // MATCH LOGIN
    height: 110,
    borderRadius: 55,
    backgroundColor: "white",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 20,
  },

  title: {
    fontSize: 32, // MATCH LOGIN
    fontWeight: "700",
    color: "white",
  },

  subtitle: {
    marginTop: 6,
    fontSize: 16,
    color: "#E0E7FF",
  },

  bottomSection: {
    alignItems: "center",
    marginBottom: 40,
  },

  progressTrack: {
    width: "80%",
    height: 6,
    backgroundColor: "rgba(255,255,255,0.3)",
    borderRadius: 3,
    overflow: "hidden",
    marginBottom: 15,
  },

  progressFill: {
    height: "100%",
    backgroundColor: "white",
    borderRadius: 3,
  },

  statusText: {
    color: "#E0E7FF",
    marginBottom: 20,
  },

  version: {
    fontSize: 12,
    color: "rgba(255,255,255,0.6)",
  },
});
