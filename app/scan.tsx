import { Feather, MaterialCommunityIcons } from "@expo/vector-icons";
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

const API_BASE = "http://192.168.1.5:8000";

export default function ScanScreen() {
  const router = useRouter();
  const cameraRef = useRef<CameraView>(null);

  const [permission, requestPermission] = useCameraPermissions();
  const [showCamera, setShowCamera] = useState(false);
  const [capturing, setCapturing] = useState(false);
  const [loading, setLoading] = useState(false);

  const [result, setResult] = useState<any>(null);
  const [showResult, setShowResult] = useState(false);

  // Editable fields
  const [medicineName, setMedicineName] = useState("");
  const [dosage, setDosage] = useState("");
  const [form, setForm] = useState("");
  const [frequency, setFrequency] = useState("");
  const [confidence, setConfidence] = useState<number | null>(null);
  const [sourceFile, setSourceFile] = useState("Scanned_Rx_001.jpg");

  useEffect(() => {
    handleOpenCamera();
  }, []);

  // Populate fields when result arrives
  useEffect(() => {
    if (result) {
      setMedicineName(result.medicine_name ?? result.name ?? "");
      setDosage(result.dosage ?? "");
      setForm(result.form ?? result.drug_form ?? "");
      setFrequency(result.frequency ?? "");
      setConfidence(result.confidence ?? result.match_score ?? null);
    }
  }, [result]);

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
      await cameraRef.current.takePictureAsync({ quality: 0.8 });
      setShowCamera(false);

      // ── MOCK DATA for UI testing ──
      setResult({
        medicine_name: "Amoxicillin",
        dosage: "500mg",
        form: "Tablet",
        frequency: "Twice daily",
        confidence: 0.92,
      });
      setShowResult(true);
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
      const filename = uri.split("/").pop() ?? "image.jpg";
      setSourceFile(filename);
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
        name: "image.jpg",
      } as any);
      const res = await fetch(`${API_BASE}/prescriptions/parse-image`, {
        method: "POST",
        body: formData,
      });
      const data = await res.json();
      setResult(data);
      setShowResult(true);
    } catch {
      Alert.alert("Error", "Failed to process image");
    } finally {
      setLoading(false);
    }
  };

  const handleConfirm = () => {
    const confirmed = { medicine_name: medicineName, dosage, form, frequency };
    console.log("Confirmed:", confirmed);
    // TODO: save to your backend/state
    setShowResult(false);
    router.replace("/home");
  };

  const handleRescan = () => {
    setShowResult(false);
    setResult(null);
    handleOpenCamera();
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
              router.replace("/home");
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

          <TouchableOpacity style={styles.bottomItem}>
            <Feather name="rotate-ccw" size={22} color="#9CA3AF" />
            <Text style={styles.bottomText}>History</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  // ── LOADING + RESULT ──
  return (
    <LinearGradient colors={["#020617", "#0B1B34"]} style={{ flex: 1 }}>
      <SafeAreaView style={{ flex: 1, justifyContent: "center" }}>
        <Text style={{ color: "white", textAlign: "center" }}>
          Opening Camera...
        </Text>
      </SafeAreaView>

      {loading && (
        <View style={styles.loadingOverlay}>
          <ActivityIndicator size="large" color="#22c55e" />
          <Text style={{ color: "white", marginTop: 12 }}>Processing...</Text>
        </View>
      )}

      {/* ── VERIFY DETAILS MODAL ── */}
      <Modal visible={showResult} transparent animationType="slide">
        <View style={styles.modalBackdrop}>
          {/* Tap outside to dismiss */}
          <TouchableOpacity
            style={StyleSheet.absoluteFill}
            onPress={() => setShowResult(false)}
            activeOpacity={1}
          />

          <View style={styles.sheet}>
            {/* Handle */}
            <View style={styles.handle} />

            {/* Header */}
            <View style={styles.sheetHeader}>
              <View>
                <Text style={styles.sheetTitle}>Verify Details</Text>
                <Text style={styles.sheetSubtitle}>
                  Review extracted information
                </Text>
              </View>
              {confidence !== null && (
                <View style={styles.badge}>
                  <View style={styles.badgeDot} />
                  <Text style={styles.badgeText}>
                    {Math.round(confidence * 100)}% Match
                  </Text>
                </View>
              )}
            </View>

            <ScrollView showsVerticalScrollIndicator={false}>
              {/* Source row */}
              <View style={styles.sourceRow}>
                <View style={styles.sourceThumb} />
                <View>
                  <Text style={styles.label}>SOURCE</Text>
                  <Text style={styles.sourceFile}>{sourceFile}</Text>
                  <Text style={styles.viewOriginal}>View Original</Text>
                </View>
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
                  <View style={styles.pillBadge}>
                    <Feather name="edit-2" size={11} color="#185FA5" />
                  </View>
                </View>
              </View>

              {/* Dosage + Form */}
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
                  <Text style={styles.label}>FORM</Text>
                  <TextInput
                    style={styles.input}
                    value={form}
                    onChangeText={setForm}
                    placeholder="e.g. Tablet"
                    placeholderTextColor="#9CA3AF"
                  />
                </View>
              </View>

              {/* Frequency */}
              <View style={styles.fieldGroup}>
                <Text style={styles.label}>FREQUENCY</Text>
                <TextInput
                  style={styles.input}
                  value={frequency}
                  onChangeText={setFrequency}
                  placeholder="e.g. Twice daily"
                  placeholderTextColor="#9CA3AF"
                />
              </View>

              {/* Confirm */}
              <TouchableOpacity
                style={styles.confirmBtn}
                onPress={handleConfirm}
              >
                <Text style={styles.confirmText}>Confirm & Save →</Text>
              </TouchableOpacity>

              <TouchableOpacity
                onPress={handleRescan}
                style={{ paddingVertical: 12 }}
              >
                <Text style={styles.rescanText}>Rescan Document</Text>
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
    width: 320,
    height: 360,
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
  badge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
    backgroundColor: "#DCFCE7",
    borderRadius: 20,
    paddingHorizontal: 10,
    paddingVertical: 5,
  },
  badgeDot: {
    width: 7,
    height: 7,
    borderRadius: 4,
    backgroundColor: "#16A34A",
  },
  badgeText: { fontSize: 12, color: "#15803D", fontWeight: "500" },

  // source
  sourceRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    backgroundColor: "#F9FAFB",
    borderRadius: 10,
    padding: 10,
    marginBottom: 16,
  },
  sourceThumb: {
    width: 36,
    height: 36,
    borderRadius: 8,
    backgroundColor: "#E5E7EB",
  },
  sourceFile: {
    fontSize: 13,
    fontWeight: "500",
    color: "#111827",
    marginTop: 2,
  },
  viewOriginal: { fontSize: 12, color: "#1D4ED8", marginTop: 2 },

  // fields
  fieldGroup: { marginBottom: 14 },
  label: {
    fontSize: 10,
    letterSpacing: 0.8,
    color: "#9CA3AF",
    marginBottom: 6,
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
  pillBadge: {
    width: 20,
    height: 20,
    borderRadius: 4,
    backgroundColor: "#EFF6FF",
    justifyContent: "center",
    alignItems: "center",
  },
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
  rescanText: { textAlign: "center", fontSize: 13, color: "#1D4ED8" },
});
