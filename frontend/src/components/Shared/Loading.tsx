import React, { useEffect, useRef } from 'react';
import gsap from 'gsap';
import logo from '../../assets/logo-animated.gif';

// Preload the GIF to ensure faster loading
const preloadImage = (src: string) => {
  const img = new Image();
  img.src = src;
};
preloadImage(logo);

const Loader: React.FC = () => {
  const circleRef = useRef<SVGSVGElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const logoRef = useRef<HTMLImageElement>(null);

  useEffect(() => {
    // Animate loading circle
    if (circleRef.current) {
      // Rotate the entire SVG
      gsap.to(circleRef.current, {
        rotate: 360,
        repeat: -1,
        duration: 1.2,
        ease: 'linear',
      });
      // Glow and scale effect for each segment
      const segments = circleRef.current.querySelectorAll('.spinner-segment');
      segments.forEach((segment, index) => {
        gsap.to(segment, {
          scale: 1.1,
          opacity: 0.8,
          repeat: -1,
          yoyo: true,
          duration: 0.5,
          ease: 'sine.inOut',
          delay: index * 0.1, // Staggered effect
        });
      });
    }

    // Animate logo
    if (logoRef.current) {
      gsap.fromTo(
        logoRef.current,
        { opacity: 0, scale: 0.8 },
        { opacity: 1, scale: 1, duration: 0.6, ease: 'power3.out', delay: 0.2 }
      );
    }

    // Animate container entrance
    if (containerRef.current) {
      gsap.fromTo(
        containerRef.current,
        { opacity: 0, scale: 0.95 },
        { opacity: 1, scale: 1, duration: 0.5, ease: 'power3.out' }
      );
    }

    return () => {
      // Cleanup GSAP animations
      gsap.killTweensOf(circleRef.current);
      gsap.killTweensOf(containerRef.current);
      gsap.killTweensOf(logoRef.current);
    };
  }, []);

  return (
    <div
      ref={containerRef}
      className="fixed inset-0 bg-white/80 backdrop-blur-md flex flex-col items-center justify-center z-50"
      aria-live="polite"
    >
      <div className="flex flex-col items-center gap-6">
        <img
          ref={logoRef}
          src={logo}
          alt="Cenify Animated Logo"
          className="w-24 h-24 object-contain"
          loading="eager" // Prioritize loading
        />
        <svg
          ref={circleRef}
          className="w-12 h-12"
          viewBox="0 0 50 50"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <circle
            className="spinner-segment"
            cx="25"
            cy="10"
            r="4"
            fill="#FBBF24"
          />
          <circle
            className="spinner-segment"
            cx="40"
            cy="25"
            r="4"
            fill="#FBBF24"
          />
          <circle
            className="spinner-segment"
            cx="25"
            cy="40"
            r="4"
            fill="#FBBF24"
          />
          <circle
            className="spinner-segment"
            cx="10"
            cy="25"
            r="4"
            fill="#FBBF24"
          />
        </svg>
      </div>
    </div>
  );
};

export default Loader;