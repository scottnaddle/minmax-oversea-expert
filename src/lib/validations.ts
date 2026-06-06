import { z } from 'zod'

// Auth schemas
export const signupSchema = z.object({
  email: z.string().email('유효한 이메일을 입력해주세요'),
  password: z.string().min(8, '비밀번호는 8자 이상이어야 합니다'),
  confirmPassword: z.string(),
  name: z.string().min(2, '이름을 입력해주세요'),
  userType: z.enum(['expert', 'enterprise']),
  currentCountry: z.string().optional(),
  expertise: z.string().optional(),
  // 기업회원 전용
  businessNumber: z.string().optional(),
  businessName: z.string().optional(),
  businessType: z.string().optional(),
  representativeName: z.string().optional(),
  companyPhone: z.string().optional(),
}).refine((data) => data.password === data.confirmPassword, {
  message: '비밀번호가 일치하지 않습니다',
  path: ['confirmPassword'],
})

export const loginSchema = z.object({
  email: z.string().email('유효한 이메일을 입력해주세요'),
  password: z.string().min(1, '비밀번호를 입력해주세요'),
})

// Profile schemas
export const profileSchema = z.object({
  name: z.string().min(2, '이름을 입력해주세요'),
  englishName: z.string().optional(),
  dateOfBirth: z.string().optional(),
  nationality: z.string().optional(),
  currentCountry: z.string().optional(),
  currentCity: z.string().optional(),
  phone: z.string().optional(),
  bio: z.string().max(500, '자기소개는 500자를 초과할 수 없습니다').optional(),
})

// Career schemas
export const careerSchema = z.object({
  company: z.string().min(1, '회사명을 입력해주세요'),
  position: z.string().min(1, '직책을 입력해주세요'),
  country: z.string().min(1, '근무 국가를 입력해주세요'),
  startDate: z.string().min(1, '시작일을 입력해주세요'),
  endDate: z.string().optional(),
  isCurrent: z.boolean(),
  description: z.string().optional(),
})

// Project schemas
export const projectSchema = z.object({
  name: z.string().min(1, '프로젝트명을 입력해주세요'),
  description: z.string().min(1, '프로젝트 설명을 입력해주세요'),
  role: z.string().min(1, '역할을 입력해주세요'),
  startDate: z.string().min(1, '시작일을 입력해주세요'),
  endDate: z.string().optional(),
  countries: z.array(z.string()).min(1, '진출 국가를 선택해주세요'),
  industries: z.array(z.string()).min(1, '산업 분야를 선택해주세요'),
  businessTypes: z.array(z.string()).min(1, '사업 유형을 선택해주세요'),
  achievements: z.string().optional(),
})

// Education schemas
export const educationSchema = z.object({
  school: z.string().min(1, '학교명을 입력해주세요'),
  major: z.string().min(1, '전공을 입력해주세요'),
  degree: z.string().min(1, '학위를 선택해주세요'),
  country: z.string().min(1, '국가를 선택해주세요'),
  graduationYear: z.number().min(1950).max(2030),
})

// Language schemas
export const languageSchema = z.object({
  language: z.string().min(1, '언어를 입력해주세요'),
  proficiency: z.enum(['beginner', 'intermediate', 'advanced', 'native']),
  certificate: z.string().optional(),
  score: z.string().optional(),
  expirationDate: z.string().optional(),
})

// Certification schemas
export const certificationSchema = z.object({
  name: z.string().min(1, '자격증명을 입력해주세요'),
  issuer: z.string().min(1, '발급 기관을 입력해주세요'),
  issuedDate: z.string().min(1, '취득일을 입력해주세요'),
  expirationDate: z.string().optional(),
  credentialId: z.string().optional(),
})

// Message schemas
export const messageSchema = z.object({
  receiverId: z.string().min(1, '수신자를 선택해주세요'),
  subject: z.string().min(1, '제목을 입력해주세요'),
  content: z.string().min(1, '내용을 입력해주세요'),
})

// Types
export type SignupInput = z.infer<typeof signupSchema>
export type LoginInput = z.infer<typeof loginSchema>
export type ProfileInput = z.infer<typeof profileSchema>
export type CareerInput = z.infer<typeof careerSchema>
export type ProjectInput = z.infer<typeof projectSchema>
export type EducationInput = z.infer<typeof educationSchema>
export type LanguageInput = z.infer<typeof languageSchema>
export type CertificationInput = z.infer<typeof certificationSchema>
export type MessageInput = z.infer<typeof messageSchema>