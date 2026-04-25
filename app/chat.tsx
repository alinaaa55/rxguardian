// app/chat.tsx
import { Feather, Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import * as ImagePicker from "expo-image-picker";
import { useRouter } from "expo-router";
import { useCallback, useEffect, useRef, useState } from "react";
import {
  ActivityIndicator,
  Animated,
  Dimensions,
  FlatList,
  Image,
  KeyboardAvoidingView,
  Linking,
  Modal,
  Platform,
  Pressable,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { theme } from "../constants/theme";
import { chatService, PharmEasyResult } from "../services/chatService";
import { useSettings } from "../context/SettingsContext";

const { height: SCREEN_HEIGHT } = Dimensions.get("window");

// ─── Types ───────────────────────────────────────────────────────────────────
type UIMessage = {
  id: string;
  role: "user" | "assistant";
  text: string;
  imageUri?: string;
  suggestion?: PharmEasyResult[];
  timestamp: Date;
};

// ─── Medicine Action Card ──────────────────────────────────────────────────
const MedicineChip = ({ result, onPress }: { result: PharmEasyResult, onPress: () => void }) => {
  const { fontSizeMultiplier, elderlyMode } = useSettings();
  const firstImage = result.results[0]?.image;

  return (
    <TouchableOpacity style={[styles.medicineActionCard, elderlyMode && styles.medicineActionCardElderly]} onPress={onPress}>
      <View style={styles.cardImageContainer}>
        {firstImage ? (
          <Image source={{ uri: firstImage }} style={styles.cardImage} />
        ) : (
          <MaterialCommunityIcons name="pill" size={24 * fontSizeMultiplier} color={theme.colors.primaryAccent} />
        )}
      </View>
      <View style={styles.cardContent}>
        <Text style={[styles.cardTitle, { fontSize: 14 * fontSizeMultiplier }]} numberOfLines={1}>{result.medicine}</Text>
        <Text style={[styles.cardSubtitle, { fontSize: 12 * fontSizeMultiplier }]}>{result.results.length} options available</Text>
      </View>
      <View style={styles.cardAction}>
        <Feather name="arrow-right" size={18 * fontSizeMultiplier} color={theme.colors.primaryAccent} />
      </View>
    </TouchableOpacity>
  );
};

// ─── Typing Indicator ─────────────────────────────────────────────────────────
const TypingIndicator = () => {
  const dots = [
    useRef(new Animated.Value(0)).current,
    useRef(new Animated.Value(0)).current,
    useRef(new Animated.Value(0)).current,
  ];

  useEffect(() => {
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
    <View style={[styles.bubbleWrapper, styles.aiWrapper]}>
      <View style={styles.avatarSmall}>
        <MaterialCommunityIcons
          name="robot-happy-outline"
          size={16}
          color={theme.colors.primaryAccent}
        />
      </View>
      <View style={{ flexShrink: 1, gap: 4 }}>
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
    </View>
  );
};

// ─── Message Bubble ───────────────────────────────────────────────────────────
const MessageBubble = ({ 
  message, 
  onMedicinePress,
  onImagePress 
}: { 
  message: UIMessage, 
  onMedicinePress: (res: PharmEasyResult) => void,
  onImagePress: (uri: string) => void
}) => {
  const { fontSizeMultiplier, elderlyMode } = useSettings();
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
            size={16 * fontSizeMultiplier}
            color={theme.colors.primaryAccent}
          />
        </View>
      )}

      <View style={{ maxWidth: "82%" }}>
        <View style={{ gap: 4 }}>
          {message.imageUri && (
            <TouchableOpacity 
              activeOpacity={0.9}
              onPress={() => onImagePress(message.imageUri!)}
              style={[
                styles.bubble,
                isUser ? styles.userBubble : styles.aiBubble,
                elderlyMode && (isUser ? styles.userBubbleElderly : styles.aiBubbleElderly),
                { padding: 6 },
              ]}
            >
              <Image
                source={{ uri: message.imageUri }}
                style={styles.uploadedImage}
                resizeMode="cover"
              />
            </TouchableOpacity>
          )}

          {message.text ? (
            <View
              style={[
                styles.bubble,
                isUser ? styles.userBubble : styles.aiBubble,
                elderlyMode && (isUser ? styles.userBubbleElderly : styles.aiBubbleElderly),
              ]}
            >
              <Text
                style={[
                  styles.bubbleText,
                  isUser ? styles.userText : styles.aiText,
                  { fontSize: 14.5 * fontSizeMultiplier }
                ]}
              >
                {formatText(message.text)}
              </Text>
            </View>
          ) : null}

          {message.suggestion && message.suggestion.length > 0 && (
            <View style={styles.chipsContainer}>
              {message.suggestion.map((res, i) => (
                <MedicineChip
                  key={i}
                  result={res}
                  onPress={() => onMedicinePress(res)}
                />
              ))}
            </View>
          )}
        </View>

        <Text
          style={[
            styles.timestamp,
            isUser ? { textAlign: 'right', alignSelf: 'flex-end', marginRight: 4 } : { textAlign: 'left', alignSelf: 'flex-start', marginLeft: 4 },
            { marginTop: 4, fontSize: 10 * fontSizeMultiplier }
          ]}
        >
          {timeStr}
        </Text>
      </View>

      {isUser && (
        <View style={styles.userAvatarSmall}>
          <Ionicons name="person" size={14 * fontSizeMultiplier} color={theme.colors.surface} />
        </View>
      )}
    </View>
  );
};

