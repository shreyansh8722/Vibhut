import React from 'react';
import { GoogleMap, LoadScript, MarkerF } from '@react-google-maps/api';
import { ExternalLink } from 'lucide-react';

const GOOGLE_MAPS_API_KEY = import.meta.env.VITE_GOOGLE_MAPS_API_KEY;

const containerStyle = {
  width: '100%',
  height: '300px'
};

// This is the "Light Monochrome" style
const mapStyle = [
  { "featureType": "all", "elementType": "geometry.fill", "stylers": [ { "weight": "2.00" } ] },
  { "featureType": "all", "elementType": "geometry.stroke", "stylers": [ { "color": "#9c9c9c" } ] },
  { "featureType": "all", "elementType": "labels.text", "stylers": [ { "visibility": "on" } ] },
  { "featureType": "landscape", "elementType": "all", "stylers": [ { "color": "#f2f2f2" } ] },
  { "featureType": "landscape", "elementType": "geometry.fill", "stylers": [ { "color": "#ffffff" } ] },
  { "featureType": "landscape.man_made", "elementType": "geometry.fill", "stylers": [ { "color": "#ffffff" } ] },
  { "featureType": "poi", "elementType": "all", "stylers": [ { "visibility": "off" } ] },
  { "featureType": "road", "elementType": "all", "stylers": [ { "saturation": -100 }, { "lightness": 45 } ] },
  { "featureType": "road", "elementType": "geometry.fill", "stylers": [ { "color": "#eeeeee" } ] },
  { "featureType": "road", "elementType": "labels.text.fill", "stylers": [ { "color": "#7b7b7b" } ] },
  { "featureType": "road", "elementType": "labels.text.stroke", "stylers": [ { "color": "#ffffff" } ] },
  { "featureType": "road.highway", "elementType": "all", "stylers": [ { "visibility": "simplified" } ] },
  { "featureType": "road.arterial", "elementType": "labels.icon", "stylers": [ { "visibility": "off" } ] },
  { "featureType": "transit", "elementType": "all", "stylers": [ { "visibility": "off" } ] },
  { "featureType": "water", "elementType": "all", "stylers": [ { "color": "#c1e6f3" }, { "visibility": "on" } ] },
  { "featureType": "water", "elementType": "geometry.fill", "stylers": [ { "color": "#c1e6f3" } ] },
  { "featureType": "water", "elementType": "labels.text.fill", "stylers": [ { "color": "#070707" } ] },
  { "featureType": "water", "elementType": "labels.text.stroke", "stylers": [ { "color": "#ffffff" } ] }
];

export default function MapEmbed({ spot }) {
  const mapCenter = {
    lat: spot.location.latitude,
    lng: spot.location.longitude
  };

  return (
    <LoadScript googleMapsApiKey={GOOGLE_MAPS_API_KEY}>
      <div className="relative rounded-lg overflow-hidden">
        <GoogleMap
          mapContainerStyle={containerStyle}
          center={mapCenter}
          zoom={15}
          // These options add the style and remove the ugly buttons
          options={{
            styles: mapStyle,
            disableDefaultUI: true,
            zoomControl: true 
          }}
        >
          <MarkerF position={mapCenter} />
        </GoogleMap>
        
        <a
          href={spot.googleMapsUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="absolute bottom-4 left-4 bg-white py-2 px-4 rounded-lg shadow-md font-semibold text-gray-800 flex items-center gap-2"
        >
          <ExternalLink size={18} />
          Get Directions
        </a>
      </div>
    </LoadScript>
  );
}