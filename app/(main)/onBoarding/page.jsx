import { industries } from '@/Data/industries'
import React from 'react'
import OnboardingForm from './_components/onboarding-Form'
import { getUserOnboardingStatus } from '@/actions/user'
import { redirect } from 'next/navigation'


const  onBoardingPage = async() => {
 const {isOnBoarded} =await getUserOnboardingStatus()
 if(isOnBoarded){
  redirect("/dashboard")
 }
  return (
    <div>
      <OnboardingForm industries={industries}/>
    </div>
  )
}

export default  onBoardingPage
