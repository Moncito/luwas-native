import { collection, getDocs, limit, query } from "firebase/firestore";
import { useEffect, useState } from "react";
import { db } from "../src/lib/firebase";

export function useItineraries(max?: number) {
  const [itineraries, setItineraries] = useState<any[]>([]);

  useEffect(() => {
    async function fetchItineraries() {
      try {
        const q = max
          ? query(collection(db, "itineraries"), limit(max))
          : query(collection(db, "itineraries"));

        const snapshot = await getDocs(q);

        const items = snapshot.docs.map((doc) => {
          const raw = doc.data();
          return {
            id: doc.id,
            title: raw.title || "Untitled Itinerary",
            description: raw.description || "",
            imageUrl:
              raw.image || // ✅ use Firestore field
              "https://via.placeholder.com/400x250.png?text=Itinerary",
            duration: raw.duration || "",
            location: raw.location || "",
            price: raw.price || 0,
          };
        });

        setItineraries(items);
      } catch (error) {
        console.error("Error fetching itineraries:", error);
      }
    }

    fetchItineraries();
  }, [max]);

  return { itineraries };
}