// ─── Main Chat Screen ─────────────────────────────────────────────────────────
export default function ChatScreen() {
  const router = useRouter();
  const flatRef = useRef<FlatList>(null);
  const { fontSizeMultiplier, elderlyMode } = useSettings();

  const [messages, setMessages] = useState<UIMessage[]>([]);
  const [input, setInput] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const [pendingImage, setPendingImage] = useState<string | null>(null);
  const [loadingHistory, setLoadingHistory] = useState(true);

  // Bottom Sheet State
  const [selectedMedicine, setSelectedMedicine] = useState<PharmEasyResult | null>(null);
  const [sheetVisible, setSheetVisible] = useState(false);
  
  // Image Preview State
  const [previewImage, setPreviewImage] = useState<string | null>(null);

  const scrollToBottom = () => {
    setTimeout(() => flatRef.current?.scrollToEnd({ animated: true }), 100);
  };

  useEffect(() => {
    loadHistory();
  }, []);

  const loadHistory = async () => {
    try {
      const history = await chatService.getHistory();
      const uiHistory: UIMessage[] = history.map((msg) => {
        let text = msg.message || "";
        const imageUri = msg.localImageUri;

        // Strip [image] prefix for UI
        if (text.includes('[image]')) {
          text = text.replace('[image]', '').trim();
        }

        return {
          id: msg.id.toString(),
          role: msg.sender === 'user' ? 'user' : 'assistant',
          text: text,
          imageUri: imageUri,
          suggestion: msg.pharmeasy_results,
          timestamp: new Date(msg.timestamp),
        };
      });

      if (uiHistory.length === 0) {
        setMessages([
          {
            id: "0",
            role: "assistant",
            text: "Hi! I'm RxGuardian AI. 👋\n\nI can analyze your prescriptions, check drug interactions, and help manage your medications. How can I help you today?",
            timestamp: new Date(),
          },
        ]);
      } else {
        setMessages(uiHistory);
      }
    } catch (error) {
      console.error("Failed to load history:", error);
    } finally {
      setLoadingHistory(false);
    }
  };

  const handleNewChat = async () => {
    try {
      await chatService.clearHistory();
      setMessages([
        {
          id: "0",
          role: "assistant",
          text: "Hi! I'm RxGuardian AI. 👋\n\nI can analyze your prescriptions, check drug interactions, and help manage your medications. How can I help you today?",
          timestamp: new Date(),
        },
      ]);
    } catch (error) {
      console.error("Failed to clear history:", error);
    }
  };

  const sendMessage = useCallback(async () => {
    const trimmed = input.trim();
    if (!trimmed && !pendingImage) return;

    const tempId = Date.now().toString();
    const userMsg: UIMessage = {
      id: tempId,
      role: "user",
      text: trimmed,
      imageUri: pendingImage ?? undefined,
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMsg]);
    const currentInput = trimmed;
    const currentImage = pendingImage;

    setInput("");
    setPendingImage(null);
    setIsTyping(true);
    scrollToBottom();

    try {
      let response;
      if (currentImage) {
        response = await chatService.sendImageMessage(currentInput || "Analyze this prescription", currentImage);
      } else {
        response = await chatService.sendMessage(currentInput);
      }

      // Update the user message with the real ID from server
      setMessages(prev => prev.map(m => {
        if (m.id === tempId) {
          let text = response.user_message.message;
          if (text.startsWith('[image]')) {
            text = text.replace('[image]', '').trim();
          }
          return {
            ...m,
            id: response.user_message.id.toString(),
            text: text
          };
        }
        return m;
      }));

      const newMessages: UIMessage[] = [];
      if (response.pre_tool_message) {
        newMessages.push({
          id: response.pre_tool_message.id.toString(),
          role: 'assistant',
          text: response.pre_tool_message.message,
          timestamp: new Date(response.pre_tool_message.timestamp),
        });
      }

      newMessages.push({
        id: response.bot_message.id.toString(),
        role: 'assistant',
        text: response.bot_message.message,
        suggestion: response.pharmeasy_results,
        timestamp: new Date(response.bot_message.timestamp),
      });

      setIsTyping(false);
      setMessages((prev) => [...prev, ...newMessages]);
      scrollToBottom();
    } catch (error) {
      console.error("Chat error:", error);
      setIsTyping(false);
      setMessages((prev) => [...prev, {
        id: Date.now().toString(),
        role: 'assistant',
        text: "Sorry, I encountered an error processing your request. Please try again.",
        timestamp: new Date(),
      }]);
    }
  }, [input, pendingImage]);

  const handleMedicinePress = (res: PharmEasyResult) => {
    setSelectedMedicine(res);
    setSheetVisible(true);
  };

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
    <SafeAreaView style={[styles.safe, elderlyMode && { backgroundColor: "#fff" }]} edges={['top', 'left', 'right']}>
      <StatusBar barStyle="dark-content" />

      {/* ── Header ── */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
          <Ionicons name="chevron-back" size={22 * fontSizeMultiplier} color={theme.colors.primary} />
        </TouchableOpacity>

        <View style={styles.headerCenter}>
          <View style={styles.headerAvatar}>
            <MaterialCommunityIcons
              name="robot-happy-outline"
              size={22 * fontSizeMultiplier}
              color={theme.colors.surface}
            />
          </View>
          <View>
            <Text style={[styles.headerTitle, { fontSize: 16 * fontSizeMultiplier }]}>RxGuardian AI</Text>
            <View style={styles.onlineRow}>
              <View style={styles.onlineDot} />
              <Text style={[styles.onlineText, { fontSize: 12 * fontSizeMultiplier }]}>Online now</Text>
            </View>
          </View>
        </View>

        <TouchableOpacity onPress={handleNewChat} style={styles.newChatBtn}>
          <MaterialCommunityIcons
            name="chat-plus-outline"
            size={22 * fontSizeMultiplier}
            color={theme.colors.primary}
          />
        </TouchableOpacity>
      </View>

      {/* ── Messages + Input ── */}
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        keyboardVerticalOffset={Platform.OS === "ios" ? 90 : 20}
      >
        {loadingHistory ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color={theme.colors.primary} />
            <Text style={[styles.loadingText, { fontSize: 14 * fontSizeMultiplier }]}>Loading chat history...</Text>
          </View>
        ) : (
          <FlatList
            ref={flatRef}
            data={messages}
            keyExtractor={(item) => item.id}
            contentContainerStyle={styles.messageList}
            showsVerticalScrollIndicator={false}
            ListFooterComponent={isTyping ? <TypingIndicator /> : null}
            renderItem={({ item }) => (
              <MessageBubble
                message={item}
                onMedicinePress={handleMedicinePress}
                onImagePress={(uri) => setPreviewImage(uri)}
              />
            )}
            onContentSizeChange={scrollToBottom}
            />
            )}

            {/* Pending image preview */}
            {pendingImage && (
            <View style={styles.pendingImageRow}>
            <Image source={{ uri: pendingImage }} style={styles.pendingThumb} />
            <Text style={[styles.pendingLabel, { fontSize: 13 * fontSizeMultiplier }]}>Image ready to send</Text>
            <TouchableOpacity onPress={() => setPendingImage(null)}>
              <Ionicons
                name="close-circle"
                size={20 * fontSizeMultiplier}
                color={theme.colors.text.secondary}
              />
            </TouchableOpacity>
            </View>
            )}

            {/* ── Input Bar ── */}
            <SafeAreaView edges={['bottom']}>
            <View style={styles.inputBar}>
            <TouchableOpacity onPress={pickImage} style={styles.iconBtn}>
              <Ionicons
                name="add-circle-outline"
                size={26 * fontSizeMultiplier}
                color={theme.colors.tabInactive}
              />
            </TouchableOpacity>

            <TextInput
              style={[styles.input, { fontSize: 14.5 * fontSizeMultiplier }]}
              placeholder="Type a message…"
              placeholderTextColor={theme.colors.tabInactive}
              value={input}
              onChangeText={setInput}
              multiline
              maxLength={500}
            />

            <TouchableOpacity onPress={takePicture} style={styles.iconBtn}>
              <Feather name="camera" size={22 * fontSizeMultiplier} color={theme.colors.tabInactive} />
            </TouchableOpacity>

            <TouchableOpacity
              onPress={sendMessage}
              style={[
                styles.sendBtn,
                !input.trim() && !pendingImage && styles.sendBtnDisabled,
              ]}
              disabled={!input.trim() && !pendingImage}
            >
              <Ionicons name="send" size={17 * fontSizeMultiplier} color={theme.colors.surface} />
            </TouchableOpacity>
            </View>
            </SafeAreaView>
            </KeyboardAvoidingView>

            {/* ── Bottom Sheet (Modal) ── */}
            <Modal
            visible={sheetVisible}
            transparent
            animationType="slide"
            onRequestClose={() => setSheetVisible(false)}
            >
            <Pressable
            style={styles.modalOverlay}
            onPress={() => setSheetVisible(false)}
            />
            <View style={[styles.bottomSheet, elderlyMode && styles.bottomSheetElderly]}>
            <View style={styles.sheetHeader}>
            <View style={styles.sheetHandle} />
            <View style={styles.sheetTitleRow}>
              <Text style={[styles.sheetTitle, { fontSize: 20 * fontSizeMultiplier }]}>PharmEasy Results</Text>
              <TouchableOpacity onPress={() => setSheetVisible(false)}>
                <Ionicons name="close-circle" size={24 * fontSizeMultiplier} color={theme.colors.text.secondary} />
              </TouchableOpacity>
            </View>
            <Text style={[styles.sheetSubtitle, { fontSize: 14 * fontSizeMultiplier }]}>Search results for: {selectedMedicine?.medicine}</Text>
            </View>

            <ScrollView
            contentContainerStyle={styles.sheetContent}
            showsVerticalScrollIndicator={false}
            >
            {selectedMedicine?.results.map((item, index) => (
              <TouchableOpacity
                key={index}
                style={[styles.resultItem, elderlyMode && styles.resultItemElderly]}
                onPress={() => Linking.openURL(item.url)}
              >
                <Image source={{ uri: item.image }} style={styles.resultImage} />
                <View style={styles.resultInfo}>
                  <Text style={[styles.resultName, { fontSize: 14 * fontSizeMultiplier }]} numberOfLines={2}>{item.title}</Text>
                  <Text style={[styles.buyText, { fontSize: 13 * fontSizeMultiplier }]}>Buy Now on PharmEasy →</Text>
                </View>
              </TouchableOpacity>
            ))}
            </ScrollView>
            </View>
            </Modal>

            {/* ── Image Preview Modal ── */}
            <Modal
            visible={!!previewImage}
            transparent
            animationType="fade"
            onRequestClose={() => setPreviewImage(null)}
            >
            <View style={styles.previewOverlay}>
            <TouchableOpacity 
            style={styles.previewClose}
            onPress={() => setPreviewImage(null)}
            >
            <Ionicons name="close" size={30 * fontSizeMultiplier} color={theme.colors.surface} />
            </TouchableOpacity>

            {previewImage && (
            <Image 
              source={{ uri: previewImage }} 
              style={styles.fullImage} 
              resizeMode="contain"
            />
            )}
            </View>
            </Modal>
            </SafeAreaView>
            );
            }

            // ─── Styles ───────────────────────────────────────────────────────────────────
            const styles = StyleSheet.create({
            safe: { flex: 1, backgroundColor: theme.colors.background },

            // Header
            header: {
            flexDirection: "row",
            alignItems: "center",
            paddingHorizontal: 12,
            paddingVertical: 10,
            backgroundColor: theme.colors.surface,
            borderBottomWidth: 1,
            borderBottomColor: theme.colors.border,
            elevation: 2,
            shadowColor: "#000",
            shadowOpacity: 0.06,
            shadowRadius: 4,
            shadowOffset: { width: 0, height: 2 },
            },
            backBtn: { padding: 6, borderRadius: 20 },
            newChatBtn: { padding: 6, borderRadius: 20 },
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
            backgroundColor: theme.colors.primary,
            alignItems: "center",
            justifyContent: "center",
            },
            headerTitle: {
            fontSize: 16,
            fontWeight: "700",
            color: theme.colors.primary,
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
            backgroundColor: theme.colors.successLight,
            },
            onlineText: { fontSize: 12, color: theme.colors.success, fontWeight: "500" },

            // Messages
            messageList: { paddingHorizontal: 14, paddingVertical: 12, gap: 10 },
            bubbleWrapper: {
            flexDirection: "row",
            alignItems: "flex-start",
            gap: 8,
            marginVertical: 4,
            },
            userWrapper: { alignSelf: "flex-end" },
            aiWrapper: { alignSelf: "flex-start" },
            avatarSmall: {
            width: 30,
            height: 30,
            borderRadius: 15,
            backgroundColor: theme.colors.primaryLight,
            alignItems: "center",
            justifyContent: "center",
            marginTop: 2,
            },
            userAvatarSmall: {
            width: 28,
            height: 28,
            borderRadius: 14,
            backgroundColor: theme.colors.primaryAccent,
            alignItems: "center",
            justifyContent: "center",
            marginLeft: 8,
            marginTop: 2,
            },
            bubble: {
            borderRadius: 18,
            paddingHorizontal: 14,
            paddingVertical: 10,
            },
            userBubble: {
            backgroundColor: theme.colors.primary,
            borderBottomRightRadius: 4,
            },
            userBubbleElderly: {
              shadowOpacity: 0,
              elevation: 0,
            },
            aiBubble: {
            backgroundColor: theme.colors.surface,
            borderBottomLeftRadius: 4,
            borderWidth: 1,
            borderColor: theme.colors.border,
            shadowColor: "#000",
            shadowOpacity: 0.04,
            shadowRadius: 4,
            shadowOffset: { width: 0, height: 1 },
            elevation: 1,
            },
            aiBubbleElderly: {
              borderWidth: 1.5,
              borderColor: theme.colors.border,
              shadowOpacity: 0,
              elevation: 0,
            },
            bubbleText: { fontSize: 14.5, lineHeight: 21 },
            userText: { color: theme.colors.surface },
            aiText: { color: theme.colors.text.primary },
            timestamp: {
            fontSize: 10,
            color: theme.colors.text.secondary,
            },
            uploadedImage: { width: 180, height: 140, borderRadius: 12 },

            // Chips Container
            chipsContainer: {
            flexDirection: 'column',
            gap: 10,
            marginTop: 8,
            width: '100%',
            },
            medicineActionCard: {
            flexDirection: 'row',
            alignItems: 'center',
            backgroundColor: theme.colors.surface,
            padding: 12,
            borderRadius: 18,
            gap: 12,
            borderWidth: 1,
            borderColor: theme.colors.border,
            ...theme.shadows.sm,
            },
            medicineActionCardElderly: {
              borderWidth: 1.5,
              borderColor: theme.colors.border,
              shadowOpacity: 0,
              elevation: 0,
              padding: 16,
            },
            cardImageContainer: {
            width: 50,
            height: 50,
            borderRadius: 10,
            backgroundColor: theme.colors.background,
            alignItems: 'center',
            justifyContent: 'center',
            overflow: 'hidden',
            },
            cardImage: {
            width: '100%',
            height: '100%',
            },
            cardContent: {
            flex: 1,
            },
            cardTitle: {
            fontSize: 14,
            fontWeight: '700',
            color: theme.colors.text.primary,
            },
            cardSubtitle: {
            fontSize: 12,
            color: theme.colors.text.secondary,
            marginTop: 2,
            },
            cardAction: {
            width: 32,
            height: 32,
            borderRadius: 16,
            backgroundColor: theme.colors.primaryLight,
            alignItems: 'center',
            justifyContent: 'center',
            },

            // Bottom Sheet
            modalOverlay: {
            flex: 1,
            backgroundColor: 'rgba(0,0,0,0.4)',
            },
            bottomSheet: {
            position: 'absolute',
            bottom: 0,
            left: 0,
            right: 0,
            height: SCREEN_HEIGHT * 0.65,
            backgroundColor: theme.colors.background,
            borderTopLeftRadius: 30,
            borderTopRightRadius: 30,
            paddingTop: 12,
            ...theme.shadows.lg,
            },
            bottomSheetElderly: {
              shadowOpacity: 0,
              elevation: 0,
              borderTopWidth: 2,
              borderTopColor: theme.colors.primary,
            },
            sheetHeader: {
            paddingHorizontal: 24,
            paddingBottom: 16,
            borderBottomWidth: 1,
            borderBottomColor: theme.colors.border,
            },
            sheetHandle: {
            width: 40,
            height: 4,
            backgroundColor: '#E2E8F0',
            borderRadius: 2,
            alignSelf: 'center',
            marginBottom: 16,
            },
            sheetTitleRow: {
            flexDirection: 'row',
            justifyContent: 'space-between',
            alignItems: 'center',
            },
            sheetTitle: {
            fontSize: 20,
            fontWeight: '700',
            color: theme.colors.primary,
            },
            sheetSubtitle: {
            fontSize: 14,
            color: theme.colors.text.secondary,
            marginTop: 4,
            },
            sheetContent: {
            padding: 20,
            gap: 16,
            },
            resultItem: {
            flexDirection: 'row',
            alignItems: 'center',
            backgroundColor: theme.colors.surface,
            borderRadius: 18,
            padding: 12,
            gap: 16,
            ...theme.shadows.sm,
            borderWidth: 1,
            borderColor: theme.colors.border,
            },
            resultItemElderly: {
              borderWidth: 1.5,
              borderColor: theme.colors.border,
              shadowOpacity: 0,
              elevation: 0,
              padding: 16,
            },
            resultImage: {
            width: 60,
            height: 60,
            borderRadius: 12,
            backgroundColor: theme.colors.background,
            },
            resultInfo: {
            flex: 1,
            },
            resultName: {
            fontSize: 14,
            fontWeight: '600',
            color: theme.colors.text.primary,
            lineHeight: 20,
            },
            buyText: {
            fontSize: 13,
            fontWeight: '700',
            color: theme.colors.primaryAccent,
            marginTop: 6,
            },

            // Typing dots
            typingDot: {
            width: 7,
            height: 7,
            borderRadius: 4,
            backgroundColor: theme.colors.primaryAccent,
            },

            // Pending image preview
            pendingImageRow: {
            flexDirection: "row",
            alignItems: "center",
            backgroundColor: theme.colors.primaryLight,
            marginHorizontal: 14,
            marginBottom: 6,
            padding: 8,
            borderRadius: 12,
            gap: 10,
            borderWidth: 1,
            borderColor: theme.colors.border,
            },
            pendingThumb: { width: 44, height: 44, borderRadius: 8 },
            pendingLabel: {
            flex: 1,
            fontSize: 13,
            color: theme.colors.text.primary,
            fontWeight: "500",
            },

            // Input bar
            inputBar: {
            flexDirection: "row",
            alignItems: "center",
            paddingHorizontal: 10,
            paddingVertical: 10,
            backgroundColor: theme.colors.surface,
            borderTopWidth: 1,
            borderTopColor: theme.colors.border,
            gap: 8,
            },
            iconBtn: { padding: 4, justifyContent: "center", alignItems: "center" },
            input: {
            flex: 1,
            backgroundColor: theme.colors.background,
            borderRadius: 22,
            paddingHorizontal: 16,
            paddingVertical: Platform.OS === "ios" ? 10 : 8,
            fontSize: 14.5,
            color: theme.colors.text.primary,
            maxHeight: 110,
            borderWidth: 1,
            borderColor: theme.colors.border,
            },
            sendBtn: {
            width: 40,
            height: 40,
            borderRadius: 20,
            backgroundColor: theme.colors.primary,
            alignItems: "center",
            justifyContent: "center",
            },
            sendBtnDisabled: { backgroundColor: theme.colors.border },

            loadingContainer: {
            flex: 1,
            alignItems: "center",
            justifyContent: "center",
            gap: 12,
            },
            loadingText: {
            color: theme.colors.text.secondary,
            fontSize: 14,
            },

            // Image Preview
            previewOverlay: {
            flex: 1,
            backgroundColor: 'rgba(0,0,0,0.9)',
            justifyContent: 'center',
            alignItems: 'center',
            },
            previewClose: {
            position: 'absolute',
            top: 50,
            right: 20,
            zIndex: 1,
            padding: 10,
            },
            fullImage: {
            width: '100%',
            height: '80%',
            },
            });
