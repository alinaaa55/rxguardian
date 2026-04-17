// app/add-med.tsx
import { Feather, MaterialCommunityIcons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { useState } from "react";
import {
    Alert,
    SafeAreaView,
    ScrollView,
    StatusBar,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from "react-native";
import { MedStore } from "./meds";

const ICON_OPTIONS = [
  { icon: "pill", label: "Pill" },
  { icon: "white-balance-sunny", label: "Vitamin" },
  { icon: "heart-pulse", label: "Heart" },
  { icon: "needle", label: "Injection" },
  { icon: "eyedrop", label: "Drops" },
  { icon: "bottle-tonic", label: "Syrup" },
];

const COLOR_OPTIONS = [
  { color: "#2563EB", bg: "#DBEAFE" },
  { color: "#EA580C", bg: "#FFEDD5" },
  { color: "#EAB308", bg: "#FEF9C3" },
  { color: "#DC2626", bg: "#FEE2E2" },
  { color: "#7C3AED", bg: "#EDE9FE" },
  { color: "#16A34A", bg: "#DCFCE7" },
];

export default function AddMedScreen() {
  const router = useRouter();

  const [name, setName] = useState("");
  const [dose, setDose] = useState("");
  const [type, setType] = useState("");
  const [dosage, setDosage] = useState("");
  const [frequency, setFrequency] = useState("");
  const [duration, setDuration] = useState("");
  const [time, setTime] = useState("");
  const [selectedIcon, setSelectedIcon] = useState("pill");
  const [selectedColor, setSelectedColor] = useState(COLOR_OPTIONS[0]);

  function handleSave() {
    if (!name.trim() || !dose.trim() || !frequency.trim()) {
      Alert.alert("Missing Info", "Please fill in Name, Dose and Frequency.");
      return;
    }

    const newMed = {
      id: Date.now().toString(),
      name: name.trim(),
      dose: dose.trim(),
      type: type.trim() || "Tablet",
      dosage: dosage.trim() || "1 Tablet",
      frequency: frequency.trim(),
      duration: duration.trim() || "Ongoing",
      time: time.trim() || "As prescribed",
      icon: selectedIcon,
      color: selectedColor.color,
      bgColor: selectedColor.bg,
      status: "active",
      taken: false,
      refillDue: false,
    };

    MedStore.add(newMed);
    router.back();
  }

  return (
    <SafeAreaView style={styles.safe}>
      <StatusBar barStyle="dark-content" backgroundColor="#F1F5F9" />

      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backBtn} onPress={() => router.back()}>
          <Feather name="x" size={20} color="#1E3A8A" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Add Medication</Text>
        <TouchableOpacity style={styles.saveBtn} onPress={handleSave}>
          <Text style={styles.saveBtnText}>Save</Text>
        </TouchableOpacity>
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scroll}
      >
        {/* Icon picker */}
        <Text style={styles.sectionLabel}>Icon</Text>
        <View style={styles.iconRow}>
          {ICON_OPTIONS.map((opt) => (
            <TouchableOpacity
              key={opt.icon}
              style={[
                styles.iconOption,
                { backgroundColor: selectedColor.bg },
                selectedIcon === opt.icon && styles.iconOptionActive,
              ]}
              onPress={() => setSelectedIcon(opt.icon)}
            >
              <MaterialCommunityIcons
                name={opt.icon as any}
                size={22}
                color={
                  selectedIcon === opt.icon ? selectedColor.color : "#94A3B8"
                }
              />
            </TouchableOpacity>
          ))}
        </View>

        {/* Color picker */}
        <Text style={styles.sectionLabel}>Color</Text>
        <View style={styles.colorRow}>
          {COLOR_OPTIONS.map((opt) => (
            <TouchableOpacity
              key={opt.color}
              style={[
                styles.colorDot,
                { backgroundColor: opt.color },
                selectedColor.color === opt.color && styles.colorDotActive,
              ]}
              onPress={() => setSelectedColor(opt)}
            />
          ))}
        </View>

        {/* Fields */}
        <Text style={styles.sectionLabel}>Details</Text>
        <View style={styles.card}>
          <Field
            label="Medicine Name *"
            placeholder="e.g. Metformin"
            value={name}
            onChangeText={setName}
          />
          <Divider />
          <Field
            label="Dose *"
            placeholder="e.g. 500mg"
            value={dose}
            onChangeText={setDose}
          />
          <Divider />
          <Field
            label="Type"
            placeholder="e.g. Tablet, Capsule, Syrup"
            value={type}
            onChangeText={setType}
          />
          <Divider />
          <Field
            label="Dosage"
            placeholder="e.g. 1 Tablet"
            value={dosage}
            onChangeText={setDosage}
          />
          <Divider />
          <Field
            label="Frequency *"
            placeholder="e.g. 2x Daily, 1x Daily"
            value={frequency}
            onChangeText={setFrequency}
          />
          <Divider />
          <Field
            label="Duration"
            placeholder="e.g. 90 Days Left"
            value={duration}
            onChangeText={setDuration}
          />
          <Divider />
          <Field
            label="Time & Instructions"
            placeholder="e.g. 8:00 AM • After meal"
            value={time}
            onChangeText={setTime}
          />
        </View>

        <Text style={styles.requiredNote}>* Required fields</Text>
      </ScrollView>
    </SafeAreaView>
  );
}

