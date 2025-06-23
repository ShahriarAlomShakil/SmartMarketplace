import React from 'react';

interface PasswordStrengthProps {
  password: string;
  className?: string;
}

interface StrengthCriteria {
  label: string;
  test: (password: string) => boolean;
}

const strengthCriteria: StrengthCriteria[] = [
  {
    label: 'At least 8 characters',
    test: (password) => password.length >= 8
  },
  {
    label: 'Contains uppercase letter',
    test: (password) => /[A-Z]/.test(password)
  },
  {
    label: 'Contains lowercase letter',
    test: (password) => /[a-z]/.test(password)
  },
  {
    label: 'Contains number',
    test: (password) => /\d/.test(password)
  },
  {
    label: 'Contains special character',
    test: (password) => /[!@#$%^&*(),.?":{}|<>]/.test(password)
  }
];

/**
 * PasswordStrengthIndicator - Modern password strength indicator with visual feedback
 * 
 * Features:
 * - Real-time password strength calculation
 * - Visual progress bar with modern design
 * - Individual criteria checking
 * - Color-coded strength levels
 * - Smooth animations and transitions
 */
export const PasswordStrengthIndicator: React.FC<PasswordStrengthProps> = ({
  password,
  className
}) => {
  const passedCriteria = strengthCriteria.filter(criteria => criteria.test(password));
  const strengthScore = passedCriteria.length;
  const strengthPercentage = (strengthScore / strengthCriteria.length) * 100;

  const getStrengthLevel = () => {
    if (strengthScore === 0) return { label: '', color: 'bg-gray-400' };
    if (strengthScore <= 2) return { label: 'Weak', color: 'bg-red-500' };
    if (strengthScore <= 3) return { label: 'Fair', color: 'bg-yellow-500' };
    if (strengthScore <= 4) return { label: 'Good', color: 'bg-blue-500' };
    return { label: 'Strong', color: 'bg-green-500' };
  };

  const strengthLevel = getStrengthLevel();

  if (!password) return null;

  return (
    <div className={`space-y-3 ${className}`}>
      {/* Strength Bar */}
      <div className="space-y-2">
        <div className="flex justify-between items-center">
          <span className="text-sm text-white/70">Password Strength</span>
          {strengthLevel.label && (
            <span className={`text-sm font-medium ${
              strengthLevel.color === 'bg-red-500' ? 'text-red-300' :
              strengthLevel.color === 'bg-yellow-500' ? 'text-yellow-300' :
              strengthLevel.color === 'bg-blue-500' ? 'text-blue-300' :
              'text-green-300'
            }`}>
              {strengthLevel.label}
            </span>
          )}
        </div>
        
        <div className="w-full bg-white/10 rounded-full h-2 backdrop-blur-sm">
          <div 
            className={`h-2 rounded-full transition-all duration-300 ease-out ${strengthLevel.color}`}
            style={{ width: `${strengthPercentage}%` }}
          />
        </div>
      </div>

      {/* Criteria List */}
      <div className="space-y-1">
        {strengthCriteria.map((criteria, index) => {
          const isPassed = criteria.test(password);
          return (
            <div key={index} className="flex items-center space-x-2">
              <div className={`w-4 h-4 rounded-full flex items-center justify-center transition-all duration-200 ${
                isPassed 
                  ? 'bg-green-500/30 border border-green-400/50' 
                  : 'bg-white/10 border border-white/20'
              }`}>
                {isPassed && (
                  <svg className="w-2.5 h-2.5 text-green-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                  </svg>
                )}
              </div>
              <span className={`text-sm transition-colors duration-200 ${
                isPassed ? 'text-green-300' : 'text-white/60'
              }`}>
                {criteria.label}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
};
