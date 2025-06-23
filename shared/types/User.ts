// User type definitions for Smart Marketplace
export interface User {
  _id: string;
  username: string;
  email: string;
  firstName?: string;
  lastName?: string;
  avatar?: string;
  phone?: string;
  isVerified: boolean;
  isActive: boolean;
  role: UserRole;
  profile: UserProfile;
  preferences: UserPreferences;
  stats: UserStats;
  createdAt: Date;
  updatedAt: Date;
}

export enum UserRole {
  BUYER = 'buyer',
  SELLER = 'seller',
  ADMIN = 'admin'
}

export interface UserProfile {
  bio?: string;
  location?: {
    city?: string;
    state?: string;
    country?: string;
    coordinates?: {
      latitude: number;
      longitude: number;
    };
  };
  socialLinks?: {
    website?: string;
    twitter?: string;
    instagram?: string;
    facebook?: string;
  };
  verificationStatus: {
    email: boolean;
    phone: boolean;
    identity: boolean;
    address: boolean;
  };
  rating: {
    average: number;
    count: number;
    reviews: UserReview[];
  };
}

export interface UserPreferences {
  theme: 'light' | 'dark' | 'system';
  language: string;
  currency: string;
  notifications: {
    email: boolean;
    push: boolean;
    sms: boolean;
    marketing: boolean;
  };
  privacy: {
    showProfile: boolean;
    showActivity: boolean;
    allowMessages: boolean;
  };
}

export interface UserStats {
  productsListed: number;
  productsSold: number;
  productsBought: number;
  totalEarnings: number;
  totalSpent: number;
  successfulNegotiations: number;
  averageNegotiationTime: number;
  joinDate: Date;
  lastActive: Date;
}

export interface UserReview {
  _id: string;
  reviewerId: string;
  reviewerName: string;
  reviewerAvatar?: string;
  rating: number;
  comment?: string;
  productId?: string;
  negotiationId?: string;
  createdAt: Date;
}

export interface AuthUser {
  _id: string;
  username: string;
  email: string;
  role: UserRole;
  isVerified: boolean;
  avatar?: string;
  token?: string;
}

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface RegisterData {
  username: string;
  email: string;
  password: string;
  firstName?: string;
  lastName?: string;
  acceptTerms: boolean;
}

export interface UpdateUserProfile {
  firstName?: string;
  lastName?: string;
  bio?: string;
  phone?: string;
  location?: UserProfile['location'];
  socialLinks?: UserProfile['socialLinks'];
}

export interface ChangePassword {
  currentPassword: string;
  newPassword: string;
  confirmPassword: string;
}