function Field({
  label,
  placeholder,
  value,
  onChangeText,
}: {
  label: string;
  placeholder: string;
  value: string;
  onChangeText: (t: string) => void;
}) {
  return (
    <View style={styles.fieldRow}>
      <Text style={styles.fieldLabel}>{label}</Text>
      <TextInput
        style={styles.fieldInput}
        placeholder={placeholder}
        placeholderTextColor="#CBD5E1"
        value={value}
        onChangeText={onChangeText}
      />
    </View>
  );
}

function Divider() {
  return <View style={styles.divider} />;
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: "#F1F5F9" },

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
    backgroundColor: "#E2E8F0",
    alignItems: "center",
    justifyContent: "center",
  },
  headerTitle: { fontSize: 17, fontWeight: "700", color: "#1E3A8A" },
  saveBtn: {
    backgroundColor: "#1E3A8A",
    paddingHorizontal: 20,
    paddingVertical: 8,
    borderRadius: 20,
  },
  saveBtnText: { color: "#fff", fontWeight: "700", fontSize: 14 },

  scroll: { paddingHorizontal: 20, paddingBottom: 60 },

  sectionLabel: {
    fontSize: 12,
    fontWeight: "600",
    color: "#64748B",
    textTransform: "uppercase",
    letterSpacing: 0.8,
    marginTop: 24,
    marginBottom: 10,
  },

  iconRow: { flexDirection: "row", gap: 10 },
  iconOption: {
    width: 50,
    height: 50,
    borderRadius: 14,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 2,
    borderColor: "transparent",
  },
  iconOptionActive: { borderColor: "#1E3A8A" },

  colorRow: { flexDirection: "row", gap: 12, alignItems: "center" },
  colorDot: {
    width: 30,
    height: 30,
    borderRadius: 15,
  },
  colorDotActive: {
    borderWidth: 3,
    borderColor: "#1E3A8A",
  },

  card: {
    backgroundColor: "#fff",
    borderRadius: 20,
    paddingVertical: 4,
    shadowColor: "#000",
    shadowOpacity: 0.04,
    shadowRadius: 8,
    elevation: 2,
  },

  fieldRow: {
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  fieldLabel: {
    fontSize: 11,
    color: "#94A3B8",
    marginBottom: 4,
  },
  fieldInput: {
    fontSize: 14,
    color: "#1E293B",
    fontWeight: "500",
    padding: 0,
  },

  divider: {
    height: 0.5,
    backgroundColor: "#E2E8F0",
    marginHorizontal: 16,
  },

  requiredNote: {
    fontSize: 11,
    color: "#94A3B8",
    marginTop: 12,
    textAlign: "center",
  },
});
