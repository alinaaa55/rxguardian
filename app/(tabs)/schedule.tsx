// app/(tabs)/schedule.tsx
import { Feather, Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { useState } from "react";
import {
  Dimensions,
  ScrollView,
  StyleSheet,
  Switch,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { theme } from "../../constants/theme";

const { width } = Dimensions.get("window");

// ─── Data ─────────────────────────────────────────────────────────────────────
const WEEK_DAYS = [
  { day: "Mon", date: 21 },
  { day: "Tue", date: 22 },
  { day: "Wed", date: 23, active: true },
  { day: "Thu", date: 24 },
  { day: "Fri", date: 25 },
];

const ANALYTICS = {
  streak: 12,
  taken: "24/26",
  weeklyAdherence: 92,
  trend: "+2.4%",
  weekChart: [60, 80, 70, 90, 85, 92, 88], // Mon–Sun values
  dosePatterns: {
    morning: [true, true, false, true, true, true, false],
    afternoon: [true, false, true, true, true, false, true],
    evening: [false, true, true, true, false, true, true],
  },
};

const SCHEDULE = {
  morning: [
    {
      id: "1",
      name: "Lipitor",
      dose: "20mg • Take with breakfast",
      icon: "pill",
      color: theme.colors.secondary,
      taken: false,
    },
    {
      id: "2",
      name: "Vitamin D",
      dose: "1000 IU • After meal",
      icon: "white-balance-sunny",
      color: "#EAB308",
      taken: true,
    },
  ],
  afternoon: [
    {
      id: "3",
      name: "Metformin",
      dose: "500mg • Take with Lunch",
      icon: "pill",
      color: theme.colors.primaryAccent,
      taken: true,
    },
  ],
  evening: [
    {
      id: "4",
      name: "Lisinopril",
      dose: "10mg • Before bed",
      icon: "moon-waning-crescent",
      color: "#7C3AED",
      taken: false,
    },
  ],
};

const DAYS_LABEL = ["M", "T", "W", "T", "F", "S", "S"];

// ─── Helpers ──────────────────────────────────────────────────────────────────
const BAR_MAX = 100;
const BAR_HEIGHT = 70;

// ─── Sub-components ───────────────────────────────────────────────────────────
type MedRowProps = {
  name: string;
  dose: string;
  icon: string;
  color: string;
  taken: boolean;
  onToggle: () => void;
};

const MedRow = ({ name, dose, icon, color, taken, onToggle }: MedRowProps) => (
  <View style={styles.medRow}>
    <View style={[styles.medIcon, { backgroundColor: color + "22" }]}>
      <MaterialCommunityIcons name={icon as any} size={20} color={color} />
    </View>
    <View style={{ flex: 1 }}>
      <Text style={styles.medName}>{name}</Text>
      <Text style={styles.medDose}>{dose}</Text>
    </View>
    <TouchableOpacity
      onPress={onToggle}
      style={[styles.checkCircle, taken && styles.checkCircleDone]}
    >
      {taken && <Feather name="check" size={14} color={theme.colors.surface} />}
    </TouchableOpacity>
  </View>
);

const SectionLabel = ({ time, count }: { time: string; count: string }) => (
  <View style={styles.sectionLabelRow}>
    <Text style={styles.sectionTime}>{time}</Text>
    <Text style={styles.sectionCount}>{count}</Text>
  </View>
);

// ─── Mini bar chart ───────────────────────────────────────────────────────────
const BarChart = ({ data }: { data: number[] }) => (
  <View style={styles.barChartRow}>
    {data.map((val, i) => {
      const isToday = i === 2; // Wednesday
      const barH = (val / BAR_MAX) * BAR_HEIGHT;
      return (
        <View key={i} style={styles.barCol}>
          <View style={styles.barBg}>
            <View
              style={[
                styles.barFill,
                {
                  height: barH,
                  backgroundColor: isToday ? theme.colors.primary : "#BFDBFE",
                },
              ]}
            />
          </View>
          <Text
            style={[
              styles.barLabel,
              isToday && { color: theme.colors.primary, fontWeight: "700" },
            ]}
          >
            {DAYS_LABEL[i]}
          </Text>
        </View>
      );
    })}
  </View>
);

// ─── Dose pattern dots ────────────────────────────────────────────────────────
const DotRow = ({ taken }: { taken: boolean[] }) => (
  <View style={styles.dotRow}>
    {taken.map((t, i) => (
      <View
        key={i}
        style={[styles.dot, { backgroundColor: t ? theme.colors.primary : "#FCA5A5" }]}
      />
    ))}
  </View>
);

// ─── Main Screen ──────────────────────────────────────────────────────────────
export default function ScheduleScreen() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<"schedule" | "analytics">(
    "schedule",
  );
  const [selectedDay, setSelectedDay] = useState(2); // Wednesday

  const [schedule, setSchedule] = useState(SCHEDULE);

  const toggleMed = (section: keyof typeof SCHEDULE, id: string) => {
    setSchedule((prev) => ({
      ...prev,
      [section]: prev[section].map((m) =>
        m.id === id ? { ...m, taken: !m.taken } : m,
      ),
    }));
  };

  const takenCount = [
    ...schedule.morning,
    ...schedule.afternoon,
    ...schedule.evening,
  ].filter((m) => m.taken).length;

  const totalCount =
    schedule.morning.length +
    schedule.afternoon.length +
    schedule.evening.length;

  return (
    <SafeAreaView style={styles.safe}>
      {/* ── Header ── */}
      <View style={styles.header}>
        <View>
          <Text style={styles.headerTitle}>My Schedule</Text>
          <Text style={styles.headerSub}>Track & analyze your medications</Text>
        </View>
        <TouchableOpacity style={styles.headerIcon}>
          <Feather name="bell" size={20} color={theme.colors.primary} />
        </TouchableOpacity>
      </View>

      {/* ── Tab Toggle ── */}
      <View style={styles.tabToggle}>
        <TouchableOpacity
          style={[
            styles.tabBtn,
            activeTab === "schedule" && styles.tabBtnActive,
          ]}
          onPress={() => setActiveTab("schedule")}
        >
          <Feather
            name="calendar"
            size={14}
            color={activeTab === "schedule" ? theme.colors.surface : theme.colors.text.secondary}
          />
          <Text
            style={[
              styles.tabBtnText,
              activeTab === "schedule" && styles.tabBtnTextActive,
            ]}
          >
            Schedule
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[
            styles.tabBtn,
            activeTab === "analytics" && styles.tabBtnActive,
          ]}
          onPress={() => setActiveTab("analytics")}
        >
          <Feather
            name="bar-chart-2"
            size={14}
            color={activeTab === "analytics" ? theme.colors.surface : theme.colors.text.secondary}
          />
          <Text
            style={[
              styles.tabBtnText,
              activeTab === "analytics" && styles.tabBtnTextActive,
            ]}
          >
            Analytics
          </Text>
        </TouchableOpacity>
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 160, paddingHorizontal: 20 }}
      >
        {/* ════════════════ SCHEDULE TAB ════════════════ */}
        {activeTab === "schedule" && (
          <>
            {/* Week strip */}
            <View style={styles.weekStrip}>
              {WEEK_DAYS.map((d, i) => (
                <TouchableOpacity
                  key={i}
                  style={[
                    styles.dayPill,
                    selectedDay === i && styles.dayPillActive,
                  ]}
                  onPress={() => setSelectedDay(i)}
                >
                  <Text
                    style={[
                      styles.dayText,
                      selectedDay === i && styles.dayTextActive,
                    ]}
                  >
                    {d.day}
                  </Text>
                  <Text
                    style={[
                      styles.dateText,
                      selectedDay === i && styles.dateTextActive,
                    ]}
                  >
                    {d.date}
                  </Text>
                  {d.active && <View style={styles.activeDot} />}
                </TouchableOpacity>
              ))}
            </View>

            {/* AI Suggestion */}
            <View style={styles.aiCard}>
              <View style={styles.aiCardLeft}>
                <MaterialCommunityIcons
                  name="robot-happy-outline"
                  size={18}
                  color={theme.colors.primaryAccent}
                />
                <Text style={styles.aiCardTitle}>AI Suggestion</Text>
              </View>
              <TouchableOpacity>
                <Feather name="x" size={16} color={theme.colors.tabInactive} />
              </TouchableOpacity>
              <Text style={styles.aiCardText}>
                Consider spacing your Lipitor and Vitamin D by at least 2 hours
                for optimal absorption.
              </Text>
            </View>

            {/* Progress bar */}
            <View style={styles.progressCard}>
              <View style={styles.progressRow}>
                <Text style={styles.progressLabel}>Today's Progress</Text>
                <Text style={styles.progressCount}>
                  {takenCount}/{totalCount} taken
                </Text>
              </View>
              <View style={styles.progressBg}>
                <View
                  style={[
                    styles.progressFill,
                    { width: `${(takenCount / totalCount) * 100}%` },
                  ]}
                />
              </View>
            </View>

            {/* MORNING */}
            <SectionLabel
              time="MORNING  •  08:00 AM"
              count={`${schedule.morning.filter((m) => m.taken).length}/${schedule.morning.length}`}
            />
            {schedule.morning.map((med) => (
              <MedRow
                key={med.id}
                {...med}
                onToggle={() => toggleMed("morning", med.id)}
              />
            ))}

            {/* AFTERNOON */}
            <SectionLabel
              time="AFTERNOON  •  01:00 PM"
              count={`${schedule.afternoon.filter((m) => m.taken).length}/${schedule.afternoon.length}`}
            />
            {schedule.afternoon.map((med) => (
              <MedRow
                key={med.id}
                {...med}
                onToggle={() => toggleMed("afternoon", med.id)}
              />
            ))}

            {/* EVENING */}
            <SectionLabel
              time="EVENING  •  09:00 PM"
              count={`${schedule.evening.filter((m) => m.taken).length}/${schedule.evening.length}`}
            />
            {schedule.evening.map((med) => (
              <MedRow
                key={med.id}
                {...med}
                onToggle={() => toggleMed("evening", med.id)}
              />
            ))}

            {/* Voice & Elderly toggles */}
            <View style={styles.toggleCard}>
              <View style={styles.toggleRow}>
                <View style={styles.toggleLeft}>
                  <Ionicons
                    name="volume-high-outline"
                    size={20}
                    color={theme.colors.primary}
                  />
                  <View style={{ marginLeft: 12 }}>
                    <Text style={styles.toggleTitle}>Voice Reminder</Text>
                    <Text style={styles.toggleSub}>Announce due meds</Text>
                  </View>
                </View>
                <Switch
                  value={true}
                  trackColor={{ false: theme.colors.border, true: theme.colors.primary }}
                  thumbColor={theme.colors.surface}
                />
              </View>
              <View style={styles.divider} />
              <View style={styles.toggleRow}>
                <View style={styles.toggleLeft}>
                  <MaterialCommunityIcons
                    name="human-cane"
                    size={20}
                    color={theme.colors.tabInactive}
                  />
                  <View style={{ marginLeft: 12 }}>
                    <Text style={styles.toggleTitle}>Elderly Mode</Text>
                    <Text style={styles.toggleSub}>Larger text & contrast</Text>
                  </View>
                </View>
                <Switch
                  value={false}
                  trackColor={{ false: theme.colors.border, true: theme.colors.primary }}
                  thumbColor={theme.colors.surface}
                />
              </View>
            </View>
          </>
        )}

        {/* ════════════════ ANALYTICS TAB ════════════════ */}
        {activeTab === "analytics" && (
          <>
            {/* Stats row */}
            <View style={styles.statsRow}>
              <View style={styles.statCard}>
                <Ionicons name="flame-outline" size={18} color={theme.colors.secondary} />
                <Text style={styles.statValue}>{ANALYTICS.streak}</Text>
                <Text style={styles.statLabel}>Day Streak</Text>
              </View>
              <View style={styles.statCard}>
                <Feather name="check-circle" size={18} color={theme.colors.success} />
                <Text style={styles.statValue}>{ANALYTICS.taken}</Text>
                <Text style={styles.statLabel}>Taken</Text>
              </View>
              <View style={styles.statCard}>
                <Feather name="trending-up" size={18} color={theme.colors.primaryAccent} />
                <Text style={styles.statValue}>
                  {ANALYTICS.weeklyAdherence}%
                </Text>
                <Text style={styles.statLabel}>Adherence</Text>
              </View>
            </View>

            {/* Weekly chart card */}
            <View style={styles.chartCard}>
              <View style={styles.chartHeader}>
                <Text style={styles.chartTitle}>Weekly Adherence</Text>
                <View style={styles.trendBadge}>
                  <Feather name="arrow-up-right" size={12} color={theme.colors.success} />
                  <Text style={styles.trendText}>{ANALYTICS.trend}</Text>
                </View>
              </View>
              <Text style={styles.chartBig}>{ANALYTICS.weeklyAdherence}%</Text>
              <BarChart data={ANALYTICS.weekChart} />
              <View style={styles.chartDayLabels}>
                {["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"].map(
                  (d, i) => (
                    <Text
                      key={i}
                      style={[
                        styles.chartDayLabel,
                        i === 2 && { color: theme.colors.primary, fontWeight: "700" },
                      ]}
                    >
                      {d}
                    </Text>
                  ),
                )}
              </View>
            </View>

            {/* AI Risk insight */}
            <View style={styles.insightCard}>
              <View style={styles.insightHeader}>
                <MaterialCommunityIcons
                  name="robot-happy-outline"
                  size={16}
                  color="#D97706"
                />
                <Text style={styles.insightTag}>AI INSIGHT</Text>
              </View>
              <Text style={styles.insightTitle}>Risk Alert: Evening Doses</Text>
              <Text style={styles.insightText}>
                Based on your recent activity patterns, our AI predicts a{" "}
                <Text style={{ color: theme.colors.danger, fontWeight: "700" }}>
                  68% chance
                </Text>{" "}
                of missing doses after 6 PM this week.
              </Text>
              <TouchableOpacity style={styles.insightBtn}>
                <Ionicons name="alarm-outline" size={14} color="#D97706" />
                <Text style={styles.insightBtnText}>Set Reminder</Text>
              </TouchableOpacity>
            </View>

            {/* Dose Patterns */}
            <View style={styles.patternCard}>
              <View style={styles.patternHeaderRow}>
                <Text style={styles.patternTitle}>Dose Patterns</Text>
                <Ionicons
                  name="information-circle-outline"
                  size={18}
                  color={theme.colors.tabInactive}
                />
              </View>

              {(["morning", "afternoon", "evening"] as const).map((slot) => (
                <View key={slot} style={styles.patternRow}>
                  <Text style={styles.patternSlot}>
                    {slot.charAt(0).toUpperCase() + slot.slice(1)}
                  </Text>
                  <DotRow taken={ANALYTICS.dosePatterns[slot]} />
                </View>
              ))}

              {/* Legend */}
              <View style={styles.legendRow}>
                {["M", "T", "W", "T", "F", "S", "S"].map((d, i) => (
                  <Text key={i} style={styles.legendDay}>
                    {d}
                  </Text>
                ))}
              </View>
              <View style={styles.legendLabels}>
                <View style={styles.legendItem}>
                  <View
                    style={[styles.legendDot, { backgroundColor: theme.colors.primary }]}
                  />
                  <Text style={styles.legendText}>Taken</Text>
                </View>
                <View style={styles.legendItem}>
                  <View
                    style={[styles.legendDot, { backgroundColor: "#FCA5A5" }]}
                  />
                  <Text style={styles.legendText}>Missed</Text>
                </View>
              </View>
            </View>
          </>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

// ─── Styles ───────────────────────────────────────────────────────────────────
const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: theme.colors.background },

  // Header
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 10,
  },
  headerTitle: { fontSize: theme.typography.h1.fontSize, fontWeight: theme.typography.h1.fontWeight, color: theme.colors.primary },
  headerSub: { fontSize: 12, color: theme.colors.text.secondary, marginTop: 2 },
  headerIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: theme.colors.border,
    alignItems: "center",
    justifyContent: "center",
  },

  // Tab toggle
  tabToggle: {
    flexDirection: "row",
    backgroundColor: theme.colors.border,
    borderRadius: 14,
    marginHorizontal: 20,
    marginBottom: 16,
    padding: 4,
  },
  tabBtn: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
    paddingVertical: 10,
    borderRadius: 11,
  },
  tabBtnActive: { backgroundColor: theme.colors.primary },
  tabBtnText: { fontSize: 13, fontWeight: "600", color: theme.colors.text.secondary },
  tabBtnTextActive: { color: theme.colors.surface },

  // Week strip
  weekStrip: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 16,
  },
  dayPill: {
    alignItems: "center",
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderRadius: 16,
    backgroundColor: theme.colors.surface,
    minWidth: 54,
  },
  dayPillActive: { backgroundColor: theme.colors.primary },
  dayText: { fontSize: 12, color: theme.colors.text.secondary, fontWeight: "500" },
  dayTextActive: { color: theme.colors.surface },
  dateText: { fontSize: 16, fontWeight: "700", color: theme.colors.primary, marginTop: 2 },
  dateTextActive: { color: theme.colors.surface },
  activeDot: {
    width: 5,
    height: 5,
    borderRadius: 3,
    backgroundColor: theme.colors.successLight,
    marginTop: 3,
  },

  // AI Card
  aiCard: {
    backgroundColor: "#EFF6FF",
    borderRadius: 16,
    padding: 14,
    marginBottom: 14,
    borderLeftWidth: 3,
    borderLeftColor: theme.colors.primaryAccent,
    flexWrap: "wrap",
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 4,
  },
  aiCardLeft: { flexDirection: "row", alignItems: "center", gap: 6, flex: 1 },
  aiCardTitle: { fontSize: 13, fontWeight: "700", color: theme.colors.primaryAccent },
  aiCardText: {
    fontSize: 12,
    color: "#1E40AF",
    lineHeight: 18,
    width: "100%",
    marginTop: 6,
  },

  // Progress
  progressCard: {
    backgroundColor: theme.colors.surface,
    borderRadius: 16,
    padding: 14,
    marginBottom: 20,
    ...theme.shadows.sm,
  },
  progressRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 10,
  },
  progressLabel: { fontSize: 13, fontWeight: "600", color: theme.colors.primary },
  progressCount: { fontSize: 13, color: theme.colors.text.secondary },
  progressBg: {
    height: 8,
    backgroundColor: theme.colors.border,
    borderRadius: 4,
    overflow: "hidden",
  },
  progressFill: { height: 8, backgroundColor: theme.colors.primary, borderRadius: 4 },

  // Section label
  sectionLabelRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 8,
    marginTop: 4,
  },
  sectionTime: {
    fontSize: 11,
    fontWeight: "700",
    color: theme.colors.tabInactive,
    letterSpacing: 0.5,
  },
  sectionCount: { fontSize: 11, color: theme.colors.tabInactive },

  // Med row
  medRow: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: theme.colors.surface,
    borderRadius: 16,
    padding: 14,
    marginBottom: 10,
    shadowColor: "#000",
    shadowOpacity: 0.03,
    shadowRadius: 5,
    elevation: 1,
    gap: 12,
  },
  medIcon: {
    width: 42,
    height: 42,
    borderRadius: 21,
    alignItems: "center",
    justifyContent: "center",
  },
  medName: { fontSize: 14, fontWeight: "700", color: theme.colors.text.primary },
  medDose: { fontSize: 12, color: theme.colors.text.secondary, marginTop: 2 },
  checkCircle: {
    width: 30,
    height: 30,
    borderRadius: 15,
    borderWidth: 2,
    borderColor: "#CBD5E1",
    alignItems: "center",
    justifyContent: "center",
  },
  checkCircleDone: { backgroundColor: theme.colors.success, borderColor: theme.colors.success },

  // Toggle card
  toggleCard: {
    backgroundColor: theme.colors.surface,
    borderRadius: 20,
    padding: 16,
    marginTop: 10,
    ...theme.shadows.sm,
  },
  toggleRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: 6,
  },
  toggleLeft: { flexDirection: "row", alignItems: "center" },
  toggleTitle: { fontSize: 14, fontWeight: "600", color: theme.colors.text.primary },
  toggleSub: { fontSize: 12, color: theme.colors.tabInactive, marginTop: 1 },
  divider: { height: 1, backgroundColor: theme.colors.background, marginVertical: 8 },

  // Stats row
  statsRow: {
    flexDirection: "row",
    gap: 10,
    marginBottom: 14,
  },
  statCard: {
    flex: 1,
    backgroundColor: theme.colors.surface,
    borderRadius: 16,
    padding: 14,
    alignItems: "center",
    gap: 4,
    ...theme.shadows.sm,
  },
  statValue: { fontSize: 20, fontWeight: "800", color: theme.colors.primary },
  statLabel: { fontSize: 11, color: theme.colors.text.secondary },

  // Chart card
  chartCard: {
    backgroundColor: theme.colors.surface,
    borderRadius: 20,
    padding: 18,
    marginBottom: 14,
    ...theme.shadows.sm,
  },
  chartHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 4,
  },
  chartTitle: { fontSize: 14, fontWeight: "700", color: theme.colors.text.primary },
  trendBadge: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: theme.colors.successLight,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 10,
    gap: 2,
  },
  trendText: { fontSize: 11, color: theme.colors.success, fontWeight: "600" },
  chartBig: {
    fontSize: 32,
    fontWeight: "800",
    color: theme.colors.primary,
    marginBottom: 12,
  },
  barChartRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-end",
    height: BAR_HEIGHT + 10,
  },
  barCol: { alignItems: "center", flex: 1 },
  barBg: {
    width: 22,
    height: BAR_HEIGHT,
    backgroundColor: theme.colors.background,
    borderRadius: 6,
    justifyContent: "flex-end",
    overflow: "hidden",
  },
  barFill: { width: "100%", borderRadius: 6 },
  barLabel: { fontSize: 10, color: theme.colors.tabInactive, marginTop: 4 },
  chartDayLabels: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 6,
  },
  chartDayLabel: {
    fontSize: 10,
    color: theme.colors.tabInactive,
    flex: 1,
    textAlign: "center",
  },

  // Insight card
  insightCard: {
    backgroundColor: "#FFFBEB",
    borderRadius: 20,
    padding: 16,
    marginBottom: 14,
    borderLeftWidth: 3,
    borderLeftColor: "#D97706",
  },
  insightHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    marginBottom: 4,
  },
  insightTag: {
    fontSize: 11,
    fontWeight: "700",
    color: "#D97706",
    letterSpacing: 0.5,
  },
  insightTitle: {
    fontSize: 15,
    fontWeight: "700",
    color: theme.colors.text.primary,
    marginBottom: 6,
  },
  insightText: {
    fontSize: 12,
    color: "#78350F",
    lineHeight: 18,
    marginBottom: 12,
  },
  insightBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    backgroundColor: "#FEF3C7",
    alignSelf: "flex-start",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 10,
  },
  insightBtnText: { fontSize: 12, color: "#D97706", fontWeight: "600" },

  // Dose pattern
  patternCard: {
    backgroundColor: theme.colors.surface,
    borderRadius: 20,
    padding: 16,
    marginBottom: 14,
    ...theme.shadows.sm,
  },
  patternHeaderRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 14,
  },
  patternTitle: { fontSize: 14, fontWeight: "700", color: theme.colors.text.primary },
  patternRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 10,
    gap: 10,
  },
  patternSlot: { fontSize: 12, color: theme.colors.text.secondary, width: 70 },
  dotRow: { flexDirection: "row", gap: 6 },
  dot: { width: 10, height: 10, borderRadius: 5 },
  legendRow: {
    flexDirection: "row",
    justifyContent: "space-around",
    marginTop: 10,
    paddingHorizontal: 70,
  },
  legendDay: { fontSize: 10, color: theme.colors.tabInactive, textAlign: "center" },
  legendLabels: {
    flexDirection: "row",
    gap: 16,
    marginTop: 10,
    justifyContent: "center",
  },
  legendItem: { flexDirection: "row", alignItems: "center", gap: 5 },
  legendDot: { width: 8, height: 8, borderRadius: 4 },
  legendText: { fontSize: 11, color: theme.colors.text.secondary },
});
