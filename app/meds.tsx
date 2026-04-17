// app/meds.tsx
import { Feather, Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import { useFocusEffect } from "@react-navigation/native";
import { useRouter } from "expo-router";
import { useCallback, useState } from "react";
import { SafeAreaView } from "react-native-safe-area-context";

import {
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import BottomNav from "../components/BottomNav";

// ─── Shared in-memory store so add-med.tsx can push new entries ───────────────
let _meds = [
  {
    id: "1",
    name: "Metformin",
    dose: "500mg",
    type: "Oral Tablet",
    dosage: "1 Tablet",
    frequency: "2x Daily",
    duration: "90 Days Left",
    time: "8:00 AM • After meal",
    icon: "pill",
    color: "#2563EB",
    bgColor: "#DBEAFE",
    status: "active",
    taken: true,
    refillDue: false,
  },
  {
    id: "2",
    name: "Lisinopril",
    dose: "10mg",
    type: "Tablet",
    dosage: "1 Tablet",
    frequency: "1x Daily",
    duration: "60 Days Left",
    time: "8:00 PM • Before bed",
    icon: "pill",
    color: "#EA580C",
    bgColor: "#FFEDD5",
    status: "active",
    taken: false,
    refillDue: false,
  },
  {
    id: "3",
    name: "Vitamin D",
  },
  {
    id: "4",
    name: "Atorvastatin",
    dose: "10mg",
    type: "Tablet",
    dosage: "1 Tablet",
    frequency: "1x Daily",
    duration: "12 Days Left",
    time: "9:00 PM • Before bed",
    icon: "heart-pulse",
    color: "#DC2626",
    bgColor: "#FEE2E2",
    status: "active",
    taken: false,
    refillDue: true,
  },
  {
    id: "5",
    name: "Amoxicillin",
    dose: "500mg",
    type: "Capsule",
    dosage: "1 Capsule",
    frequency: "3x Daily",
    duration: "Completed",
    time: "Every 8 hours",
    icon: "pill",
    color: "#7C3AED",
    bgColor: "#EDE9FE",
    status: "completed",
    taken: false,
    refillDue: false,
  },
];

export const MedStore = {
  getAll: () => _meds,
  add: (med: any) => {
    _meds = [med, ..._meds];
  },
};

const FILTERS = ["All", "Active", "Taken", "Pending", "Refill Due"];

export default function MedsScreen() {
  const router = useRouter();
  const [activeFilter, setActiveFilter] = useState("All");
  const [meds, setMeds] = useState(MedStore.getAll());

  // Refresh list every time this screen comes into focus (e.g. after adding)
  useFocusEffect(
    useCallback(() => {
      setMeds(MedStore.getAll());
    }, []),
  );

  const filtered = meds.filter((med) => {
    if (activeFilter === "Active") return med.status === "active";
    if (activeFilter === "Taken") return med.taken;
    if (activeFilter === "Pending")
      return !med.taken && med.status === "active";
    if (activeFilter === "Refill Due") return med.refillDue;
    return true;
  });

  const activeMeds = meds.filter((m) => m.status === "active").length;
  const takenToday = meds.filter((m) => m.taken).length;
  const refillDue = meds.filter((m) => m.refillDue).length;

  return (
    <SafeAreaView style={styles.safe}>
      <StatusBar barStyle="dark-content" backgroundColor="#F1F5F9" />

      {/* ── Header ── */}
      <View style={styles.header}>
        <View>
          <Text style={styles.headerTitle}>My Medications</Text>
          <Text style={styles.headerSub}>Manage your prescriptions</Text>
        </View>
        <TouchableOpacity
          style={styles.addBtn}
          onPress={() => router.push("/add-med")}
        >
          <Feather name="plus" size={20} color="#fff" />
        </TouchableOpacity>
      </View>

      {/* ── Summary Strip ── */}
      <View style={styles.summaryStrip}>
        <View style={styles.summaryItem}>
          <Text style={styles.summaryValue}>{activeMeds}</Text>
          <Text style={styles.summaryLabel}>Active</Text>
        </View>
        <View style={styles.summaryDivider} />
        <View style={styles.summaryItem}>
          <Text style={styles.summaryValue}>{takenToday}</Text>
          <Text style={styles.summaryLabel}>Taken Today</Text>
        </View>
        <View style={styles.summaryDivider} />
        <View style={styles.summaryItem}>
          <Text
            style={[styles.summaryValue, refillDue > 0 && { color: "#DC2626" }]}
          >
            {refillDue}
          </Text>
          <Text style={styles.summaryLabel}>Refill Due</Text>
        </View>
      </View>

      {/* ── Refill Alert ── */}
      {refillDue > 0 && (
        <View style={styles.refillAlert}>
          <Ionicons name="alert-circle" size={18} color="#DC2626" />
          <Text style={styles.refillAlertText}>
            Atorvastatin is running low — only 12 days left.
          </Text>
          <TouchableOpacity>
            <Text style={styles.refillNow}>Refill</Text>
          </TouchableOpacity>
        </View>
      )}

      {/* ── Filter Chips — fixed uniform height ── */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.filterRow}
      >
        {FILTERS.map((f) => (
          <TouchableOpacity
            key={f}
            style={[
              styles.filterChip,
              activeFilter === f && styles.filterChipActive,
            ]}
            onPress={() => setActiveFilter(f)}
          >
            <Text
              style={[
                styles.filterText,
                activeFilter === f && styles.filterTextActive,
              ]}
            >
              {f}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      {/* ── Med Cards ── */}
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.list}
      >
        {filtered.length === 0 && (
          <View style={styles.emptyState}>
            <MaterialCommunityIcons name="pill-off" size={48} color="#CBD5E1" />
            <Text style={styles.emptyText}>No medications found</Text>
          </View>
        )}

        {filtered.map((med) => (
          <TouchableOpacity
            key={med.id}
            style={[
              styles.medCard,
              med.status === "completed" && styles.medCardCompleted,
            ]}
            onPress={() =>
              router.push({
                pathname: "/medicine-details",
                params: {
                  name: med.name,
                  dose: med.dose,
                  type: med.type,
                  dosage: med.dosage,
                  frequency: med.frequency,
                  duration: med.duration,
                },
              })
            }
          >
            {/* Left icon */}
            <View style={[styles.medIcon, { backgroundColor: med.bgColor }]}>
              <MaterialCommunityIcons
                name={med.icon as any}
                size={22}
                color={med.color}
              />
            </View>

            {/* Info */}
            <View style={{ flex: 1 }}>
              <View style={styles.medTopRow}>
                <Text style={styles.medName}>{med.name}</Text>
                {med.refillDue && (
                  <View style={styles.refillBadge}>
                    <Text style={styles.refillBadgeText}>Refill Due</Text>
                  </View>
                )}
                {med.status === "completed" && (
                  <View style={styles.completedBadge}>
                    <Text style={styles.completedBadgeText}>Completed</Text>
                  </View>
                )}
              </View>
              <Text style={styles.medDose}>
                {med.dose} • {med.frequency}
              </Text>
              <Text style={styles.medTime}>{med.time}</Text>

              {/* Duration bar */}
              {med.status === "active" && (
                <View style={styles.durationRow}>
                  <View style={styles.durationBg}>
                    <View
                      style={[
                        styles.durationFill,
                        {
                          width: med.refillDue
                            ? "15%"
                            : med.id === "1"
                              ? "75%"
                              : med.id === "2"
                                ? "50%"
                                : "35%",
                          backgroundColor: med.refillDue
                            ? "#DC2626"
                            : med.color,
                        },
                      ]}
                    />
                  </View>
                  <Text style={styles.durationText}>{med.duration}</Text>
                </View>
              )}
            </View>

            {/* Status + arrow */}
            <View style={styles.medRight}>
              {med.status === "active" ? (
                <View
                  style={[
                    styles.statusDot,
                    { backgroundColor: med.taken ? "#16A34A" : "#F59E0B" },
                  ]}
                />
              ) : (
                <Feather name="check-circle" size={16} color="#CBD5E1" />
              )}
              <Feather
                name="chevron-right"
                size={16}
                color="#CBD5E1"
                style={{ marginTop: 8 }}
              />
            </View>
          </TouchableOpacity>
        ))}

        {/* Add new med CTA */}
        <TouchableOpacity
          style={styles.addMedCard}
          onPress={() => router.push("/add-med")}
        >
          <View style={styles.addMedIcon}>
            <Feather name="plus" size={22} color="#2563EB" />
          </View>
          <Text style={styles.addMedText}>Add New Medication</Text>
          <Text style={styles.addMedSub}>Scan or enter prescription</Text>
        </TouchableOpacity>
      </ScrollView>

      {/* SHARED BOTTOM NAV */}
      <BottomNav />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: "#F1F5F9" },

  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 12,
  },
  headerTitle: { fontSize: 22, fontWeight: "800", color: "#1E3A8A" },
  headerSub: { fontSize: 12, color: "#64748B", marginTop: 2 },
  addBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "#1E3A8A",
    alignItems: "center",
    justifyContent: "center",
  },

  summaryStrip: {
    flexDirection: "row",
    backgroundColor: "#1E3A8A",
    marginHorizontal: 20,
    borderRadius: 18,
    paddingVertical: 16,
    marginBottom: 14,
  },
  summaryItem: { flex: 1, alignItems: "center" },
  summaryValue: { fontSize: 22, fontWeight: "800", color: "#fff" },
  summaryLabel: { fontSize: 11, color: "#93C5FD", marginTop: 2 },
  summaryDivider: { width: 1, backgroundColor: "#3B5BA8", marginVertical: 4 },

  refillAlert: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#FEE2E2",
    marginHorizontal: 20,
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 10,
    marginBottom: 12,
    gap: 8,
  },
  refillAlertText: { flex: 1, fontSize: 12, color: "#7F1D1D", lineHeight: 17 },
  refillNow: { fontSize: 12, fontWeight: "700", color: "#DC2626" },

  // FIX #4: chips have fixed height so they never resize on selection
  filterRow: {
    paddingHorizontal: 20,
    paddingBottom: 12,
    gap: 8,
    alignItems: "center", // vertically centre chips in the scroll row
  },
  filterChip: {
    height: 36, // fixed height — never changes
    paddingHorizontal: 18,
    borderRadius: 18,
    backgroundColor: "#fff",
    borderWidth: 1,
    borderColor: "#E2E8F0",
    alignItems: "center",
    justifyContent: "center",
  },
  filterChipActive: {
    backgroundColor: "#1E3A8A",
    borderColor: "#1E3A8A",
  },
  filterText: { fontSize: 13, color: "#64748B", fontWeight: "500" },
  filterTextActive: { color: "#fff", fontWeight: "600" },

  list: {
    paddingHorizontal: 20,
    paddingBottom: 80,
    gap: 12,
  },

  medCard: {
    backgroundColor: "#fff",
    borderRadius: 20,
    padding: 16,
    flexDirection: "row",
    alignItems: "center",
    gap: 14,
    shadowColor: "#000",
    shadowOpacity: 0.04,
    shadowRadius: 8,
    elevation: 2,
  },
  medCardCompleted: { opacity: 0.6 },
  medIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: "center",
    justifyContent: "center",
  },
  medTopRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginBottom: 2,
  },
  medName: { fontSize: 15, fontWeight: "700", color: "#1E293B" },
  medDose: { fontSize: 12, color: "#64748B", marginBottom: 2 },
  medTime: { fontSize: 12, color: "#94A3B8" },

  durationRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginTop: 8,
  },
  durationBg: {
    flex: 1,
    height: 4,
    backgroundColor: "#F1F5F9",
    borderRadius: 2,
    overflow: "hidden",
  },
  durationFill: { height: 4, borderRadius: 2 },
  durationText: { fontSize: 10, color: "#94A3B8", minWidth: 70 },

  refillBadge: {
    backgroundColor: "#FEE2E2",
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 8,
  },
  refillBadgeText: { fontSize: 10, color: "#DC2626", fontWeight: "600" },
  completedBadge: {
    backgroundColor: "#F1F5F9",
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 8,
  },
  completedBadgeText: { fontSize: 10, color: "#94A3B8", fontWeight: "600" },

  medRight: { alignItems: "center" },
  statusDot: { width: 10, height: 10, borderRadius: 5 },

  emptyState: { alignItems: "center", paddingTop: 60, gap: 12 },
  emptyText: { fontSize: 14, color: "#94A3B8" },

  addMedCard: {
    backgroundColor: "#EFF6FF",
    borderRadius: 20,
    padding: 20,
    alignItems: "center",
    borderWidth: 1.5,
    borderColor: "#BFDBFE",
    borderStyle: "dashed",
    gap: 6,
  },
  addMedIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: "#DBEAFE",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 4,
  },
  addMedText: { fontSize: 15, fontWeight: "700", color: "#2563EB" },
  addMedSub: { fontSize: 12, color: "#64748B" },
});
