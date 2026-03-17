import { Feather } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { useRouter } from "expo-router";
import React, { useRef, useState } from "react";
import {
    Dimensions,
    FlatList,
    Image,
    SafeAreaView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from "react-native";
import Animated, {
    Extrapolate,
    interpolate,
    runOnJS,
    useAnimatedScrollHandler,
    useAnimatedStyle,
    useSharedValue,
} from "react-native-reanimated";

const { width, height } = Dimensions.get("window");

interface OnboardingItem {
  id: string;
  title: string;
  highlight: string;
  description: string;
  image: any;
  buttonText: string;
  showScanOverlay?: boolean;
}

const DATA: OnboardingItem[] = [
  {
    id: "1",
    title: "Scan Any",
    highlight: "Prescription",
    description:
      "Snap a photo of your handwritten script. RxGuardian's advanced AI decodes the details in seconds.",
    image: { uri: "https://placeholder.com/scan-bg" },
    buttonText: "Next",
    showScanOverlay: true,
  },
  {
    id: "2",
    title: "Safety",
    highlight: "First",
    description:
      "RxGuardian analyzes every new prescription against your current meds to stop dangerous interactions.",
    image: { uri: "https://placeholder.com/interaction-bg" },
    buttonText: "Next",
  },
  {
    id: "3",
    title: "Never Miss",
    highlight: "a Dose",
    description:
      "AI-powered scheduling adapts to your life, so you can focus on getting better, not just remembering pills.",
    image: { uri: "https://placeholder.com/streak-bg" },
    buttonText: "Get Started",
  },
];

const PaginationDot = ({
  index,
  scrollX,
}: {
  index: number;
  scrollX: Animated.SharedValue<number>;
}) => {
  const animatedDotStyle = useAnimatedStyle(() => {
    const inputRange = [
      (index - 1) * width,
      index * width,
      (index + 1) * width,
    ];

    const dotWidth = interpolate(
      scrollX.value,
      inputRange,
      [8, 24, 8],
      Extrapolate.CLAMP,
    );

    const opacity = interpolate(
      scrollX.value,
      inputRange,
      [0.3, 1, 0.3],
      Extrapolate.CLAMP,
    );

    return {
      width: dotWidth,
      opacity,
    };
  });

  return <Animated.View style={[styles.dot, animatedDotStyle]} />;
};

export default function OnboardingPager() {
  const router = useRouter();
  const flatListRef = useRef<FlatList>(null);

  const scrollX = useSharedValue(0);
  const [currentIndex, setCurrentIndex] = useState(0);

  const onScroll = useAnimatedScrollHandler({
    onScroll: (event) => {
      scrollX.value = event.contentOffset.x;
    },
    onMomentumEnd: (event) => {
      const index = Math.round(event.contentOffset.x / width);
      runOnJS(setCurrentIndex)(index);
    },
  });

  const handleNext = () => {
    if (currentIndex < DATA.length - 1) {
      flatListRef.current?.scrollToIndex({
        index: currentIndex + 1,
      });
    } else {
      router.replace("/home");
    }
  };

  const renderItem = ({ item }: { item: OnboardingItem }) => (
    <View style={styles.slide}>
      <View style={styles.imageWrapper}>
        <View style={styles.card}>
          <Image source={item.image} style={styles.mainImage} />
          {item.showScanOverlay && (
            <View style={styles.scanOverlay}>
              <View style={styles.aiBadge}>
                <Text style={styles.aiBadgeText}>✧ AI SCANNING</Text>
              </View>
              <View style={styles.scanLine} />
            </View>
          )}
        </View>
      </View>

      <View style={styles.textWrapper}>
        <Text style={styles.title}>
          {item.title} {"\n"}
          <Text style={styles.highlight}>{item.highlight}</Text>
        </Text>

        <Text style={styles.description}>{item.description}</Text>
      </View>
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.replace("/home")}>
          <Text style={styles.skipText}>Skip ›</Text>
        </TouchableOpacity>
      </View>

      <Animated.FlatList
        ref={flatListRef as any}
        data={DATA}
        renderItem={renderItem}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        onScroll={onScroll}
        scrollEventThrottle={16}
        keyExtractor={(item) => item.id}
        contentContainerStyle={{ flexGrow: 1 }}
      />

      <View style={styles.footer}>
        <View style={styles.paginationContainer}>
          {DATA.map((_, i) => (
            <PaginationDot key={i} index={i} scrollX={scrollX} />
          ))}
        </View>

        <TouchableOpacity
          activeOpacity={0.9}
          style={styles.buttonContainer}
          onPress={handleNext}
        >
          <LinearGradient
            colors={["#2D458E", "#1E293B"]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            style={styles.button}
          >
            <Text style={styles.buttonText}>
              {DATA[currentIndex].buttonText}
            </Text>

            <View style={styles.iconCircle}>
              <Feather name="arrow-right" size={20} color="white" />
            </View>
          </LinearGradient>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#F8FAFC" },

  header: {
    paddingHorizontal: 25,
    alignItems: "flex-end",
    paddingTop: 10,
  },

  skipText: {
    color: "#64748B",
    fontSize: 16,
    fontWeight: "500",
  },

  slide: {
    width,
    flex: 1, // ✅ prevents clipping
    alignItems: "center",
    paddingHorizontal: 30,
  },

  imageWrapper: {
    width: "100%",
    height: height * 0.42,
    marginTop: 20,
  },

  card: {
    flex: 1,
    borderRadius: 30,
    overflow: "hidden",
    backgroundColor: "#fff",
    elevation: 5,
    shadowOpacity: 0.1,
  },

  mainImage: {
    width: "100%",
    height: "100%",
  },

  textWrapper: {
    marginTop: 35,
    marginBottom: 60,
    alignItems: "center",
    paddingHorizontal: 10,
  },

  title: {
    fontSize: 32,
    fontWeight: "800",
    textAlign: "center",
    color: "#0F172A",
    lineHeight: 38,
    letterSpacing: 0.3,
  },

  highlight: {
    color: "#2D458E",
  },

  description: {
    textAlign: "center",
    color: "#64748B",
    fontSize: 16,
    marginTop: 18,
    lineHeight: 26, // ✅ better readability
    paddingHorizontal: 10,
  },

  footer: {
    paddingHorizontal: 25,
    paddingBottom: 40,
  },

  paginationContainer: {
    flexDirection: "row",
    justifyContent: "center",
    marginBottom: 35,
    gap: 8,
  },

  dot: {
    height: 8,
    borderRadius: 4,
    backgroundColor: "#2D458E",
  },

  buttonContainer: {
    width: "100%",
  },

  button: {
    height: 65,
    borderRadius: 35,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
  },

  buttonText: {
    color: "white",
    fontSize: 18,
    fontWeight: "700",
  },

  iconCircle: {
    position: "absolute",
    right: 15,
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "rgba(255,255,255,0.2)",
    alignItems: "center",
    justifyContent: "center",
  },

  scanOverlay: {
    ...StyleSheet.absoluteFillObject,
    alignItems: "center",
    justifyContent: "center",
  },

  aiBadge: {
    position: "absolute",
    top: 30,
    backgroundColor: "#2D458E",
    padding: 6,
    borderRadius: 15,
  },

  aiBadgeText: {
    color: "white",
    fontSize: 10,
    fontWeight: "bold",
  },

  scanLine: {
    width: "80%",
    height: 2,
    backgroundColor: "#3b82f6",
  },
});
