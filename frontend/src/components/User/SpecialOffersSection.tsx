import React from 'react';
import { Tag, Ticket } from 'lucide-react';

const SpecialOffersSection: React.FC = () => {
  return (
    <section className="py-20 px-4 bg-gradient-to-br from-white to-gray-50 relative overflow-hidden">
      {/* Background Pattern */}
      <div className="absolute inset-0 opacity-5">
        <div className="absolute top-0 left-0 w-96 h-96 bg-gradient-to-r from-yellow-400 to-orange-500 rounded-full blur-3xl transform -translate-x-1/2 -translate-y-1/2"></div>
        <div className="absolute bottom-0 right-0 w-96 h-96 bg-gradient-to-r from-yellow-300 to-yellow-500 rounded-full blur-3xl transform translate-x-1/2 translate-y-1/2"></div>
      </div>

      <div className="max-w-7xl mx-auto relative z-10">
        {/* Header */}
        <div className="flex justify-between items-center mb-12">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <div className="w-1 h-8 bg-gradient-to-b from-yellow-400 to-orange-500 rounded-full"></div>
              <span className="text-yellow-400 font-semibold text-sm uppercase tracking-wider">Limited Time</span>
            </div>
            <h2 className="text-5xl font-black text-gray-900 tracking-tight">
              Special Offers
            </h2>
            <p className="text-gray-600 mt-2 text-lg">Exclusive deals and discounts for movie lovers</p>
          </div>
        </div>

        {/* Offers Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* New Users Offer */}
          <div className="bg-white rounded-3xl p-8 shadow-xl border border-gray-100 hover:border-yellow-200 transition-all duration-300 hover:shadow-2xl relative overflow-hidden group">
            <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-r from-yellow-400/10 to-orange-500/10 rounded-full -mr-32 -mt-32 transition-transform duration-500 group-hover:scale-110"></div>
            <div className="absolute bottom-0 left-0 w-48 h-48 bg-gradient-to-r from-yellow-400/10 to-orange-500/10 rounded-full -ml-24 -mb-24 transition-transform duration-500 group-hover:scale-110"></div>
            
            <div className="relative">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 bg-gradient-to-r from-yellow-400 to-orange-500 rounded-full flex items-center justify-center">
                  <Tag className="w-5 h-5 text-white" />
                </div>
                <h3 className="text-2xl font-bold text-gray-900">New User Special</h3>
              </div>

              <div className="space-y-4 mb-8">
                <div className="bg-yellow-50 rounded-2xl p-6">
                  <p className="text-4xl font-black text-yellow-600 mb-2">15% OFF</p>
                  <p className="text-gray-600">on your first booking</p>
                </div>
                <div className="bg-gray-50 rounded-2xl p-4">
                  <p className="text-sm text-gray-600 mb-1">Use code</p>
                  <p className="text-lg font-bold text-gray-900 font-mono">WELCOME15</p>
                </div>
              </div>

              <button className="w-full bg-gradient-to-r from-yellow-400 to-orange-500 hover:from-yellow-500 hover:to-orange-600 text-black font-bold py-3 px-6 rounded-xl text-center transition-all duration-300 transform hover:scale-105 hover:shadow-lg hover:shadow-yellow-400/25">
                Book Now
              </button>
            </div>
          </div>

          {/* Weekend Special */}
          <div className="bg-white rounded-3xl p-8 shadow-xl border border-gray-100 hover:border-yellow-200 transition-all duration-300 hover:shadow-2xl relative overflow-hidden group">
            <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-r from-yellow-400/10 to-orange-500/10 rounded-full -mr-32 -mt-32 transition-transform duration-500 group-hover:scale-110"></div>
            <div className="absolute bottom-0 left-0 w-48 h-48 bg-gradient-to-r from-yellow-400/10 to-orange-500/10 rounded-full -ml-24 -mb-24 transition-transform duration-500 group-hover:scale-110"></div>
            
            <div className="relative">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 bg-gradient-to-r from-yellow-400 to-orange-500 rounded-full flex items-center justify-center">
                  <Ticket className="w-5 h-5 text-white" />
                </div>
                <h3 className="text-2xl font-bold text-gray-900">Weekend Special</h3>
              </div>

              <div className="space-y-4 mb-8">
                <div className="bg-yellow-50 rounded-2xl p-6">
                  <p className="text-4xl font-black text-yellow-600 mb-2">Buy 2 Get 1</p>
                  <p className="text-gray-600">Free movie ticket</p>
                </div>
                <div className="bg-gray-50 rounded-2xl p-4 space-y-2">
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-yellow-400 rounded-full"></div>
                    <p className="text-gray-600">Valid on weekends</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-yellow-400 rounded-full"></div>
                    <p className="text-gray-600">All movies included</p>
                  </div>
                </div>
              </div>

              <button className="w-full bg-gradient-to-r from-yellow-400 to-orange-500 hover:from-yellow-500 hover:to-orange-600 text-black font-bold py-3 px-6 rounded-xl text-center transition-all duration-300 transform hover:scale-105 hover:shadow-lg hover:shadow-yellow-400/25">
                Learn More
              </button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default SpecialOffersSection;