"use client";
import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import { dataManager, type AssessedUser } from "@/utils/dataManager";
import Image from 'next/image';

import { Card, CardContent, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

const assessmentNames: Record<string, string> = {
  "assessment-1": "SCARED - Child Anxiety",
  "assessment-2": "Work-Life Balance",
  "assessment-3": "Hamilton Anxiety (HAM-A)",
  "assessment-4": "Hamilton Depression (HDRS)",
  "assessment-5": "Child Behavior Checklist (CBCL)",
  "assessment-6": "Internet Addiction Test (IAT)",
  "assessment-7": "Liebowitz Social Anxiety (LSAS-SR)",
  "assessment-8": "16PF Personality Questionnaire",
};

const getPerformanceLevel = (rawScore: number, assessmentId: string, subscales?: Record<string, number>): string => {
  const safeScore = Number.isFinite(rawScore) ? rawScore : 0;
  switch (assessmentId) {
    case "assessment-1":
      const maxScore = 82;
      const normalized = (safeScore / maxScore) * 100;
      if (subscales) {
        const { panic, general, separation, social, school } = subscales;
        if (panic >= 18 || general >= 13.5 || separation >= 12 || social >= 10.5 || school >= 6) return "High Anxiety";
        if (panic >= 12 || general >= 9 || separation >= 8 || social >= 7 || school >= 4) return "Possible Anxiety";
        return "Normal";
      }
      if (normalized >= 51.7) return "High Anxiety";
      if (normalized >= 30.5) return "Possible Anxiety";
      return "Normal";
    case "assessment-2":
      if (safeScore >= 60) return "Poor Balance";
      if (safeScore >= 45) return "Moderate Balance";
      return "Good Balance";
    case "assessment-3":
      if (safeScore > 30) return "Severe";
      if (safeScore > 24) return "Moderate-Severe";
      if (safeScore > 17) return "Mild-Moderate";
      return "Mild";
    case "assessment-4":
      if (safeScore >= 20) return "Moderate-Severe";
      if (safeScore >= 8) return "Mild";
      return "Normal";
    case "assessment-5":
      if (safeScore >= 180) return "Severe";
      if (safeScore >= 135) return "Moderate";
      if (safeScore >= 68) return "Mild";
      return "Normal";
    case "assessment-6":
      if (safeScore >= 80) return "Severe";
      if (safeScore >= 50) return "Moderate";
      if (safeScore >= 31) return "Mild";
      return "Normal";
    case "assessment-7":
      if (subscales) {
        const { fear, avoidance } = subscales;
        if (fear >= 54 || avoidance >= 54) return "Generalized SAD";
        if (fear >= 36 || avoidance >= 36) return "SAD";
        return "Normal";
      }
      if (safeScore >= 108) return "Generalized SAD";
      if (safeScore >= 72) return "SAD";
      return "Normal";
    case "assessment-8":
      const sten = Math.round(((safeScore / 370) * 10) + 0.5);
      if (sten >= 8) return "High";
      if (sten >= 6) return "Average-High";
      if (sten >= 4) return "Average-Low";
      return "Low";
    default:
      if (safeScore >= 85) return "Excellent";
      if (safeScore >= 70) return "Good";
      if (safeScore >= 50) return "Needs Improvement";
      return "At Risk";
  }
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
    .print-logo { width: 43.5mm; height: 13.8mm; margin: 0 auto 5mm auto; }
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
      dataManager.getUserById(userId).then(setUser).finally(() => setIsLoaded(true));
    } else {
      setIsLoaded(true);
    }
  }, [searchParams]);

  if (!isLoaded) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 to-blue-50">
        <div className="flex flex-col items-center gap-3">
          <div className="w-10 h-10 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
          <p className="text-slate-600 text-sm">Loading summary...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 to-blue-50">
        <div className="text-center">
          <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-slate-200 flex items-center justify-center">
            <svg className="w-8 h-8 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
          </div>
          <p className="text-slate-700 font-medium">No data found</p>
          <p className="text-slate-500 text-sm mt-1">Please check your link and try again</p>
        </div>
      </div>
    );
  }

  const selectedAssessments = Object.keys(user.scores);

  const handlePrint = () => {
    const printWindow = window.open("", "", "height=600,width=800");
    if (printWindow) {
      const logoUrl = process.env.NEXT_PUBLIC_BASE_URL;
      const htmlContent = `
        <html>
          <head><title>Complete Summary and Consent Form</title><style>${printStyles}</style></head>
          <body>
            <div class="print-content">
              <div class="print-header">
                <div class="print-logo">
                  <img src="${logoUrl}" alt="logo" style="width:100%;height:100%;object-fit:contain;" />
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

              <div class="print-section">
                <div class="print-section-title">Summary Report</div>
                <table class="print-table">
                  <tbody>
                    <tr><th style="width:25%;">Student Name</th><td>${user.name}</td></tr>
                    <tr><th>Roll Number</th><td>${user.rollNumber}</td></tr>
                    <tr><th>Phone Number</th><td>${user.phoneNumber}</td></tr>
                    <tr><th>Counselor Name</th><td>${user.counselorName}</td></tr>
                    <tr><th>Date</th><td>${user.signatureDate}</td></tr>
                  </tbody>
                </table>
                
                ${selectedAssessments.length > 0 ? `
                  <div class="print-section-title">Assessment Results Summary</div>
                  <table class="print-table">
                    <thead><tr><th>Assessment Name</th><th style="width:20%;text-align:center;">Raw Score</th><th style="width:30%;">Performance Level</th></tr></thead>
                    <tbody>
                      ${selectedAssessments.map(id => {
                        const score = user.scores[id]?.rawScore || 0;
                        const level = getPerformanceLevel(score, id);
                        return `<tr><td>${assessmentNames[id]}</td><td style="text-align:center;">${score}</td><td>${level}</td></tr>`;
                      }).join("")}
                    </tbody>
                  </table>
                  <div class="print-important-text">
                    Note: Raw scores reflect the total points from the assessment. For counseling purposes.
                  </div>
                ` : `
                  <div class="print-consent-text">No assessments completed. Consent form submitted for counseling services only.</div>
                `}
              </div>

              <div class="print-page-break"></div>

              <div class="print-section">
                <div class="print-section-title">INFORMED CONSENT FOR COUNSELING SERVICES</div>
                <div class="print-consent-text">
                  As a student of Aditya University's Counselling Centre, your well-being is your therapist's top priority. Therapy is a relationship that works, in part, because of clearly defined rights and responsibilities held by each person. Your therapist will use his or her professional judgment to determine your appropriate course of therapy. This consent form helps to create the safety to take risks and the support to become empowered to change. This form is also intended to inform you about your rights as a student, limitations to those rights, and your therapist's corresponding responsibilities.
                </div>
                <div class="print-consent-text">
                  The consent you provide herein will last the entire duration of your treatment unless you revoke or modify your consent in writing. Do not sign this informed consent form unless you completely understand and agree to all aspects. If you have any questions, please bring this form back to your next session, so you and your therapist can go through this document in as much detail as needed.
                </div>

                <div class="print-section-title">Risks and Benefits of Counseling</div>
                <div class="print-consent-text">
                  Counseling can be an effective tool in helping students cope with emotional, relational, and developmental concerns. Counseling provides you with a safe environment to talk about your concerns with a licensed professional trained to provide treatment. The therapeutic relationship is unique because it is highly personal.
                </div>
                <div class="print-consent-text">
                  The benefits of counseling can include helping you develop coping skills, make behavioral changes, reduce symptoms of mental health disorders, improve the quality of your life, learn to manage anger and other emotions, and learn to live in the present, along with other advantages. At the same time, counseling can also be a difficult process. In the course of your treatment, you may experience difficult emotions or encounter unpleasant memories.
                </div>
                <div class="print-consent-text">
                  Ultimately, counseling is not an exact science and your therapist cannot guarantee any specific therapeutic outcome. Your therapist will, however, use his or her professional judgment to provide you with the best treatment possible.
                </div>

                <div class="print-section-title">Student Rights</div>
                <div class="print-consent-text">As a student, you have the right to:</div>
                <ul class="print-list">
                  <li>Be treated with dignity and respect</li>
                  <li>Know your counselor's qualifications and professional experience</li>
                  <li>Expect your counselor to keep your treatment confidential, except as noted further herein</li>
                  <li>Ask questions about your treatment</li>
                  <li>Be informed about diagnoses, treatment philosophy, method, progress, and prognosis</li>
                  <li>Participate in decisions regarding your treatment</li>
                  <li>Obtain any assessment results and have them explained to you in a manner that you understand</li>
                  <li>Refuse treatment methods or recommendations</li>
                  <li>End counseling at any time (though we ask that you please discuss your reason for wanting to end counseling with your counselor)</li>
                  <li>Request a second opinion, referral to another provider, or transfer to another University counselor</li>
                </ul>

                <div class="print-section-title">Student Responsibility</div>
                <div class="print-consent-text">You have responsibility to:</div>
                <ul class="print-list">
                  <li>Maintain your own personal health and safety</li>
                  <li>Take an active role in the counseling process, including honestly sharing your thoughts, feelings, and concerns</li>
                  <li>Help plan and follow through with your therapeutic goals</li>
                  <li>Provide accurate information regarding past and present physical and psychological problems (including hospitalizations, medications, and/or prior treatment)</li>
                  <li>Provide notice of your desire to terminate the counseling relationship before entering into a counseling relationship with another provider</li>
                  <li>Keep scheduled appointments (contact your counselor in advance to cancel and/or reschedule appointments)</li>
                  <li>Inform your counselor if, during the course of treatment, you become aware of any conflicts of interest with another student or University Counselor</li>
                  <li>Promptly notify your counselor of any problems or concerns that render you unable to participate in counseling</li>
                </ul>

                <div class="print-page-break"></div>

                <div class="print-section-title">Confidentiality</div>
                <div class="print-consent-text">
                  The University's professional counselors recognize that confidentiality is essential to an effective counseling relationship. With a few exceptions (noted below), everything you share throughout your counseling treatment, including your identity, is confidential. Further, state and federal laws establish certain rights to confidentiality.
                </div>
                <div class="print-consent-text"><strong>Exceptions to student confidentiality include, but are not limited to:</strong></div>
                <ul class="print-list">
                  <li><strong>Danger to self or others:</strong> If your counselor believes you intend to harm yourself or someone else, your counselor is bound by laws and ethics to take steps to prevent that harm from occurring.</li>
                  <li><strong>Minor status:</strong> If you are a minor (under age 18), your parents or legal guardian(s) have access to your records and discretion over them.</li>
                  <li><strong>Abuse or neglect:</strong> If you disclose abuse or neglect of a child, an elderly person, or anyone who is similarly defenseless, your counselor is required by law to report the abuse.</li>
                  <li><strong>Group counseling:</strong> If you are in a group counseling setting, your counselor must still maintain confidentiality of the group. However, your counselor cannot guarantee that group members will also maintain confidentiality.</li>
                  <li><strong>Legal subpoena:</strong> If a third party issues a lawful subpoena for your records, your counselor may be legally obligated to disclose your records. Your counselor will ensure you are notified of any subpoena and, as required by law, take steps to ensure the records are produced subject to a protective order.</li>
                  <li><strong>University referral:</strong> If you have been referred for counseling by a University administrator, your counselor will report your compliance with counseling to the appropriate university officials.</li>
                  <li><strong>Legal requirements:</strong> If your counselor or the University is required by law to disclose your records, your counselor or the University may disclose information necessary to comply with such law.</li>
                </ul>

                <div class="print-section-title">Crisis Intervention</div>
                <div class="print-consent-text">
                  If you demonstrate that you are a danger to yourself or others, the University or your counselor may need to take steps to place you under Emergency Protective Custody. If that occurs, your counselor and another University employee will transport you to the appropriate medical facility for treatment.
                </div>
                <div class="print-consent-text">
                  With your consent, the University will also contact your professors informing them that you will be absent from class due to a medical issue and that you will contact them at a later date regarding missed assignments. Once you physically return to campus, your counselor will follow up with you regarding any other supportive measures.
                </div>

                <div class="print-section-title">Professional Consultation</div>
                <div class="print-consent-text">
                  From time to time, consistent with his or her ethical obligations, your counselor may consult with other counselors about your treatment. Consultation helps your counselor ensure that he or she is treating you appropriately. However, in the event your counselor becomes aware of a conflict of interest, your counselor will appropriately limit or eliminate such consultation. All counselors involved in the consultation are ethically bound to preserve confidentiality to the same extent as your counselor.
                </div>

                <div class="print-section-title">Discharge Based on Professional Judgment</div>
                <div class="print-consent-text">
                  If your counselor determines that your needs go beyond his or her level of expertise, he or she has an ethical obligation to refer you to another professional who can provide the care you need. This might include, for example, a specialized counselor, medical care provider, psychologist, or psychiatrist.
                </div>
                <div class="print-consent-text">
                  If, based on professional judgment, your counselor determines he or she cannot provide (or continue to provide) treatment to you, your counselor may discontinue treatment and, as appropriate, refer you to another provider. Referrals may be to another University counselor or to an off-campus provider.
                </div>

                <div class="print-section-title">Authorization to Release Student Information</div>
                <div class="print-consent-text">
                  As the student, you may authorize release of your information whenever you choose. For example, if you wish to have your counselor communicate with a professor or University administrator on your behalf, you can sign a release of information form and provide it to your counselor.
                </div>
                <div class="print-consent-text">
                  Please note that your counselor will only provide information as specifically authorized and directed by you. Any additional or ongoing disclosures must be prompted by you or expressly directed in writing on your release form.
                </div>

                <div class="print-important-text">
                  REQUIRED ACKNOWLEDGMENT: You may discuss any of the above with a counselor before signing. I acknowledge that I have read and understand ALL of the above information and I am fully aware of my rights and benefits and risks of counseling. I am also aware of limits to confidentiality. If I have any questions or concerns about any of this information, I agree to discuss these concerns with the counselor.
                </div>

                <div style="margin-top:10mm;">
                  <table class="print-table" style="border:none;">
                    <tr style="border:none;">
                      <td style="border:none;width:50%;padding-bottom:15mm;">
                        <div style="margin-top:8mm;"><strong>Student Signature:</strong></div>
                        <div style="border-bottom:1px solid #000;margin-top:2mm;padding-bottom:1mm;">${user.name}</div>
                      </td>
                      <td style="border:none;width:50%;padding-bottom:15mm;">
                        <div style="margin-top:8mm;"><strong>Date:</strong></div>
                        <div style="border-bottom:1px solid #000;margin-top:2mm;padding-bottom:1mm;">${user.signatureDate}</div>
                      </td>
                    </tr>
                    <tr style="border:none;">
                      <td style="border:none;width:50%;">
                        <div style="margin-top:8mm;"><strong>Counselor Signature:</strong></div>
                        <div style="border-bottom:1px solid #000;margin-top:2mm;padding-bottom:1mm;">${user.counselorName}</div>
                      </td>
                      <td style="border:none;width:50%;">
                        <div style="margin-top:8mm;"><strong>Date:</strong></div>
                        <div style="border-bottom:1px solid #000;margin-top:2mm;padding-bottom:1mm;">${user.signatureDate}</div>
                      </td>
                    </tr>
                  </table>
                </div>
              </div>

              <div style="margin-top:15mm;text-align:center;font-size:9pt;color:#6b7280;border-top:1px solid #d1d5db;padding-top:5mm;">
                <div><strong>Aditya University Counselling Centre</strong></div>
                <div>Surampalem, Andhra Pradesh | Phone: (123) 456-7890</div>
                <div>Email: counseling@adityauniversity.edu</div>
                <div style="margin-top:2mm;font-weight:bold;">This document contains confidential information</div>
              </div>
            </div>
          </body>
        </html>
      `;
      printWindow.document.write(htmlContent);
      printWindow.document.close();
      setTimeout(() => printWindow.print(), 1000);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-slate-50 py-8 px-4">
      <style jsx global>{printStyles}</style>
      
      <div className="max-w-3xl mx-auto">
        <Card className="border-0 shadow-lg bg-white/95 backdrop-blur">
          <CardContent className="p-0">
            {/* Header Section */}
            <div className="relative overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-br from-blue-600 to-blue-700 opacity-95"></div>
              <div className="relative text-center py-12 px-6">
                <div className="inline-flex items-center justify-center w-20 h-20 mb-5 rounded-2xl bg-white/95 shadow-xl">
                  <Image src="/logo.jpeg" alt="Logo" width={64} height={64} className="object-contain rounded-xl" />
                </div>
                <CardTitle className="text-3xl font-bold text-white mb-3">Summary Report</CardTitle>
                <div className="space-y-2">
                  <p className="text-lg font-semibold text-blue-50">ADITYA UNIVERSITY, SURAMPALEM</p>
                  <p className="text-sm font-medium text-blue-100">University Counselling Centre</p>
                  <Badge className="mt-3 bg-white/20 border-white/30 text-white backdrop-blur px-3 py-1">
                    Confidential Document
                  </Badge>
                </div>
              </div>
            </div>

            {/* Student Information Section */}
            <div className="p-8">
              <div className="flex items-center gap-2 mb-6">
                <div className="w-1 h-6 bg-blue-600 rounded-full"></div>
                <h3 className="text-xl font-bold text-slate-800">Student Information</h3>
              </div>
              
              <div className="grid gap-4">
                <div className="flex items-center p-4 rounded-xl bg-slate-50 border border-slate-100 hover:border-blue-200 transition-colors">
                  <span className="text-sm font-semibold text-slate-600 w-32">Name</span>
                  <span className="text-slate-900 font-medium">{user.name}</span>
                </div>
                <div className="flex items-center p-4 rounded-xl bg-slate-50 border border-slate-100 hover:border-blue-200 transition-colors">
                  <span className="text-sm font-semibold text-slate-600 w-32">Roll Number</span>
                  <span className="text-slate-900 font-medium">{user.rollNumber}</span>
                </div>
                <div className="flex items-center p-4 rounded-xl bg-slate-50 border border-slate-100 hover:border-blue-200 transition-colors">
                  <span className="text-sm font-semibold text-slate-600 w-32">Phone</span>
                  <span className="text-slate-900 font-medium">{user.phoneNumber}</span>
                </div>
                <div className="flex items-center p-4 rounded-xl bg-slate-50 border border-slate-100 hover:border-blue-200 transition-colors">
                  <span className="text-sm font-semibold text-slate-600 w-32">Counselor</span>
                  <span className="text-slate-900 font-medium">{user.counselorName}</span>
                </div>
                <div className="flex items-center p-4 rounded-xl bg-slate-50 border border-slate-100 hover:border-blue-200 transition-colors">
                  <span className="text-sm font-semibold text-slate-600 w-32">Date</span>
                  <span className="text-slate-900 font-medium">{user.signatureDate}</span>
                </div>
              </div>
            </div>

            {/* Assessment Results Section */}
            {selectedAssessments.length > 0 && (
              <div className="px-8 pb-8">
                <div className="flex items-center gap-2 mb-6">
                  <div className="w-1 h-6 bg-blue-600 rounded-full"></div>
                  <h3 className="text-xl font-bold text-slate-800">Assessment Results</h3>
                </div>
                
                <div className="space-y-3">
                  {selectedAssessments.map(id => {
                    const score = user.scores[id]?.rawScore || 0;
                    const level = getPerformanceLevel(score, id);
                    return (
                      <div key={id} className="group p-5 rounded-xl bg-gradient-to-r from-slate-50 to-blue-50 border border-slate-200 hover:shadow-md transition-all">
                        <div className="flex items-center justify-between">
                          <span className="font-medium text-slate-700 text-sm">{assessmentNames[id]}</span>
                          <div className="flex items-center gap-3">
                            <span className="text-2xl font-bold text-blue-600">{score}</span>
                            <Badge className="bg-blue-100 text-blue-700 border-0 px-3 py-1">
                              {level}
                            </Badge>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Actions Section */}
            <div className="p-8 bg-slate-50 border-t border-slate-200 print-hidden">
              <Button 
                onClick={handlePrint} 
                className="w-full bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white h-12 rounded-xl font-semibold shadow-lg hover:shadow-xl transition-all"
              >
                <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" />
                </svg>
                Print Complete Report
              </Button>
              
              <div className="flex gap-3 mt-4">
                <Button 
                  variant="outline" 
                  onClick={() => window.location.href = '/'}
                  className="flex-1 h-11 rounded-xl border-slate-300 hover:bg-slate-100 font-medium"
                >
                  New Assessment
                </Button>
                <Button 
                  variant="outline" 
                  onClick={() => window.location.href = '/admin'}
                  className="flex-1 h-11 rounded-xl border-slate-300 hover:bg-slate-100 font-medium"
                >
                  Admin View
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}