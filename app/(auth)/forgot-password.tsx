import { BlurView } from "expo-blur";
import { useRouter } from "expo-router";
import { FirebaseError } from "firebase/app"; // ✅ for typed error handling
import { sendPasswordResetEmail } from "firebase/auth";
import { useState } from "react";
import {
  ActivityIndicator,
  Alert,
  ImageBackground,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { auth } from "../../src/lib/firebase";

export default function ForgotPassword() {
  const router = useRouter();
  const [email, setEmail] = useState<string>(""); // ✅ typed state
  const [loading, setLoading] = useState<boolean>(false);

  const handleReset = async () => {
    if (!email) {
      Alert.alert("Validation Error", "Please enter your email.");
      return;
    }

    try {
      setLoading(true);
      await sendPasswordResetEmail(auth, email);

      Alert.alert(
        "Success",
        "Password reset email sent. Please check your inbox."
      );

      router.push("/(auth)/login");
    } catch (err) {
      const error = err as FirebaseError; // ✅ cast error to FirebaseError
      Alert.alert("Error", error.message || "Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  return (
    <ImageBackground
      source={{
        uri: "https://images.unsplash.com/photo-1507525428034-b723cf961d3e",
      }}
      style={{ flex: 1 }}
      resizeMode="cover"
    >
      {/* Dark overlay */}
      <View
        style={{
          ...StyleSheet.absoluteFillObject,
          backgroundColor: "rgba(0,0,0,0.5)",
        }}
      />

      <SafeAreaView
        style={{
          flex: 1,
          justifyContent: "center",
          alignItems: "center",
          padding: 20,
        }}
      >
        <BlurView intensity={80} tint="light" style={styles.card}>
          <Text style={styles.title}>Forgot Password</Text>
          <Text style={styles.subtitle}>
            Enter your email to reset your password
          </Text>

          {/* Email Input */}
          <TextInput
            placeholder="Your Email Address"
            placeholderTextColor="#ddd"
            value={email}
            onChangeText={setEmail}
            keyboardType="email-address"
            autoCapitalize="none"
            style={styles.input}
          />

          {/* Reset Button */}
          <TouchableOpacity
            onPress={handleReset}
            disabled={loading}
            style={styles.resetBtn}
          >
            {loading ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Text style={styles.resetText}>Send Reset Link</Text>
            )}
          </TouchableOpacity>

          {/* Back to Login */}
          <TouchableOpacity onPress={() => router.push("/(auth)/login")}>
            <Text style={styles.footerText}>
              Back to <Text style={styles.footerLink}>Login</Text>
            </Text>
          </TouchableOpacity>
        </BlurView>
      </SafeAreaView>
    </ImageBackground>
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius: 20,
    padding: 20,
    width: "100%",
    maxWidth: 400,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.3)",
    overflow: "hidden",
  },
  title: {
    fontSize: 22,
    fontWeight: "bold",
    textAlign: "center",
    marginBottom: 5,
    color: "white",
  },
  subtitle: { textAlign: "center", color: "#ddd", marginBottom: 15 },
  input: {
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.3)",
    borderRadius: 8,
    padding: 12,
    marginBottom: 15,
    color: "white",
  },
  resetBtn: {
    backgroundColor: "rgba(37, 99, 235, 0.8)",
    borderRadius: 8,
    paddingVertical: 14,
    marginBottom: 12,
  },
  resetText: {
    color: "white",
    textAlign: "center",
    fontSize: 16,
    fontWeight: "600",
  },
  footerText: { textAlign: "center", color: "white" },
  footerLink: { color: "#93c5fd", fontWeight: "600" },
});
