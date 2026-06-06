import { redirect } from 'next/navigation'
import { getCurrentUser } from '@/lib/auth'
import PersonalDashboard from './PersonalDashboard'
import CorporateDashboard from './CorporateDashboard'

export default async function DashboardPage() {
  const user = await getCurrentUser()

  if (!user) {
    redirect('/login')
  }

  // 기업회원과 개인회원을 분리된 대시보드로 라우팅
  if (user.userType === 'enterprise') {
    return <CorporateDashboard user={user} />
  }

  return <PersonalDashboard user={user} />
}