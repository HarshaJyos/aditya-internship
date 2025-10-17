"use client";
import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

const assessmentNames: Record<string, string> = {
  "assessment-1": "Social Skills",
  "assessment-2": "Emotional Awareness", 
  "assessment-3": "Stress Management",
  "assessment-4": "Team Dynamics",
  "assessment-5": "Motivation & Goals",
  "assessment-6": "Problem Solving",
};

const getPerformanceLevel = (score: number) => {
  if (score >= 80) return "Excellent";
  if (score >= 60) return "Good";
  if (score >= 40) return "Average";
  return "Needs Improvement";
};

export default function Summary() {
  const searchParams = useSearchParams();
  const [scores, setScores] = useState<Record<string, any>>({});
  const [userCount, setUserCount] = useState(0);

  useEffect(() => {
    const storedScores = JSON.parse(localStorage.getItem("assessmentScores") || "{}");
    setScores(storedScores);
    
    let count = parseInt(localStorage.getItem('userCount') || '0');
    count += 1;
    localStorage.setItem('userCount', count.toString());
    setUserCount(count);
    
    localStorage.removeItem("assessmentScores");
    localStorage.removeItem("consentData");
  }, []);

  const consentData = {
    name: searchParams.get("name") || "Not Provided",
    rollNumber: searchParams.get("rollNumber") || "Not Provided",
    phoneNumber: searchParams.get("phoneNumber") || "Not Provided",
    counselorName: searchParams.get("counselorName") || "Not Provided",
    signatureDate: searchParams.get("signatureDate") || "Not Provided",
  };

  const hasAssessment = searchParams.get("hasAssessment") === "true";
  const selectedAssessments = searchParams.get("selectedAssessments")?.split(",") || [];

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="min-h-screen p-4 print:p-2">
      <style jsx global>{`
        @media print {
          body { font-size: 12pt; }
          .no-print { display: none; }
        }
      `}</style>
      
      <Card className="max-w-4xl mx-auto">
        <CardHeader>
          <CardTitle className="text-2xl">Assessment Summary Report</CardTitle>
          <div className="flex justify-between items-center">
            <p>Total Patients Assessed: {userCount}</p>
            <Badge className="no-print">Confidential</Badge>
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div><strong>Name:</strong> {consentData.name}</div>
            <div><strong>ID:</strong> {consentData.rollNumber}</div>
            <div><strong>Phone:</strong> {consentData.phoneNumber}</div>
            <div><strong>Psychologist:</strong> {consentData.counselorName}</div>
            <div><strong>Date:</strong> {consentData.signatureDate}</div>
          </div>

          {hasAssessment && selectedAssessments.length > 0 && (
            <div>
              <h3 className="font-bold text-lg mb-4">Assessment Results</h3>
              <div className="space-y-2">
                {selectedAssessments.map(id => {
                  const scoreData = scores[id];
                  const score = scoreData?.normalizedScore || 0;
                  return (
                    <div key={id} className="flex justify-between p-3 border rounded">
                      <span>{assessmentNames[id]}</span>
                      <div className="text-right">
                        <div><strong>{score}/100</strong></div>
                        <div>{getPerformanceLevel(score)}</div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {!hasAssessment && (
            <div className="text-center p-8 border-dashed border-2 rounded">
              Consent form completed. No assessments taken.
            </div>
          )}

          <div className="no-print flex justify-center space-x-4 pt-6 border-t">
            <Button onClick={handlePrint} className="bg-blue-600 text-white">
              Print Report
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}