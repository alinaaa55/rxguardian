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
  TouchableOpacity,
  View,
} from "react-native";

// ✅ CHANGE THIS to your PC IP
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

  // ✅ AUTO OPEN CAMERA
  useEffect(() => {
    handleOpenCamera();
  }, []);

  // ── CAMERA PERMISSION + OPEN ──
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

  // ── CAPTURE ──
  const handleCapture = async () => {
    if (!cameraRef.current || capturing) return;

    setCapturing(true);
    try {
      const photo = await cameraRef.current.takePictureAsync({
        quality: 0.8,
      });

      setShowCamera(false);
      await sendToAPI(photo.uri);
    } catch {
      Alert.alert("Error", "Failed to capture image");
    } finally {
      setCapturing(false);
    }
  };

  // ── GALLERY ──
  const handleGallery = async () => {
    const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();

    if (!permission.granted) {
      Alert.alert("Permission needed", "Allow gallery access");
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      quality: 0.8,
    });

    if (!result.canceled) {
      await sendToAPI(result.assets[0].uri);
    }
  };

  // ── API ──
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

  // ═════════ CAMERA SCREEN ═════════
  if (showCamera) {
    return (
      <View style={styles.cameraContainer}>
        <CameraView
          ref={cameraRef}
          style={StyleSheet.absoluteFill}
          facing="back"
        />

        {/* TOP BAR */}
        <SafeAreaView style={styles.cameraTopBar}>
          <TouchableOpacity
            style={styles.circleBtn}
            onPress={() => {
              setShowCamera(false);
              router.replace("/home"); // ✅ ALWAYS GO HOME
            }}
          >
            <Feather name="x" size={20} color="white" />
          </TouchableOpacity>
        </SafeAreaView>

        {/* SCANNER FRAME */}
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

        {/* BOTTOM BAR */}
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

  // ═════════ LOADING SCREEN ═════════
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
          <Text style={{ color: "white" }}>Processing...</Text>
        </View>
      )}

      {/* RESULT MODAL */}
      <Modal visible={showResult} transparent animationType="slide">
        <View style={styles.modal}>
          <View style={styles.card}>
            <Text style={{ fontSize: 18, fontWeight: "600" }}>Scan Result</Text>

            <ScrollView>
              <Text>{JSON.stringify(result, null, 2)}</Text>
            </ScrollView>

            <TouchableOpacity
              style={styles.btn}
              onPress={() => {
                setShowResult(false);
                router.replace("/home"); // ✅ GO BACK TO HOME
              }}
            >
              <Text style={{ color: "white" }}>Done</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </LinearGradient>
  );
}

// ─── STYLES ───
const styles = StyleSheet.create({
  cameraContainer: { flex: 1, backgroundColor: "#000" },

  cameraTopBar: {
    paddingHorizontal: 20,
    marginTop: 10,
  },

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

  frameText: {
    color: "#E5E7EB",
    fontSize: 14,
  },

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

  loadingOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(0,0,0,0.7)",
    justifyContent: "center",
    alignItems: "center",
  },

  modal: {
    flex: 1,
    justifyContent: "flex-end",
    backgroundColor: "rgba(0,0,0,0.5)",
  },

  card: {
    backgroundColor: "white",
    padding: 20,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    maxHeight: "80%",
  },

  btn: {
    backgroundColor: "#1E3A8A",
    padding: 14,
    borderRadius: 10,
    marginTop: 10,
    alignItems: "center",
  },
});
