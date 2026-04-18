// app/profile.tsx
import { Feather, Ionicons, MaterialIcons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { useState } from "react";
import {
    SafeAreaView,
    ScrollView,
    StatusBar,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from "react-native";

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
      <StatusBar barStyle="dark-content" backgroundColor="#F1F5F9" />

      {/* HEADER */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
          <Ionicons name="chevron-back" size={22} color="#1E3A8A" />
        </TouchableOpacity>

        <Text style={styles.headerTitle}>My Profile</Text>

        <TouchableOpacity
          style={styles.editBtn}
          onPress={() => setIsEditing(!isEditing)}
        >
          <Feather
            name={isEditing ? "check" : "edit-2"}
            size={18}
            color="#2563EB"
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
              icon={<Feather name="mail" size={16} color="#2563EB" />}
              editable={isEditing}
              onChange={(v) => handleChange("email", v)}
            />
            <Divider />
            <InfoRow
              label="Phone"
              value={profile.phone}
              icon={<Feather name="phone" size={16} color="#2563EB" />}
              editable={isEditing}
              onChange={(v) => handleChange("phone", v)}
            />
            <Divider />
            <InfoRow
              label="Date of Birth"
              value={profile.dob}
              icon={<Feather name="calendar" size={16} color="#2563EB" />}
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
                <MaterialIcons name="bloodtype" size={16} color="#DC2626" />
              }
              highlight
              editable={isEditing}
              onChange={(v) => handleChange("bloodGroup", v)}
            />
            <Divider />
            <InfoRow
              label="Allergies"
              value={profile.allergies}
              icon={<MaterialIcons name="warning" size={16} color="#EA580C" />}
              editable={isEditing}
              onChange={(v) => handleChange("allergies", v)}
            />
            <Divider />
            <InfoRow
              label="Primary Doctor"
              value={profile.doctor}
              icon={<Feather name="user" size={16} color="#2563EB" />}
              editable={isEditing}
              onChange={(v) => handleChange("doctor", v)}
            />
            <Divider />
            <InfoRow
              label="Hospital"
              value={profile.hospital}
              icon={<Feather name="map-pin" size={16} color="#2563EB" />}
              editable={isEditing}
              onChange={(v) => handleChange("hospital", v)}
            />
          </View>
        </View>

        {/* SIGN OUT */}
        <TouchableOpacity style={styles.signOutBtn}>
          <Feather name="log-out" size={16} color="#DC2626" />
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
  safeArea: { flex: 1, backgroundColor: "#F1F5F9" },

  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    padding: 16,
  },

  backBtn: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: "#E2E8F0",
    alignItems: "center",
    justifyContent: "center",
  },

  editBtn: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: "#DBEAFE",
    alignItems: "center",
    justifyContent: "center",
  },

  headerTitle: { fontSize: 17, fontWeight: "700", color: "#1E3A8A" },

  avatarSection: { alignItems: "center", paddingVertical: 28 },

  avatarCircle: {
    width: 90,
    height: 90,
    borderRadius: 45,
    backgroundColor: "#1E3A8A",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 14,
  },

  avatarInitials: { fontSize: 30, color: "white", fontWeight: "700" },

  onlineDot: {
    width: 14,
    height: 14,
    borderRadius: 7,
    backgroundColor: "#22C55E",
    position: "absolute",
    bottom: 4,
    right: 4,
  },

  profileName: { fontSize: 20, fontWeight: "700" },
  profileSub: { fontSize: 13, color: "#64748B" },

  section: { paddingHorizontal: 20, marginBottom: 20 },
  sectionTitle: { fontSize: 13, color: "#64748B", marginBottom: 10 },

  card: { backgroundColor: "white", borderRadius: 20 },

  infoRow: { flexDirection: "row", padding: 14 },

  infoIcon: {
    width: 32,
    height: 32,
    backgroundColor: "#F1F5F9",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 12,
  },

  infoLabel: { fontSize: 11, color: "#94A3B8" },
  infoValue: { fontSize: 14, fontWeight: "500" },

  highlightValue: { color: "#DC2626" },

  divider: { height: 0.5, backgroundColor: "#E2E8F0" },

  input: {
    borderBottomWidth: 1,
    borderColor: "#CBD5F5",
    fontSize: 14,
    paddingVertical: 2,
  },

  signOutBtn: {
    flexDirection: "row",
    justifyContent: "center",
    padding: 14,
    backgroundColor: "#FEE2E2",
    margin: 20,
    borderRadius: 20,
  },

  signOutText: { color: "#DC2626", fontWeight: "600" },
});
