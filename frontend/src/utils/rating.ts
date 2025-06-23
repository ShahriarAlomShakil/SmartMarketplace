// Utility functions for handling user ratings

/**
 * Safely extracts and formats a user's rating value
 * Handles both legacy number format and new object format with average
 */
export const getUserRating = (rating: any): number => {
  if (typeof rating === 'number') {
    return rating;
  }
  
  if (typeof rating === 'object' && rating && 'average' in rating) {
    return rating.average || 0;
  }
  
  return 0;
};

/**
 * Formats a rating value with one decimal place
 */
export const formatRating = (rating: any): string => {
  const ratingValue = getUserRating(rating);
  return ratingValue.toFixed(1);
};

/**
 * Checks if a user has a valid rating to display
 */
export const hasValidRating = (rating: any): boolean => {
  const ratingValue = getUserRating(rating);
  return ratingValue > 0;
};
