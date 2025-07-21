import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { MapPin, Search, Check } from 'lucide-react';
import axios from 'axios';
import Cookies from 'js-cookie';
import { debounce } from 'lodash';
import { showSuccessToast, showErrorToast } from '../../utils/toast';
import { useDispatch } from 'react-redux'; // Import useDispatch
import { setSelectedLocation } from '../../store/slices/locationSlice'; // Import Redux action

// Load Google Maps API key from environment variable
const GOOGLE_MAPS_API_KEY = import.meta.env.VITE_REACT_APP_GOOGLE_MAPS_API_KEY || '';

// Static coordinate map for manual city selection
const cityCoordinates: { [key: string]: { latitude: number; longitude: number } } = {
  Mumbai: { latitude: 19.0759837, longitude: 72.8776559 },
  Delhi: { latitude: 28.7040592, longitude: 77.1024902 },
  Bangalore: { latitude: 12.9715987, longitude: 77.5945627 },
  Hyderabad: { latitude: 17.385044, longitude: 78.486671 },
  Chennai: { latitude: 13.0826802, longitude: 80.2707184 },
  Kolkata: { latitude: 22.572646, longitude: 88.363895 },
  Ahmedabad: { latitude: 23.022505, longitude: 72.5713621 },
  Pune: { latitude: 18.5204303, longitude: 73.8567437 },
  Jaipur: { latitude: 26.9124336, longitude: 75.7872709 },
  Lucknow: { latitude: 26.8466937, longitude: 80.946166 },
  Kanpur: { latitude: 26.449923, longitude: 80.3318736 },
  Nagpur: { latitude: 21.1458004, longitude: 79.0881546 },
  Indore: { latitude: 22.7195687, longitude: 75.8577258 },
  Thane: { latitude: 19.2183307, longitude: 72.9780897 },
  Bhopal: { latitude: 23.2599333, longitude: 77.412615 },
  Visakhapatnam: { latitude: 17.6868159, longitude: 83.2184815 },
  Patna: { latitude: 25.5940947, longitude: 85.1375645 },
  Vadodara: { latitude: 22.3071588, longitude: 73.1812187 },
  Ghaziabad: { latitude: 28.6691565, longitude: 77.4537578 },
  Surat: { latitude: 21.1702401, longitude: 72.8310607 },
  Ludhiana: { latitude: 30.900965, longitude: 75.8572758 },
  Agra: { latitude: 27.1766701, longitude: 78.0080745 },
  Nashik: { latitude: 19.9974533, longitude: 73.7898023 },
  Ranchi: { latitude: 23.3440997, longitude: 85.309562 },
  Faridabad: { latitude: 28.4089123, longitude: 77.3177894 },
  Coimbatore: { latitude: 11.0168445, longitude: 76.9558321 },
  Rajkot: { latitude: 22.3038945, longitude: 70.8021599 },
  Meerut: { latitude: 28.9844618, longitude: 77.7064137 },
  Srinagar: { latitude: 34.0836708, longitude: 74.7972825 },
  Aurangabad: { latitude: 19.8761653, longitude: 75.3433139 },
  Dhanbad: { latitude: 23.7956531, longitude: 86.4303859 },
  Amritsar: { latitude: 31.6343083, longitude: 74.8736788 },
  Allahabad: { latitude: 25.4358011, longitude: 81.846311 },
  Howrah: { latitude: 22.5957689, longitude: 88.2636394 },
  Gwalior: { latitude: 26.2182871, longitude: 78.1828308 },
  Jabalpur: { latitude: 23.181467, longitude: 79.9864071 },
  Madurai: { latitude: 9.9252007, longitude: 78.1197754 },
  Vijayawada: { latitude: 16.5061743, longitude: 80.6480153 },
  Jodhpur: { latitude: 26.2389469, longitude: 73.0243094 },
  Salem: { latitude: 11.664325, longitude: 78.1460142 },
  Raipur: { latitude: 21.2513844, longitude: 81.6296413 },
  Kochi: { latitude: 9.9312328, longitude: 76.2673041 },
  Kozhikode: { latitude: 11.2587531, longitude: 75.78041 },
  Thiruvananthapuram: { latitude: 8.5241391, longitude: 76.9366376 },
  Calicut: { latitude: 11.2587531, longitude: 75.78041 }, // Same as Kozhikode
  Guwahati: { latitude: 26.1445169, longitude: 91.7362365 },
  Bhubaneswar: { latitude: 20.2960587, longitude: 85.8245398 },
  Noida: { latitude: 28.5355161, longitude: 77.3910265 },
  Chandigarh: { latitude: 30.7333148, longitude: 76.7794179 },
  Mysore: { latitude: 12.2958104, longitude: 76.6393805 },
  Dehradun: { latitude: 30.3164945, longitude: 78.0321918 },
  Shimla: { latitude: 31.1048145, longitude: 77.1734033 },
  Vellore: { latitude: 12.9165167, longitude: 79.1324986 },
};

