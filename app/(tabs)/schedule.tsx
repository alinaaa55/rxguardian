// app/(tabs)/schedule.tsx
import { Feather, Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { useState, useCallback, useEffect } from "react";
import {
  Dimensions,
  ScrollView,
  StyleSheet,
  Switch,
  Text,
  TouchableOpacity,
  View,
  ActivityIndicator,
  Alert,
  Modal,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { theme } from "../../constants/theme";
import api from "../../services/api";
import { useFocusEffect } from "@react-navigation/native";
import * as Speech from "expo-speech";
import * as Notifications from "expo-notifications";
import { useSettings } from "../../context/SettingsContext";

const { width } = Dimensions.get("window");

// ─── Helpers ──────────────────────────────────────────────────────────────────
const BAR_MAX = 100;
const BAR_HEIGHT = 70;
const DAYS_LABEL = ["M", "T", "W", "T", "F", "S", "S"];

// ─── Sub-components ───────────────────────────────────────────────────────────
type MedRowProps = {
  id: string;
  name: string;
  time: string;
  icon: string;
  color: string;
  status: "taken" | "pending" | "missed";
  onToggle: () => void;
};

const MedRow = ({ name, time, icon, color, status, onToggle }: MedRowProps) => {
  const { fontSizeMultiplier, elderlyMode } = useSettings();
  const isTaken = status === "taken";
  const isMissed = status === "missed";

  return (
    <View style={[styles.medRow, elderlyMode && styles.medRowElderly]}>
      <View style={[styles.medIcon, { backgroundColor: color + "22" }]}>
        <MaterialCommunityIcons name={(icon as any) || "pill"} size={20 * fontSizeMultiplier} color={color} />
      </View>
      <View style={{ flex: 1 }}>
        <Text style={[styles.medName, { fontSize: 14 * fontSizeMultiplier }]}>{name}</Text>
        <Text style={[styles.medDose, { fontSize: 12 * fontSizeMultiplier }]}>{time}</Text>
      </View>
      <TouchableOpacity
        onPress={onToggle}
        disabled={isTaken}
        style={[
          styles.checkCircle,
          isTaken && styles.checkCircleDone,
          isMissed && styles.checkCircleMissed,
          elderlyMode && styles.checkCircleElderly,
        ]}
      >
        {isTaken && <Feather name="check" size={14 * fontSizeMultiplier} color="white" />}
        {isMissed && <Feather name="x" size={14 * fontSizeMultiplier} color="white" />}
      </TouchableOpacity>
    </View>
  );
};

const SectionLabel = ({ time, count }: { time: string; count: string }) => {
  const { fontSizeMultiplier } = useSettings();
  return (
    <View style={styles.sectionLabelRow}>
      <Text style={[styles.sectionTime, { fontSize: 11 * fontSizeMultiplier }]}>{time}</Text>
      <Text style={[styles.sectionCount, { fontSize: 11 * fontSizeMultiplier }]}>{count}</Text>
    </View>
  );
};

const BarChart = ({ data }: { data: any[] }) => {
  const todayIdx = new Date().getDay() === 0 ? 6 : new Date().getDay() - 1;
  return (
    <View style={styles.barChartRow}>
      {data.map((item, i) => {
        const barH = (item.adherence_pct / BAR_MAX) * BAR_HEIGHT;
        const isSelected = i === todayIdx;
        return (
          <View key={i} style={styles.barCol}>
            <View style={styles.barBg}>
              <View
                style={[
                  styles.barFill,
                  {
                    height: Math.max(barH, 4),
                    backgroundColor: isSelected ? theme.colors.primary : "#BFDBFE",
                  },
                ]}
              />
            </View>
            <Text
              style={[
                styles.barLabel,
                isSelected && { color: theme.colors.primary, fontWeight: "700" },
              ]}
            >
              {DAYS_LABEL[i]}
            </Text>
          </View>
        );
      })}
    </View>
  );
};

export default function ScheduleScreen() {
  const router = useRouter();
  const { 
    elderlyMode, 
    voiceReminders, 
    notificationsEnabled,
    toggleElderlyMode, 
    toggleVoiceReminders, 
    toggleNotifications,
    fontSizeMultiplier 
  } = useSettings();
  
  const [activeTab, setActiveTab] = useState<"schedule" | "analytics">("schedule");
  const [loading, setLoading] = useState(true);
  const [todayData, setTodayData] = useState<any>(null);
  const [weeklyData, setWeeklyData] = useState<any>(null);
  const [showNotifications, setShowNotifications] = useState(false);

  const fetchTracking = async () => {
    try {
      setLoading(true);
      const [todayRes, weeklyRes] = await Promise.all([
        api.get("/api/v1/track/today"),
        api.get("/api/v1/track/weekly")
      ]);
      setTodayData(todayRes.data);
      setWeeklyData(weeklyRes.data);
    } catch (error) {
      console.error("Tracking fetch error:", error);
    } finally {
      setLoading(false);
    }
  };

  useFocusEffect(
    useCallback(() => {
      fetchTracking();
    }, [])
  );

  const handleTake = async (medicineId: string, name: string) => {
    try {
      await api.post("/api/v1/track/take", { medicine_id: medicineId });
      if (voiceReminders) {
        Speech.speak(`Well done! You've taken your ${name}.`, { rate: 0.9 });
      }
      fetchTracking();
    } catch (error) {
      Alert.alert("Error", "Failed to record intake");
    }
  };

  const groupMedsByTime = (medicines: any[]) => {
    const morning: any[] = [];
    const afternoon: any[] = [];
    const evening: any[] = [];

    medicines.forEach(m => {
      const h = parseInt(m.scheduled_time.split(":")[0]);
      const isPM = m.scheduled_time.includes("PM");
      if ((h >= 6 && h < 12 && !isPM) || (h === 12 && isPM)) morning.push(m);
      else if ((h >= 12 && h < 5 && isPM) || (h === 12 && !isPM)) afternoon.push(m);
      else evening.push(m);
    });

    return { morning, afternoon, evening };
  };

  const grouped = todayData ? groupMedsByTime(todayData.medicines) : { morning: [], afternoon: [], evening: [] };

  const getWeekStrip = () => {
    const days = [];
    const now = new Date();
    for (let i = -2; i <= 2; i++) {
      const d = new Date();
      d.setDate(now.getDate() + i);
      days.push({
        day: d.toLocaleDateString('en-US', { weekday: 'short' }),
        date: d.getDate(),
        isToday: i === 0
      });
    }
    return days;
  };

  const weekStrip = getWeekStrip();

  return (
    <SafeAreaView style={[styles.safe, elderlyMode && { backgroundColor: "#fff" }]}>
      {/* ── Header ── */}
      <View style={styles.header}>
        <View>
          <Text style={[styles.headerTitle, { fontSize: theme.typography.h1.fontSize * fontSizeMultiplier }]}>My Schedule</Text>
          <Text style={[styles.headerSub, { fontSize: 12 * fontSizeMultiplier }]}>Track & analyze your medications</Text>
        </View>
        <TouchableOpacity style={styles.headerIcon} onPress={() => setShowNotifications(true)}>
          <Feather name="bell" size={20 * fontSizeMultiplier} color={theme.colors.primary} />
          {todayData?.missed_count > 0 && <View style={styles.notifDot} />}
        </TouchableOpacity>
      </View>

      {/* ── Tab Toggle ── */}
      <View style={[styles.tabToggle, elderlyMode && styles.tabToggleElderly]}>
        <TouchableOpacity
          style={[styles.tabBtn, activeTab === "schedule" && styles.tabBtnActive]}
          onPress={() => setActiveTab("schedule")}
        >
          <Feather name="calendar" size={14 * fontSizeMultiplier} color={activeTab === "schedule" ? "white" : theme.colors.text.secondary} />
          <Text style={[styles.tabBtnText, activeTab === "schedule" && styles.tabBtnTextActive, { fontSize: 13 * fontSizeMultiplier }]}>Schedule</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.tabBtn, activeTab === "analytics" && styles.tabBtnActive]}
          onPress={() => setActiveTab("analytics")}
        >
          <Feather name="bar-chart-2" size={14 * fontSizeMultiplier} color={activeTab === "analytics" ? "white" : theme.colors.text.secondary} />
          <Text style={[styles.tabBtnText, activeTab === "analytics" && styles.tabBtnTextActive, { fontSize: 13 * fontSizeMultiplier }]}>Analytics</Text>
        </TouchableOpacity>
      </View>

      {loading && !todayData ? (
        <ActivityIndicator size="large" color={theme.colors.primary} style={{ marginTop: 40 }} />
      ) : (
        <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 160, paddingHorizontal: 20 }}>
          {activeTab === "schedule" && (
            <>
              {/* Week strip */}
              <View style={styles.weekStrip}>
                {weekStrip.map((d, i) => (
                  <View key={i} style={[styles.dayPill, d.isToday && styles.dayPillActive]}>
                    <Text style={[styles.dayText, d.isToday && styles.dayTextActive, { fontSize: 12 * fontSizeMultiplier }]}>{d.day}</Text>
                    <Text style={[styles.dateText, d.isToday && styles.dateTextActive, { fontSize: 16 * fontSizeMultiplier }]}>{d.date}</Text>
                  </View>
                ))}
              </View>

              {/* AI Suggestion (Static) */}
              <View style={styles.aiCard}>
                <View style={styles.aiCardLeft}>
                  <MaterialCommunityIcons name="robot-happy-outline" size={18 * fontSizeMultiplier} color={theme.colors.primaryAccent} />
                  <Text style={[styles.aiCardTitle, { fontSize: 13 * fontSizeMultiplier }]}>AI Suggestion</Text>
                </View>
                <Text style={[styles.aiCardText, { fontSize: 12 * fontSizeMultiplier }]}>
                  Your adherence is improving! Consistency in the morning helps maintain stable blood levels of your medications.
                </Text>
              </View>

              {/* Progress bar */}
              <View style={[styles.progressCard, elderlyMode && styles.progressCardElderly]}>
                <View style={styles.progressRow}>
                  <Text style={[styles.progressLabel, { fontSize: 13 * fontSizeMultiplier }]}>Today's Progress</Text>
                  <Text style={[styles.progressCount, { fontSize: 13 * fontSizeMultiplier }]}>
                    {todayData?.taken_count}/{todayData?.total_slots} taken
                  </Text>
                </View>
                <View style={styles.progressBg}>
                  <View
                    style={[
                      styles.progressFill,
                      { width: `${todayData ? (todayData.taken_count / todayData.total_slots) * 100 : 0}%` },
                    ]}
                  />
                </View>
              </View>

              {/* Sections */}
              {grouped.morning.length > 0 && (
                <>
                  <SectionLabel time="MORNING" count={`${grouped.morning.filter(m => m.status === 'taken').length}/${grouped.morning.length}`} />
                  {grouped.morning.map((m: any, idx: number) => (
                    <MedRow key={idx} id={m.medicine_id} name={m.medicine_name} time={m.scheduled_time} icon="pill" color={theme.colors.secondary} status={m.status} onToggle={() => handleTake(m.medicine_id, m.medicine_name)} />
                  ))}
                </>
              )}

              {grouped.afternoon.length > 0 && (
                <>
                  <SectionLabel time="AFTERNOON" count={`${grouped.afternoon.filter(m => m.status === 'taken').length}/${grouped.afternoon.length}`} />
                  {grouped.afternoon.map((m: any, idx: number) => (
                    <MedRow key={idx} id={m.medicine_id} name={m.medicine_name} time={m.scheduled_time} icon="pill" color={theme.colors.primaryAccent} status={m.status} onToggle={() => handleTake(m.medicine_id, m.medicine_name)} />
                  ))}
                </>
              )}

              {grouped.evening.length > 0 && (
                <>
                  <SectionLabel time="EVENING" count={`${grouped.evening.filter(m => m.status === 'taken').length}/${grouped.evening.length}`} />
                  {grouped.evening.map((m: any, idx: number) => (
                    <MedRow key={idx} id={m.medicine_id} name={m.medicine_name} time={m.scheduled_time} icon="moon-waning-crescent" color="#7C3AED" status={m.status} onToggle={() => handleTake(m.medicine_id, m.medicine_name)} />
                  ))}
                </>
              )}

              {/* Settings Card */}
              <View style={[styles.toggleCard, elderlyMode && styles.toggleCardElderly]}>
                {/* Notifications */}
                <View style={styles.toggleRow}>
                  <View style={styles.toggleLeft}>
                    <Ionicons name="notifications-outline" size={20 * fontSizeMultiplier} color={theme.colors.primary} />
                    <View style={{ marginLeft: 12 }}>
                      <Text style={[styles.toggleTitle, { fontSize: 14 * fontSizeMultiplier }]}>Notifications</Text>
                      <Text style={[styles.toggleSub, { fontSize: 12 * fontSizeMultiplier }]}>Daily med alerts</Text>
                    </View>
                  </View>
                  <Switch value={notificationsEnabled} onValueChange={toggleNotifications} trackColor={{ false: theme.colors.border, true: theme.colors.primary }} thumbColor="white" />
                </View>
                <View style={styles.divider} />
                
                {/* Voice Reminders */}
                <View style={styles.toggleRow}>
                  <View style={styles.toggleLeft}>
                    <Ionicons name="volume-high-outline" size={20 * fontSizeMultiplier} color={theme.colors.primary} />
                    <View style={{ marginLeft: 12 }}>
                      <Text style={[styles.toggleTitle, { fontSize: 14 * fontSizeMultiplier }]}>Voice Reminder</Text>
                      <Text style={[styles.toggleSub, { fontSize: 12 * fontSizeMultiplier }]}>Announce due meds</Text>
                    </View>
                  </View>
                  <Switch value={voiceReminders} onValueChange={toggleVoiceReminders} trackColor={{ false: theme.colors.border, true: theme.colors.primary }} thumbColor="white" />
                </View>
                <View style={styles.divider} />

                {/* Elderly Mode */}
                <View style={styles.toggleRow}>
                  <View style={styles.toggleLeft}>
                    <MaterialCommunityIcons name="human-cane" size={20 * fontSizeMultiplier} color={theme.colors.tabInactive} />
                    <View style={{ marginLeft: 12 }}>
                      <Text style={[styles.toggleTitle, { fontSize: 14 * fontSizeMultiplier }]}>Elderly Mode</Text>
                      <Text style={[styles.toggleSub, { fontSize: 12 * fontSizeMultiplier }]}>Larger text & contrast</Text>
                    </View>
                  </View>
                  <Switch value={elderlyMode} onValueChange={toggleElderlyMode} trackColor={{ false: theme.colors.border, true: theme.colors.primary }} thumbColor="white" />
                </View>
              </View>
            </>
          )}

          {activeTab === "analytics" && weeklyData && (
            <>
              {/* Stats row */}
              <View style={styles.statsRow}>
                <View style={styles.statCard}>
                  <Ionicons name="flame-outline" size={18 * fontSizeMultiplier} color={theme.colors.secondary} />
                  <Text style={[styles.statValue, { fontSize: 20 * fontSizeMultiplier }]}>12</Text>
                  <Text style={[styles.statLabel, { fontSize: 11 * fontSizeMultiplier }]}>Day Streak</Text>
                </View>
                <View style={styles.statCard}>
                  <Feather name="check-circle" size={18 * fontSizeMultiplier} color={theme.colors.success} />
                  <Text style={[styles.statValue, { fontSize: 20 * fontSizeMultiplier }]}>{weeklyData.daily_summaries[weeklyData.daily_summaries.length-1]?.taken_count || 0}</Text>
                  <Text style={[styles.statLabel, { fontSize: 11 * fontSizeMultiplier }]}>Taken Today</Text>
                </View>
                <View style={styles.statCard}>
                  <Feather name="trending-up" size={18 * fontSizeMultiplier} color={theme.colors.primaryAccent} />
                  <Text style={[styles.statValue, { fontSize: 20 * fontSizeMultiplier }]}>{Math.round(weeklyData.overall_adherence_pct)}%</Text>
                  <Text style={[styles.statLabel, { fontSize: 11 * fontSizeMultiplier }]}>Adherence</Text>
                </View>
              </View>

              {/* Weekly chart card */}
              <View style={styles.chartCard}>
                <View style={styles.chartHeader}>
                  <Text style={[styles.chartTitle, { fontSize: 14 * fontSizeMultiplier }]}>Weekly Adherence</Text>
                </View>
                <Text style={[styles.chartBig, { fontSize: 32 * fontSizeMultiplier }]}>{Math.round(weeklyData.overall_adherence_pct)}%</Text>
                <BarChart data={weeklyData.daily_summaries} />
              </View>

              {/* Static Insights */}
              <View style={styles.insightCard}>
                <View style={styles.insightHeader}>
                  <MaterialCommunityIcons name="robot-happy-outline" size={16 * fontSizeMultiplier} color="#D97706" />
                  <Text style={[styles.insightTag, { fontSize: 11 * fontSizeMultiplier }]}>AI INSIGHT</Text>
                </View>
                <Text style={[styles.insightTitle, { fontSize: 15 * fontSizeMultiplier }]}>Great Consistency!</Text>
                <Text style={[styles.insightText, { fontSize: 12 * fontSizeMultiplier }]}>
                  Your adherence is higher than 85% of users. Keeping this pace will significantly improve your long-term health outcomes.
                </Text>
              </View>
            </>
          )}
        </ScrollView>
      )}

      {/* Notifications Modal */}
      <Modal visible={showNotifications} transparent animationType="slide">
        <View style={styles.modalBackdrop}>
           <View style={styles.notifSheet}>
              <View style={styles.handle} />
              <View style={styles.notifHeader}>
                 <Text style={styles.notifTitle}>Notifications</Text>
                 <TouchableOpacity onPress={() => setShowNotifications(false)}>
                    <Text style={{ color: theme.colors.primary, fontWeight: '600' }}>Done</Text>
                 </TouchableOpacity>
              </View>
              <ScrollView>
                 {todayData?.medicines.filter((m:any) => m.status === 'missed').map((m:any, i:number) => (
                    <View key={i} style={styles.notifItem}>
                       <View style={styles.missedIcon}>
                          <Feather name="alert-circle" size={20} color={theme.colors.danger} />
                       </View>
                       <View style={{ flex: 1 }}>
                          <Text style={styles.notifMsg}>Missed Dose: {m.medicine_name}</Text>
                          <Text style={styles.notifTime}>Scheduled for {m.scheduled_time}</Text>
                       </View>
                    </View>
                 ))}
                 {todayData?.medicines.filter((m:any) => m.status === 'taken').map((m:any, i:number) => (
                    <View key={i} style={styles.notifItem}>
                       <View style={styles.takenIcon}>
                          <Feather name="check" size={20} color={theme.colors.success} />
                       </View>
                       <View style={{ flex: 1 }}>
                          <Text style={styles.notifMsg}>Took {m.medicine_name}</Text>
                          <Text style={styles.notifTime}>Recorded at {new Date(m.taken_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</Text>
                       </View>
                    </View>
                 ))}
                 {(!todayData || todayData.medicines.length === 0) && (
                    <Text style={styles.emptyNotif}>No recent notifications</Text>
                 )}
              </ScrollView>
           </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: theme.colors.background },
  header: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", paddingHorizontal: 20, paddingTop: 16, paddingBottom: 10 },
  headerTitle: { fontWeight: "700", color: theme.colors.primary },
  headerSub: { color: theme.colors.text.secondary, marginTop: 2 },
  headerIcon: { width: 40, height: 40, borderRadius: 20, backgroundColor: theme.colors.border, alignItems: "center", justifyContent: "center" },
  notifDot: { position: 'absolute', top: 10, right: 10, width: 8, height: 8, borderRadius: 4, backgroundColor: theme.colors.danger, borderWidth: 1.5, borderColor: 'white' },
  
  tabToggle: { flexDirection: "row", backgroundColor: theme.colors.border, borderRadius: 14, marginHorizontal: 20, marginBottom: 16, padding: 4 },
  tabToggleElderly: { backgroundColor: '#E2E8F0', padding: 6, borderRadius: 18 },
  tabBtn: { flex: 1, flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 6, paddingVertical: 10, borderRadius: 11 },
  tabBtnActive: { backgroundColor: theme.colors.primary },
  tabBtnText: { fontWeight: "600", color: theme.colors.text.secondary },
  tabBtnTextActive: { color: "white" },

  weekStrip: { flexDirection: "row", justifyContent: "space-between", marginBottom: 16 },
  dayPill: { alignItems: "center", paddingVertical: 10, paddingHorizontal: 12, borderRadius: 16, backgroundColor: theme.colors.surface, minWidth: 54 },
  dayPillActive: { backgroundColor: theme.colors.primary },
  dayText: { color: theme.colors.text.secondary, fontWeight: "500" },
  dayTextActive: { color: "white" },
  dateText: { fontWeight: "700", color: theme.colors.primary, marginTop: 2 },
  dateTextActive: { color: "white" },

  aiCard: { backgroundColor: "#EFF6FF", borderRadius: 16, padding: 14, marginBottom: 14, borderLeftWidth: 3, borderLeftColor: theme.colors.primaryAccent },
  aiCardLeft: { flexDirection: "row", alignItems: "center", gap: 6, marginBottom: 6 },
  aiCardTitle: { fontWeight: "700", color: theme.colors.primaryAccent },
  aiCardText: { color: "#1E40AF", lineHeight: 18 },

  progressCard: { backgroundColor: theme.colors.surface, borderRadius: 16, padding: 14, marginBottom: 20, ...theme.shadows.sm },
  progressCardElderly: { borderWidth: 2, borderColor: theme.colors.primary, shadowOpacity: 0, elevation: 0 },
  progressRow: { flexDirection: "row", justifyContent: "space-between", marginBottom: 10 },
  progressLabel: { fontWeight: "600", color: theme.colors.primary },
  progressCount: { color: theme.colors.text.secondary },
  progressBg: { height: 8, backgroundColor: theme.colors.border, borderRadius: 4, overflow: "hidden" },
  progressFill: { height: 8, backgroundColor: theme.colors.primary, borderRadius: 4 },

  sectionLabelRow: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 8, marginTop: 4 },
  sectionTime: { fontWeight: "700", color: theme.colors.tabInactive, letterSpacing: 0.5 },
  sectionCount: { color: theme.colors.tabInactive },

  medRow: { flexDirection: "row", alignItems: "center", backgroundColor: theme.colors.surface, borderRadius: 16, padding: 14, marginBottom: 10, shadowColor: "#000", shadowOpacity: 0.03, shadowRadius: 5, elevation: 1, gap: 12 },
  medRowElderly: { padding: 18, borderWidth: 1.5, borderColor: theme.colors.border, shadowOpacity: 0, elevation: 0 },
  medIcon: { width: 42, height: 42, borderRadius: 21, alignItems: "center", justifyContent: "center" },
  medName: { fontWeight: "700", color: theme.colors.text.primary },
  medDose: { color: theme.colors.text.secondary, marginTop: 2 },
  checkCircle: { width: 30, height: 30, borderRadius: 15, borderWidth: 2, borderColor: "#CBD5E1", alignItems: "center", justifyContent: "center" },
  checkCircleDone: { backgroundColor: theme.colors.success, borderColor: theme.colors.success },
  checkCircleMissed: { backgroundColor: theme.colors.danger, borderColor: theme.colors.danger },
  checkCircleElderly: { width: 40, height: 40, borderRadius: 20 },

  toggleCard: { backgroundColor: theme.colors.surface, borderRadius: 20, padding: 16, marginTop: 10, ...theme.shadows.sm },
  toggleCardElderly: { borderWidth: 1.5, borderColor: theme.colors.primary, shadowOpacity: 0, elevation: 0 },
  toggleRow: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", paddingVertical: 6 },
  toggleLeft: { flexDirection: "row", alignItems: "center" },
  toggleTitle: { fontWeight: "600", color: theme.colors.text.primary },
  toggleSub: { color: theme.colors.tabInactive, marginTop: 1 },
  divider: { height: 1, backgroundColor: theme.colors.background, marginVertical: 8 },

  statsRow: { flexDirection: "row", gap: 10, marginBottom: 14 },
  statCard: { flex: 1, backgroundColor: theme.colors.surface, borderRadius: 16, padding: 14, alignItems: "center", gap: 4, ...theme.shadows.sm },
  statCardElderly: { borderWidth: 1.5, borderColor: theme.colors.border, shadowOpacity: 0, elevation: 0 },
  statValue: { fontWeight: "800", color: theme.colors.primary },
  statLabel: { color: theme.colors.text.secondary },

  chartCard: { backgroundColor: theme.colors.surface, borderRadius: 20, padding: 18, marginBottom: 14, ...theme.shadows.sm },
  chartCardElderly: { borderWidth: 1.5, borderColor: theme.colors.border, shadowOpacity: 0, elevation: 0 },
  chartHeader: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 4 },
  chartTitle: { fontWeight: "700", color: theme.colors.text.primary },
  chartBig: { fontWeight: "800", color: theme.colors.primary, marginBottom: 12 },
  barChartRow: { flexDirection: "row", justifyContent: "space-between", alignItems: "flex-end", height: BAR_HEIGHT + 10 },
  barCol: { alignItems: "center", flex: 1 },
  barBg: { width: 22, height: BAR_HEIGHT, backgroundColor: theme.colors.background, borderRadius: 6, justifyContent: "flex-end", overflow: "hidden" },
  barFill: { width: "100%", borderRadius: 6 },
  barLabel: { fontSize: 10, color: theme.colors.tabInactive, marginTop: 4 },

  insightCard: { backgroundColor: "#FFFBEB", borderRadius: 20, padding: 16, marginBottom: 14, borderLeftWidth: 3, borderLeftColor: "#D97706" },
  insightHeader: { flexDirection: "row", alignItems: "center", gap: 6, marginBottom: 4 },
  insightTag: { fontWeight: "700", color: "#D97706", letterSpacing: 0.5 },
  insightTitle: { fontWeight: "700", color: theme.colors.text.primary, marginBottom: 6 },
  insightText: { color: "#78350F", lineHeight: 18, marginBottom: 12 },

  modalBackdrop: { flex: 1, backgroundColor: "rgba(0,0,0,0.5)", justifyContent: "flex-end" },
  notifSheet: { backgroundColor: "white", borderTopLeftRadius: 32, borderTopRightRadius: 32, height: "70%", padding: 24 },
  handle: { width: 40, height: 5, backgroundColor: theme.colors.border, borderRadius: 3, alignSelf: "center", marginBottom: 20 },
  notifHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 },
  notifTitle: { fontSize: 20, fontWeight: '800', color: theme.colors.primary },
  notifItem: { flexDirection: 'row', alignItems: 'center', gap: 16, marginBottom: 20, paddingBottom: 16, borderBottomWidth: 1, borderBottomColor: theme.colors.background },
  missedIcon: { width: 40, height: 40, borderRadius: 20, backgroundColor: theme.colors.dangerLight, alignItems: 'center', justifyContent: 'center' },
  takenIcon: { width: 40, height: 40, borderRadius: 20, backgroundColor: theme.colors.successLight, alignItems: 'center', justifyContent: 'center' },
  notifMsg: { fontSize: 14, fontWeight: '700', color: theme.colors.text.primary },
  notifTime: { fontSize: 12, color: theme.colors.text.secondary, marginTop: 2 },
  emptyNotif: { textAlign: 'center', color: theme.colors.tabInactive, marginTop: 40 }
});
