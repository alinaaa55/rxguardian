import { Feather, Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import { CameraView, useCameraPermissions } from "expo-camera";
import { LinearGradient } from "expo-linear-gradient";
import { useRouter } from "expo-router";
import React, { useRef, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Modal,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

// ─── Types ────────────────────────────────────────────────────────────────────
interface ParsedResult {
  patient_name?: string;
  doctor?: string;
  confidence_score?: number;
  medications?: {
    name: string;
    dosage: string;
    frequency: string;
    form?: string;
    duration?: string;
  }[];
  raw_text?: string;
}

// ─── Constants ────────────────────────────────────────────────────────────────
const API_BASE = "http://localhost:8000";

// ─── Main Component ───────────────────────────────────────────────────────────
export default function ScanScreen() {
  const router = useRouter();
  const cameraRef = useRef<CameraView>(null);

  const [permission, requestPermission] = useCameraPermissions();
  const [flashOn, setFlashOn] = useState(false);
  const [showCamera, setShowCamera] = useState(false);
  const [capturing, setCapturing] = useState(false);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<ParsedResult | null>(null);
  const [showResult, setShowResult] = useState(false);
  const [selectedMedIndex, setSelectedMedIndex] = useState(0);

  // ── Open camera ─────────────────────────────────────────────────────────────
  const handleOpenCamera = async () => {
    if (!permission?.granted) {
      const res = await requestPermission();
      if (!res.granted) {
        Alert.alert(
          "Camera Permission",
          "Please allow camera access in Settings to scan prescriptions.",
        );
        return;
      }
    }
    setShowCamera(true);
  };

  // ── Capture photo & send to API ──────────────────────────────────────────────
  const handleCapture = async () => {
    if (!cameraRef.current || capturing) return;
    setCapturing(true);
    try {
      const photo = await cameraRef.current.takePictureAsync({
        quality: 0.85,
        base64: false,
      });
      setShowCamera(false);
      await sendToAPI(photo.uri);
    } catch (e) {
      Alert.alert("Capture failed", "Could not take photo. Please try again.");
    } finally {
      setCapturing(false);
    }
  };

  // ── Send image to backend ────────────────────────────────────────────────────
  const sendToAPI = async (uri: string) => {
    setLoading(true);
    setResult(null);
    try {
      const formData = new FormData();
      formData.append("file", {
        uri,
        type: "image/jpeg",
        name: "prescription.jpg",
      } as any);

      const response = await fetch(`${API_BASE}/prescriptions/parse-image`, {
        method: "POST",
        body: formData,
        headers: { Accept: "application/json" },
      });

      if (!response.ok) throw new Error(`Server error: ${response.status}`);
      const data: ParsedResult = await response.json();
      setResult(data);
      setSelectedMedIndex(0);
      setShowResult(true);
    } catch (e: any) {
      Alert.alert(
        "Processing failed",
        e.message || "Could not parse the prescription. Please try again.",
      );
    } finally {
      setLoading(false);
    }
  };

  // ── Pick from gallery ────────────────────────────────────────────────────────
  const handleGallery = async () => {
    Alert.alert(
      "Gallery",
      "To pick from gallery, install expo-image-picker and add it to this handler.",
    );
  };

  // ── Confidence color ─────────────────────────────────────────────────────────
  const confidenceColor = (score?: number) => {
    if (!score) return "#9CA3AF";
    if (score >= 0.8) return "#22c55e";
    if (score >= 0.5) return "#f59e0b";
    return "#ef4444";
  };

  const confidencePct = result?.confidence_score
    ? Math.round(result.confidence_score * 100)
    : null;

  const activeMed =
    result?.medications && result.medications.length > 0
      ? result.medications[selectedMedIndex]
      : null;

  // ══════════════════════════════════════════════════════════════════════════════
  // RENDER — Camera overlay
  // ══════════════════════════════════════════════════════════════════════════════
  if (showCamera) {
    return (
      <View style={styles.cameraContainer}>
        <CameraView
          ref={cameraRef}
          style={StyleSheet.absoluteFill}
          facing="back"
          flash={flashOn ? "on" : "off"}
        />

        {/* Top bar */}
        <SafeAreaView style={styles.cameraTopBar}>
          <TouchableOpacity
            style={styles.circleBtn}
            onPress={() => setShowCamera(false)}
          >
            <Feather name="x" size={20} color="white" />
          </TouchableOpacity>
          <View style={styles.rightIcons}>
            <TouchableOpacity
              style={styles.circleBtn}
              onPress={() => setFlashOn((f) => !f)}
            >
              <Ionicons
                name={flashOn ? "flash" : "flash-outline"}
                size={20}
                color={flashOn ? "#facc15" : "white"}
              />
            </TouchableOpacity>
            <TouchableOpacity style={styles.circleBtn}>
              <Feather name="help-circle" size={20} color="white" />
            </TouchableOpacity>
          </View>
        </SafeAreaView>

        {/* HIPAA badge */}
        <View style={styles.badgeWrapper}>
          <View style={styles.badge}>
            <Feather name="lock" size={14} color="#22c55e" />
            <Text style={styles.badgeText}> HIPAA Secure Processing</Text>
          </View>
        </View>

        {/* Scanner frame */}
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

        {/* Bottom bar */}
        <View style={styles.bottomBar}>
          <TouchableOpacity style={styles.bottomItem} onPress={handleGallery}>
            <MaterialCommunityIcons
              name="image-outline"
              size={24}
              color="#9CA3AF"
            />
            <Text style={styles.bottomText}>Gallery</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.captureWrapper}
            onPress={handleCapture}
            disabled={capturing}
          >
            <View style={styles.captureOuter}>
              <View
                style={[
                  styles.captureInner,
                  capturing && { backgroundColor: "#9CA3AF" },
                ]}
              />
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

  // ══════════════════════════════════════════════════════════════════════════════
  // RENDER — Main scan screen
  // ══════════════════════════════════════════════════════════════════════════════
  return (
    <LinearGradient
      colors={["#020617", "#020617", "#0B1B34"]}
      style={styles.container}
    >
      <SafeAreaView style={styles.safeArea}>
        {/* Top bar */}
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

        {/* HIPAA badge */}
        <View style={styles.badge}>
          <Feather name="lock" size={14} color="#22c55e" />
          <Text style={styles.badgeText}> HIPAA Secure Processing</Text>
        </View>

        {/* Scanner frame (preview — tapping opens camera) */}
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

      {/* Bottom bar */}
      <View style={styles.bottomBar}>
        <TouchableOpacity style={styles.bottomItem} onPress={handleGallery}>
          <MaterialCommunityIcons
            name="image-outline"
            size={24}
            color="#9CA3AF"
          />
          <Text style={styles.bottomText}>Gallery</Text>
        </TouchableOpacity>

        {/* Capture button — opens camera */}
        <TouchableOpacity
          style={styles.captureWrapper}
          onPress={handleOpenCamera}
          disabled={loading}
        >
          <View style={styles.captureOuter}>
            {loading ? (
              <ActivityIndicator color="#E5E7EB" size="large" />
            ) : (
              <View style={styles.captureInner} />
            )}
          </View>
        </TouchableOpacity>

        <TouchableOpacity style={styles.bottomItem}>
          <Feather name="rotate-ccw" size={22} color="#9CA3AF" />
          <Text style={styles.bottomText}>History</Text>
        </TouchableOpacity>
      </View>

      {/* ── Loading overlay ── */}
      {loading && (
        <View style={styles.loadingOverlay}>
          <ActivityIndicator size="large" color="#22c55e" />
          <Text style={styles.loadingText}>Analysing prescription…</Text>
        </View>
      )}

      {/* ══════════════════════════════════════════════════════════════════════
          Results Modal — "Verify Details" card matching the screenshot
      ══════════════════════════════════════════════════════════════════════ */}
      <Modal
        visible={showResult}
        animationType="slide"
        transparent
        onRequestClose={() => setShowResult(false)}
      >
        <View style={styles.modalBackdrop}>
          <View style={styles.resultCard}>
            {/* Handle */}
            <View style={styles.handle} />

            {/* Header */}
            <View style={styles.resultHeader}>
              <View>
                <Text style={styles.resultTitle}>Verify Details</Text>
                <Text style={styles.resultSub}>
                  Review extracted information
                </Text>
              </View>
              {confidencePct !== null && (
                <View style={styles.matchBadge}>
                  <View
                    style={[
                      styles.matchDot,
                      {
                        backgroundColor: confidenceColor(
                          result?.confidence_score,
                        ),
                      },
                    ]}
                  />
                  <Text
                    style={[
                      styles.matchText,
                      { color: confidenceColor(result?.confidence_score) },
                    ]}
                  >
                    {confidencePct}% Match
                  </Text>
                </View>
              )}
            </View>

            <ScrollView
              showsVerticalScrollIndicator={false}
              style={{ flex: 1 }}
            >
              {/* Source row */}
              <View style={styles.sourceRow}>
                <View style={styles.sourceIcon}>
                  <Feather name="file-text" size={20} color="#6B7280" />
                </View>
                <View>
                  <Text style={styles.sourceLabel}>SOURCE</Text>
                  <Text style={styles.sourceFile}>Scanned_Rx.jpg</Text>
                  <TouchableOpacity>
                    <Text style={styles.viewOriginal}>View Original</Text>
                  </TouchableOpacity>
                </View>
              </View>

              {/* Patient / Doctor */}
              {(result?.patient_name || result?.doctor) && (
                <View style={styles.infoRow}>
                  {result?.patient_name && (
                    <View style={styles.infoField}>
                      <Text style={styles.fieldLabel}>PATIENT</Text>
                      <Text style={styles.fieldValue}>
                        {result.patient_name}
                      </Text>
                    </View>
                  )}
                  {result?.doctor && (
                    <View style={styles.infoField}>
                      <Text style={styles.fieldLabel}>DOCTOR</Text>
                      <Text style={styles.fieldValue}>{result.doctor}</Text>
                    </View>
                  )}
                </View>
              )}

              {/* Medication tabs — if multiple */}
              {result?.medications && result.medications.length > 1 && (
                <ScrollView
                  horizontal
                  showsHorizontalScrollIndicator={false}
                  style={styles.tabRow}
                >
                  {result.medications.map((med, i) => (
                    <TouchableOpacity
                      key={i}
                      style={[
                        styles.tab,
                        selectedMedIndex === i && styles.tabActive,
                      ]}
                      onPress={() => setSelectedMedIndex(i)}
                    >
                      <Text
                        style={[
                          styles.tabText,
                          selectedMedIndex === i && styles.tabTextActive,
                        ]}
                      >
                        {med.name}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </ScrollView>
              )}

              {/* Active medication detail */}
              {activeMed && (
                <>
                  {/* Medicine name */}
                  <View style={styles.fieldBlock}>
                    <Text style={styles.fieldLabel}>MEDICINE NAME</Text>
                    <View style={styles.fieldRow}>
                      <Text style={styles.medicineValue}>{activeMed.name}</Text>
                      <Feather name="edit-2" size={16} color="#3B82F6" />
                    </View>
                  </View>

                  {/* Dosage + Form */}
                  <View style={styles.infoRow}>
                    <View style={[styles.infoField, { flex: 1 }]}>
                      <Text style={styles.fieldLabel}>DOSAGE</Text>
                      <View style={styles.fieldInputBox}>
                        <Text style={styles.fieldInputText}>
                          {activeMed.dosage || "—"}
                        </Text>
                      </View>
                    </View>
                    <View style={[styles.infoField, { flex: 1 }]}>
                      <Text style={styles.fieldLabel}>FORM</Text>
                      <View style={styles.fieldInputBox}>
                        <Text style={styles.fieldInputText}>
                          {activeMed.form || "Tablet"}
                        </Text>
                        <Feather
                          name="chevron-down"
                          size={14}
                          color="#6B7280"
                        />
                      </View>
                    </View>
                  </View>

                  {/* Frequency */}
                  <View style={styles.fieldBlock}>
                    <Text style={styles.fieldLabel}>FREQUENCY</Text>
                    <View style={styles.fieldInputBox}>
                      <Text style={styles.fieldInputText}>
                        {activeMed.frequency || "—"}
                      </Text>
                    </View>
                  </View>

                  {/* Duration */}
                  {activeMed.duration && (
                    <View style={styles.fieldBlock}>
                      <Text style={styles.fieldLabel}>DURATION</Text>
                      <View style={styles.fieldInputBox}>
                        <Text style={styles.fieldInputText}>
                          {activeMed.duration}
                        </Text>
                      </View>
                    </View>
                  )}
                </>
              )}

              {/* Fallback: raw text */}
              {!activeMed && result?.raw_text && (
                <View style={styles.fieldBlock}>
                  <Text style={styles.fieldLabel}>EXTRACTED TEXT</Text>
                  <Text style={styles.rawText}>{result.raw_text}</Text>
                </View>
              )}

              <View style={{ height: 24 }} />
            </ScrollView>

            {/* Actions */}
            <View style={styles.resultActions}>
              <TouchableOpacity
                style={styles.confirmBtn}
                onPress={() => {
                  setShowResult(false);
                  router.back();
                }}
              >
                <Text style={styles.confirmText}>Confirm & Save →</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.rescanBtn}
                onPress={() => {
                  setShowResult(false);
                  setResult(null);
                  handleOpenCamera();
                }}
              >
                <Text style={styles.rescanText}>Rescan Document</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </LinearGradient>
  );
}

// ─── Styles ───────────────────────────────────────────────────────────────────
const styles = StyleSheet.create({
  container: { flex: 1 },
  safeArea: { flex: 1 },
  cameraContainer: { flex: 1, backgroundColor: "#000" },
  cameraTopBar: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    marginTop: 10,
    zIndex: 10,
  },
  topBar: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    marginTop: 10,
  },
  rightIcons: { flexDirection: "row", gap: 12 },
  circleBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "rgba(255,255,255,0.15)",
    justifyContent: "center",
    alignItems: "center",
  },
  badgeWrapper: { alignItems: "center", marginTop: 20, zIndex: 10 },
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
  badgeText: { color: "#E2E8F0", fontSize: 12 },
  frameContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingBottom: 140,
    zIndex: 5,
  },
  frame: {
    width: 340,
    height: 360,
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
  bottomItem: { alignItems: "center" },
  bottomText: { color: "#9CA3AF", fontSize: 12, marginTop: 4 },
  captureWrapper: { alignItems: "center" },
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

  // Loading
  loadingOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(2,6,23,0.85)",
    justifyContent: "center",
    alignItems: "center",
    gap: 16,
  },
  loadingText: { color: "#E2E8F0", fontSize: 15 },

  // Modal
  modalBackdrop: {
    flex: 1,
    justifyContent: "flex-end",
    backgroundColor: "rgba(0,0,0,0.5)",
  },
  resultCard: {
    backgroundColor: "#fff",
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    paddingHorizontal: 20,
    paddingTop: 12,
    paddingBottom: 32,
    maxHeight: "88%",
  },
  handle: {
    width: 40,
    height: 4,
    backgroundColor: "#E5E7EB",
    borderRadius: 2,
    alignSelf: "center",
    marginBottom: 16,
  },
  resultHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: 16,
  },
  resultTitle: { fontSize: 20, fontWeight: "600", color: "#111827" },
  resultSub: { fontSize: 13, color: "#6B7280", marginTop: 2 },
  matchBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
    backgroundColor: "#F0FDF4",
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 20,
  },
  matchDot: { width: 8, height: 8, borderRadius: 4 },
  matchText: { fontSize: 13, fontWeight: "500" },

  // Source row
  sourceRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 12,
    backgroundColor: "#F9FAFB",
    borderRadius: 12,
    padding: 12,
    marginBottom: 16,
  },
  sourceIcon: {
    width: 40,
    height: 40,
    backgroundColor: "#F3F4F6",
    borderRadius: 8,
    justifyContent: "center",
    alignItems: "center",
  },
  sourceLabel: {
    fontSize: 10,
    color: "#9CA3AF",
    fontWeight: "600",
    letterSpacing: 0.5,
  },
  sourceFile: {
    fontSize: 14,
    color: "#111827",
    fontWeight: "500",
    marginTop: 2,
  },
  viewOriginal: { fontSize: 13, color: "#3B82F6", marginTop: 2 },

  // Info rows / fields
  infoRow: { flexDirection: "row", gap: 12, marginBottom: 12 },
  infoField: { flex: 1 },
  fieldBlock: { marginBottom: 12 },
  fieldLabel: {
    fontSize: 10,
    color: "#9CA3AF",
    fontWeight: "600",
    letterSpacing: 0.5,
    marginBottom: 6,
  },
  fieldValue: { fontSize: 14, color: "#111827", fontWeight: "500" },
  fieldRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  medicineValue: { fontSize: 16, color: "#111827", fontWeight: "500" },
  fieldInputBox: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    backgroundColor: "#F9FAFB",
    borderWidth: 1,
    borderColor: "#E5E7EB",
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 10,
  },
  fieldInputText: { fontSize: 14, color: "#111827" },

  // Medication tabs
  tabRow: { marginBottom: 16 },
  tab: {
    paddingHorizontal: 14,
    paddingVertical: 7,
    borderRadius: 20,
    backgroundColor: "#F3F4F6",
    marginRight: 8,
  },
  tabActive: { backgroundColor: "#1E3A5F" },
  tabText: { fontSize: 13, color: "#6B7280" },
  tabTextActive: { color: "#fff", fontWeight: "500" },

  // Raw text
  rawText: {
    fontSize: 13,
    color: "#374151",
    lineHeight: 20,
    backgroundColor: "#F9FAFB",
    padding: 12,
    borderRadius: 10,
  },

  // Actions
  resultActions: { gap: 10, marginTop: 8 },
  confirmBtn: {
    backgroundColor: "#1E3A5F",
    borderRadius: 14,
    paddingVertical: 16,
    alignItems: "center",
  },
  confirmText: { color: "#fff", fontSize: 16, fontWeight: "600" },
  rescanBtn: { alignItems: "center", paddingVertical: 8 },
  rescanText: { color: "#6B7280", fontSize: 14 },
});
