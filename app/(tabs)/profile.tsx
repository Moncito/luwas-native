import { Ionicons } from "@expo/vector-icons";

import { auth, db } from "@lib/firebase";

import { useRouter } from "expo-router";

import { signOut } from "firebase/auth";

import { doc, onSnapshot } from "firebase/firestore";

import React, { useEffect, useMemo, useState } from "react";

import {

  Image,

  Platform,

  ScrollView,

  StyleSheet,

  Text,

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



export default function ProfilePage() {

  const router = useRouter();

  const insets = useSafeAreaInsets();

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



    const unsub = onSnapshot(doc(db, "users", user.uid), (snap) => {

      if (snap.exists()) {

        setProfile(snap.data());

      }

    });



    return () => unsub();

  }, [user]);



  const textureDots = useMemo(() => {

    const dots = [];

    for (let r = 0; r < TEXTURE_ROWS; r++) {

      for (let c = 0; c < TEXTURE_COLS; c++) {

        dots.push(

          <View

            key={`d-${r}-${c}`}

            style={[

              styles.heroDot,

              {

                left: c * 34 + (r % 2) * 17,

                top: r * 28,

              },

            ]}

          />

        );

      }

    }

    return dots;

  }, []);



  const photoUrl = typeof profile?.photoURL === "string" ? profile.photoURL.trim() : "";

  const hasPhoto = Boolean(photoUrl);



  const displayName = profile?.name?.trim?.() ? profile.name : "Unnamed User";

  const nameIsPlaceholder = !profile?.name?.trim?.();



  const roleLabel = profile?.role ?? "Traveler";



  const emailText = profile?.email ?? "";

  const emailEmpty = !emailText;



  const phoneText = profile?.phone?.trim?.() ? profile.phone : "No phone added";

  const phoneEmpty = !profile?.phone?.trim?.();



  const addressText = profile?.address?.trim?.() ? profile.address : "No address yet";

  const addressEmpty = !profile?.address?.trim?.();



  const bioText = profile?.bio?.trim?.() ? profile.bio : "No bio yet";

  const bioEmpty = !profile?.bio?.trim?.();



  return (

    <View style={styles.pageRoot}>

      <SafeAreaView style={styles.heroSafe} edges={["top"]}>

        <View style={styles.hero}>

          <View style={styles.heroBg} />

          <View style={styles.textureWrap} pointerEvents="none">

            {textureDots}

          </View>

          <View style={styles.heroInner}>

            <View style={styles.heroNav}>

              <View style={styles.heroNavLeft} />

              <Text style={styles.heroTitle}>My Profile</Text>

              <TouchableOpacity

                style={styles.heroNavRight}

                onPress={() => router.push("/editProfile")}

                hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}

                accessibilityRole="button"

                accessibilityLabel="Edit profile"

              >

                <Text style={styles.heroEdit}>Edit</Text>

              </TouchableOpacity>

            </View>

            <View style={styles.heroSpacer} />

            <View style={styles.avatarAnchor}>

              <View style={[styles.avatarOuter, avatarShadow]}>

                {hasPhoto ? (

                  <Image source={{ uri: photoUrl }} style={styles.avatarImage} />

                ) : (

                  <View style={styles.avatarFallback}>

                    <Ionicons name="person" size={34} color="#5B8DB8" />

                  </View>

                )}

              </View>

            </View>

          </View>

        </View>

      </SafeAreaView>



      <View style={styles.wave} />



      <ScrollView

        style={styles.bodyScroll}

        showsVerticalScrollIndicator={false}

        keyboardShouldPersistTaps="handled"

        contentContainerStyle={[

          styles.bodyContent,

          { paddingBottom: 28 + Math.max(insets.bottom, 10) },

        ]}

      >

        <Text

          style={[styles.name, nameIsPlaceholder && styles.namePlaceholder]}

          numberOfLines={2}

        >

          {displayName}

        </Text>

        <View style={styles.roleBadge}>

          <Ionicons name="location-outline" size={15} color="#1D4ED8" />

          <Text style={styles.roleBadgeText}>{roleLabel}</Text>

        </View>



        <View style={[styles.infoCard, cardShadow]}>

          <View style={styles.infoRow}>

            <View style={styles.iconBox}>

              <Ionicons name="mail-outline" size={18} color="#0EA5E9" />

            </View>

            <View style={styles.infoTextCol}>

              <Text style={styles.infoFieldLabel}>Email</Text>

              <Text

                style={[styles.infoValue, emailEmpty && styles.infoPlaceholder]}

                numberOfLines={2}

              >

                {emailEmpty ? "No email" : emailText}

              </Text>

            </View>

          </View>

          <View style={[styles.infoRow, styles.infoRowDivider]}>

            <View style={styles.iconBox}>

              <Ionicons name="call-outline" size={18} color="#0EA5E9" />

            </View>

            <View style={styles.infoTextCol}>

              <Text style={styles.infoFieldLabel}>Phone</Text>

              <Text

                style={[styles.infoValue, phoneEmpty && styles.infoPlaceholder]}

                numberOfLines={2}

              >

                {phoneText}

              </Text>

            </View>

          </View>

          <View style={[styles.infoRow, styles.infoRowDivider]}>

            <View style={styles.iconBox}>

              <Ionicons name="location-outline" size={18} color="#0EA5E9" />

            </View>

            <View style={styles.infoTextCol}>

              <Text style={styles.infoFieldLabel}>Address</Text>

              <Text

                style={[styles.infoValue, addressEmpty && styles.infoPlaceholder]}

                numberOfLines={2}

              >

                {addressText}

              </Text>

            </View>

          </View>

          <View style={[styles.infoRow, styles.infoRowDivider]}>

            <View style={styles.iconBox}>

              <Ionicons name="information-circle-outline" size={18} color="#0EA5E9" />

            </View>

            <View style={styles.infoTextCol}>

              <Text style={styles.infoFieldLabel}>Bio</Text>

              <Text

                style={[styles.infoValue, bioEmpty && styles.infoPlaceholder]}

                numberOfLines={4}

              >

                {bioText}

              </Text>

            </View>

          </View>

        </View>



        <TouchableOpacity

          style={[styles.primaryBtn, styles.primaryBtnShadow]}

          onPress={() => router.push("/editProfile")}

          activeOpacity={0.92}

        >

          <Text style={styles.primaryBtnText}>Edit Profile</Text>

        </TouchableOpacity>



        <TouchableOpacity

          style={styles.logoutBtn}

          onPress={handleSignOut}

          activeOpacity={0.88}

        >

          <Ionicons name="log-out-outline" size={22} color="#EF4444" />

          <Text style={styles.logoutText}>Logout</Text>

        </TouchableOpacity>

      </ScrollView>

    </View>

  );

}



