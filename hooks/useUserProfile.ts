import { onAuthStateChanged } from "firebase/auth";
import { doc, getDoc } from "firebase/firestore";
import { useEffect, useState } from "react";
import { auth, db } from "../src/lib/firebase";

export function useUserProfile() {
  const [fullName, setFullName] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // ✅ Listen for auth state changes
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (!user) {
        setFullName(null);
        setLoading(false);
        return;
      }

      try {
        const userDoc = await getDoc(doc(db, "users", user.uid));
        if (userDoc.exists()) {
          const data = userDoc.data();
          // ✅ Handle both "fullName" and "name" fields just in case
          setFullName(data.fullName || data.name || "Traveler");
        } else {
          setFullName("Traveler");
        }
      } catch (error) {
        console.error("Error fetching user profile:", error);
        setFullName("Traveler");
      } finally {
        setLoading(false);
      }
    });

    return () => unsubscribe();
  }, []);

  return { fullName, loading };
}
