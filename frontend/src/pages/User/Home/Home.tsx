import React, { useState } from 'react';
import { User, Ticket, Wallet, Star, HelpCircle, Bell, Gift, X ,LogOut, Calendar, Tag , Film } from 'lucide-react';
import Navbar from '../../../components/User/Navbar';
import Carousel from '../../../components/User/Carousel';
import Footer from '../../../components/User/Footer';
import LoginModal from '../../../components/User/LoginModal';
import LogoutButton from '../../../components/Buttons/LogoutButton';
import { useSelector } from 'react-redux';
import { RootState } from '../../../store/store';
const HomePage: React.FC = () => {
  const user = useSelector((state: RootState) => state.auth.user);
  
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [showMenu, setShowMenu] = useState(false);

  const toggleLoginModal = () => setShowLoginModal(!showLoginModal);
  const toggleMenu = () => setShowMenu(!showMenu);

  
  // const handleLogout = () => {
  //   dispatch(clearAuth());
  //   localStorage.removeItem('accessToken');
  //   localStorage.removeItem('user');
  //   // refreshToken cookie will be cleared by backend or expire naturally
  //   toggleMenu();
  // };

  return (
    <div className="flex flex-col min-h-screen bg-gray-50">
      <Navbar onLoginClick={toggleLoginModal} onMenuToggle={toggleMenu} showMenu={showMenu} />
      {showMenu && (
        <div className="fixed inset-0 z-50 bg-black bg-opacity-50 md:bg-transparent md:inset-auto md:top-16 md:right-4 md:w-64 md:shadow-lg">
          <div className="bg-white h-full md:h-auto w-3/4 md:w-full ml-auto md:ml-0 p-4 md:rounded-b-lg flex flex-col">
            <div className="flex justify-between items-center mb-4 md:hidden">
              <h2 className="text-xl font-bold text-gray-800">Menu</h2>
              <X className="cursor-pointer text-gray-700" size={24} onClick={toggleMenu} />
            </div>
            <div className="flex flex-col space-y-4 text-gray-700">
              <div
                className="flex items-center justify-between p-2 hover:bg-gray-100 rounded-md cursor-pointer"
                onClick={() => {
                  toggleLoginModal();
                  toggleMenu();
                }}
              >
                <div className="flex items-center space-x-2">
                  <User size={20} />
                  <span>Account</span>
                </div>
                {user ? (
                  <LogoutButton/>
                ) : (  
                  <button className="bg-yellow-400 text-black px-2 py-1 rounded text-xs">Login</button>
                )}

              </div>
              <div className="flex items-center justify-between p-2 hover:bg-gray-100 rounded-md">
                <div className="flex items-center space-x-2">
                  <Ticket size={20} />
                  <span>Bookings</span>
                </div>
              </div>
              <div className="flex items-center justify-between p-2 hover:bg-gray-100 rounded-md">
                <div className="flex items-center space-x-2">
                  <Wallet size={20} />
                  <span>Wallet</span>
                </div>
                <span className="text-sm text-green-600">₹500</span>
              </div>
              <div className="flex items-center justify-between p-2 hover:bg-gray-100 rounded-md">
                <div className="flex items-center space-x-2">
                  <Star size={20} />
                  <span>Loyalty Points</span>
                </div>
                <span className="text-sm text-yellow-600">250</span>
              </div>
              <div className="flex items-center justify-between p-2 hover:bg-gray-100 rounded-md">
                <div className="flex items-center space-x-2">
                  <HelpCircle size={20} />
                  <span>Help & Feedback</span>
                </div>
              </div>
              <div className="flex items-center justify-between p-2 hover:bg-gray-100 rounded-md">
                <div className="flex items-center space-x-2">
                  <Bell size={20} />
                  <span>Notifications</span>
                </div>
                <span className="bg-red-500 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs">3</span>
              </div>
              <div className="flex items-center justify-between p-2 hover:bg-gray-100 rounded-md">
                <div className="flex items-center space-x-2">
                  <Gift size={20} />
                  <span>Rewards</span>
                </div>
              </div>
              {/* <LogoutButton/> */}
            </div>
          </div>
        </div>
      )}

      <LoginModal isOpen={showLoginModal} onClose={toggleLoginModal} />

      <Carousel />

      <div className="bg-gray-50 min-h-screen font-sans">
      {/* Movies Section */}
      <section className="py-12 px-4">
        <div className="max-w-7xl mx-auto">
          <div className="flex justify-between items-center mb-8">
            <h2 className="text-3xl font-bold text-gray-900">Movies in Theaters</h2>
            <button className="text-yellow-600 hover:text-yellow-700 font-medium flex items-center">
              <span>View all</span>
              <svg className="w-4 h-4 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </button>
          </div>
          
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="bg-white rounded-xl shadow-sm overflow-hidden hover:shadow-md transition-all duration-300 group">
                <div className="relative pb-[140%]">
                  <img
                    src="https://preview.redd.it/l2-empuraan-%E0%B4%8E%E0%B4%AE-%E0%B4%AA-%E0%B4%B0-%E0%B5%BB-reviews-and-ratings-27-march-2025-v0-cjcj9uvlu2re1.png?width=640&crop=smart&auto=webp&s=a4586565ee0e73becc6c8039cc0850a64bbf6518"
                    alt="L2: Empuraan"
                    className="absolute top-0 left-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                  <div className="absolute top-3 right-3 bg-yellow-400 text-xs font-bold px-2 py-1 rounded-md text-gray-800">
                    4.8 <Star className="w-3 h-3 inline ml-1" />
                  </div>
                </div>
                <div className="p-4">
                  <h3 className="font-bold text-gray-800 text-lg mb-1">L2: Empuraan</h3>
                  <p className="text-sm text-gray-600 mb-3">Action/Crime/Thriller</p>
                  <button className="w-full bg-yellow-400 hover:bg-yellow-500 text-gray-800 font-medium py-2 px-4 rounded-lg transition-colors flex items-center justify-center">
                    <Ticket className="w-4 h-4 mr-2" />
                    Book Tickets
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Events Section */}
      <section className="py-12 px-4 bg-gray-100">
        <div className="max-w-7xl mx-auto">
          <div className="flex justify-between items-center mb-8">
            <h2 className="text-3xl font-bold text-gray-900">Upcoming Events</h2>
            <button className="text-yellow-600 hover:text-yellow-700 font-medium flex items-center">
              <span>View all</span>
              <svg className="w-4 h-4 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </button>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[1, 2, 3].map((i) => (
              <div key={i} className="bg-white rounded-xl shadow-sm overflow-hidden hover:shadow-md transition-all duration-300 group">
                <div className="relative pb-[56%]">
                  <img
                    src="/api/placeholder/600/340"
                    alt="Event"
                    className="absolute top-0 left-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                  <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-t from-black/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                </div>
                <div className="p-5">
                  <div className="flex items-center mb-2 text-yellow-600">
                    <Calendar className="w-4 h-4 mr-2" />
                    <span className="text-sm font-medium">Apr 15-17, 2025</span>
                  </div>
                  <h3 className="font-bold text-gray-800 text-xl mb-2">Music Festival 2025</h3>
                  <p className="text-sm text-gray-600 mb-4">Kozhikode Beach | 3 Days of Live Music</p>
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-gray-900">₹1,499</span>
                    <button className="bg-yellow-400 hover:bg-yellow-500 text-gray-800 font-medium py-2 px-4 rounded-lg transition-colors">
                      Book Now
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Movie Pass Section */}
      <section className="py-12 px-4 bg-gray-800 text-white">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col md:flex-row items-center justify-between">
            <div className="md:w-1/2 mb-8 md:mb-0">
              <h2 className="text-3xl font-bold mb-4">Purchase Movie Pass</h2>
              <p className="text-gray-300 mb-6 text-lg">Get 5% off on every movie ticket booking with our exclusive Movie Pass. Enjoy unlimited benefits all year round.</p>
              <ul className="mb-8 space-y-3">
                {[
                  "Save 5% on all movie tickets",
                  "Priority booking for premieres",
                  "Special concession discounts",
                  "Monthly free popcorn"
                ].map((benefit, index) => (
                  <li key={index} className="flex items-start">
                    <svg className="w-5 h-5 text-yellow-400 mr-2 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    <span>{benefit}</span>
                  </li>
                ))}
              </ul>
              <div className="flex flex-wrap gap-4">
                <button className="bg-yellow-400 text-gray-800 hover:bg-yellow-500 font-medium py-3 px-6 rounded-lg transition-colors">
                  Get Movie Pass
                </button>
                <button className="bg-transparent border border-yellow-400 text-yellow-400 hover:bg-yellow-400/10 font-medium py-3 px-6 rounded-lg transition-colors">
                  Learn More
                </button>
              </div>
            </div>
            <div className="md:w-2/5">
              <div className="bg-gray-700 p-6 rounded-xl shadow-lg relative overflow-hidden">
                <div className="absolute top-0 right-0 w-32 h-32 bg-yellow-400/20 rounded-full -mr-16 -mt-16" />
                <div className="absolute bottom-0 left-0 w-24 h-24 bg-yellow-400/20 rounded-full -ml-12 -mb-12" />
                <div className="relative">
                  <div className="flex items-center mb-6">
                    <Film className="w-6 h-6 mr-2 text-yellow-400" />
                    <h3 className="text-xl font-bold">Theater Premium Pass</h3>
                  </div>
                  <div className="mb-6">
                    <div className="text-sm text-gray-400 mb-1">Annual membership</div>
                    <div className="flex items-baseline">
                      <span className="text-3xl font-bold">₹999</span>
                      <span className="text-gray-400 ml-2">/year</span>
                    </div>
                  </div>
                  <button className="w-full bg-yellow-400 hover:bg-yellow-500 text-gray-800 font-medium py-3 px-4 rounded-lg transition-colors flex items-center justify-center">
                    {/* <Discount className="w-4 h-4 mr-2" /> */}
                    Purchase Now
                  </button>
                </div>
              </div>
            </div>
          </div>  
        </div>
      </section>

      {/* Special Offers Section */}
      <section className="py-12 px-4">
        <div className="max-w-7xl mx-auto">
          <h2 className="text-3xl font-bold text-gray-900 mb-8">Special Offers</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="bg-gradient-to-r from-yellow-400 to-yellow-500 rounded-xl p-6 text-gray-800 flex items-center overflow-hidden relative shadow-md">
              <div className="relative z-10 w-full md:w-2/3">
                <div className="inline-block bg-white/30 px-3 py-1 rounded-full text-sm font-medium mb-4">New Users</div>
                <h3 className="text-2xl font-bold mb-2">15% OFF on your first booking</h3>
                <p className="mb-6 text-gray-700">Use code: WELCOME15</p>
                <button className="bg-white text-yellow-600 hover:bg-gray-100 px-5 py-2 rounded-lg transition-colors font-medium">
                  Book Now
                </button>
              </div>
              <div className="hidden md:block absolute right-0 -mr-8">
                <div className="w-48 h-48 rounded-full bg-yellow-500/30 flex items-center justify-center">
                  <div className="w-36 h-36 rounded-full bg-yellow-500/40 flex items-center justify-center">
                    <div className="w-24 h-24 rounded-full bg-white/20 flex items-center justify-center">
                      <Tag className="w-10 h-10" />
                    </div>
                  </div>
                </div>
              </div>
            </div>
            
            <div className="bg-gradient-to-r from-gray-700 to-gray-800 rounded-xl p-6 text-white flex items-center overflow-hidden relative shadow-md">
              <div className="relative z-10 w-full md:w-2/3">
                <div className="inline-block bg-yellow-400 px-3 py-1 rounded-full text-sm font-medium text-gray-800 mb-4">Limited Time</div>
                <h3 className="text-2xl font-bold mb-2">Weekend Special</h3>
                <p className="mb-6 text-gray-300">Buy 2 tickets, get 1 free!</p>
                <button className="bg-yellow-400 text-gray-800 hover:bg-yellow-500 px-5 py-2 rounded-lg transition-colors font-medium">
                  Learn More
                </button>
              </div>
              <div className="hidden md:block absolute right-0 -mr-8">
                <div className="w-48 h-48 rounded-full bg-yellow-400/10 flex items-center justify-center">
                  <div className="w-36 h-36 rounded-full bg-yellow-400/15 flex items-center justify-center">
                    <div className="w-24 h-24 rounded-full bg-yellow-400/20 flex items-center justify-center">
                      <Ticket className="w-10 h-10 text-yellow-400" />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>

      <Footer />
    </div>
  );
};

export default HomePage;