const styles = StyleSheet.create({

  pageRoot: {

    flex: 1,

    backgroundColor: "#F8FAFC",

  },

  heroSafe: {

    backgroundColor: "#0C2540",

  },

hero: {
  backgroundColor: "#0C2540",
  minHeight: 0,   // let content define the height naturally
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

    flex: 1,

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

  heroNavLeft: {

    width: 40,

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

    width: 44,

    alignItems: "flex-end",

    justifyContent: "center",

  },

  heroEdit: {

    color: "#38BDF8",

    fontSize: 12,

    fontWeight: "600",

  },

  heroSpacer: {
  height: 10,  // fixed small gap instead of flex
},

  avatarAnchor: {

    alignItems: "center",

    justifyContent: "flex-end",

  },

  avatarOuter: {

    width: 72,

    height: 72,

    borderRadius: 36,

    borderWidth: 3,

    borderColor: "#FFFFFF",

    backgroundColor: "#1E3A55",

    overflow: "hidden",

    alignItems: "center",

    justifyContent: "center",

    marginBottom: -36,

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

  wave: {

    height: 38,

    marginHorizontal: -1,

    backgroundColor: "#F8FAFC",

    borderTopLeftRadius: 28,

    borderTopRightRadius: 28,

    zIndex: 1,

  },

  bodyScroll: {

    flex: 1,

    backgroundColor: "#F8FAFC",

  },

bodyContent: {
  paddingHorizontal: 20,
  paddingTop: 52,  // was 46, increase slightly for the avatar overlap
},

  name: {

    fontSize: 24,

    fontWeight: "700",

    color: "#0F172A",

    textAlign: "center",

    letterSpacing: -0.3,

    lineHeight: 30,

    paddingHorizontal: 8,

  },

  namePlaceholder: {

    color: "#94A3B8",

    fontStyle: "italic",

    fontWeight: "600",

  },

  roleBadge: {

    flexDirection: "row",

    alignItems: "center",

    alignSelf: "center",

    gap: 6,

    marginTop: 8,

    paddingHorizontal: 14,

    paddingVertical: 5,

    borderRadius: 999,

    backgroundColor: "#EFF6FF",

    borderWidth: 1,

    borderColor: "#BFDBFE",

  },

  roleBadgeText: {

    fontSize: 13,

    fontWeight: "600",

    color: "#1D4ED8",

  },

  infoCard: {

    backgroundColor: "#FFFFFF",

    borderRadius: 18,

    borderWidth: 1,

    borderColor: "#E2E8F0",

    overflow: "hidden",

    marginTop: 20,

    marginBottom: 18,

    width: "100%",

    maxWidth: 440,

    alignSelf: "center",

  },

  infoRow: {

    flexDirection: "row",

    alignItems: "center",

    gap: 14,

    paddingVertical: 14,

    paddingHorizontal: 16,

  },

  infoRowDivider: {

    borderTopWidth: StyleSheet.hairlineWidth,

    borderTopColor: "#E8EDF3",

  },

  iconBox: {

    width: 36,

    height: 36,

    borderRadius: 10,

    backgroundColor: "#EFF6FF",

    alignItems: "center",

    justifyContent: "center",

  },

  infoTextCol: {

    flex: 1,

    minWidth: 0,

  },

  infoFieldLabel: {

    fontSize: 12,

    fontWeight: "600",

    color: "#64748B",

    marginBottom: 4,

    letterSpacing: 0.4,

    textTransform: "uppercase",

  },

  infoValue: {

    fontSize: 15,

    lineHeight: 22,

    color: "#334155",

    fontWeight: "500",

  },

  infoPlaceholder: {

    color: "#94A3B8",

    fontStyle: "italic",

    fontWeight: "400",

  },

  primaryBtn: {

    width: "100%",

    maxWidth: 440,

    alignSelf: "center",

    height: 52,

    borderRadius: 12,

    backgroundColor: "#0EA5E9",

    alignItems: "center",

    justifyContent: "center",

    marginBottom: 10,

  },

  primaryBtnShadow:

    Platform.OS === "ios"

      ? {

          shadowColor: "#0369A1",

          shadowOffset: { width: 0, height: 6 },

          shadowOpacity: 0.25,

          shadowRadius: 12,

        }

      : { elevation: 5 },

  primaryBtnText: {

    color: "#FFFFFF",

    fontSize: 15,

    fontWeight: "700",

  },

  logoutBtn: {

    width: "100%",

    maxWidth: 440,

    alignSelf: "center",

    height: 48,

    borderRadius: 12,

    backgroundColor: "#FEF2F2",

    borderWidth: 1,

    borderColor: "#FECACA",

    flexDirection: "row",

    alignItems: "center",

    justifyContent: "center",

    gap: 10,

  },

  logoutText: {

    color: "#EF4444",

    fontSize: 15,

    fontWeight: "600",

  },

});


