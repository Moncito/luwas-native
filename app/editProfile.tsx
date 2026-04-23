import { Ionicons } from "@expo/vector-icons";
import { auth, db } from "@lib/firebase";
import * as ImagePicker from "expo-image-picker";
import { useRouter } from "expo-router";
import { doc, getDoc, setDoc } from "firebase/firestore";
import { getDownloadURL, getStorage, ref, uploadBytes } from "firebase/storage";
import React, { useEffect, useMemo, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Image,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView, useSafeAreaInsets } from "react-native-safe-area-context";

const TEXTURE_COLS = 12;
const TEXTURE_ROWS = 5;

const cardShadow =
  Platform.OS === "ios"
    ? {
        shadowColor: "#0C2540",
        shadowOffset: { width: 0, height: 8 },
        shadowOpacity: 0.08,
        shadowRadius: 20,
      }
    : { elevation: 4 };

const avatarShadow =
  Platform.OS === "ios"
    ? {
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 6 },
        shadowOpacity: 0.22,
        shadowRadius: 10,
      }
    : { elevation: 8 };

const saveBtnShadow =
  Platform.OS === "ios"
    ? {
        shadowColor: "#0369A1",
        shadowOffset: { width: 0, height: 6 },
        shadowOpacity: 0.25,
        shadowRadius: 12,
      }
    : { elevation: 5 };

