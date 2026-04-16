// app/home.tsx
import { Feather, Ionicons, MaterialIcons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import {
  SafeAreaView,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import BottomNav from "../components/BottomNav";

// ─── Dynamic greeting helpers ─────────────────────────────────────────────────
function getGreeting(): string {
  const hour = new Date().getHours();
  if (hour < 12) return "Good Morning";
  if (hour < 17) return "Good Afternoon";
  return "Good Evening";
}

function getDynamicDate(): string {
  const now = new Date();
  return now.toLocaleDateString("en-US", {
    weekday: "long",
    day: "numeric",
    month: "short",
  });
}

export default function HomeScreen() {
  const router = useRouter();

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="dark-content" backgroundColor="#F1F5F9" />

      <View style={styles.contentWrapper}>
        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{ paddingBottom: 160 }}
        >
          {/* HEADER */}
          <View style={styles.header}>
            <Text style={styles.date}>{getDynamicDate()}</Text>

            <View style={styles.headerRow}>
              <Text style={styles.greeting}>{getGreeting()}, Ayaan</Text>

              <View style={styles.avatar}>
                <Feather name="user" size={20} color="#1E3A8A" />
                <View style={styles.onlineDot} />
              </View>
            </View>
          </View>

          {/* ADHERENCE CARD */}
          <View style={styles.adherenceCard}>
            <View style={styles.circleOuter}>
              <Text style={styles.percent}>84%</Text>
              <Text style={styles.adherenceText}>ADHERENCE</Text>
            </View>

            <Text style={styles.greatJob}>Great job keeping up!</Text>
            <Text style={styles.subText}>
              You're on track with your weekly goals.
            </Text>
          </View>

          {/* SECTION HEADER */}
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Today's Medicines</Text>

            <TouchableOpacity>
              <Text style={styles.seeAll}>See All</Text>
            </TouchableOpacity>
          </View>

          {/* MEDICINE 1 — METFORMIN */}
          <TouchableOpacity
            style={styles.medicineCard}
            onPress={() =>
              router.push({
                pathname: "/medicine-details",
                params: {
                  name: "Metformin",
                  dose: "500mg",
                  type: "Oral Tablet",
                  dosage: "1 Tablet",
                  frequency: "2x Daily",
                  duration: "90 Days Left",
                },
              })
            }
          >
            <View style={styles.iconCircleBlue}>
              <Feather name="activity" size={20} color="#2563EB" />
            </View>

            <View style={{ flex: 1 }}>
              <Text style={styles.medName}>Metformin</Text>
              <Text style={styles.medDetails}>
                500mg • 8:00 AM • After meal
              </Text>
            </View>

            <View style={styles.takenBadge}>
              <Feather name="check-circle" size={14} color="#15803D" />
              <Text style={styles.takenText}>Taken</Text>
            </View>
          </TouchableOpacity>

          {/* MEDICINE 2 — LISINOPRIL */}
          <TouchableOpacity
            style={styles.medicineCard}
            onPress={() =>
              router.push({
                pathname: "/medicine-details",
                params: {
                  name: "Lisinopril",
                  dose: "10mg",
                  type: "Tablet",
                  dosage: "1 Tablet",
                  frequency: "1x Daily",
                  duration: "60 Days Left",
                },
              })
            }
          >
            <View style={styles.iconCircleOrange}>
              <Feather name="plus-square" size={20} color="#EA580C" />
            </View>

            <View style={{ flex: 1 }}>
              <Text style={styles.medName}>Lisinopril</Text>
              <Text style={styles.medDetails}>10mg • 8:00 PM • Before bed</Text>
            </View>

            <View style={styles.pendingBadge}>
              <Ionicons name="time-outline" size={14} color="#64748B" />
              <Text style={styles.pendingText}>Pending</Text>
            </View>
          </TouchableOpacity>

          {/* ALERT */}
          <View style={styles.alertCard}>
            <MaterialIcons name="warning" size={22} color="#DC2626" />

            <View style={{ flex: 1, marginLeft: 10 }}>
              <Text style={styles.alertTitle}>Interaction Alert</Text>

              <Text style={styles.alertText}>
                Avoid grapefruit while taking Lisinopril. It may increase the
                level of medicine in your blood.
              </Text>
            </View>
          </View>
        </ScrollView>
      </View>

      {/* SHARED BOTTOM NAV (includes FAB) */}
      <BottomNav />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: "#F1F5F9",
  },

  contentWrapper: {
    flex: 1,
    paddingHorizontal: 20,
  },

  header: {
    marginTop: 20,
  },

  date: {
    color: "#64748B",
    fontSize: 13,
  },

  headerRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginTop: 8,
  },

  greeting: {
    fontSize: 22,
    fontWeight: "700",
    color: "#1E3A8A",
  },

  avatar: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: "#E2E8F0",
    alignItems: "center",
    justifyContent: "center",
  },

  onlineDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: "#22C55E",
    position: "absolute",
    bottom: 3,
    right: 3,
  },

  adherenceCard: {
    backgroundColor: "#E2E8F0",
    borderRadius: 24,
    padding: 25,
    marginTop: 25,
    alignItems: "center",
    shadowColor: "#000",
    shadowOpacity: 0.05,
    shadowRadius: 10,
    elevation: 3,
  },

  circleOuter: {
    width: 160,
    height: 160,
    borderRadius: 80,
    borderWidth: 12,
    borderColor: "#1E3A8A",
    alignItems: "center",
    justifyContent: "center",
  },

  percent: {
    fontSize: 34,
    fontWeight: "800",
  },

  adherenceText: {
    fontSize: 12,
    color: "#64748B",
    marginTop: 4,
  },

  greatJob: {
    marginTop: 20,
    fontWeight: "700",
    fontSize: 15,
  },

  subText: {
    textAlign: "center",
    color: "#64748B",
    marginTop: 6,
    lineHeight: 18,
  },

  sectionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 30,
    alignItems: "center",
  },

  sectionTitle: {
    fontSize: 17,
    fontWeight: "700",
  },

  seeAll: {
    color: "#2563EB",
    fontWeight: "500",
  },

  medicineCard: {
    backgroundColor: "white",
    borderRadius: 20,
    padding: 16,
    flexDirection: "row",
    alignItems: "center",
    marginTop: 15,
    shadowColor: "#000",
    shadowOpacity: 0.04,
    shadowRadius: 8,
    elevation: 2,
  },

  iconCircleBlue: {
    width: 46,
    height: 46,
    borderRadius: 23,
    backgroundColor: "#DBEAFE",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 14,
  },

  iconCircleOrange: {
    width: 46,
    height: 46,
    borderRadius: 23,
    backgroundColor: "#FFEDD5",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 14,
  },

  medName: {
    fontWeight: "700",
    fontSize: 14,
  },

  medDetails: {
    fontSize: 12,
    color: "#64748B",
    marginTop: 3,
  },

  takenBadge: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#DCFCE7",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
  },

  takenText: {
    marginLeft: 5,
    fontSize: 12,
    color: "#15803D",
    fontWeight: "600",
  },

  pendingBadge: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#E2E8F0",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
  },

  pendingText: {
    marginLeft: 5,
    fontSize: 12,
    color: "#64748B",
    fontWeight: "600",
  },

  alertCard: {
    flexDirection: "row",
    backgroundColor: "#FEE2E2",
    padding: 18,
    borderRadius: 20,
    marginTop: 25,
  },

  alertTitle: {
    fontWeight: "700",
    color: "#B91C1C",
  },

  alertText: {
    fontSize: 12,
    color: "#7F1D1D",
    marginTop: 5,
    lineHeight: 17,
  },
});