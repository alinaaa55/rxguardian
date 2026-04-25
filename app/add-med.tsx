import { Feather, MaterialCommunityIcons, Ionicons } from "@expo/vector-icons";
import { useRouter, useLocalSearchParams } from "expo-router";
import { useState, useEffect } from "react";
import {
    Modal,
    ScrollView,
    StatusBar,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View,
    KeyboardAvoidingView,
    Platform,
    ActivityIndicator,
    Alert,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { theme, palette } from "../constants/theme";
import api from "../services/api";
import { aiService } from "../services/aiService";
import { notificationService } from "../services/notificationService";

const ICON_OPTIONS = [
  { icon: "pill", label: "Pill" },
  { icon: "white-balance-sunny", label: "Vitamin" },
  { icon: "heart-pulse", label: "Heart" },
  { icon: "needle", label: "Injection" },
  { icon: "eyedrop", label: "Drops" },
  { icon: "bottle-tonic", label: "Syrup" },
  { icon: "bandage", label: "Bandage" },
  { icon: "flask-outline", label: "Liquid" },
];

const COLOR_OPTIONS = [
  { color: palette.primary.accent, bg: palette.primary.light },
  { color: palette.secondary.main, bg: palette.secondary.light },
  { color: "#EAB308", bg: "#FEF9C3" },
  { color: palette.danger.accent, bg: palette.danger.light },
  { color: "#7C3AED", bg: "#EDE9FE" },
  { color: palette.success.main, bg: palette.success.light },
];

export default function AddMedScreen() {
  const router = useRouter();
  const params = useLocalSearchParams();
  const editId = params.id as string;

  const [loading, setLoading] = useState(false);
  const [medicineName, setMedicineName] = useState("");
  const [dosage, setDosage] = useState("");
  const [instructions, setInstructions] = useState("");
  const [durationDays, setDurationDays] = useState("7");
  const [frequencySlots, setFrequencySlots] = useState({
    morning: false,
    afternoon: false,
    evening: false,
  });
  const [timeSlots, setTimeSlots] = useState({
    morning: "08:00 AM",
    afternoon: "02:00 PM",
    evening: "08:00 PM",
  });
  const [selectedIcon, setSelectedIcon] = useState("pill");
  const [selectedColor, setSelectedColor] = useState(COLOR_OPTIONS[0]);

  const [loadingAI, setLoadingAI] = useState(false);

  const handleCheckInteractions = async () => {
    if (!medicineName.trim()) {
      Alert.alert("Input Required", "Please enter a medicine name first.");
      return;
    }

    try {
      setLoadingAI(true);
      const res = await aiService.getInteractionAlert(medicineName);
      Alert.alert("AI Safety Check", res.bot_message.message);
    } catch (error) {
      console.error("AI check error:", error);
      Alert.alert("Error", "Could not complete safety check. Please try again.");
    } finally {
      setLoadingAI(false);
    }
  };

  const [showTimePicker, setShowTimePicker] = useState<{
    slot: "morning" | "afternoon" | "evening";
    visible: boolean;
  }>({ slot: "morning", visible: false });

  useEffect(() => {
    if (editId) {
      loadMed();
    }
  }, [editId]);

  const loadMed = async () => {
    try {
      setLoading(true);
      const res = await api.get(`/api/v1/medicines/${editId}`);
      const med = res.data;
      setMedicineName(med.name);
      setDosage(med.dosage);
      setInstructions(med.instructions);
      setDurationDays(med.duration_days.toString());
      
      const parts = (med.frequency || "0-0-0").split("-");
      setFrequencySlots({
        morning: parts[0] === "1",
        afternoon: parts[1] === "1",
        evening: parts[2] === "1",
      });

      // Map time slots back
      const newTimeSlots = { ...timeSlots };
      med.time_slots.forEach((ts: any) => {
        const h = parseInt(ts.time.split(":")[0]);
        const isPM = ts.time.includes("PM");
        if ((h >= 6 && h < 12 && !isPM) || (h === 12 && isPM)) newTimeSlots.morning = ts.time;
        else if ((h >= 12 && h < 5 && isPM) || (h === 12 && !isPM)) newTimeSlots.afternoon = ts.time;
        else newTimeSlots.evening = ts.time;
      });
      setTimeSlots(newTimeSlots);
      
      setSelectedIcon(med.icon || "pill");
      const colorOpt = COLOR_OPTIONS.find(c => c.color === med.color) || COLOR_OPTIONS[0];
      setSelectedColor(colorOpt);
    } catch (error) {
      Alert.alert("Error", "Failed to load medicine details");
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    if (!medicineName.trim() || !dosage.trim()) {
      Alert.alert("Missing Info", "Please enter medicine name and dosage");
      return;
    }

    const tSlots = [];
    if (frequencySlots.morning) tSlots.push({ time: timeSlots.morning, instructions: "" });
    if (frequencySlots.afternoon) tSlots.push({ time: timeSlots.afternoon, instructions: "" });
    if (frequencySlots.evening) tSlots.push({ time: timeSlots.evening, instructions: "" });

    const freqStr = `${frequencySlots.morning ? "1" : "0"}-${frequencySlots.afternoon ? "1" : "0"}-${frequencySlots.evening ? "1" : "0"}`;

    const payload = {
      name: medicineName,
      dosage,
      frequency: freqStr,
      time_slots: tSlots,
      instructions,
      duration_days: parseInt(durationDays) || 0,
      icon: selectedIcon,
      color: selectedColor.color,
      bgColor: selectedColor.bg,
    };

    try {
      setLoading(true);
      let medicineId = editId;
      if (editId) {
        await api.put(`/api/v1/medicines/${editId}`, payload);
      } else {
        const res = await api.post("/api/v1/medicines/manual", payload);
        medicineId = res.data.id;
      }

      // Schedule reminders
      tSlots.forEach(slot => {
        notificationService.scheduleMedicineReminder(medicineId, medicineName, slot.time);
      });

      router.back();
    } catch (error) {
      Alert.alert("Error", "Failed to save medicine");
    } finally {
      setLoading(false);
    }
  };


  const renderTimePicker = () => {
    const { slot } = showTimePicker;
    let options: string[] = [];
    if (slot === "morning") options = ["06:00 AM", "07:00 AM", "08:00 AM", "09:00 AM", "10:00 AM", "11:00 AM"];
    if (slot === "afternoon") options = ["12:00 PM", "01:00 PM", "02:00 PM", "03:00 PM", "04:00 PM"];
    if (slot === "evening") options = ["05:00 PM", "06:00 PM", "07:00 PM", "08:00 PM", "09:00 PM", "10:00 PM", "11:00 PM"];

    return (
      <Modal visible={showTimePicker.visible} transparent animationType="fade">
        <View style={styles.timePickerOverlay}>
          <View style={styles.timePickerContent}>
            <Text style={styles.timePickerTitle}>Select {slot} time</Text>
            {options.map((time) => (
              <TouchableOpacity
                key={time}
                style={styles.timeOption}
                onPress={() => {
                  setTimeSlots({ ...timeSlots, [slot]: time });
                  setShowTimePicker({ ...showTimePicker, visible: false });
                }}
              >
                <Text style={styles.timeOptionText}>{time}</Text>
              </TouchableOpacity>
            ))}
            <TouchableOpacity
              style={styles.timePickerClose}
              onPress={() => setShowTimePicker({ ...showTimePicker, visible: false })}
            >
              <Text style={{ color: "red" }}>Cancel</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    );
  };

  return (
    <SafeAreaView style={styles.safe}>
      <StatusBar barStyle="dark-content" />
      {renderTimePicker()}
      
      <KeyboardAvoidingView 
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={{ flex: 1 }}
      >
        <View style={styles.header}>
          <TouchableOpacity style={styles.backBtn} onPress={() => router.back()}>
            <Feather name="x" size={20} color={theme.colors.primary} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>{editId ? "Edit Medication" : "Add Medication"}</Text>
          <TouchableOpacity style={styles.saveBtn} onPress={handleSave} disabled={loading}>
            {loading ? <ActivityIndicator size="small" color="white" /> : <Text style={styles.saveBtnText}>{editId ? "Update" : "Save"}</Text>}
          </TouchableOpacity>
        </View>

        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.scroll}
          keyboardShouldPersistTaps="handled"
        >
          <Text style={styles.sectionLabel}>ICON</Text>
          <ScrollView 
            horizontal 
            showsHorizontalScrollIndicator={false} 
            contentContainerStyle={styles.iconRow}
          >
            {ICON_OPTIONS.map((opt) => (
              <TouchableOpacity
                key={opt.icon}
                style={[
                  styles.iconOption,
                  { backgroundColor: selectedColor.bg },
                  selectedIcon === opt.icon && { borderColor: theme.colors.primary, borderWidth: 2 },
                ]}
                onPress={() => setSelectedIcon(opt.icon)}
              >
                <MaterialCommunityIcons
                  name={opt.icon as any}
                  size={24}
                  color={selectedIcon === opt.icon ? selectedColor.color : theme.colors.tabInactive}
                />
              </TouchableOpacity>
            ))}
          </ScrollView>

          <Text style={styles.sectionLabel}>COLOR</Text>
          <View style={styles.colorRow}>
            {COLOR_OPTIONS.map((opt) => (
              <TouchableOpacity
                key={opt.color}
                style={[
                  styles.colorDot,
                  { backgroundColor: opt.color },
                  selectedColor.color === opt.color && { borderColor: theme.colors.primary, borderWidth: 2.5 },
                ]}
                onPress={() => setSelectedColor(opt)}
              />
            ))}
          </View>

          <Text style={styles.sectionLabel}>DETAILS</Text>
          <View style={styles.fieldGroup}>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}>
              <Text style={styles.fieldSub}>Medicine Name</Text>
              <TouchableOpacity 
                style={[styles.aiCheckBtn, !medicineName.trim() && { opacity: 0.5 }]} 
                onPress={handleCheckInteractions}
                disabled={loadingAI || !medicineName.trim()}
              >
                {loadingAI ? (
                  <ActivityIndicator size="small" color={theme.colors.primary} />
                ) : (
                  <>
                    <MaterialCommunityIcons name="robot-happy-outline" size={14} color={theme.colors.primary} />
                    <Text style={styles.aiCheckText}>AI Check</Text>
                  </>
                )}
              </TouchableOpacity>
            </View>
            <TextInput
              style={styles.input}
              value={medicineName}
              onChangeText={setMedicineName}
              placeholder="e.g. Metformin"
            />
          </View>

          <View style={styles.row}>
            <View style={{ flex: 1 }}>
              <Text style={styles.fieldSub}>Dosage</Text>
              <TextInput
                style={styles.input}
                value={dosage}
                onChangeText={setDosage}
                placeholder="e.g. 500mg"
              />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={styles.fieldSub}>Duration (Days)</Text>
              <TextInput
                style={styles.input}
                value={durationDays}
                onChangeText={setDurationDays}
                keyboardType="numeric"
                placeholder="e.g. 7"
              />
            </View>
          </View>

          <Text style={styles.sectionLabel}>FREQUENCY</Text>
          <View style={styles.checkboxContainer}>
            {(["morning", "afternoon", "evening"] as const).map((slot) => (
              <TouchableOpacity
                key={slot}
                style={styles.checkboxItem}
                onPress={() => setFrequencySlots({ ...frequencySlots, [slot]: !frequencySlots[slot] })}
              >
                <Ionicons
                  name={frequencySlots[slot] ? "checkbox" : "square-outline"}
                  size={24}
                  color={frequencySlots[slot] ? theme.colors.primary : theme.colors.tabInactive}
                />
                <Text style={[styles.checkboxText, frequencySlots[slot] && styles.activeText]}>
                  {slot.charAt(0).toUpperCase() + slot.slice(1)}
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          <Text style={styles.sectionLabel}>SET TIMINGS</Text>
          <View style={styles.timeGrid}>
            {frequencySlots.morning && (
              <TouchableOpacity
                style={styles.timeSlotBtn}
                onPress={() => setShowTimePicker({ slot: "morning", visible: true })}
              >
                <Text style={styles.timeSlotLabel}>Morning</Text>
                <Text style={styles.timeSlotValue}>{timeSlots.morning}</Text>
              </TouchableOpacity>
            )}
            {frequencySlots.afternoon && (
              <TouchableOpacity
                style={styles.timeSlotBtn}
                onPress={() => setShowTimePicker({ slot: "afternoon", visible: true })}
              >
                <Text style={styles.timeSlotLabel}>Afternoon</Text>
                <Text style={styles.timeSlotValue}>{timeSlots.afternoon}</Text>
              </TouchableOpacity>
            )}
            {frequencySlots.evening && (
              <TouchableOpacity
                style={styles.timeSlotBtn}
                onPress={() => setShowTimePicker({ slot: "evening", visible: true })}
              >
                <Text style={styles.timeSlotLabel}>Evening</Text>
                <Text style={styles.timeSlotValue}>{timeSlots.evening}</Text>
              </TouchableOpacity>
            )}
          </View>

          <View style={styles.fieldGroup}>
            <Text style={styles.fieldSub}>Instructions</Text>
            <TextInput
              style={styles.input}
              value={instructions}
              onChangeText={setInstructions}
              placeholder="e.g. After food"
            />
          </View>

          <View style={{ height: 40 }} />
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: theme.colors.background },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingVertical: 14,
  },
  backBtn: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: theme.colors.border,
    alignItems: "center",
    justifyContent: "center",
  },
  headerTitle: { fontSize: 17, fontWeight: "700", color: theme.colors.primary },
  saveBtn: {
    backgroundColor: theme.colors.primary,
    paddingHorizontal: 20,
    paddingVertical: 8,
    borderRadius: 20,
    minWidth: 80,
    alignItems: "center",
  },
  saveBtnText: { color: theme.colors.surface, fontWeight: "700", fontSize: 14 },
  scroll: { paddingHorizontal: 20, paddingBottom: 60 },
  sectionLabel: {
    fontSize: 11,
    fontWeight: "700",
    color: theme.colors.text.secondary,
    letterSpacing: 0.8,
    marginTop: 24,
    marginBottom: 12,
  },
  iconRow: { flexDirection: "row", gap: 12 },
  iconOption: {
    width: 54,
    height: 54,
    borderRadius: 16,
    alignItems: "center",
    justifyContent: "center",
  },
  colorRow: { flexDirection: "row", gap: 12, alignItems: "center", flexWrap: "wrap" },
  colorDot: {
    width: 32,
    height: 32,
    borderRadius: 16,
    borderWidth: 2,
    borderColor: "transparent",
  },
  fieldGroup: { marginBottom: 16 },
  fieldSub: { fontSize: 11, color: theme.colors.tabInactive, marginBottom: 6 },
  input: {
    backgroundColor: "white",
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 15,
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  row: { flexDirection: "row", gap: 12, marginBottom: 16 },
  checkboxContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    backgroundColor: "white",
    padding: 16,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  checkboxItem: { flexDirection: "row", alignItems: "center", gap: 8 },
  checkboxText: { fontSize: 14, color: theme.colors.text.secondary },
  activeText: { color: theme.colors.primary, fontWeight: "600" },
  timeGrid: { flexDirection: "row", gap: 10, flexWrap: "wrap", marginTop: 4 },
  timeSlotBtn: {
    flex: 1,
    minWidth: "30%",
    backgroundColor: theme.colors.primaryLight,
    padding: 12,
    borderRadius: 12,
    alignItems: "center",
    borderWidth: 1,
    borderColor: theme.colors.primaryAccent + "40",
  },
  timeSlotLabel: { fontSize: 10, color: theme.colors.primaryAccent, marginBottom: 2 },
  timeSlotValue: { fontSize: 14, fontWeight: "700", color: theme.colors.primary },
  timePickerOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.5)",
    justifyContent: "center",
    alignItems: "center",
  },
  timePickerContent: {
    backgroundColor: "white",
    width: "80%",
    borderRadius: 24,
    padding: 24,
    alignItems: "center",
  },
  timePickerTitle: { fontSize: 18, fontWeight: "800", marginBottom: 20 },
  timeOption: { paddingVertical: 14, width: "100%", alignItems: "center", borderBottomWidth: 1, borderBottomColor: "#F3F4F6" },
  timeOptionText: { fontSize: 16, color: theme.colors.text.primary, fontWeight: "500" },
  timePickerClose: { marginTop: 20, padding: 10 },
  aiCheckBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: theme.colors.primaryLight,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: theme.colors.primaryAccent + '30',
  },
  aiCheckText: {
    fontSize: 11,
    fontWeight: '700',
    color: theme.colors.primary,
  },
});
