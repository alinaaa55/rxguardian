// app/(tabs)/index.tsx
import { Feather, Ionicons, MaterialIcons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import {
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { theme } from "../../constants/theme";
import { useSafeAreaInsets } from "react-native-safe-area-context";

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
  const insets = useSafeAreaInsets();

  return (
    <View style={[styles.container, { paddingTop: insets.top, backgroundColor: theme.colors.background }]}>
      <StatusBar barStyle="dark-content" />

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

              <TouchableOpacity
                style={styles.avatar}
                onPress={() => router.push("/profile")}
              >
                <Feather name="user" size={20} color={theme.colors.primary} />
                <View style={styles.onlineDot} />
              </TouchableOpacity>
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
              <Feather name="activity" size={20} color={theme.colors.primaryAccent} />
            </View>

            <View style={{ flex: 1 }}>
              <Text style={styles.medName}>Metformin</Text>
              <Text style={styles.medDetails}>
                500mg • 8:00 AM • After meal
              </Text>
            </View>

            <View style={styles.takenBadge}>
              <Feather name="check-circle" size={14} color={theme.colors.success} />
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
              <Feather name="plus-square" size={20} color={theme.colors.secondary} />
            </View>

            <View style={{ flex: 1 }}>
              <Text style={styles.medName}>Lisinopril</Text>
              <Text style={styles.medDetails}>10mg • 8:00 PM • Before bed</Text>
            </View>

            <View style={styles.pendingBadge}>
              <Ionicons name="time-outline" size={14} color={theme.colors.text.secondary} />
              <Text style={styles.pendingText}>Pending</Text>
            </View>
          </TouchableOpacity>

          {/* ALERT */}
          <View style={styles.alertCard}>
            <MaterialIcons name="warning" size={22} color={theme.colors.danger} />

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
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },

  contentWrapper: {
    flex: 1,
    paddingHorizontal: 20,
  },

  header: {
    marginTop: 20,
  },

  date: {
    color: theme.colors.text.secondary,
    fontSize: 13,
  },

  headerRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginTop: 8,
  },

  greeting: {
    fontSize: theme.typography.h1.fontSize,
    fontWeight: theme.typography.h1.fontWeight,
    color: theme.colors.primary,
  },

  avatar: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: theme.colors.border,
    alignItems: "center",
    justifyContent: "center",
  },

  onlineDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: theme.colors.successLight,
    position: "absolute",
    bottom: 3,
    right: 3,
  },

  adherenceCard: {
    backgroundColor: theme.colors.border,
    borderRadius: 24,
    padding: 25,
    marginTop: 25,
    alignItems: "center",
    ...theme.shadows.sm,
  },

  circleOuter: {
    width: 160,
    height: 160,
    borderRadius: 80,
    borderWidth: 12,
    borderColor: theme.colors.primary,
    alignItems: "center",
    justifyContent: "center",
  },

  percent: {
    fontSize: 34,
    fontWeight: "800",
  },

  adherenceText: {
    fontSize: 12,
    color: theme.colors.text.secondary,
    marginTop: 4,
  },

  greatJob: {
    marginTop: 20,
    fontWeight: "700",
    fontSize: 15,
  },

  subText: {
    textAlign: "center",
    color: theme.colors.text.secondary,
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
    fontSize: theme.typography.h2.fontSize,
    fontWeight: theme.typography.h2.fontWeight,
  },

  seeAll: {
    color: theme.colors.primaryAccent,
    fontWeight: "500",
  },

  medicineCard: {
    backgroundColor: theme.colors.surface,
    borderRadius: 20,
    padding: 16,
    flexDirection: "row",
    alignItems: "center",
    marginTop: 15,
    ...theme.shadows.sm,
  },

  iconCircleBlue: {
    width: 46,
    height: 46,
    borderRadius: 23,
    backgroundColor: theme.colors.primaryLight,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 14,
  },

  iconCircleOrange: {
    width: 46,
    height: 46,
    borderRadius: 23,
    backgroundColor: theme.colors.secondaryLight,
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
    color: theme.colors.text.secondary,
    marginTop: 3,
  },

  takenBadge: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: theme.colors.successLight,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
  },

  takenText: {
    marginLeft: 5,
    fontSize: 12,
    color: theme.colors.success,
    fontWeight: "600",
  },

  pendingBadge: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: theme.colors.border,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
  },

  pendingText: {
    marginLeft: 5,
    fontSize: 12,
    color: theme.colors.text.secondary,
    fontWeight: "600",
  },

  alertCard: {
    flexDirection: "row",
    backgroundColor: theme.colors.dangerLight,
    padding: 18,
    borderRadius: 20,
    marginTop: 25,
  },

  alertTitle: {
    fontWeight: "700",
    color: theme.colors.danger,
  },

  alertText: {
    fontSize: 12,
    color: theme.colors.danger,
    marginTop: 5,
    lineHeight: 17,
  },
});
