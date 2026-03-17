import { Feather, Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { useRouter } from "expo-router";
import React from "react";
import {
    SafeAreaView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from "react-native";

export default function ScanScreen() {
  const router = useRouter();

  return (
    <LinearGradient
      colors={["#020617", "#020617", "#0B1B34"]}
      style={styles.container}
    >
      <SafeAreaView style={styles.safeArea}>
        {/* TOP BAR */}
        <View style={styles.topBar}>
          <TouchableOpacity
            style={styles.circleBtn}
            onPress={() => router.back()}
          >
            <Feather name="x" size={20} color="white" />
          </TouchableOpacity>

          <View style={styles.rightIcons}>
            <TouchableOpacity style={styles.circleBtn}>
              <Ionicons name="flash-outline" size={20} color="white" />
            </TouchableOpacity>

            <TouchableOpacity style={styles.circleBtn}>
              <Feather name="help-circle" size={20} color="white" />
            </TouchableOpacity>
          </View>
        </View>

        {/* HIPAA BADGE */}
        <View style={styles.badge}>
          <Feather name="lock" size={14} color="#22c55e" />
          <Text style={styles.badgeText}> HIPAA Secure Processing</Text>
        </View>

        {/* SCANNER FRAME */}
        <View style={styles.frameContainer}>
          <View style={styles.frame}>
            <View style={styles.cornerTL} />
            <View style={styles.cornerTR} />
            <View style={styles.cornerBL} />
            <View style={styles.cornerBR} />

            <Text style={styles.frameText}>
              Align prescription within the frame
            </Text>
          </View>
        </View>
      </SafeAreaView>

      {/* BOTTOM CAMERA BAR */}
      <View style={styles.bottomBar}>
        <TouchableOpacity style={styles.bottomItem}>
          <MaterialCommunityIcons
            name="image-outline"
            size={24}
            color="#9CA3AF"
          />
          <Text style={styles.bottomText}>Gallery</Text>
        </TouchableOpacity>

        {/* CAPTURE BUTTON */}
        <View style={styles.captureWrapper}>
          <View style={styles.captureOuter}>
            <View style={styles.captureInner} />
          </View>
        </View>

        <TouchableOpacity style={styles.bottomItem}>
          <Feather name="rotate-ccw" size={22} color="#9CA3AF" />
          <Text style={styles.bottomText}>History</Text>
        </TouchableOpacity>
      </View>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },

  safeArea: {
    flex: 1,
  },

  topBar: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    marginTop: 10,
  },

  rightIcons: {
    flexDirection: "row",
    gap: 12,
  },

  circleBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "rgba(255,255,255,0.15)",
    justifyContent: "center",
    alignItems: "center",
  },

  badge: {
    flexDirection: "row",
    alignSelf: "center",
    backgroundColor: "#020617",
    borderRadius: 20,
    paddingHorizontal: 14,
    paddingVertical: 6,
    marginTop: 20,
    borderWidth: 1,
    borderColor: "#1e293b",
  },

  badgeText: {
    color: "#E2E8F0",
    fontSize: 12,
  },

  frameContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingBottom: 140, // keeps frame centered above camera bar
  },

  frame: {
    width: 340, // noticeably wider
    height: 360, // noticeably taller
    borderRadius: 24,
    borderWidth: 1.5,
    borderColor: "#64748B",
    justifyContent: "flex-end",
    alignItems: "center",
    paddingBottom: 22,
  },

  frameText: {
    color: "#E5E7EB",
    fontSize: 14,
    textAlign: "center",
    paddingHorizontal: 15,
  },

  cornerTL: {
    position: "absolute",
    top: 16,
    left: 16,
    width: 36,
    height: 36,
    borderTopWidth: 3,
    borderLeftWidth: 3,
    borderColor: "white",
    borderTopLeftRadius: 20,
  },

  cornerTR: {
    position: "absolute",
    top: 16,
    right: 16,
    width: 36,
    height: 36,
    borderTopWidth: 3,
    borderRightWidth: 3,
    borderColor: "white",
    borderTopRightRadius: 20,
  },

  cornerBL: {
    position: "absolute",
    bottom: 16,
    left: 16,
    width: 36,
    height: 36,
    borderBottomWidth: 3,
    borderLeftWidth: 3,
    borderColor: "white",
    borderBottomLeftRadius: 20,
  },

  cornerBR: {
    position: "absolute",
    bottom: 16,
    right: 16,
    width: 36,
    height: 36,
    borderBottomWidth: 3,
    borderRightWidth: 3,
    borderColor: "white",
    borderBottomRightRadius: 20,
  },

  bottomBar: {
    position: "absolute",
    bottom: 0,
    width: "100%",
    height: 140,
    backgroundColor: "#000",
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 40,
  },

  bottomItem: {
    alignItems: "center",
  },

  bottomText: {
    color: "#9CA3AF",
    fontSize: 12,
    marginTop: 4,
  },

  captureWrapper: {
    alignItems: "center",
  },

  captureOuter: {
    width: 86,
    height: 86,
    borderRadius: 43,
    borderWidth: 4,
    borderColor: "white",
    justifyContent: "center",
    alignItems: "center",
  },

  captureInner: {
    width: 66,
    height: 66,
    borderRadius: 33,
    backgroundColor: "#E5E7EB",
  },
});
