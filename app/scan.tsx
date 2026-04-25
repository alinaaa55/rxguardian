import { Feather, MaterialCommunityIcons, Ionicons } from "@expo/vector-icons";
import { CameraView, useCameraPermissions } from "expo-camera";
import * as ImagePicker from "expo-image-picker";
import { LinearGradient } from "expo-linear-gradient";
import { useRouter } from "expo-router";
import { useEffect, useRef, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Modal,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import api from "../services/api";
import { theme, palette } from "../constants/theme";
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

export default function ScanScreen() {
  const router = useRouter();
  const cameraRef = useRef<CameraView>(null);

  const [permission, requestPermission] = useCameraPermissions();
  const [showCamera, setShowCamera] = useState(false);
  const [capturing, setCapturing] = useState(false);
  const [loading, setLoading] = useState(false);

  const [detectedMedicines, setDetectedMedicines] = useState<any[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [showResult, setShowResult] = useState(false);

  // Editable fields
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

  const [showTimePicker, setShowTimePicker] = useState<{
    slot: "morning" | "afternoon" | "evening";
    visible: boolean;
  }>({ slot: "morning", visible: false });

  useEffect(() => {
    handleOpenCamera();
  }, []);

  const populateFields = (med: any) => {
    setMedicineName(med.name || "");
    setDosage(med.dosage || "");
    setInstructions(med.instructions || "");
    
    // Parse frequency X-X-X
    const freq = med.frequency || "1-0-1";
    const parts = freq.split("-");
    setFrequencySlots({
      morning: parts[0] === "1",
      afternoon: parts[1] === "1",
      evening: parts[2] === "1",
    });
    setSelectedIcon("pill");
    setSelectedColor(COLOR_OPTIONS[0]);
  };

  const handleOpenCamera = async () => {
    if (!permission?.granted) {
      const res = await requestPermission();
      if (!res.granted) {
        Alert.alert("Permission needed", "Allow camera access");
        return;
      }
    }
    setShowCamera(true);
  };

  const handleCapture = async () => {
    if (!cameraRef.current || capturing) return;

    setCapturing(true);
    try {
      const photo = await cameraRef.current.takePictureAsync({ quality: 0.8 });
      if (photo) {
        setShowCamera(false);
        await sendToAPI(photo.uri);
      }
    } catch {
      Alert.alert("Error", "Failed to capture image");
    } finally {
      setCapturing(false);
    }
  };

  const handleGallery = async () => {
    const perm = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!perm.granted) {
      Alert.alert("Permission needed", "Allow gallery access");
      return;
    }
    const picked = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      quality: 0.8,
    });
    if (!picked.canceled) {
      const uri = picked.assets[0].uri;
      setShowCamera(false);
      await sendToAPI(uri);
    }
  };

  const sendToAPI = async (uri: string) => {
    setLoading(true);
    try {
      const formData = new FormData();
      formData.append("file", {
        uri,
        type: "image/jpeg",
        name: "prescription.jpg",
      } as any);

      const response = await api.post("/api/v1/medicines/scan-only", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });

      if (response.data.ok) {
        if (response.data.medicines && response.data.medicines.length > 0) {
          setDetectedMedicines(response.data.medicines);
          setCurrentIndex(0);
          populateFields(response.data.medicines[0]);
          setShowResult(true);
        } else {
          Alert.alert("Notice", "No medicines detected in the image.");
          handleOpenCamera();
        }
      } else {
        Alert.alert("Error", response.data.error || "Failed to process image");
        handleOpenCamera();
      }
    } catch (error) {
      console.error(error);
      Alert.alert("Error", "Failed to connect to backend");
      handleOpenCamera();
    } finally {
      setLoading(false);
    }
  };

  const handleNext = async () => {
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
      const res = await api.post("/api/v1/medicines/manual", payload);
      const medicineId = res.data.id;

      // Schedule reminders
      tSlots.forEach(slot => {
        notificationService.scheduleMedicineReminder(medicineId, medicineName, slot.time);
      });
      
      if (currentIndex < detectedMedicines.length - 1) {
        const nextIdx = currentIndex + 1;
        setCurrentIndex(nextIdx);
        populateFields(detectedMedicines[nextIdx]);
      } else {
        setShowResult(false);
        router.replace("/(tabs)/meds");
      }
    } catch (error) {
      Alert.alert("Error", "Failed to save medicine");
    } finally {
      setLoading(false);
    }
  };


  const handleRescan = () => {
    setShowResult(false);
    setDetectedMedicines([]);
    handleOpenCamera();
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

  // ── CAMERA SCREEN ──
  if (showCamera) {
    return (
      <View style={styles.cameraContainer}>
        <CameraView
          ref={cameraRef}
          style={StyleSheet.absoluteFill}
          facing="back"
        />

        <SafeAreaView style={styles.cameraTopBar}>
          <TouchableOpacity
            style={styles.circleBtn}
            onPress={() => {
              setShowCamera(false);
              router.replace("/(tabs)");
            }}
          >
            <Feather name="x" size={20} color="white" />
          </TouchableOpacity>
        </SafeAreaView>

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

        <View style={styles.bottomBar}>
          <TouchableOpacity style={styles.bottomItem} onPress={handleGallery}>
            <MaterialCommunityIcons
              name="image-outline"
              size={24}
              color="#9CA3AF"
            />
            <Text style={styles.bottomText}>Gallery</Text>
          </TouchableOpacity>

          <TouchableOpacity onPress={handleCapture}>
            <View style={styles.captureOuter}>
              <View style={styles.captureInner} />
            </View>
          </TouchableOpacity>

          <View style={styles.bottomItem}>
            <Feather name="info" size={22} color="#9CA3AF" />
            <Text style={styles.bottomText}>Help</Text>
          </View>
        </View>
      </View>
    );
  }

  return (
    <LinearGradient colors={["#020617", "#0B1B34"]} style={{ flex: 1 }}>
      <SafeAreaView style={{ flex: 1, justifyContent: "center" }}>
        {loading ? (
          <View style={styles.loadingOverlay}>
            <ActivityIndicator size="large" color="#22c55e" />
            <Text style={{ color: "white", marginTop: 12 }}>Processing...</Text>
          </View>
        ) : (
          <Text style={{ color: "white", textAlign: "center" }}>
            Preparing scan...
          </Text>
        )}
      </SafeAreaView>

      {renderTimePicker()}

      <Modal visible={showResult} transparent animationType="slide">
        <View style={styles.modalBackdrop}>
          <View style={styles.sheet}>
            <View style={styles.handle} />

            <View style={styles.sheetHeader}>
              <View>
                <Text style={styles.sheetTitle}>Confirm Medicine</Text>
                <Text style={styles.sheetSubtitle}>
                  Medicine {currentIndex + 1} of {detectedMedicines.length}
                </Text>
              </View>
            </View>

            <ScrollView showsVerticalScrollIndicator={false}>
              {/* Icon selection */}
              <Text style={styles.label}>ICON</Text>
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
                      selectedIcon === opt.icon && { borderColor: "#1E3A8A" },
                    ]}
                    onPress={() => setSelectedIcon(opt.icon)}
                  >
                    <MaterialCommunityIcons
                      name={opt.icon as any}
                      size={22}
                      color={selectedIcon === opt.icon ? selectedColor.color : "#9CA3AF"}
                    />
                  </TouchableOpacity>
                ))}
              </ScrollView>

              {/* Color selection */}
              <Text style={styles.label}>COLOR</Text>
              <View style={styles.colorSelectionRow}>
                {COLOR_OPTIONS.map((opt) => (
                  <TouchableOpacity
                    key={opt.color}
                    style={[
                      styles.colorDot,
                      { backgroundColor: opt.color },
                      selectedColor.color === opt.color && { borderColor: "#000", borderWidth: 2 },
                    ]}
                    onPress={() => setSelectedColor(opt)}
                  />
                ))}
              </View>

              {/* Medicine name */}
              <View style={styles.fieldGroup}>
                <Text style={styles.label}>MEDICINE NAME</Text>
                <View style={styles.inputRow}>
                  <TextInput
                    style={styles.inputFlex}
                    value={medicineName}
                    onChangeText={setMedicineName}
                    placeholder="Enter medicine name"
                    placeholderTextColor="#9CA3AF"
                  />
                </View>
              </View>

              {/* Dosage + Duration */}
              <View style={styles.row}>
                <View style={{ flex: 1 }}>
                  <Text style={styles.label}>DOSAGE</Text>
                  <TextInput
                    style={styles.input}
                    value={dosage}
                    onChangeText={setDosage}
                    placeholder="e.g. 500mg"
                    placeholderTextColor="#9CA3AF"
                  />
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={styles.label}>DURATION (DAYS)</Text>
                  <TextInput
                    style={styles.input}
                    value={durationDays}
                    onChangeText={setDurationDays}
                    keyboardType="numeric"
                    placeholder="e.g. 7"
                    placeholderTextColor="#9CA3AF"
                  />
                </View>
              </View>

              {/* Frequency Checkboxes */}
              <Text style={styles.label}>FREQUENCY</Text>
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
                      color={frequencySlots[slot] ? "#1E3A8A" : "#9CA3AF"}
                    />
                    <Text style={[styles.checkboxText, frequencySlots[slot] && styles.activeText]}>
                      {slot.charAt(0).toUpperCase() + slot.slice(1)}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>

              {/* Time Selection */}
              <Text style={styles.label}>SET TIMINGS</Text>
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

              {/* Instructions */}
              <View style={styles.fieldGroup}>
                <Text style={styles.label}>INSTRUCTIONS</Text>
                <TextInput
                  style={styles.input}
                  value={instructions}
                  onChangeText={setInstructions}
                  placeholder="e.g. After food"
                  placeholderTextColor="#9CA3AF"
                />
              </View>

              {/* Confirm */}
              <TouchableOpacity
                style={styles.confirmBtn}
                onPress={handleNext}
              >
                <Text style={styles.confirmText}>
                  {currentIndex < detectedMedicines.length - 1 ? "Next Medicine →" : "Save & Finish"}
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                onPress={handleRescan}
                style={{ paddingVertical: 12 }}
              >
                <Text style={styles.rescanText}>Cancel & Rescan</Text>
              </TouchableOpacity>
            </ScrollView>
          </View>
        </View>
      </Modal>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  // ── camera ──
  cameraContainer: { flex: 1, backgroundColor: "#000" },
  cameraTopBar: { paddingHorizontal: 20, marginTop: 10 },
  circleBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "rgba(255,255,255,0.2)",
    justifyContent: "center",
    alignItems: "center",
  },
  frameContainer: {
    position: "absolute",
    top: 0,
    bottom: 120,
    left: 0,
    right: 0,
    justifyContent: "center",
    alignItems: "center",
  },
  frame: {
    width: 300,
    height: 400,
    borderRadius: 24,
    borderWidth: 1.5,
    borderColor: "#64748B",
    justifyContent: "flex-end",
    alignItems: "center",
    paddingBottom: 20,
  },
  frameText: { color: "#E5E7EB", fontSize: 14 },
  cornerTL: {
    position: "absolute",
    top: 16,
    left: 16,
    width: 30,
    height: 30,
    borderTopWidth: 3,
    borderLeftWidth: 3,
    borderColor: "white",
  },
  cornerTR: {
    position: "absolute",
    top: 16,
    right: 16,
    width: 30,
    height: 30,
    borderTopWidth: 3,
    borderRightWidth: 3,
    borderColor: "white",
  },
  cornerBL: {
    position: "absolute",
    bottom: 16,
    left: 16,
    width: 30,
    height: 30,
    borderBottomWidth: 3,
    borderLeftWidth: 3,
    borderColor: "white",
  },
  cornerBR: {
    position: "absolute",
    bottom: 16,
    right: 16,
    width: 30,
    height: 30,
    borderBottomWidth: 3,
    borderRightWidth: 3,
    borderColor: "white",
  },
  bottomBar: {
    position: "absolute",
    bottom: 0,
    width: "100%",
    height: 120,
    backgroundColor: "#000",
    flexDirection: "row",
    justifyContent: "space-around",
    alignItems: "center",
  },
  bottomItem: { alignItems: "center" },
  bottomText: { color: "#9CA3AF", fontSize: 12 },
  captureOuter: {
    width: 80,
    height: 80,
    borderRadius: 40,
    borderWidth: 4,
    borderColor: "white",
    justifyContent: "center",
    alignItems: "center",
  },
  captureInner: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: "#E5E7EB",
  },

  // ── loading ──
  loadingOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(0,0,0,0.7)",
    justifyContent: "center",
    alignItems: "center",
    zIndex: 10,
  },

  // ── bottom sheet ──
  modalBackdrop: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.5)",
    justifyContent: "flex-end",
  },
  sheet: {
    backgroundColor: "#fff",
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    paddingHorizontal: 20,
    paddingBottom: 34,
    paddingTop: 12,
    maxHeight: "88%",
  },
  handle: {
    width: 36,
    height: 4,
    borderRadius: 2,
    backgroundColor: "#E5E7EB",
    alignSelf: "center",
    marginBottom: 16,
  },
  sheetHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: 16,
  },
  sheetTitle: { fontSize: 18, fontWeight: "600", color: "#111827" },
  sheetSubtitle: { fontSize: 13, color: "#6B7280", marginTop: 2 },

  // fields
  fieldGroup: { marginBottom: 14 },
  label: {
    fontSize: 10,
    letterSpacing: 0.8,
    color: "#9CA3AF",
    marginBottom: 8,
    textTransform: "uppercase",
  },
  inputRow: {
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#E5E7EB",
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 10,
  },
  inputFlex: { flex: 1, fontSize: 15, fontWeight: "500", color: "#111827" },
  row: { flexDirection: "row", gap: 12, marginBottom: 14 },
  input: {
    borderWidth: 1,
    borderColor: "#E5E7EB",
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 14,
    fontWeight: "500",
    color: "#111827",
  },

  // Checkboxes
  checkboxContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 16,
    backgroundColor: "#F9FAFB",
    padding: 12,
    borderRadius: 12,
  },
  checkboxItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  checkboxText: { fontSize: 14, color: "#6B7280" },
  activeText: { color: "#1E3A8A", fontWeight: "600" },

  // Time slots
  timeGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 10,
    marginBottom: 16,
  },
  timeSlotBtn: {
    flex: 1,
    minWidth: "30%",
    backgroundColor: "#EFF6FF",
    borderWidth: 1,
    borderColor: "#BFDBFE",
    borderRadius: 10,
    padding: 10,
    alignItems: "center",
  },
  timeSlotLabel: { fontSize: 10, color: "#1E40AF", marginBottom: 2 },
  timeSlotValue: { fontSize: 13, fontWeight: "600", color: "#1E3A8A" },

  // Time Picker Modal
  timePickerOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.5)",
    justifyContent: "center",
    alignItems: "center",
  },
  timePickerContent: {
    backgroundColor: "white",
    width: "80%",
    borderRadius: 20,
    padding: 20,
    alignItems: "center",
  },
  timePickerTitle: { fontSize: 16, fontWeight: "700", marginBottom: 15 },
  timeOption: { paddingVertical: 12, width: "100%", alignItems: "center", borderBottomWidth: 1, borderBottomColor: "#F3F4F6" },
  timeOptionText: { fontSize: 16, color: "#111827" },
  timePickerClose: { marginTop: 15, padding: 10 },

  // buttons
  confirmBtn: {
    backgroundColor: "#1E3A8A",
    borderRadius: 12,
    paddingVertical: 14,
    alignItems: "center",
    marginTop: 8,
    marginBottom: 4,
  },
  confirmText: { color: "white", fontSize: 15, fontWeight: "600" },
  rescanText: { textAlign: "center", fontSize: 13, color: "#DC2626" },

  // Icon & Color Selection
  iconRow: { flexDirection: "row", gap: 12, marginBottom: 16 },
  iconOption: {
    width: 50,
    height: 50,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 2,
    borderColor: "transparent",
  },
  colorSelectionRow: { flexDirection: "row", gap: 12, marginBottom: 16, flexWrap: "wrap" },
  colorDot: {
    width: 32,
    height: 32,
    borderRadius: 16,
  },
});


