import { Ionicons } from "@expo/vector-icons";
import { BlurView } from "expo-blur";
import { LinearGradient } from "expo-linear-gradient";
import { useLocalSearchParams, useRouter } from "expo-router";
import { doc, getDoc } from "firebase/firestore";
import React, { useEffect, useState } from "react";
import {
    ActivityIndicator,
    Animated,
    Dimensions,
    ImageBackground,
    Pressable,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from "react-native";
import MapView, { Marker } from "react-native-maps";
import { db } from "../../../src/lib/firebase";

// 🔹 Modular components
import NearbySpots from "../../../components/(destination-calls)/NearbySpots";
import TravelerReviews from "../../../components/(destination-calls)/TravelerReviews";
import WeatherInsights from "../../../components/(destination-calls)/WeatherInsights";

const { height } = Dimensions.get("window");

interface Promo {
  id: string;
  title: string;
  description: string;
  price: number;
  discountPercentage: number;
  finalPrice: number;
  startDate?: string;
  endDate?: string;
  location: string;
  imageUrl: string;
  latitude: number;
  longitude: number;
  highlights?: string[];
}

export default function PromoDetails() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();

  const [promo, setPromo] = useState<Promo | null>(null);
  const [loading, setLoading] = useState(true);

  const scrollY = new Animated.Value(0);

  useEffect(() => {
    const fetchPromo = async () => {
      try {
        if (!id) return;
        const snap = await getDoc(doc(db, "promos", id));
        if (snap.exists()) {
          setPromo({ id: snap.id, ...snap.data() } as Promo);
        }
      } catch (err) {
        console.error("❌ Error fetching promo:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchPromo();
  }, [id]);

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color="#2563EB" />
      </View>
    );
  }

  if (!promo) {
    return (
      <View style={styles.center}>
        <Text style={styles.error}>Promo not found.</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Animated.ScrollView
        scrollEventThrottle={16}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 100 }}
        onScroll={Animated.event(
          [{ nativeEvent: { contentOffset: { y: scrollY } } }],
          { useNativeDriver: false }
        )}
      >
        {/* Hero Section */}
        <View>
          <ImageBackground
            source={{ uri: promo.imageUrl }}
            style={styles.heroImage}
          >
            <Animated.View
              style={[
                StyleSheet.absoluteFill,
                {
                  opacity: scrollY.interpolate({
                    inputRange: [0, 200],
                    outputRange: [0, 1],
                    extrapolate: "clamp",
                  }),
                },
              ]}
            >
              <BlurView intensity={60} tint="dark" style={StyleSheet.absoluteFill} />
            </Animated.View>

            <View style={styles.topBar}>
              <TouchableOpacity
                style={styles.iconBtn}
                onPress={() => router.back()}
              >
                <Ionicons name="arrow-back" size={22} color="#fff" />
              </TouchableOpacity>
              <TouchableOpacity style={styles.iconBtn}>
                <Ionicons name="share-social" size={22} color="#fff" />
              </TouchableOpacity>
            </View>
          </ImageBackground>
        </View>

        {/* Info Card */}
        <View style={styles.infoCardWrapper}>
          <BlurView intensity={70} tint="light" style={styles.infoCard}>
            {/* Title + Pricing */}
            <View style={styles.headerRow}>
              <View>
                <Text style={styles.title}>{promo.title}</Text>
                <Text style={styles.location}>{promo.location}</Text>
              </View>
              <View style={{ alignItems: "flex-end" }}>
                {promo.price > promo.finalPrice && (
                  <Text style={styles.strikePrice}>
                    ₱{Number(promo.price).toLocaleString()}
                  </Text>
                )}
                <Text style={styles.finalPrice}>
                  ₱{Number(promo.finalPrice).toLocaleString()}
                </Text>
                {promo.discountPercentage > 0 && (
                  <Text style={styles.discount}>
                    -{promo.discountPercentage}%
                  </Text>
                )}
              </View>
            </View>

            {promo.endDate && (
              <Text style={styles.validity}>
                Valid until {new Date(promo.endDate).toLocaleDateString()}
              </Text>
            )}

            <Text style={styles.description}>{promo.description}</Text>

            {/* Promo Highlights */}
            {Array.isArray(promo.highlights) && promo.highlights.length > 0 && (
              <View>
                <Text style={styles.sectionTitle}>Promo Highlights</Text>
                {promo.highlights.map((item, idx) => (
                  <View key={idx} style={styles.highlightItem}>
                    <View style={styles.bullet} />
                    <Text style={styles.highlightText}>{item}</Text>
                  </View>
                ))}
              </View>
            )}

            {/* Traveler Reviews */}
            <TravelerReviews
              name={promo.title}
              location={promo.location}
            />

            <Text style={styles.sectionTitle}>Nearby Spots</Text>
            <NearbySpots lat={promo.latitude} lon={promo.longitude} />

            <WeatherInsights
              name={promo.title}
              location={promo.location}
            />

            {/* Map */}
            <View style={styles.mapBox}>
              <MapView
                style={{ flex: 1 }}
                initialRegion={{
                  latitude: promo.latitude,
                  longitude: promo.longitude,
                  latitudeDelta: 0.05,
                  longitudeDelta: 0.05,
                }}
              >
                <Marker
                  coordinate={{
                    latitude: promo.latitude,
                    longitude: promo.longitude,
                  }}
                  title={promo.title}
                />
              </MapView>
            </View>
          </BlurView>
        </View>
      </Animated.ScrollView>

      {/* Sticky Book Now */}
      <View style={styles.stickyBtnWrapper}>
        <Pressable
          onPress={() => router.push(`/${id}/book`)}
          style={({ pressed }) => [
            styles.bookBtn,
            { transform: [{ scale: pressed ? 0.96 : 1 }] },
          ]}
        >
          <LinearGradient
            colors={["#2563EB", "#1D4ED8"]}
            style={styles.gradient}
          >
            <Text style={styles.bookText}>Book This Promo</Text>
          </LinearGradient>
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#fff" },
  heroImage: { width: "100%", height: height * 0.45 },
  topBar: {
    marginTop: 50,
    flexDirection: "row",
    justifyContent: "space-between",
    paddingHorizontal: 20,
  },
  iconBtn: {
    backgroundColor: "rgba(0,0,0,0.5)",
    padding: 8,
    borderRadius: 20,
  },
  infoCardWrapper: {
    marginTop: -20,
    borderTopLeftRadius: 30,
    borderTopRightRadius: 30,
    overflow: "hidden",
  },
  infoCard: {
    padding: 20,
    backgroundColor: "rgba(255,255,255,0.9)",
  },
  headerRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 12,
  },
  title: { fontSize: 22, fontWeight: "700", color: "#111" },
  location: { fontSize: 14, color: "#6b7280", marginTop: 2 },
  description: { fontSize: 15, color: "#374151", marginVertical: 12 },
  strikePrice: {
    fontSize: 14,
    textDecorationLine: "line-through",
    color: "#9CA3AF",
  },
  finalPrice: { fontSize: 20, fontWeight: "700", color: "#2563EB" },
  discount: { fontSize: 13, fontWeight: "600", color: "#DC2626" },
  validity: { fontSize: 13, color: "#6b7280", marginBottom: 10 },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: "#111",
    marginVertical: 10,
  },
  highlightItem: {
    flexDirection: "row",
    alignItems: "center",
    marginVertical: 4,
  },
  bullet: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: "#2563EB",
    marginRight: 8,
  },
  highlightText: { fontSize: 14, color: "#374151", flexShrink: 1 },
  mapBox: {
    marginTop: 20,
    borderRadius: 16,
    overflow: "hidden",
    height: 160,
  },
  stickyBtnWrapper: {
    position: "absolute",
    bottom: 20,
    left: 20,
    right: 20,
  },
  bookBtn: {
    borderRadius: 999,
    overflow: "hidden",
    shadowColor: "#000",
    shadowOpacity: 0.15,
    shadowRadius: 6,
    elevation: 4,
  },
  gradient: {
    paddingVertical: 16,
    alignItems: "center",
    borderRadius: 999,
  },
  bookText: { color: "#fff", fontWeight: "700", fontSize: 16 },
  center: { flex: 1, justifyContent: "center", alignItems: "center" },
  error: { fontSize: 16, color: "red" },
});