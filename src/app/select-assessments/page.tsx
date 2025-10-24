// src/app/select-assessments/page.tsx
"use client";
import { useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { dataManager } from '@/utils/dataManager';

const assessments = [
  { id: 'assessment-1', name: 'Social Skills Assessment' },
  { id: 'assessment-2', name: 'Emotional Awareness Assessment' },
  { id: 'assessment-3', name: 'Stress Management Assessment' },
  { id: 'assessment-4', name: 'Team Dynamics Assessment' },
  { id: 'assessment-5', name: 'Motivation & Goals Assessment' },
  { id: 'assessment-6', name: 'Problem Solving Assessment' },
];

export default function SelectAssessments() {
  const [selectedAssessments, setSelectedAssessments] = useState<string[]>([]);
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

    try {
      console.log("handleProceed - userId:", userId, "Type:", typeof userId);
      await dataManager.updateSelectedAssessments(userId, selectedAssessments.sort());
      const firstAssessment = selectedAssessments.sort()[0];
      console.log("Redirecting to assessment:", firstAssessment, "with userId:", userId);
      router.push(`/assessment/${firstAssessment}?userId=${userId}`);
    } catch (error) {
      console.error("Error in handleProceed:", error);
      alert("Failed to proceed. Please try again.");
    }
  };

  return (
    <div className="min-h-screen p-4">
      <Card className="max-w-4xl mx-auto">
        <CardHeader>
          <CardTitle className="text-2xl">Select Assessments</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4 p-6">
          <div className="space-y-3">
            {assessments.map(a => (
              <div key={a.id} className="flex items-center space-x-3 p-3 border rounded">
                <Checkbox 
                  checked={selectedAssessments.includes(a.id)} 
                  onCheckedChange={() => handleCheckboxChange(a.id)} 
                />
                <Label className="cursor-pointer flex-1">{a.name}</Label>
              </div>
            ))}
          </div>
          <Button 
            onClick={handleProceed} 
            disabled={selectedAssessments.length === 0 || !userId} 
            className="w-full bg-blue-600 text-white"
          >
            Proceed to Assessment ({selectedAssessments.length} selected)
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}