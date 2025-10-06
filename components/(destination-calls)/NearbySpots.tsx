import React, { useEffect, useState } from "react";
import { ActivityIndicator, FlatList, Image, StyleSheet, Text, View } from "react-native";

interface Place {
  title: string;
  description: string;
  image: string;
  link: string;
}

const API_BASE = "https://luwas-travel-app.vercel.app";

export default function NearbySpots({ lat, lon }: { lat: number; lon: number }) {
  const [places, setPlaces] = useState<Place[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(`${API_BASE}/api/recommendations?lat=${lat}&lon=${lon}`)
      .then((res) => res.json())
      .then((json) => setPlaces(json.places || []))
      .catch((err) => console.error("❌ Places API error:", err))
      .finally(() => setLoading(false));
  }, [lat, lon]);

  if (loading) return <ActivityIndicator size="large" color="#2563EB" />;

  if (places.length === 0) return <Text style={styles.placeholder}>No nearby spots found.</Text>;

  return (
    <FlatList
      data={places}
      horizontal
      showsHorizontalScrollIndicator={false}
      keyExtractor={(_, i) => i.toString()}
      renderItem={({ item }) => (
        <View style={styles.card}>
          {item.image && <Image source={{ uri: item.image }} style={styles.image} />}
          <View style={styles.content}>
            <Text style={styles.title}>{item.title}</Text>
            <Text style={styles.desc} numberOfLines={2}>{item.description}</Text>
          </View>
        </View>
      )}
    />
  );
}

const styles = StyleSheet.create({
  card: {
    width: 220,
    backgroundColor: "#fff",
    borderRadius: 16,
    marginRight: 12,
    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowRadius: 6,
    elevation: 4,
    overflow: "hidden",
  },
  image: { width: "100%", height: 120 },
  content: { padding: 10 },
  title: { fontSize: 15, fontWeight: "600", color: "#111" },
  desc: { fontSize: 13, color: "#444", marginTop: 4 },
  placeholder: { fontSize: 14, color: "#9CA3AF", textAlign: "center", marginVertical: 20 },
});