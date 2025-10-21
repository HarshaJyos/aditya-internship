"use client";
import { useState } from 'react';
import { useRouter } from 'next/navigation';
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

  const handleCheckboxChange = (id: string) => {
    setSelectedAssessments(prev => 
      prev.includes(id) ? prev.filter(p => p !== id) : [...prev, id]
    );
  };

  const handleProceed = async () => {
    if (selectedAssessments.length === 0) return;
    
    const consentData = JSON.parse(localStorage.getItem('tempConsentData') || '{}');
    
    // ✅ SAVE TO FIREBASE
    const userId = await dataManager.saveUser({
      name: consentData.name,
      rollNumber: consentData.rollNumber,
      phoneNumber: consentData.phoneNumber,
      counselorName: consentData.counselorName,
      signatureDate: consentData.signatureDate,
      scores: {},
      dateCompleted: new Date().toISOString(),
    });
    
    // ✅ SAVE USER ID TEMP
    localStorage.setItem('tempUserId', userId);
    localStorage.setItem('tempSelectedAssessments', JSON.stringify(selectedAssessments.sort()));
    
    router.push(`/assessment/${selectedAssessments.sort()[0]}`);
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
            disabled={selectedAssessments.length === 0} 
            className="w-full bg-blue-600 text-white"
          >
            Proceed to Assessment ({selectedAssessments.length} selected)
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
