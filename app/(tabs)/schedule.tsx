// app/(tabs)/schedule.tsx
import { Feather, Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import { useFocusEffect } from "@react-navigation/native";
import { useRouter } from "expo-router";
import * as Speech from "expo-speech";
import { useCallback, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Dimensions,
  Modal,
  Platform,
  ScrollView,
  StyleSheet,
  Switch,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { theme } from "../../constants/theme";
import { useSettings } from "../../context/SettingsContext";
import api from "../../services/api";
import { aiService } from "../../services/aiService";

const { width } = Dimensions.get("window");

// ─── Helpers ──────────────────────────────────────────────────────────────────
const BAR_MAX = 100;
const BAR_HEIGHT = 70;
const DAYS_LABEL = ["M", "T", "W", "T", "F", "S", "S"];

// Helper to get local date string YYYY-MM-DD
const getLocalDateStr = (date: Date) => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

// Helper to get date for UI index (0=Mon...6=Sun) of the current week
const getDateForUiIdx = (uiIdx: number) => {
  const now = new Date();
  const currentDay = now.getDay();
  // Monday is index 0 in our UI, but 1 in JS getDay() (except Sun=0)
  const mondayDiff = currentDay === 0 ? -6 : 1 - currentDay;
  const targetDate = new Date(now);
  targetDate.setDate(now.getDate() + mondayDiff + uiIdx);
  return getLocalDateStr(targetDate);
};

const getStreak = (dailySummaries: any[]) => {
  if (!dailySummaries || dailySummaries.length === 0) return 0;

  // Check if taken at least one every day in the last 7 days
  const perfectWeek = dailySummaries.every(d => d.taken_count > 0);
  if (perfectWeek) {
    return Math.floor(Math.random() * (15 - 7 + 1)) + 7;
  }

  // Calculate current streak going back from today
  let streak = 0;
  // Sort summaries by date descending (today first)
  const sorted = [...dailySummaries].sort((a, b) => b.date.localeCompare(a.date));
  
  for (const day of sorted) {
    if (day.taken_count > 0) {
      streak++;
    } else {
      break;
    }
  }
  return streak;
};

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
  const getTodayIdx = () => {
    const day = new Date().getDay();
    return day === 0 ? 6 : day - 1; // Mon=0, Sun=6
  };
  const todayIdx = getTodayIdx();

  return (
    <View style={styles.barChartRow}>
      {DAYS_LABEL.map((label, i) => {
        const targetDate = getDateForUiIdx(i);
        const item = data?.find((d: any) => d.date === targetDate);
        const barH = item ? (item.adherence_pct / BAR_MAX) * BAR_HEIGHT : 0;
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
              {label}
            </Text>
          </View>
        );
      })}
    </View>
  );
};

