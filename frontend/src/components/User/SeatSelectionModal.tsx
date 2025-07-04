import React from 'react';
import { X } from 'lucide-react';

interface ConfirmationModalProps {
  isOpen: boolean;
  onConfirm: () => void;
  onCancel: () => void;
}

const ConfirmationModal: React.FC<ConfirmationModalProps> = ({ isOpen, onConfirm, onCancel }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl max-w-lg w-full max-h-[80vh] flex flex-col shadow-2xl animate-in zoom-in-50 duration-300">
        {/* Header */}
        <div className="bg-gradient-to-r from-orange-500 to-red-500 text-white p-5 rounded-t-2xl flex justify-between items-center">
          <h2 className="text-lg font-bold">Confirm Your Booking</h2>
          <button
            onClick={onCancel}
            className="p-1 hover:bg-white/20 rounded-full transition-colors"
            aria-label="Close modal"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto flex-1">
          <p className="text-sm font-semibold text-gray-700 mb-4">
            Note: Please review the following guidelines before proceeding with your booking.
          </p>
          <div className="text-sm text-gray-600 space-y-2">
            {/* <p>
              <strong>COVID Guidelines:</strong> Wearing a face mask and following other COVID guidelines are mandatory (as per the directions from your local authorities).
            </p> */}
            <ol className="list-decimal pl-5 space-y-1">
              <li>Outside Food and Beverage is not allowed inside the cinema premises.</li>
              <li>Ticket required for child 3 years and above.</li>
              <li>
                Ticket for "A" rated movie should not be purchased for people under 18 years of age. There won't be a refund for tickets booked in such cases.
              </li>
              <li>Ticket once purchased cannot be exchanged or adjusted/transferred for any other show.</li>
              <li>
                Handbags, Laptops, Tabs, cameras, and all other electronic items are not allowed inside cinema premises.
              </li>
              <li>
                Smoking is strictly not permitted inside the cinema premises. Cigarettes, lighters, matchsticks, Gutkha, Pan masala, etc., will not be allowed.
              </li>
              <li>People under the influence of Alcohol and Drugs will not be allowed inside the cinema premises.</li>
              <li>
                Items like laptops, cameras, knives, lighters, matchboxes, cigarettes, firearms, and all types of inflammable objects are strictly prohibited.
              </li>
              <li>
                Items like carry-bags, eatables, helmets, and handbags are not allowed inside the theatres and are strictly prohibited.
              </li>
              <li>For 3D movies, ticket price includes charges towards usage of 3D glasses.</li>
              <li>In case the ticket is lost or misplaced, a duplicate ticket will not be issued.</li>
              <li>Cinema Reserves the Right of Admission.</li>
            </ol>
          </div>
        </div>

        {/* Footer */}
        <div className="bg-gray-50 p-5 rounded-b-2xl flex justify-end gap-3 border-t border-gray-200">
          <button
            onClick={onCancel}
            className="px-5 py-2 bg-gray-200 text-gray-700 rounded-lg font-semibold hover:bg-gray-300 transition-all duration-200"
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            className="px-5 py-2 bg-gradient-to-r from-orange-500 to-red-500 text-white rounded-lg font-semibold hover:from-orange-600 hover:to-red-600 transition-all duration-200 shadow-md hover:shadow-lg"
          >
            OK
          </button>
        </div>
      </div>
    </div>
  );
};

export default ConfirmationModal;