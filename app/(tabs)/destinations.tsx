// app/(tabs)/destinations.tsx
import { BlurView } from "expo-blur";
import { LinearGradient } from "expo-linear-gradient";
import { useRouter } from "expo-router";
import { collection, getDocs } from "firebase/firestore";
import React, {
  memo,
  useEffect,
  useRef,
  useState,
  type ReactNode,
} from "react";
import {
  ActivityIndicator,
  Animated,
  Image,
  Platform,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { db } from "../../src/lib/firebase";

interface Destination {
  id: string;
  name: string;
  location: string;
  tags: string[];
  imageUrl: string;
  price: number;
}

interface FadeInItemProps {
  index: number;
  children: ReactNode;
}

const HERO_HEIGHT = 220;

export default function DestinationsPage() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const scrollY = useRef(new Animated.Value(0)).current;

  const [destinations, setDestinations] = useState<Destination[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      try {
        const snapshot = await getDocs(collection(db, "destinations"));
        const data = snapshot.docs.map(
          (doc) => ({ id: doc.id, ...doc.data() } as Destination)
        );
        setDestinations(data);
      } catch (err) {
        console.error("Error fetching destinations:", err);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  // --- animations ---
  const headerTranslate = scrollY.interpolate({
    inputRange: [0, HERO_HEIGHT],
    outputRange: [0, -HERO_HEIGHT],
    extrapolate: "clamp",
  });

  const headerOpacity = scrollY.interpolate({
    inputRange: [0, HERO_HEIGHT / 2, HERO_HEIGHT],
    outputRange: [1, 0.4, 0],
    extrapolate: "clamp",
  });

  const stickyHeaderBg = scrollY.interpolate({
    inputRange: [0, HERO_HEIGHT / 2, HERO_HEIGHT],
    outputRange: ["transparent", "rgba(255,255,255,0.7)", "rgba(255,255,255,0.95)"],
    extrapolate: "clamp",
  });

  const stickyTitleColor = scrollY.interpolate({
    inputRange: [0, HERO_HEIGHT / 2, HERO_HEIGHT],
    outputRange: ["#fff", "#333", "#111"],
    extrapolate: "clamp",
  });

  const renderItem = ({ item, index }: { item: Destination; index: number }) => (
    <FadeInItem index={index}>
      <TouchableOpacity
        activeOpacity={0.9}
        onPress={() => router.push(`/(destination)/${item.id}`)}
        style={styles.card}
      >
        <View style={styles.cardMedia}>
          <Image source={{ uri: item.imageUrl }} style={styles.cardImage} />
          <LinearGradient
            colors={["rgba(0,0,0,0.25)", "rgba(0,0,0,0.05)", "transparent"]}
            style={StyleSheet.absoluteFill}
          />
          <View style={styles.priceWrap}>
            <BlurView intensity={25} tint="dark" style={styles.priceGlass}>
              <Text style={styles.priceText}>
                ₱{Number(item.price || 0).toLocaleString()}
              </Text>
            </BlurView>
          </View>
        </View>

        <View style={styles.cardContent}>
          <Text numberOfLines={1} style={styles.cardTitle}>
            {item.name}
          </Text>
          <Text numberOfLines={1} style={styles.cardSubtitle}>
            {item.location}
          </Text>

          {!!item.tags?.length && (
            <View style={styles.tagContainer}>
              {item.tags.slice(0, 5).map((tag, i) => (
                <View key={`${item.id}-tag-${i}`} style={styles.tagPill}>
                  <Text style={styles.tagText}>{tag}</Text>
                </View>
              ))}
            </View>
          )}
        </View>
      </TouchableOpacity>
    </FadeInItem>
  );

  const EmptyState = () => (
    <View style={styles.emptyWrap}>
      <Text style={styles.emptyEmoji}>🗺️</Text>
      <Text style={styles.emptyTitle}>No destinations found</Text>
      <Text style={styles.emptySubtitle}>
        Try adjusting filters or check back later. We’re adding more trips soon.
      </Text>
    </View>
  );

  return (
    <View style={styles.container}>
      {/* Hero image with overlay + big title */}
      <Animated.View
        style={[
          styles.heroWrap,
          { transform: [{ translateY: headerTranslate }] },
        ]}
      >
        <Image
          source={require("../../assets/images/homedestination.jpg")}
          style={styles.heroImage}
          resizeMode="cover"
        />
        <LinearGradient
          colors={["rgba(0,0,0,0.65)", "rgba(0,0,0,0.25)", "rgba(0,0,0,0.65)"]}
          style={StyleSheet.absoluteFill}
        />

        <Animated.View style={[styles.heroTextWrap, { opacity: headerOpacity }]}>
          <Text style={styles.heroTitle}>Destinations</Text>
          <Text style={styles.heroSubtitle}>
            Discover curated trips across the Philippines
          </Text>
        </Animated.View>
      </Animated.View>

      {/* Sticky header */}
      <Animated.View
        style={[
          styles.stickyHeader,
          { paddingTop: insets.top + 10, backgroundColor: stickyHeaderBg },
        ]}
      >
        <Animated.Text
          style={[styles.stickyTitle, { color: stickyTitleColor }]}
        >
          Destinations
        </Animated.Text>
      </Animated.View>

      {/* List */}
      {loading ? (
        <View style={{ marginTop: HERO_HEIGHT + 40 }}>
          <ActivityIndicator size="large" color="#2563EB" />
        </View>
      ) : (
        <Animated.FlatList
          data={destinations}
          keyExtractor={(item) => item.id}
          renderItem={renderItem}
          ListEmptyComponent={<EmptyState />}
          ListHeaderComponent={<View style={{ height: HERO_HEIGHT + 40 }} />}
          contentContainerStyle={{ paddingBottom: 28 }}
          showsVerticalScrollIndicator={false}
          scrollEventThrottle={16}
          onScroll={Animated.event(
            [{ nativeEvent: { contentOffset: { y: scrollY } } }],
            { useNativeDriver: false }
          )}
        />
      )}
    </View>
  );
}

const FadeInItem = memo(({ index, children }: FadeInItemProps) => {
  const opacity = useRef(new Animated.Value(0)).current;
  const translateY = useRef(new Animated.Value(12)).current;

  useEffect(() => {
    const delay = Math.min(index * 80, 600);
    Animated.parallel([
      Animated.timing(opacity, {
        toValue: 1,
        duration: 320,
        delay,
        useNativeDriver: true,
      }),
      Animated.timing(translateY, {
        toValue: 0,
        duration: 320,
        delay,
        useNativeDriver: true,
      }),
    ]).start();
  }, [index, opacity, translateY]);

  return (
    <Animated.View style={{ opacity, transform: [{ translateY }] }}>
      {children}
    </Animated.View>
  );
});

const CARD_RADIUS = 16;

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#F9FAFB" },
  heroWrap: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    height: HERO_HEIGHT,
    overflow: "hidden",
    zIndex: 1,
  },
  heroImage: { width: "100%", height: "100%" },
  heroTextWrap: { position: "absolute", bottom: 20, left: 16, right: 16 },
  heroTitle: { fontSize: 28, fontWeight: "700", color: "white" },
  heroSubtitle: { fontSize: 14, color: "rgba(255,255,255,0.9)", marginTop: 4 },
  stickyHeader: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    height: 0,
    justifyContent: "center",
    alignItems: "center",
    zIndex: 0,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderColor: "rgba(0,0,0,0.05)",
  },
  stickyTitle: { fontSize: 18, fontWeight: "600" },
  card: {
    backgroundColor: "#fff",
    borderRadius: CARD_RADIUS,
    marginHorizontal: 16,
    marginBottom: 16,
    overflow: "hidden",
    borderWidth: 1,
    borderColor: "#E5E7EB",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.012,
    shadowRadius: 4,
    elevation: 5,
  },
  cardMedia: { width: "100%", height: 180 },
  cardImage: { width: "100%", height: "100%" },
  priceWrap: { position: "absolute", top: 12, right: 12 },
  priceGlass: {
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.3)",
  },
  priceText: { color: "#fff", fontWeight: "700", fontSize: 13 },
  cardContent: { paddingHorizontal: 14, paddingVertical: 12 },
  cardTitle: { fontSize: 18, fontWeight: "600", color: "#111" },
  cardSubtitle: { fontSize: 14, color: "#6B7280", marginTop: 2 },
  tagContainer: { flexDirection: "row", flexWrap: "wrap", marginTop: 8, gap: 6 },
  tagPill: {
    paddingHorizontal: 10,
    paddingVertical: Platform.select({ ios: 4, android: 3 }),
    borderRadius: 999,
    backgroundColor: "#F3F4F6",
  },
  tagText: { color: "#374151", fontSize: 12, fontWeight: "500" },
  emptyWrap: { alignItems: "center", justifyContent: "center", flex: 1, paddingHorizontal: 24 },
  emptyEmoji: { fontSize: 48, marginBottom: 8 },
  emptyTitle: { fontSize: 18, fontWeight: "700", color: "#111" },
  emptySubtitle: { textAlign: "center", color: "#6B7280", marginTop: 6, lineHeight: 20 },
});