export default function EditProfile() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const user = auth.currentUser;

  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [address, setAddress] = useState("");
  const [bio, setBio] = useState("");
  const [photoURL, setPhotoURL] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);

  const [focusedField, setFocusedField] = useState<string | null>(null);

  // Fetch user profile from Firestore
  useEffect(() => {
    if (!user) return;
    const fetchProfile = async () => {
      try {
        const snap = await getDoc(doc(db, "users", user.uid));
        if (snap.exists()) {
          const data = snap.data();
          setName(data.name || user.displayName || "");
          setPhone(data.phone || "");
          setAddress(data.address || "");
          setBio(data.bio || "");
          setPhotoURL(data.photoURL || user.photoURL || "");
        }
      } catch (err) {
        console.error("Error fetching profile:", err);
        Alert.alert("Error", "Failed to load profile. Please try again.");
      } finally {
        setLoading(false);
      }
    };
    fetchProfile();
  }, [user]);

  // Dot texture
  const textureDots = useMemo(() => {
    const dots = [];
    for (let r = 0; r < TEXTURE_ROWS; r++) {
      for (let c = 0; c < TEXTURE_COLS; c++) {
        dots.push(
          <View
            key={`d-${r}-${c}`}
            style={[
              styles.heroDot,
              { left: c * 34 + (r % 2) * 17, top: r * 28 },
            ]}
          />
        );
      }
    }
    return dots;
  }, []);

  // Pick image from gallery
  const pickImage = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== "granted") {
      Alert.alert("Permission needed", "Please allow access to your photo library.");
      return;
    }
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.8,
    });
    if (!result.canceled) {
      await uploadImage(result.assets[0].uri);
    }
  };

  // Upload to Firebase Storage
  const uploadImage = async (uri: string) => {
    try {
      setUploading(true);
      const response = await fetch(uri);
      const blob = await response.blob();
      const storage = getStorage();
      const storageRef = ref(storage, `profilePictures/${user?.uid}.jpg`);
      await uploadBytes(storageRef, blob);
      const downloadURL = await getDownloadURL(storageRef);
      setPhotoURL(downloadURL);
    } catch (err) {
      console.error("Upload failed:", err);
      Alert.alert("Upload Failed", "Could not upload image. Please try again.");
    } finally {
      setUploading(false);
    }
  };

  // Save profile to Firestore
  const handleSave = async () => {
    if (!user) return;
    if (!name.trim()) {
      Alert.alert("Validation", "Full name is required.");
      return;
    }
    try {
      setSaving(true);
      await setDoc(
        doc(db, "users", user.uid),
        { name, phone, address, bio, photoURL, email: user.email },
        { merge: true }
      );
      router.back();
    } catch (err) {
      console.error("Error saving profile:", err);
      Alert.alert("Save Failed", "Could not save profile. Please try again.");
    } finally {
      setSaving(false);
    }
  };

  const isBusy = uploading || saving;
  const hasPhoto = Boolean(photoURL?.trim());

  if (loading) {
    return (
      <View style={styles.loadingScreen}>
        <ActivityIndicator size="large" color="#0EA5E9" />
        <Text style={styles.loadingText}>Loading profile...</Text>
      </View>
    );
  }

  return (
    <View style={styles.pageRoot}>
      {/* ── HERO ── */}
      <SafeAreaView style={styles.heroSafe} edges={["top"]}>
        <View style={styles.hero}>
          <View style={styles.heroBg} />
          <View style={styles.textureWrap} pointerEvents="none">
            {textureDots}
          </View>
          <View style={styles.heroInner}>
            {/* Nav */}
            <View style={styles.heroNav}>
              <TouchableOpacity
                style={styles.backBtn}
                onPress={() => router.back()}
                hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                accessibilityRole="button"
                accessibilityLabel="Go back"
              >
                <Ionicons name="chevron-back" size={18} color="#fff" />
              </TouchableOpacity>
              <Text style={styles.heroTitle}>Edit Profile</Text>
              <View style={styles.heroNavRight} />
            </View>

            {/* Avatar */}
            <View style={styles.avatarAnchor}>
              <TouchableOpacity
                onPress={pickImage}
                disabled={isBusy}
                activeOpacity={0.85}
                style={[styles.avatarOuter, avatarShadow]}
                accessibilityRole="button"
                accessibilityLabel="Change profile photo"
              >
                {hasPhoto ? (
                  <Image source={{ uri: photoURL }} style={styles.avatarImage} />
                ) : (
                  <View style={styles.avatarFallback}>
                    <Ionicons name="person" size={34} color="#5B8DB8" />
                  </View>
                )}
                <View style={styles.cameraBadge}>
                  {uploading ? (
                    <ActivityIndicator size="small" color="#fff" />
                  ) : (
                    <Ionicons name="camera" size={13} color="#fff" />
                  )}
                </View>
              </TouchableOpacity>
              <Text style={styles.changePhotoLabel}>
                {uploading ? "Uploading..." : "Change photo"}
              </Text>
            </View>
          </View>
        </View>
      </SafeAreaView>

      {/* ── WAVE ── */}
      <View style={styles.wave} />

      {/* ── BODY ── */}
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === "ios" ? "padding" : undefined}
        keyboardVerticalOffset={0}
      >
        <ScrollView
          style={styles.bodyScroll}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
          contentContainerStyle={[
            styles.bodyContent,
            { paddingBottom: 32 + Math.max(insets.bottom, 10) },
          ]}
        >
          {/* Form Card */}
          <View style={[styles.formCard, cardShadow]}>

            {/* Full Name */}
            <View style={styles.fieldGroup}>
              <Text style={styles.fieldLabel}>Full Name</Text>
              <View style={[styles.inputWrapper, focusedField === "name" && styles.inputFocused]}>
                <View style={styles.inputIconBox}>
                  <Ionicons name="person-outline" size={16} color="#0EA5E9" />
                </View>
                <TextInput
                  style={styles.input}
                  value={name}
                  onChangeText={setName}
                  placeholder="Enter your full name"
                  placeholderTextColor="#CBD5E1"
                  onFocus={() => setFocusedField("name")}
                  onBlur={() => setFocusedField(null)}
                  returnKeyType="next"
                />
              </View>
            </View>

            <View style={styles.fieldDivider} />

            {/* Phone */}
            <View style={styles.fieldGroup}>
              <Text style={styles.fieldLabel}>Phone Number</Text>
              <View style={[styles.inputWrapper, focusedField === "phone" && styles.inputFocused]}>
                <View style={styles.inputIconBox}>
                  <Ionicons name="call-outline" size={16} color="#0EA5E9" />
                </View>
                <TextInput
                  style={styles.input}
                  value={phone}
                  onChangeText={setPhone}
                  keyboardType="phone-pad"
                  placeholder="+63 9XX XXX XXXX"
                  placeholderTextColor="#CBD5E1"
                  onFocus={() => setFocusedField("phone")}
                  onBlur={() => setFocusedField(null)}
                  returnKeyType="next"
                />
              </View>
            </View>

            <View style={styles.fieldDivider} />

            {/* Address */}
            <View style={styles.fieldGroup}>
              <Text style={styles.fieldLabel}>Address</Text>
              <View style={[styles.inputWrapper, focusedField === "address" && styles.inputFocused]}>
                <View style={styles.inputIconBox}>
                  <Ionicons name="location-outline" size={16} color="#0EA5E9" />
                </View>
                <TextInput
                  style={styles.input}
                  value={address}
                  onChangeText={setAddress}
                  placeholder="City, Country"
                  placeholderTextColor="#CBD5E1"
                  onFocus={() => setFocusedField("address")}
                  onBlur={() => setFocusedField(null)}
                  returnKeyType="next"
                />
              </View>
            </View>

            <View style={styles.fieldDivider} />

            {/* Bio */}
            <View style={styles.fieldGroup}>
              <Text style={styles.fieldLabel}>Bio</Text>
              <View style={[
                styles.inputWrapper,
                styles.bioWrapper,
                focusedField === "bio" && styles.inputFocused,
              ]}>
                <View style={[styles.inputIconBox, { alignSelf: "flex-start", marginTop: 2 }]}>
                  <Ionicons name="information-circle-outline" size={16} color="#0EA5E9" />
                </View>
                <TextInput
                  style={[styles.input, styles.bioInput]}
                  value={bio}
                  onChangeText={setBio}
                  multiline
                  numberOfLines={4}
                  placeholder="Tell fellow travelers about yourself..."
                  placeholderTextColor="#CBD5E1"
                  onFocus={() => setFocusedField("bio")}
                  onBlur={() => setFocusedField(null)}
                  textAlignVertical="top"
                />
              </View>
            </View>
          </View>

          {/* Save Button */}
          <TouchableOpacity
            style={[styles.saveBtn, saveBtnShadow, isBusy && styles.saveBtnDisabled]}
            onPress={handleSave}
            disabled={isBusy}
            activeOpacity={0.88}
            accessibilityRole="button"
            accessibilityLabel="Save profile changes"
          >
            {saving ? (
              <ActivityIndicator color="#fff" size="small" />
            ) : (
              <>
                <Ionicons name="checkmark-circle-outline" size={20} color="#fff" style={{ marginRight: 8 }} />
                <Text style={styles.saveBtnText}>Save Changes</Text>
              </>
            )}
          </TouchableOpacity>

          {/* Cancel */}
          <TouchableOpacity
            style={styles.cancelBtn}
            onPress={() => router.back()}
            disabled={isBusy}
            activeOpacity={0.7}
          >
            <Text style={styles.cancelText}>Discard Changes</Text>
          </TouchableOpacity>
        </ScrollView>
      </KeyboardAvoidingView>
    </View>
  );
}

