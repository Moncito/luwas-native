// hooks/useDestinations.ts
import { collection, getDocs, limit, query } from "firebase/firestore";
import { useEffect, useState } from "react";
import { db } from "../src/lib/firebase";

export function useDestinations(limitCount = 3) {
  const [destinations, setDestinations] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDestinations = async () => {
      try {
        const q = query(collection(db, "destinations"), limit(limitCount));
        const snapshot = await getDocs(q);
        setDestinations(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
      } catch (error) {
        console.error("Error fetching destinations:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchDestinations();
  }, [limitCount]);

  return { destinations, loading };
}
