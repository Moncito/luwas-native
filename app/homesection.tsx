import { BlurView } from "expo-blur";
import { useRouter } from "expo-router";
import React, { useEffect } from "react";
import {
  Dimensions,
  ImageBackground,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withDelay,
  withSpring,
  withTiming,
} from "react-native-reanimated";
import { useUserProfile } from "../hooks/useUserProfile";

const { height, width } = Dimensions.get("window");

export default function HomeSection() {
  const router = useRouter();
  const { fullName } = useUserProfile();
  const displayName =
    fullName && fullName !== "Unnamed" && fullName.trim() !== "" ? fullName : "Traveler";

  // Animation shared values
  const titleOpacity = useSharedValue(0);
  const titleTranslate = useSharedValue(30);
  const subtitleOpacity = useSharedValue(0);
  const buttonScale = useSharedValue(0.7);
  const bgScale = useSharedValue(1);

  useEffect(() => {
    // Animate sequence when mounted
    titleOpacity.value = withTiming(1, { duration: 800 });
    titleTranslate.value = withTiming(0, { duration: 800 });
    subtitleOpacity.value = withDelay(400, withTiming(1, { duration: 800 }));
    buttonScale.value = withDelay(700, withSpring(1, { damping: 8 }));
    bgScale.value = withTiming(1.05, { duration: 4000 });
  }, []);

  // Animated styles
  const titleStyle = useAnimatedStyle(() => ({
    opacity: titleOpacity.value,
    transform: [{ translateY: titleTranslate.value }],
  }));

  const subtitleStyle = useAnimatedStyle(() => ({
    opacity: subtitleOpacity.value,
  }));

  const buttonStyle = useAnimatedStyle(() => ({
    transform: [{ scale: buttonScale.value }],
  }));

  const bgStyle = useAnimatedStyle(() => ({
    transform: [{ scale: bgScale.value }],
  }));

  return (
    <View style={styles.container}>
      {/* Fullscreen background image */}
      <Animated.View style={[styles.backgroundWrapper, bgStyle]}>
        <ImageBackground
          source={require("../assets/images/homesection.jpg")}
          style={styles.background}
          resizeMode="cover"
        >
          {/* Overlay */}
          <View style={styles.overlay} />

          {/* Content */}
          <View style={styles.content}>
            <Animated.Text style={[styles.title, titleStyle]}>
              {displayName}, Plan Your Next Journey
            </Animated.Text>

            <Animated.Text style={[styles.subtitle, subtitleStyle]}>
              Discover destinations, exclusive deals, and curated itineraries.
            </Animated.Text>

            <Animated.View style={buttonStyle}>
              <BlurView intensity={60} tint="light" style={styles.glassButton}>
                <TouchableOpacity
                  onPress={() => router.replace("/(tabs)/home")}
                  style={styles.buttonContent}
                  activeOpacity={0.8}
                >
                  <Text style={styles.buttonText}>Get Started</Text>
                </TouchableOpacity>
              </BlurView>
            </Animated.View>
          </View>
        </ImageBackground>
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  backgroundWrapper: {
    height,
    width,
  },
  background: {
    height: "100%",
    width: "100%",
    justifyContent: "flex-end",
  },
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(0,0,0,0.35)",
  },
  content: {
    padding: 24,
    alignItems: "center",
    marginBottom: 100,
  },
  title: {
    fontSize: 30,
    fontWeight: "700",
    color: "#fff",
    textAlign: "center",
    marginBottom: 12,
  },
  subtitle: {
    fontSize: 16,
    color: "#e5e7eb",
    textAlign: "center",
    marginBottom: 40,
  },
  glassButton: {
    borderRadius: 14,
    overflow: "hidden",
    shadowColor: "#000",
    shadowOpacity: 0.2,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 4 },
    backgroundColor: "rgba(255,255,255,0.15)",
  },
  buttonContent: {
    paddingVertical: 14,
    paddingHorizontal: 60,
    alignItems: "center",
  },
  buttonText: {
    fontSize: 17,
    fontWeight: "600",
    color: "#111827",
  },
});