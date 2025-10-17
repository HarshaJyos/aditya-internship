"use client";
import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";

const assessmentNames: Record<string, string> = {
  "assessment-1": "Social Skills",
  "assessment-2": "Emotional Awareness", 
  "assessment-3": "Stress Management",
  "assessment-4": "Team Dynamics",
  "assessment-5": "Motivation & Goals",
  "assessment-6": "Problem Solving",
};

const getPerformanceLevel = (score: number) => {
  if (score >= 80) return { label: "Excellent", color: "bg-green-100 text-green-800 border-green-200" };
  if (score >= 60) return { label: "Good", color: "bg-blue-100 text-blue-800 border-blue-200" };
  if (score >= 40) return { label: "Average", color: "bg-yellow-100 text-yellow-800 border-yellow-200" };
  return { label: "Needs Improvement", color: "bg-red-100 text-red-800 border-red-200" };
};

export default function Summary() {
  const searchParams = useSearchParams();
  const [scores, setScores] = useState<Record<string, any>>({});
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => {
      const storedScores = JSON.parse(localStorage.getItem("assessmentScores") || "{}");
      setScores(storedScores);
      setIsLoaded(true);
      
      // Clear for next user
      localStorage.removeItem("assessmentScores");
      localStorage.removeItem("consentData");
    }, 100);
    
    return () => clearTimeout(timer);
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

  // ✅ CALCULATE OVERALL SCORE
  const overallScore = selectedAssessments.length > 0 
    ? Math.round(
        selectedAssessments.reduce((total, id) => {
          const score = scores[id]?.normalizedScore || 0;
          return total + score;
        }, 0) / selectedAssessments.length
      )
    : 0;

  if (!isLoaded) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-lg text-blue-800">Loading Results...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen p-4 print:p-2 bg-gradient-to-br from-blue-50 to-indigo-100">
      <style jsx global>{`
        @media print {
          body { font-size: 12pt; }
          .no-print { display: none; }
          .bg-gradient-to-br { background: white !important; }
        }
      `}</style>
      
      <Card className="max-w-4xl mx-auto shadow-xl">
        <CardHeader className="text-center">
          <CardTitle className="text-3xl font-bold text-blue-800">
            🎉 Assessment Summary Report
          </CardTitle>
          <Badge className="no-print bg-red-100 text-red-800 mt-2">Confidential</Badge>
        </CardHeader>
        
        <CardContent className="space-y-6">
          {/* ✅ STUDENT INFO */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-4 bg-white rounded-lg shadow-sm">
            <div><strong>Name:</strong> {consentData.name}</div>
            <div><strong>Roll No:</strong> {consentData.rollNumber}</div>
            <div><strong>Phone:</strong> {consentData.phoneNumber}</div>
            <div><strong>Counselor:</strong> {consentData.counselorName}</div>
            <div><strong>Date:</strong> {consentData.signatureDate}</div>
          </div>

          {hasAssessment && selectedAssessments.length > 0 && isLoaded && (
            <>
              {/* ✅ OVERALL SCORE CARD */}
              <div className="text-center p-6 bg-white rounded-lg shadow-sm border">
                <h3 className="text-2xl font-bold text-gray-800 mb-3">Overall Performance</h3>
                <Progress value={overallScore} className="w-full h-4 mb-3" />
                <div className="text-4xl font-bold text-blue-600 mb-2">{overallScore}%</div>
                <Badge className={`${getPerformanceLevel(overallScore).color} text-lg px-4 py-2`}>
                  {getPerformanceLevel(overallScore).label}
                </Badge>
              </div>

              {/* ✅ INDIVIDUAL ASSESSMENT CARDS */}
              <div>
                <h3 className="font-bold text-xl mb-6 text-center text-blue-800">Detailed Results</h3>
                <div className="space-y-4">
                  {selectedAssessments.map(id => {
                    const scoreData = scores[id];
                    const score = scoreData?.normalizedScore || 0;
                    const level = getPerformanceLevel(score);
                    return (
                      <Card key={id} className="shadow-sm border">
                        <CardContent className="p-6">
                          <div className="flex justify-between items-center">
                            <div className="flex-1">
                              <h4 className="font-semibold text-lg text-gray-800 mb-2">
                                {assessmentNames[id]}
                              </h4>
                              <Progress value={score} className="w-full h-3 mb-2" />
                            </div>
                            <div className="text-right ml-4">
                              <div className="text-2xl font-bold text-blue-600 mb-1">
                                {score}/100
                              </div>
                              <Badge className={`${level.color} px-3 py-1`}>
                                {level.label}
                              </Badge>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    );
                  })}
                </div>
              </div>
            </>
          )}

          {!hasAssessment && (
            <div className="text-center p-8 border-2 border-dashed border-gray-300 rounded-lg bg-gray-50">
              <h3 className="text-xl font-semibold mb-2 text-gray-700">Consent Completed</h3>
              <p className="text-gray-600">No assessments taken yet.</p>
            </div>
          )}

          {/* ✅ ACTION BUTTONS */}
          <div className="no-print flex flex-col sm:flex-row gap-4 justify-center pt-6 border-t bg-white rounded-lg p-4">
            <Button onClick={handlePrint} className="bg-blue-600 text-white flex-1">
              🖨️ Print Report
            </Button>
            <Link href="/">
              <Button variant="outline" className="flex-1">
                ← New Assessment
              </Button>
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}