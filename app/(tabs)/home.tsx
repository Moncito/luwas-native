import { BlurView } from "expo-blur";
import Constants from "expo-constants";
import * as Location from "expo-location";
import { useRouter } from "expo-router";
import LottieView from "lottie-react-native";
import React, { useEffect, useRef, useState } from "react";
import {
  Animated,
  ImageBackground,
  StyleSheet,
  Text,
  View,
} from "react-native";

// Firebase
import { getAuth } from "firebase/auth";
import {
  collection,
  limit,
  onSnapshot,
  orderBy,
  query,
  where,
} from "firebase/firestore";
import { db } from "../../src/lib/firebase";

// hooks
import { useDestinations } from "../../hooks/useDestinations";
import { useItineraries } from "../../hooks/useItineraries";
import { usePromos } from "../../hooks/usePromos";
import { useUserProfile } from "../../hooks/useUserProfile";

// components
import DestinationCard from "../../components/DestinationCard";
import ItineraryCard from "../../components/ItineraryCard";
import PromoBanner from "../../components/PromoBanner";

const HERO_HEIGHT = 250; // 🔹 Reduced for better space usage

export default function HomeScreen() {
  const router = useRouter();
  const { fullName } = useUserProfile();
  const user = getAuth().currentUser;

  // fetch limited featured data
  const { destinations = [] } = useDestinations(3);
  const { promos = [] } = usePromos(2);
  const { itineraries = [] } = useItineraries(3);

  const displayName =
    fullName&& fullName !== "Unnamed" && fullName.trim() !== "" ? fullName : "Traveler";

  // 🔹 Scroll tracking
  const scrollY = useRef(new Animated.Value(0)).current;

  // 🔹 State
  const [weather, setWeather] = useState<string | null>(null);
  const [city, setCity] = useState<string | null>(null);
  const [nextTrip, setNextTrip] = useState<any>(null);
  const [greeting, setGreeting] = useState("Welcome");

  /* --- Time-based greeting --- */
  useEffect(() => {
    const hour = new Date().getHours();
    if (hour < 12) setGreeting("Good Morning");
    else if (hour < 18) setGreeting("Good Afternoon");
    else setGreeting("Good Evening");
  }, []);

  /* --- Weather Fetch --- */
  useEffect(() => {
    (async () => {
      try {
        const { status } = await Location.requestForegroundPermissionsAsync();
        if (status !== "granted") {
          setWeather("Weather unavailable");
          return;
        }

        const location = await Location.getCurrentPositionAsync({});
        const { latitude, longitude } = location.coords;

        const API_KEY = Constants.expoConfig?.extra?.OPENWEATHER_API_KEY;
        const res = await fetch(
          `https://api.openweathermap.org/data/2.5/weather?lat=${latitude}&lon=${longitude}&units=metric&appid=${API_KEY}`
        );
        const data = await res.json();
        if (data?.main) {
          setWeather(`${Math.round(data.main.temp)}°C • ${data.weather[0].main}`);
          setCity(data.name);
        } else {
          setWeather("Weather unavailable");
        }
      } catch (err) {
        setWeather("Weather unavailable");
      }
    })();
  }, []);

  /* --- Firestore: Get Next Trip --- */
  useEffect(() => {
    if (!user) return;
    const q = query(
      collection(db, "bookings"),
      where("userId", "==", user.uid),
      orderBy("departureDate", "asc"),
      limit(1)
    );
    const unsub = onSnapshot(q, (snap) => {
      if (!snap.empty) {
        setNextTrip(snap.docs[0].data());
      } else {
        setNextTrip(null);
      }
    });
    return () => unsub();
  }, [user]);

  // ✅ Format departureDate safely
  const getFormattedDate = (trip: any) => {
    if (!trip?.departureDate) return null;
    try {
      if (trip.departureDate.seconds) {
        return new Date(trip.departureDate.seconds * 1000).toLocaleDateString();
      }
      if (typeof trip.departureDate === "string") {
        return new Date(trip.departureDate).toLocaleDateString();
      }
      return null;
    } catch {
      return null;
    }
  };

  return (
    <View style={{ flex: 1, backgroundColor: "#fff" }}>
      <Animated.ScrollView
        showsVerticalScrollIndicator={false}
        bounces={false}
        scrollEventThrottle={16}
        onScroll={Animated.event(
          [{ nativeEvent: { contentOffset: { y: scrollY } } }],
          { useNativeDriver: false }
        )}
      >
        {/* 🔹 Hero Section */}
        <View style={styles.heroWrapper}>
          <ImageBackground
            source={require("../../assets/images/hometop.jpg")}
            style={styles.hero}
            resizeMode="cover"
          >
            {/* Dark overlay */}
            <View style={[StyleSheet.absoluteFill, { backgroundColor: "rgba(0,0,0,0.55)" }]} />

            {/* Blur overlay fades in on scroll */}
            <Animated.View
              style={[
                StyleSheet.absoluteFill,
                {
                  opacity: scrollY.interpolate({
                    inputRange: [0, HERO_HEIGHT / 2, HERO_HEIGHT],
                    outputRange: [0, 0.5, 1],
                    extrapolate: "clamp",
                  }),
                },
              ]}
            >
              <BlurView intensity={70} tint="dark" style={StyleSheet.absoluteFill} />
            </Animated.View>

            <View style={styles.heroContent}>
              {/* 🔹 Branding with plane animation */}
              <View style={styles.brandRow}>
                <LottieView
                  source={require("../../assets/lottie/planeloader.json")}
                  autoPlay
                  loop
                  style={styles.plane}
                />
                <Text style={styles.brand}>Travel with LUWAS</Text>
              </View>

              {/* Greeting */}
              <Text style={styles.heroTitle}>{greeting}, {displayName}</Text>
              <Text style={styles.heroSubtitle}>Plan your next adventure today</Text>

              {/* Weather */}
              {weather && (
                <Text style={styles.weatherText}>
                  🌤 {weather}{city ? ` in ${city}` : ""}
                </Text>
              )}

              {/* Next Trip */}
              <Text style={styles.nextTrip}>
                {nextTrip && getFormattedDate(nextTrip)
                  ? `🧳 Your next trip: ${nextTrip.destination} • ${getFormattedDate(nextTrip)}`
                  : "No upcoming trips. Book now!"}
              </Text>
            </View>
          </ImageBackground>
        </View>

        {/* 🔹 Sections Below */}
        <View style={styles.sectionContainer}>
          {/* Recommended Itineraries */}
          <View style={styles.section}>
            <SectionHeader title="Recommended for You" onPress={() => router.push("/(itineraries)")} />
            <Animated.ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={{ paddingHorizontal: 20 }}
            >
              {itineraries.map((item) => (
                <ItineraryCard
                  key={item.id}
                  id={item.id}
                  title={item.title}
                  duration={item.duration}
                  image={item.imageUrl}
                  onPress={() => router.push(`/(itineraries)/${item.id}`)}
                />
              ))}
            </Animated.ScrollView>
          </View>

          {/* Exclusive Promotions */}
          {promos.length > 0 && (
            <View style={styles.section}>
              <SectionHeader title="Exclusive Promotions" onPress={() => router.push("/(promos)")} />
              {promos.map((promo) => (
                <PromoBanner
                  key={promo.id}
                  promo={promo}
                  onPress={() => router.push(`/(promos)/${promo.id}`)}
                />
              ))}
            </View>
          )}

          {/* Popular Destinations */}
          <View style={styles.section}>
            <SectionHeader title="Popular Destinations" onPress={() => router.push("/(destination)")} />
            <Animated.ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={{ paddingHorizontal: 20 }}
            >
              {destinations.map((dest, index) => (
                <View key={dest.id} style={{ marginRight: index === destinations.length - 1 ? 0 : 16 }}>
                  <DestinationCard
                    title={dest.title}
                    location={dest.location}
                    price={dest.price}
                    image={dest.imageUrl}
                    onPress={() => router.push(`/(destination)/${dest.id}`)}
                  />
                </View>
              ))}
            </Animated.ScrollView>
          </View>
        </View>
      </Animated.ScrollView>
    </View>
  );
}

