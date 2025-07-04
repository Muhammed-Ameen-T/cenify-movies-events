import React, { useState } from 'react';
import { Film, Check, ChevronDown, ChevronUp } from 'lucide-react';

const PricingCard: React.FC = () => {
  const [showFAQ, setShowFAQ] = useState(false);
  
  const toggleFAQ = () => {
    setShowFAQ(!showFAQ);
  };

  return (
    <div className="bg-white rounded-3xl overflow-hidden shadow-xl transform transition-all duration-300 hover:scale-105 hover:shadow-2xl border border-gray-100 hover:border-yellow-200 relative">
      {/* Card Header */}
      <div className="bg-gradient-to-r from-yellow-400 to-orange-500 p-6 relative overflow-hidden">
        {/* Abstract Shapes */}
        <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full -mr-32 -mt-32"></div>
        <div className="absolute bottom-0 left-0 w-48 h-48 bg-white/10 rounded-full -ml-24 -mb-24"></div>
        
        <div className="relative">
          <div className="flex items-center gap-2 mb-3">
            <Film className="w-5 h-5 text-white" />
            <h3 className="text-xl font-bold text-white">Theater Premium Pass</h3>
          </div>
          
          <div className="flex items-baseline mb-2">
            <span className="text-4xl font-black text-white">₹999</span>
            <span className="text-yellow-100 ml-2">/year</span>
          </div>
          
          <p className="text-yellow-100 text-sm">Unlock premium movie experiences</p>
        </div>
      </div>
      
      {/* Card Content */}
      <div className="p-6">
        {/* Features */}
        <div className="mb-6">
          <h4 className="font-semibold text-gray-900 mb-4">Includes:</h4>
          
          <ul className="space-y-3">
            {[
              "Unlimited 5% discount on all tickets",
              "Priority seating for blockbuster premieres",
              "Free upgrade to premium seats twice a year",
              "Birthday special: Free movie ticket",
              "Exclusive member-only events"
            ].map((feature, index) => (
              <li key={index} className="flex items-start">
                <div className="mt-0.5 mr-3 w-5 h-5 bg-gradient-to-r from-yellow-400 to-orange-500 rounded-full flex items-center justify-center flex-shrink-0">
                  <Check className="w-3 h-3 text-white" />
                </div>
                <span className="text-gray-700">{feature}</span>
              </li>
            ))}
          </ul>
        </div>
        
        {/* Purchase Button */}
        <button className="w-full bg-gradient-to-r from-yellow-400 to-orange-500 hover:from-yellow-500 hover:to-orange-600 text-black font-bold py-3 px-6 rounded-xl flex items-center justify-center gap-2 transition-all duration-300 transform hover:scale-105 hover:shadow-lg hover:shadow-yellow-400/25 mb-4">
          <span>Purchase Now</span>
        </button>
        
        {/* FAQ Toggle */}
        
        
        {/* FAQ Content */}
        
      </div>
      
      {/* Badge */}
      <div className="absolute top-4 right-4 bg-white text-xs font-bold px-3 py-1 rounded-full shadow-lg text-yellow-500 border border-yellow-200">
        BEST VALUE
      </div>
    </div>
  );
};

export default PricingCard;