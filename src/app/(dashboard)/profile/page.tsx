'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import Sidebar from '@/components/Sidebar'
import Steps from '@/components/Steps'
import Input from '@/components/ui/Input'
import Textarea from '@/components/ui/Textarea'
import Button from '@/components/ui/Button'
import Tag from '@/components/ui/Tag'
import Badge from '@/components/ui/Badge'

interface Career {
  id: string
  company: string
  position: string
  country: string
  startDate: string
  endDate: string | null
  isCurrent: boolean
  description: string | null
}

interface Education {
  id: string
  school: string
  major: string
  degree: string
  country: string
  graduationYear: number
}

interface Project {
  id: string
  name: string
  description: string
  role: string
  countries: string[]
  industries: string[]
  businessTypes: string[]
}

interface UserProfile {
  id: string
  name: string
  englishName: string | null
  nationality: string | null
  currentCountry: string | null
  currentCity: string | null
  phone: string | null
  bio: string | null
  email: string
}

export default function ProfilePage() {
  const [step, setStep] = useState(0)
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState('')
  
  // User profile data
  const [profile, setProfile] = useState<UserProfile>({
    id: '',
    name: '',
    englishName: '',
    nationality: '',
    currentCountry: '',
    currentCity: '',
    phone: '',
    bio: '',
    email: '',
  })

  // Careers
  const [careers, setCareers] = useState<Career[]>([])
  
  // Educations
  const [educations, setEducations] = useState<Education[]>([])
  
  // Projects
  const [projects, setProjects] = useState<Record<string, Project[]>>({})

  // Current form state
  const [careerForm, setCareerForm] = useState({
    company: '',
    position: '',
    country: '',
    startDate: '',
    endDate: '',
    isCurrent: false,
    description: '',
  })

  const [educationForm, setEducationForm] = useState({
    school: '',
    major: '',
    degree: '',
    country: '',
    graduationYear: '',
  })

  // Load data on mount
  useEffect(() => {
    loadProfileData()
  }, [])

  const loadProfileData = async () => {
    try {
      // Load user profile
      const profileRes = await fetch('/api/users/me')
      if (profileRes.ok) {
        const profileData = await profileRes.json()
        if (profileData.user) {
          setProfile(profileData.user)
        }
      }

      // Load careers
      const careersRes = await fetch('/api/careers')
      if (careersRes.ok) {
        const careersData = await careersRes.json()
        setCareers(careersData.careers || [])
      }

      // Load educations
      const educationsRes = await fetch('/api/educations')
      if (educationsRes.ok) {
        const educationsData = await educationsRes.json()
        setEducations(educationsData.educations || [])
      }
    } catch (error) {
      console.error('Error loading profile data:', error)
    }
  }

  const handleProfileChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setProfile({ ...profile, [e.target.name]: e.target.value })
  }

  const handleCareerFormChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const target = e.target as HTMLInputElement
    const { name, value, type } = target
    const checked = (target as HTMLInputElement).checked
    setCareerForm({
      ...careerForm,
      [name]: type === 'checkbox' ? checked : value,
    })
  }

  const handleEducationFormChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setEducationForm({ ...educationForm, [e.target.name]: e.target.value })
  }

  const saveProfile = async () => {
    setLoading(true)
    try {
      const res = await fetch('/api/users/me', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(profile),
      })
      
      if (res.ok) {
        setMessage('✓ 기본 정보가 저장되었습니다')
        setTimeout(() => setMessage(''), 3000)
      }
    } catch (error) {
      console.error('Error saving profile:', error)
    }
    setLoading(false)
  }

  const addCareer = async () => {
    if (!careerForm.company || !careerForm.position || !careerForm.country || !careerForm.startDate) {
      setMessage('필수 항목을 입력해주세요')
      return
    }

    setLoading(true)
    try {
      const res = await fetch('/api/careers', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...careerForm,
          startDate: new Date(careerForm.startDate).toISOString(),
          endDate: careerForm.endDate ? new Date(careerForm.endDate).toISOString() : null,
        }),
      })
      
      if (res.ok) {
        const data = await res.json()
        setCareers([...careers, data.career])
        setCareerForm({
          company: '',
          position: '',
          country: '',
          startDate: '',
          endDate: '',
          isCurrent: false,
          description: '',
        })
        setMessage('✓ 경력이 추가되었습니다')
        setTimeout(() => setMessage(''), 3000)
      }
    } catch (error) {
      console.error('Error adding career:', error)
    }
    setLoading(false)
  }

  const deleteCareer = async (id: string) => {
    if (!confirm('이 경력을 삭제하시겠습니까?')) return

    setLoading(true)
    try {
      const res = await fetch(`/api/careers/${id}`, { method: 'DELETE' })
      if (res.ok) {
        setCareers(careers.filter(c => c.id !== id))
        setMessage('✓ 경력이 삭제되었습니다')
        setTimeout(() => setMessage(''), 3000)
      }
    } catch (error) {
      console.error('Error deleting career:', error)
    }
    setLoading(false)
  }

  const addEducation = async () => {
    if (!educationForm.school || !educationForm.major || !educationForm.degree || !educationForm.country || !educationForm.graduationYear) {
      setMessage('필수 항목을 입력해주세요')
      return
    }

    setLoading(true)
    try {
      const res = await fetch('/api/educations', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...educationForm,
          graduationYear: parseInt(educationForm.graduationYear),
        }),
      })
      
      if (res.ok) {
        const data = await res.json()
        setEducations([...educations, data.education])
        setEducationForm({
          school: '',
          major: '',
          degree: '',
          country: '',
          graduationYear: '',
        })
        setMessage('✓ 학력이 추가되었습니다')
        setTimeout(() => setMessage(''), 3000)
      }
    } catch (error) {
      console.error('Error adding education:', error)
    }
    setLoading(false)
  }

  const formatDate = (dateStr: string | null | undefined) => {
    if (!dateStr) return ''
    const date = new Date(dateStr)
    return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`
  }

  const handleNext = () => {
    if (step < 3) setStep(step + 1)
  }

  const handleBack = () => {
    if (step > 0) setStep(step - 1)
  }

  return (
    <div className="h-[calc(100vh-52px)] bg-[#f2f4f7] flex">
      <Sidebar activeItem="profile" />
      
      <div className="flex-1 flex flex-col overflow-hidden">
        <Steps current={step} />
        
        <div className="flex-1 overflow-auto p-7 max-w-[820px] mx-auto w-full">
          {message && (
            <div className="mb-4 p-3 bg-green-100 border border-green-400 rounded text-sm text-green-800">
              {message}
            </div>
          )}

          {/* Step 1: Basic Info */}
          {step === 0 && (
            <>
              <h1 className="text-xl font-bold mb-1">기본 정보 입력</h1>
              <p className="text-sm text-gray-500 mb-5">실명 및 기본 연락처 정보를 입력해주세요.</p>
              
              <div className="bg-white border border-gray-300 rounded p-4 mb-3 flex gap-5 items-center">
                <div className="w-[68px] h-[68px] bg-gray-200 border border-gray-300 rounded-full flex items-center justify-center">
                  👤
                </div>
                <div>
                  <div className="font-bold text-sm mb-1">프로필 사진</div>
                  <div className="text-xs text-gray-500 mb-2">JPG, PNG / 최대 5MB</div>
                  <Button variant="secondary" size="sm">사진 업로드</Button>
                </div>
              </div>

              <div className="bg-white border border-gray-300 rounded p-4 mb-3">
                <div className="flex justify-between items-center mb-3.5">
                  <div className="font-bold text-sm">기본 정보</div>
                  <Button variant="primary" size="sm" onClick={saveProfile} disabled={loading}>
                    저장
                  </Button>
                </div>
                <div className="flex gap-3 mb-2.5">
                  <Input 
                    label="이름 (실명)" 
                    name="name" 
                    value={profile.name} 
                    onChange={handleProfileChange} 
                  />
                  <Input 
                    label="영문 이름" 
                    name="englishName" 
                    value={profile.englishName || ''} 
                    onChange={handleProfileChange} 
                  />
                  <Input label="생년월일" name="dateOfBirth" type="date" />
                </div>
                <div className="flex gap-3 mb-2.5">
                  <Input 
                    label="국적" 
                    name="nationality" 
                    value={profile.nationality || ''} 
                    onChange={handleProfileChange} 
                  />
                  <Input 
                    label="현재 거주 국가" 
                    name="currentCountry" 
                    value={profile.currentCountry || ''} 
                    onChange={handleProfileChange} 
                  />
                  <Input 
                    label="거주 도시" 
                    name="currentCity" 
                    value={profile.currentCity || ''} 
                    onChange={handleProfileChange} 
                  />
                </div>
                <div className="flex gap-3">
                  <Input 
                    label="이메일 (연락용)" 
                    name="email" 
                    type="email" 
                    value={profile.email} 
                    onChange={handleProfileChange} 
                  />
                  <Input 
                    label="전화 / WhatsApp" 
                    name="phone" 
                    value={profile.phone || ''} 
                    onChange={handleProfileChange} 
                  />
                </div>
              </div>

              <div className="bg-white border border-gray-300 rounded p-4 mb-6">
                <div className="font-bold text-sm mb-3">자기소개</div>
                <Textarea
                  label="간단한 자기소개 (최대 500자)"
                  name="bio"
                  value={profile.bio || ''}
                  onChange={handleProfileChange}
                  rows={4}
                  className="h-[80px]"
                />
              </div>

              <div className="flex justify-end">
                <Button variant="primary" onClick={handleNext}>
                  저장 및 다음 →
                </Button>
              </div>
            </>
          )}

          {/* Step 2: Career & Education */}
          {step === 1 && (
            <>
              <h1 className="text-xl font-bold mb-1">경력 정보 입력</h1>
              <p className="text-sm text-gray-500 mb-5">해외 근무 경력을 상세히 입력해주세요. 복수 경력 등록 가능합니다.</p>

              {/* Existing Careers */}
              {careers.map((career, index) => (
                <div key={career.id} className="bg-white border border-gray-300 rounded p-4 mb-3">
                  <div className="flex justify-between items-center mb-3.5">
                    <div className="font-bold text-sm">경력 #{index + 1}</div>
                    <button 
                      onClick={() => deleteCareer(career.id)}
                      className="text-xs text-red-500 hover:underline"
                    >
                      ✕ 삭제
                    </button>
                  </div>
                  <div className="flex gap-3 mb-2.5 text-sm">
                    <div className="flex-1">
                      <span className="text-gray-500">회사:</span> {career.company}
                    </div>
                    <div className="flex-1">
                      <span className="text-gray-500">직책:</span> {career.position}
                    </div>
                    <div className="flex-1">
                      <span className="text-gray-500">국가:</span> {career.country}
                    </div>
                  </div>
                  <div className="flex gap-3 mb-2.5 text-sm">
                    <div className="flex-1">
                      <span className="text-gray-500">기간:</span> {formatDate(career.startDate)} ~ {career.isCurrent ? '현재' : formatDate(career.endDate)}
                    </div>
                    {career.isCurrent && (
                      <Badge label="재직 중" variant="blue" />
                    )}
                  </div>
                  {career.description && (
                    <div className="text-sm text-gray-600 bg-gray-50 p-2 rounded">
                      {career.description}
                    </div>
                  )}
                </div>
              ))}

              {/* Add New Career Form */}
              <div className="bg-white border border-blue-300 rounded p-4 mb-3">
                <div className="font-bold text-sm mb-3.5 text-blue-600">+ 새 경력 추가</div>
                <div className="flex gap-3 mb-2.5">
                  <Input 
                    label="회사명 / 기관명 *" 
                    name="company"
                    value={careerForm.company}
                    onChange={handleCareerFormChange}
                  />
                  <Input 
                    label="직책 / 직위 *" 
                    name="position"
                    value={careerForm.position}
                    onChange={handleCareerFormChange}
                  />
                  <Input 
                    label="근무 국가 *" 
                    name="country"
                    value={careerForm.country}
                    onChange={handleCareerFormChange}
                  />
                </div>
                <div className="flex gap-3 mb-2.5">
                  <Input 
                    label="시작 연월 *" 
                    name="startDate"
                    type="month"
                    value={careerForm.startDate}
                    onChange={handleCareerFormChange}
                  />
                  <Input 
                    label="종료 연월" 
                    name="endDate"
                    type="month"
                    value={careerForm.endDate}
                    onChange={handleCareerFormChange}
                    disabled={careerForm.isCurrent}
                  />
                  <div className="flex items-end pb-1">
                    <label className="flex items-center gap-2 text-sm">
                      <input 
                        type="checkbox" 
                        name="isCurrent"
                        checked={careerForm.isCurrent}
                        onChange={handleCareerFormChange}
                        className="w-4 h-4"
                      />
                      현재 재직 중
                    </label>
                  </div>
                </div>
                <Textarea 
                  label="주요 업무 및 성과" 
                  name="description"
                  value={careerForm.description}
                  onChange={handleCareerFormChange}
                  rows={2}
                  className="mb-3"
                />
                <div className="flex justify-end">
                  <Button variant="primary" size="sm" onClick={addCareer} disabled={loading}>
                    경력 추가
                  </Button>
                </div>
              </div>

              {/* Education Section */}
              <div className="bg-white border border-gray-300 rounded p-4 mb-6">
                <div className="font-bold text-sm mb-3.5">학력</div>
                
                {/* Existing Educations */}
                {educations.map((edu, index) => (
                  <div key={edu.id} className="flex items-center gap-4 py-2 border-b border-gray-100 last:border-0">
                    <div className="text-sm">
                      <span className="font-semibold">{edu.school}</span>
                      <span className="text-gray-500 ml-2">{edu.major} ({edu.degree})</span>
                    </div>
                    <div className="text-xs text-gray-500">{edu.country} · {edu.graduationYear}</div>
                  </div>
                ))}

                {/* Add Education Form */}
                <div className="mt-3 pt-3 border-t border-gray-200">
                  <div className="flex gap-3 mb-2">
                    <Input 
                      label="학교명 *" 
                      name="school"
                      value={educationForm.school}
                      onChange={handleEducationFormChange}
                    />
                    <Input 
                      label="전공 *" 
                      name="major"
                      value={educationForm.major}
                      onChange={handleEducationFormChange}
                    />
                    <Input 
                      label="학위 *" 
                      name="degree"
                      value={educationForm.degree}
                      onChange={handleEducationFormChange}
                    />
                  </div>
                  <div className="flex gap-3 mb-2">
                    <Input 
                      label="국가 *" 
                      name="country"
                      value={educationForm.country}
                      onChange={handleEducationFormChange}
                    />
                    <Input 
                      label="졸업 연도 *" 
                      name="graduationYear"
                      type="number"
                      value={educationForm.graduationYear}
                      onChange={handleEducationFormChange}
                    />
                    <div className="flex items-end">
                      <Button variant="primary" size="sm" onClick={addEducation} disabled={loading}>
                        학력 추가
                      </Button>
                    </div>
                  </div>
                </div>
              </div>

              <div className="flex justify-between">
                <Button variant="secondary" onClick={handleBack}>← 이전 단계</Button>
                <Button variant="primary" onClick={handleNext}>저장 및 다음 →</Button>
              </div>
            </>
          )}

          {/* Step 3: Documents */}
          {step === 2 && (
            <>
              <h1 className="text-xl font-bold mb-1">증빙 서류 업로드</h1>
              <p className="text-sm text-gray-500 mb-5">경력을 증빙할 수 있는 서류를 업로드해주세요. 서류 검토 후 인증 배지가 부여됩니다.</p>

              <div className="bg-white border border-gray-300 rounded p-4 mb-3">
                <div className="font-bold text-sm mb-3">서류 종류 선택</div>
                <div className="flex gap-2 flex-wrap">
                  {['재직증명서', '퇴직증명서', '경력증명서', '자격증', '학위증명서', '기타'].map((type, index) => (
                    <div
                      key={type}
                      className={`px-3.5 py-1.5 rounded text-xs cursor-pointer ${
                        index === 0
                          ? 'bg-blue-100 border border-primary text-primary'
                          : 'border border-gray-300'
                      }`}
                    >
                      {type}
                    </div>
                  ))}
                </div>
              </div>

              <div className="border-2 border-dashed border-primary rounded p-8 text-center bg-blue-50 mb-3 cursor-pointer hover:bg-blue-100 transition-colors">
                <div className="text-2xl mb-2">📂</div>
                <div className="font-bold text-sm text-primary mb-1">파일을 여기에 드래그하거나 클릭해서 업로드</div>
                <div className="text-xs text-gray-500">PDF, JPG, PNG 지원 · 파일당 최대 10MB</div>
              </div>

              <div className="bg-white border border-gray-300 rounded p-4 mb-6">
                <div className="font-bold text-sm mb-3">업로드된 서류</div>
                <div className="text-sm text-gray-500 text-center py-4">
                  아직 업로드된 서류가 없습니다.
                </div>
              </div>

              <div className="flex justify-between">
                <Button variant="secondary" onClick={handleBack}>← 이전 단계</Button>
                <Button variant="primary" onClick={handleNext}>저장 및 다음 →</Button>
              </div>
            </>
          )}

          {/* Step 4: Complete */}
          {step === 3 && (
            <div className="flex-1 flex items-center justify-center">
              <div className="text-center max-w-[560px]">
                <div className="text-4xl mb-3.5">🎉</div>
                <div className="text-xl font-bold mb-2.5">프로필 등록이 완료되었습니다!</div>
                <div className="text-sm text-gray-500 mb-7 leading-relaxed">
                  증빙 서류는 2-3 영업일 내에 검토됩니다.<br />검토가 완료되면 이메일로 알려드립니다.
                </div>
                <div className="bg-white border border-gray-300 rounded p-4 mb-6 text-left flex gap-4 items-center">
                  <div className="w-[52px] h-[52px] bg-gray-200 border border-gray-300 rounded-full flex items-center justify-center text-lg">
                    👤
                  </div>
                  <div className="flex-1">
                    <div className="font-bold text-sm mb-0.5">{profile.name || '사용자'}</div>
                    <div className="text-xs text-gray-500 mb-1.5">{profile.currentCountry || ''} 전문가</div>
                    <div className="flex gap-1.5">
                      {careers.length > 0 && (
                        <Tag label={`${careers.length}개 경력`} variant="blue" />
                      )}
                      {educations.length > 0 && (
                        <Tag label={`${educations.length}개 학력`} />
                      )}
                      <Badge label="⏳ 인증 검토중" variant="orange" />
                    </div>
                  </div>
                </div>
                <div className="flex gap-3 justify-center">
                  <Button variant="secondary">내 프로필 보기</Button>
                  <Link href="/dashboard">
                    <Button variant="primary">대시보드로 이동 →</Button>
                  </Link>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}