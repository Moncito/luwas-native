import React from "react";
import { Image, StyleSheet, Text, TouchableOpacity, View } from "react-native";

type Props = {
  title: string;
  location?: string;
  price?: number;
  image?: string;
  onPress?: () => void;
};

export default function DestinationCard({ title, location, price, image, onPress }: Props) {
  return (
    <TouchableOpacity style={styles.card} onPress={onPress}>
      {image && <Image source={{ uri: image }} style={styles.image} />}
      <View style={styles.content}>
        <Text style={styles.title}>{title}</Text>
        {location && <Text style={styles.location}>{location}</Text>}
        {price !== undefined && (
          <Text style={styles.price}>₱{price.toLocaleString()} / person</Text>
        )}
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    width: 180,
    marginRight: 16,
    backgroundColor: "#fff",
    borderRadius: 12,
    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 6,
    elevation: 3,
    overflow: "hidden",
  },
  image: {
    width: "100%",
    height: 120,
  },
  content: {
    padding: 12,
  },
  title: {
    fontSize: 16,
    fontWeight: "600",
    color: "#111827",
  },
  location: {
    fontSize: 14,
    color: "#6B7280",
    marginTop: 2,
  },
  price: {
    fontSize: 14,
    fontWeight: "500",
    color: "#2563EB",
    marginTop: 6,
  },
});
