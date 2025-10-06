import React from "react";
import { ImageBackground, StyleSheet, Text, View } from "react-native";

export default function PromoBanner({ promo }: any) {
  return (
    <ImageBackground
      source={{ uri: promo.imageUrl }}
      style={styles.banner}
      imageStyle={{ borderRadius: 16 }}
    >
      <View style={styles.overlay}>
        <Text style={styles.title}>{promo.title}</Text>
        {promo.discount && <Text style={styles.subtitle}>{promo.discount} Off</Text>}
      </View>
    </ImageBackground>
  );
}

const styles = StyleSheet.create({
  banner: {
    height: 150,
    marginHorizontal: 20,
    marginBottom: 10,
    borderRadius: 16,
    overflow: "hidden",
  },
  overlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.3)",
    justifyContent: "center",
    alignItems: "center",
    borderRadius: 16,
  },
  title: {
    fontSize: 20,
    fontWeight: "700",
    color: "#fff",
  },
  subtitle: {
    fontSize: 16,
    fontWeight: "500",
    color: "#f3f4f6",
    marginTop: 4,
  },
});
