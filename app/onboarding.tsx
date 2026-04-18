import { Feather } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { useRouter } from "expo-router";
import { useRef, useState } from "react";
import {
  Dimensions,
  FlatList,
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

const DATA = [
  {
    id: "1",
    title: "Scan Any",
    highlight: "Prescription",
    description:
      "Snap a photo of your handwritten script. AI decodes it instantly.",
    buttonText: "Next",
  },
  {
    id: "2",
    title: "Safety",
    highlight: "First",
    description: "Detect dangerous drug interactions before they harm you.",
    buttonText: "Next",
  },
  {
    id: "3",
    title: "Never Miss",
    highlight: "a Dose",
    description: "Smart reminders and tracking keep your health on track.",
    buttonText: "Get Started",
  },
];

const PaginationDot = ({ index, scrollX }: any) => {
  const style = useAnimatedStyle(() => {
    const inputRange = [
      (index - 1) * width,
      index * width,
      (index + 1) * width,
    ];

    return {
      width: interpolate(
        scrollX.value,
        inputRange,
        [8, 24, 8],
        Extrapolate.CLAMP,
      ),
      opacity: interpolate(
        scrollX.value,
        inputRange,
        [0.3, 1, 0.3],
        Extrapolate.CLAMP,
      ),
    };
  });

  return <Animated.View style={[styles.dot, style]} />;
};

export default function OnboardingPager() {
  const router = useRouter();
  const flatListRef = useRef<FlatList>(null);

  const scrollX = useSharedValue(0);
  const [currentIndex, setCurrentIndex] = useState(0);

  const onScroll = useAnimatedScrollHandler({
    onScroll: (e) => {
      scrollX.value = e.contentOffset.x;
    },
    onMomentumEnd: (e) => {
      runOnJS(setCurrentIndex)(Math.round(e.contentOffset.x / width));
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

  const renderItem = ({ item }: any) => (
    <View style={styles.slide}>
      {/* VISUAL CARD */}
      <View style={styles.card}>
        <LinearGradient
          colors={["#1E293B", "#2D458E"]}
          style={styles.gradientCard}
        >
          {/* SLIDE 1 */}
          {item.id === "1" && (
            <>
              <Feather name="camera" size={60} color="white" />
              <View style={styles.scanLine} />
              <Text style={styles.cardLabel}>AI SCANNING</Text>
            </>
          )}

          {/* SLIDE 2 */}
          {item.id === "2" && (
            <>
              <Feather name="shield" size={60} color="white" />
              <Text style={styles.cardLabel}>Interaction Check</Text>
              <Text style={styles.warning}>⚠ High Risk Detected</Text>
            </>
          )}

          {/* SLIDE 3 */}
          {item.id === "3" && (
            <>
              <Feather name="bell" size={60} color="white" />
              <Text style={styles.cardLabel}>Daily Reminder</Text>
              <Text style={styles.success}>✔ 100% Adherence</Text>
            </>
          )}
        </LinearGradient>
      </View>

      {/* TEXT */}
      <View style={styles.textBox}>
        <Text style={styles.title}>
          {item.title} {"\n"}
          <Text style={styles.highlight}>{item.highlight}</Text>
        </Text>

        <Text style={styles.desc}>{item.description}</Text>
      </View>
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      {/* SKIP */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.replace("/home")}>
          <Text style={styles.skip}>Skip ›</Text>
        </TouchableOpacity>
      </View>

      {/* SLIDES */}
      <Animated.FlatList
        ref={flatListRef as any}
        data={DATA}
        renderItem={renderItem}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        onScroll={onScroll}
        keyExtractor={(item) => item.id}
      />

      {/* FOOTER */}
      <View style={styles.footer}>
        <View style={styles.pagination}>
          {DATA.map((_, i) => (
            <PaginationDot key={i} index={i} scrollX={scrollX} />
          ))}
        </View>

        <TouchableOpacity style={styles.btnWrap} onPress={handleNext}>
          <LinearGradient colors={["#2D458E", "#1E293B"]} style={styles.btn}>
            <Text style={styles.btnText}>{DATA[currentIndex].buttonText}</Text>

            <View style={styles.arrow}>
              <Feather name="arrow-right" size={18} color="#fff" />
            </View>
          </LinearGradient>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

// ─── STYLES ───
const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#F8FAFC" },

  header: { alignItems: "flex-end", padding: 20 },
  skip: { color: "#64748B", fontSize: 16 },

  slide: {
    width,
    alignItems: "center",
    paddingHorizontal: 25,
  },

  card: {
    width: "100%",
    height: height * 0.42,
    borderRadius: 30,
    overflow: "hidden",
    marginTop: 10,
    elevation: 6,
  },

  gradientCard: {
    flex: 1,
    borderRadius: 30,
    justifyContent: "center",
    alignItems: "center",
    gap: 15,
  },

  scanLine: {
    width: "70%",
    height: 2,
    backgroundColor: "#3B82F6",
  },

  cardLabel: {
    color: "white",
    fontSize: 14,
    fontWeight: "600",
  },

  warning: {
    color: "#FCA5A5",
    fontSize: 14,
    fontWeight: "600",
  },

  success: {
    color: "#86EFAC",
    fontSize: 14,
    fontWeight: "600",
  },

  textBox: { marginTop: 35, alignItems: "center" },

  title: {
    fontSize: 30,
    fontWeight: "800",
    textAlign: "center",
    color: "#0F172A",
  },

  highlight: { color: "#2D458E" },

  desc: {
    textAlign: "center",
    color: "#64748B",
    fontSize: 16,
    marginTop: 15,
    lineHeight: 24,
  },

  footer: { padding: 25 },

  pagination: {
    flexDirection: "row",
    justifyContent: "center",
    marginBottom: 25,
    gap: 6,
  },

  dot: {
    height: 8,
    borderRadius: 4,
    backgroundColor: "#2D458E",
  },

  btnWrap: { width: "100%" },

  btn: {
    height: 60,
    borderRadius: 30,
    justifyContent: "center",
    alignItems: "center",
  },

  btnText: {
    color: "#fff",
    fontSize: 18,
    fontWeight: "700",
  },

  arrow: {
    position: "absolute",
    right: 15,
    backgroundColor: "rgba(255,255,255,0.2)",
    width: 35,
    height: 35,
    borderRadius: 20,
    alignItems: "center",
    justifyContent: "center",
  },
});
