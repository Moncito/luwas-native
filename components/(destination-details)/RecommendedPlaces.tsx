import React, { useEffect, useState } from "react";
import { ActivityIndicator, FlatList, Image, Linking, StyleSheet, Text, TouchableOpacity, View } from "react-native";

const API_BASE = "https://luwas-travel.vercel.app";

export default function RecommendedPlaces({ lat, lon }: { lat: number; lon: number }) {
  const [places, setPlaces] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchPlaces = async () => {
      try {
        const res = await fetch(`${API_BASE}/api/recommendations?lat=${lat}&lon=${lon}`);
        const json = await res.json();
        setPlaces(json.places || []);
      } catch (err) {
        console.error("❌ Recommendations fetch failed:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchPlaces();
  }, [lat, lon]);

  if (loading) return <ActivityIndicator size="small" color="#2563EB" />;
  if (!places.length) return <Text>No nearby spots found.</Text>;

  return (
    <FlatList
      data={places}
      keyExtractor={(item, index) => index.toString()}
      horizontal
      showsHorizontalScrollIndicator={false}
      renderItem={({ item }) => (
        <View style={styles.card}>
          <Image source={{ uri: item.image }} style={styles.image} />
          <Text style={styles.title}>{item.title}</Text>
          <Text numberOfLines={2} style={styles.desc}>{item.description}</Text>
          <TouchableOpacity onPress={() => Linking.openURL(item.link)} style={styles.button}>
            <Text style={styles.buttonText}>View on Map</Text>
          </TouchableOpacity>
        </View>
      )}
    />
  );
}

const styles = StyleSheet.create({
  card: { backgroundColor: "#fff", borderRadius: 10, padding: 10, marginRight: 12, width: 200, elevation: 3 },
  image: { width: "100%", height: 120, borderRadius: 8 },
  title: { fontWeight: "600", fontSize: 14, marginTop: 8 },
  desc: { fontSize: 12, color: "#666", marginVertical: 4 },
  button: { backgroundColor: "#2563EB", paddingVertical: 6, borderRadius: 6, marginTop: 4 },
  buttonText: { color: "white", textAlign: "center", fontSize: 12 },
});