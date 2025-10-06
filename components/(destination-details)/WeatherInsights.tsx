import React, { useEffect, useState } from "react";
import { ActivityIndicator, StyleSheet, Text, View } from "react-native";

const API_BASE = "https://luwas-travel.vercel.app";

export default function WeatherInsights({ title, location }: { title: string; location: string }) {
  const [weather, setWeather] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchWeather = async () => {
      try {
        const res = await fetch(`${API_BASE}/api/ai/weather`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ title, location }),
        });
        const json = await res.json();
        setWeather(json);
      } catch (err) {
        console.error("❌ Weather fetch failed:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchWeather();
  }, [title, location]);

  if (loading) return <ActivityIndicator size="small" color="#2563EB" />;
  if (!weather) return <Text>No weather data found.</Text>;

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Best Time to Visit</Text>
      {weather.bestTime?.map((bt: any, i: number) => (
        <Text key={i} style={styles.item}>{bt.emoji} {bt.label} — {bt.reason}</Text>
      ))}

      <Text style={[styles.title, { marginTop: 12 }]}>Weather Info</Text>
      {weather.weatherInfo?.map((wi: any, i: number) => (
        <Text key={i} style={styles.item}>{wi.label}: {wi.temperature} ({wi.months})</Text>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { marginTop: 8, padding: 10, backgroundColor: "#fff", borderRadius: 10, elevation: 2 },
  title: { fontWeight: "600", fontSize: 16, marginBottom: 4 },
  item: { fontSize: 13, color: "#444", marginBottom: 2 },
});