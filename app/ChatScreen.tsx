// app/(tabs)/chat.tsx  — or  app/chat.tsx  depending on your Expo Router structure
// RxGuardian AI · Chatbot Screen

import { Feather, Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import * as ImagePicker from "expo-image-picker";
import { useRouter } from "expo-router";
import React, { useCallback, useRef, useState } from "react";
import {
    Animated,
    FlatList,
    Image,
    KeyboardAvoidingView,
    Platform,
    SafeAreaView,
    StatusBar,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from "react-native";

// ─── Types ───────────────────────────────────────────────────────────────────
type MedicineSuggestion = {
  name: string;
  quantity: string;
  price: string;
};

type Message = {
  id: string;
  role: "user" | "assistant";
  text: string;
  imageUri?: string;
  suggestion?: MedicineSuggestion;
  timestamp: Date;
};

// ─── Constants ────────────────────────────────────────────────────────────────
const COLORS = {
  background: "#F2F4F7",
  surface: "#FFFFFF",
  userBubble: "#1A2E4A",
  aiBubble: "#FFFFFF",
  userText: "#FFFFFF",
  aiText: "#1A2E4A",
  accent: "#2BB5A0",
  accentLight: "#E8F8F6",
  border: "#E4E8EE",
  placeholder: "#9BA8B7",
  timestamp: "#9BA8B7",
  suggestionBg: "#F7FFFE",
  suggestionBorder: "#C8EDE8",
  priceTag: "#2BB5A0",
  headerBg: "#FFFFFF",
  statusOnline: "#2BB5A0",
  inputBg: "#FFFFFF",
  sendBtn: "#1A2E4A",
  iconMuted: "#9BA8B7",
};

// ─── Mock AI Response Logic ───────────────────────────────────────────────────
const generateAIResponse = async (
  userMessage: string,
  hasImage: boolean,
): Promise<{ text: string; suggestion?: MedicineSuggestion }> => {
  await new Promise((r) => setTimeout(r, 1200 + Math.random() * 800));

  if (hasImage) {
    return {
      text: "I've analyzed your prescription image. 🔍\n\nThis is **Metformin 500mg**, commonly prescribed for Type 2 diabetes to help control high blood sugar. The dosage is one tablet, twice daily with meals.",
      suggestion: {
        name: "Metformin 500mg",
        quantity: "30 Tablets · Generic",
        price: "$12.50",
      },
    };
  }

  const lower = userMessage.toLowerCase();

  if (lower.includes("interaction") || lower.includes("drug")) {
    return {
      text: "I can check drug interactions for you. Please share the names of the medications you're concerned about, or upload your prescription and I'll analyze them automatically.",
    };
  }
  if (lower.includes("schedule") || lower.includes("reminder")) {
    return {
      text: "I can help you set up a personalized medication schedule! Tell me:\n\n• Which medications do you take?\n• What time do you usually wake up?\n• Do you take any medications with food?\n\nI'll create a smart reminder plan for you.",
    };
  }
  if (lower.includes("side effect")) {
    return {
      text: "Side effects vary by medication. Could you tell me which medication you're asking about? I'll give you a clear summary of common and rare side effects, plus what to watch out for.",
    };
  }
  if (
    lower.includes("refill") ||
    lower.includes("checkout") ||
    lower.includes("buy")
  ) {
    return {
      text: "I can help you refill your prescription. Based on your history, here's what may need a refill soon:",
      suggestion: {
        name: "Atorvastatin 10mg",
        quantity: "30 Tablets · Generic",
        price: "$8.99",
      },
    };
  }

  return {
    text: "I'm RxGuardian AI, your smart medication assistant. I can help you:\n\n• Analyze prescriptions 📋\n• Check drug interactions ⚠️\n• Build medication schedules 🗓️\n• Track your adherence 📊\n• Refill prescriptions 💊\n\nWhat would you like help with today?",
  };
};

// ─── Medicine Suggestion Card ─────────────────────────────────────────────────
const MedicineSuggestionCard = ({
  suggestion,
}: {
  suggestion: MedicineSuggestion;
}) => (
  <View style={styles.suggestionCard}>
    <View style={styles.suggestionIcon}>
      <MaterialCommunityIcons name="pill" size={22} color={COLORS.accent} />
    </View>
    <View style={styles.suggestionInfo}>
      <Text style={styles.suggestionName}>{suggestion.name}</Text>
      <Text style={styles.suggestionQty}>{suggestion.quantity}</Text>
    </View>
    <View style={styles.suggestionPrice}>
      <Text style={styles.suggestionPriceText}>{suggestion.price}</Text>
    </View>
  </View>
);

// ─── Typing Indicator ─────────────────────────────────────────────────────────
const TypingIndicator = () => {
  const dots = [
    useRef(new Animated.Value(0)).current,
    useRef(new Animated.Value(0)).current,
    useRef(new Animated.Value(0)).current,
  ];

  React.useEffect(() => {
    const animations = dots.map((dot, i) =>
      Animated.loop(
        Animated.sequence([
          Animated.delay(i * 160),
          Animated.timing(dot, {
            toValue: 1,
            duration: 280,
            useNativeDriver: true,
          }),
          Animated.timing(dot, {
            toValue: 0,
            duration: 280,
            useNativeDriver: true,
          }),
          Animated.delay(500),
        ]),
      ),
    );
    animations.forEach((a) => a.start());
    return () => animations.forEach((a) => a.stop());
  }, []);

  return (
    <View style={[styles.bubbleWrapper, { alignSelf: "flex-start" }]}>
      <View style={styles.avatarSmall}>
        <MaterialCommunityIcons
          name="robot-happy-outline"
          size={16}
          color={COLORS.accent}
        />
      </View>
      <View
        style={[
          styles.bubble,
          styles.aiBubble,
          { paddingHorizontal: 16, paddingVertical: 12 },
        ]}
      >
        <View style={{ flexDirection: "row", gap: 5 }}>
          {dots.map((dot, i) => (
            <Animated.View
              key={i}
              style={[
                styles.typingDot,
                {
                  opacity: dot,
                  transform: [
                    {
                      translateY: dot.interpolate({
                        inputRange: [0, 1],
                        outputRange: [0, -4],
                      }),
                    },
                  ],
                },
              ]}
            />
          ))}
        </View>
      </View>
    </View>
  );
};

// ─── Message Bubble ───────────────────────────────────────────────────────────
const MessageBubble = ({ message }: { message: Message }) => {
  const isUser = message.role === "user";

  const formatText = (text: string) =>
    text.split("**").map((part, i) =>
      i % 2 === 1 ? (
        <Text key={i} style={{ fontWeight: "700" }}>
          {part}
        </Text>
      ) : (
        <Text key={i}>{part}</Text>
      ),
    );

  const timeStr = message.timestamp.toLocaleTimeString([], {
    hour: "2-digit",
    minute: "2-digit",
  });

  return (
    <View
      style={[
        styles.bubbleWrapper,
        isUser ? styles.userWrapper : styles.aiWrapper,
      ]}
    >
      {!isUser && (
        <View style={styles.avatarSmall}>
          <MaterialCommunityIcons
            name="robot-happy-outline"
            size={16}
            color={COLORS.accent}
          />
        </View>
      )}

      <View style={{ maxWidth: "78%", gap: 6 }}>
        {message.imageUri && (
          <View
            style={[
              styles.bubble,
              isUser ? styles.userBubble : styles.aiBubble,
              { padding: 6 },
            ]}
          >
            <Image
              source={{ uri: message.imageUri }}
              style={styles.uploadedImage}
              resizeMode="cover"
            />
            <Text
              style={{
                fontSize: 11,
                color: isUser ? "#A8C4E0" : COLORS.placeholder,
                textAlign: "right",
                marginTop: 4,
              }}
            >
              Uploaded
            </Text>
          </View>
        )}

        {message.text ? (
          <View
            style={[
              styles.bubble,
              isUser ? styles.userBubble : styles.aiBubble,
            ]}
          >
            <Text
              style={[
                styles.bubbleText,
                isUser ? styles.userText : styles.aiText,
              ]}
            >
              {formatText(message.text)}
            </Text>
          </View>
        ) : null}

        {message.suggestion && (
          <MedicineSuggestionCard suggestion={message.suggestion} />
        )}

        <Text style={[styles.timestamp, isUser ? { textAlign: "right" } : {}]}>
          {timeStr}
        </Text>
      </View>

      {isUser && (
        <View style={styles.userAvatarSmall}>
          <Ionicons name="person" size={14} color={COLORS.surface} />
        </View>
      )}
    </View>
  );
};

// ─── Main Chat Screen ─────────────────────────────────────────────────────────
export default function ChatScreen() {
  const router = useRouter();
  const flatRef = useRef<FlatList>(null);

  const [messages, setMessages] = useState<Message[]>([
    {
      id: "0",
      role: "assistant",
      text: "Hi! I'm RxGuardian AI. 👋\n\nI can analyze your prescriptions, check drug interactions, and help manage your medications. How can I help you today?",
      timestamp: new Date(),
    },
  ]);
  const [input, setInput] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const [pendingImage, setPendingImage] = useState<string | null>(null);

  const scrollToBottom = () => {
    setTimeout(() => flatRef.current?.scrollToEnd({ animated: true }), 100);
  };

  const sendMessage = useCallback(async () => {
    const trimmed = input.trim();
    if (!trimmed && !pendingImage) return;

    const userMsg: Message = {
      id: Date.now().toString(),
      role: "user",
      text: trimmed,
      imageUri: pendingImage ?? undefined,
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMsg]);
    setInput("");
    setPendingImage(null);
    setIsTyping(true);
    scrollToBottom();

    const { text, suggestion } = await generateAIResponse(
      trimmed,
      !!pendingImage,
    );

    const aiMsg: Message = {
      id: (Date.now() + 1).toString(),
      role: "assistant",
      text,
      suggestion,
      timestamp: new Date(),
    };

    setIsTyping(false);
    setMessages((prev) => [...prev, aiMsg]);
    scrollToBottom();
  }, [input, pendingImage]);

  const pickImage = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      quality: 0.8,
    });
    if (!result.canceled && result.assets.length > 0) {
      setPendingImage(result.assets[0].uri);
    }
  };

  const takePicture = async () => {
    const perm = await ImagePicker.requestCameraPermissionsAsync();
    if (perm.status !== "granted") return;
    const result = await ImagePicker.launchCameraAsync({ quality: 0.8 });
    if (!result.canceled && result.assets.length > 0) {
      setPendingImage(result.assets[0].uri);
    }
  };

  return (
    <SafeAreaView style={styles.safe}>
      <StatusBar barStyle="dark-content" backgroundColor={COLORS.headerBg} />

      {/* ── Header ── */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
          <Ionicons name="chevron-back" size={22} color={COLORS.userBubble} />
        </TouchableOpacity>

        <View style={styles.headerCenter}>
          <View style={styles.headerAvatar}>
            <MaterialCommunityIcons
              name="robot-happy-outline"
              size={22}
              color={COLORS.surface}
            />
          </View>
          <View>
            <Text style={styles.headerTitle}>RxGuardian AI</Text>
            <View style={styles.onlineRow}>
              <View style={styles.onlineDot} />
              <Text style={styles.onlineText}>Online now</Text>
            </View>
          </View>
        </View>

        <TouchableOpacity style={styles.headerRight}>
          <Ionicons
            name="person-circle-outline"
            size={28}
            color={COLORS.iconMuted}
          />
        </TouchableOpacity>
      </View>

      {/* ── Messages + Input ── */}
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        keyboardVerticalOffset={0}
      >
        <FlatList
          ref={flatRef}
          data={messages}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.messageList}
          showsVerticalScrollIndicator={false}
          ListFooterComponent={isTyping ? <TypingIndicator /> : null}
          renderItem={({ item }) => <MessageBubble message={item} />}
          onContentSizeChange={scrollToBottom}
        />

        {/* Pending image preview */}
        {pendingImage && (
          <View style={styles.pendingImageRow}>
            <Image source={{ uri: pendingImage }} style={styles.pendingThumb} />
            <Text style={styles.pendingLabel}>Prescription image ready</Text>
            <TouchableOpacity onPress={() => setPendingImage(null)}>
              <Ionicons
                name="close-circle"
                size={20}
                color={COLORS.placeholder}
              />
            </TouchableOpacity>
          </View>
        )}

        {/* ── Input Bar ── */}
        <View style={styles.inputBar}>
          <TouchableOpacity onPress={pickImage} style={styles.iconBtn}>
            <Ionicons
              name="add-circle-outline"
              size={26}
              color={COLORS.iconMuted}
            />
          </TouchableOpacity>

          <TextInput
            style={styles.input}
            placeholder="Type a message…"
            placeholderTextColor={COLORS.placeholder}
            value={input}
            onChangeText={setInput}
            multiline
            maxLength={500}
            returnKeyType="send"
            onSubmitEditing={sendMessage}
          />

          <TouchableOpacity onPress={takePicture} style={styles.iconBtn}>
            <Feather name="camera" size={22} color={COLORS.iconMuted} />
          </TouchableOpacity>

          <TouchableOpacity
            onPress={sendMessage}
            style={[
              styles.sendBtn,
              !input.trim() && !pendingImage && styles.sendBtnDisabled,
            ]}
            disabled={!input.trim() && !pendingImage}
          >
            <Ionicons name="send" size={17} color={COLORS.surface} />
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

// ─── Styles ───────────────────────────────────────────────────────────────────
const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: COLORS.background },

  // Header
  header: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 12,
    paddingVertical: 10,
    backgroundColor: COLORS.headerBg,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
    elevation: 2,
    shadowColor: "#000",
    shadowOpacity: 0.06,
    shadowRadius: 4,
    shadowOffset: { width: 0, height: 2 },
  },
  backBtn: { padding: 6, borderRadius: 20 },
  headerCenter: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    marginLeft: 4,
  },
  headerAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: COLORS.userBubble,
    alignItems: "center",
    justifyContent: "center",
  },
  headerTitle: {
    fontSize: 16,
    fontWeight: "700",
    color: COLORS.userBubble,
    letterSpacing: 0.2,
  },
  onlineRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
    marginTop: 1,
  },
  onlineDot: {
    width: 7,
    height: 7,
    borderRadius: 4,
    backgroundColor: COLORS.statusOnline,
  },
  onlineText: { fontSize: 12, color: COLORS.statusOnline, fontWeight: "500" },
  headerRight: { padding: 4 },

  // Messages
  messageList: { paddingHorizontal: 14, paddingVertical: 12, gap: 10 },
  bubbleWrapper: {
    flexDirection: "row",
    alignItems: "flex-end",
    gap: 8,
    marginVertical: 3,
  },
  userWrapper: { alignSelf: "flex-end", flexDirection: "row-reverse" },
  aiWrapper: { alignSelf: "flex-start" },
  avatarSmall: {
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: COLORS.accentLight,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 2,
  },
  userAvatarSmall: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: COLORS.accent,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 2,
  },
  bubble: {
    borderRadius: 18,
    paddingHorizontal: 14,
    paddingVertical: 10,
    maxWidth: "100%",
  },
  userBubble: {
    backgroundColor: COLORS.userBubble,
    borderBottomRightRadius: 4,
  },
  aiBubble: {
    backgroundColor: COLORS.aiBubble,
    borderBottomLeftRadius: 4,
    borderWidth: 1,
    borderColor: COLORS.border,
    shadowColor: "#000",
    shadowOpacity: 0.04,
    shadowRadius: 4,
    shadowOffset: { width: 0, height: 1 },
    elevation: 1,
  },
  bubbleText: { fontSize: 14.5, lineHeight: 21 },
  userText: { color: COLORS.userText },
  aiText: { color: COLORS.aiText },
  timestamp: {
    fontSize: 11,
    color: COLORS.timestamp,
    marginTop: 1,
    paddingHorizontal: 2,
  },
  uploadedImage: { width: 180, height: 140, borderRadius: 12 },

  // Typing dots
  typingDot: {
    width: 7,
    height: 7,
    borderRadius: 4,
    backgroundColor: COLORS.accent,
  },

  // Medicine suggestion card
  suggestionCard: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: COLORS.suggestionBg,
    borderWidth: 1,
    borderColor: COLORS.suggestionBorder,
    borderRadius: 14,
    padding: 12,
    gap: 10,
  },
  suggestionIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: COLORS.accentLight,
    alignItems: "center",
    justifyContent: "center",
  },
  suggestionInfo: { flex: 1 },
  suggestionName: { fontSize: 14, fontWeight: "700", color: COLORS.userBubble },
  suggestionQty: { fontSize: 12, color: COLORS.placeholder, marginTop: 2 },
  suggestionPrice: {
    backgroundColor: COLORS.priceTag,
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 10,
  },
  suggestionPriceText: { color: "#FFF", fontWeight: "700", fontSize: 13 },

  // Pending image preview
  pendingImageRow: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: COLORS.accentLight,
    marginHorizontal: 14,
    marginBottom: 6,
    padding: 8,
    borderRadius: 12,
    gap: 10,
    borderWidth: 1,
    borderColor: COLORS.suggestionBorder,
  },
  pendingThumb: { width: 44, height: 44, borderRadius: 8 },
  pendingLabel: {
    flex: 1,
    fontSize: 13,
    color: COLORS.userBubble,
    fontWeight: "500",
  },

  // Input bar
  inputBar: {
    flexDirection: "row",
    alignItems: "flex-end",
    paddingHorizontal: 10,
    paddingVertical: 10,
    paddingBottom: Platform.OS === "ios" ? 16 : 10,
    backgroundColor: COLORS.inputBg,
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
    gap: 8,
  },
  iconBtn: { padding: 4, justifyContent: "center", alignItems: "center" },
  input: {
    flex: 1,
    backgroundColor: COLORS.background,
    borderRadius: 22,
    paddingHorizontal: 16,
    paddingVertical: Platform.OS === "ios" ? 10 : 8,
    fontSize: 14.5,
    color: COLORS.userBubble,
    maxHeight: 110,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  sendBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: COLORS.sendBtn,
    alignItems: "center",
    justifyContent: "center",
  },
  sendBtnDisabled: { backgroundColor: COLORS.border },
});
