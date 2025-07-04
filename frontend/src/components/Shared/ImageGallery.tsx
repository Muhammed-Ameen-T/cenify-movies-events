import React from 'react';
import { Award, X, Camera } from 'lucide-react';

interface ImageGalleryProps {
  images: string[];
  onRemoveImage: (index: number) => void;
}

const ImageGallery: React.FC<ImageGalleryProps> = ({ images, onRemoveImage }) => {
  return (
    <div className="space-y-4">
      {/* Certificate Section */}
      {images.length > 0 && (
        <div className="space-y-2">
          <h3 className="text-sm font-medium text-gray-300 flex items-center">
            <Award className="w-4 h-4 mr-2 text-yellow-500" />
            Theater License Certificate
          </h3>
          <div className="relative h-52 rounded-lg overflow-hidden ring-2 ring-yellow-500 bg-gradient-to-br from-yellow-500/20 to-orange-500/20">
            {/* Certificate Badge */}
            <div className="absolute top-2 left-2 z-10 bg-yellow-500 text-black px-2 py-1 rounded-full text-xs font-semibold flex items-center">
              <Award className="w-3 h-3 mr-1" />
              Certificate
            </div>
            
            <img 
              src={images[0]} 
              alt="Theater License Certificate" 
              className="w-full h-full object-cover"
            />
            
            {/* Remove Button */}
            <button
              type="button"
              onClick={() => onRemoveImage(0)}
              className="absolute top-2 right-2 bg-red-500 rounded-full p-1 text-white hover:bg-red-600 transition-colors z-10"
            >
              <X className="h-3 w-3" />
            </button>
          </div>
        </div>
      )}

      {/* Theater Images Section */}
      {images.length > 1 && (
        <div className="space-y-2">
          <h3 className="text-sm font-medium text-gray-300 flex items-center">
            <Camera className="w-4 h-4 mr-2 text-blue-500" />
            Theater Images ({images.length - 1}/4)
          </h3>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            {images.slice(1).map((img, index) => {
              const actualIndex = index + 1; // Adjust for certificate being at index 0
              return (
                <div 
                  key={actualIndex} 
                  className="relative h-24 rounded-lg overflow-hidden ring-1 ring-gray-600 hover:ring-blue-500 transition-all duration-200"
                >
                  {/* Image Number Badge */}
                  <div className="absolute top-1 left-1 z-10 bg-blue-500 text-white px-2 py-1 rounded-full text-xs font-semibold">
                    {index + 1}
                  </div>
                  
                  <img 
                    src={img} 
                    alt={`Theater Image ${index + 1}`} 
                    className="w-full h-full object-cover hover:scale-105 transition-transform duration-200"
                  />
                  
                  {/* Remove Button */}
                  <button
                    type="button"
                    onClick={() => onRemoveImage(actualIndex)}
                    className="absolute top-1 right-1 bg-red-500 rounded-full p-1 text-white hover:bg-red-600 transition-colors z-10"
                  >
                    <X className="h-3 w-3" />
                  </button>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Progress Indicator */}
      <div className="bg-gray-700 rounded-lg p-3">
        <div className="flex justify-between items-center mb-2">
          <span className="text-sm text-gray-300">Upload Progress</span>
          <span className="text-sm text-gray-400">{images.length}/5 images</span>
        </div>
        <div className="w-full bg-gray-600 rounded-full h-2">
          <div 
            className="bg-gradient-to-r from-blue-500 to-green-500 h-2 rounded-full transition-all duration-300"
            style={{ width: `${Math.min((images.length / 5) * 100, 100)}%` }}
          ></div>
        </div>
        <div className="mt-2 grid grid-cols-5 gap-1 text-xs text-gray-400">
          <div className={`text-center ${images.length >= 1 ? 'text-yellow-400' : ''}`}>
            Certificate
          </div>
          <div className={`text-center ${images.length >= 2 ? 'text-blue-400' : ''}`}>
            Theater 1
          </div>
          <div className={`text-center ${images.length >= 3 ? 'text-blue-400' : ''}`}>
            Theater 2
          </div>
          <div className={`text-center ${images.length >= 4 ? 'text-blue-400' : ''}`}>
            Theater 3
          </div>
          <div className={`text-center ${images.length >= 5 ? 'text-green-400' : ''}`}>
            Optional
          </div>
        </div>
      </div>
    </div>
  );
};

export default ImageGallery;