import { Feather, Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import { useFocusEffect } from "@react-navigation/native";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useCallback, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { theme } from "../constants/theme";
import { useSettings } from "../context/SettingsContext";
import { aiService } from "../services/aiService";
import api from "../services/api";

export default function MedicineDetails() {
  const router = useRouter();
  const params = useLocalSearchParams();
  const { fontSizeMultiplier, elderlyMode } = useSettings();
  const [medData, setMedData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  const [sideEffects, setSideEffects] = useState<string | null>(null);
  const [fetchingSideEffects, setFetchingSideEffects] = useState(false);
  const [showSideEffects, setShowSideEffects] = useState(false);

  const id = params.id as string;

  const loadData = useCallback(async () => {
    try {
      setLoading(true);
      const res = await api.get(`/api/v1/medicines/${id}`);
      setMedData(res.data);
    } catch (error) {
      Alert.alert("Error", "Failed to load medicine details");
    } finally {
      setLoading(false);
    }
  }, [id]);

  const handleFetchSideEffects = async () => {
    if (sideEffects) {
      setShowSideEffects(!showSideEffects);
      return;
    }

    try {
      setFetchingSideEffects(true);
      setShowSideEffects(true);
      const res = await aiService.getSideEffects({
        name: medData.name,
        dosage: medData.dosage,
        instructions: medData.instructions
      });
      setSideEffects(res.bot_message.message);
    } catch (error) {
      Alert.alert("Error", "Failed to fetch side effects");
      setShowSideEffects(false);
    } finally {
      setFetchingSideEffects(false);
    }
  };

  useFocusEffect(
    useCallback(() => {
      loadData();
    }, [loadData])
  );

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <ActivityIndicator size="large" color={theme.colors.primary} style={{ marginTop: 100 }} />
      </SafeAreaView>
    );
  }

  if (!medData) return null;

  const { name, dosage, frequency, duration_days, instructions, icon, color, bgColor, time_slots } = medData;

  const handleToggleTaken = async () => {
    try {
      await api.post("/api/v1/track/take", { medicine_id: id });
      Alert.alert("Success", "Marked as taken for today!");
    } catch (error) {
      Alert.alert("Error", "Failed to mark as taken");
    }
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
            try {
              await api.delete(`/api/v1/medicines/${id}`);
              router.back();
            } catch (error) {
              Alert.alert("Error", "Failed to delete medicine");
            }
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

  const formatText = (text: string) => {
    if (!text) return null;

    // Clean up markdown markers (###, **), code blocks, and "Markdown:" labels
    let cleanText = text
      .replace(/```markdown\n?/g, "")
      .replace(/```\n?/g, "")
      .replace(/^Markdown:\s*\n?/i, "")
      .trim();

    const lines = cleanText.split("\n");

    return lines.map((line, lineIdx) => {
      const trimmedLine = line.trim();
      if (!trimmedLine && lineIdx !== lines.length - 1) return <Text key={lineIdx}>{"\n"}</Text>;

      // Check for headers (###)
      if (trimmedLine.startsWith("###")) {
        const headerText = trimmedLine.replace(/^###\s*/, "");
        return (
          <Text key={`line-${lineIdx}`} style={{ fontWeight: "800", fontSize: 16 * fontSizeMultiplier, marginTop: 12, marginBottom: 4, color: theme.colors.text.primary }}>
            {headerText}
            {"\n"}
          </Text>
        );
      }

      // Check for bullet points
      let displayLine = line;
      if (trimmedLine.startsWith("- ")) {
        displayLine = line.replace("- ", "• ");
      }

      // Handle bolding within the line
      const parts = displayLine.split("**");
      return (
        <Text key={`line-${lineIdx}`} style={{ lineHeight: 22 * fontSizeMultiplier, color: theme.colors.text.secondary }}>
          {parts.map((part, i) =>
            i % 2 === 1 ? (
              <Text key={i} style={{ fontWeight: "700", color: theme.colors.text.primary }}>
                {part}
              </Text>
            ) : (
              <Text key={i}>{part}</Text>
            )
          )}
          {"\n"}
        </Text>
      );
    });
  };

  return (
    <SafeAreaView style={[styles.container, elderlyMode && { backgroundColor: "#fff" }]}>
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
            <Feather name="arrow-left" size={20 * fontSizeMultiplier} color={theme.colors.primary} />
          </TouchableOpacity>

          <Text style={[styles.headerTitle, { fontSize: 13 * fontSizeMultiplier }]}>DETAILS</Text>

          <View style={{ flexDirection: "row", gap: 10 }}>
            <TouchableOpacity style={styles.iconBtn} onPress={handleEdit}>
              <Feather name="edit-2" size={18 * fontSizeMultiplier} color={theme.colors.primary} />
            </TouchableOpacity>
            <TouchableOpacity style={[styles.iconBtn, { backgroundColor: theme.colors.dangerLight }]} onPress={handleDelete}>
              <Feather name="trash-2" size={18 * fontSizeMultiplier} color={theme.colors.danger} />
            </TouchableOpacity>
          </View>
        </View>

        {/* TITLE */}
        <View style={styles.titleSection}>
          <View style={[styles.medIconLarge, { backgroundColor: bgColor || theme.colors.primaryLight }]}>
            <MaterialCommunityIcons name={(icon as any) || "pill"} size={40 * fontSizeMultiplier} color={color || theme.colors.primaryAccent} />
          </View>
          <Text style={[styles.medTitle, { fontSize: 28 * fontSizeMultiplier }]}>{name}</Text>
          <Text style={[styles.subtitle, { fontSize: 16 * fontSizeMultiplier }]}>{dosage} • {frequency}</Text>
        </View>

        {/* DOSAGE + FREQUENCY */}
        <View style={styles.row}>
          <View style={[styles.card, elderlyMode && styles.cardElderly]}>
            <Feather name="clock" size={20 * fontSizeMultiplier} color={theme.colors.primaryAccent} />
            <Text style={[styles.cardLabel, { fontSize: 11 * fontSizeMultiplier }]}>Timings</Text>
            <Text style={[styles.cardValue, { fontSize: 14 * fontSizeMultiplier }]}>{time_slots?.map((ts: any) => ts.time).join(", ")}</Text>
          </View>

          <View style={[styles.card, elderlyMode && styles.cardElderly]}>
            <MaterialCommunityIcons name="calendar-clock" size={20 * fontSizeMultiplier} color="#9333EA" />
            <Text style={[styles.cardLabel, { fontSize: 11 * fontSizeMultiplier }]}>Duration</Text>
            <Text style={[styles.cardValue, { fontSize: 14 * fontSizeMultiplier }]}>{duration_days} Days Left</Text>
          </View>
        </View>

        {/* INSTRUCTIONS */}
        <View style={[styles.instructionCard, elderlyMode && styles.cardElderly]}>
          <Feather name="info" size={22 * fontSizeMultiplier} color={theme.colors.secondary} />
          <View style={{ flex: 1, marginLeft: 12 }}>
            <Text style={[styles.cardLabel, { fontSize: 11 * fontSizeMultiplier }]}>Instructions</Text>
            <Text style={[styles.cardValue, { fontSize: 14 * fontSizeMultiplier }]}>{instructions || "No specific instructions"}</Text>
          </View>
        </View>

        {/* SIDE EFFECTS */}
        <TouchableOpacity
          style={[styles.sideCard, elderlyMode && styles.cardElderly]}
          onPress={handleFetchSideEffects}
        >
          <Ionicons name="warning-outline" size={22 * fontSizeMultiplier} color={theme.colors.danger} />
          <Text style={[styles.sideText, { fontSize: 15 * fontSizeMultiplier }]}>Common Side Effects</Text>
          <Feather
            name={showSideEffects ? "chevron-up" : "chevron-down"}
            size={20 * fontSizeMultiplier}
            color={theme.colors.tabInactive}
          />
        </TouchableOpacity>

        {showSideEffects && (
          <View style={[styles.sideEffectsContent, elderlyMode && styles.cardElderly]}>
            {fetchingSideEffects ? (
              <ActivityIndicator size="small" color={theme.colors.primary} />
            ) : (
              <Text style={[styles.sideEffectsText, { fontSize: 14 * fontSizeMultiplier }]}>
                {formatText(sideEffects || "No side effects information available.")}
              </Text>
            )}
          </View>
        )}

        <View style={{ height: 120 }} />
      </ScrollView>

      {/* BOTTOM BUTTONS */}
      <View style={styles.bottomContainer}>
        <TouchableOpacity style={styles.refillBtn}>
          <Text style={[styles.refillText, { fontSize: 15 * fontSizeMultiplier }]}>Refill</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.takenBtn}
          onPress={handleToggleTaken}
        >
          <Feather name="check" size={18 * fontSizeMultiplier} color="white" />
          <Text style={[styles.takenText, { fontSize: 15 * fontSizeMultiplier }]}>Mark as Taken</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: theme.colors.background },
  scrollContainer: { paddingHorizontal: 20, paddingTop: 10 },
  header: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", marginTop: 10 },
  headerTitle: { fontWeight: "700", color: theme.colors.text.secondary, letterSpacing: 1 },
  iconBtn: {
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: theme.colors.border,
    alignItems: "center",
    justifyContent: "center",
  },
  titleSection: { marginTop: 24, alignItems: "center" },
  medIconLarge: {
    width: 80,
    height: 80,
    borderRadius: 40,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 16,
  },
  medTitle: { fontWeight: "800", color: theme.colors.text.primary, textAlign: "center" },
  subtitle: { color: theme.colors.text.secondary, marginTop: 4, textAlign: 'center' },
  row: { flexDirection: "row", justifyContent: "space-between", marginTop: 22 },
  card: {
    width: "48%",
    backgroundColor: theme.colors.surface,
    padding: 20,
    borderRadius: 22,
    alignItems: "center",
    ...theme.shadows.sm,
  },
  cardElderly: { borderWidth: 1.5, borderColor: theme.colors.border },
  cardLabel: { color: theme.colors.text.secondary, marginTop: 6, textTransform: "uppercase", letterSpacing: 0.5 },
  cardValue: { fontWeight: "700", marginTop: 4, textAlign: "center", color: theme.colors.text.primary },
  instructionCard: {
    backgroundColor: theme.colors.surface,
    borderRadius: 22,
    padding: 20,
    marginTop: 20,
    flexDirection: "row",
    alignItems: "center",
    ...theme.shadows.sm,
  },
  interactionCard: {
    backgroundColor: theme.colors.surface,
    borderRadius: 22,
    padding: 20,
    marginTop: 20,
    alignItems: "center",
    ...theme.shadows.sm,
  },
  sectionTitle: { fontWeight: "700", alignSelf: "flex-start", color: theme.colors.text.primary, marginBottom: 10 },
  lowRisk: { color: theme.colors.success, fontWeight: "700", marginTop: 10 },
  riskText: { color: theme.colors.text.secondary, textAlign: "center", marginTop: 4 },
  sideCard: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: theme.colors.surface,
    padding: 18,
    borderRadius: 22,
    marginTop: 20,
    ...theme.shadows.sm,
  },
  sideText: { flex: 1, marginLeft: 10, fontWeight: "600", color: theme.colors.text.primary },
  sideEffectsContent: {
    backgroundColor: theme.colors.surface,
    padding: 20,
    borderRadius: 22,
    marginTop: 10,
    ...theme.shadows.sm,
  },
  sideEffectsText: {
    color: theme.colors.text.secondary,
    lineHeight: 20,
  },
  bottomContainer: { position: "absolute", bottom: 20, left: 20, right: 20, flexDirection: "row", justifyContent: "space-between" },
  refillBtn: { backgroundColor: theme.colors.border, paddingVertical: 16, paddingHorizontal: 30, borderRadius: 24, justifyContent: 'center' },
  refillText: { fontWeight: "600", color: theme.colors.text.primary },
  takenBtn: {
    backgroundColor: theme.colors.primary,
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 16,
    paddingHorizontal: 30,
    borderRadius: 24,
  },
  takenText: { color: "white", marginLeft: 8, fontWeight: "600" },
});


