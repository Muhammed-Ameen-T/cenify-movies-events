import React, { useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Cropper from 'react-easy-crop';
import { X, CropIcon, CheckIcon } from 'lucide-react';
import toast from 'react-hot-toast';

interface ImageCropperProps {
  src: string;
  onImageCropped: (croppedImageBase64: string) => void;
  onCancel: () => void;
  aspectRatio: number;
  fixedSize: { width: number; height: number };
}

const ImageCropper: React.FC<ImageCropperProps> = ({ src, onImageCropped, onCancel, aspectRatio, fixedSize }) => {
  const [crop, setCrop] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [rotation, setRotation] = useState(0);
  const [croppedAreaPixels, setCroppedAreaPixels] = useState<any>(null);

  const onCropComplete = useCallback((croppedArea: any, croppedAreaPixels: any) => {
    setCroppedAreaPixels(croppedAreaPixels);
    console.log('Cropped area pixels:', croppedAreaPixels);
  }, []);

  const getCroppedImg = async (imageSrc: string, pixelCrop: any, rotation = 0): Promise<string> => {
    try {
      const image = new Image();
      image.src = imageSrc;
      image.crossOrigin = 'anonymous'; // Handle cross-origin images
      await new Promise((resolve, reject) => {
        image.onload = resolve;
        image.onerror = reject;
      });

      console.log('Loaded image dimensions:', image.naturalWidth, 'x', image.naturalHeight);

      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      if (!ctx) {
        throw new Error('No canvas context');
      }

      // Set canvas to the desired output size
      canvas.width = fixedSize.width;
      canvas.height = fixedSize.height;

      // Calculate scaling factors based on the original image and cropper's displayed image
      const scaleX = image.naturalWidth / image.width;
      const scaleY = image.naturalHeight / image.height;

      // Adjust crop coordinates for zoom
      const adjustedCrop = {
        x: pixelCrop.x * scaleX,
        y: pixelCrop.y * scaleY,
        width: pixelCrop.width * scaleX,
        height: pixelCrop.height * scaleY,
      };

      // Apply rotation
      ctx.translate(fixedSize.width / 2, fixedSize.height / 2);
      ctx.rotate((rotation * Math.PI) / 180);
      ctx.translate(-fixedSize.width / 2, -fixedSize.height / 2);

      // Ensure the image is drawn with high quality
      ctx.imageSmoothingEnabled = true;
      ctx.imageSmoothingQuality = 'high';

      // Draw the cropped image onto the canvas
      ctx.drawImage(
        image,
        adjustedCrop.x,
        adjustedCrop.y,
        adjustedCrop.width,
        adjustedCrop.height,
        0,
        0,
        fixedSize.width,
        fixedSize.height
      );

      const base64 = canvas.toDataURL('image/jpeg', 0.9);
      console.log('Generated base64 length:', base64.length);

      if (base64.length < 100) {
        throw new Error('Generated base64 string is too short, likely invalid');
      }

      return base64;
    } catch (error) {
      console.error('Error in getCroppedImg:', error);
      throw error;
    }
  };

  const handleSave = async () => {
    if (!croppedAreaPixels) {
      toast.error('No crop area selected. Please adjust the crop.');
      return;
    }

    try {
      const croppedImage = await getCroppedImg(src, croppedAreaPixels, rotation);
      onImageCropped(croppedImage);
    } catch (e) {
      console.error('Crop save error:', e);
      toast.error('Error cropping image. Please try again.');
    }
  };

  const modalVariants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1 },
    exit: { opacity: 0 },
  };

  const contentVariants = {
    hidden: { scale: 0.8, opacity: 0 },
    visible: { scale: 1, opacity: 1 },
    exit: { scale: 0.8, opacity: 0 },
  };

  return (
    <AnimatePresence>
      <motion.div
        className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4"
        variants={modalVariants}
        initial="hidden"
        animate="visible"
        exit="exit"
      >
        <motion.div
          className="bg-gray-800 rounded-xl overflow-hidden max-w-3xl w-full max-h-[90vh] flex flex-col"
          variants={contentVariants}
          initial="hidden"
          animate="visible"
          exit="exit"
        >
          <div className="p-4 flex justify-between items-center border-b border-gray-700">
            <h3 className="text-xl font-semibold text-white flex items-center">
              <CropIcon className="w-5 h-5 mr-2" /> Crop Movie Poster
            </h3>
            <button
              onClick={onCancel}
              className="text-gray-400 hover:text-white focus:outline-none"
              aria-label="Close cropper"
            >
              <X className="w-6 h-6" />
            </button>
          </div>

          <div className="relative flex-grow h-[50vh]">
            <Cropper
              image={src}
              crop={crop}
              zoom={zoom}
              aspect={aspectRatio}
              onCropChange={setCrop}
              onCropComplete={onCropComplete}
              onZoomChange={setZoom}
              rotation={rotation}
              objectFit="contain"
              restrictPosition={false}
            />
          </div>

          <div className="p-4 border-t border-gray-700 space-y-4">
            <div className="space-y-2">
              <div className="flex justify-between">
                <label className="text-sm text-gray-300">Zoom</label>
                <span className="text-xs text-gray-400">{zoom.toFixed(1)}x</span>
              </div>
              <input
                type="range"
                value={zoom}
                min={1}
                max={3}
                step={0.1}
                onChange={(e) => setZoom(Number(e.target.value))}
                className="w-full accent-blue-500 bg-gray-700 h-2 rounded-lg"
                aria-label="Zoom control"
              />
            </div>

            <div className="space-y-2">
              <div className="flex justify-between">
                <label className="text-sm text-gray-300">Rotation</label>
                <span className="text-xs text-gray-400">{rotation}°</span>
              </div>
              <input
                type="range"
                value={rotation}
                min={0}
                max={360}
                step={1}
                onChange={(e) => setRotation(Number(e.target.value))}
                className="w-full accent-blue-500 bg-gray-700 h-2 rounded-lg"
                aria-label="Rotation control"
              />
            </div>

            <div className="flex justify-end space-x-3 pt-2">
              <motion.button
                onClick={onCancel}
                className="px-4 py-2 rounded-lg bg-gray-700 text-white font-medium hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-opacity-50"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                aria-label="Cancel cropping"
              >
                Cancel
              </motion.button>
              <motion.button
                onClick={handleSave}
                className="px-4 py-2 rounded-lg bg-blue-600 text-white font-medium hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50 flex items-center"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                aria-label="Save cropped image"
              >
                <CheckIcon className="w-4 h-4 mr-1" /> Save
              </motion.button>
            </div>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};

export default ImageCropper;