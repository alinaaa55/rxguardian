// components/BottomNav.tsx
// Shared bottom navigation bar with BHIM-style centered floating scan button

import { Feather } from "@expo/vector-icons";
import { usePathname, useRouter } from "expo-router";
import { Platform, StyleSheet, Text, TouchableOpacity, View } from "react-native";

type Tab = {
        label: string;
        icon: string;
        route: string;
};

const TABS: Tab[] = [
        { label: "Home", icon: "home", route: "/home" },
        { label: "Meds", icon: "calendar", route: "/meds" },
        { label: "Chat", icon: "message-circle", route: "/ChatScreen" },
        { label: "Schedule", icon: "bar-chart-2", route: "/schedule" },
];

export default function BottomNav() {
        const router = useRouter();
        const pathname = usePathname();

        const isActive = (route: string) => pathname === route || pathname.startsWith(route);

        return (
                <View style={styles.wrapper}>
                        {/* The curved notch background */}
                        <View style={styles.bar}>
                                {/* Left two tabs */}
                                {TABS.slice(0, 2).map((tab) => {
                                        const active = isActive(tab.route);
                                        return (
                                                <TouchableOpacity
                                                        key={tab.label}
                                                        style={styles.navItem}
                                                        onPress={() => router.push(tab.route as any)}
                                                >
                                                        <Feather
                                                                name={tab.icon as any}
                                                                size={20}
                                                                color={active ? "#2563EB" : "#94A3B8"}
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
                                                        onPress={() => router.push(tab.route as any)}
                                                >
                                                        <Feather
                                                                name={tab.icon as any}
                                                                size={20}
                                                                color={active ? "#2563EB" : "#94A3B8"}
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
                                style={styles.fab}
                                onPress={() => router.push("/scan")}
                                activeOpacity={0.85}
                        >
                                <Feather name="clipboard" size={26} color="#fff" />
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
                // Extra height so FAB has room to sit above the bar
                height: BAR_HEIGHT + FAB_SIZE / 2,
                alignItems: "center",
                // Pointer events passthrough so the FAB area above the bar is tappable
                pointerEvents: "box-none",
        },

        bar: {
                position: "absolute",
                bottom: 0,
                left: 0,
                right: 0,
                height: BAR_HEIGHT + (Platform.OS === "ios" ? 16 : 0),
                backgroundColor: "#fff",
                flexDirection: "row",
                alignItems: "center",
                borderTopWidth: 1,
                borderTopColor: "#E2E8F0",
                paddingBottom: Platform.OS === "ios" ? 16 : 0,
                // Shadow
                shadowColor: "#000",
                shadowOpacity: 0.08,
                shadowRadius: 8,
                shadowOffset: { width: 0, height: -2 },
                elevation: 10,
        },

        navItem: {
                flex: 1,
                alignItems: "center",
                justifyContent: "center",
                paddingTop: 8,
        },

        // Empty space in the middle for the FAB
        fabSpacer: {
                width: FAB_SIZE + 20,
        },

        navText: {
                fontSize: 11,
                color: "#94A3B8",
                marginTop: 4,
        },

        navTextActive: {
                color: "#2563EB",
                fontWeight: "600",
        },

        fab: {
                position: "absolute",
                // Sit half above the bar
                bottom: BAR_HEIGHT - FAB_SIZE / 2 + (Platform.OS === "ios" ? 16 : 0),
                width: FAB_SIZE,
                height: FAB_SIZE,
                borderRadius: FAB_SIZE / 2,
                backgroundColor: "#1E3A8A",
                alignItems: "center",
                justifyContent: "center",
                // Strong shadow so it pops
                shadowColor: "#1E3A8A",
                shadowOpacity: 0.45,
                shadowRadius: 10,
                shadowOffset: { width: 0, height: 4 },
                elevation: 14,
                zIndex: 20,
                borderWidth: 4,
                borderColor: "#fff",
        },
});