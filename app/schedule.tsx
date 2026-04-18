import { Feather, Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { useState } from "react";
import {
  Dimensions,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Switch,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

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
      color: "#F97316",
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
      color: "#2563EB",
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
      {taken && <Feather name="check" size={14} color="#fff" />}
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
                  backgroundColor: isToday ? "#1E3A8A" : "#BFDBFE",
                },
              ]}
            />
          </View>
          <Text
            style={[
              styles.barLabel,
              isToday && { color: "#1E3A8A", fontWeight: "700" },
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
        style={[styles.dot, { backgroundColor: t ? "#1E3A8A" : "#FCA5A5" }]}
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
          <Feather name="bell" size={20} color="#1E3A8A" />
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
            color={activeTab === "schedule" ? "#fff" : "#64748B"}
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
            color={activeTab === "analytics" ? "#fff" : "#64748B"}
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
        contentContainerStyle={{ paddingBottom: 100, paddingHorizontal: 20 }}
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
                  color="#2563EB"
                />
                <Text style={styles.aiCardTitle}>AI Suggestion</Text>
              </View>
              <TouchableOpacity>
                <Feather name="x" size={16} color="#94A3B8" />
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
                    color="#1E3A8A"
                  />
                  <View style={{ marginLeft: 12 }}>
                    <Text style={styles.toggleTitle}>Voice Reminder</Text>
                    <Text style={styles.toggleSub}>Announce due meds</Text>
                  </View>
                </View>
                <Switch
                  value={true}
                  trackColor={{ false: "#E2E8F0", true: "#1E3A8A" }}
                  thumbColor="#fff"
                />
              </View>
              <View style={styles.divider} />
              <View style={styles.toggleRow}>
                <View style={styles.toggleLeft}>
                  <MaterialCommunityIcons
                    name="human-cane"
                    size={20}
                    color="#94A3B8"
                  />
                  <View style={{ marginLeft: 12 }}>
                    <Text style={styles.toggleTitle}>Elderly Mode</Text>
                    <Text style={styles.toggleSub}>Larger text & contrast</Text>
                  </View>
                </View>
                <Switch
                  value={false}
                  trackColor={{ false: "#E2E8F0", true: "#1E3A8A" }}
                  thumbColor="#fff"
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
                <Ionicons name="flame-outline" size={18} color="#F97316" />
                <Text style={styles.statValue}>{ANALYTICS.streak}</Text>
                <Text style={styles.statLabel}>Day Streak</Text>
              </View>
              <View style={styles.statCard}>
                <Feather name="check-circle" size={18} color="#16A34A" />
                <Text style={styles.statValue}>{ANALYTICS.taken}</Text>
                <Text style={styles.statLabel}>Taken</Text>
              </View>
              <View style={styles.statCard}>
                <Feather name="trending-up" size={18} color="#2563EB" />
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
                  <Feather name="arrow-up-right" size={12} color="#16A34A" />
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
                        i === 2 && { color: "#1E3A8A", fontWeight: "700" },
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
                <Text style={{ color: "#DC2626", fontWeight: "700" }}>
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
                  color="#94A3B8"
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
                    style={[styles.legendDot, { backgroundColor: "#1E3A8A" }]}
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

      {/* ── Bottom Nav ── */}
      <View style={styles.bottomNav}>
        <TouchableOpacity
          style={styles.navItem}
          onPress={() => router.push("/home")}
        >
          <Feather name="home" size={20} color="#94A3B8" />
          <Text style={styles.navText}>Home</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.navItem}
          onPress={() => router.push("/meds")} // 👈 route to meds.tsx
        >
          <Feather name="calendar" size={20} color="#94A3B8" />
          <Text style={styles.navText}>Meds</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.navItem}
          onPress={() => router.push("/ChatScreen")}
        >
          <Feather name="message-circle" size={20} color="#94A3B8" />
          <Text style={styles.navText}>Chat</Text>
        </TouchableOpacity>

        {/* Schedule — active */}
        <TouchableOpacity style={styles.navItem}>
          <Feather name="bar-chart-2" size={20} color="#2563EB" />
          <Text style={styles.navTextActive}>Schedule</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

