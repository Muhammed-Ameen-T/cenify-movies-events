import React from 'react';
import { Check } from 'lucide-react';

interface BenefitsListProps {
  benefits: string[];
}

const BenefitsList: React.FC<BenefitsListProps> = ({ benefits }) => {
  return (
    <ul className="space-y-4">
      {benefits.map((benefit, index) => (
        <li key={index} className="flex items-start animate-fadeIn" style={{ animationDelay: `${index * 100}ms` }}>
          <div className="mt-0.5 mr-3 w-6 h-6 bg-gradient-to-r from-yellow-400 to-orange-500 rounded-full flex items-center justify-center flex-shrink-0">
            <Check className="w-4 h-4 text-white" />
          </div>
          <div>
            <span className="text-gray-800 font-medium">{benefit}</span>
            <p className="text-gray-500 text-sm mt-1">
              {index === 0 && "Save money on every movie you watch with our exclusive member discount."}
              {index === 1 && "Get access to new releases before they're sold out to the general public."}
              {index === 2 && "Enjoy special pricing on snacks, drinks, and concession items every visit."}
              {index === 3 && "Receive a complimentary large popcorn once every month with your membership."}
            </p>
          </div>
        </li>
      ))}
    </ul>
  );
};

export default BenefitsList;