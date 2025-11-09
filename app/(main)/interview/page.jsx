import React from 'react';
import PerformanceChart from './_components/performance-Chart';
import QuizList from './_components/quiz-List';
import StatsCards from './_components/stats-card';
import { getAssessments } from '@/actions/interview';

const InterviewPage = async () => {
  const assessments = await getAssessments(); // ✅ Correct spelling

  return (
    <div>
      <h1 className="text-6xl font-bold gradient-title mb-5">
        Interview Preparation
      </h1>
      <div className='space-y-6'>
        <StatsCards assessments={assessments} />        {/* ✅ Fixed prop */}
        <PerformanceChart assessments={assessments} />  {/* ✅ Fixed prop */}
        <QuizList assessments={assessments} />          {/* ✅ Fixed prop */}
      </div>
    </div>
  );
};

export default InterviewPage;
