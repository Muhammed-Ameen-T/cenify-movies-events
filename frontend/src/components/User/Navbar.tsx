import React, { useState, useRef, useEffect } from 'react';
import {
  Menu,
  Search,
  ChevronDown,
  User,
  Ticket,
  Wallet,
  Star,
  HelpCircle,
  Bell,
  Gift,
  LogOut,     
  MapPin,
  Check,
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useSelector, useDispatch } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import logo from '../../assets/cenify-logo.png';
import { RootState } from '../../store/store';
import axios from 'axios';
import { API_BASE_URL } from '../../constants/apiEndPoint';
import { clearAuth } from '../../store/slices/authSlice';
import { showSuccessToast, showErrorToast } from '../../utils/toast';

// Google Maps API Key
const GOOGLE_MAPS_API_KEY = 'AIzaSyBGqK-iLJWbT9IIOzqQqEeVQs036gFO-Fw';

// Define notification interface
interface Notification {
  id: number;
  message: string;
  date: string;
  read: boolean;
}

// Define Indian cities for location selector
const indianCities = [
  "Mumbai", "Delhi", "Bangalore", "Hyderabad", "Chennai",
  "Kolkata", "Ahmedabad", "Pune", "Jaipur", "Lucknow",
  "Kanpur", "Nagpur", "Indore", "Thane", "Bhopal",
  "Visakhapatnam", "Patna", "Vadodara", "Ghaziabad",
  "Surat", "Ludhiana", "Agra", "Nashik", "Ranchi",
  "Faridabad", "Coimbatore", "Rajkot", "Meerut", "Srinagar",
  "Aurangabad", "Dhanbad", "Amritsar", "Allahabad", "Howrah",
  "Gwalior", "Jabalpur", "Madurai", "Vijayawada", "Jodhpur",
  "Salem", "Raipur", "Kochi", "Kozhikode", "Thiruvananthapuram",
  "Calicut", "Guwahati", "Bhubaneswar", "Noida", "Chandigarh",
  "Mysore", "Dehradun", "Shimla", "Vellore"
];

interface NavbarProps {
  onLoginClick: () => void;
  onMenuToggle: () => void;
  showMenu: boolean;
}

