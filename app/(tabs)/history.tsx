 import { Ionicons } from "@expo/vector-icons";
import { BlurView } from "expo-blur";
import { onAuthStateChanged, User } from "firebase/auth";
import { collection, onSnapshot, query, where } from "firebase/firestore";
import React, { useEffect, useState } from "react";
import {
  Image,
  ImageBackground,
  Modal,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { auth, db } from "../../src/lib/firebase";

type TravelRecord = {
  id: string;
  type: "trip" | "itinerary" | "promo";
  fullName: string;
  email?: string;
  destination: string;
  status: string;
  createdAt?: any; // Firestore Timestamp or string
  departureDate?: any; // Firestore Timestamp or string
  people?: number;
  totalPrice?: number;
  specialRequests?: string;
  location?: string;
  proofUrl?: string;
};

const statusConfig: Record<
  string,
  { color: string; bg: string; icon: keyof typeof Ionicons.glyphMap }
> = {
  upcoming: { color: "#2563EB", bg: "#DBEAFE", icon: "airplane" },
  completed: { color: "green", bg: "#DCFCE7", icon: "checkmark-circle" },
  cancelled: { color: "red", bg: "#FEE2E2", icon: "close-circle" },
  awaiting_approval: { color: "#7C3AED", bg: "#EDE9FE", icon: "time" },
  paid: { color: "#10B981", bg: "#D1FAE5", icon: "card" },
  pending_payment: { color: "#F59E0B", bg: "#FEF3C7", icon: "hourglass" },
};

// 🔹 Utility to safely format Firestore Timestamps or strings
const formatDate = (date: any) => {
  if (!date) return "";
  if (date.toDate) {
    return date.toDate().toLocaleString(); // Firestore Timestamp
  }
  return new Date(date).toLocaleString(); // already a date string
};

export default function TravelHistory() {
  const [user, setUser] = useState<User | null>(null);
  const [filter, setFilter] = useState<"upcoming" | "completed" | "cancelled">(
    "upcoming"
  );
  const [trips, setTrips] = useState<TravelRecord[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedTrip, setSelectedTrip] = useState<TravelRecord | null>(null);

  useEffect(() => {
    const unsubscribeAuth = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
    });
    return () => unsubscribeAuth();
  }, []);

  useEffect(() => {
    if (!user) return;

    setLoading(true);
    const userId = user.uid;
    const unsubscribers: (() => void)[] = [];

    const collections = [
      { name: "bookings", type: "trip" as const },
      { name: "itineraryBookings", type: "itinerary" as const },
      { name: "promoBookings", type: "promo" as const },
    ];

    collections.forEach((col) => {
      const q = query(collection(db, col.name), where("userId", "==", userId));
      const unsubscribe = onSnapshot(q, (snap) => {
        const newTrips: TravelRecord[] = snap.docs.map((doc) => ({
          ...(doc.data() as Omit<TravelRecord, "id" | "type">),
          id: doc.id,
          type: col.type,
        }));
        setTrips((prev) => {
          const filteredPrev = prev.filter((t) => t.type !== col.type);
          return [...filteredPrev, ...newTrips];
        });
        setLoading(false);
      });
      unsubscribers.push(unsubscribe);
    });

    return () => unsubscribers.forEach((u) => u());
  }, [user]);

  const isUpcomingish = (status?: string) => {
    const s = (status || "").toLowerCase();
    return ["upcoming", "pending_payment", "paid", "awaiting_approval"].includes(
      s
    );
  };

  const filteredTrips = trips.filter((t) => {
    const s = (t.status || "").toLowerCase();
    if (filter === "upcoming") return isUpcomingish(s);
    return s === filter;
  });

  const renderCard = (trip: TravelRecord) => {
    const s = (trip.status || "").toLowerCase();
    const badge = statusConfig[s] || {
      color: "#6B7280",
      bg: "#E5E7EB",
      icon: "help-circle",
    };

    return (
      <TouchableOpacity key={trip.id} onPress={() => setSelectedTrip(trip)}>
        <View style={styles.cardWrapper}>
          <BlurView intensity={90} tint="light" style={styles.card}>
            <View style={styles.cardHeader}>
              <Text style={styles.destination}>
                {trip.destination || "Booking"}
              </Text>
              <View style={[styles.statusBadge, { backgroundColor: badge.bg }]}>
                <Ionicons name={badge.icon} size={14} color={badge.color} />
                <Text style={[styles.statusText, { color: badge.color }]}>
                  {trip.status.replace("_", " ")}
                </Text>
              </View>
            </View>

            <Text style={styles.details}>👤 {trip.fullName}</Text>
            <Text style={styles.details}>
              {trip.specialRequests || "No special requests"}
            </Text>
            {trip.departureDate && (
              <Text style={styles.details}>📅 {formatDate(trip.departureDate)}</Text>
            )}
            <Text style={styles.details}>
              📍 {trip.location || "Philippines"}
            </Text>
            <Text style={styles.details}>
              👥 {trip.people ?? 1} traveler(s) – ₱
              {trip.totalPrice?.toLocaleString() ?? 0}
            </Text>
          </BlurView>
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <ImageBackground
      source={{
        uri: "https://upload.wikimedia.org/wikipedia/commons/c/cb/Kalesa_at_Heroes_Square%2C_Intramuros%2C_Manila.jpg",
      }}
      style={styles.bg}
      resizeMode="cover"
    >
      <View style={styles.overlay} />

      <ScrollView
        style={styles.container}
        contentContainerStyle={{ paddingBottom: 100 }}
        showsVerticalScrollIndicator={false}
      >
        <Text style={styles.header}>Your Travel History ✈️</Text>

        {/* Filters */}
        <View style={styles.filterRow}>
          {(["upcoming", "completed", "cancelled"] as const).map((status) => (
            <TouchableOpacity
              key={status}
              style={[
                styles.filterBtn,
                filter === status && styles.filterBtnActive,
              ]}
              onPress={() => setFilter(status)}
            >
              <Text
                style={[
                  styles.filterText,
                  filter === status && styles.filterTextActive,
                ]}
              >
                {status.charAt(0).toUpperCase() + status.slice(1)}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* History List */}
        {loading && <Text style={styles.loading}>Loading your trips...</Text>}
        {filteredTrips.length === 0 && !loading ? (
          <Text style={styles.emptyText}>No records found for "{filter}".</Text>
        ) : (
          filteredTrips.map(renderCard)
        )}
      </ScrollView>

      {/* Booking Detail Modal */}
      <Modal visible={!!selectedTrip} transparent animationType="slide">
        <View style={styles.modalOverlay}>
          <View style={styles.modalBox}>
            {selectedTrip && (
              <ScrollView>
                <Text style={styles.modalTitle}>
                  {selectedTrip.type === "itinerary"
                    ? "Itinerary Booking"
                    : "Booking Details"}
                </Text>

                {/* Traveler Info */}
                <Text style={styles.sectionTitle}>Traveler Info</Text>
                <Text>👤 {selectedTrip.fullName}</Text>
                <Text>📧 {selectedTrip.email}</Text>
                <Text>📍 {selectedTrip.location || "Philippines"}</Text>

                {/* Booking Info */}
                <Text style={styles.sectionTitle}>Booking Info</Text>
                <Text>📅 {formatDate(selectedTrip.departureDate)}</Text>
                <Text>👥 People: {selectedTrip.people}</Text>

                {/* Payment Info */}
                <Text style={styles.sectionTitle}>Payment</Text>
                <Text>
                  💵 Total Price: ₱{selectedTrip.totalPrice?.toLocaleString()}
                </Text>
                <Text>Status: {selectedTrip.status}</Text>
                {selectedTrip.createdAt && (
                  <Text>📌 Booked At: {formatDate(selectedTrip.createdAt)}</Text>
                )}

                {/* Receipt */}
                {selectedTrip.proofUrl && (
                  <>
                    <Text style={styles.sectionTitle}>Receipt</Text>
                    <Image
                      source={{ uri: selectedTrip.proofUrl }}
                      style={{ width: "100%", height: 200, borderRadius: 12 }}
                      resizeMode="cover"
                    />
                  </>
                )}

                <TouchableOpacity
                  onPress={() => setSelectedTrip(null)}
                  style={styles.closeBtn}
                >
                  <Text style={{ color: "white", fontWeight: "600" }}>
                    Close
                  </Text>
                </TouchableOpacity>
              </ScrollView>
            )}
          </View>
        </View>
      </Modal>
    </ImageBackground>
  );
}

const styles = StyleSheet.create({
  bg: { flex: 1 },
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(0,0,0,0.5)",
  },
  container: { flex: 1, padding: 20 },
  header: {
    fontSize: 26,
    fontWeight: "700",
    color: "white",
    textAlign: "center",
    marginTop: 50,
    marginBottom: 20,
  },
  filterRow: {
    flexDirection: "row",
    justifyContent: "center",
    gap: 10,
    marginVertical: 20,
  },
  filterBtn: {
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 999,
    backgroundColor: "rgba(255,255,255,0.2)",
  },
  filterBtnActive: { backgroundColor: "white" },
  filterText: { fontWeight: "600", color: "white" },
  filterTextActive: { color: "black" },
  cardWrapper: {
    borderRadius: 30,
    marginBottom: 20,
    overflow: "hidden",
  },
  card: {
    padding: 20,
    backgroundColor: "rgba(255,255,255,0.25)",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.3)",
  },
  cardHeader: { flexDirection: "row", justifyContent: "space-between" },
  destination: { fontSize: 18, fontWeight: "700", color: "white", flex: 1 },
  statusBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 20,
  },
  statusText: { fontSize: 12, fontWeight: "600" },
  details: { marginTop: 4, color: "white", fontSize: 14 },

  // 🔹 Loading and Empty States
  loading: {
    textAlign: "center",
    marginVertical: 20,
    color: "white",
    fontSize: 16,
  },
  emptyText: {
    textAlign: "center",
    color: "white",
    marginTop: 40,
    fontSize: 16,
    fontStyle: "italic",
  },

  // 🔹 Modal Styles
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.6)",
    justifyContent: "center",
    alignItems: "center",
  },
  modalBox: {
    width: "90%",
    maxHeight: "80%",
    backgroundColor: "white",
    borderRadius: 20,
    padding: 20,
  },
  modalTitle: { fontSize: 20, fontWeight: "700", marginBottom: 10 },
  sectionTitle: { marginTop: 15, fontWeight: "700", fontSize: 16 },
  closeBtn: {
    marginTop: 20,
    padding: 12,
    backgroundColor: "#2563EB",
    borderRadius: 12,
    alignItems: "center",
  },
});
