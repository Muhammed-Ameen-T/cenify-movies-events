import React, { useState, useEffect } from 'react';

const slides = [
  { img: 'data:image/png;base64,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', title: 'INCEPTION', subtitle: 'THE DREAM IS REAL', desc: 'FROM THE DIRECTOR OF THE DARK KNIGHT' },
  { img: 'data:image/png;base64,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', title: 'THE MATRIX', subtitle: 'WELCOME TO THE REAL WORLD', desc: 'A SCI-FI CLASSIC' },
  { img: 'data:image/png;base64,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', title: 'AVATAR', subtitle: 'ENTER THE WORLD OF PANDORA', desc: 'JAMES CAMERON’S EPIC' },
];

const Carousel: React.FC = () => {
  const [currentSlide, setCurrentSlide] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentSlide((prev) => (prev === slides.length - 1 ? 0 : prev + 1));
    }, 5000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="relative w-full h-72 md:h-[500px] mt-16 overflow-hidden">
      {slides.map((slide, index) => (
        <div
          key={index}
          className={`absolute inset-0 transition-opacity duration-1000 ${
            index === currentSlide ? 'opacity-100' : 'opacity-0'
          }`}
        >
          <img src={slide.img} alt={slide.title} className="w-full h-full object-cover" />
          <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent flex items-end p-6">
            <div className="w-full max-w-7xl mx-auto text-white text-left">
              <h2 className="text-3xl md:text-5xl font-extrabold tracking-tight">{slide.title}</h2>
              <p className="text-lg md:text-xl font-medium mt-2">{slide.subtitle}</p>
              <p className="text-sm md:text-base mt-1 opacity-80">{slide.desc}</p>
              <button className="mt-4 bg-yellow-500 font-semibold text-black px-6 py-2 rounded-full hover:bg-yellow-600 transition">
                Book Now
              </button>
            </div>
          </div>
        </div>
      ))}
      <div className="absolute bottom-4 left-0 right-0 flex justify-center space-x-2">
        {slides.map((_, index) => (
          <button
            key={index}
            onClick={() => setCurrentSlide(index)}
            className={`w-3 h-3 rounded-full transition-all ${
              index === currentSlide ? 'bg-yellow-400 scale-125' : 'bg-gray-300'
            }`}
          />
        ))}
      </div>
    </div>
  );
};

export default Carousel;