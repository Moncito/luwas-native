import { Ionicons } from "@expo/vector-icons";
import { auth, db } from "@lib/firebase";
import { BlurView } from "expo-blur";
import { useRouter } from "expo-router";
import { signOut } from "firebase/auth";
import { doc, onSnapshot } from "firebase/firestore";
import React, { useEffect, useState } from "react";
import {
  Image,
  ImageBackground,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

export default function ProfilePage() {
  const router = useRouter();
  const user = auth.currentUser;
  const [profile, setProfile] = useState<any>(null);

  const handleSignOut = async () => {
    try {
      await signOut(auth);
      router.replace("/auth/login");
    } catch (error) {
      console.error("Sign out error:", error);
    }
  };

  useEffect(() => {
    if (!user) return;

    // ✅ Real-time listener
    const unsub = onSnapshot(doc(db, "users", user.uid), (snap) => {
      if (snap.exists()) {
        setProfile(snap.data());
      }
    });

    return () => unsub();
  }, [user]);

  return (
    <ImageBackground
      source={{ uri: "https://images.unsplash.com/photo-1507525428034-b723cf961d3e" }}
      style={styles.bg}
      resizeMode="cover"
    >
      <ScrollView contentContainerStyle={styles.scroll}>
        <BlurView intensity={90} tint="light" style={styles.card}>
          {/* Avatar */}
          <Image
            source={{
              uri:
                profile?.photoURL ??
                "https://cdn-icons-png.flaticon.com/512/847/847969.png",
            }}
            style={styles.avatar}
          />
          <Text style={styles.name}>{profile?.name ?? "Unnamed User"}</Text>
          <Text style={styles.role}>Traveler</Text>

          {/* Info */}
          <View style={styles.infoRow}>
            <Ionicons name="mail-outline" size={18} color="#2563EB" />
            <Text style={styles.infoText}>{profile?.email}</Text>
          </View>
          <View style={styles.infoRow}>
            <Ionicons name="call-outline" size={18} color="#2563EB" />
            <Text style={styles.infoText}>{profile?.phone ?? "No phone added"}</Text>
          </View>
          <View style={styles.infoRow}>
            <Ionicons name="location-outline" size={18} color="#2563EB" />
            <Text style={styles.infoText}>{profile?.address ?? "No address yet"}</Text>
          </View>
          <View style={styles.infoRow}>
            <Ionicons name="information-circle-outline" size={18} color="#2563EB" />
            <Text style={styles.infoText}>{profile?.bio ?? "No bio yet"}</Text>
          </View>

          {/* Edit Profile */}
          <TouchableOpacity
            style={styles.editBtn}
            onPress={() => router.push("/editProfile")}
          >
            <Text style={styles.editText}>Edit Profile</Text>
          </TouchableOpacity>

          {/* Logout */}
          <TouchableOpacity style={styles.logoutWrapper} onPress={handleSignOut}>
            <BlurView intensity={50} tint="light" style={styles.logoutBtn}>
              <Ionicons name="log-out-outline" size={20} color="red" />
              <Text style={styles.logoutText}>Logout</Text>
            </BlurView>
          </TouchableOpacity>
        </BlurView>
      </ScrollView>
    </ImageBackground>
  );
}

const styles = StyleSheet.create({
  bg: { flex: 1 },
  scroll: { flexGrow: 1, justifyContent: "center", alignItems: "center", padding: 20 },
  card: {
    width: "100%",
    maxWidth: 380,
    borderRadius: 40,
    padding: 28,
    alignItems: "center",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.3)",
    overflow: "hidden",
  },
  avatar: {
    width: 110,
    height: 110,
    borderRadius: 55,
    marginBottom: 14,
  },
  name: { fontSize: 22, fontWeight: "bold", color: "#111" },
  role: {
    fontSize: 14,
    fontWeight: "600",
    color: "#2563EB",
    backgroundColor: "rgba(37,99,235,0.1)",
    paddingHorizontal: 14,
    paddingVertical: 5,
    borderRadius: 999,
    marginVertical: 10,
  },
  infoRow: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 14,
    gap: 10,
    alignSelf: "flex-start",
  },
  infoText: { fontSize: 15, color: "#333", flexShrink: 1 },
  editBtn: {
    backgroundColor: "#2563EB",
    paddingVertical: 14,
    borderRadius: 999,
    alignItems: "center",
    marginTop: 28,
    width: "100%",
  },
  editText: { color: "white", fontSize: 16, fontWeight: "600" },
  logoutWrapper: {
    width: "100%",
    marginTop: 18,
    borderRadius: 999,
    overflow: "hidden",
  },
  logoutBtn: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    gap: 8,
    paddingVertical: 14,
    borderRadius: 999,
    backgroundColor: "rgba(255,255,255,0.15)",
  },
  logoutText: { color: "red", fontSize: 16, fontWeight: "600" },
});
