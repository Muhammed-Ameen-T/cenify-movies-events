import React from 'react';
import { Film, Check, ArrowRight } from 'lucide-react';
import PricingCard from './PricingCardMoviePass';
import BenefitsList from './BenefitListMoviePass';

const MoviePassSection: React.FC = () => {
  const benefits = [
    "Save 5% on all movie tickets",
    "Priority booking for premieres",
    "Special concession discounts",
    "Monthly free popcorn"
  ];

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
              <span className="text-yellow-400 font-semibold text-sm uppercase tracking-wider">Membership</span>
            </div>
            <h2 className="text-5xl font-black text-gray-900 tracking-tight">
              Movie Pass
            </h2>
            <p className="text-gray-600 mt-2 text-lg">Elevate your movie experience with exclusive benefits</p>
          </div>
          
          <a
            href="/movie-pass"
            className="group hidden md:flex items-center bg-gradient-to-r from-yellow-400 to-orange-500 hover:from-yellow-500 hover:to-orange-600 text-black font-bold px-6 py-3 rounded-full transition-all duration-300 transform hover:scale-105 hover:shadow-lg hover:shadow-yellow-400/25"
          >
            <span>Learn More</span>
            <ArrowRight className="w-5 h-5 ml-2 transform group-hover:translate-x-1 transition-transform" />
          </a>
        </div>

        {/* Content */}
        <div className="flex flex-col md:flex-row items-center justify-between gap-12">
          {/* Left Side - Benefits */}
          <div className="w-full md:w-1/2">
            <div className="bg-white rounded-3xl p-8 shadow-xl border border-gray-100 hover:border-yellow-200 transition-all duration-300 hover:shadow-2xl">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 bg-gradient-to-r from-yellow-400 to-orange-500 rounded-full flex items-center justify-center">
                  <Film className="w-5 h-5 text-white" />
                </div>
                <h3 className="text-2xl font-bold text-gray-900">Premium Benefits</h3>
              </div>
              
              <BenefitsList benefits={benefits} />
              
              <div className="mt-8">
                <a 
                  href="#pricing"
                  className="block w-full bg-gradient-to-r from-yellow-400 to-orange-500 hover:from-yellow-500 hover:to-orange-600 text-black font-bold py-3 px-6 rounded-xl text-center transition-all duration-300 transform hover:scale-105 hover:shadow-lg hover:shadow-yellow-400/25"
                >
                  Get Movie Pass Now
                </a>
              </div>
            </div>
          </div>
          
          {/* Right Side - Pricing Card */}
          <div className="w-full md:w-1/2">
            <PricingCard />
          </div>
        </div>
      </div>
    </section>
  );
};

export default MoviePassSection;