// ─── Styles ───────────────────────────────────────────────────────────────────
const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: "#F1F5F9" },

  // Header
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 10,
  },
  headerTitle: { fontSize: 22, fontWeight: "800", color: "#1E3A8A" },
  headerSub: { fontSize: 12, color: "#64748B", marginTop: 2 },
  headerIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "#E2E8F0",
    alignItems: "center",
    justifyContent: "center",
  },

  // Tab toggle
  tabToggle: {
    flexDirection: "row",
    backgroundColor: "#E2E8F0",
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
  tabBtnActive: { backgroundColor: "#1E3A8A" },
  tabBtnText: { fontSize: 13, fontWeight: "600", color: "#64748B" },
  tabBtnTextActive: { color: "#fff" },

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
    backgroundColor: "#fff",
    minWidth: 54,
  },
  dayPillActive: { backgroundColor: "#1E3A8A" },
  dayText: { fontSize: 12, color: "#64748B", fontWeight: "500" },
  dayTextActive: { color: "#fff" },
  dateText: { fontSize: 16, fontWeight: "700", color: "#1E3A8A", marginTop: 2 },
  dateTextActive: { color: "#fff" },
  activeDot: {
    width: 5,
    height: 5,
    borderRadius: 3,
    backgroundColor: "#22C55E",
    marginTop: 3,
  },

  // AI Card
  aiCard: {
    backgroundColor: "#EFF6FF",
    borderRadius: 16,
    padding: 14,
    marginBottom: 14,
    borderLeftWidth: 3,
    borderLeftColor: "#2563EB",
    flexWrap: "wrap",
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 4,
  },
  aiCardLeft: { flexDirection: "row", alignItems: "center", gap: 6, flex: 1 },
  aiCardTitle: { fontSize: 13, fontWeight: "700", color: "#2563EB" },
  aiCardText: {
    fontSize: 12,
    color: "#1E40AF",
    lineHeight: 18,
    width: "100%",
    marginTop: 6,
  },

  // Progress
  progressCard: {
    backgroundColor: "#fff",
    borderRadius: 16,
    padding: 14,
    marginBottom: 20,
    shadowColor: "#000",
    shadowOpacity: 0.04,
    shadowRadius: 6,
    elevation: 2,
  },
  progressRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 10,
  },
  progressLabel: { fontSize: 13, fontWeight: "600", color: "#1E3A8A" },
  progressCount: { fontSize: 13, color: "#64748B" },
  progressBg: {
    height: 8,
    backgroundColor: "#E2E8F0",
    borderRadius: 4,
    overflow: "hidden",
  },
  progressFill: { height: 8, backgroundColor: "#1E3A8A", borderRadius: 4 },

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
    color: "#94A3B8",
    letterSpacing: 0.5,
  },
  sectionCount: { fontSize: 11, color: "#94A3B8" },

  // Med row
  medRow: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#fff",
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
  medName: { fontSize: 14, fontWeight: "700", color: "#1E293B" },
  medDose: { fontSize: 12, color: "#64748B", marginTop: 2 },
  checkCircle: {
    width: 30,
    height: 30,
    borderRadius: 15,
    borderWidth: 2,
    borderColor: "#CBD5E1",
    alignItems: "center",
    justifyContent: "center",
  },
  checkCircleDone: { backgroundColor: "#16A34A", borderColor: "#16A34A" },

  // Toggle card
  toggleCard: {
    backgroundColor: "#fff",
    borderRadius: 20,
    padding: 16,
    marginTop: 10,
    shadowColor: "#000",
    shadowOpacity: 0.04,
    shadowRadius: 6,
    elevation: 2,
  },
  toggleRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: 6,
  },
  toggleLeft: { flexDirection: "row", alignItems: "center" },
  toggleTitle: { fontSize: 14, fontWeight: "600", color: "#1E293B" },
  toggleSub: { fontSize: 12, color: "#94A3B8", marginTop: 1 },
  divider: { height: 1, backgroundColor: "#F1F5F9", marginVertical: 8 },

  // Stats row
  statsRow: {
    flexDirection: "row",
    gap: 10,
    marginBottom: 14,
  },
  statCard: {
    flex: 1,
    backgroundColor: "#fff",
    borderRadius: 16,
    padding: 14,
    alignItems: "center",
    gap: 4,
    shadowColor: "#000",
    shadowOpacity: 0.04,
    shadowRadius: 5,
    elevation: 2,
  },
  statValue: { fontSize: 20, fontWeight: "800", color: "#1E3A8A" },
  statLabel: { fontSize: 11, color: "#64748B" },

  // Chart card
  chartCard: {
    backgroundColor: "#fff",
    borderRadius: 20,
    padding: 18,
    marginBottom: 14,
    shadowColor: "#000",
    shadowOpacity: 0.04,
    shadowRadius: 6,
    elevation: 2,
  },
  chartHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 4,
  },
  chartTitle: { fontSize: 14, fontWeight: "700", color: "#1E293B" },
  trendBadge: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#DCFCE7",
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 10,
    gap: 2,
  },
  trendText: { fontSize: 11, color: "#16A34A", fontWeight: "600" },
  chartBig: {
    fontSize: 32,
    fontWeight: "800",
    color: "#1E3A8A",
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
    backgroundColor: "#F1F5F9",
    borderRadius: 6,
    justifyContent: "flex-end",
    overflow: "hidden",
  },
  barFill: { width: "100%", borderRadius: 6 },
  barLabel: { fontSize: 10, color: "#94A3B8", marginTop: 4 },
  chartDayLabels: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 6,
  },
  chartDayLabel: {
    fontSize: 10,
    color: "#94A3B8",
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
    color: "#1E293B",
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
    backgroundColor: "#fff",
    borderRadius: 20,
    padding: 16,
    marginBottom: 14,
    shadowColor: "#000",
    shadowOpacity: 0.04,
    shadowRadius: 6,
    elevation: 2,
  },
  patternHeaderRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 14,
  },
  patternTitle: { fontSize: 14, fontWeight: "700", color: "#1E293B" },
  patternRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 10,
    gap: 10,
  },
  patternSlot: { fontSize: 12, color: "#64748B", width: 70 },
  dotRow: { flexDirection: "row", gap: 6 },
  dot: { width: 10, height: 10, borderRadius: 5 },
  legendRow: {
    flexDirection: "row",
    justifyContent: "space-around",
    marginTop: 10,
    paddingHorizontal: 70,
  },
  legendDay: { fontSize: 10, color: "#94A3B8", textAlign: "center" },
  legendLabels: {
    flexDirection: "row",
    gap: 16,
    marginTop: 10,
    justifyContent: "center",
  },
  legendItem: { flexDirection: "row", alignItems: "center", gap: 5 },
  legendDot: { width: 8, height: 8, borderRadius: 4 },
  legendText: { fontSize: 11, color: "#64748B" },

  // Bottom nav
  bottomNav: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: "#fff",
    flexDirection: "row",
    justifyContent: "space-around",
    paddingVertical: 14,
    borderTopWidth: 1,
    borderTopColor: "#E2E8F0",
  },
  navItem: { alignItems: "center" },
  navText: { fontSize: 11, color: "#94A3B8", marginTop: 4 },
  navTextActive: {
    fontSize: 11,
    color: "#2563EB",
    marginTop: 4,
    fontWeight: "600",
  },
});
