import { getResume } from '@/actions/resume'
import React from 'react'
import ResumeBuilder from './_components/resumeBuilder.jsx';

const resumePage = async() => {
    const resume=await getResume();
  return (
    <div className='container mx-auto'>
      <ResumeBuilder initialContent={resume?.content}/>
    </div>
  )
}

export default resumePage
