import { Feather, FontAwesome } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { useRouter } from "expo-router";
import { useState } from "react";
import {
    Image,
    KeyboardAvoidingView,
    Platform,
    SafeAreaView,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from "react-native";

export default function LoginScreen() {
  const router = useRouter();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  return (
    <LinearGradient colors={["#4338CA", "#6D28D9"]} style={{ flex: 1 }}>
      <SafeAreaView style={{ flex: 1 }}>
        <KeyboardAvoidingView
          behavior={Platform.OS === "ios" ? "padding" : undefined}
          style={styles.container}
        >
          {/* Logo Section */}
          <View style={styles.logoContainer}>
            <View style={styles.logoCircle}>
              <Feather name="shield" size={42} color="#6D28D9" />
            </View>

            <Text style={styles.title}>RxGuardian</Text>
            <Text style={styles.subtitle}>Intelligent Medication Care</Text>
          </View>

          {/* Form Card */}
          <View style={styles.card}>
            {/* EMAIL */}
            <Text style={styles.label}>EMAIL</Text>
            <View style={styles.inputWrapper}>
              <Feather name="mail" size={18} color="#A5B4FC" />
              <TextInput
                placeholder="Enter your email"
                placeholderTextColor="#A5B4FC"
                value={email}
                onChangeText={setEmail}
                style={styles.input}
                keyboardType="email-address"
                autoCapitalize="none"
              />
            </View>

            {/* PASSWORD */}
            <View style={styles.passwordRow}>
              <Text style={styles.label}>PASSWORD</Text>
              <TouchableOpacity>
                <Text style={styles.forgot}>Forgot?</Text>
              </TouchableOpacity>
            </View>

            <View style={styles.inputWrapper}>
              <Feather name="lock" size={18} color="#A5B4FC" />
              <TextInput
                placeholder="••••••••"
                placeholderTextColor="#A5B4FC"
                secureTextEntry
                value={password}
                onChangeText={setPassword}
                style={styles.input}
              />
            </View>

            {/* LOGIN BUTTON */}
            <TouchableOpacity
              activeOpacity={0.85}
              onPress={() => router.push("/loading")}
            >
              <LinearGradient
                colors={["#60A5FA", "#6366F1"]}
                style={styles.loginButton}
              >
                <Feather
                  name="log-in"
                  size={18}
                  color="white"
                  style={{ marginRight: 8 }}
                />
                <Text style={styles.loginText}>Secure Login</Text>
              </LinearGradient>
            </TouchableOpacity>

            {/* Divider */}
            <View style={styles.dividerRow}>
              <View style={styles.divider} />
              <Text style={styles.dividerText}>OR CONTINUE WITH</Text>
              <View style={styles.divider} />
            </View>

            {/* Social Buttons */}
            <View style={styles.socialRow}>
              {/* Google */}
              <TouchableOpacity style={styles.socialButton} activeOpacity={0.8}>
                <Image
                  source={require("../assets/images/google.png")}
                  style={styles.googleIcon}
                  resizeMode="contain"
                />
              </TouchableOpacity>

              {/* Apple */}
              <TouchableOpacity style={styles.socialButton} activeOpacity={0.8}>
                <FontAwesome name="apple" size={28} color="white" />
              </TouchableOpacity>
            </View>
          </View>
        </KeyboardAvoidingView>
      </SafeAreaView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: 24,
    justifyContent: "center",
  },

  logoContainer: {
    alignItems: "center",
    marginBottom: 40,
  },

  logoCircle: {
    width: 110,
    height: 110,
    borderRadius: 55,
    backgroundColor: "white",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 20,
  },

  title: {
    fontSize: 32,
    fontWeight: "700",
    color: "white",
  },

  subtitle: {
    marginTop: 6,
    fontSize: 16,
    color: "#E0E7FF",
  },

  card: {
    backgroundColor: "#3B2F8F",
    padding: 24,
    borderRadius: 28,
  },

  label: {
    color: "#C7D2FE",
    fontSize: 12,
    letterSpacing: 1.5,
    marginBottom: 8,
  },

  inputWrapper: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#2E2372",
    paddingHorizontal: 16,
    borderRadius: 18,
    marginBottom: 20,
  },

  input: {
    flex: 1,
    paddingVertical: 14,
    marginLeft: 10,
    color: "white",
    fontSize: 16,
  },

  passwordRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },

  forgot: {
    color: "#60A5FA",
    fontSize: 13,
  },

  loginButton: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    paddingVertical: 16,
    borderRadius: 20,
    marginTop: 10,
  },

  loginText: {
    color: "white",
    fontSize: 16,
    fontWeight: "600",
  },

  dividerRow: {
    flexDirection: "row",
    alignItems: "center",
    marginVertical: 24,
  },

  divider: {
    flex: 1,
    height: 1,
    backgroundColor: "#5B4BC4",
  },

  dividerText: {
    marginHorizontal: 10,
    color: "#C7D2FE",
    fontSize: 12,
  },

  socialRow: {
    flexDirection: "row",
    justifyContent: "center",
    gap: 20,
  },

  socialButton: {
    width: 68,
    height: 68,
    borderRadius: 34,
    backgroundColor: "#2E2372",
    alignItems: "center",
    justifyContent: "center",
  },

  googleIcon: {
    width: 30,
    height: 30,
  },
});
