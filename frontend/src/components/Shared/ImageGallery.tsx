import React from 'react';

interface ImageGalleryProps {
  images: string[];
  onRemoveImage: (index: number) => void;
}

const ImageGallery: React.FC<ImageGalleryProps> = ({ images, onRemoveImage }) => {
  return (
    <div className="grid grid-cols-3 gap-3">
      {images.map((img, index) => (
        <div key={index} className="relative h-24 rounded-lg overflow-hidden">
          <img src={img} alt={`Gallery ${index + 1}`} className="w-full h-full object-cover" />
          <button
            type="button"
            onClick={() => onRemoveImage(index)}
            className="absolute top-1 right-1 bg-red-500 rounded-full p-1 text-white hover:bg-red-600 transition-colors"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
      ))}
    </div>
  );
};

export default ImageGallery;