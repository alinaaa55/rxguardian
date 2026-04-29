import { Feather, Ionicons, MaterialIcons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { useState } from "react";
import {
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import DateTimePicker from "@react-native-community/datetimepicker";
import { theme } from "../constants/theme";
import { storage } from "../services/storage";

export default function ProfileSetupScreen() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [showDatePicker, setShowDatePicker] = useState(false);

  const [form, setForm] = useState({
    phone: "",
    dob: "",
    bloodGroup: "",
    allergies: "",
    doctor: "",
    hospital: "",
  });

  const handleChange = (key: string, value: string) => {
    setForm({ ...form, [key]: value });
  };

  const onDateChange = (event: any, selectedDate?: Date) => {
    setShowDatePicker(false);
    if (selectedDate) {
      const formattedDate = selectedDate.toLocaleDateString('en-GB', {
        day: '2-digit',
        month: 'long',
        year: 'numeric'
      });
      handleChange("dob", formattedDate);
    }
  };

  const handleSave = async () => {
    setLoading(true);
    try {
      const userInfo = await storage.getUserInfo();
      const updatedUserInfo = { ...userInfo, ...form };
      await storage.saveUserInfo(updatedUserInfo);
      await storage.setProfileComplete(true);
      
      // Check if onboarding is needed
      const onboardingDone = await storage.isOnboardingComplete();
      if (!onboardingDone) {
        router.replace("/onboarding");
      } else {
        router.replace("/(tabs)");
      }
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="dark-content" />
      
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Complete Profile</Text>
        <Text style={styles.headerSubtitle}>Please provide some medical details to help us serve you better.</Text>
      </View>

      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={{ flex: 1 }}
      >
        <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Personal Details</Text>
            <View style={styles.card}>
              <InputRow
                label="Phone Number"
                value={form.phone}
                icon={<Feather name="phone" size={18} color={theme.colors.primary} />}
                onChange={(v) => handleChange("phone", v)}
                placeholder="+91 98765 43210"
                keyboardType="phone-pad"
              />
              <Divider />
              <TouchableOpacity onPress={() => setShowDatePicker(true)}>
                <InputRow
                  label="Date of Birth"
                  value={form.dob}
                  icon={<Feather name="calendar" size={18} color={theme.colors.primary} />}
                  placeholder="Select Date of Birth"
                  editable={false}
                />
              </TouchableOpacity>
            </View>
          </View>

          {showDatePicker && (
            <DateTimePicker
              value={form.dob ? new Date(form.dob) : new Date(2000, 0, 1)}
              mode="date"
              display={Platform.OS === 'ios' ? 'spinner' : 'default'}
              onChange={onDateChange}
              maximumDate={new Date()}
            />
          )}

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Medical Information</Text>
            <View style={styles.card}>
              <InputRow
                label="Blood Group"
                value={form.bloodGroup}
                icon={<MaterialIcons name="bloodtype" size={18} color={theme.colors.danger} />}
                onChange={(v) => handleChange("bloodGroup", v)}
                placeholder="e.g. B+"
              />
              <Divider />
              <InputRow
                label="Allergies"
                value={form.allergies}
                icon={<MaterialIcons name="warning" size={18} color={theme.colors.secondary} />}
                onChange={(v) => handleChange("allergies", v)}
                placeholder="e.g. Penicillin"
              />
              <Divider />
              <InputRow
                label="Primary Doctor"
                value={form.doctor}
                icon={<Feather name="user" size={18} color={theme.colors.primary} />}
                onChange={(v) => handleChange("doctor", v)}
                placeholder="Dr. Name"
              />
              <Divider />
              <InputRow
                label="Preferred Hospital"
                value={form.hospital}
                icon={<Feather name="map-pin" size={18} color={theme.colors.primary} />}
                onChange={(v) => handleChange("hospital", v)}
                placeholder="Hospital Name"
              />
            </View>
          </View>

          <TouchableOpacity 
            style={styles.saveBtn} 
            onPress={handleSave}
            disabled={loading}
          >
            <Text style={styles.saveBtnText}>{loading ? "Saving..." : "Save and Continue"}</Text>
          </TouchableOpacity>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

function InputRow({ label, value, icon, onChange, placeholder, keyboardType, editable = true }: any) {
  return (
    <View style={styles.infoRow}>
      <View style={styles.infoIcon}>{icon}</View>
      <View style={{ flex: 1 }}>
        <Text style={styles.infoLabel}>{label}</Text>
        <TextInput
          style={styles.input}
          value={value}
          onChangeText={onChange}
          placeholder={placeholder}
          placeholderTextColor={theme.colors.text.secondary}
          keyboardType={keyboardType}
          editable={editable}
          pointerEvents={editable ? 'auto' : 'none'}
        />
      </View>
    </View>
  );
}

function Divider() {
  return <View style={styles.divider} />;
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: theme.colors.background },
  header: { padding: 24, paddingTop: 12 },
  headerTitle: { fontSize: 28, fontWeight: "700", color: theme.colors.primary },
  headerSubtitle: { fontSize: 14, color: theme.colors.text.secondary, marginTop: 8 },
  scrollContent: { paddingBottom: 40 },
  section: { paddingHorizontal: 20, marginTop: 24 },
  sectionTitle: { fontSize: 13, color: theme.colors.text.secondary, marginBottom: 10, fontWeight: "600", textTransform: "uppercase" },
  card: { backgroundColor: theme.colors.surface, borderRadius: 20, ...theme.shadows.sm, overflow: "hidden" },
  infoRow: { flexDirection: "row", padding: 16, alignItems: "center" },
  infoIcon: { width: 40, height: 40, backgroundColor: theme.colors.background, alignItems: "center", justifyContent: "center", marginRight: 16, borderRadius: 12 },
  infoLabel: { fontSize: 11, color: theme.colors.text.secondary, marginBottom: 2 },
  input: { fontSize: 15, fontWeight: "500", color: theme.colors.text.primary, padding: 0 },
  divider: { height: 1, backgroundColor: theme.colors.border, marginLeft: 72 },
  saveBtn: { backgroundColor: theme.colors.primary, margin: 24, padding: 18, borderRadius: 16, alignItems: "center", ...theme.shadows.md },
  saveBtnText: { color: "white", fontSize: 16, fontWeight: "600" },
});
