// app/profile.tsx
import { Feather, Ionicons, MaterialIcons, MaterialCommunityIcons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { useEffect, useState } from "react";
import {
    ActivityIndicator,
    ScrollView,
    StatusBar,
    StyleSheet,
    Switch,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { theme } from "../constants/theme";
import { storage } from "../services/storage";
import { authService } from "../services/authService";
import { useSettings } from "../context/SettingsContext";

export default function ProfileScreen() {
  const router = useRouter();
  const { elderlyMode, voiceReminders, toggleElderlyMode, toggleVoiceReminders, fontSizeMultiplier } = useSettings();

  const [profile, setProfile] = useState<any>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadProfile();
  }, []);

  const loadProfile = async () => {
    setIsLoading(true);
    try {
      const userInfo = await storage.getUserInfo();
      if (userInfo) {
        setProfile(userInfo);
      }
    } catch (error) {
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSave = async () => {
    try {
      await storage.saveUserInfo(profile);
      setIsEditing(false);
    } catch (error) {
      console.error(error);
    }
  };

  const handleSignOut = async () => {
    await authService.logout();
    router.replace("/login");
  };

  const handleChange = (key: string, value: string) => {
    setProfile({ ...profile, [key]: value });
  };

  if (isLoading || !profile) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator size="large" color={theme.colors.primary} />
      </View>
    );
  }

  return (
    <SafeAreaView style={[styles.safeArea, elderlyMode && { backgroundColor: "#fff" }]}>
      <StatusBar barStyle="dark-content" />

      {/* HEADER */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
          <Ionicons name="chevron-back" size={22 * fontSizeMultiplier} color={theme.colors.primary} />
        </TouchableOpacity>

        <Text style={[styles.headerTitle, { fontSize: theme.typography.h2.fontSize * fontSizeMultiplier }]}>My Profile</Text>

        <TouchableOpacity
          style={styles.editBtn}
          onPress={isEditing ? handleSave : () => setIsEditing(true)}
        >
          <Feather
            name={isEditing ? "check" : "edit-2"}
            size={18 * fontSizeMultiplier}
            color={theme.colors.primaryAccent}
          />
        </TouchableOpacity>
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 40 }}
      >
        {/* AVATAR */}
        <View style={styles.avatarSection}>
          <View style={styles.avatarCircle}>
            <Text style={[styles.avatarInitials, { fontSize: 30 * fontSizeMultiplier }]}>
              {profile.name ? profile.name.split(' ').map((n: any) => n[0]).join('').toUpperCase() : 'U'}
            </Text>
            <View style={styles.onlineDot} />
          </View>

          {isEditing ? (
            <TextInput
              style={[styles.input, { fontSize: 14 * fontSizeMultiplier }]}
              value={profile.name}
              onChangeText={(text) => handleChange("name", text)}
            />
          ) : (
            <Text style={[styles.profileName, { fontSize: 20 * fontSizeMultiplier }]}>{profile.name}</Text>
          )}

          <Text style={[styles.profileSub, { fontSize: 13 * fontSizeMultiplier }]}>
            Member since {profile.created_at ? new Date(profile.created_at).toLocaleDateString() : 'N/A'}
          </Text>
        </View>

        {/* SETTINGS SECTION */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { fontSize: 13 * fontSizeMultiplier }]}>Preferences</Text>
          <View style={styles.card}>
            <View style={styles.infoRow}>
               <View style={styles.infoIcon}>
                  <MaterialCommunityIcons name="human-cane" size={18 * fontSizeMultiplier} color={theme.colors.primaryAccent} />
               </View>
               <View style={{ flex: 1, justifyContent: 'center' }}>
                  <Text style={[styles.infoValue, { fontSize: 14 * fontSizeMultiplier }]}>Elderly Mode</Text>
                  <Text style={[styles.infoLabel, { fontSize: 11 * fontSizeMultiplier }]}>Larger text and high contrast</Text>
               </View>
               <Switch value={elderlyMode} onValueChange={toggleElderlyMode} trackColor={{ false: theme.colors.border, true: theme.colors.primary }} />
            </View>
            <Divider />
            <View style={styles.infoRow}>
               <View style={styles.infoIcon}>
                  <Ionicons name="volume-high-outline" size={18 * fontSizeMultiplier} color={theme.colors.primaryAccent} />
               </View>
               <View style={{ flex: 1, justifyContent: 'center' }}>
                  <Text style={[styles.infoValue, { fontSize: 14 * fontSizeMultiplier }]}>Voice Reminders</Text>
                  <Text style={[styles.infoLabel, { fontSize: 11 * fontSizeMultiplier }]}>Announce scheduled doses</Text>
               </View>
               <Switch value={voiceReminders} onValueChange={toggleVoiceReminders} trackColor={{ false: theme.colors.border, true: theme.colors.primary }} />
            </View>
          </View>
        </View>

        {/* PERSONAL INFO */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { fontSize: 13 * fontSizeMultiplier }]}>Personal Information</Text>

          <View style={styles.card}>
            <InfoRow
              label="Email"
              value={profile.email}
              icon={<Feather name="mail" size={16 * fontSizeMultiplier} color={theme.colors.primaryAccent} />}
              editable={false}
              onChange={(v: string) => handleChange("email", v)}
              fontSizeMultiplier={fontSizeMultiplier}
            />
            <Divider />
            <InfoRow
              label="Phone"
              value={profile.phone || "Not set"}
              icon={<Feather name="phone" size={16 * fontSizeMultiplier} color={theme.colors.primaryAccent} />}
              editable={isEditing}
              onChange={(v: string) => handleChange("phone", v)}
              fontSizeMultiplier={fontSizeMultiplier}
            />
            <Divider />
            <InfoRow
              label="Date of Birth"
              value={profile.dob || "Not set"}
              icon={<Feather name="calendar" size={16 * fontSizeMultiplier} color={theme.colors.primaryAccent} />}
              editable={isEditing}
              onChange={(v: string) => handleChange("dob", v)}
              fontSizeMultiplier={fontSizeMultiplier}
            />
          </View>
        </View>

        {/* MEDICAL INFO */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { fontSize: 13 * fontSizeMultiplier }]}>Medical Information</Text>

          <View style={styles.card}>
            <InfoRow
              label="Blood Group"
              value={profile.bloodGroup || "Not set"}
              icon={<MaterialIcons name="bloodtype" size={16 * fontSizeMultiplier} color={theme.colors.danger} />}
              highlight
              editable={isEditing}
              onChange={(v: string) => handleChange("bloodGroup", v)}
              fontSizeMultiplier={fontSizeMultiplier}
            />
            <Divider />
            <InfoRow
              label="Allergies"
              value={profile.allergies || "None"}
              icon={<MaterialIcons name="warning" size={16 * fontSizeMultiplier} color={theme.colors.secondary} />}
              editable={isEditing}
              onChange={(v: string) => handleChange("allergies", v)}
              fontSizeMultiplier={fontSizeMultiplier}
            />
          </View>
        </View>

        {/* SIGN OUT */}
        <TouchableOpacity style={styles.signOutBtn} onPress={handleSignOut}>
          <Feather name="log-out" size={16 * fontSizeMultiplier} color={theme.colors.danger} />
          <Text style={[styles.signOutText, { fontSize: 15 * fontSizeMultiplier }]}>Sign Out</Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}

