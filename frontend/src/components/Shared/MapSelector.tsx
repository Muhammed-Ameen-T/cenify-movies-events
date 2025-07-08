// src/components/MapSelector.tsx
import React, { useState} from 'react';
import { GoogleMap, Marker, useJsApiLoader } from '@react-google-maps/api';

interface MapSelectorProps {
  initialLocation?: { lat: number; lng: number };
  onLocationSelected: (location: { lat: number; lng: number }) => void;
}

const MapSelector: React.FC<MapSelectorProps> = ({ initialLocation, onLocationSelected }) => {
  // Default to a central location if none provided
  const [location, setLocation] = useState(
    initialLocation || { lat: 20.5937, lng: 78.9629 } // Center of India
  );

  const { isLoaded } = useJsApiLoader({
    id: 'google-map-script',
    googleMapsApiKey: 'AIzaSyBGqK-iLJWbT9IIOzqQqEeVQs036gFO-Fw' // Replace with your Google Maps API key
  });

  const handleMapClick = (e: google.maps.MapMouseEvent) => {
    if (e.latLng) {
      const newLocation = {
        lat: e.latLng.lat(),
        lng: e.latLng.lng()
      };
      setLocation(newLocation);
      onLocationSelected(newLocation);
    }
  };

  const handleCurrentLocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const newLocation = {
            lat: position.coords.latitude,
            lng: position.coords.longitude
          };
          setLocation(newLocation);
          onLocationSelected(newLocation);
        },
        (error) => {
          console.error("Error getting location:", error);
          alert("Unable to get your current location. Please select manually.");
        }
      );
    } else {
      alert("Geolocation is not supported by this browser.");
    }
  };

  return (
    <div className="space-y-2">
      <div className="flex justify-between items-center">
        <label className="text-sm font-medium text-gray-300">Select Theater Location</label>
        <button
          type="button"
          onClick={handleCurrentLocation}
          className="text-xs bg-blue-600 hover:bg-blue-700 text-white py-1 px-2 rounded-md transition-colors"
        >
          Use Current Location
        </button>
      </div>
      
      {isLoaded ? (
        <div className="h-64 rounded-lg overflow-hidden">
          <GoogleMap
            mapContainerStyle={{ width: '100%', height: '100%' }}
            center={location}
            zoom={12}
            onClick={handleMapClick}
          >
            <Marker position={location} />
          </GoogleMap>
        </div>
      ) : (
        <div className="h-64 bg-gray-700 border border-gray-600 rounded-lg flex items-center justify-center">
          <p className="text-gray-400">Loading map...</p>
        </div>
      )}
      
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-1">
          <label className="text-xs text-gray-400">Latitude</label>
          <input
            type="text"
            value={location.lat.toFixed(6)}
            readOnly
            className="w-full py-2 px-3 rounded-lg bg-gray-700 border border-gray-600 text-white text-sm"
          />
        </div>
        <div className="space-y-1">
          <label className="text-xs text-gray-400">Longitude</label>
          <input
            type="text"
            value={location.lng.toFixed(6)}
            readOnly
            className="w-full py-2 px-3 rounded-lg bg-gray-700 border border-gray-600 text-white text-sm"
          />
        </div>
      </div>
    </div>
  );
};

export default MapSelector;