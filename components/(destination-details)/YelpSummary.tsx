import React, { useEffect, useState } from "react";
import { ActivityIndicator, Image, Linking, StyleSheet, Text, TouchableOpacity, View } from "react-native";

const API_BASE = "https://luwas-travel.vercel.app"; // your deployed web backend

interface YelpReview {
  text: string;
  rating: number;
  user: { name: string; image_url: string };
}

export default function YelpSummary({ name, location }: { name: string; location: string }) {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchYelp = async () => {
      try {
        const res = await fetch(
          `${API_BASE}/api/yelp/summary?name=${encodeURIComponent(name)}&location=${encodeURIComponent(location)}`
        );
        const json = await res.json();
        setData(json);
      } catch (err) {
        console.error("❌ Yelp fetch failed:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchYelp();
  }, [name, location]);

  if (loading) return <ActivityIndicator size="small" color="#2563EB" />;
  if (!data || !data.summary) return null;

  return (
    <View style={styles.container}>
      {data.image ? (
        <Image source={{ uri: data.image }} style={styles.image} />
      ) : (
        <View style={styles.imagePlaceholder}><Text>No image</Text></View>
      )}

      <View style={styles.content}>
        <Text style={styles.title}>Reviews from Yelp</Text>
        <Text style={styles.summary}>{data.summary}</Text>
        <Text style={styles.rating}>⭐ {data.rating?.toFixed(1)} on Yelp</Text>

        {data.url && (
          <TouchableOpacity onPress={() => Linking.openURL(data.url)} style={styles.button}>
            <Text style={styles.buttonText}>View on Yelp</Text>
          </TouchableOpacity>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flexDirection: "row", gap: 12, marginVertical: 10 },
  image: { width: 100, height: 80, borderRadius: 8 },
  imagePlaceholder: { width: 100, height: 80, backgroundColor: "#eee", alignItems: "center", justifyContent: "center" },
  content: { flex: 1 },
  title: { fontWeight: "600", fontSize: 16, marginBottom: 4 },
  summary: { fontSize: 14, color: "#444", marginBottom: 6 },
  rating: { fontSize: 14, fontWeight: "500" },
  button: { marginTop: 6, backgroundColor: "#2563EB", paddingVertical: 6, borderRadius: 6 },
  buttonText: { color: "white", textAlign: "center" },
});