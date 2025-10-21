"use client";
import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import { dataManager, type AssessedUser } from "@/utils/dataManager";
import Image from 'next/image';

import { Card, CardContent, CardTitle } from "@/components/ui/card";
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
  const safeScore = Number.isFinite(score) ? score : 0;
  if (safeScore >= 85) return "Excellent";
  if (safeScore >= 70) return "Good";
  if (safeScore >= 50) return "Needs Improvement";
  return "At Risk";
};

const printStyles = `
  @media print {
    .print-hidden { display: none !important; }
    .print-visible { display: block !important; page-break-inside: avoid; }
    .print-content {
      width: 210mm; margin: 0; padding: 15mm;
      box-shadow: none; border: none;
      font-family: Arial, sans-serif; font-size: 11pt; line-height: 1.4;
    }
    .print-header {
      text-align: center; margin-bottom: 20mm;
      border-bottom: 2px solid #2563eb; padding-bottom: 10mm;
    }
    .print-logo { width: 15mm; height: 15mm; margin: 0 auto 5mm auto; }
    .print-title { font-size: 20pt; font-weight: bold; color: #1f2937; margin: 5mm 0; }
    .print-subtitle { font-size: 16pt; font-weight: bold; color: #2563eb; margin: 2mm 0; }
    .print-section { margin: 8mm 0; page-break-inside: avoid; }
    .print-section-title {
      font-size: 14pt; font-weight: bold; color: #1f2937;
      margin: 6mm 0 3mm 0; border-bottom: 1px solid #d1d5db; padding-bottom: 2mm;
    }
    .print-table { width: 100%; border-collapse: collapse; margin: 5mm 0; }
    .print-table td, .print-table th {
      border: 1px solid #d1d5db; padding: 3mm; text-align: left; vertical-align: top;
    }
    .print-table th { background-color: #f3f4f6; font-weight: bold; }
    .print-page-break { page-break-before: always; }
    .print-consent-text { font-size: 10pt; text-align: justify; margin: 3mm 0; line-height: 1.3; }
    .print-important-text {
      background-color: #fef3c7; padding: 3mm; border-left: 3px solid #f59e0b;
      margin: 3mm 0; font-weight: bold;
    }
    .print-list { margin: 2mm 0 2mm 5mm; }
    .print-list li { margin: 1mm 0; }
    .print-signature-text {
      font-size: 12pt; font-weight: bold; margin: 8mm 0 3mm 0;
      text-align: right; border-top: 1px solid #d1d5db; padding-top: 3mm;
    }
    body { margin: 0; }
  }
`;

