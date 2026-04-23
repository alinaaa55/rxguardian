// app/(tabs)/meds.tsx
import { Feather, Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import { useFocusEffect } from "@react-navigation/native";
import { useRouter } from "expo-router";
import { useCallback, useState, useRef, useEffect } from "react";
import { SafeAreaView } from "react-native-safe-area-context";
import { theme } from "../../constants/theme";

import {
  Modal,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  TouchableWithoutFeedback,
  Animated,
  PanResponder,
  Dimensions,
} from "react-native";

const SCREEN_HEIGHT = Dimensions.get("window").height;

import { storage } from "../../services/storage";

// ─── Shared in-memory store with persistence ───────────────
let _meds: any[] = [];
let _initialized = false;

export const MedStore = {
  async getAll() {
    if (!_initialized) {
      const savedMeds = await storage.getMeds();
      if (savedMeds.length > 0) {
        _meds = savedMeds;
      } else {
        // Initial dummy data if none exists
        _meds = [
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
            color: theme.colors.primaryAccent,
            bgColor: theme.colors.primaryLight,
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
            color: theme.colors.secondary,
            bgColor: theme.colors.secondaryLight,
            status: "active",
            taken: false,
            refillDue: false,
          },
        ];
        await storage.saveMeds(_meds);
      }
      _initialized = true;
    }
    return _meds;
  },

  async add(med: any) {
    _meds = [med, ..._meds];
    await storage.saveMeds(_meds);
  },

  async update(id: string, updates: any) {
    _meds = _meds.map((m) => (m.id === id ? { ...m, ...updates } : m));
    await storage.saveMeds(_meds);
  },

  async delete(id: string) {
    _meds = _meds.filter((m) => m.id !== id);
    await storage.saveMeds(_meds);
  },

  async toggleTaken(id: string) {
    _meds = _meds.map((m) => (m.id === id ? { ...m, taken: !m.taken } : m));
    await storage.saveMeds(_meds);
  },
};

const FILTERS = ["All", "Active", "Taken", "Pending", "Refill Due"];

