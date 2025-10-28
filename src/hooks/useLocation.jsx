import React, { createContext, useContext, useState, useCallback } from 'react';

// Get the API key from our .env file
const API_KEY = import.meta.env.VITE_GOOGLE_MAPS_API_KEY;

const LocationContext = createContext(null);

export function LocationProvider({ children }) {
  const [location, setLocation] = useState(null); // (lat, lng)
  const [address, setAddress] = useState(null); // "Neighborhood, City"
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // This function turns (lat, lng) into an address
  const reverseGeocode = async (lat, lng) => {
    try {
      // --- THIS IS THE FIXED LINE ---
      const response = await fetch(
        `https://maps.googleapis.com/maps/api/geocode/json?latlng=${lat},${lng}&key=${API_KEY}`
      );
      if (!response.ok) throw new Error('Failed to fetch address');
      
      const data = await response.json();
      if (data.status !== 'OK') {
        // Log the specific Google API error
        console.error("Geocoding API Error:", data.error_message);
        throw new Error(data.error_message || 'Could not get address');
      }

      // This logic finds the Neighborhood and City from Google's response
      const results = data.results[0];
      if (!results) throw new Error("No address found for coordinates");

      const neighborhood = results.address_components.find(
        (c) => c.types.includes('locality') || c.types.includes('sublocality')
      )?.long_name;
      
      const city = results.address_components.find(
        (c) => c.types.includes('administrative_area_level_2') || c.types.includes('postal_town')
      )?.long_name;

      if (neighborhood && city) {
        setAddress(`${neighborhood}, ${city}`);
      } else {
        setAddress(city || neighborhood || 'Unknown Location');
      }
    } catch (err) {
      console.error(err);
      setError('Could not get address');
    } finally {
      setLoading(false);
    }
  };

  // This is the main function we'll call
  const requestLocation = useCallback(() => {
    setLoading(true);
    setError(null);
    setAddress(null); // Clear old address

    if (!navigator.geolocation) {
      setError('Geolocation is not supported by your browser');
      setLoading(false);
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const { latitude, longitude } = position.coords;
        const newLocation = { lat: latitude, lng: longitude };
        setLocation(newLocation);
        // Now that we have the location, get the address
        reverseGeocode(latitude, longitude);
      },
      (geoError) => {
        // This is the "User denied Geolocation" error
        setError(geoError.message); 
        setLoading(false);
      }
    );
  }, []);

  return (
    <LocationContext.Provider value={{ location, address, loading, error, requestLocation }}>
      {children}
    </LocationContext.Provider>
  );
}

// The custom hook to consume the context
export function useLocation() {
  return useContext(LocationContext);
}