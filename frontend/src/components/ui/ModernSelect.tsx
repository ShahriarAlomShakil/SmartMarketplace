import React from 'react';
import { ChevronDownIcon } from '@heroicons/react/24/outline';

/**
 * ModernSelect Component - Modern styled select dropdown
 * 
 * Features:
 * - Modern styling with backdrop blur
 * - Dark/light mode support
 * - Custom dropdown indicator
 * - Consistent with other UI components
 */

interface Option {
  value: string;
  label: string;
}

interface ModernSelectProps {
  value: string;
  onChange: (value: string) => void;
  options: Option[];
  placeholder?: string;
  disabled?: boolean;
  className?: string;
  size?: 'sm' | 'md' | 'lg';
}

export const ModernSelect: React.FC<ModernSelectProps> = ({
  value,
  onChange,
  options,
  placeholder = 'Select an option',
  disabled = false,
  className = '',
  size = 'md'
}) => {
  const sizeClasses = {
    sm: 'px-3 py-1.5 text-sm',
    md: 'px-3 py-2 text-sm',
    lg: 'px-4 py-3 text-base'
  };

  return (
    <div className={`relative ${className}`}>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        disabled={disabled}
        className={`
          w-full appearance-none rounded-xl border border-white/20
          bg-white/10 backdrop-blur-md text-white placeholder-white/60
          focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-transparent
          disabled:opacity-50 disabled:cursor-not-allowed
          transition-all duration-200
          ${sizeClasses[size]}
          ${className}
        `}
      >
        {placeholder && (
          <option value="" disabled className="bg-gray-900 text-gray-300">
            {placeholder}
          </option>
        )}
        {options.map((option) => (
          <option
            key={option.value}
            value={option.value}
            className="bg-gray-900 text-white"
          >
            {option.label}
          </option>
        ))}
      </select>
      
      {/* Custom dropdown arrow */}
      <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
        <ChevronDownIcon className="w-4 h-4 text-white/60" />
      </div>
    </div>
  );
};

export default ModernSelect;