const indianCities = Object.keys(cityCoordinates);

interface CitySelectionModalProps {
  isCityModalOpen: boolean;
  setIsCityModalOpen: (open: boolean) => void;
  selectedLocation: string;
  cityModalRef: React.RefObject<HTMLDivElement>;
}

interface AddressComponent {
  long_name: string;
  short_name: string;
  types: string[];
}

const CitySelectionModal: React.FC<CitySelectionModalProps> = ({
  isCityModalOpen,
  setIsCityModalOpen,
  selectedLocation,
  cityModalRef,
}) => {
  const [searchCity, setSearchCity] = useState('');
  const [filteredCities, setFilteredCities] = useState<string[]>(indianCities);
  const [isLoadingLocation, setIsLoadingLocation] = useState(false);
  const dispatch = useDispatch(); // Get dispatch function

  // Debounce search input to improve performance
  const debouncedSetSearchCity = debounce((value: string) => {
    setSearchCity(value);
  }, 300);

  // Filter cities based on search input
  useEffect(() => {
    const filtered = indianCities.filter((city) =>
      city.toLowerCase().includes(searchCity.toLowerCase())
    );
    setFilteredCities(filtered);
  }, [searchCity]);

  // Initialize selected location from cookies
  useEffect(() => {
    const savedLocation = Cookies.get('selectedLocation');
    if (savedLocation) {
      dispatch(setSelectedLocation(savedLocation)); // Dispatch Redux action
    }
  }, [dispatch]);

  // Handle manual city selection with fallback coordinates
  const handleCitySelect = async (city: string) => {
    setIsLoadingLocation(true);
    try {
      let lat: number, lng: number;

      // Use static coordinates
      if (cityCoordinates[city]) {
        ({ latitude: lat, longitude: lng } = cityCoordinates[city]);
      } else if (GOOGLE_MAPS_API_KEY) {
        // Fallback to Google Maps API
        const response = await axios.get(
          `https://maps.googleapis.com/maps/api/geocode/json`,
          {
            params: {
              address: `${city}, India`,
              key: GOOGLE_MAPS_API_KEY,
            },
          }
        );

        const { results, status } = response.data;
        if (status !== 'OK' || results.length === 0) {
          console.error('Geocoding API response:', response.data);
          showErrorToast(`Unable to fetch location for ${city}. Status: ${status}`);
          setIsLoadingLocation(false);
          return;
        }

        ({ lat, lng } = results[0].geometry.location);
      } else {
        showErrorToast('Location detection is unavailable due to missing API configuration');
        setIsLoadingLocation(false);
        return;
      }

      // Store city, latitude, and longitude in cookies
      Cookies.set('selectedLocation', city, { expires: 7, secure: true, sameSite: 'Lax' });
      Cookies.set('latitude', lat.toString(), { expires: 7, secure: true, sameSite: 'Lax' });
      Cookies.set('longitude', lng.toString(), { expires: 7, secure: true, sameSite: 'Lax' });

      dispatch(setSelectedLocation(city)); // Dispatch Redux action
      setIsCityModalOpen(false);
      showSuccessToast(`Location updated to ${city}`);

      // // Optional: Update backend with city, latitude, and longitude
      // try {
      //   await axios.post('/api/user/update-location', { location: city, latitude: lat, longitude: lng });
      // } catch (error) {
      //   console.error('Error updating location in backend:', error);
      // }
    } catch (error: any) {
      console.error('Error fetching geolocation for city:', error.response?.data || error.message);
      showErrorToast(`Failed to fetch location for ${city}. Please try again.`);
    } finally {
      setIsLoadingLocation(false);
    }
  };

  // Handle geolocation-based location with reverse geocoding
  const handleCurrentLocation = async () => {
    if (!GOOGLE_MAPS_API_KEY) {
      showErrorToast('Location detection is unavailable due to missing API configuration');
      setIsLoadingLocation(false);
      return;
    }

    if (!navigator.geolocation) {
      showErrorToast('Geolocation is not supported by this browser');
      setIsLoadingLocation(false);
      return;
    }

    setIsLoadingLocation(true);

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        try {
          const { latitude, longitude } = position.coords;

          // Reverse geocode to get address
          let address = 'Unknown Location';
          if (GOOGLE_MAPS_API_KEY) {
            const response = await axios.get(
              `https://maps.googleapis.com/maps/api/geocode/json`,
              {
                params: {
                  latlng: `${latitude},${longitude}`,
                  key: GOOGLE_MAPS_API_KEY,
                },
              }
            );

            const { results, status } = response.data;
            if (status === 'OK' && results.length > 0) {
              const addressComponents: AddressComponent[] = results[0].address_components;
              const locality = addressComponents.find((component) =>
                component.types.includes('locality')
              );
              const adminArea3 = addressComponents.find((component) =>
                component.types.includes('administrative_area_level_3')
              );
              if (locality) {
                address = locality.long_name; // e.g., "Kozhikode"
              } else if (adminArea3) {
                address = adminArea3.long_name; // e.g., "Kozhikode"
              } else {
                console.warn('No locality or administrative_area_level_3 found in response:', results[0]);
                showErrorToast('Unable to determine city name. Using default location.');
              }
            } else {
              console.error('Reverse geocoding API response:', response.data);
              showErrorToast('Unable to fetch address. Please try again.');
            }
          }

          // Store address, latitude, and longitude in cookies
          Cookies.set('selectedLocation', address, { expires: 7, secure: true, sameSite: 'Lax' });
          Cookies.set('latitude', latitude.toString(), { expires: 7, secure: true, sameSite: 'Lax' });
          Cookies.set('longitude', longitude.toString(), { expires: 7, secure: true, sameSite: 'Lax' });

          dispatch(setSelectedLocation(address)); // Dispatch Redux action
          setIsCityModalOpen(false);
          showSuccessToast(`Location updated to ${address}`);

          // Optional: Update backend with address, latitude, and longitude
          // try {
          //   await axios.post('/api/user/update-location', { location: address, latitude, longitude });
          // } catch (error) {
          //   console.error('Error updating location in backend:', error);
          // }
        } catch (error: any) {
          console.error('Error handling current location:', error.response?.data || error.message);
          showErrorToast('Failed to fetch your location. Please try again.');
        } finally {
          setIsLoadingLocation(false);
        }
      },
      (error) => {
        console.error('Geolocation error:', error);
        let errorMessage = 'Unable to get your current location';
        if (error.code === error.PERMISSION_DENIED) {
          errorMessage = 'Location permission denied. Please allow location access.';
        } else if (error.code === error.POSITION_UNAVAILABLE) {
          errorMessage = 'Location information is unavailable.';
        } else if (error.code === error.TIMEOUT) {
          errorMessage = 'The request to get location timed out.';
        }
        showErrorToast(errorMessage);
        setIsLoadingLocation(false);
      },
      { timeout: 10000, maximumAge: 60000 }
    );
  };

  return (
    <AnimatePresence>
      {isCityModalOpen && (
        <div className="fixed inset-0 bg-black/30 backdrop-blur-sm flex items-center justify-center z-50">
          <motion.div
            ref={cityModalRef}
            className="bg-white/95 backdrop-blur-xl rounded-2xl shadow-2xl w-full max-w-md mx-4 overflow-hidden"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            transition={{ duration: 0.2, ease: 'easeOut' }}
            role="dialog"
            aria-labelledby="city-modal-title"
          >
            {/* Header */}
            <div className="p-5 bg-gradient-to-r from-white via-yellow-50 to-orange-50 border-b border-yellow-100">
              <h3 id="city-modal-title" className="text-lg font-bold text-gray-800">
                Select Your City
              </h3>
            </div>

            {/* Body */}
            <div className="p-5">
              {/* Search Bar */}
              <div className="relative mb-4">
                <input
                  type="text"
                  placeholder="Search for city..."
                  onChange={(e) => debouncedSetSearchCity(e.target.value)}
                  aria-label="Search for a city"
                  className="w-full px-4 py-2.5 rounded-xl border-2 border-gray-200 bg-white/80 backdrop-blur-sm text-gray-800 placeholder-gray-500 font-medium text-sm focus:outline-none focus:border-yellow-400 focus:ring-2 focus:ring-yellow-400/25 transition-all duration-300 hover:shadow-md"
                />
                <Search className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500" size={18} />
              </div>

              {/* Current Location Button */}
              <button
                onClick={handleCurrentLocation}
                disabled={isLoadingLocation}
                className="w-full mb-4 bg-gradient-to-r from-yellow-400 to-orange-500 hover:from-yellow-500 hover:to-orange-600 text-white font-medium py-2.5 px-4 rounded-xl flex items-center justify-center transition-all duration-300 shadow-md hover:shadow-lg disabled:opacity-50"
                aria-label="Use current location"
              >
                {isLoadingLocation ? (
                  <span className="flex items-center">
                    <svg className="animate-spin h-5 w-5 mr-2 text-white" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z" />
                    </svg>
                    Getting your location...
                  </span>
                ) : (
                  <>
                    <MapPin size={18} className="mr-2" />
                    Use my current location
                  </>
                )}
              </button>

              {/* Popular Cities */}
              <div className="mt-4">
                <h4 className="text-sm font-semibold text-gray-700 mb-2">Popular Cities</h4>
                <div className="grid grid-cols-3 gap-2 mb-4">
                  {['Mumbai', 'Delhi', 'Bangalore', 'Chennai', 'Hyderabad', 'Kolkata'].map((city) => (
                    <button
                      key={city}
                      onClick={() => handleCitySelect(city)}
                      disabled={isLoadingLocation}
                      className={`py-2 px-3 text-sm font-medium rounded-lg border transition-all duration-300 ${
                        selectedLocation === city
                          ? 'bg-gradient-to-r from-yellow-100 to-orange-100 border-yellow-400 text-yellow-800'
                          : 'border-gray-200 bg-white/80 backdrop-blur-sm hover:bg-gray-100 hover:border-yellow-300'
                      } ${isLoadingLocation ? 'opacity-50 cursor-not-allowed' : ''}`}
                      aria-label={`Select ${city}`}
                    >
                      {city}
                    </button>
                  ))}
                </div>
              </div>

              {/* All Cities */}
              <div className="max-h-48 overflow-y-auto hide-scrollbar" style={{ scrollbarWidth: 'none' }}>
                <h4 className="text-sm font-semibold text-gray-700 mb-2">All Cities</h4>
                {filteredCities.length === 0 ? (
                  <p className="text-sm text-gray-500">No cities found</p>
                ) : (
                  <div className="grid grid-cols-2 gap-2">
                    {filteredCities.map((city) => (
                      <button
                        key={city}
                        onClick={() => handleCitySelect(city)}
                        disabled={isLoadingLocation}
                        className={`py-2 px-3 text-sm font-medium rounded-lg border flex items-center justify-between transition-all duration-300 ${
                          selectedLocation === city
                            ? 'bg-gradient-to-r from-yellow-100 to-orange-100 border-yellow-400 text-yellow-800'
                            : 'border-gray-200 bg-white/80 backdrop-blur-sm hover:bg-gray-100 hover:border-yellow-300'
                        } ${isLoadingLocation ? 'opacity-50 cursor-not-allowed' : ''}`}
                        aria-label={`Select ${city}`}
                      >
                        <span>{city}</span>
                        {selectedLocation === city && <Check size={16} className="text-yellow-600" />}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Footer */}
            <div className="p-4 bg-gradient-to-r from-white via-yellow-50 to-orange-50 border-t border-yellow-100 flex justify-end">
              <button
                onClick={() => setIsCityModalOpen(false)}
                className="text-gray-600 hover:text-gray-800 bg-white/80 backdrop-blur-sm px-4 py-2 rounded-xl transition-all duration-300 hover:bg-gray-100 hover:shadow-md"
                aria-label="Cancel city selection"
              >
                Cancel
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};

export default CitySelectionModal;