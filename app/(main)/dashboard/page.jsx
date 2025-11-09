// /app/industry-insights/page.tsx
import { getIndustryInsights } from '@/actions/dashBoard'
import { getUserOnboardingStatus } from '@/actions/user'
import { redirect } from 'next/navigation'
import DashboardView from './_components/Dashboard-View'

const IndustryInsightsPage = async () => {
  const { isOnboarded } = await getUserOnboardingStatus()

  if (!isOnboarded) {
    redirect("/onBoarding")
  }

  const insights = await getIndustryInsights()

  return (
    <div className='container mx-auto'>
      <DashboardView insights={insights} />
    </div>
  )
}

export default IndustryInsightsPage
