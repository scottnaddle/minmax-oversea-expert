// Global type definitions for the application

export interface User {
  id: string;
  email: string;
  name: string;
  englishName?: string;
  dateOfBirth?: string;
  nationality?: string;
  currentCountry?: string;
  currentCity?: string;
  phone?: string;
  bio?: string;
  profileImage?: string;
  userType: 'expert' | 'enterprise';
  emailVerified: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface Education {
  id: string;
  userId: string;
  school: string;
  major: string;
  degree: string;
  country: string;
  graduationYear: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface Language {
  id: string;
  userId: string;
  language: string;
  proficiency: 'beginner' | 'intermediate' | 'advanced' | 'native';
  certificate?: string;
  score?: string;
  expirationDate?: Date;
  createdAt: Date;
  updatedAt: Date;
}

export interface Certification {
  id: string;
  userId: string;
  name: string;
  issuer: string;
  issuedDate: Date;
  expirationDate?: Date;
  credentialId?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface Career {
  id: string;
  userId: string;
  company: string;
  position: string;
  country: string;
  startDate: Date;
  endDate?: Date;
  isCurrent: boolean;
  description?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface Project {
  id: string;
  careerId: string;
  name: string;
  description: string;
  role: string;
  startDate: Date;
  endDate?: Date;
  countries: string[];
  industries: string[];
  businessTypes: string[];
  achievements?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface Document {
  id: string;
  userId: string;
  careerId?: string;
  name: string;
  type: 'employment' | 'career' | 'certification' | 'degree' | 'other';
  fileUrl: string;
  fileKey: string;
  status: 'pending' | 'approved' | 'rejected';
  rejectionReason?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface Certificate {
  id: string;
  userId: string;
  certificateNumber: string;
  issuedAt: Date;
  pdfUrl?: string;
  createdAt: Date;
}

export interface Message {
  id: string;
  senderId: string;
  receiverId: string;
  subject: string;
  content: string;
  read: boolean;
  createdAt: Date;
}

export interface Notification {
  id: string;
  userId: string;
  type: 'profile_view' | 'job_offer' | 'document_approved' | 'document_rejected' | 'message';
  title: string;
  content: string;
  read: boolean;
  data?: Record<string, any>;
  createdAt: Date;
}

// API Response types
export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

// Form types
export interface SignupFormData {
  email: string;
  password: string;
  confirmPassword: string;
  name: string;
  userType: 'expert' | 'enterprise';
  currentCountry?: string;
  expertise?: string;
}

export interface LoginFormData {
  email: string;
  password: string;
}

export interface ProfileFormData {
  name: string;
  englishName?: string;
  dateOfBirth?: string;
  nationality?: string;
  currentCountry?: string;
  currentCity?: string;
  phone?: string;
  bio?: string;
}

export interface CareerFormData {
  company: string;
  position: string;
  country: string;
  startDate: string;
  endDate?: string;
  isCurrent: boolean;
  description?: string;
}

export interface ProjectFormData {
  name: string;
  description: string;
  role: string;
  startDate: string;
  endDate?: string;
  countries: string[];
  industries: string[];
  businessTypes: string[];
  achievements?: string;
}

// Filter types for search
export interface ExpertSearchFilters {
  query?: string;
  industries?: string[];
  countries?: string[];
  experienceYears?: number;
  certificationsOnly?: boolean;
  sortBy?: 'relevance' | 'experience' | 'recent';
}

// Pagination
export interface PaginationParams {
  page: number;
  limit: number;
  total?: number;
}

// Dashboard stats
export interface DashboardStats {
  profileCompletion: number;
  totalCareers: number;
  totalProjects: number;
  totalDocuments: number;
  profileViews: number;
  jobOffers: number;
}