export default function MedsScreen() {
  const router = useRouter();
  const [activeFilter, setActiveFilter] = useState("All");
  const [meds, setMeds] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  
  // Custom Modal Logic
  const [showAddOptions, setShowAddOptions] = useState(false);
  const slideAnim = useRef(new Animated.Value(SCREEN_HEIGHT)).current;
  const opacityAnim = useRef(new Animated.Value(0)).current;

  // ... (pan responder logic remains same)

  // Refresh list every time this screen comes into focus
  useFocusEffect(
    useCallback(() => {
      const load = async () => {
        setLoading(true);
        const data = await MedStore.getAll();
        setMeds([...data]);
        setLoading(false);
      };
      load();
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
      <StatusBar barStyle="dark-content" />

      {/* ── Header ── */}
      <View style={styles.header}>
        <View>
          <Text style={styles.headerTitle}>My Medications</Text>
          <Text style={styles.headerSub}>Manage your prescriptions</Text>
        </View>
        <TouchableOpacity
          style={styles.addBtn}
          onPress={openModal}
        >
          <Feather name="plus" size={20} color={theme.colors.surface} />
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
            style={[styles.summaryValue, refillDue > 0 && { color: theme.colors.danger }]}
          >
            {refillDue}
          </Text>
          <Text style={styles.summaryLabel}>Refill Due</Text>
        </View>
      </View>

      {/* ── Refill Alert ── */}
      {refillDue > 0 && (
        <View style={styles.refillAlert}>
          <Ionicons name="alert-circle" size={18} color={theme.colors.danger} />
          <Text style={styles.refillAlertText}>
            Atorvastatin is running low — only 12 days left.
          </Text>
          <TouchableOpacity>
            <Text style={styles.refillNow}>Refill</Text>
          </TouchableOpacity>
        </View>
      )}

      {/* ── Filter Chips ── */}
      <View>
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
      </View>

      {/* ── Med Cards ── */}
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.list}
      >
        {filtered.length === 0 && (
          <View style={styles.emptyState}>
            <MaterialCommunityIcons name="pill-off" size={48} color={theme.colors.tabInactive} />
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
                  id: med.id,
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
            <View style={[styles.medIcon, { backgroundColor: med.bgColor }]}>
              <MaterialCommunityIcons
                name={med.icon as any}
                size={22}
                color={med.color}
              />
            </View>

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

              {med.status === "active" && (
                <View style={styles.durationRow}>
                  <View style={styles.durationBg}>
                    <View
                      style={[
                        styles.durationFill,
                        {
                          width: med.status === "completed" 
                            ? "100%" 
                            : med.refillDue 
                              ? "10%" 
                              : "60%",
                          backgroundColor: med.refillDue
                            ? theme.colors.danger
                            : med.color,
                        },
                      ]}
                    />
                  </View>
                  <Text style={styles.durationText}>{med.duration}</Text>
                </View>
              )}
            </View>

            <View style={styles.medRight}>
              {med.status === "active" ? (
                <View
                  style={[
                    styles.statusDot,
                    { backgroundColor: med.taken ? theme.colors.success : "#F59E0B" },
                  ]}
                />
              ) : (
                <Feather name="check-circle" size={16} color={theme.colors.tabInactive} />
              )}
              <Feather
                name="chevron-right"
                size={16}
                color={theme.colors.tabInactive}
                style={{ marginTop: 8 }}
              />
            </View>
          </TouchableOpacity>
        ))}

        <TouchableOpacity
          style={styles.addMedCard}
          onPress={openModal}
        >
          <View style={styles.addMedIcon}>
            <Feather name="plus" size={22} color={theme.colors.primaryAccent} />
          </View>
          <Text style={styles.addMedText}>Add New Medication</Text>
          <Text style={styles.addMedSub}>Scan or enter prescription</Text>
        </TouchableOpacity>
      </ScrollView>

      {/* ── Add Options Modal (Custom Animated Sheet) ── */}
      <Modal
        visible={showAddOptions}
        transparent={true}
        animationType="none"
        onRequestClose={closeModal}
      >
        <View style={styles.modalOverlay}>
          <TouchableWithoutFeedback onPress={closeModal}>
            <Animated.View 
              style={[
                styles.modalBackdrop, 
                { opacity: opacityAnim }
              ]} 
            />
          </TouchableWithoutFeedback>

          <Animated.View 
            style={[
              styles.modalContent,
              { 
                transform: [
                  { translateY: slideAnim },
                  { translateY: pan.y }
                ] 
              }
            ]}
            {...panResponder.panHandlers}
          >
            <View style={styles.modalHandle} />
            <Text style={styles.modalTitle}>Add Medication</Text>
            <Text style={styles.modalSub}>Choose how you'd like to add your medicine</Text>

            <TouchableOpacity
              style={styles.optionBtn}
              onPress={() => {
                closeModal();
                router.push("/scan");
              }}
            >
              <View style={[styles.optionIcon, { backgroundColor: theme.colors.primaryLight }]}>
                <Feather name="camera" size={22} color={theme.colors.primaryAccent} />
              </View>
              <View style={styles.optionInfo}>
                <Text style={styles.optionTitle}>Scan Prescription</Text>
                <Text style={styles.optionDesc}>AI will extract medicine details</Text>
              </View>
              <Feather name="chevron-right" size={20} color={theme.colors.tabInactive} />
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.optionBtn}
              onPress={() => {
                closeModal();
                router.push("/add-med");
              }}
            >
              <View style={[styles.optionIcon, { backgroundColor: theme.colors.secondaryLight }]}>
                <Feather name="edit-3" size={22} color={theme.colors.secondary} />
              </View>
              <View style={styles.optionInfo}>
                <Text style={styles.optionTitle}>Add Manually</Text>
                <Text style={styles.optionDesc}>Enter details yourself</Text>
              </View>
              <Feather name="chevron-right" size={20} color={theme.colors.tabInactive} />
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.cancelBtn}
              onPress={closeModal}
            >
              <Text style={styles.cancelBtnText}>Cancel</Text>
            </TouchableOpacity>
          </Animated.View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: theme.colors.background },

  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 12,
  },
  headerTitle: { fontSize: theme.typography.h1.fontSize, fontWeight: theme.typography.h1.fontWeight, color: theme.colors.primary },
  headerSub: { fontSize: 12, color: theme.colors.text.secondary, marginTop: 2 },
  addBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: theme.colors.primary,
    alignItems: "center",
    justifyContent: "center",
  },

  summaryStrip: {
    flexDirection: "row",
    backgroundColor: theme.colors.primary,
    marginHorizontal: 20,
    borderRadius: 18,
    paddingVertical: 16,
    marginBottom: 14,
  },
  summaryItem: { flex: 1, alignItems: "center" },
  summaryValue: { fontSize: 22, fontWeight: "800", color: theme.colors.surface },
  summaryLabel: { fontSize: 11, color: "#93C5FD", marginTop: 2 },
  summaryDivider: { width: 1, backgroundColor: "#3B5BA8", marginVertical: 4 },

  refillAlert: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: theme.colors.dangerLight,
    marginHorizontal: 20,
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 10,
    marginBottom: 12,
    gap: 8,
  },
  refillAlertText: { flex: 1, fontSize: 12, color: theme.colors.danger, lineHeight: 17 },
  refillNow: { fontSize: 12, fontWeight: "700", color: theme.colors.danger },

  filterRow: {
    paddingHorizontal: 20,
    paddingBottom: 12,
    gap: 8,
    alignItems: "center",
  },
  filterChip: {
    height: 36,
    paddingHorizontal: 18,
    borderRadius: 18,
    backgroundColor: theme.colors.surface,
    borderWidth: 1,
    borderColor: theme.colors.border,
    alignItems: "center",
    justifyContent: "center",
  },
  filterChipActive: {
    backgroundColor: theme.colors.primary,
    borderColor: theme.colors.primary,
  },
  filterText: { fontSize: 13, color: theme.colors.text.secondary, fontWeight: "500" },
  filterTextActive: { color: theme.colors.surface, fontWeight: "600" },

  list: {
    paddingHorizontal: 20,
    paddingBottom: 160,
    gap: 12,
  },

  medCard: {
    backgroundColor: theme.colors.surface,
    borderRadius: 20,
    padding: 16,
    flexDirection: "row",
    alignItems: "center",
    gap: 14,
    ...theme.shadows.sm,
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
  medName: { fontSize: 15, fontWeight: "700", color: theme.colors.text.primary },
  medDose: { fontSize: 12, color: theme.colors.text.secondary, marginBottom: 2 },
  medTime: { fontSize: 12, color: theme.colors.tabInactive },

  durationRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginTop: 8,
  },
  durationBg: {
    flex: 1,
    height: 4,
    backgroundColor: theme.colors.background,
    borderRadius: 2,
    overflow: "hidden",
  },
  durationFill: { height: 4, borderRadius: 2 },
  durationText: { fontSize: 10, color: theme.colors.tabInactive, minWidth: 70 },

  refillBadge: {
    backgroundColor: theme.colors.dangerLight,
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 8,
  },
  refillBadgeText: { fontSize: 10, color: theme.colors.danger, fontWeight: "600" },
  completedBadge: {
    backgroundColor: theme.colors.background,
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 8,
  },
  completedBadgeText: { fontSize: 10, color: theme.colors.tabInactive, fontWeight: "600" },

  medRight: { alignItems: "center" },
  statusDot: { width: 10, height: 10, borderRadius: 5 },

  emptyState: { alignItems: "center", paddingTop: 60, gap: 12 },
  emptyText: { fontSize: 14, color: theme.colors.tabInactive },

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
    backgroundColor: theme.colors.primaryLight,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 4,
  },
  addMedText: { fontSize: 15, fontWeight: "700", color: theme.colors.primaryAccent },
  addMedSub: { fontSize: 12, color: theme.colors.text.secondary },

  // Modal styles
  modalOverlay: {
    flex: 1,
    justifyContent: "flex-end",
  },
  modalBackdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(0,0,0,0.5)",
  },
  modalContent: {
    backgroundColor: theme.colors.surface,
    borderTopLeftRadius: 32,
    borderTopRightRadius: 32,
    padding: 24,
    paddingBottom: 40,
    ...theme.shadows.md,
  },
  modalHandle: {
    width: 40,
    height: 5,
    backgroundColor: theme.colors.border,
    borderRadius: 3,
    alignSelf: "center",
    marginBottom: 20,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: "800",
    color: theme.colors.primary,
    textAlign: "center",
  },
  modalSub: {
    fontSize: 14,
    color: theme.colors.text.secondary,
    textAlign: "center",
    marginTop: 4,
    marginBottom: 24,
  },
  optionBtn: {
    flexDirection: "row",
    alignItems: "center",
    padding: 16,
    backgroundColor: theme.colors.background,
    borderRadius: 20,
    marginBottom: 12,
  },
  optionIcon: {
    width: 48,
    height: 48,
    borderRadius: 16,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 16,
  },
  optionInfo: {
    flex: 1,
  },
  optionTitle: {
    fontSize: 16,
    fontWeight: "700",
    color: theme.colors.text.primary,
  },
  optionDesc: {
    fontSize: 12,
    color: theme.colors.text.secondary,
    marginTop: 2,
  },
  cancelBtn: {
    marginTop: 8,
    paddingVertical: 16,
    alignItems: "center",
  },
  cancelBtnText: {
    fontSize: 16,
    fontWeight: "600",
    color: theme.colors.text.secondary,
  },
});
