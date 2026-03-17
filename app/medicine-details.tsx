import { Feather, Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import React from "react";
import {
    SafeAreaView,
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from "react-native";

export default function MedicineDetails() {
  const router = useRouter();

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContainer}
      >
        {/* HEADER */}
        <View style={styles.header}>
          <TouchableOpacity
            style={styles.iconBtn}
            onPress={() => router.back()}
          >
            <Feather name="arrow-left" size={20} color="#1E3A8A" />
          </TouchableOpacity>

          <Text style={styles.headerTitle}>DETAILS</Text>

          <TouchableOpacity style={styles.iconBtn}>
            <Feather name="edit-2" size={18} color="#1E3A8A" />
          </TouchableOpacity>
        </View>

        {/* TITLE */}
        <View style={styles.titleSection}>
          <View style={styles.aiBadge}>
            <Text style={styles.aiText}>AI VERIFIED</Text>
          </View>

          <Text style={styles.medTitle}>Metformin</Text>
          <Text style={styles.subtitle}>500mg • Oral Tablet</Text>
        </View>

        {/* DOSAGE + FREQUENCY */}
        <View style={styles.row}>
          <View style={styles.card}>
            <Feather name="link" size={20} color="#2563EB" />
            <Text style={styles.cardLabel}>Dosage</Text>
            <Text style={styles.cardValue}>1 Tablet</Text>
          </View>

          <View style={styles.card}>
            <Feather name="clock" size={20} color="#9333EA" />
            <Text style={styles.cardLabel}>Frequency</Text>
            <Text style={styles.cardValue}>2x Daily</Text>
          </View>
        </View>

        {/* DURATION */}
        <View style={styles.durationCard}>
          <View style={styles.durationLeft}>
            <MaterialCommunityIcons name="calendar" size={22} color="#F97316" />
            <View style={{ marginLeft: 10 }}>
              <Text style={styles.cardLabel}>Duration</Text>
              <Text style={styles.cardValue}>90 Days Left</Text>
            </View>
          </View>

          <View style={styles.progressCircle}>
            <Text style={styles.progressText}>75%</Text>
          </View>
        </View>

        {/* INTERACTION RISK */}
        <View style={styles.interactionCard}>
          <Text style={styles.sectionTitle}>Interaction Risk</Text>

          <View style={styles.riskMeter}>
            <View style={styles.riskNeedle} />
          </View>

          <Text style={styles.lowRisk}>✔ Low Risk</Text>

          <Text style={styles.riskText}>
            Safe to take with your current medication stack.
          </Text>
        </View>

        {/* SIDE EFFECTS */}
        <TouchableOpacity style={styles.sideCard}>
          <Ionicons name="warning-outline" size={22} color="#EF4444" />
          <Text style={styles.sideText}>Side Effects</Text>
          <Feather name="chevron-down" size={20} color="#64748B" />
        </TouchableOpacity>

        {/* NOTE */}
        <View style={styles.noteBox}>
          <Text style={styles.noteText}>
            "Take with a full glass of water. Do not crush or chew."
          </Text>
        </View>

        {/* Extra space so content doesn't hide behind bottom buttons */}
        <View style={{ height: 120 }} />
      </ScrollView>

      {/* BOTTOM BUTTONS */}
      <View style={styles.bottomContainer}>
        <TouchableOpacity style={styles.refillBtn}>
          <Text style={styles.refillText}>Refill</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.takenBtn}>
          <Feather name="check" size={18} color="white" />
          <Text style={styles.takenText}>Mark as Taken</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F1F5F9",
  },

  scrollContainer: {
    paddingHorizontal: 20,
    paddingTop: 10,
  },

  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginTop: 10,
  },

  headerTitle: {
    fontWeight: "700",
    color: "#64748B",
    letterSpacing: 1,
  },

  iconBtn: {
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: "#E2E8F0",
    alignItems: "center",
    justifyContent: "center",
  },

  titleSection: {
    marginTop: 20,
  },

  aiBadge: {
    backgroundColor: "#DBEAFE",
    alignSelf: "flex-start",
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 20,
  },

  aiText: {
    fontSize: 11,
    color: "#2563EB",
    fontWeight: "600",
  },

  medTitle: {
    fontSize: 28,
    fontWeight: "800",
    marginTop: 10,
    color: "#1F2937",
  },

  subtitle: {
    color: "#64748B",
    marginTop: 4,
  },

  row: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 22,
  },

  card: {
    width: "48%",
    backgroundColor: "white",
    padding: 20,
    borderRadius: 22,
    alignItems: "center",
    shadowColor: "#000",
    shadowOpacity: 0.05,
    shadowRadius: 10,
    elevation: 3,
  },

  cardLabel: {
    fontSize: 12,
    color: "#64748B",
    marginTop: 6,
  },

  cardValue: {
    fontWeight: "700",
    marginTop: 4,
    fontSize: 15,
  },

  durationCard: {
    backgroundColor: "white",
    borderRadius: 22,
    padding: 20,
    marginTop: 20,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },

  durationLeft: {
    flexDirection: "row",
    alignItems: "center",
  },

  progressCircle: {
    width: 52,
    height: 52,
    borderRadius: 26,
    borderWidth: 4,
    borderColor: "#F97316",
    alignItems: "center",
    justifyContent: "center",
  },

  progressText: {
    fontSize: 12,
    fontWeight: "600",
  },

  interactionCard: {
    backgroundColor: "white",
    borderRadius: 22,
    padding: 20,
    marginTop: 20,
    alignItems: "center",
  },

  sectionTitle: {
    fontWeight: "700",
    alignSelf: "flex-start",
  },

  riskMeter: {
    width: 220,
    height: 110,
    borderTopLeftRadius: 110,
    borderTopRightRadius: 110,
    borderWidth: 12,
    borderColor: "#10B981",
    borderBottomWidth: 0,
    marginTop: 20,
  },

  riskNeedle: {
    width: 90,
    height: 3,
    backgroundColor: "#1F2937",
    position: "absolute",
    bottom: 0,
    transform: [{ rotate: "-30deg" }],
  },

  lowRisk: {
    color: "#10B981",
    fontWeight: "700",
    marginTop: 10,
    fontSize: 15,
  },

  riskText: {
    color: "#64748B",
    fontSize: 12,
    textAlign: "center",
    marginTop: 4,
  },

  sideCard: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "white",
    padding: 18,
    borderRadius: 22,
    marginTop: 20,
  },

  sideText: {
    flex: 1,
    marginLeft: 10,
    fontWeight: "600",
    fontSize: 15,
  },

  noteBox: {
    borderWidth: 1,
    borderColor: "#CBD5F5",
    borderRadius: 16,
    padding: 16,
    marginTop: 20,
  },

  noteText: {
    fontSize: 12,
    color: "#64748B",
    textAlign: "center",
    fontStyle: "italic",
  },

  bottomContainer: {
    position: "absolute",
    bottom: 20,
    left: 20,
    right: 20,
    flexDirection: "row",
    justifyContent: "space-between",
  },

  refillBtn: {
    backgroundColor: "#E2E8F0",
    paddingVertical: 16,
    paddingHorizontal: 30,
    borderRadius: 24,
  },

  refillText: {
    fontWeight: "600",
  },

  takenBtn: {
    backgroundColor: "#1E3A8A",
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 16,
    paddingHorizontal: 30,
    borderRadius: 24,
  },

  takenText: {
    color: "white",
    marginLeft: 8,
    fontWeight: "600",
  },
});