function InfoRow({ icon, label, value, highlight, editable, onChange, fontSizeMultiplier }: any) {
  return (
    <View style={styles.infoRow}>
      <View style={styles.infoIcon}>{icon}</View>
      <View style={{ flex: 1 }}>
        <Text style={[styles.infoLabel, { fontSize: 11 * fontSizeMultiplier }]}>{label}</Text>

        {editable ? (
          <TextInput
            style={[styles.input, { fontSize: 14 * fontSizeMultiplier }]}
            value={value}
            onChangeText={onChange}
          />
        ) : (
          <Text style={[styles.infoValue, highlight && styles.highlightValue, { fontSize: 14 * fontSizeMultiplier }]}>
            {value}
          </Text>
        )}
      </View>
    </View>
  );
}

function Divider() {
  return <View style={styles.divider} />;
}


const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: theme.colors.background },

  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 16,
  },

  backBtn: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: theme.colors.border,
    alignItems: "center",
    justifyContent: "center",
  },

  editBtn: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: theme.colors.primaryLight,
    alignItems: "center",
    justifyContent: "center",
  },

  headerTitle: { fontSize: theme.typography.h2.fontSize, fontWeight: theme.typography.h2.fontWeight, color: theme.colors.primary },

  avatarSection: { alignItems: "center", paddingVertical: 28 },

  avatarCircle: {
    width: 90,
    height: 90,
    borderRadius: 45,
    backgroundColor: theme.colors.primary,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 14,
  },

  avatarInitials: { fontSize: 30, color: "white", fontWeight: "700" },

  onlineDot: {
    width: 14,
    height: 14,
    borderRadius: 7,
    backgroundColor: theme.colors.successLight,
    position: "absolute",
    bottom: 4,
    right: 4,
  },

  profileName: { fontSize: 20, fontWeight: "700", color: theme.colors.text.primary },
  profileSub: { fontSize: 13, color: theme.colors.text.secondary },

  section: { paddingHorizontal: 20, marginBottom: 20 },
  sectionTitle: { fontSize: 13, color: theme.colors.text.secondary, marginBottom: 10 },

  card: { backgroundColor: theme.colors.surface, borderRadius: 20, ...theme.shadows.sm },

  infoRow: { flexDirection: "row", padding: 14 },

  infoIcon: {
    width: 32,
    height: 32,
    backgroundColor: theme.colors.background,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 12,
    borderRadius: 8,
  },

  infoLabel: { fontSize: 11, color: theme.colors.tabInactive },
  infoValue: { fontSize: 14, fontWeight: "500", color: theme.colors.text.primary },

  highlightValue: { color: theme.colors.danger },

  divider: { height: 0.5, backgroundColor: theme.colors.border },

  input: {
    borderBottomWidth: 1,
    borderColor: theme.colors.primaryLight,
    fontSize: 14,
    paddingVertical: 2,
    color: theme.colors.text.primary,
  },

  signOutBtn: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    padding: 14,
    backgroundColor: theme.colors.dangerLight,
    margin: 20,
    borderRadius: 20,
    gap: 8,
  },

  signOutText: { color: theme.colors.danger, fontWeight: "600" },
});
