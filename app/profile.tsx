// app/profile.tsx
import { Feather, Ionicons, MaterialIcons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { useState } from "react";
import {
    ScrollView,
    StatusBar,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { theme } from "../constants/theme";

const INITIAL_PROFILE = {
  name: "Ayaan Khan",
  email: "ayaan.khan@email.com",
  phone: "+91 98765 43210",
  dob: "12 March 1990",
  bloodGroup: "B+",
  allergies: "Penicillin, Sulfa drugs",
  doctor: "Dr. Priya Mehta",
  hospital: "Apollo Hospitals, Mumbai",
  memberSince: "January 2023",
};

export default function ProfileScreen() {
  const router = useRouter();

  const [profile, setProfile] = useState(INITIAL_PROFILE);
  const [isEditing, setIsEditing] = useState(false);

  const handleChange = (key: string, value: string) => {
    setProfile({ ...profile, [key]: value });
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="dark-content" />

      {/* HEADER */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
          <Ionicons name="chevron-back" size={22} color={theme.colors.primary} />
        </TouchableOpacity>

        <Text style={styles.headerTitle}>My Profile</Text>

        <TouchableOpacity
          style={styles.editBtn}
          onPress={() => setIsEditing(!isEditing)}
        >
          <Feather
            name={isEditing ? "check" : "edit-2"}
            size={18}
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
            <Text style={styles.avatarInitials}>AK</Text>
            <View style={styles.onlineDot} />
          </View>

          {isEditing ? (
            <TextInput
              style={styles.input}
              value={profile.name}
              onChangeText={(text) => handleChange("name", text)}
            />
          ) : (
            <Text style={styles.profileName}>{profile.name}</Text>
          )}

          <Text style={styles.profileSub}>
            Member since {profile.memberSince}
          </Text>
        </View>

        {/* PERSONAL INFO */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Personal Information</Text>

          <View style={styles.card}>
            <InfoRow
              label="Email"
              value={profile.email}
              icon={<Feather name="mail" size={16} color={theme.colors.primaryAccent} />}
              editable={isEditing}
              onChange={(v) => handleChange("email", v)}
            />
            <Divider />
            <InfoRow
              label="Phone"
              value={profile.phone}
              icon={<Feather name="phone" size={16} color={theme.colors.primaryAccent} />}
              editable={isEditing}
              onChange={(v) => handleChange("phone", v)}
            />
            <Divider />
            <InfoRow
              label="Date of Birth"
              value={profile.dob}
              icon={<Feather name="calendar" size={16} color={theme.colors.primaryAccent} />}
              editable={isEditing}
              onChange={(v) => handleChange("dob", v)}
            />
          </View>
        </View>

        {/* MEDICAL INFO */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Medical Information</Text>

          <View style={styles.card}>
            <InfoRow
              label="Blood Group"
              value={profile.bloodGroup}
              icon={
                <MaterialIcons name="bloodtype" size={16} color={theme.colors.danger} />
              }
              highlight
              editable={isEditing}
              onChange={(v) => handleChange("bloodGroup", v)}
            />
            <Divider />
            <InfoRow
              label="Allergies"
              value={profile.allergies}
              icon={<MaterialIcons name="warning" size={16} color={theme.colors.secondary} />}
              editable={isEditing}
              onChange={(v) => handleChange("allergies", v)}
            />
            <Divider />
            <InfoRow
              label="Primary Doctor"
              value={profile.doctor}
              icon={<Feather name="user" size={16} color={theme.colors.primaryAccent} />}
              editable={isEditing}
              onChange={(v) => handleChange("doctor", v)}
            />
            <Divider />
            <InfoRow
              label="Hospital"
              value={profile.hospital}
              icon={<Feather name="map-pin" size={16} color={theme.colors.primaryAccent} />}
              editable={isEditing}
              onChange={(v) => handleChange("hospital", v)}
            />
          </View>
        </View>

        {/* SIGN OUT */}
        <TouchableOpacity style={styles.signOutBtn}>
          <Feather name="log-out" size={16} color={theme.colors.danger} />
          <Text style={styles.signOutText}>Sign Out</Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}

function InfoRow({ icon, label, value, highlight, editable, onChange }: any) {
  return (
    <View style={styles.infoRow}>
      <View style={styles.infoIcon}>{icon}</View>
      <View style={{ flex: 1 }}>
        <Text style={styles.infoLabel}>{label}</Text>

        {editable ? (
          <TextInput
            style={styles.input}
            value={value}
            onChangeText={onChange}
          />
        ) : (
          <Text style={[styles.infoValue, highlight && styles.highlightValue]}>
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
