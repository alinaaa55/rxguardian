// app/add-med.tsx
import { Feather, MaterialCommunityIcons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { useState } from "react";
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
    TouchableWithoutFeedback,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { MedStore } from "./(tabs)/meds";
import { theme, palette } from "../constants/theme";

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

  const [name, setName] = useState("");
  const [dose, setDose] = useState("");
  const [type, setType] = useState("");
  const [dosage, setDosage] = useState("");
  const [frequency, setFrequency] = useState("");
  const [duration, setDuration] = useState("");
  const [time, setTime] = useState("");
  const [selectedIcon, setSelectedIcon] = useState("pill");
  const [selectedColor, setSelectedColor] = useState(COLOR_OPTIONS[0]);
  
  const [showError, setShowError] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  function handleSave() {
    if (!name.trim() || !dose.trim() || !frequency.trim()) {
      setErrorMsg("Please fill in the required fields:\nMedicine Name, Dose and Frequency.");
      setShowError(true);
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
      <StatusBar barStyle="dark-content" />

      <KeyboardAvoidingView 
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={{ flex: 1 }}
      >
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity style={styles.backBtn} onPress={() => router.back()}>
            <Feather name="x" size={20} color={theme.colors.primary} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Add Medication</Text>
          <TouchableOpacity style={styles.saveBtn} onPress={handleSave}>
            <Text style={styles.saveBtnText}>Save</Text>
          </TouchableOpacity>
        </View>

        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.scroll}
          keyboardShouldPersistTaps="handled"
        >
          {/* Icon picker - Horizontal Scroll */}
          <Text style={styles.sectionLabel}>Icon</Text>
          <View>
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
                    selectedIcon === opt.icon && { borderColor: theme.colors.primary },
                ]}
                onPress={() => setSelectedIcon(opt.icon)}
                >
                <MaterialCommunityIcons
                    name={opt.icon as any}
                    size={22}
                    color={
                    selectedIcon === opt.icon ? selectedColor.color : theme.colors.tabInactive
                    }
                />
                </TouchableOpacity>
            ))}
            </ScrollView>
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
                  selectedColor.color === opt.color && { borderColor: theme.colors.primary, borderWidth: 3 },
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
          {/* Spacer for bottom fields when keyboard is open */}
          <View style={{ height: 40 }} />
        </ScrollView>
      </KeyboardAvoidingView>

      {/* Themed Error Modal */}
      <Modal
        visible={showError}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setShowError(false)}
      >
        <TouchableWithoutFeedback onPress={() => setShowError(false)}>
          <View style={styles.errorOverlay}>
            <TouchableWithoutFeedback>
                <View style={styles.errorCard}>
                    <View style={styles.errorIconBg}>
                        <Feather name="alert-circle" size={32} color={theme.colors.danger} />
                    </View>
                    <Text style={styles.errorTitle}>Missing Information</Text>
                    <Text style={styles.errorText}>{errorMsg}</Text>
                    <TouchableOpacity 
                        style={styles.errorButton} 
                        onPress={() => setShowError(false)}
                    >
                        <Text style={styles.errorButtonText}>Got it</Text>
                    </TouchableOpacity>
                </View>
            </TouchableWithoutFeedback>
          </View>
        </TouchableWithoutFeedback>
      </Modal>
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
        placeholderTextColor={theme.colors.tabInactive}
        value={value}
        onChangeText={onChangeText}
        autoCapitalize="sentences"
      />
    </View>
  );
}

function Divider() {
  return <View style={styles.divider} />;
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
  },
  saveBtnText: { color: theme.colors.surface, fontWeight: "700", fontSize: 14 },

  scroll: { paddingHorizontal: 20, paddingBottom: 60 },

  sectionLabel: {
    fontSize: 12,
    fontWeight: "600",
    color: theme.colors.text.secondary,
    textTransform: "uppercase",
    letterSpacing: 0.8,
    marginTop: 24,
    marginBottom: 10,
  },

  iconRow: { flexDirection: "row", gap: 12, paddingRight: 20 },
  iconOption: {
    width: 54,
    height: 54,
    borderRadius: 16,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 2,
    borderColor: "transparent",
  },

  colorRow: { flexDirection: "row", gap: 12, alignItems: "center" },
  colorDot: {
    width: 32,
    height: 32,
    borderRadius: 16,
  },

  card: {
    backgroundColor: theme.colors.surface,
    borderRadius: 20,
    paddingVertical: 4,
    ...theme.shadows.sm,
  },

  fieldRow: {
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  fieldLabel: {
    fontSize: 11,
    color: theme.colors.tabInactive,
    marginBottom: 4,
  },
  fieldInput: {
    fontSize: 14,
    color: theme.colors.text.primary,
    fontWeight: "500",
    padding: 0,
  },

  divider: {
    height: 0.5,
    backgroundColor: theme.colors.border,
    marginHorizontal: 16,
  },

  requiredNote: {
    fontSize: 11,
    color: theme.colors.tabInactive,
    marginTop: 12,
    textAlign: "center",
  },

  // Error Modal Styles
  errorOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.5)",
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  errorCard: {
    width: "100%",
    backgroundColor: theme.colors.surface,
    borderRadius: 24,
    padding: 24,
    alignItems: "center",
    ...theme.shadows.md,
  },
  errorIconBg: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: theme.colors.dangerLight,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 16,
  },
  errorTitle: {
    fontSize: 18,
    fontWeight: "800",
    color: theme.colors.primary,
    marginBottom: 8,
  },
  errorText: {
    fontSize: 14,
    color: theme.colors.text.secondary,
    textAlign: "center",
    lineHeight: 20,
    marginBottom: 24,
  },
  errorButton: {
    backgroundColor: theme.colors.primary,
    paddingVertical: 14,
    paddingHorizontal: 40,
    borderRadius: 16,
    width: "100%",
    alignItems: "center",
  },
  errorButtonText: {
    color: theme.colors.surface,
    fontWeight: "700",
    fontSize: 15,
  },
});
