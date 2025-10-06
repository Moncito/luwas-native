import { Ionicons } from "@expo/vector-icons";
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

import NearbySpots from "../../../components/(destination-calls)/NearbySpots";
import TravelerReviews from "../../../components/(destination-calls)/TravelerReviews";
import WeatherInsights from "../../../components/(destination-calls)/WeatherInsights";

const { height } = Dimensions.get("window");

interface Itinerary {
  id: string;
  title: string;
  location: string;
  description: string;
  image: string;
  price: number;
  duration: string;
  latitude: number;
  longitude: number;
  highlights?: string[];
}

export default function ItineraryDetails() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();

  const [itinerary, setItinerary] = useState<Itinerary | null>(null);
  const [loading, setLoading] = useState(true);

  const scrollY = new Animated.Value(0);

  useEffect(() => {
    const fetchItinerary = async () => {
      try {
        if (!id) return;
        const snap = await getDoc(doc(db, "itineraries", id));
        if (snap.exists()) {
          setItinerary({ id: snap.id, ...snap.data() } as Itinerary);
        }
      } catch (err) {
        console.error("❌ Error fetching itinerary:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchItinerary();
  }, [id]);

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color="#2563EB" />
      </View>
    );
  }

  if (!itinerary) {
    return (
      <View style={styles.center}>
        <Text style={styles.error}>Itinerary not found.</Text>
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
        <ImageBackground
          source={{ uri: itinerary.image }}
          style={styles.heroImage}
        >
          {/* Gradient overlay */}
          <LinearGradient
            colors={["transparent", "rgba(0,0,0,0.7)"]}
            style={StyleSheet.absoluteFill}
          />

          {/* Top bar */}
          <View style={styles.topBar}>
            <TouchableOpacity style={styles.iconBtn} onPress={() => router.back()}>
              <Ionicons name="arrow-back" size={22} color="#fff" />
            </TouchableOpacity>
            <TouchableOpacity style={styles.iconBtn}>
              <Ionicons name="share-social" size={22} color="#fff" />
            </TouchableOpacity>
          </View>

          {/* Info overlay */}
          <View style={styles.heroInfo}>
            <Text style={styles.heroTitle}>{itinerary.title}</Text>
            <Text style={styles.heroMeta}>
              {itinerary.location} • {itinerary.duration}
            </Text>
            <Text style={styles.heroPrice}>
              ₱{Number(itinerary.price).toLocaleString()}{" "}
              <Text style={styles.heroPerPerson}>/ person</Text>
            </Text>
          </View>
        </ImageBackground>

        {/* Info Card */}
        <View style={styles.infoCard}>
          <Text style={styles.description}>{itinerary.description}</Text>

          {Array.isArray(itinerary.highlights) && itinerary.highlights.length > 0 && (
            <View>
              <Text style={styles.sectionTitle}>Highlights</Text>
              {itinerary.highlights.map((item, idx) => (
                <View key={idx} style={styles.highlightItem}>
                  <View style={styles.bullet} />
                  <Text style={styles.highlightText}>{item}</Text>
                </View>
              ))}
            </View>
          )}

          <TravelerReviews name={itinerary.title} location={itinerary.location} />

          <Text style={styles.sectionTitle}>Nearby Spots</Text>
          <NearbySpots lat={itinerary.latitude} lon={itinerary.longitude} />

          <WeatherInsights name={itinerary.title} location={itinerary.location} />

          <View style={styles.mapBox}>
            <MapView
              style={{ flex: 1 }}
              initialRegion={{
                latitude: itinerary.latitude,
                longitude: itinerary.longitude,
                latitudeDelta: 0.05,
                longitudeDelta: 0.05,
              }}
            >
              <Marker
                coordinate={{
                  latitude: itinerary.latitude,
                  longitude: itinerary.longitude,
                }}
                title={itinerary.title}
              />
            </MapView>
          </View>
        </View>
      </Animated.ScrollView>

      {/* Sticky Book Now */}
      <View style={styles.stickyBtnWrapper}>
        <Pressable
          onPress={() => router.push(`/(itineraries)/${id}/book`)}
          style={({ pressed }) => [
            styles.bookBtn,
            { transform: [{ scale: pressed ? 0.96 : 1 }] },
          ]}
        >
          <LinearGradient
            colors={["#2563EB", "#1D4ED8"]}
            style={styles.gradient}
          >
            <Text style={styles.bookText}>Book This Itinerary</Text>
          </LinearGradient>
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#fff" },
  heroImage: { width: "100%", height: height * 0.45, justifyContent: "flex-end" },
  topBar: {
    position: "absolute",
    top: 50,
    left: 20,
    right: 20,
    flexDirection: "row",
    justifyContent: "space-between",
  },
  iconBtn: {
    backgroundColor: "rgba(0,0,0,0.5)",
    padding: 8,
    borderRadius: 20,
  },
  heroInfo: { padding: 20 },
  heroTitle: { fontSize: 22, fontWeight: "700", color: "#fff" },
  heroMeta: { fontSize: 14, color: "rgba(255,255,255,0.8)", marginVertical: 2 },
  heroPrice: { fontSize: 20, fontWeight: "700", color: "#FACC15", marginTop: 4 },
  heroPerPerson: { fontSize: 14, color: "#f3f4f6" },
  infoCard: { padding: 20, backgroundColor: "#fff", marginTop: -12, borderTopLeftRadius: 20, borderTopRightRadius: 20 },
  description: { fontSize: 15, color: "#374151", marginBottom: 12 },
  sectionTitle: { fontSize: 18, fontWeight: "700", color: "#111", marginVertical: 10 },
  highlightItem: { flexDirection: "row", alignItems: "center", marginVertical: 4 },
  bullet: { width: 8, height: 8, borderRadius: 4, backgroundColor: "#2563EB", marginRight: 8 },
  highlightText: { fontSize: 14, color: "#374151", flexShrink: 1 },
  mapBox: { marginTop: 20, borderRadius: 16, overflow: "hidden", height: 160 },
  stickyBtnWrapper: { position: "absolute", bottom: 20, left: 20, right: 20 },
  bookBtn: {
    borderRadius: 999,
    overflow: "hidden",
    shadowColor: "#000",
    shadowOpacity: 0.15,
    shadowRadius: 6,
    elevation: 4,
  },
  gradient: { paddingVertical: 16, alignItems: "center", borderRadius: 999 },
  bookText: { color: "#fff", fontWeight: "700", fontSize: 16 },
  center: { flex: 1, justifyContent: "center", alignItems: "center" },
  error: { fontSize: 16, color: "red" },
});