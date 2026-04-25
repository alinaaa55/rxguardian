import { Feather, Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import { useFocusEffect } from "@react-navigation/native";
import { useRouter } from "expo-router";
import { useCallback, useState, useRef, useEffect } from "react";
import { SafeAreaView } from "react-native-safe-area-context";
import { theme } from "../../constants/theme";
import api from "../../services/api";
import { useSettings } from "../../context/SettingsContext";

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
  ActivityIndicator,
  Alert,
  Platform,
} from "react-native";

const SCREEN_HEIGHT = Dimensions.get("window").height;

const FILTERS = ["All", "Active", "Taken", "Pending", "Refill Due"];

export default function MedsScreen() {
  const router = useRouter();
  const { fontSizeMultiplier, elderlyMode } = useSettings();
  
  const [activeFilter, setActiveFilter] = useState("All");
  const [meds, setMeds] = useState<any[]>([]);
  const [todayMeds, setTodayMeds] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  
  // Custom Modal Logic
  const [showAddOptions, setShowAddOptions] = useState(false);
  const slideAnim = useRef(new Animated.Value(SCREEN_HEIGHT)).current;
  const opacityAnim = useRef(new Animated.Value(0)).current;
  const pan = useRef(new Animated.ValueXY()).current;

  const openModal = () => {
    setShowAddOptions(true);
    Animated.parallel([
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 300,
        useNativeDriver: true,
      }),
      Animated.timing(opacityAnim, {
        toValue: 1,
        duration: 300,
        useNativeDriver: true,
      }),
    ]).start();
  };

  const closeModal = () => {
    Animated.parallel([
      Animated.timing(slideAnim, {
        toValue: SCREEN_HEIGHT,
        duration: 250,
        useNativeDriver: true,
      }),
      Animated.timing(opacityAnim, {
        toValue: 0,
        duration: 250,
        useNativeDriver: true,
      }),
    ]).start(() => {
      setShowAddOptions(false);
      pan.setValue({ x: 0, y: 0 });
    });
  };

  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onPanResponderMove: (_, gestureState) => {
        if (gestureState.dy > 0) {
          pan.y.setValue(gestureState.dy);
        }
      },
      onPanResponderRelease: (_, gestureState) => {
        if (gestureState.dy > 100 || gestureState.vy > 0.5) {
          closeModal();
        } else {
          Animated.spring(pan.y, {
            toValue: 0,
            useNativeDriver: true,
          }).start();
        }
      },
    })
  ).current;

  const fetchData = async () => {
    try {
      setLoading(true);
      const [medsRes, todayRes] = await Promise.all([
        api.get("/api/v1/medicines"),
        api.get("/api/v1/track/today")
      ]);
      setMeds(medsRes.data);
      setTodayMeds(todayRes.data?.medicines || []);
    } catch (error) {
      console.error("Fetch meds error:", error);
      Alert.alert("Error", "Failed to fetch medications");
    } finally {
      setLoading(false);
    }
  };

  useFocusEffect(
    useCallback(() => {
      fetchData();
    }, [])
  );

  const handleDelete = (id: string) => {
    Alert.alert(
      "Delete Medicine",
      "Are you sure you want to delete this medicine?",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Delete",
          style: "destructive",
          onPress: async () => {
            try {
              await api.delete(`/api/v1/medicines/${id}`);
              fetchData();
            } catch (error) {
              Alert.alert("Error", "Failed to delete medicine");
            }
          },
        },
      ]
    );
  };

  const filtered = meds.filter((med) => {
    if (activeFilter === "Active") return med.duration_days > 0;
    if (activeFilter === "Refill Due") return med.duration_days < 3;
    
    // Taken: Find if ALL slots for today for this med are 'taken'
    if (activeFilter === "Taken") {
        const todayEntries = todayMeds.filter(tm => tm.medicine_id === med.id);
        return todayEntries.length > 0 && todayEntries.every(tm => tm.status === 'taken');
    }
    
    // Pending: Find if ANY slot for today for this med is 'pending' or 'missed'
    if (activeFilter === "Pending") {
        const todayEntries = todayMeds.filter(tm => tm.medicine_id === med.id);
        return todayEntries.length > 0 && todayEntries.some(tm => tm.status !== 'taken');
    }

    return true;
  });

  const activeMeds = meds.length;
  const refillDue = meds.filter((m) => m.duration_days < 3).length;

  return (
    <SafeAreaView style={[styles.safe, elderlyMode && { backgroundColor: "#fff" }]}>
      <StatusBar barStyle="dark-content" />

      {/* ── Header ── */}
      <View style={styles.header}>
        <View>
          <Text style={[styles.headerTitle, { fontSize: theme.typography.h1.fontSize * fontSizeMultiplier }]}>My Medications</Text>
          <Text style={[styles.headerSub, { fontSize: 12 * fontSizeMultiplier }]}>Manage your prescriptions</Text>
        </View>
        <TouchableOpacity
          style={styles.addBtn}
          onPress={openModal}
        >
          <Feather name="plus" size={20 * fontSizeMultiplier} color={theme.colors.surface} />
        </TouchableOpacity>
      </View>

      {/* ── Summary Strip ── */}
      <View style={[styles.summaryStrip, elderlyMode && styles.summaryStripElderly]}>
        <View style={styles.summaryItem}>
          <Text style={[styles.summaryValue, elderlyMode && { color: theme.colors.primary }, { fontSize: 22 * fontSizeMultiplier }]}>{activeMeds}</Text>
          <Text style={[styles.summaryLabel, elderlyMode && { color: theme.colors.text.secondary }, { fontSize: 11 * fontSizeMultiplier }]}>Total</Text>
        </View>
        <View style={styles.summaryDivider} />
        <View style={styles.summaryItem}>
          <Text
            style={[
              styles.summaryValue, 
              elderlyMode ? { color: refillDue > 0 ? theme.colors.danger : theme.colors.primary } : { color: refillDue > 0 ? "#FCA5A5" : theme.colors.surface },
              { fontSize: 22 * fontSizeMultiplier }
            ]}
          >
            {refillDue}
          </Text>
          <Text style={[styles.summaryLabel, elderlyMode && { color: theme.colors.text.secondary }, { fontSize: 11 * fontSizeMultiplier }]}>Refill Due</Text>
        </View>
      </View>

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
                elderlyMode && { height: 44, borderRadius: 22 }
              ]}
              onPress={() => setActiveFilter(f)}
            >
              <Text
                style={[
                  styles.filterText,
                  activeFilter === f && styles.filterTextActive,
                  { fontSize: 13 * fontSizeMultiplier }
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
        {loading ? (
          <ActivityIndicator size="large" color={theme.colors.primary} style={{ marginTop: 40 }} />
        ) : filtered.length === 0 ? (
          <View style={styles.emptyState}>
            <MaterialCommunityIcons name="pill-off" size={48 * fontSizeMultiplier} color={theme.colors.tabInactive} />
            <Text style={[styles.emptyText, { fontSize: 14 * fontSizeMultiplier }]}>No medications found</Text>
          </View>
        ) : (
          filtered.map((med) => (
            <TouchableOpacity
              key={med.id}
              style={[styles.medCard, elderlyMode && styles.medCardElderly]}
              onPress={() =>
                router.push({
                  pathname: "/medicine-details",
                  params: { id: med.id },
                })
              }
            >
              <View style={[styles.medIcon, { backgroundColor: med.bgColor || theme.colors.primaryLight }]}>
                <MaterialCommunityIcons
                  name={(med.icon as any) || "pill"}
                  size={22 * fontSizeMultiplier}
                  color={med.color || theme.colors.primaryAccent}
                />
              </View>

              <View style={{ flex: 1 }}>
                <View style={styles.medTopRow}>
                  <Text style={[styles.medName, { fontSize: 15 * fontSizeMultiplier }]}>{med.name}</Text>
                  {med.duration_days < 3 && (
                    <View style={styles.refillBadge}>
                      <Text style={[styles.refillBadgeText, { fontSize: 10 * fontSizeMultiplier }]}>Refill Due</Text>
                    </View>
                  )}
                </View>
                <Text style={[styles.medDose, { fontSize: 12 * fontSizeMultiplier }]}>
                  {med.dosage} • {med.frequency}
                </Text>
                <Text style={[styles.medTime, { fontSize: 12 * fontSizeMultiplier }]}>
                  {med.time_slots?.map((ts: any) => ts.time).join(", ")}
                </Text>
              </View>

              <View style={styles.medRight}>
                <TouchableOpacity onPress={() => handleDelete(med.id)} style={{ padding: 4 }}>
                  <Feather name="trash-2" size={18 * fontSizeMultiplier} color={theme.colors.danger} />
                </TouchableOpacity>
              </View>
            </TouchableOpacity>
          ))
        )}

        <TouchableOpacity
          style={[styles.addMedCard, elderlyMode && styles.addMedCardElderly]}
          onPress={openModal}
        >
          <View style={[styles.addMedIcon, { width: 48 * fontSizeMultiplier, height: 48 * fontSizeMultiplier, borderRadius: 24 * fontSizeMultiplier }]}>
            <Feather name="plus" size={22 * fontSizeMultiplier} color={theme.colors.primaryAccent} />
          </View>
          <Text style={[styles.addMedText, { fontSize: 15 * fontSizeMultiplier }]}>Add New Medication</Text>
          <Text style={[styles.addMedSub, { fontSize: 12 * fontSizeMultiplier }]}>Scan or enter prescription</Text>
        </TouchableOpacity>
      </ScrollView>

      {/* ── Add Options Modal ── */}
      <Modal
        visible={showAddOptions}
        transparent={true}
        animationType="none"
        onRequestClose={closeModal}
      >
        <View style={styles.modalOverlay}>
          <TouchableWithoutFeedback onPress={closeModal}>
            <Animated.View style={[styles.modalBackdrop, { opacity: opacityAnim }]} />
          </TouchableWithoutFeedback>

          <Animated.View 
            style={[styles.modalContent, { transform: [{ translateY: slideAnim }, { translateY: pan.y }] }]}
            {...panResponder.panHandlers}
          >
            <View style={styles.modalHandle} />
            <Text style={[styles.modalTitle, { fontSize: 20 * fontSizeMultiplier }]}>Add Medication</Text>
            <Text style={[styles.modalSub, { fontSize: 14 * fontSizeMultiplier }]}>Choose how you'd like to add your medicine</Text>

            <TouchableOpacity
              style={[styles.optionBtn, elderlyMode && { padding: 24 }]}
              onPress={() => {
                closeModal();
                router.push("/scan");
              }}
            >
              <View style={[styles.optionIcon, { backgroundColor: theme.colors.primaryLight }]}>
                <Feather name="camera" size={22 * fontSizeMultiplier} color={theme.colors.primaryAccent} />
              </View>
              <View style={styles.optionInfo}>
                <Text style={[styles.optionTitle, { fontSize: 16 * fontSizeMultiplier }]}>Scan Prescription</Text>
                <Text style={[styles.optionDesc, { fontSize: 12 * fontSizeMultiplier }]}>AI will extract medicine details</Text>
              </View>
              <Feather name="chevron-right" size={20 * fontSizeMultiplier} color={theme.colors.tabInactive} />
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.optionBtn, elderlyMode && { padding: 24 }]}
              onPress={() => {
                closeModal();
                router.push("/add-med");
              }}
            >
              <View style={[styles.optionIcon, { backgroundColor: theme.colors.secondaryLight }]}>
                <Feather name="edit-3" size={22 * fontSizeMultiplier} color={theme.colors.secondary} />
              </View>
              <View style={styles.optionInfo}>
                <Text style={[styles.optionTitle, { fontSize: 16 * fontSizeMultiplier }]}>Add Manually</Text>
                <Text style={[styles.optionDesc, { fontSize: 12 * fontSizeMultiplier }]}>Enter details yourself</Text>
              </View>
              <Feather name="chevron-right" size={20 * fontSizeMultiplier} color={theme.colors.tabInactive} />
            </TouchableOpacity>

            <TouchableOpacity style={styles.cancelBtn} onPress={closeModal}>
              <Text style={[styles.cancelBtnText, { fontSize: 16 * fontSizeMultiplier }]}>Cancel</Text>
            </TouchableOpacity>
          </Animated.View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: theme.colors.background },
  header: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", paddingHorizontal: 20, paddingTop: 16, paddingBottom: 12 },
  headerTitle: { fontWeight: "700", color: theme.colors.primary },
  headerSub: { color: theme.colors.text.secondary, marginTop: 2 },
  addBtn: { width: 40, height: 40, borderRadius: 20, backgroundColor: theme.colors.primary, alignItems: "center", justifyContent: "center" },
  summaryStrip: { flexDirection: "row", backgroundColor: theme.colors.primary, marginHorizontal: 20, borderRadius: 18, paddingVertical: 16, marginBottom: 14 },
  summaryStripElderly: { backgroundColor: "#fff", borderWidth: 2, borderColor: theme.colors.primary },
  summaryItem: { flex: 1, alignItems: "center" },
  summaryValue: { fontWeight: "800", color: theme.colors.surface },
  summaryLabel: { color: "#93C5FD", marginTop: 2 },
  summaryDivider: { width: 1, backgroundColor: "#3B5BA8", marginVertical: 4 },
  filterRow: { paddingHorizontal: 20, paddingBottom: 12, gap: 8, alignItems: "center" },
  filterChip: { height: 36, paddingHorizontal: 18, borderRadius: 18, backgroundColor: theme.colors.surface, borderWidth: 1, borderColor: theme.colors.border, alignItems: "center", justifyContent: "center" },
  filterChipActive: { backgroundColor: theme.colors.primary, borderColor: theme.colors.primary },
  filterText: { color: theme.colors.text.secondary, fontWeight: "500" },
  filterTextActive: { color: theme.colors.surface, fontWeight: "600" },
  list: { paddingHorizontal: 20, paddingBottom: 160, gap: 12 },
  medCard: { 
    backgroundColor: theme.colors.surface, 
    borderRadius: 20, 
    padding: 16, 
    flexDirection: "row", 
    alignItems: "center", 
    gap: 14,
    ...Platform.select({
      ios: { shadowColor: "#000", shadowOpacity: 0.05, shadowRadius: 10, shadowOffset: { width: 0, height: 2 } },
      android: { elevation: 2 }
    })
  },
  medCardElderly: { 
    borderWidth: 1.5, 
    borderColor: theme.colors.border, 
    padding: 20, 
    shadowOpacity: 0, 
    elevation: 0,
    borderRadius: 20,
  },
  medIcon: { width: 48, height: 48, borderRadius: 24, alignItems: "center", justifyContent: "center" },
  medTopRow: { flexDirection: "row", alignItems: "center", gap: 8, marginBottom: 2 },
  medName: { fontWeight: "700", color: theme.colors.text.primary },
  medDose: { color: theme.colors.text.secondary, marginBottom: 2 },
  medTime: { color: theme.colors.tabInactive },
  refillBadge: { backgroundColor: theme.colors.dangerLight, paddingHorizontal: 8, paddingVertical: 2, borderRadius: 8 },
  refillBadgeText: { color: theme.colors.danger, fontWeight: "600" },
  medRight: { alignItems: "center" },
  emptyState: { alignItems: "center", paddingTop: 60, gap: 12 },
  emptyText: { color: theme.colors.tabInactive },
  addMedCard: { 
    backgroundColor: "#EFF6FF", 
    borderRadius: 20, 
    padding: 20, 
    alignItems: "center", 
    borderWidth: 1.5, 
    borderColor: "#BFDBFE", 
    borderStyle: "dashed", 
    gap: 6,
    ...Platform.select({
      ios: { shadowColor: "#000", shadowOpacity: 0.05, shadowRadius: 10, shadowOffset: { width: 0, height: 2 } },
      android: { elevation: 2 }
    })
  },
  addMedCardElderly: {
    padding: 30,
    shadowOpacity: 0,
    elevation: 0,
    borderRadius: 20,
    borderStyle: 'solid',
    borderColor: theme.colors.border,
  },
  addMedIcon: { backgroundColor: theme.colors.primaryLight, alignItems: "center", justifyContent: "center", marginBottom: 4 },
  addMedText: { fontWeight: "700", color: theme.colors.primaryAccent },
  addMedSub: { color: theme.colors.text.secondary },
  modalOverlay: { flex: 1, justifyContent: "flex-end" },
  modalBackdrop: { ...StyleSheet.absoluteFillObject, backgroundColor: "rgba(0,0,0,0.5)" },
  modalContent: { backgroundColor: theme.colors.surface, borderTopLeftRadius: 32, borderTopRightRadius: 32, padding: 24, paddingBottom: 40, ...theme.shadows.md },
  modalHandle: { width: 40, height: 5, backgroundColor: theme.colors.border, borderRadius: 3, alignSelf: "center", marginBottom: 20 },
  modalTitle: { fontWeight: "800", color: theme.colors.primary, textAlign: "center" },
  modalSub: { color: theme.colors.text.secondary, textAlign: "center", marginTop: 4, marginBottom: 24 },
  optionBtn: { flexDirection: "row", alignItems: "center", padding: 16, backgroundColor: theme.colors.background, borderRadius: 20, marginBottom: 12 },
  optionIcon: { width: 48, height: 48, borderRadius: 16, alignItems: "center", justifyContent: "center", marginRight: 16 },
  optionInfo: { flex: 1 },
  optionTitle: { fontWeight: "700", color: theme.colors.text.primary },
  optionDesc: { color: theme.colors.text.secondary, marginTop: 2 },
  cancelBtn: { marginTop: 8, paddingVertical: 16, alignItems: "center" },
  cancelBtnText: { fontWeight: "600", color: theme.colors.text.secondary },
});
