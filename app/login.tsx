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
    ScrollView,
    Alert,
    ActivityIndicator,
} from "react-native";
import { theme } from "../constants/theme";
import { authService } from "../services/authService";
import { storage } from "../services/storage";

export default function LoginScreen() {
  const router = useRouter();
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleAuth = async () => {
    const trimmedEmail = email.trim();
    const trimmedPassword = password; // Usually passwords shouldn't be trimmed, but leading/trailing spaces are a common mobile issue. I'll stick to trimming email and fixing input props.

    if (!trimmedEmail || !password || (!isLogin && !name.trim())) {
      Alert.alert("Error", "Please fill in all fields");
      return;
    }

    setLoading(true);
    try {
      if (isLogin) {
        await authService.login(trimmedEmail, password);
      } else {
        await authService.register(name.trim(), trimmedEmail, password);
      }

      // Check if profile is complete
      const isProfileComplete = await storage.isProfileComplete();
      if (!isProfileComplete) {
        router.replace("/profile-setup");
      } else {
        const isOnboardingComplete = await storage.isOnboardingComplete();
        if (!isOnboardingComplete) {
          router.replace("/onboarding");
        } else {
          router.replace("/(tabs)");
        }
      }
    } catch (error: any) {
      console.error(error);
      Alert.alert("Authentication Failed", error.response?.data?.detail || "Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <LinearGradient colors={[theme.colors.primary, "#4338CA"]} style={{ flex: 1 }}>
      <SafeAreaView style={{ flex: 1 }}>
        <KeyboardAvoidingView
          behavior={Platform.OS === "ios" ? "padding" : "height"}
          style={{ flex: 1 }}
        >
          <ScrollView 
            contentContainerStyle={styles.scrollContainer}
            showsVerticalScrollIndicator={false}
            keyboardShouldPersistTaps="handled"
          >
            {/* Logo Section */}
            <View style={styles.logoContainer}>
              <View style={styles.logoCircle}>
                <Feather name="shield" size={42} color={theme.colors.primary} />
              </View>

              <Text style={styles.title}>RxGuardian</Text>
              <Text style={styles.subtitle}>Intelligent Medication Care</Text>
            </View>

            {/* Form Card */}
            <View style={styles.card}>
              <Text style={styles.welcomeText}>
                {isLogin ? "Welcome Back" : "Create Account"}
              </Text>

              {!isLogin && (
                <>
                  <Text style={styles.label}>FULL NAME</Text>
                  <View style={styles.inputWrapper}>
                    <Feather name="user" size={18} color="#A5B4FC" />
                    <TextInput
                      placeholder="Enter your name"
                      placeholderTextColor="#A5B4FC"
                      value={name}
                      onChangeText={setName}
                      style={styles.input}
                    />
                  </View>
                </>
              )}

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
                {isLogin && (
                  <TouchableOpacity>
                    <Text style={styles.forgot}>Forgot?</Text>
                  </TouchableOpacity>
                )}
              </View>

              <View style={styles.inputWrapper}>
                <Feather name="lock" size={18} color="#A5B4FC" />
                <TextInput
                  placeholder="••••••••"
                  placeholderTextColor="#A5B4FC"
                  secureTextEntry={!showPassword}
                  value={password}
                  onChangeText={setPassword}
                  style={styles.input}
                />
                <TouchableOpacity onPress={() => setShowPassword(!showPassword)}>
                  <Feather 
                    name={showPassword ? "eye" : "eye-off"} 
                    size={18} 
                    color="#A5B4FC" 
                  />
                </TouchableOpacity>
              </View>

              {/* LOGIN/REGISTER BUTTON */}
              <TouchableOpacity
                activeOpacity={0.85}
                onPress={handleAuth}
                disabled={loading}
              >
                <LinearGradient
                  colors={[theme.colors.primaryAccent, "#6366F1"]}
                  style={styles.loginButton}
                >
                  {loading ? (
                    <ActivityIndicator color="white" />
                  ) : (
                    <>
                      <Feather
                        name={isLogin ? "log-in" : "user-plus"}
                        size={18}
                        color="white"
                        style={{ marginRight: 8 }}
                      />
                      <Text style={styles.loginText}>
                        {isLogin ? "Secure Login" : "Create Account"}
                      </Text>
                    </>
                  )}
                </LinearGradient>
              </TouchableOpacity>

              {/* Toggle Section moved inside card, below login button */}
              <View style={styles.toggleContainer}>
                <Text style={styles.toggleLabel}>
                  {isLogin ? "Don't have an account? " : "Already have an account? "}
                </Text>
                <TouchableOpacity onPress={() => setIsLogin(!isLogin)}>
                  <Text style={styles.toggleBtnText}>
                    {isLogin ? "Register" : "Login"}
                  </Text>
                </TouchableOpacity>
              </View>

              {/* Divider */}
              <View style={styles.dividerRow}>
                <View style={styles.divider} />
                <Text style={styles.dividerText}>OR CONTINUE WITH</Text>
                <View style={styles.divider} />
              </View>

              {/* Social Buttons */}
              <View style={styles.socialRow}>
                <TouchableOpacity style={styles.socialButton} activeOpacity={0.8}>
                  <Image
                    source={require("../assets/images/google.png")}
                    style={styles.googleIcon}
                    resizeMode="contain"
                  />
                </TouchableOpacity>

                <TouchableOpacity style={styles.socialButton} activeOpacity={0.8}>
                  <FontAwesome name="apple" size={28} color="white" />
                </TouchableOpacity>
              </View>
            </View>
          </ScrollView>
        </KeyboardAvoidingView>
      </SafeAreaView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  scrollContainer: {
    paddingHorizontal: 24,
    paddingVertical: 40,
    justifyContent: "center",
    flexGrow: 1,
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
    ...theme.shadows.lg,
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

  welcomeText: {
    fontSize: 22,
    fontWeight: "700",
    color: "white",
    textAlign: "center",
    marginBottom: 24,
  },

  card: {
    backgroundColor: "rgba(255, 255, 255, 0.15)",
    padding: 24,
    borderRadius: 28,
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.2)",
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
    backgroundColor: "rgba(255, 255, 255, 0.1)",
    paddingHorizontal: 16,
    borderRadius: 18,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.1)",
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
    color: theme.colors.secondary,
    fontSize: 13,
  },

  loginButton: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    paddingVertical: 16,
    borderRadius: 20,
    marginTop: 10,
    ...theme.shadows.md,
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
    backgroundColor: "rgba(255, 255, 255, 0.2)",
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
    backgroundColor: "rgba(255, 255, 255, 0.1)",
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.1)",
  },

  googleIcon: {
    width: 30,
    height: 30,
  },

  toggleContainer: {
    flexDirection: "row",
    justifyContent: "center",
    marginTop: 30,
  },

  toggleLabel: {
    color: "#C7D2FE",
    fontSize: 15,
  },

  toggleBtnText: {
    color: theme.colors.secondary,
    fontSize: 15,
    fontWeight: "bold",
  },
});

