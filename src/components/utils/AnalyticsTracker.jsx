import { useEffect } from "react";
import { useLocation } from "react-router-dom";
import ReactGA from "react-ga4";

// Replace 'G-XXXXXXXXXX' with your actual Measurement ID from Google Analytics
const MEASUREMENT_ID = "G-5MXEBD967B"; 

ReactGA.initialize(MEASUREMENT_ID);

export const AnalyticsTracker = () => {
  const location = useLocation();

  useEffect(() => {
    // Send page view event to Google Analytics
    ReactGA.send({ hitType: "pageview", page: location.pathname + location.search });
    console.log(`📡 Tracking Page View: ${location.pathname}`);
  }, [location]);

  return null; // This component doesn't render anything visually
};