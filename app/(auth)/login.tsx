import { Ionicons } from "@expo/vector-icons";
// import * as Facebook from "expo-auth-session/providers/facebook";
import * as Google from "expo-auth-session/providers/google";
import Constants from "expo-constants";
import { useRouter } from "expo-router";
import * as WebBrowser from "expo-web-browser";
import {
  // FacebookAuthProvider,
  GoogleAuthProvider,
  signInWithCredential,
  signInWithEmailAndPassword,
} from "firebase/auth";
import { doc, getDoc } from "firebase/firestore";
import { useCallback, useEffect, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Image,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { auth, db } from "../../src/lib/firebase";

WebBrowser.maybeCompleteAuthSession();

const GOOGLE_LOGO_URI =
  "https://www.google.com/images/branding/googleg/1x/googleg_standard_color_128dp.png";

export default function Login() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [emailFocused, setEmailFocused] = useState(false);
  const [passwordFocused, setPasswordFocused] = useState(false);

  const {
    GOOGLE_EXPO_CLIENT_ID,
    GOOGLE_ANDROID_CLIENT_ID,
    GOOGLE_IOS_CLIENT_ID,
    GOOGLE_WEB_CLIENT_ID,
    // FACEBOOK_APP_ID,
  } = Constants.expoConfig?.extra || {};

  // 👉 Google Auth Request
  const [googleRequest, googleResponse, promptGoogle] = Google.useAuthRequest({
    clientId: GOOGLE_EXPO_CLIENT_ID,
    iosClientId: GOOGLE_IOS_CLIENT_ID,
    androidClientId: GOOGLE_ANDROID_CLIENT_ID,
    webClientId: GOOGLE_WEB_CLIENT_ID,
  });



  // ✅ Handle Social Login (Google Only)
  const handleSocialLogin = useCallback(
    async (credential: any) => {
      try {
        setLoading(true);
        const cred = await signInWithCredential(auth, credential);

        const userDoc = await getDoc(doc(db, "users", cred.user.uid));
        if (!userDoc.exists()) {
          Alert.alert("Account Error", "No LUWAS profile found. Please register first.");
          return;
        }

        router.replace("/homesection");
      } catch (err: any) {
        Alert.alert("Social Login Failed", err.message);
      } finally {
        setLoading(false);
      }
    },
    [router]
  );

  // ✅ Effect for Social Logins (Google Only)
  useEffect(() => {
    if (googleResponse?.type === "success") {
      const { id_token } = googleResponse.params;
      const credential = GoogleAuthProvider.credential(id_token);
      handleSocialLogin(credential);
    }
  }, [googleResponse, handleSocialLogin]);

  // ✅ Email/Password Login
  const handleLogin = async () => {
    if (!email || !password) {
      Alert.alert("Validation Error", "Please fill in all fields.");
      return;
    }
    try {
      setLoading(true);
      const cred = await signInWithEmailAndPassword(auth, email, password);

      const userDoc = await getDoc(doc(db, "users", cred.user.uid));
      if (!userDoc.exists()) {
        Alert.alert("Account Error", "No LUWAS profile found.");
        return;
      }

      router.replace("/homesection");

    } catch (err: any) {
      Alert.alert("Login Failed", err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.root}>
      <SafeAreaView style={styles.safe} edges={["top", "left", "right", "bottom"]}>
        <ScrollView
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.scrollContent}
        >
          <View style={styles.header}>
            <View style={styles.heroLogoRow}>
              <View style={styles.heroLogoMark}>
                <Text style={styles.heroLogoLetter}>L</Text>
              </View>
              <Text style={styles.heroLogoWord}>LUWAS</Text>
            </View>
            <Text style={styles.heroHeading}>Where to next?</Text>
            <Text style={styles.heroSubheading}>Welcome back, explorer</Text>
          </View>

          <View style={styles.body}>
            <View style={styles.destChip}>
              <Ionicons name="location" size={18} color="#0369A1" />
              <Text style={styles.destChipText}>Your next destination awaits</Text>
            </View>

            <TouchableOpacity
              style={styles.googleBtn}
              disabled={!googleRequest}
              onPress={() => promptGoogle()}
            >
              <Image
                source={{ uri: GOOGLE_LOGO_URI }}
                style={styles.googleLogo}
                accessibilityLabel="Google"
              />
              <Text style={styles.googleLabel}>Continue with Google</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.appleBtn} disabled activeOpacity={0.85}>
              <Ionicons name="logo-apple" size={22} color="#FFFFFF" />
              <Text style={styles.appleLabel}>Continue with Apple</Text>
            </TouchableOpacity>

            <View style={styles.divider}>
              <View style={styles.dividerLine} />
              <Text style={styles.dividerText}>Or email</Text>
              <View style={styles.dividerLine} />
            </View>

            <TextInput
              placeholder="Your Email Address"
              placeholderTextColor="#94A3B8"
              value={email}
              onChangeText={setEmail}
              keyboardType="email-address"
              autoCapitalize="none"
              onFocus={() => setEmailFocused(true)}
              onBlur={() => setEmailFocused(false)}
              style={[styles.input, emailFocused && styles.inputFocused]}
            />
            <TextInput
              placeholder="Enter your Password"
              placeholderTextColor="#94A3B8"
              value={password}
              onChangeText={setPassword}
              secureTextEntry
              onFocus={() => setPasswordFocused(true)}
              onBlur={() => setPasswordFocused(false)}
              style={[styles.input, passwordFocused && styles.inputFocused]}
            />

            <TouchableOpacity onPress={() => router.push("/(auth)/forgot-password")}>
              <Text style={styles.linkRight}>Forgot Password?</Text>
            </TouchableOpacity>

            <TouchableOpacity onPress={handleLogin} disabled={loading} style={styles.loginBtn}>
              {loading ? (
                <ActivityIndicator color="#FFFFFF" />
              ) : (
                <Text style={styles.loginText}>Sign in to Luwas</Text>
              )}
            </TouchableOpacity>

            <View style={styles.bioRow}>
              <View style={styles.bioIconBox}>
                <Ionicons name="finger-print-outline" size={20} color="#94A3B8" />
              </View>
              <Text style={styles.bioLabel}>Use Face ID or Fingerprint</Text>
            </View>

            <TouchableOpacity onPress={() => router.push("/(auth)/register")}>
              <Text style={styles.footerText}>
                No account yet? <Text style={styles.footerLink}>Sign up</Text>
              </Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: "#F8FAFC",
  },
  safe: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    paddingBottom: 24,
  },
  header: {
    backgroundColor: "#E0F2FE",
    paddingHorizontal: 20,
    paddingTop: 8,
    paddingBottom: 28,
  },
  heroLogoRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 16,
    gap: 10,
  },
  heroLogoMark: {
    width: 40,
    height: 40,
    borderRadius: 9,
    backgroundColor: "#0EA5E9",
    alignItems: "center",
    justifyContent: "center",
  },
  heroLogoLetter: {
    color: "#FFFFFF",
    fontSize: 20,
    fontWeight: "700",
  },
  heroLogoWord: {
    color: "#0369A1",
    fontSize: 18,
    fontWeight: "700",
    letterSpacing: 4,
    textTransform: "uppercase",
  },
  heroHeading: {
    color: "#0F172A",
    fontSize: 28,
    fontWeight: "700",
    lineHeight: 34,
    marginBottom: 6,
  },
  heroSubheading: {
    color: "#64748B",
    fontSize: 15,
    fontWeight: "500",
  },
  body: {
    paddingHorizontal: 20,
    paddingTop: 20,
    maxWidth: 440,
    width: "100%",
    alignSelf: "center",
    backgroundColor: "#F8FAFC",
  },
  destChip: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    alignSelf: "flex-start",
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 20,
    backgroundColor: "rgba(14,165,233,0.1)",
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: "rgba(14,165,233,0.3)",
    marginBottom: 16,
  },
  destChipText: {
    color: "#0369A1",
    fontSize: 14,
    fontWeight: "600",
  },
  googleBtn: {
    width: "100%",
    height: 52,
    borderRadius: 10,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 12,
    backgroundColor: "#FFFFFF",
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: "#E2E8F0",
    marginBottom: 12,
  },
  googleLogo: {
    width: 22,
    height: 22,
    resizeMode: "contain",
  },
  googleLabel: {
    color: "#334155",
    fontSize: 15,
    fontWeight: "600",
  },
  appleBtn: {
    width: "100%",
    height: 52,
    borderRadius: 10,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 12,
    backgroundColor: "#000000",
    marginBottom: 20,
  },
  appleLabel: {
    color: "#FFFFFF",
    fontSize: 15,
    fontWeight: "600",
  },
  divider: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 18,
    gap: 12,
  },
  dividerLine: {
    flex: 1,
    height: StyleSheet.hairlineWidth,
    backgroundColor: "#CBD5E1",
  },
  dividerText: {
    color: "#94A3B8",
    fontSize: 13,
    fontWeight: "500",
  },
  input: {
    width: "100%",
    height: 50,
    borderRadius: 9,
    paddingHorizontal: 14,
    marginBottom: 12,
    backgroundColor: "#FFFFFF",
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: "#E2E8F0",
    color: "#334155",
    fontSize: 15,
  },
  inputFocused: {
    borderColor: "#0EA5E9",
  },
  linkRight: {
    textAlign: "right",
    color: "#0EA5E9",
    fontSize: 14,
    fontWeight: "600",
    marginBottom: 16,
  },
  loginBtn: {
    width: "100%",
    height: 52,
    borderRadius: 10,
    backgroundColor: "#0369A1",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 20,
  },
  loginText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "700",
  },
  bioRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    marginBottom: 28,
  },
  bioIconBox: {
    width: 44,
    height: 44,
    borderRadius: 9,
    backgroundColor: "#EFF6FF",
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: "#BFDBFE",
    alignItems: "center",
    justifyContent: "center",
  },
  bioLabel: {
    flex: 1,
    color: "#94A3B8",
    fontSize: 14,
    fontWeight: "500",
  },
  footerText: {
    textAlign: "center",
    color: "#64748B",
    fontSize: 15,
  },
  footerLink: {
    color: "#0EA5E9",
    fontWeight: "700",
  },
});
