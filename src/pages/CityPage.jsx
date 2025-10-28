import React, { useEffect, useState } from "react";
import { collection, query, where, getDocs } from "firebase/firestore";
import { getDb } from "@/lib/firebase";

export default function CityPage({ cityId }) {
  const [spots, setSpots] = useState([]);
  const db = getDb();

  useEffect(() => {
    const fetchSpots = async () => {
      console.log("Fetching spots for city:", cityId);

      try {
        const q = query(collection(db, "spots"), where("cityId", "==", cityId));
        const querySnapshot = await getDocs(q);

        console.log("QuerySnapshot size:", querySnapshot.size);

        const spotList = querySnapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));

        console.log("Fetched spots data:", spotList);
        setSpots(spotList);
      } catch (error) {
        console.error("Error fetching spots:", error);
      }
    };

    if (cityId) {
      fetchSpots();
    }
  }, [cityId, db]);

  return (
    <div className="p-4">
      <h2 className="text-xl font-bold mb-4">Spots in this city</h2>
      {spots.length === 0 ? (
        <p className="text-gray-500">No spots found for this city.</p>
      ) : (
        <ul className="space-y-2">
          {spots.map((spot) => (
            <li key={spot.id} className="p-3 bg-white rounded-xl shadow">
              <h3 className="font-semibold">{spot.name}</h3>
              <p className="text-sm text-gray-600">{spot.description}</p>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