export default function Summary() {
  const searchParams = useSearchParams();
  const [user, setUser] = useState<AssessedUser | null>(null);
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    const userId = searchParams.get("userId");
    if (userId) {
      const users = dataManager.getAllUsers();
      const foundUser = users.find(u => u.id === userId);
      setUser(foundUser || null);
      setIsLoaded(true);
      
      localStorage.removeItem("tempConsentData");
      localStorage.removeItem("selectedAssessments");
    }
  }, [searchParams]);

  if (!isLoaded) {
    return <div className="min-h-screen flex items-center justify-center">Loading...</div>;
  }

  if (!user) {
    return <div className="min-h-screen flex items-center justify-center">No data found</div>;
  }

  const selectedAssessments = Object.keys(user.scores);
  const overallScore = Math.round(
    selectedAssessments.reduce((total, id) => total + (user.scores[id]?.normalizedScore || 0), 0) / 
    selectedAssessments.length
  );

  // ✅ FIXED PRINT FUNCTION (SIGNATURE: Name Only)
  const handlePrint = () => {
    const printWindow = window.open("", "", "height=600,width=800");
    if (printWindow) {
      printWindow.document.write(`
        <html>
          <head><title>Complete Summary and Consent Form</title><style>${printStyles}</style></head>
          <body>
            <div class="print-content">
              <!-- HEADER -->
              <div class="print-header">
                <div class="print-logo">
                  <img src="/logo.jpeg" alt="logo" style="width:100%;height:100%;object-fit:contain;" />
                </div>
                <div class="print-title">INFORMED CONSENT & SUMMARY REPORT</div>
                <div class="print-subtitle">ADITYA UNIVERSITY, SURAMPALEM</div>
                <div style="font-size:12pt;font-weight:600;color:#4b5563;">University Counselling Centre</div>
                <div style="font-size:9pt;color:#6b7280;margin-top:2mm;">
                  Surampalem, Andhra Pradesh | (123) 456-7890 | counseling@adityauniversity.edu
                </div>
                <div style="margin-top:3mm;padding:2mm;border:1px solid #2563eb;color:#2563eb;font-weight:bold;display:inline-block;">
                  CONFIDENTIAL DOCUMENT
                </div>
              </div>

              <!-- SUMMARY SECTION -->
              <div class="print-section">
                <div class="print-section-title">Summary Report</div>
                <table class="print-table">
                  <tr><th style="width:25%;">Student Name</th><td>${user.name}</td></tr>
                  <tr><th>Roll Number</th><td>${user.rollNumber}</td></tr>
                  <tr><th>Phone Number</th><td>${user.phoneNumber}</td></tr>
                  <tr><th>Counselor Name</th><td>${user.counselorName}</td></tr>
                  <tr><th>Date</th><td>${user.signatureDate}</td></tr>
                </table>
                
                ${selectedAssessments.length > 0 ? `
                  <div class="print-section-title">Assessment Results Summary</div>
                  <table class="print-table">
                    <thead><tr><th>Assessment Name</th><th style="width:20%;text-align:center;">Score</th><th style="width:30%;">Performance Level</th></tr></thead>
                    <tbody>
                      ${selectedAssessments.map(id => {
                        const score = user.scores[id]?.normalizedScore || 0;
                        const level = getPerformanceLevel(score);
                        return `<tr><td>${assessmentNames[id]}</td><td style="text-align:center;">${score}/100</td><td>${level}</td></tr>`;
                      }).join("")}
                    </tbody>
                  </table>
                  <div class="print-important-text">
                    Note: Scores are normalized to 0-100 scale. Overall Performance: ${overallScore}/100 (${getPerformanceLevel(overallScore)}). For counseling purposes only.
                  </div>
                ` : `
                  <div class="print-consent-text">No assessments completed. Consent form submitted for counseling services only.</div>
                `}
              </div>

              <!-- PAGE BREAK -->
              <div class="print-page-break"></div>

              <!-- FULL CONSENT FORM -->
              <div class="print-section">
                <div class="print-section-title">INFORMED CONSENT FOR COUNSELING SERVICES</div>
                <div class="print-consent-text">
                  At Aditya University, we prioritize both your physical and mental well-being. For your physical health, we have partnered with Apollo, and for your mental well-being, our dedicated student counselors are here to support you. The University Counselling Centre at Surampalem provides a safe and confidential space for all students to explore personal concerns, develop coping strategies, and enhance overall well-being. You can attend multiple counseling sessions as per your wish.
                </div>
                <div class="print-important-text">
                  Please sign this form only if you understand and agree with the information.
                </div>

                <div class="print-section-title">Welcome to Aditya University, Surampalem</div>
                <div class="print-consent-text"><strong>What We Offer:</strong></div>
                <ul class="print-list">
                  <li>Individual counseling sessions</li>
                  <li>Group therapy opportunities</li>
                  <li>Workshops to enhance your skills</li>
                </ul>

                <div class="print-section-title">What is Counseling Support?</div>
                <div class="print-consent-text">
                  Counseling at the University Counselling Centre is a friendly and supportive space where you can share your thoughts, explore personal concerns, and develop strategies to enhance your well-being.
                </div>
                <div class="print-consent-text"><strong>Why It Helps:</strong></div>
                <ul class="print-list">
                  <li>Build confidence and coping skills</li>
                  <li>Navigate academic and personal challenges</li>
                  <li>Feel supported in a safe environment</li>
                </ul>

                <div class="print-section-title">Your Role in Counseling</div>
                <ul class="print-list">
                  <li>Attend sessions at your convenience</li>
                  <li>Share your experiences for tailored support</li>
                  <li>Let your counselor know if you need a different approach</li>
                </ul>

                <div class="print-section-title">Keeping Your Conversations Private</div>
                <div class="print-consent-text">
                  Everything you discuss is kept confidential, creating a safe space for you to open up.
                </div>
                <div class="print-consent-text"><strong>When We May Share:</strong></div>
                <ul class="print-list">
                  <li>If there's risk of harm to you or others</li>
                  <li>With your permission, to university staff</li>
                </ul>

                <!-- ✅ FIXED SIGNATURE - TEXT ONLY -->
                <div class="print-signature-text">
                  Signature: ${user.name}
                </div>
              </div>

              <!-- FOOTER -->
              <div style="margin-top:15mm;text-align:center;font-size:9pt;color:#6b7280;border-top:1px solid #d1d5db;padding-top:5mm;">
                <div><strong>Aditya University Counselling Centre</strong></div>
                <div>Surampalem, Andhra Pradesh | Phone: (123) 456-7890</div>
                <div>Email: counseling@adityauniversity.edu</div>
                <div style="margin-top:2mm;font-weight:bold;">This document contains confidential information</div>
              </div>
            </div>
          </body>
        </html>
      `);
      printWindow.document.close();
      printWindow.print();
    }
  };

  return (
    <div className="min-h-screen p-6 bg-white">
      <style jsx global>{printStyles}</style>
      
      <div className="max-w-4xl mx-auto">
        <Card className="border-0 shadow-none">
          <CardContent className="p-0">
            {/* ✅ SIMPLE SCREEN UI */}
            <div className="text-center py-8 border-b-2 border-gray-200">
              <div className="inline-block w-16 h-16 mb-4">
                <Image src="/logo.jpeg" alt="Logo" width={64} height={64} className="object-contain" />
              </div>
              <CardTitle className="text-2xl font-bold text-gray-800">Summary Report</CardTitle>
              <div className="text-sm text-gray-600 space-y-1 mt-2">
                <p className="text-lg font-semibold text-blue-800">ADITYA UNIVERSITY, SURAMPALEM</p>
                <p className="font-semibold text-gray-700">University Counselling Centre</p>
                <Badge className="mt-2 border-blue-600 text-blue-600 text-xs">Confidential</Badge>
              </div>
            </div>

            {/* ✅ STUDENT INFO - SIMPLE TABLE */}
            <div className="p-6">
              <h3 className="text-lg font-bold text-gray-800 mb-4 border-b pb-2">Student Information</h3>
              <table className="w-full border border-gray-200">
                <tr><td className="border p-3 font-semibold w-1/3">Name:</td><td className="border p-3">{user.name}</td></tr>
                <tr><td className="border p-3 font-semibold">Roll No:</td><td className="border p-3">{user.rollNumber}</td></tr>
                <tr><td className="border p-3 font-semibold">Phone:</td><td className="border p-3">{user.phoneNumber}</td></tr>
                <tr><td className="border p-3 font-semibold">Counselor:</td><td className="border p-3">{user.counselorName}</td></tr>
                <tr><td className="border p-3 font-semibold">Date:</td><td className="border p-3">{user.signatureDate}</td></tr>
              </table>
            </div>

            {/* ✅ SCORES - SIMPLE LIST */}
            {selectedAssessments.length > 0 && (
              <div className="p-6 border-t border-gray-200">
                <h3 className="text-lg font-bold text-gray-800 mb-4 border-b pb-2">Assessment Results</h3>
                <div className="space-y-2">
                  {selectedAssessments.map(id => {
                    const score = user.scores[id]?.normalizedScore || 0;
                    return (
                      <div key={id} className="flex justify-between p-3 border-b">
                        <span className="font-medium">{assessmentNames[id]}:</span>
                        <span className="font-bold">{score}/100 ({getPerformanceLevel(score)})</span>
                      </div>
                    );
                  })}
                </div>
                <div className="mt-4 p-3 bg-yellow-50 border-l-4 border-yellow-400 text-sm">
                  Overall: {overallScore}/100 ({getPerformanceLevel(overallScore)})
                </div>
              </div>
            )}

            {/* ✅ BUTTON - SIMPLE */}
            <div className="p-6 border-t border-gray-200 print-hidden">
              <div className="flex justify-center">
                <Button onClick={handlePrint} className="w-full max-w-xs bg-blue-600 text-white h-10">
                  Print Complete Report
                </Button>
              </div>
              <div className="flex gap-4 justify-center mt-4 text-sm text-gray-600">
                <Button variant="outline" onClick={() => window.location.href = '/'}>New Assessment</Button>
                <Button variant="outline" onClick={() => window.location.href = '/admin'}>Admin View</Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}