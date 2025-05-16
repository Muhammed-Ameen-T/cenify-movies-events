// src/components/UserProfile/ImageCropperModal.tsx
import React, { useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Cropper from 'react-easy-crop';
import { X, ZoomIn, ZoomOut } from 'lucide-react';
import { getCroppedImg } from '../../utils/cropImage'; // Verify this path

interface ImageCropperModalProps {
  isOpen: boolean;
  onClose: () => void;
  imageSrc: string | null;
  onSave: (croppedFile: File) => void;
}

const ImageCropperModal: React.FC<ImageCropperModalProps> = ({ isOpen, onClose, imageSrc, onSave }) => {
  const [crop, setCrop] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [croppedAreaPixels, setCroppedAreaPixels] = useState(null);

  const onCropComplete = useCallback((croppedArea: any, croppedAreaPixels: any) => {
    setCroppedAreaPixels(croppedAreaPixels);
  }, []);

  const handleSave = async () => {
    if (imageSrc && croppedAreaPixels) {
      try {
        const croppedImage = await getCroppedImg(imageSrc, croppedAreaPixels);
        onSave(croppedImage);
        onClose();
      } catch (error) {
        console.error('Error cropping image:', error);
      }
    }
  };

  if (!isOpen || !imageSrc) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4"
      >
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.9, opacity: 0 }}
          className="bg-white rounded-xl p-6 shadow-xl w-full max-w-lg"
        >
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-bold text-gray-800">Crop Profile Image</h2>
            <button onClick={onClose} className="text-gray-400 hover:text-gray-500">
              <X className="w-6 h-6" />
            </button>
          </div>
          <div className="relative h-64 bg-gray-100 rounded-lg overflow-hidden">
            <Cropper
              image={imageSrc}
              crop={crop}
              zoom={zoom}
              aspect={1}
              cropShape="round"
              showGrid={false}
              onCropChange={setCrop}
              onZoomChange={setZoom}
              onCropComplete={onCropComplete}
            />
          </div>
          <div className="mt-4 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <button
                onClick={() => setZoom(zoom - 0.1)}
                disabled={zoom <= 1}
                className="p-2 bg-gray-200 rounded-full disabled:opacity-50"
              >
                <ZoomOut className="w-5 h-5" />
              </button>
              <button
                onClick={() => setZoom(zoom + 0.1)}
                disabled={zoom >= 3}
                className="p-2 bg-gray-200 rounded-full disabled:opacity-50"
              >
                <ZoomIn className="w-5 h-5" />
              </button>
            </div>
            <div className="flex gap-2">
              <button
                onClick={onClose}
                className="py-2 px-4 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
              >
                Cancel
              </button>
              <motion.button
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.97 }}
                onClick={handleSave}
                className="py-2 px-4 bg-[#FFCC00] hover:bg-[#FFBB00] text-gray-900 rounded-lg"
              >
                Save
              </motion.button>
            </div>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};

export default ImageCropperModal;