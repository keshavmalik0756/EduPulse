import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

const ImageSlideshow = ({
  images,
  autoSlide = true,
  interval = 5000,
  className = "",
  imageClassName = ""
}) => {
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    if (!autoSlide || images.length <= 1) return;

    const slideInterval = setInterval(() => {
      setCurrentIndex((prevIndex) => (prevIndex + 1) % images.length);
    }, interval);

    return () => clearInterval(slideInterval);
  }, [autoSlide, interval, images.length]);

  if (!images || images.length === 0) {
    return <div className="flex items-center justify-center h-full text-white">No images available</div>;
  }

  return (
    <div className={`relative w-full h-full ${className}`}>
      {/* Main Image Container */}
      <div className="relative w-full h-full overflow-hidden">
        <AnimatePresence mode="wait">
          <motion.div
            key={currentIndex}
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 1.05 }}
            transition={{ duration: 0.8, ease: "easeInOut" }}
            className="absolute inset-0 flex items-center justify-center p-2 sm:p-3 md:p-4"
          >
            {/* SVG optimized rendering */}
            <div className="w-full h-full flex items-center justify-center">
              <img
                src={images[currentIndex].src}
                alt={images[currentIndex].alt}
                loading="lazy"
                className={`max-w-full max-h-full ${imageClassName}`}
                style={{
                  objectFit: 'contain',
                  width: '100%',
                  height: '100%'
                }}
                onError={(e) => {
                  console.error('SVG failed to load:', e.target.src);
                  console.log('Available images:', images);
                  // Show fallback
                  e.target.style.display = 'none';
                  const fallback = e.target.parentElement.querySelector('.fallback-content');
                  if (fallback) {
                    fallback.style.display = 'flex';
                  }
                }}
                onLoad={(e) => {
                  console.log('SVG loaded successfully:', e.target.src);
                }}
              />
              
              {/* Fallback content */}
              <div className="fallback-content hidden flex-col items-center justify-center text-white/70 text-center w-full h-full">
                <div className="text-6xl mb-4">🎨</div>
                <div className="text-lg font-semibold">Loading Image...</div>
                <div className="text-sm mt-2">{images[currentIndex].alt}</div>
              </div>
            </div>
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
};

export default ImageSlideshow;