/* 🔹 Section Header */
function SectionHeader({ title, onPress }: { title: string; onPress: () => void }) {
  return (
    <View style={styles.sectionHeader}>
      <Text style={styles.sectionTitle}>{title}</Text>
      <Text style={styles.link} onPress={onPress}>See All</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  heroWrapper: {
    height: HERO_HEIGHT,
    borderBottomLeftRadius: 26,
    borderBottomRightRadius: 26,
    overflow: "hidden",
    marginBottom: 10,
  },
  hero: {
    width: "100%",
    height: HERO_HEIGHT,
    justifyContent: "flex-end",
  },
  heroContent: {
    padding: 20,
  
  },
  brandRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: -1,
  },
  plane: {
    width: 50,
    height: 50,
    marginRight: 2,
  },
 brand: {
  fontSize: 12,
  fontWeight: "600",
  color: "#93C5FD",
  letterSpacing: 1,
  fontStyle: "italic",
},
  heroTitle: {
    fontSize: 26,
    fontWeight: "700",
    color: "#fff",
    marginBottom: 5
  },
  heroSubtitle: {
    fontSize: 15,
    color: "rgba(255,255,255,0.9)",
    marginBottom: 8,
  },
  weatherText: {
    fontSize: 14,
    color: "#E5E7EB",
    marginBottom: 6,
  },
  nextTrip: {
    fontSize: 14,
    fontWeight: "500",
    color: "#FCD34D",
    marginTop: 2,
  },
  sectionContainer: {
    backgroundColor: "#F9FAFB",
    paddingBottom: 20,
  },
  section: {
    marginTop: 20,
  },
  sectionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginHorizontal: 20,
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: "600",
    color: "#111827",
  },
  link: {
    fontSize: 14,
    color: "#2563EB",
    fontWeight: "500",
  },
});