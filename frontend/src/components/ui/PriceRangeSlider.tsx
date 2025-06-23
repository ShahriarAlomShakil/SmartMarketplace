import React, { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';

/**
 * PriceRangeSlider Component - Custom dual-handle price range slider
 * 
 * Features:
 * - Dual handle range selection
 * - Real-time value display
 * - Smooth animations
 * - Custom styling with modern design
 * - Touch support for mobile
 */

interface PriceRangeSliderProps {
  min: number;
  max: number;
  value: [number, number];
  onChange: (value: [number, number]) => void;
  step?: number;
  formatValue?: (value: number) => string;
  className?: string;
}

export const PriceRangeSlider: React.FC<PriceRangeSliderProps> = ({
  min,
  max,
  value,
  onChange,
  step = 1,
  formatValue = (val) => `$${val}`,
  className = ''
}) => {
  const [dragging, setDragging] = useState<'min' | 'max' | null>(null);
  const [tempValue, setTempValue] = useState(value);
  const sliderRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setTempValue(value);
  }, [value]);

  const getPercentage = (val: number) => {
    return ((val - min) / (max - min)) * 100;
  };

  const getValueFromEvent = (e: MouseEvent | TouchEvent): number => {
    if (!sliderRef.current) return min;
    
    const rect = sliderRef.current.getBoundingClientRect();
    const clientX = 'touches' in e ? e.touches[0].clientX : e.clientX;
    const percentage = Math.max(0, Math.min(1, (clientX - rect.left) / rect.width));
    const rawValue = min + percentage * (max - min);
    
    // Round to nearest step
    return Math.round(rawValue / step) * step;
  };

  const handleMouseDown = (handle: 'min' | 'max') => (e: React.MouseEvent) => {
    e.preventDefault();
    setDragging(handle);
    
    const handleMouseMove = (e: MouseEvent) => {
      const newValue = getValueFromEvent(e);
      
      setTempValue(prev => {
        if (handle === 'min') {
          return [Math.min(newValue, prev[1]), prev[1]];
        } else {
          return [prev[0], Math.max(newValue, prev[0])];
        }
      });
    };

    const handleMouseUp = () => {
      setDragging(null);
      onChange(tempValue);
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };

    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);
  };

  const handleTouchStart = (handle: 'min' | 'max') => (e: React.TouchEvent) => {
    e.preventDefault();
    setDragging(handle);
    
    const handleTouchMove = (e: TouchEvent) => {
      const newValue = getValueFromEvent(e);
      
      setTempValue(prev => {
        if (handle === 'min') {
          return [Math.min(newValue, prev[1]), prev[1]];
        } else {
          return [prev[0], Math.max(newValue, prev[0])];
        }
      });
    };

    const handleTouchEnd = () => {
      setDragging(null);
      onChange(tempValue);
      document.removeEventListener('touchmove', handleTouchMove);
      document.removeEventListener('touchend', handleTouchEnd);
    };

    document.addEventListener('touchmove', handleTouchMove);
    document.addEventListener('touchend', handleTouchEnd);
  };

  const handleTrackClick = (e: React.MouseEvent) => {
    if (dragging) return;
    
    const newValue = getValueFromEvent(e.nativeEvent);
    const [minVal, maxVal] = tempValue;
    
    // Determine which handle is closer
    const distToMin = Math.abs(newValue - minVal);
    const distToMax = Math.abs(newValue - maxVal);
    
    if (distToMin < distToMax) {
      const newTempValue: [number, number] = [Math.min(newValue, maxVal), maxVal];
      setTempValue(newTempValue);
      onChange(newTempValue);
    } else {
      const newTempValue: [number, number] = [minVal, Math.max(newValue, minVal)];
      setTempValue(newTempValue);
      onChange(newTempValue);
    }
  };

  const minPercentage = getPercentage(tempValue[0]);
  const maxPercentage = getPercentage(tempValue[1]);

  return (
    <div className={`relative ${className}`}>
      {/* Value Display */}
      <div className="flex justify-between items-center mb-4">
        <div className="text-sm text-gray-600 dark:text-gray-400">
          <span className="font-medium">{formatValue(tempValue[0])}</span>
        </div>
        <div className="text-sm text-gray-600 dark:text-gray-400">
          <span className="font-medium">{formatValue(tempValue[1])}</span>
        </div>
      </div>

      {/* Slider Track */}
      <div
        ref={sliderRef}
        className="relative h-2 bg-gray-200 dark:bg-gray-700 rounded-full cursor-pointer"
        onClick={handleTrackClick}
      >
        {/* Active Range */}
        <motion.div
          className="absolute h-full bg-gradient-to-r from-blue-500 to-purple-500 rounded-full"
          style={{
            left: `${minPercentage}%`,
            width: `${maxPercentage - minPercentage}%`
          }}
          animate={{
            left: `${minPercentage}%`,
            width: `${maxPercentage - minPercentage}%`
          }}
          transition={{ type: "spring", stiffness: 300, damping: 30 }}
        />

        {/* Min Handle */}
        <motion.div
          className={`absolute w-5 h-5 bg-white border-2 border-blue-500 rounded-full shadow-lg cursor-grab top-1/2 -translate-y-1/2 -translate-x-1/2 ${
            dragging === 'min' ? 'cursor-grabbing scale-110' : 'hover:scale-110'
          } transition-transform`}
          style={{ left: `${minPercentage}%` }}
          onMouseDown={handleMouseDown('min')}
          onTouchStart={handleTouchStart('min')}
          animate={{ left: `${minPercentage}%` }}
          transition={{ type: "spring", stiffness: 300, damping: 30 }}
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 1.2 }}
        >
          {/* Value Tooltip */}
          <motion.div
            className="absolute bottom-8 left-1/2 -translate-x-1/2 bg-gray-800 text-white text-xs px-2 py-1 rounded whitespace-nowrap"
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ 
              opacity: dragging === 'min' ? 1 : 0,
              scale: dragging === 'min' ? 1 : 0.8
            }}
            transition={{ duration: 0.2 }}
          >
            {formatValue(tempValue[0])}
            <div className="absolute top-full left-1/2 -translate-x-1/2 w-0 h-0 border-l-2 border-r-2 border-t-2 border-transparent border-t-gray-800" />
          </motion.div>
        </motion.div>

        {/* Max Handle */}
        <motion.div
          className={`absolute w-5 h-5 bg-white border-2 border-purple-500 rounded-full shadow-lg cursor-grab top-1/2 -translate-y-1/2 -translate-x-1/2 ${
            dragging === 'max' ? 'cursor-grabbing scale-110' : 'hover:scale-110'
          } transition-transform`}
          style={{ left: `${maxPercentage}%` }}
          onMouseDown={handleMouseDown('max')}
          onTouchStart={handleTouchStart('max')}
          animate={{ left: `${maxPercentage}%` }}
          transition={{ type: "spring", stiffness: 300, damping: 30 }}
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 1.2 }}
        >
          {/* Value Tooltip */}
          <motion.div
            className="absolute bottom-8 left-1/2 -translate-x-1/2 bg-gray-800 text-white text-xs px-2 py-1 rounded whitespace-nowrap"
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ 
              opacity: dragging === 'max' ? 1 : 0,
              scale: dragging === 'max' ? 1 : 0.8
            }}
            transition={{ duration: 0.2 }}
          >
            {formatValue(tempValue[1])}
            <div className="absolute top-full left-1/2 -translate-x-1/2 w-0 h-0 border-l-2 border-r-2 border-t-2 border-transparent border-t-gray-800" />
          </motion.div>
        </motion.div>
      </div>

      {/* Range Labels */}
      <div className="flex justify-between mt-2 text-xs text-gray-500 dark:text-gray-400">
        <span>{formatValue(min)}</span>
        <span>{formatValue(max)}</span>
      </div>
    </div>
  );
};

export default PriceRangeSlider;
