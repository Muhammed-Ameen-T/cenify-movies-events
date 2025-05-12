import React, { useState } from 'react';
import { Zap, Image, Trash2 } from 'lucide-react';
import { Seat } from '../../types/theater';
import { SEAT_TYPES } from '../../constants/seatTypes';
import Modal from './Modal';

interface AIModalProps {
  onClose: () => void;
  onGenerate: (seats: Seat[][]) => void;
}

const AIModal: React.FC<AIModalProps> = ({ onClose, onGenerate }) => {
  const [uploading, setUploading] = useState(false);
  const [uploadedImage, setUploadedImage] = useState<string | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);

  const handleImageUpload = () => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = 'image/*';
    input.onchange = (e) => {
      const target = e.target as HTMLInputElement;
      if (target.files && target.files[0]) {
        setUploading(true);

        const reader = new FileReader();
        reader.onload = (event) => {
          if (event.target?.result) {
            setUploadedImage(event.target.result as string);
            setUploading(false);
          }
        };
        reader.readAsDataURL(target.files[0]);
      }
    };
    input.click();
  };

  const handleGenerate = async () => {
    if (!uploadedImage) return;

    setIsGenerating(true);

    try {
      // Mock AI analysis: Generate a layout based on image dimensions
      const img = new Image();
      img.src = uploadedImage;
      await new Promise(resolve => {
        img.onload = resolve;
      });

      const { width, height } = img;
      const rows = Math.min(Math.floor(height / 50), 10); // Approximate rows based on height
      const cols = Math.min(Math.floor(width / 50), 12); // Approximate cols based on width

      const seats: Seat[][] = [];
      let seatId = 1000;

      for (let row = 0; row < rows; row++) {
        const rowSeats: Seat[] = [];
        const seatType = row < 2 ? 'VIP' : row < 5 ? 'PREMIUM' : 'REGULAR';
        for (let col = 0; col < cols; col++) {
          rowSeats.push({
            id: `seat-ai-${seatId++}`,
            row,
            col,
            type: seatType,
            price: SEAT_TYPES[seatType].price,
            label: `${String.fromCharCode(65 + row)}${col + 1}`,
            occupied: false,
          });
        }
        seats.push(rowSeats);
      }

      await new Promise(resolve => setTimeout(resolve, 1500)); // Simulate processing time

      onGenerate(seats);
      setIsGenerating(false);
    } catch (error) {
      console.error('Error generating layout:', error);
      setIsGenerating(false);
    }
  };

  return (
    <Modal title="AI Layout Generator" icon={<Zap size={20} />} onClose={onClose}>
      <p className="text-gray-300 mb-4">
        Upload an image of a theater layout and our AI will generate a similar seating arrangement.
      </p>

      {!uploadedImage ? (
        <div
          onClick={handleImageUpload}
          className="border-2 border-dashed border-gray-600 rounded-lg p-6 flex flex-col items-center justify-center cursor-pointer hover:border-blue-500 transition-colors"
        >
          {uploading ? (
            <div className="flex flex-col items-center">
              <div className="w-8 h-8 border-4 border-t-blue-500 border-r-transparent border-b-transparent border-l-transparent rounded-full animate-spin mb-2"></div>
              <p className="text-gray-400">Uploading...</p>
            </div>
          ) : (
            <>
              <Image size={40} className="text-gray-400 mb-2" />
              <p className="text-gray-400">Click to upload an image</p>
            </>
          )}
        </div>
      ) : (
        <div className="mb-4">
          <div className="relative">
            <img src={uploadedImage} alt="Uploaded theater layout" className="w-full h-48 object-cover rounded-lg" />
            <button
              onClick={() => setUploadedImage(null)}
              className="absolute top-2 right-2 bg-red-500 rounded-full p-1 hover:bg-red-600 transition-colors"
            >
              <Trash2 size={16} className="text-white" />
            </button>
          </div>
        </div>
      )}

      <div className="flex justify-end space-x-3 mt-6">
        <button
          onClick={onClose}
          className="px-4 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-500 transition-colors"
        >
          Cancel
        </button>
        <button
          onClick={handleGenerate}
          disabled={!uploadedImage || isGenerating}
          className={`px-4 py-2 ${
            uploadedImage && !isGenerating ? 'bg-blue-600 hover:bg-blue-500' : 'bg-gray-700 cursor-not-allowed'
          } text-white rounded-md transition-colors flex items-center`}
        >
          {isGenerating ? (
            <>
              <div className="w-4 h-4 border-2 border-t-white border-r-transparent border-b-transparent border-l-transparent rounded-full animate-spin mr-2"></div>
              Analyzing Image...
            </>
          ) : (
            <>Generate Layout</>
          )}
        </button>
      </div>
    </Modal>
  );
};

export default AIModal;