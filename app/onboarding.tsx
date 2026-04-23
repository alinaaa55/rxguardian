import React, { useRef, useState } from "react";
import { View, Text, StyleSheet, TouchableOpacity, Dimensions } from "react-native";
import PagerView from "react-native-pager-view";
import { LinearGradient } from "expo-linear-gradient";
import { Feather } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import { Image } from "expo-image";
import { storage } from "../services/storage";
import { theme } from "../constants/theme";

const { width } = Dimensions.get("window");

const ONBOARDING_DATA = [
  {
    title: "Schedule Your Medications",
    description: "Keep track of your health with ease. Set reminders for your pills and never miss a dose again.",
    image: require("../assets/onboarding-1.svg"),
  },
  {
    title: "AI Analysis Support",
    description: "Scan your prescriptions or search for medications. Get detailed insights and safety alerts powered by AI.",
    image: require("../assets/onboarding-2.svg"),
  },
  {
    title: "Stay Healthy Always",
    description: "Manage your medical records and stay connected with your healthcare providers for a better life.",
    image: require("../assets/onboarding-3.svg"),
  },
];

export default function OnboardingScreen() {
  const [currentPage, setCurrentPage] = useState(0);
  const pagerRef = useRef<PagerView>(null);
  const router = useRouter();

  const handleFinish = async () => {
    await storage.setOnboardingComplete(true);
    router.replace("/(tabs)");
  };

  const handleNext = () => {
    if (currentPage < 2) {
      pagerRef.current?.setPage(currentPage + 1);
    } else {
      handleFinish();
    }
  };

  const handleSkip = () => {
    handleFinish();
  };

  return (
    <View style={styles.container}>
      <TouchableOpacity style={styles.skipButton} onPress={handleSkip}>
        <Text style={styles.skipText}>Skip</Text>
      </TouchableOpacity>

      <PagerView
        style={styles.pagerView}
        initialPage={0}
        ref={pagerRef}
        onPageSelected={(e) => setCurrentPage(e.nativeEvent.position)}
      >
        {ONBOARDING_DATA.map((item, index) => (
          <View key={index} style={styles.page}>
            <View style={styles.imageContainer}>
              <Image
                source={item.image}
                style={styles.svgImage}
                contentMode="contain"
              />
            </View>
            
            <View style={styles.content}>
              <Text style={styles.title}>{item.title}</Text>
              <Text style={styles.description}>{item.description}</Text>
            </View>
          </View>
        ))}
      </PagerView>

      <SafeAreaView edges={["bottom"]} style={styles.footer}>
        <View style={styles.pagination}>
          {[0, 1, 2].map((i) => (
            <View
              key={i}
              style={[
                styles.dot,
                currentPage === i ? styles.activeDot : styles.inactiveDot,
              ]}
            />
          ))}
        </View>

        <TouchableOpacity style={styles.button} onPress={handleNext}>
          <LinearGradient
            colors={[theme.colors.primary, theme.colors.primaryAccent]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            style={styles.gradient}
          >
            <Text style={styles.buttonText}>
              {currentPage === 2 ? "Get Started" : "Next"}
            </Text>
            <Feather name="arrow-right" size={20} color="white" />
          </LinearGradient>
        </TouchableOpacity>
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "white",
  },
  skipButton: {
    position: "absolute",
    top: 60,
    right: 30,
    zIndex: 10,
    padding: 10,
  },
  skipText: {
    color: "#64748B",
    fontSize: 16,
    fontWeight: "600",
  },
  pagerView: {
    flex: 1,
  },
  page: {
    flex: 1,
    alignItems: "center",
  },
  imageContainer: {
    width: "100%",
    height: "60%",
    alignItems: "center",
    justifyContent: "center",
  },
  svgImage: {
    width: width * 0.8,
    height: width * 0.8,
  },
  content: {
    flex: 1,
    paddingHorizontal: 40,
    alignItems: "center",
  },
  title: {
    fontSize: 28,
    fontWeight: "bold",
    color: "#0F172A",
    textAlign: "center",
    marginBottom: 20,
  },
  description: {
    fontSize: 16,
    color: "#64748B",
    textAlign: "center",
    lineHeight: 24,
  },
  footer: {
    paddingBottom: 40,
  },
  pagination: {
    flexDirection: "row",
    justifyContent: "center",
    marginBottom: 30,
    gap: 8,
  },
  dot: {
    height: 8,
    borderRadius: 4,
  },
  activeDot: {
    width: 32,
    backgroundColor: theme.colors.primary,
  },
  inactiveDot: {
    width: 8,
    backgroundColor: "#E2E8F0",
  },
  button: {
    marginHorizontal: 40,
    height: 56,
    borderRadius: 28,
    overflow: "hidden",
    ...theme.shadows.md,
  },
  gradient: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 10,
  },
  buttonText: {
    color: "white",
    fontSize: 18,
    fontWeight: "bold",
  },
});

