import { Ionicons } from "@expo/vector-icons";
import { useLocalSearchParams, useRouter } from "expo-router";
import LottieView from "lottie-react-native";
import React from "react";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";

export default function BookingSuccessPage() {
  const { type, title } = useLocalSearchParams<{ type: string; title: string }>();
  const router = useRouter();

  // ✅ Dynamic values
  const bookingType =
    type && type.length > 0
      ? type.charAt(0).toUpperCase() + type.slice(1).toLowerCase()
      : "Booking";

  const tripTitle = title || "your trip";

  return (
    <View style={styles.container}>
      {/* 🎉 Confetti Animation (Lottie)
      <LottieView
        source={require("../assets/lottie/confetti.json")}
        autoPlay
        loop={false}
        style={styles.confetti}
      /> */}

      <LottieView
        source={require("../assets/lottie/confetti.json")}
        autoPlay
        loop={true}
        style={styles.confetti}
        />


      {/* ✅ Success Animation */}
      <LottieView
        source={require("../assets/lottie/success.json")}
        autoPlay
        loop={true}   // ✅ keeps looping forever
        style={styles.lottie}
        />


      {/* Headline */}
      <Text style={styles.headline}>Payment Successfully Submitted!</Text>

      {/* Message */}
      <Text style={styles.message}>
        🎉 Thank you for uploading your payment proof. {"\n"}
        We’re now reviewing your{" "}
        <Text style={styles.highlight}>{tripTitle}</Text> {bookingType}. {"\n"}
        Please wait while our team verifies your payment. {"\n"}
        You’ll receive an <Text style={styles.highlight}>email confirmation</Text> once it’s approved.
      </Text>

      {/* Action Buttons */}
      <View style={styles.buttons}>
        <TouchableOpacity
          style={[styles.btn, styles.primaryBtn]}
          onPress={() => router.push("/history")}
        >
          <Ionicons name="book-outline" size={18} color="#fff" />
          <Text style={styles.btnText}>View My Booking</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.btn, styles.secondaryBtn]}
          onPress={() => router.push("/")}
        >
          <Ionicons name="home-outline" size={18} color="#2563EB" />
          <Text style={styles.secondaryText}>Back to Home</Text>
        </TouchableOpacity>
      </View>

      {/* Branding */}
      <View style={styles.footer}>
        <Text style={styles.footerText}>
          🌊 <Text style={{ fontWeight: "700", color: "#2563EB" }}>LUWAS</Text> – Travel Smarter,
          Travel Further. {"\n"}
          Making every journey seamless and unforgettable.
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F9FAFB",
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 20,
  },
  confetti: {
    position: "absolute",
    width: "100%",
    height: "100%",
    zIndex: -1,
  },
  lottie: {
    width: 250,
    height: 250,
    marginBottom: 20,
  },
  headline: {
    fontSize: 22,
    fontWeight: "800",
    color: "#1E40AF",
    textAlign: "center",
    marginBottom: 12,
  },
  message: {
    fontSize: 14,
    color: "#444",
    textAlign: "center",
    lineHeight: 22,
    marginBottom: 30,
  },
  highlight: { fontWeight: "700", color: "#1E3A8A" },
  buttons: {
    flexDirection: "row",
    gap: 12,
    marginBottom: 40,
  },
  btn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    borderRadius: 12,
    paddingVertical: 14,
    paddingHorizontal: 20,
  },
  primaryBtn: {
    backgroundColor: "#2563EB",
  },
  btnText: {
    color: "#fff",
    fontWeight: "700",
    fontSize: 14,
  },
  secondaryBtn: {
    borderWidth: 1,
    borderColor: "#2563EB",
    backgroundColor: "#fff",
  },
  secondaryText: {
    color: "#2563EB",
    fontWeight: "700",
    fontSize: 14,
  },
  footer: {
    position: "absolute",
    bottom: 20,
    alignItems: "center",
  },
  footerText: {
    fontSize: 12,
    color: "#666",
    textAlign: "center",
    fontStyle: "italic",
  },
});