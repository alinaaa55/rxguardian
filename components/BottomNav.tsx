// components/BottomNav.tsx
import { Feather } from "@expo/vector-icons";
import { usePathname, useRouter } from "expo-router";
import { Platform, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { theme } from "../constants/theme";
import { useSafeAreaInsets } from "react-native-safe-area-context";

type Tab = {
  label: string;
  icon: string;
  route: string;
};

const TABS: Tab[] = [
  { label: "Home", icon: "home", route: "/" },
  { label: "Meds", icon: "calendar", route: "/meds" },
  { label: "Chat", icon: "message-circle", route: "/chat" },
  { label: "Schedule", icon: "bar-chart-2", route: "/schedule" },
];

export default function BottomNav() {
  const router = useRouter();
  const pathname = usePathname();
  const insets = useSafeAreaInsets();

  const isActive = (route: string) => {
    if (route === "/" && pathname === "/") return true;
    if (route !== "/" && pathname.startsWith(route)) return true;
    return false;
  };

  const handlePress = (route: string) => {
    // Navigate to the tab or screen
    router.navigate(route as any);
  };

  return (
    <View style={[styles.wrapper, { height: BAR_HEIGHT + FAB_SIZE / 2 + insets.bottom }]}>
      {/* The curved notch background */}
      <View style={[styles.bar, { height: BAR_HEIGHT + insets.bottom, paddingBottom: insets.bottom }]}>
        {/* Left two tabs */}
        {TABS.slice(0, 2).map((tab) => {
          const active = isActive(tab.route);
          return (
            <TouchableOpacity
              key={tab.label}
              style={styles.navItem}
              onPress={() => handlePress(tab.route)}
            >
              <Feather
                name={tab.icon as any}
                size={20}
                color={active ? theme.colors.primaryAccent : theme.colors.tabInactive}
              />
              <Text style={[styles.navText, active && styles.navTextActive]}>
                {tab.label}
              </Text>
            </TouchableOpacity>
          );
        })}

        {/* Center spacer for the FAB */}
        <View style={styles.fabSpacer} />

        {/* Right two tabs */}
        {TABS.slice(2).map((tab) => {
          const active = isActive(tab.route);
          return (
            <TouchableOpacity
              key={tab.label}
              style={styles.navItem}
              onPress={() => handlePress(tab.route)}
            >
              <Feather
                name={tab.icon as any}
                size={20}
                color={active ? theme.colors.primaryAccent : theme.colors.tabInactive}
              />
              <Text style={[styles.navText, active && styles.navTextActive]}>
                {tab.label}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>

      {/* Floating scan button — sits half above the bar */}
      <TouchableOpacity
        style={[styles.fab, { bottom: BAR_HEIGHT - FAB_SIZE / 2 + insets.bottom }]}
        onPress={() => router.push("/scan")}
        activeOpacity={0.85}
      >
        <Feather name="clipboard" size={26} color={theme.colors.surface} />
      </TouchableOpacity>
    </View>
  );
}

const BAR_HEIGHT = 64;
const FAB_SIZE = 62;

const styles = StyleSheet.create({
  wrapper: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    alignItems: "center",
    pointerEvents: "box-none",
  },

  bar: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: theme.colors.surface,
    flexDirection: "row",
    alignItems: "center",
    borderTopWidth: 1,
    borderTopColor: theme.colors.border,
    ...theme.shadows.md,
  },

  navItem: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingTop: 8,
  },

  fabSpacer: {
    width: FAB_SIZE + 20,
  },

  navText: {
    fontSize: 11,
    color: theme.colors.tabInactive,
    marginTop: 4,
  },

  navTextActive: {
    color: theme.colors.primaryAccent,
    fontWeight: "600",
  },

  fab: {
    position: "absolute",
    width: FAB_SIZE,
    height: FAB_SIZE,
    borderRadius: FAB_SIZE / 2,
    backgroundColor: theme.colors.primary,
    alignItems: "center",
    justifyContent: "center",
    zIndex: 20,
    borderWidth: 4,
    borderColor: theme.colors.surface,
    ...theme.shadows.lg,
  },
});
