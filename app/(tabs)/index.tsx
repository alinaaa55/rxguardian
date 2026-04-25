import { Feather, Ionicons, MaterialIcons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { useEffect, useState, useCallback } from "react";
import {
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  ActivityIndicator,
} from "react-native";
import { theme } from "../../constants/theme";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { storage } from "../../services/storage";
import { useFocusEffect } from "@react-navigation/native";
import api from "../../services/api";
import { useSettings } from "../../context/SettingsContext";
import { aiService } from "../../services/aiService";

function getGreeting(): string {
  const hour = new Date().getHours();
  if (hour < 12) return "Good Morning";
  if (hour < 17) return "Good Afternoon";
  return "Good Evening";
}

function getDynamicDate(): string {
  const now = new Date();
  return now.toLocaleDateString("en-US", {
    weekday: "long",
    day: "numeric",
    month: "short",
  });
}

export default function HomeScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { fontSizeMultiplier, elderlyMode } = useSettings();
  
  const [userName, setUserName] = useState("User");
  const [todayData, setTodayData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [interactionResult, setInteractionResult] = useState<string | null>(null);
  const [loadingAI, setLoadingAI] = useState(false);

  const loadData = async () => {
    try {
      setLoading(true);
      const [user, tracking, meds] = await Promise.all([
        storage.getUserInfo(),
        api.get("/api/v1/track/today"),
        storage.getMeds()
      ]);
      if (user?.name) setUserName(user.name.split(' ')[0]);
      setTodayData(tracking.data);

      // Trigger AI Interaction check for current regimen
      if (meds.length > 0) {
        fetchInteractionCheck(meds[0].name);
      }
    } catch (error) {
      console.error("Home load error:", error);
    } finally {
      setLoading(false);
    }
  };

  const fetchInteractionCheck = async (medName: string) => {
    try {
      setLoadingAI(true);
      const res = await aiService.getInteractionAlert(medName);
      setInteractionResult(res.bot_message.message);
    } catch (err) {
      console.error("AI Interaction check error:", err);
    } finally {
      setLoadingAI(false);
    }
  };

  useFocusEffect(
    useCallback(() => {
      loadData();
    }, [])
  );

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
        <Text key={`line-${lineIdx}`} style={{ lineHeight: 22 * fontSizeMultiplier }}>
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

  const adherence = todayData?.adherence_pct ? Math.round(todayData.adherence_pct) : 0;
  const todayMeds = todayData?.medicines?.slice(0, 3) || [];

  return (
    <View style={[styles.container, { paddingTop: insets.top, backgroundColor: elderlyMode ? "#fff" : theme.colors.background }]}>
      <StatusBar barStyle="dark-content" />

      <View style={styles.contentWrapper}>
        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{ paddingBottom: 160 }}
        >
          {/* HEADER */}
          <View style={styles.header}>
            <Text style={[styles.date, { fontSize: 13 * fontSizeMultiplier }]}>{getDynamicDate()}</Text>

            <View style={styles.headerRow}>
              <Text style={[styles.greeting, { fontSize: theme.typography.h1.fontSize * fontSizeMultiplier }]}>{getGreeting()}, {userName}</Text>

              <TouchableOpacity
                style={styles.avatar}
                onPress={() => router.push("/profile")}
              >
                <Feather name="user" size={20 * fontSizeMultiplier} color={theme.colors.primary} />
                <View style={styles.onlineDot} />
              </TouchableOpacity>
            </View>
          </View>

          {/* ADHERENCE CARD */}
          <View style={[styles.adherenceCard, elderlyMode && styles.adherenceCardElderly]}>
            <View style={[styles.circleOuter, elderlyMode && { borderColor: theme.colors.primary, borderWidth: 15 }]}>
              <Text style={[styles.percent, { fontSize: 34 * fontSizeMultiplier }]}>{adherence}%</Text>
              <Text style={[styles.adherenceText, { fontSize: 12 * fontSizeMultiplier }]}>ADHERENCE</Text>
            </View>

            <Text style={[styles.greatJob, { fontSize: 15 * fontSizeMultiplier }]}>
              {adherence === 100 ? "Perfect adherence!" : adherence > 70 ? "Great job keeping up!" : "Keep it up!"}
            </Text>
            <Text style={[styles.subText, { fontSize: 13 * fontSizeMultiplier }]}>
              {adherence === 100 ? "You've taken all your meds today." : "You're on track with your weekly goals."}
            </Text>
          </View>

          {/* SECTION HEADER */}
          <View style={styles.sectionHeader}>
            <Text style={[styles.sectionTitle, { fontSize: theme.typography.h2.fontSize * fontSizeMultiplier }]}>Today's Medicines</Text>

            <TouchableOpacity onPress={() => router.push("/(tabs)/meds")}>
              <Text style={[styles.seeAll, { fontSize: 14 * fontSizeMultiplier }]}>See All</Text>
            </TouchableOpacity>
          </View>

          {loading ? (
             <ActivityIndicator size="small" color={theme.colors.primary} style={{ marginTop: 20 }} />
          ) : todayMeds.length === 0 ? (
             <View style={styles.medicineCard}>
                <Text style={[styles.subText, { fontSize: 13 * fontSizeMultiplier }]}>No medications scheduled for today.</Text>
             </View>
          ) : (
            todayMeds.map((med: any, idx: number) => (
              <TouchableOpacity
                key={idx}
                style={[styles.medicineCard, elderlyMode && styles.medicineCardElderly]}
                onPress={() =>
                  router.push({
                    pathname: "/medicine-details",
                    params: { id: med.medicine_id },
                  })
                }
              >
                <View style={[styles.iconCircle, { backgroundColor: theme.colors.primaryLight }]}>
                  <MaterialIcons name="medication" size={22 * fontSizeMultiplier} color={theme.colors.primaryAccent} />
                </View>

                <View style={{ flex: 1 }}>
                  <Text style={[styles.medName, { fontSize: 14 * fontSizeMultiplier }]}>{med.medicine_name}</Text>
                  <Text style={[styles.medDetails, { fontSize: 12 * fontSizeMultiplier }]}>
                    {med.scheduled_time}
                  </Text>
                </View>

                {med.status === "taken" ? (
                  <View style={styles.takenBadge}>
                    <Feather name="check-circle" size={14 * fontSizeMultiplier} color={theme.colors.success} />
                    <Text style={[styles.takenText, { fontSize: 12 * fontSizeMultiplier }]}>Taken</Text>
                  </View>
                ) : (
                  <View style={styles.pendingBadge}>
                    <Ionicons name="time-outline" size={14 * fontSizeMultiplier} color={theme.colors.text.secondary} />
                    <Text style={[styles.pendingText, { fontSize: 12 * fontSizeMultiplier }]}>{med.status === 'missed' ? 'Missed' : 'Pending'}</Text>
                  </View>
                )}
              </TouchableOpacity>
            ))
          )}

          {/* ALERT */}
          <View style={[styles.alertCard, interactionResult?.includes('⚠️') && { backgroundColor: '#FEE2E2' }]}>
            {loadingAI ? (
              <ActivityIndicator size="small" color={theme.colors.danger} />
            ) : (
              <MaterialIcons name={interactionResult?.includes('⚠️') ? "report-problem" : "security"} size={22 * fontSizeMultiplier} color={interactionResult?.includes('⚠️') ? theme.colors.danger : theme.colors.success} />
            )}

            <View style={{ flex: 1, marginLeft: 10 }}>
              <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
                <Text style={[styles.alertTitle, { fontSize: 14 * fontSizeMultiplier }, interactionResult && !interactionResult.includes('⚠️') && { color: theme.colors.success }]}>
                  {interactionResult?.includes('⚠️') ? "Safety Warning" : "Interaction Check"}
                </Text>
              </View>

              <Text style={[styles.alertText, { fontSize: 12 * fontSizeMultiplier }, interactionResult && !interactionResult.includes('⚠️') && { color: theme.colors.text.primary }]}>
                {loadingAI 
                  ? "Analyzing your medications for safety..." 
                  : formatText(interactionResult || "No interactions detected in your current regimen. Stay safe!")}
              </Text>
            </View>
          </View>
        </ScrollView>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  contentWrapper: { flex: 1, paddingHorizontal: 20 },
  header: { marginTop: 20 },
  date: { color: theme.colors.text.secondary },
  headerRow: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginTop: 8 },
  greeting: { fontWeight: "700", color: theme.colors.primary },
  avatar: { width: 44, height: 44, borderRadius: 22, backgroundColor: theme.colors.border, alignItems: "center", justifyContent: "center" },
  onlineDot: { width: 10, height: 10, borderRadius: 5, backgroundColor: theme.colors.successLight, position: "absolute", bottom: 3, right: 3 },
  adherenceCard: { backgroundColor: theme.colors.border, borderRadius: 24, padding: 25, marginTop: 25, alignItems: "center", ...theme.shadows.sm },
  adherenceCardElderly: { backgroundColor: "#fff", borderWidth: 2, borderColor: theme.colors.primary },
  circleOuter: { width: 160, height: 160, borderRadius: 80, borderWidth: 12, borderColor: theme.colors.primary, alignItems: "center", justifyContent: "center" },
  percent: { fontWeight: "800" },
  adherenceText: { color: theme.colors.text.secondary, marginTop: 4 },
  greatJob: { marginTop: 20, fontWeight: "700" },
  subText: { textAlign: "center", color: theme.colors.text.secondary, marginTop: 6, lineHeight: 18 },
  sectionHeader: { flexDirection: "row", justifyContent: "space-between", marginTop: 30, alignItems: "center" },
  sectionTitle: { fontWeight: "700" },
  seeAll: { color: theme.colors.primaryAccent, fontWeight: "500" },
  medicineCard: { backgroundColor: theme.colors.surface, borderRadius: 20, padding: 16, flexDirection: "row", alignItems: "center", marginTop: 15, ...theme.shadows.sm },
  medicineCardElderly: { borderWidth: 1.5, borderColor: theme.colors.border },
  iconCircle: { width: 46, height: 46, borderRadius: 23, alignItems: "center", justifyContent: "center", marginRight: 14 },
  medName: { fontWeight: "700" },
  medDetails: { color: theme.colors.text.secondary, marginTop: 3 },
  takenBadge: { flexDirection: "row", alignItems: "center", backgroundColor: theme.colors.successLight, paddingHorizontal: 12, paddingVertical: 6, borderRadius: 20 },
  takenText: { marginLeft: 5, color: theme.colors.success, fontWeight: "600" },
  pendingBadge: { flexDirection: "row", alignItems: "center", backgroundColor: theme.colors.border, paddingHorizontal: 12, paddingVertical: 6, borderRadius: 20 },
  pendingText: { marginLeft: 5, color: theme.colors.text.secondary, fontWeight: "600" },
  alertCard: { flexDirection: "row", backgroundColor: theme.colors.dangerLight, padding: 18, borderRadius: 20, marginTop: 25 },
  alertTitle: { fontWeight: "700", color: theme.colors.danger },
  alertText: { color: theme.colors.danger, marginTop: 5, lineHeight: 17 }
});
