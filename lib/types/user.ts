export interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  password: string; // hashed
  createdAt: string;
  lastLogin?: string;
  isActive: boolean;
  preferences: UserPreferences;
  interests: FinanceInterests;
  location?: UserLocation;
  experience: ExperienceLevel;
  notifications: NotificationSettings;
}

export interface UserPreferences {
  newsletterFrequency: 'weekly' | 'biweekly' | 'monthly';
  preferredContent: 'saving' | 'investing' | 'income' | 'all';
  language: 'en';
  timezone?: string;
}

export interface FinanceInterests {
  topics: FinanceTopic[];
  goals: string[];
  categories: FinanceCategory[];
  productTypes: ProductType[];
  timeHorizons: TimeHorizon[];
}

export interface UserLocation {
  region?: string;
  country?: string;
  city?: string;
  coordinates?: {
    lat: number;
    lng: number;
  };
}

export type ExperienceLevel = 'beginner' | 'intermediate' | 'advanced' | 'expert';

export interface NotificationSettings {
  email: boolean;
  push: boolean;
  weeklyDigest: boolean;
  newArticles: boolean;
  marketUpdates: boolean;
  productDeals: boolean;
}

// Enums for better type safety
export enum FinanceTopic {
  PERSONAL_FINANCE = 'personal-finance',
  SAVING_MONEY = 'saving-money',
  BUDGETING = 'budgeting',
  INVESTING_BASICS = 'investing-basics',
  PASSIVE_INCOME = 'passive-income',
  CREDIT_DEBT = 'credit-debt',
  BANKING_CARDS = 'banking-cards',
  TAXES_TIPS = 'taxes-tips',
  SIDE_HUSTLES = 'side-hustles',
  MONEY_PSYCHOLOGY = 'money-psychology',
  RETIREMENT = 'retirement',
  REAL_ESTATE = 'real-estate'
}

export enum FinanceCategory {
  SAVING = 'saving',
  INVESTING = 'investing',
  BUDGETING = 'budgeting',
  DEBT = 'debt',
  INCOME = 'income',
  TAXES = 'taxes',
  BANKING = 'banking',
  RETIREMENT = 'retirement'
}

export enum ProductType {
  BANK_ACCOUNTS = 'bank-accounts',
  CREDIT_CARDS = 'credit-cards',
  BROKERAGES = 'brokerages',
  ROBO_ADVISORS = 'robo-advisors',
  BUDGETING_APPS = 'budgeting-apps',
  SAVINGS_ACCOUNTS = 'savings-accounts',
  INSURANCE = 'insurance',
  COURSES = 'courses',
  BOOKS = 'books',
  SOFTWARE = 'software'
}

export enum TimeHorizon {
  SHORT_TERM = 'short-term',
  MEDIUM_TERM = 'medium-term',
  LONG_TERM = 'long-term'
}

// Registration form data
export interface RegistrationData {
  email: string;
  firstName: string;
  lastName: string;
  password: string;
  confirmPassword: string;
  experience: ExperienceLevel;
  interests: Partial<FinanceInterests>;
  location?: Partial<UserLocation>;
  preferences: Partial<UserPreferences>;
  notifications: Partial<NotificationSettings>;
}

// Login data
export interface LoginData {
  email: string;
  password: string;
}

// User profile update data
export interface ProfileUpdateData {
  firstName?: string;
  lastName?: string;
  interests?: Partial<FinanceInterests>;
  location?: Partial<UserLocation>;
  preferences?: Partial<UserPreferences>;
  notifications?: Partial<NotificationSettings>;
}

// Password change data
export interface PasswordChangeData {
  currentPassword: string;
  newPassword: string;
  confirmNewPassword: string;
}