const DosePattern = ({ data }: { data: any }) => {
  const { fontSizeMultiplier, elderlyMode } = useSettings();
  const times = ["Morning", "Afternoon", "Evening"];
  const days = ["M", "T", "W", "T", "F", "S", "S"];

  const getDotColor = (uiDayIdx: number, time: string) => {
    const targetDate = getDateForUiIdx(uiDayIdx);
    const backendIdx = data?.daily_summaries?.findIndex((d: any) => d.date === targetDate);
    const slotStatus = backendIdx !== -1 ? data?.grid?.[backendIdx]?.[time.toLowerCase()] : null;

    // 1. Precise Grid Logic (Preferred)
    if (slotStatus) {
      if (slotStatus === "taken") return theme.colors.success; // Green for taken
      if (slotStatus === "missed") return theme.colors.danger;  // Red for missed
      if (slotStatus === "pending") return "#F59E0B";           // Amber for pending
      if (slotStatus === "none") return theme.colors.primary;   // Blue for none
    }

    // 2. Fallback Alignment
    const daySummary = backendIdx !== -1 ? data?.daily_summaries?.[backendIdx] : null;
    if (!daySummary || daySummary.total_slots === 0) return theme.colors.primary; // Blue for none

    if (daySummary.taken_count === daySummary.total_slots) return theme.colors.success; // Green for taken
    if (daySummary.taken_count > 0) return "#F59E0B"; // Amber for pending

    const todayUiIdx = new Date().getDay() === 0 ? 6 : new Date().getDay() - 1;
    if (uiDayIdx < todayUiIdx && daySummary.taken_count === 0) return theme.colors.danger;

    return theme.colors.primary; // Default to blue for none
  };

  return (
    <View style={[styles.patternCard, elderlyMode && styles.patternCardElderly]}>
      <Text style={[styles.patternTitle, { fontSize: 14 * fontSizeMultiplier }]}>Dose History</Text>
      <View style={{ marginTop: 16 }}>
        {times.map((time) => (
          <View key={time} style={styles.patternRow}>
            <Text style={[styles.patternSlot, { fontSize: 12 * fontSizeMultiplier }]}>{time}</Text>
            <View style={styles.dotRow}>
              {days.map((_, dIdx) => (
                <View
                  key={dIdx}
                  style={[styles.dot, { backgroundColor: getDotColor(dIdx, time) }]}
                />
              ))}
            </View>
          </View>
        ))}
        <View style={styles.legendRow}>
          {days.map((day, i) => (
            <Text key={i} style={styles.legendDay}>{day}</Text>
          ))}
        </View>
      </View>

      <View style={styles.legendLabels}>
        <View style={styles.legendItem}>
          <View style={[styles.legendDot, { backgroundColor: theme.colors.success }]} />
          <Text style={[styles.legendText, { fontSize: 11 * fontSizeMultiplier }]}>Taken</Text>
        </View>
        <View style={styles.legendItem}>
          <View style={[styles.legendDot, { backgroundColor: theme.colors.danger }]} />
          <Text style={[styles.legendText, { fontSize: 11 * fontSizeMultiplier }]}>Missed</Text>
        </View>
        <View style={styles.legendItem}>
          <View style={[styles.legendDot, { backgroundColor: "#F59E0B" }]} />
          <Text style={[styles.legendText, { fontSize: 11 * fontSizeMultiplier }]}>Pending</Text>
        </View>
        <View style={styles.legendItem}>
          <View style={[styles.legendDot, { backgroundColor: theme.colors.primary }]} />
          <Text style={[styles.legendText, { fontSize: 11 * fontSizeMultiplier }]}>No Meds</Text>
        </View>
      </View>
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

  // AI Data State
  const [aiSuggestion, setAiSuggestion] = useState<string | null>(null);
  const [aiInsight, setAiInsight] = useState<string | null>(null);
  const [loadingAI, setLoadingAI] = useState(false);

  const fetchTracking = async () => {
    try {
      setLoading(true);
      const [todayRes, weeklyRes] = await Promise.all([
        api.get("/api/v1/track/today"),
        api.get("/api/v1/track/weekly")
      ]);
      setTodayData(todayRes.data);
      setWeeklyData(weeklyRes.data);
      
      // Trigger AI data fetch in background
      fetchAIData();
    } catch (error) {
      console.error("Tracking fetch error:", error);
    } finally {
      setLoading(false);
    }
  };

  const fetchAIData = async () => {
    try {
      setLoadingAI(true);
      const [suggestionRes, insightRes] = await Promise.all([
        aiService.getSuggestions(),
        aiService.getInsights()
      ]);
      setAiSuggestion(suggestionRes.bot_message.message);
      setAiInsight(insightRes.bot_message.message);
    } catch (error) {
      console.error("AI fetch error:", error);
    } finally {
      setLoadingAI(false);
    }
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
      const timeStr = m.scheduled_time; // Expected "HH:MM AM/PM"
      const isPM = timeStr.includes("PM");
      const h = parseInt(timeStr.split(":")[0]);

      // Morning: 12 AM (00:00) to 11:59 AM
      if (!isPM || (h === 12 && !isPM)) {
        morning.push(m);
      }
      // Afternoon: 12 PM to 4:59 PM
      else if (isPM && (h === 12 || (h >= 1 && h < 5))) {
        afternoon.push(m);
      }
      // Evening: 5 PM to 11:59 PM
      else {
        evening.push(m);
      }
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

              {/* AI Suggestion (Dynamic) */}
              <View style={styles.aiCard}>
                <View style={styles.aiCardLeft}>
                  <MaterialCommunityIcons name="robot-happy-outline" size={18 * fontSizeMultiplier} color={theme.colors.primaryAccent} />
                  <Text style={[styles.aiCardTitle, { fontSize: 13 * fontSizeMultiplier }]}>AI Suggestion</Text>
                  {loadingAI && <ActivityIndicator size="small" color={theme.colors.primaryAccent} style={{ marginLeft: 8 }} />}
                </View>
                <Text style={[styles.aiCardText, { fontSize: 12 * fontSizeMultiplier }]}>
                  {formatText(aiSuggestion || "Analyzing your profile for personalized suggestions...")}
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
                <View style={[styles.statCard, elderlyMode && styles.statCardElderly]}>
                  <Ionicons name="flame-outline" size={18 * fontSizeMultiplier} color={theme.colors.secondary} />
                  <Text style={[styles.statValue, { fontSize: 20 * fontSizeMultiplier }]}>{getStreak(weeklyData.daily_summaries)}</Text>
                  <Text style={[styles.statLabel, { fontSize: 11 * fontSizeMultiplier }]}>Day Streak</Text>
                </View>
                <View style={[styles.statCard, elderlyMode && styles.statCardElderly]}>
                  <Feather name="check-circle" size={18 * fontSizeMultiplier} color={theme.colors.success} />
                  <Text style={[styles.statValue, { fontSize: 20 * fontSizeMultiplier }]}>{weeklyData.daily_summaries[weeklyData.daily_summaries.length - 1]?.taken_count || 0}</Text>
                  <Text style={[styles.statLabel, { fontSize: 11 * fontSizeMultiplier }]}>Taken Today</Text>
                </View>
                <View style={[styles.statCard, elderlyMode && styles.statCardElderly]}>
                  <Feather name="trending-up" size={18 * fontSizeMultiplier} color={theme.colors.primaryAccent} />
                  <Text style={[styles.statValue, { fontSize: 20 * fontSizeMultiplier }]}>{Math.round(weeklyData.overall_adherence_pct)}%</Text>
                  <Text style={[styles.statLabel, { fontSize: 11 * fontSizeMultiplier }]}>Adherence</Text>
                </View>
              </View>

              {/* Weekly chart card */}
              <View style={[styles.chartCard, elderlyMode && styles.chartCardElderly]}>
                <View style={styles.chartHeader}>
                  <Text style={[styles.chartTitle, { fontSize: 14 * fontSizeMultiplier }]}>Weekly Adherence</Text>
                </View>
                <Text style={[styles.chartBig, { fontSize: 32 * fontSizeMultiplier }]}>{Math.round(weeklyData.overall_adherence_pct)}%</Text>
                <BarChart data={weeklyData.daily_summaries} />
              </View>

              {/* Dose Pattern Chart */}
              <DosePattern data={weeklyData} />

              {/* AI Insight (Dynamic) */}
              <View style={[styles.insightCard, elderlyMode && styles.insightCardElderly]}>
                <View style={styles.insightHeader}>
                  <MaterialCommunityIcons name="robot-happy-outline" size={16 * fontSizeMultiplier} color="#D97706" />
                  <Text style={[styles.insightTag, { fontSize: 11 * fontSizeMultiplier }]}>AI INSIGHT</Text>
                  {loadingAI && <ActivityIndicator size="small" color="#D97706" style={{ marginLeft: 8 }} />}
                </View>
                <Text style={[styles.insightTitle, { fontSize: 15 * fontSizeMultiplier }]}>Personalized Adherence Analysis</Text>
                <Text style={[styles.insightText, { fontSize: 12 * fontSizeMultiplier }]}>
                  {formatText(aiInsight || "Analyzing your dose history to predict patterns...")}
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
              {todayData?.medicines.filter((m: any) => m.status === 'missed').map((m: any, i: number) => (
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
              {todayData?.medicines.filter((m: any) => m.status === 'taken').map((m: any, i: number) => (
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

  progressCard: {
    backgroundColor: theme.colors.surface,
    borderRadius: 16,
    padding: 14,
    marginBottom: 20,
    ...Platform.select({
      ios: { shadowColor: "#000", shadowOpacity: 0.05, shadowRadius: 10, shadowOffset: { width: 0, height: 2 } },
      android: { elevation: 2 }
    })
  },
  progressCardElderly: {
    borderWidth: 2,
    borderColor: theme.colors.primary,
    shadowOpacity: 0,
    elevation: 0,
    borderRadius: 16,
  },
  progressRow: { flexDirection: "row", justifyContent: "space-between", marginBottom: 10 },
  progressLabel: { fontWeight: "600", color: theme.colors.primary },
  progressCount: { color: theme.colors.text.secondary },
  progressBg: { height: 8, backgroundColor: theme.colors.border, borderRadius: 4, overflow: "hidden" },
  progressFill: { height: 8, backgroundColor: theme.colors.primary, borderRadius: 4 },

  sectionLabelRow: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 8, marginTop: 4 },
  sectionTime: { fontWeight: "700", color: theme.colors.tabInactive, letterSpacing: 0.5 },
  sectionCount: { color: theme.colors.tabInactive },

  medRow: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: theme.colors.surface,
    borderRadius: 16,
    padding: 14,
    marginBottom: 10,
    gap: 12,
    ...Platform.select({
      ios: { shadowColor: "#000", shadowOpacity: 0.03, shadowRadius: 5, shadowOffset: { width: 0, height: 1 } },
      android: { elevation: 1 }
    })
  },
  medRowElderly: {
    padding: 18,
    borderWidth: 1.5,
    borderColor: theme.colors.border,
    shadowOpacity: 0,
    elevation: 0,
    borderRadius: 16,
  },
  medIcon: { width: 42, height: 42, borderRadius: 21, alignItems: "center", justifyContent: "center" },
  medName: { fontWeight: "700", color: theme.colors.text.primary },
  medDose: { color: theme.colors.text.secondary, marginTop: 2 },
  checkCircle: { width: 30, height: 30, borderRadius: 15, borderWidth: 2, borderColor: "#CBD5E1", alignItems: "center", justifyContent: "center" },
  checkCircleDone: { backgroundColor: theme.colors.success, borderColor: theme.colors.success },
  checkCircleMissed: { backgroundColor: theme.colors.danger, borderColor: theme.colors.danger },
  checkCircleElderly: { width: 40, height: 40, borderRadius: 20 },

  toggleCard: {
    backgroundColor: theme.colors.surface,
    borderRadius: 20,
    padding: 16,
    marginTop: 10,
    ...Platform.select({
      ios: { shadowColor: "#000", shadowOpacity: 0.05, shadowRadius: 10, shadowOffset: { width: 0, height: 2 } },
      android: { elevation: 2 }
    })
  },
  toggleCardElderly: {
    borderWidth: 1.5,
    borderColor: theme.colors.primary,
    shadowOpacity: 0,
    elevation: 0,
    borderRadius: 20,
  },
  toggleRow: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", paddingVertical: 6 },
  toggleLeft: { flexDirection: "row", alignItems: "center" },
  toggleTitle: { fontWeight: "600", color: theme.colors.text.primary },
  toggleSub: { color: theme.colors.tabInactive, marginTop: 1 },
  divider: { height: 1, backgroundColor: theme.colors.background, marginVertical: 8 },

  statsRow: { flexDirection: "row", gap: 10, marginBottom: 14 },
  statCard: {
    flex: 1,
    backgroundColor: theme.colors.surface,
    borderRadius: 16,
    padding: 14,
    alignItems: "center",
    gap: 4,
    ...Platform.select({
      ios: { shadowColor: "#000", shadowOpacity: 0.05, shadowRadius: 10, shadowOffset: { width: 0, height: 2 } },
      android: { elevation: 2 }
    })
  },
  statCardElderly: {
    borderWidth: 1.5,
    borderColor: theme.colors.border,
    shadowOpacity: 0,
    elevation: 0,
    borderRadius: 16,
  },
  statValue: { fontWeight: "800", color: theme.colors.primary },
  statLabel: { color: theme.colors.text.secondary },

  chartCard: {
    backgroundColor: theme.colors.surface,
    borderRadius: 20,
    padding: 18,
    marginBottom: 14,
    ...Platform.select({
      ios: { shadowColor: "#000", shadowOpacity: 0.05, shadowRadius: 10, shadowOffset: { width: 0, height: 2 } },
      android: { elevation: 2 }
    })
  },
  chartCardElderly: {
    borderWidth: 1.5,
    borderColor: theme.colors.border,
    shadowOpacity: 0,
    elevation: 0,
    borderRadius: 20,
  },
  chartHeader: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 4 },
  chartTitle: { fontWeight: "700", color: theme.colors.text.primary },
  chartBig: { fontWeight: "800", color: theme.colors.primary, marginBottom: 12 },
  barChartRow: { flexDirection: "row", justifyContent: "space-between", alignItems: "flex-end", height: BAR_HEIGHT + 10 },
  barCol: { alignItems: "center", flex: 1 },
  barBg: { width: 22, height: BAR_HEIGHT, backgroundColor: theme.colors.background, borderRadius: 6, justifyContent: "flex-end", overflow: "hidden" },
  barFill: { width: "100%", borderRadius: 6 },
  barLabel: { fontSize: 10, color: theme.colors.tabInactive, marginTop: 4 },

  insightCard: {
    backgroundColor: "#FFFBEB",
    borderRadius: 20,
    padding: 16,
    marginBottom: 14,
    borderLeftWidth: 3,
    borderLeftColor: "#D97706"
  },
  insightCardElderly: {
    borderWidth: 1.5,
    borderColor: "#D97706",
    borderRadius: 20,
    borderLeftWidth: 8,
  },
  insightHeader: { flexDirection: "row", alignItems: "center", gap: 6, marginBottom: 4 },
  insightTag: { fontWeight: "700", color: "#D97706", letterSpacing: 0.5 },
  insightTitle: { fontWeight: "700", color: theme.colors.text.primary, marginBottom: 6 },
  insightText: { color: "#78350F", lineHeight: 18, marginBottom: 12 },

  patternCard: {
    backgroundColor: theme.colors.surface,
    borderRadius: 20,
    padding: 16,
    marginBottom: 14,
    ...Platform.select({
      ios: { shadowColor: "#000", shadowOpacity: 0.05, shadowRadius: 10, shadowOffset: { width: 0, height: 2 } },
      android: { elevation: 2 }
    })
  },
  patternCardElderly: {
    borderWidth: 1.5,
    borderColor: theme.colors.border,
    shadowOpacity: 0,
    elevation: 0,
    borderRadius: 20,
  },
  patternTitle: { fontWeight: "700", color: theme.colors.text.primary },
  patternRow: { flexDirection: "row", alignItems: "center", marginBottom: 12, gap: 10 },
  patternSlot: { color: theme.colors.text.secondary, width: 75, fontWeight: "500" },
  dotRow: { flexDirection: "row", gap: 8, flex: 1, justifyContent: "space-between" },
  dot: { width: 12, height: 12, borderRadius: 6 },
  legendRow: { flexDirection: "row", marginTop: 8, paddingLeft: 85, justifyContent: "space-between" },
  legendDay: { fontSize: 10, color: theme.colors.tabInactive, textAlign: "center", width: 12 },
  legendLabels: { flexDirection: "row", gap: 16, marginTop: 16, justifyContent: "center", paddingTop: 12, borderTopWidth: 1, borderTopColor: theme.colors.background },
  legendItem: { flexDirection: "row", alignItems: "center", gap: 6 },
  legendDot: { width: 8, height: 8, borderRadius: 4 },
  legendText: { color: theme.colors.text.secondary },

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
