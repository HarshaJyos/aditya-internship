"use client";
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';

const assessments = [
  { id: 'assessment-1', name: 'Social Skills' },
  { id: 'assessment-2', name: 'Emotional Awareness' },
  { id: 'assessment-3', name: 'Stress Management' },
  { id: 'assessment-4', name: 'Team Dynamics' },
  { id: 'assessment-5', name: 'Motivation and Goals' },
  { id: 'assessment-6', name: 'Problem Solving' },
];

export default function SelectAssessments() {
  const [selectedAssessments, setSelectedAssessments] = useState<string[]>([]);
  const router = useRouter();

  const handleCheckboxChange = (id: string) => {
    setSelectedAssessments(prev => prev.includes(id) ? prev.filter(p => p !== id) : [...prev, id]);
  };

  const handleProceed = () => {
    if (selectedAssessments.length === 0) return;
    const sorted = [...selectedAssessments].sort();
    const consentData = JSON.parse(localStorage.getItem('consentData') || '{}');
    const query = new URLSearchParams({
      ...consentData,
      selectedAssessments: sorted.join(','),
      currentAssessmentIndex: '0',
      numAssessments: sorted.length.toString(),
    }).toString();
    router.push(`/assessment/${sorted[0]}?${query}`);
  };

  return (
    <div className="min-h-screen p-4">
      <Card className="max-w-4xl mx-auto">
        <CardHeader>
          <CardTitle>Select Assessments</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {assessments.map(a => (
            <div key={a.id} className="flex items-center space-x-2">
              <Checkbox checked={selectedAssessments.includes(a.id)} onCheckedChange={() => handleCheckboxChange(a.id)} />
              <span>{a.name}</span>
            </div>
          ))}
          <Button onClick={handleProceed} disabled={selectedAssessments.length === 0} className="bg-blue-600 text-white">
            Proceed
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}