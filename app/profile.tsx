// app/profile.tsx
import { Feather, Ionicons, MaterialIcons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import {
    SafeAreaView,
    ScrollView,
    StatusBar,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from "react-native";

const PROFILE = {
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

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="dark-content" backgroundColor="#F1F5F9" />

      {/* HEADER */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
          <Ionicons name="chevron-back" size={22} color="#1E3A8A" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>My Profile</Text>
        <TouchableOpacity style={styles.editBtn}>
          <Feather name="edit-2" size={18} color="#2563EB" />
        </TouchableOpacity>
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 40 }}
      >
        {/* AVATAR SECTION */}
        <View style={styles.avatarSection}>
          <View style={styles.avatarCircle}>
            <Text style={styles.avatarInitials}>AK</Text>
            <View style={styles.onlineDot} />
          </View>
          <Text style={styles.profileName}>{PROFILE.name}</Text>
          <Text style={styles.profileSub}>
            Member since {PROFILE.memberSince}
          </Text>
        </View>

        {/* PERSONAL INFO */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Personal Information</Text>

          <View style={styles.card}>
            <InfoRow
              icon={<Feather name="mail" size={16} color="#2563EB" />}
              label="Email"
              value={PROFILE.email}
            />
            <Divider />
            <InfoRow
              icon={<Feather name="phone" size={16} color="#2563EB" />}
              label="Phone"
              value={PROFILE.phone}
            />
            <Divider />
            <InfoRow
              icon={<Feather name="calendar" size={16} color="#2563EB" />}
              label="Date of Birth"
              value={PROFILE.dob}
            />
          </View>
        </View>

        {/* MEDICAL INFO */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Medical Information</Text>

          <View style={styles.card}>
            <InfoRow
              icon={
                <MaterialIcons name="bloodtype" size={16} color="#DC2626" />
              }
              label="Blood Group"
              value={PROFILE.bloodGroup}
              highlight
            />
            <Divider />
            <InfoRow
              icon={<MaterialIcons name="warning" size={16} color="#EA580C" />}
              label="Allergies"
              value={PROFILE.allergies}
            />
            <Divider />
            <InfoRow
              icon={<Feather name="user" size={16} color="#2563EB" />}
              label="Primary Doctor"
              value={PROFILE.doctor}
            />
            <Divider />
            <InfoRow
              icon={<Feather name="map-pin" size={16} color="#2563EB" />}
              label="Hospital"
              value={PROFILE.hospital}
            />
          </View>
        </View>

        {/* QUICK ACTIONS */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Account</Text>

          <View style={styles.card}>
            <ActionRow
              icon={<Feather name="bell" size={16} color="#2563EB" />}
              label="Notification Settings"
            />
            <Divider />
            <ActionRow
              icon={<Feather name="shield" size={16} color="#2563EB" />}
              label="Privacy & Security"
            />
            <Divider />
            <ActionRow
              icon={<Feather name="help-circle" size={16} color="#2563EB" />}
              label="Help & Support"
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

function InfoRow({
  icon,
  label,
  value,
  highlight,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
  highlight?: boolean;
}) {
  return (
    <View style={styles.infoRow}>
      <View style={styles.infoIcon}>{icon}</View>
      <View style={{ flex: 1 }}>
        <Text style={styles.infoLabel}>{label}</Text>
        <Text style={[styles.infoValue, highlight && styles.highlightValue]}>
          {value}
        </Text>
      </View>
    </View>
  );
}

function ActionRow({ icon, label }: { icon: React.ReactNode; label: string }) {
  return (
    <TouchableOpacity style={styles.actionRow}>
      <View style={styles.infoIcon}>{icon}</View>
      <Text style={[styles.infoValue, { flex: 1 }]}>{label}</Text>
      <Feather name="chevron-right" size={16} color="#94A3B8" />
    </TouchableOpacity>
  );
}

function Divider() {
  return <View style={styles.divider} />;
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: "#F1F5F9",
  },

  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingVertical: 14,
    backgroundColor: "#F1F5F9",
  },

  backBtn: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: "#E2E8F0",
    alignItems: "center",
    justifyContent: "center",
  },

  headerTitle: {
    fontSize: 17,
    fontWeight: "700",
    color: "#1E3A8A",
  },

  editBtn: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: "#DBEAFE",
    alignItems: "center",
    justifyContent: "center",
  },

  avatarSection: {
    alignItems: "center",
    paddingVertical: 28,
  },

  avatarCircle: {
    width: 90,
    height: 90,
    borderRadius: 45,
    backgroundColor: "#1E3A8A",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 14,
  },

  avatarInitials: {
    fontSize: 30,
    fontWeight: "700",
    color: "white",
  },

  onlineDot: {
    width: 14,
    height: 14,
    borderRadius: 7,
    backgroundColor: "#22C55E",
    borderWidth: 2,
    borderColor: "#F1F5F9",
    position: "absolute",
    bottom: 4,
    right: 4,
  },

  profileName: {
    fontSize: 20,
    fontWeight: "700",
    color: "#1E293B",
  },

  profileSub: {
    fontSize: 13,
    color: "#64748B",
    marginTop: 4,
  },

  section: {
    paddingHorizontal: 20,
    marginBottom: 20,
  },

  sectionTitle: {
    fontSize: 13,
    fontWeight: "600",
    color: "#64748B",
    textTransform: "uppercase",
    letterSpacing: 0.8,
    marginBottom: 10,
  },

  card: {
    backgroundColor: "white",
    borderRadius: 20,
    paddingVertical: 4,
    shadowColor: "#000",
    shadowOpacity: 0.04,
    shadowRadius: 8,
    elevation: 2,
  },

  infoRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 14,
  },

  actionRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 14,
  },

  infoIcon: {
    width: 32,
    height: 32,
    borderRadius: 8,
    backgroundColor: "#F1F5F9",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 12,
  },

  infoLabel: {
    fontSize: 11,
    color: "#94A3B8",
    marginBottom: 2,
  },

  infoValue: {
    fontSize: 14,
    color: "#1E293B",
    fontWeight: "500",
  },

  highlightValue: {
    color: "#DC2626",
    fontWeight: "700",
  },

  divider: {
    height: 0.5,
    backgroundColor: "#E2E8F0",
    marginHorizontal: 16,
  },

  signOutBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    marginHorizontal: 20,
    marginTop: 4,
    marginBottom: 20,
    paddingVertical: 14,
    backgroundColor: "#FEE2E2",
    borderRadius: 20,
    gap: 8,
  },

  signOutText: {
    fontSize: 14,
    fontWeight: "600",
    color: "#DC2626",
  },
});