const Navbar: React.FC<NavbarProps> = ({ onLoginClick, onMenuToggle, showMenu }) => {
  const newUser = useSelector((state: RootState) => state.auth.user);
  const user = newUser?.role === 'user' ? newUser : null;
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [isProfileMenuOpen, setIsProfileMenuOpen] = useState(false);
  const [notificationCount, setNotificationCount] = useState(3); // Hardcoded for demo
  const [isNotificationOpen, setIsNotificationOpen] = useState(false);
  const [isCityModalOpen, setIsCityModalOpen] = useState(false);
  const [selectedCity, setSelectedCity] = useState("Kozhikode");
  const [searchCity, setSearchCity] = useState("");
  const [filteredCities, setFilteredCities] = useState<string[]>(indianCities);
  const [isLoadingLocation, setIsLoadingLocation] = useState(false);

  const menuRef = useRef<HTMLDivElement>(null);
  const notificationRef = useRef<HTMLDivElement>(null);
  const cityModalRef = useRef<HTMLDivElement>(null);

  // Mock notifications data
  const [notifications, setNotifications] = useState<Notification[]>([
    {
      id: 1,
      message: "Your booking for 'Avengers: Endgame' has been confirmed!",
      date: "15 minutes ago",
      read: false,
    },
    {
      id: 2,
      message: "New movie 'Dune: Part Two' is now available for booking.",
      date: "2 hours ago",
      read: false,
    },
    {
      id: 3,
      message: "Special discount: Get 10% off on your next booking!",
      date: "Yesterday",
      read: false,
    },
  ]);

  // Close menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsProfileMenuOpen(false);
      }
      if (notificationRef.current && !notificationRef.current.contains(event.target as Node)) {
        setIsNotificationOpen(false);
      }
      if (cityModalRef.current && !cityModalRef.current.contains(event.target as Node)) {
        setIsCityModalOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Filter cities based on search input
  useEffect(() => {
    const filtered = indianCities.filter((city) =>
      city.toLowerCase().includes(searchCity.toLowerCase())
    );
    setFilteredCities(filtered);
  }, [searchCity]);

  // Handle logout
  const handleLogout = () => {
    axios.post(`${API_BASE_URL}/auth/logout`);
    localStorage.removeItem('accessToken');
    localStorage.removeItem('user');
    dispatch(clearAuth());
    setIsProfileMenuOpen(false);
    showSuccessToast('User Logout successfully!');
  };

  // Handle mark all notifications as read
  const handleMarkAllAsRead = () => {
    const updatedNotifications = notifications.map((notification) => ({
      ...notification,
      read: true,
    }));
    setNotifications(updatedNotifications);
    setNotificationCount(0);
  };

  // Handle city selection
  const handleCitySelect = (city: string) => {
    setSelectedCity(city);
    setIsCityModalOpen(false);
    showSuccessToast(`Location updated to ${city}`);
  };

  // Handle current location with Google Maps Geocoding API
  const handleCurrentLocation = async () => {
    setIsLoadingLocation(true);

    if (!navigator.geolocation) {
      showErrorToast("Geolocation is not supported by this browser");
      setIsLoadingLocation(false);
      return;
    }

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        try {
          const { latitude, longitude } = position.coords;

          // Call Google Maps Geocoding API
          const response = await axios.get(
            `https://maps.googleapis.com/maps/api/geocode/json`,
            {
              params: {
                latlng: `${latitude},${longitude}`,
                key: GOOGLE_MAPS_API_KEY,
                result_type: 'locality', // Restrict results to city-level
              },
            }
          );

          const results = response.data.results;
          if (results.length === 0) {
            showErrorToast("Unable to determine your city");
            setIsLoadingLocation(false);
            return;
          }

          // Extract city name from the first result
          let cityName = "";
          for (const result of results) {
            const localityComponent = result.address_components.find((component: any) =>
              component.types.includes("locality")
            );
            if (localityComponent) {
              cityName = localityComponent.long_name;
              break;
            }
          }

          if (!cityName) {
            showErrorToast("Unable to determine your city");
            setIsLoadingLocation(false);
            return;
          }

          // Normalize city name and match with indianCities
          const normalizedCity = cityName.charAt(0).toUpperCase() + cityName.slice(1).toLowerCase();
          const matchedCity = indianCities.find(
            (city) => city.toLowerCase() === normalizedCity.toLowerCase()
          );

          if (matchedCity) {
            setSelectedCity(matchedCity);
            setIsCityModalOpen(false);
            showSuccessToast(`Location updated to ${matchedCity}`);
          } else {
            showErrorToast(`${cityName} is not in our supported cities list`);
          }
        } catch (error) {
          console.error("Error fetching city from Google Maps API:", error);
          showErrorToast("Failed to fetch location. Please try again.");
        } finally {
          setIsLoadingLocation(false);
        }
      },
      (error) => {
        console.error("Geolocation error:", error);
        let errorMessage = "Unable to get your current location";
        if (error.code === error.PERMISSION_DENIED) {
          errorMessage = "Location permission denied. Please allow location access.";
        } else if (error.code === error.POSITION_UNAVAILABLE) {
          errorMessage = "Location information is unavailable.";
        } else if (error.code === error.TIMEOUT) {
          errorMessage = "The request to get location timed out.";
        }
        showErrorToast(errorMessage);
        setIsLoadingLocation(false);
      },
      { timeout: 10000, maximumAge: 60000 }
    );
  };

  // Menu items with icons
  const menuItems = [
    { label: 'Account', action: () => navigate('/account'), icon: <User size={16} /> },
    { label: 'Bookings', action: () => navigate('/bookings'), icon: <Ticket size={16} /> },
    { label: 'Wallet', action: () => navigate('/wallet'), icon: <Wallet size={16} /> },
    {
      label: 'Loyalty Points',
      action: () => navigate('/loyalty'),
      icon: <Star size={16} />,
    },
    {
      label: 'Help & Feedback',
      action: () => navigate('/help'),
      icon: <HelpCircle size={16} />,
    },
    {
      label: 'Notification',
      action: () => navigate('/notifications'),
      icon: <Bell size={16} />,
    },
    { label: 'Reward', action: () => navigate('/rewards'), icon: <Gift size={16} /> },
  ];

  if (user) {
    menuItems.push({
      label: 'Logout',
      action: handleLogout,
      icon: <LogOut size={16} />,
    });
  }

  return (
    <nav className="fixed top-0 left-0 w-full bg-white shadow-lg z-50 h-16 flex items-center justify-between px-4 md:px-6">
      <div className="flex items-center">
        <img src={logo} alt="Cenify" className="h-10 w-auto object-contain" />
      </div>

      <div className="hidden md:flex flex-1 max-w-lg mx-4">
        <div className="relative w-full">
          <input
            type="text"
            placeholder="Search for Movies, Events..."
            className="w-full px-4 py-2 rounded-full border border-gray-300 focus:outline-none focus:ring-2 focus:ring-yellow-400 text-sm"
          />
          <Search className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500" size={18} />
        </div>
      </div>

      <div className="flex items-center space-x-4">
        {/* Location Selector */}
        <div
          className="hidden md:flex items-center cursor-pointer"
          onClick={() => setIsCityModalOpen(true)}
        >
          <MapPin className="text-gray-700 mr-1" size={16} />
          <span className="text-gray-700 text-sm">{selectedCity}</span>
          <ChevronDown className="text-gray-700 ml-1" size={16} />
        </div>

        {/* Notification Bell */}
        <div className="relative" ref={notificationRef}>
          <button
            className="relative p-1 rounded-full hover:bg-gray-100 transition"
            onClick={() => setIsNotificationOpen(!isNotificationOpen)}
          >
            <Bell className="text-gray-700" size={20} />
            {notificationCount > 0 && (
              <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                {notificationCount}
              </span>
            )}
          </button>

          {/* Notification Dropdown */}
          <AnimatePresence>
            {isNotificationOpen && (
              <motion.div
                className="absolute top-10 right-0 w-80 max-h-96 bg-white rounded-lg shadow-2xl border border-gray-200 overflow-hidden z-50"
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.2 }}
              >
                <div className="flex justify-between items-center px-4 py-2 border-b border-gray-200">
                  <h3 className="font-semibold text-gray-800">Notifications</h3>
                  <button
                    onClick={handleMarkAllAsRead}
                    className="text-xs text-yellow-600 hover:text-yellow-700"
                  >
                    Mark all as read
                  </button>
                </div>

                <div className="overflow-y-auto max-h-72 hide-scrollbar" style={{ scrollbarWidth: 'none' }}>
                  {notifications.length === 0 ? (
                    <div className="py-6 text-center text-gray-500">
                      No notifications
                    </div>
                  ) : (
                    notifications.map((notification) => (
                      <div
                        key={notification.id}
                        className={`px-4 py-3 border-b border-gray-100 cursor-pointer hover:bg-gray-50 transition ${notification.read ? 'bg-white' : 'bg-yellow-50'}`}
                      >
                        <div className="flex justify-between items-start">
                          <p className="text-sm text-gray-800">{notification.message}</p>
                          {!notification.read && (
                            <span className="h-2 w-2 rounded-full bg-yellow-500 mt-1 ml-2 flex-shrink-0"></span>
                          )}
                        </div>
                        <p className="text-xs text-gray-500 mt-1">{notification.date}</p>
                      </div>
                    ))
                  )}
                </div>

                <div className="p-2 border-t border-gray-200 bg-gray-50">
                  <button
                    onClick={() => {
                      navigate('/notifications');
                      setIsNotificationOpen(false);
                    }}
                    className="w-full py-2 text-sm text-center text-yellow-600 hover:text-yellow-700 font-medium"
                  >
                    View All Notifications
                  </button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {user ? (
          <span className="hidden md:block font-semibold text-black px-4 py-1 rounded-full text-sm">
            {user.name}
          </span>
        ) : (
          <button
            onClick={onLoginClick}
            className="hidden md:block bg-yellow-400 font-semibold text-black px-4 py-1 rounded-full hover:bg-yellow-500 transition text-sm"
          >
            Login
          </button>
        )}

        <div className="relative flex items-center space-x-1" ref={menuRef}>
          <div className="flex items-center space-x-1">
            <img
              src={
                user?.profileImage
                  ? user.profileImage
                  : 'data:image/png;base64,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'
              }
              alt="Profile"
              className="w-10 h-10 rounded-full object-cover border-2 border-yellow-400 cursor-pointer"
            />
            <ChevronDown
              className="text-gray-700 cursor-pointer"
              size={20}
              onClick={() => setIsProfileMenuOpen(!isProfileMenuOpen)}
            />
            <Menu className="text-gray-700 md:hidden" size={24} onClick={onMenuToggle} />
          </div>

          {/* Dropdown Menu */}
          <AnimatePresence>
            {isProfileMenuOpen && (
              <motion.div
                className="absolute top-16 right-0 w-64 bg-white rounded-lg shadow-2xl border border-gray-200 py-2 z-50"
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.2 }}
              >
                {menuItems.map((item, index) => (
                  <button
                    key={index}
                    onClick={() => {
                      item.action();
                      setIsProfileMenuOpen(false);
                    }}
                    className={`w-full text-left px-4 py-2 text-sm flex items-center space-x-2 transition-colors ${
                      item.label === 'Logout'
                        ? 'text-gray-700 hover:bg-red-100 hover:text-red-600'
                        : 'text-gray-700 hover:bg-yellow-100 hover:text-yellow-600'
                    }`}
                  >
                    {item.icon}
                    <span>{item.label}</span>
                  </button>
                ))}
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* City Selection Modal */}
      <AnimatePresence>
        {isCityModalOpen && (
          <div className="fixed inset-0 bg-black-80 bg-opacity-10 backdrop-blur-md flex items-center justify-center z-50">
            <motion.div
              ref={cityModalRef}
              className="bg-white rounded-lg shadow-2xl w-full max-w-lg mx-4"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              transition={{ duration: 0.2 }}
            >
              <div className="p-5 border-b border-gray-200">
                <h3 className="text-lg font-semibold text-gray-800">Select Your Location</h3>
              </div>

              <div className="p-5">
                <div className="relative mb-4">
                  <input
                    type="text"
                    placeholder="Search for city..."
                    value={searchCity}
                    onChange={(e) => setSearchCity(e.target.value)}
                    className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-yellow-400"
                  />
                  <Search className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500" size={18} />
                </div>

                <button
                  onClick={handleCurrentLocation}
                  disabled={isLoadingLocation}
                  className="w-full mb-4 bg-yellow-400 hover:bg-yellow-500 text-black font-medium py-3 px-4 rounded-lg flex items-center justify-center transition"
                >
                  {isLoadingLocation ? (
                    <span>Getting your location...</span>
                  ) : (
                    <>
                      <MapPin size={18} className="mr-2" />
                      <span>Use my current location</span>
                    </>
                  )}
                </button>

                <div className="mt-4">
                  <h4 className="text-sm font-medium text-gray-500 mb-2">Popular Cities</h4>
                  <div className="grid grid-cols-3 gap-2 mb-4">
                    {["Mumbai", "Delhi", "Bangalore", "Chennai", "Hyderabad", "Kolkata"].map((city) => (
                      <button
                        key={city}
                        onClick={() => handleCitySelect(city)}
                        className={`py-2 px-3 text-sm rounded-lg border transition ${
                          selectedCity === city
                            ? 'bg-yellow-100 border-yellow-400 text-yellow-700'
                            : 'border-gray-300 hover:bg-gray-100'
                        }`}
                      >
                        {city}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="max-h-60 overflow-y-auto hide-scrollbar" style={{ scrollbarWidth: 'none' }}>
                  <h4 className="text-sm font-medium text-gray-500 mb-2">All Cities</h4>
                  <div className="grid grid-cols-2 gap-2">
                    {filteredCities.map((city) => (
                      <button
                        key={city}
                        onClick={() => handleCitySelect(city)}
                        className={`py-2 px-3 text-sm rounded-lg border flex items-center justify-between transition ${
                          selectedCity === city
                            ? 'bg-yellow-100 border-yellow-400 text-yellow-700'
                            : 'border-gray-300 hover:bg-gray-100'
                        }`}
                      >
                        <span>{city}</span>
                        {selectedCity === city && <Check size={16} className="text-yellow-600" />}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              <div className="p-4 border-t border-gray-200 flex justify-end">
                <button
                  onClick={() => setIsCityModalOpen(false)}
                  className="text-gray-600 hover:text-gray-800 px-4 py-2 rounded-lg transition"
                >
                  Cancel
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </nav>
  );
};

export default Navbar;