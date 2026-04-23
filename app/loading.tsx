import React, { useEffect, useState } from "react";
import { View, StyleSheet, Text, Animated, Easing } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { Feather } from "@expo/vector-icons";
import { theme } from "../constants/theme";

export default function SplashScreen() {
  const [progress] = useState(new Animated.Value(0));

  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(progress, {
          toValue: 1,
          duration: 2000,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: false,
        }),
        Animated.timing(progress, {
          toValue: 0,
          duration: 0,
          useNativeDriver: false,
        }),
      ])
    ).start();
  }, []);

  const progressWidth = progress.interpolate({
    inputRange: [0, 1],
    outputRange: ["0%", "100%"],
  });

  return (
    <LinearGradient
      colors={["#1F3D89", "#5B21B6"]}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
      style={styles.container}
    >
      {/* Decorative background elements from SVG */}
      <View style={[styles.bgCircle, styles.circle1]} />
      <View style={[styles.bgCircle, styles.circle2]} />
      <View style={[styles.bgCircle, styles.circle3]} />

      <View style={styles.content}>
        <View style={styles.logoCircle}>
          <Feather name="shield" size={64} color="#1F3D89" />
          <View style={styles.innerLogoCircle}>
             <Feather name="plus" size={24} color="white" />
          </View>
        </View>
        <Text style={styles.title}>RxGuardian</Text>
        <Text style={styles.subtitle}>Intelligent Medication Care</Text>
      </View>

      <View style={styles.loaderContainer}>
        <View style={styles.progressBarBg}>
          <Animated.View style={[styles.progressBarFill, { width: progressWidth }]} />
        </View>
        <Text style={styles.loadingText}>Initializing system...</Text>
      </View>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  bgCircle: {
    position: "absolute",
    borderRadius: 1000,
  },
  circle1: {
    width: 384,
    height: 384,
    backgroundColor: "white",
    top: -128,
    left: -128,
    opacity: 0.05,
  },
  circle2: {
    width: 320,
    height: 320,
    backgroundColor: "#C084FC",
    bottom: 122,
    right: -122,
    opacity: 0.1,
  },
  circle3: {
    width: 384,
    height: 384,
    backgroundColor: "#60A5FA",
    bottom: -128,
    left: 3,
    opacity: 0.1,
  },
  content: {
    alignItems: "center",
    justifyContent: "center",
  },
  logoCircle: {
    width: 128,
    height: 128,
    borderRadius: 64,
    backgroundColor: "white",
    alignItems: "center",
    justifyContent: "center",
    elevation: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.3,
    shadowRadius: 15,
  },
  innerLogoCircle: {
    position: "absolute",
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "#5B21B6",
    borderWidth: 2,
    borderColor: "white",
    alignItems: "center",
    justifyContent: "center",
    bottom: 10,
    right: 10,
  },
  title: {
    fontSize: 36,
    fontWeight: "700",
    color: "white",
    marginTop: 24,
    letterSpacing: 1.5,
  },
  subtitle: {
    fontSize: 16,
    color: "rgba(255, 255, 255, 0.7)",
    marginTop: 8,
    letterSpacing: 0.5,
  },
  loaderContainer: {
    position: "absolute",
    bottom: 80,
    width: "100%",
    alignItems: "center",
    paddingHorizontal: 60,
  },
  progressBarBg: {
    width: "100%",
    height: 6,
    backgroundColor: "rgba(255, 255, 255, 0.2)",
    borderRadius: 3,
    overflow: "hidden",
  },
  progressBarFill: {
    height: "100%",
    backgroundColor: "white",
    borderRadius: 3,
  },
  loadingText: {
    color: "rgba(255, 255, 255, 0.6)",
    fontSize: 12,
    marginTop: 12,
    textTransform: "uppercase",
    letterSpacing: 1,
  },
});

