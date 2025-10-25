// src/app/select-assessments/page.tsx
"use client";
import { Suspense, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { dataManager } from '@/utils/dataManager';

const assessments = [
  { id: 'assessment-1', name: 'Screen for Child Anxiety Related Disorders (SCARED)' },
  { id: 'assessment-2', name: 'Work-Life Balance Scale' },
  { id: 'assessment-3', name: 'Hamilton Anxiety Rating Scale (HAM-A)' },
  { id: 'assessment-4', name: 'Hamilton Depression Rating Scale (HDRS)' },
  { id: 'assessment-5', name: 'Child Behavior Checklist (CBCL)' },
  { id: 'assessment-6', name: 'Internet Addiction Test (IAT)' },
  { id: 'assessment-7', name: 'Liebowitz Social Anxiety Scale (LSAS-SR)' },
  { id: 'assessment-8', name: '16PF Questionnaire' },
];

function SelectAssessmentsContent() {
  const [selectedAssessments, setSelectedAssessments] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();
  const searchParams = useSearchParams();
  const userId = searchParams.get('userId');

  const handleCheckboxChange = (id: string) => {
    setSelectedAssessments(prev => 
      prev.includes(id) ? prev.filter(p => p !== id) : [...prev, id]
    );
  };

  const handleProceed = async () => {
    if (selectedAssessments.length === 0 || !userId) {
      console.error("Cannot proceed: No assessments selected or missing userId", {
        userId,
        selectedAssessments,
      });
      alert("Please select at least one assessment and ensure a valid user ID is provided.");
      return;
    }

    setIsLoading(true);
    try {
      console.log("handleProceed - userId:", userId, "Type:", typeof userId);
      await dataManager.updateSelectedAssessments(userId, selectedAssessments.sort());
      const firstAssessment = selectedAssessments.sort()[0];
      console.log("Redirecting to assessment:", firstAssessment, "with userId:", userId);
      router.push(`/assessment/${firstAssessment}?userId=${userId}`);
    } catch (error) {
      console.error("Error in handleProceed:", error);
      alert("Failed to proceed. Please try again.");
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50 p-4 py-8">
      <Card className="max-w-4xl mx-auto shadow-xl border-0 bg-white/80 backdrop-blur">
        <CardHeader className="bg-gradient-to-r from-indigo-600 to-purple-600 text-white p-4 gap-1 rounded-t-lg">
          <CardTitle className="text-3xl font-bold">Select Your Assessments</CardTitle>
          <p className="text-indigo-100 mt-2">Choose one or more assessments to begin</p>
        </CardHeader>
        <CardContent className="space-y-4 p-6">
          <div className="space-y-3">
            {assessments.map(a => {
              const isSelected = selectedAssessments.includes(a.id);
              return (
                <div 
                  key={a.id} 
                  onClick={() => !isLoading && handleCheckboxChange(a.id)}
                  className={`
                    flex items-center space-x-4 p-4 rounded-lg border-2 
                    transition-all duration-200 
                    ${isLoading ? 'cursor-not-allowed opacity-60' : 'cursor-pointer'}
                    ${isSelected 
                      ? 'border-indigo-500 bg-indigo-50 shadow-md scale-[1.02]' 
                      : 'border-gray-200 bg-white hover:border-indigo-300 hover:shadow-sm hover:bg-indigo-50/30'
                    }
                  `}
                >
                  <Checkbox 
                    checked={isSelected} 
                    onCheckedChange={() => !isLoading && handleCheckboxChange(a.id)}
                    disabled={isLoading}
                    className="pointer-events-none"
                  />
                  <span className={`flex-1 font-medium ${isSelected ? 'text-indigo-900' : 'text-gray-700'}`}>
                    {a.name}
                  </span>
                </div>
              );
            })}
          </div>
          <Button 
            onClick={handleProceed} 
            disabled={selectedAssessments.length === 0 || !userId || isLoading} 
            className="w-full bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white font-semibold py-6 text-lg shadow-lg disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
          >
            {isLoading ? (
              <span className="flex items-center justify-center gap-2">
                <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Loading...
              </span>
            ) : (
              `Proceed to Assessment (${selectedAssessments.length} selected)`
            )}
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}

export default function SelectAssessments() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50 flex items-center justify-center">
        <div className="text-center">
          <svg className="animate-spin h-8 w-8 text-indigo-600 mx-auto" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
          <p className="mt-2 text-gray-600">Loading...</p>
        </div>
      </div>
    }>
      <SelectAssessmentsContent />
    </Suspense>
  );
}