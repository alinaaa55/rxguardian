// app/medicine-details.tsx
import { Feather, Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import { useRouter, useLocalSearchParams } from "expo-router";
import {
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  Alert,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { theme } from "../constants/theme";
import { MedStore } from "./(tabs)/meds";
import { useFocusEffect } from "@react-navigation/native";
import { useCallback, useState, useEffect } from "react";

export default function MedicineDetails() {
  const router = useRouter();
  const params = useLocalSearchParams();
  const [isTaken, setIsTaken] = useState(false);
  const [medData, setMedData] = useState<any>(null);

  const id = params.id as string;

  const loadData = useCallback(async () => {
    const meds = await MedStore.getAll();
    const current = meds.find((m: any) => m.id === id);
    if (current) {
      setMedData(current);
      setIsTaken(current.taken);
    }
  }, [id]);

  useFocusEffect(
    useCallback(() => {
      loadData();
    }, [loadData])
  );

  if (!medData) return null;

  const { name, dose, type, dosage, frequency, duration } = medData;

  const handleToggleTaken = async () => {
    await MedStore.toggleTaken(id);
    setIsTaken(!isTaken);
  };

  const handleDelete = () => {
    Alert.alert(
      "Delete Medication",
      `Are you sure you want to remove ${name}?`,
      [
        { text: "Cancel", style: "cancel" },
        { 
          text: "Delete", 
          style: "destructive",
          onPress: async () => {
            await MedStore.delete(id);
            router.back();
          }
        },
      ]
    );
  };

  const handleEdit = () => {
    router.push({
      pathname: "/add-med",
      params: { id },
    });
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" />
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContainer}
      >
        {/* HEADER */}
        <View style={styles.header}>
          <TouchableOpacity
            style={styles.iconBtn}
            onPress={() => router.back()}
          >
            <Feather name="arrow-left" size={20} color={theme.colors.primary} />
          </TouchableOpacity>

          <Text style={styles.headerTitle}>DETAILS</Text>

          <View style={{ flexDirection: "row", gap: 10 }}>
            <TouchableOpacity style={styles.iconBtn} onPress={handleEdit}>
              <Feather name="edit-2" size={18} color={theme.colors.primary} />
            </TouchableOpacity>
            <TouchableOpacity style={[styles.iconBtn, { backgroundColor: theme.colors.dangerLight }]} onPress={handleDelete}>
              <Feather name="trash-2" size={18} color={theme.colors.danger} />
            </TouchableOpacity>
          </View>
        </View>

        {/* TITLE */}
        <View style={styles.titleSection}>
          <View style={styles.aiBadge}>
            <Text style={styles.aiText}>AI VERIFIED</Text>
          </View>

          <Text style={styles.medTitle}>{name}</Text>
          <Text style={styles.subtitle}>{dose} • {type}</Text>
        </View>

        {/* DOSAGE + FREQUENCY */}
        <View style={styles.row}>
          <View style={styles.card}>
            <Feather name="link" size={20} color={theme.colors.primaryAccent} />
            <Text style={styles.cardLabel}>Dosage</Text>
            <Text style={styles.cardValue}>{dosage}</Text>
          </View>

          <View style={styles.card}>
            <Feather name="clock" size={20} color="#9333EA" />
            <Text style={styles.cardLabel}>Frequency</Text>
            <Text style={styles.cardValue}>{frequency}</Text>
          </View>
        </View>

        {/* DURATION */}
        <View style={styles.durationCard}>
          <View style={styles.durationLeft}>
            <MaterialCommunityIcons name="calendar" size={22} color={theme.colors.secondary} />
            <View style={{ marginLeft: 10 }}>
              <Text style={styles.cardLabel}>Duration</Text>
              <Text style={styles.cardValue}>{duration}</Text>
            </View>
          </View>

          <View style={styles.progressCircle}>
            <Text style={styles.progressText}>75%</Text>
          </View>
        </View>

        {/* INTERACTION RISK */}
        <View style={styles.interactionCard}>
          <Text style={styles.sectionTitle}>Interaction Risk</Text>

          <View style={styles.riskMeter}>
            <View style={styles.riskNeedle} />
          </View>

          <Text style={styles.lowRisk}>✔ Low Risk</Text>

          <Text style={styles.riskText}>
            Safe to take with your current medication stack.
          </Text>
        </View>

        {/* SIDE EFFECTS */}
        <TouchableOpacity style={styles.sideCard}>
          <Ionicons name="warning-outline" size={22} color={theme.colors.danger} />
          <Text style={styles.sideText}>Side Effects</Text>
          <Feather name="chevron-down" size={20} color={theme.colors.tabInactive} />
        </TouchableOpacity>

        {/* NOTE */}
        <View style={styles.noteBox}>
          <Text style={styles.noteText}>
            "Take with a full glass of water. Do not crush or chew."
          </Text>
        </View>

        {/* Extra space so content doesn't hide behind bottom buttons */}
        <View style={{ height: 120 }} />
      </ScrollView>

      {/* BOTTOM BUTTONS */}
      <View style={styles.bottomContainer}>
        <TouchableOpacity style={styles.refillBtn}>
          <Text style={styles.refillText}>Refill</Text>
        </TouchableOpacity>

        <TouchableOpacity 
          style={[
            styles.takenBtn, 
            isTaken && { backgroundColor: theme.colors.success }
          ]} 
          onPress={handleToggleTaken}
        >
          <Feather name={isTaken ? "check-circle" : "check"} size={18} color="white" />
          <Text style={styles.takenText}>
            {isTaken ? "Taken Today" : "Mark as Taken"}
          </Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },

  scrollContainer: {
    paddingHorizontal: 20,
    paddingTop: 10,
  },

  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginTop: 10,
  },

  headerTitle: {
    fontWeight: "700",
    color: theme.colors.text.secondary,
    letterSpacing: 1,
  },

  iconBtn: {
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: theme.colors.border,
    alignItems: "center",
    justifyContent: "center",
  },

  titleSection: {
    marginTop: 20,
  },

  aiBadge: {
    backgroundColor: theme.colors.primaryLight,
    alignSelf: "flex-start",
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 20,
  },

  aiText: {
    fontSize: 11,
    color: theme.colors.primaryAccent,
    fontWeight: "600",
  },

  medTitle: {
    fontSize: 28,
    fontWeight: "800",
    marginTop: 10,
    color: theme.colors.text.primary,
  },

  subtitle: {
    color: theme.colors.text.secondary,
    marginTop: 4,
  },

  row: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 22,
  },

  card: {
    width: "48%",
    backgroundColor: theme.colors.surface,
    padding: 20,
    borderRadius: 22,
    alignItems: "center",
    ...theme.shadows.sm,
  },

  cardLabel: {
    fontSize: 12,
    color: theme.colors.text.secondary,
    marginTop: 6,
  },

  cardValue: {
    fontWeight: "700",
    marginTop: 4,
    fontSize: 15,
  },

  durationCard: {
    backgroundColor: theme.colors.surface,
    borderRadius: 22,
    padding: 20,
    marginTop: 20,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    ...theme.shadows.sm,
  },

  durationLeft: {
    flexDirection: "row",
    alignItems: "center",
  },

  progressCircle: {
    width: 52,
    height: 52,
    borderRadius: 26,
    borderWidth: 4,
    borderColor: theme.colors.secondary,
    alignItems: "center",
    justifyContent: "center",
  },

  progressText: {
    fontSize: 12,
    fontWeight: "600",
  },

  interactionCard: {
    backgroundColor: theme.colors.surface,
    borderRadius: 22,
    padding: 20,
    marginTop: 20,
    alignItems: "center",
    ...theme.shadows.sm,
  },

  sectionTitle: {
    fontWeight: "700",
    alignSelf: "flex-start",
    color: theme.colors.text.primary,
  },

  riskMeter: {
    width: 220,
    height: 110,
    borderTopLeftRadius: 110,
    borderTopRightRadius: 110,
    borderWidth: 12,
    borderColor: theme.colors.success,
    borderBottomWidth: 0,
    marginTop: 20,
  },

  riskNeedle: {
    width: 90,
    height: 3,
    backgroundColor: theme.colors.text.primary,
    position: "absolute",
    bottom: 0,
    transform: [{ rotate: "-30deg" }],
  },

  lowRisk: {
    color: theme.colors.success,
    fontWeight: "700",
    marginTop: 10,
    fontSize: 15,
  },

  riskText: {
    color: theme.colors.text.secondary,
    fontSize: 12,
    textAlign: "center",
    marginTop: 4,
  },

  sideCard: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: theme.colors.surface,
    padding: 18,
    borderRadius: 22,
    marginTop: 20,
    ...theme.shadows.sm,
  },

  sideText: {
    flex: 1,
    marginLeft: 10,
    fontWeight: "600",
    fontSize: 15,
    color: theme.colors.text.primary,
  },

  noteBox: {
    borderWidth: 1,
    borderColor: theme.colors.border,
    borderRadius: 16,
    padding: 16,
    marginTop: 20,
  },

  noteText: {
    fontSize: 12,
    color: theme.colors.text.secondary,
    textAlign: "center",
    fontStyle: "italic",
  },

  bottomContainer: {
    position: "absolute",
    bottom: 20,
    left: 20,
    right: 20,
    flexDirection: "row",
    justifyContent: "space-between",
  },

  refillBtn: {
    backgroundColor: theme.colors.border,
    paddingVertical: 16,
    paddingHorizontal: 30,
    borderRadius: 24,
  },

  refillText: {
    fontWeight: "600",
    color: theme.colors.text.primary,
  },

  takenBtn: {
    backgroundColor: theme.colors.primary,
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 16,
    paddingHorizontal: 30,
    borderRadius: 24,
  },

  takenText: {
    color: "white",
    marginLeft: 8,
    fontWeight: "600",
  },
});
