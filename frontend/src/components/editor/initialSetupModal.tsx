import React, { useState } from 'react';
import { Layout } from 'lucide-react';
import Modal from '../common/Modal';
import { SeatPrice } from '../../types/theater';
import { getDefaultSeatPrices } from '../../constants/seatTypes';

interface InitialSetupModalProps {
  onComplete: (layoutName: string, seatPrices: SeatPrice) => void;
}

const InitialSetupModal: React.FC<InitialSetupModalProps> = ({ onComplete }) => {
  const [layoutName, setLayoutName] = useState('Main Theater');
  const [seatPrices, setSeatPrices] = useState<SeatPrice>(getDefaultSeatPrices());
  
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onComplete(layoutName, seatPrices);
  };

  return (
    <Modal 
      title="Setup Your Theater Layout" 
      icon={<Layout size={20} />} 
      onClose={() => {}} 
      maxWidth="max-w-lg"
      preventClose={true}
    >
      <form onSubmit={handleSubmit}>
        <div className="mb-6">
          <p className="text-gray-300 mb-4">
            Let's set up your new theater layout. You can change these settings later.
          </p>
        </div>

        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-300 mb-1">
            Layout Name
          </label>
          <input
            type="text"
            value={layoutName}
            onChange={(e) => setLayoutName(e.target.value)}
            className="w-full bg-[#2B2B40] border border-gray-600 rounded-md px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="e.g., Main Hall, Screen 1, etc."
            required
          />
        </div>

        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-300 mb-3">
            Default Seat Prices (₹)
          </label>
          
          <div className="grid grid-cols-3 gap-4">
            <div>
              <label className="block text-xs text-gray-400 mb-1">
                Regular Seats
              </label>
              <div className="flex items-center bg-[#2B2B40] border border-gray-600 rounded-md overflow-hidden">
                <span className="px-2 text-gray-400">₹</span>
                <input
                  type="number"
                  value={seatPrices.regular}
                  onChange={(e) => setSeatPrices({
                    ...seatPrices,
                    regular: parseInt(e.target.value, 10) || 0
                  })}
                  min="0"
                  className="w-full bg-transparent border-0 px-2 py-2 text-white focus:outline-none"
                  required
                />
              </div>
            </div>
            
            <div>
              <label className="block text-xs text-gray-400 mb-1">
                Premium Seats
              </label>
              <div className="flex items-center bg-[#2B2B40] border border-gray-600 rounded-md overflow-hidden">
                <span className="px-2 text-gray-400">₹</span>
                <input
                  type="number"
                  value={seatPrices.premium}
                  onChange={(e) => setSeatPrices({
                    ...seatPrices,
                    premium: parseInt(e.target.value, 10) || 0
                  })}
                  min="0"
                  className="w-full bg-transparent border-0 px-2 py-2 text-white focus:outline-none"
                  required
                />
              </div>
            </div>
            
            <div>
              <label className="block text-xs text-gray-400 mb-1">
                VIP Seats
              </label>
              <div className="flex items-center bg-[#2B2B40] border border-gray-600 rounded-md overflow-hidden">
                <span className="px-2 text-gray-400">₹</span>
                <input
                  type="number"
                  value={seatPrices.vip}
                  onChange={(e) => setSeatPrices({
                    ...seatPrices,
                    vip: parseInt(e.target.value, 10) || 0
                  })}
                  min="0"
                  className="w-full bg-transparent border-0 px-2 py-2 text-white focus:outline-none"
                  required
                />
              </div>
            </div>
          </div>
        </div>

        <div className="flex justify-end">
          <button
            type="submit"
            className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-500 transition-colors"
          >
            Start Designing
          </button>
        </div>
      </form>
    </Modal>
  );
};

export default InitialSetupModal;