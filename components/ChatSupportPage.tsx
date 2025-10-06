import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import {
    addDoc,
    collection,
    doc,
    onSnapshot,
    orderBy,
    query,
    serverTimestamp,
} from "firebase/firestore";
import React, { useEffect, useRef, useState } from "react";
import {
    ActivityIndicator,
    FlatList,
    KeyboardAvoidingView,
    Platform,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from "react-native";
import "react-native-get-random-values";
import { v4 as uuidv4 } from "uuid";
import { db } from "../src/lib/firebase";



export default function ChatSupportPage() {
  const router = useRouter();
  const [message, setMessage] = useState("");
  const [messages, setMessages] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const flatListRef = useRef<FlatList>(null);
  const guestId = useRef(uuidv4()).current;

  const adminNumber = "+63 912 345 6789";

  // ✅ FAQ auto-reply list
  const faqResponses: Record<string, string> = {
    hello: "Hi there! 👋 I’m Luwie, your travel buddy. How can I help you today?",
    "how to book":
      "You can book by visiting any destination or itinerary page and filling out the booking form ✅",
    "payment methods":
      "We currently accept QRPh and other supported payment methods 💳",
    "cancel booking":
      "To cancel your booking, go to Travel History → select your trip → Cancel ❌",
    "contact admin": `You can contact our admin at ${adminNumber} 📞`,
  };

  const quickReplies = [
    "How to book",
    "Payment methods",
    "Cancel booking",
    "Contact admin",
  ];

  // 🧠 Initialize Firestore messages & listen in real-time
  useEffect(() => {
    const convoRef = doc(db, "conversations", guestId);
    const messagesRef = collection(convoRef, "messages");

    // Send intro greeting only once
    addDoc(messagesRef, {
      text: "Hi 👋 I’m Luwie, your travel assistant! You can ask me about booking, payments, or cancellations 🌍",
      sender: "bot",
      createdAt: serverTimestamp(),
    });

    const q = query(messagesRef, orderBy("createdAt"));
    const unsub = onSnapshot(q, (snap) => {
      const newMsgs = snap.docs.map((d) => ({ id: d.id, ...d.data() }));
      setMessages(newMsgs);
      setLoading(false);
      setTimeout(() => {
        flatListRef.current?.scrollToEnd({ animated: true });
      }, 300);
    });

    return unsub;
  }, []);

  // ✉️ Send user message + bot reply
  const sendMessage = async (preset?: string) => {
    const msg = preset || message.trim();
    if (!msg) return;

    const convoRef = doc(db, "conversations", guestId);
    const messagesRef = collection(convoRef, "messages");

    await addDoc(messagesRef, {
      text: msg,
      sender: "user",
      createdAt: serverTimestamp(),
    });

    // find a matching reply
    let reply = `I’m not sure about that 🤔. Please contact our admin at ${adminNumber}.`;
    Object.keys(faqResponses).forEach((key) => {
      if (msg.toLowerCase().includes(key)) reply = faqResponses[key];
    });

    await addDoc(messagesRef, {
      text: reply,
      sender: "bot",
      createdAt: serverTimestamp(),
    });

    setMessage("");
  };

  // 💬 Message bubble renderer
  const renderMessage = ({ item }: { item: any }) => {
    const isUser = item.sender === "user";
    return (
      <View
        style={{
          alignSelf: isUser ? "flex-end" : "flex-start",
          marginVertical: 6,
          marginHorizontal: 12,
          padding: 12,
          borderRadius: 18,
          maxWidth: "75%",
          backgroundColor: isUser ? "#007AFF" : "#f0f0f0",
        }}
      >
        <Text style={{ color: isUser ? "white" : "black", fontSize: 15 }}>
          {item.text}
        </Text>
      </View>
    );
  };

  return (
    <KeyboardAvoidingView
      style={{ flex: 1, backgroundColor: "white" }}
      behavior={Platform.OS === "ios" ? "padding" : undefined}
    >
      {/* 🔹 Header */}
      <View
        style={{
          paddingTop: Platform.OS === "ios" ? 48 : 16,
          height: Platform.OS === "ios" ? 96 : 72,
          backgroundColor: "#007AFF",
          justifyContent: "flex-end",
          alignItems: "center",
          paddingBottom: 12,
          shadowColor: "#000",
          shadowOffset: { width: 0, height: 2 },
          shadowOpacity: 0.15,
          shadowRadius: 3,
          elevation: 3,
        }}
      >
        <TouchableOpacity
          onPress={() =>
            router.canGoBack()
              ? router.back()
              : router.replace("/(tabs)/profile")
          }
          style={{ position: "absolute", left: 16, bottom: 10, padding: 6 }}
        >
          <Ionicons name="arrow-back" size={24} color="white" />
        </TouchableOpacity>

        <Text style={{ color: "white", fontWeight: "600", fontSize: 18 }}>
          Chat with Luwie 🤖
        </Text>
      </View>

      {/* 🗨️ Messages */}
      {loading ? (
        <ActivityIndicator style={{ flex: 1 }} />
      ) : (
        <FlatList
          ref={flatListRef}
          data={messages}
          keyExtractor={(item) => item.id}
          renderItem={renderMessage}
          contentContainerStyle={{ paddingVertical: 8 }}
        />
      )}

      {/* ⚡ Quick Replies */}
      <View
        style={{
          flexDirection: "row",
          flexWrap: "wrap",
          padding: 8,
          borderTopWidth: 1,
          borderColor: "#eee",
          backgroundColor: "#fafafa",
        }}
      >
        {quickReplies.map((qr) => (
          <TouchableOpacity
            key={qr}
            onPress={() => sendMessage(qr)}
            style={{
              backgroundColor: "#e6f0ff",
              paddingHorizontal: 12,
              paddingVertical: 8,
              borderRadius: 16,
              margin: 4,
            }}
          >
            <Text style={{ color: "#007AFF" }}>{qr}</Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* ✏️ Input Field */}
      <View
        style={{
          flexDirection: "row",
          alignItems: "center",
          padding: 10,
          borderTopWidth: 1,
          borderColor: "#eee",
          backgroundColor: "#fff",
        }}
      >
        <TextInput
          value={message}
          onChangeText={setMessage}
          placeholder="Type a message..."
          style={{
            flex: 1,
            backgroundColor: "#f9f9f9",
            borderRadius: 25,
            paddingHorizontal: 16,
            paddingVertical: 12,
          }}
          onSubmitEditing={() => sendMessage()}
        />
        <TouchableOpacity
          onPress={() => sendMessage()}
          style={{
            marginLeft: 8,
            backgroundColor: "#007AFF",
            borderRadius: 24,
            padding: 12,
          }}
        >
          <Ionicons name="send" size={20} color="white" />
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  );
}