const styles = StyleSheet.create({
  pageRoot: {
    flex: 1,
    backgroundColor: "#F0F4F8",
  },

  // Loading
  loadingScreen: {
    flex: 1,
    backgroundColor: "#F0F4F8",
    alignItems: "center",
    justifyContent: "center",
    gap: 12,
  },
  loadingText: {
    fontSize: 14,
    color: "#64748B",
    fontWeight: "500",
  },

  // Hero
  heroSafe: {
    backgroundColor: "#0C2540",
  },
  hero: {
    backgroundColor: "#0C2540",
    width: "100%",
    overflow: "visible",
  },
  heroBg: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "#0C2540",
  },
  textureWrap: {
    ...StyleSheet.absoluteFillObject,
    overflow: "hidden",
  },
  heroDot: {
    position: "absolute",
    width: 2,
    height: 2,
    borderRadius: 1,
    backgroundColor: "rgba(255,255,255,0.06)",
  },
  heroInner: {
    paddingHorizontal: 18,
    paddingTop: 2,
    paddingBottom: 0,
  },
  heroNav: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    minHeight: 48,
  },
  backBtn: {
    width: 34,
    height: 34,
    borderRadius: 10,
    backgroundColor: "rgba(255,255,255,0.12)",
    alignItems: "center",
    justifyContent: "center",
  },
  heroTitle: {
    flex: 1,
    textAlign: "center",
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "700",
    letterSpacing: 0.2,
  },
  heroNavRight: {
    width: 34,
  },

  // Avatar
  avatarAnchor: {
    alignItems: "center",
    paddingBottom: 0,
    marginTop: 8,
  },
  avatarOuter: {
    width: 80,
    height: 80,
    borderRadius: 40,
    borderWidth: 3,
    borderColor: "#FFFFFF",
    backgroundColor: "#1E3A55",
    overflow: "hidden",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: -40,
    zIndex: 10,
  },
  avatarImage: {
    width: "100%",
    height: "100%",
  },
  avatarFallback: {
    width: "100%",
    height: "100%",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#1E3A55",
  },
  cameraBadge: {
    position: "absolute",
    bottom: 2,
    right: 2,
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: "#0EA5E9",
    borderWidth: 2,
    borderColor: "#fff",
    alignItems: "center",
    justifyContent: "center",
  },
  changePhotoLabel: {
    marginTop: 48,
    fontSize: 12,
    color: "#0EA5E9",
    fontWeight: "600",
    marginBottom: 4,
  },

  // Wave
  wave: {
    height: 38,
    marginHorizontal: -1,
    backgroundColor: "#F0F4F8",
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    zIndex: 1,
  },

  // Body
  bodyScroll: {
    flex: 1,
    backgroundColor: "#F0F4F8",
  },
  bodyContent: {
    paddingHorizontal: 20,
    paddingTop: 20,
  },

  // Form Card
  formCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 18,
    borderWidth: 1,
    borderColor: "#E2E8F0",
    overflow: "hidden",
    marginBottom: 16,
    width: "100%",
    maxWidth: 440,
    alignSelf: "center",
  },
  fieldGroup: {
    paddingHorizontal: 16,
    paddingTop: 14,
    paddingBottom: 12,
  },
  fieldDivider: {
    height: StyleSheet.hairlineWidth,
    backgroundColor: "#E8EDF3",
    marginHorizontal: 16,
  },
  fieldLabel: {
    fontSize: 11,
    fontWeight: "700",
    color: "#0EA5E9",
    letterSpacing: 0.6,
    textTransform: "uppercase",
    marginBottom: 8,
  },
  inputWrapper: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#F8FAFC",
    borderRadius: 10,
    borderWidth: 1,
    borderColor: "#E2E8F0",
    paddingHorizontal: 10,
    gap: 8,
    minHeight: 44,
  },
  inputFocused: {
    borderColor: "#0EA5E9",
    borderWidth: 1.5,
    backgroundColor: "#F0F9FF",
  },
  bioWrapper: {
    alignItems: "flex-start",
    paddingVertical: 10,
  },
  inputIconBox: {
    width: 28,
    height: 28,
    borderRadius: 8,
    backgroundColor: "#EFF6FF",
    alignItems: "center",
    justifyContent: "center",
    flexShrink: 0,
  },
  input: {
    flex: 1,
    fontSize: 14,
    color: "#334155",
    fontWeight: "500",
    paddingVertical: Platform.OS === "ios" ? 10 : 8,
  },
  bioInput: {
    height: 88,
    paddingTop: 4,
  },

  // Save button
  saveBtn: {
    width: "100%",
    maxWidth: 440,
    alignSelf: "center",
    height: 52,
    borderRadius: 12,
    backgroundColor: "#0EA5E9",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 10,
  },
  saveBtnDisabled: {
    opacity: 0.6,
  },
  saveBtnText: {
    color: "#FFFFFF",
    fontSize: 15,
    fontWeight: "700",
  },

  // Cancel button
  cancelBtn: {
    width: "100%",
    maxWidth: 440,
    alignSelf: "center",
    height: 44,
    alignItems: "center",
    justifyContent: "center",
  },
  cancelText: {
    color: "#94A3B8",
    fontSize: 14,
    fontWeight: "500",
  },
});