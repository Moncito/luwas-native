import React, { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Image,
  StyleSheet,
  Text,
  View,
} from "react-native";

interface YelpReview {
  text: string;
  rating: number;
  user: { name: string; image_url: string };
}

interface YelpData {
  rating: number;
  reviews: YelpReview[];
}

const API_BASE = "https://luwas-travel-app.vercel.app";

export default function TravelerReviews({
  name,
  location,
}: {
  name: string;
  location: string;
}) {
  const [data, setData] = useState<YelpData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(
      `${API_BASE}/api/yelp/summary?name=${encodeURIComponent(
        name
      )}&location=${encodeURIComponent(location)}`
    )
      .then((res) => res.json())
      .then((json) => setData(json))
      .catch((err) => console.error("❌ Yelp API error:", err))
      .finally(() => setLoading(false));
  }, [name, location]);

  if (loading) return <ActivityIndicator size="large" color="#2563EB" />;
  if (!data?.reviews?.length)
    return (
      <Text style={styles.placeholder}>No reviews found for this place.</Text>
    );

  return (
    <View>
      <Text style={styles.sectionTitle}>Traveler Reviews</Text>
      {data.reviews.map((r, i) => (
        <View key={i} style={styles.card}>
          <Image source={{ uri: r.user.image_url }} style={styles.avatar} />
          <View style={{ flex: 1 }}>
            <Text style={styles.subText}>{r.user.name}</Text>
            <Text style={styles.subText}>⭐ {r.rating.toFixed(1)}</Text>
            <Text numberOfLines={3} style={styles.smallText}>
              {r.text}
            </Text>
          </View>
        </View>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  sectionTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: "#111",
    marginTop: 20,
    marginBottom: 10,
  },
  card: {
    flexDirection: "row",
    backgroundColor: "#f9fafb",
    padding: 12,
    borderRadius: 16,
    marginBottom: 12,
    shadowColor: "#000",
    shadowOpacity: 0.05,
    shadowRadius: 3,
    elevation: 2,
  },
  avatar: { width: 40, height: 40, borderRadius: 20, marginRight: 10 },
  subText: { fontSize: 15, fontWeight: "600", color: "#111" },
  smallText: { fontSize: 14, color: "#374151" },
  placeholder: {
    fontSize: 14,
    color: "#9ca3af",
    fontStyle: "italic",
    marginVertical: 10,
  },
});