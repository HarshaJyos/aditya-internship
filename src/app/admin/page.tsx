"use client";
import { useEffect, useState, useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  RefreshCw,
  Printer,
  RotateCcw,
  Trash2,
  LogOut,
  AlertTriangle,
} from "lucide-react";
import { dataManager } from "@/utils/dataManager";

type AssessedUser = {
  id: string;
  name: string;
  rollNumber: string;
  phoneNumber: string;
  counselorName: string;
  signatureDate: string;
  dateCompleted: string;
  scores: Record<
    string,
    { rawScore: number; subscales?: Record<string, number> }
  >;
};

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

const getPerformanceLevel = (
  rawScore: number,
  assessmentId: string,
  subscales?: Record<string, number>
): string => {
  const safeScore = Number.isFinite(rawScore) ? rawScore : 0;
  switch (assessmentId) {
    case "assessment-1": // SCARED
      const maxScore = 82; // 41 * 2
      const normalized = (safeScore / maxScore) * 100;
      if (subscales) {
        const { panic, general, separation, social, school } = subscales;
        if (
          panic >= 18 ||
          general >= 13.5 ||
          separation >= 12 ||
          social >= 10.5 ||
          school >= 6
        )
          return "High Anxiety";
        if (
          panic >= 12 ||
          general >= 9 ||
          separation >= 8 ||
          social >= 7 ||
          school >= 4
        )
          return "Possible Anxiety";
        return "Normal";
      }
      if (normalized >= 51.7) return "High Anxiety"; // ~42/82 * 100
      if (normalized >= 30.5) return "Possible Anxiety"; // ~25/82 * 100
      return "Normal";
    case "assessment-2": // Work-Life Balance
      if (safeScore >= 60) return "Poor Balance"; // 80% of 75
      if (safeScore >= 45) return "Moderate Balance"; // 60% of 75
      return "Good Balance";
    case "assessment-3": // HAM-A
      if (safeScore > 30) return "Severe";
      if (safeScore > 24) return "Moderate-Severe";
      if (safeScore > 17) return "Mild-Moderate";
      return "Mild";
    case "assessment-4": // HDRS
      if (safeScore >= 20) return "Moderate-Severe";
      if (safeScore >= 8) return "Mild";
      return "Normal";
    case "assessment-5": // CBCL
      if (safeScore >= 180) return "Severe"; // 80% of 226
      if (safeScore >= 135) return "Moderate"; // 60% of 226
      if (safeScore >= 68) return "Mild"; // 30% of 226
      return "Normal";
    case "assessment-6": // IAT
      if (safeScore >= 80) return "Severe";
      if (safeScore >= 50) return "Moderate";
      if (safeScore >= 31) return "Mild";
      return "Normal";
    case "assessment-7": // LSAS-SR
      if (subscales) {
        const { fear, avoidance } = subscales;
        if (fear >= 54 || avoidance >= 54) return "Generalized SAD"; // 75% of 72
        if (fear >= 36 || avoidance >= 36) return "SAD"; // 50% of 72
        return "Normal";
      }
      if (safeScore >= 108) return "Generalized SAD"; // 75% of 144
      if (safeScore >= 72) return "SAD"; // 50% of 144
      return "Normal";
    case "assessment-8": // 16PF
      const sten = Math.round((safeScore / 370) * 10 + 0.5); // Simplified Sten approximation
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

const levelColors: Record<string, string> = {
  Normal: "bg-green-100 text-green-800 border-green-300",
  Mild: "bg-blue-100 text-blue-800 border-blue-300",
  "Mild-Moderate": "bg-yellow-100 text-yellow-800 border-yellow-300",
  Moderate: "bg-orange-100 text-orange-800 border-orange-300",
  "Moderate-Severe": "bg-orange-100 text-orange-800 border-orange-300",
  Severe: "bg-red-100 text-red-800 border-red-300",
  "Possible Anxiety": "bg-yellow-100 text-yellow-800 border-yellow-300",
  "High Anxiety": "bg-red-100 text-red-800 border-red-300",
  SAD: "bg-orange-100 text-orange-800 border-orange-300",
  "Generalized SAD": "bg-red-100 text-red-800 border-red-300",
  "Good Balance": "bg-green-100 text-green-800 border-green-300",
  "Moderate Balance": "bg-yellow-100 text-yellow-800 border-yellow-300",
  "Poor Balance": "bg-red-100 text-red-800 border-red-300",
  High: "bg-green-100 text-green-800 border-green-300",
  "Average-High": "bg-blue-100 text-blue-800 border-blue-300",
  "Average-Low": "bg-yellow-100 text-yellow-800 border-yellow-300",
  Low: "bg-orange-100 text-orange-800 border-orange-300",
  Excellent: "bg-green-100 text-green-800 border-green-300",
  Good: "bg-blue-100 text-blue-800 border-blue-300",
  "Needs Improvement": "bg-yellow-100 text-yellow-800 border-yellow-300",
  "At Risk": "bg-red-100 text-red-800 border-red-300",
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

export default function AdminPage() {
  const [users, setUsers] = useState<AssessedUser[]>([]);
  const [filterCounselor, setFilterCounselor] = useState<string>("all");
  const [filterLevel, setFilterLevel] = useState<string>("all");
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [filterScoreMin, setFilterScoreMin] = useState<number | undefined>(
    undefined
  );
  const [filterScoreMax, setFilterScoreMax] = useState<number | undefined>(
    undefined
  );
  const [password, setPassword] = useState<string>("");
  const [error, setError] = useState<string>("");
  const [isLoading, setIsLoading] = useState<boolean>(false);

  useEffect(() => {
    const authStatus = sessionStorage.getItem("adminAuthenticated");
    if (authStatus === "true") {
      setIsAuthenticated(true);
    }
  }, []);

  useEffect(() => {
    if (isAuthenticated) {
      dataManager
        .getAllUsers()
        .then((loadedUsers) => {
          const validUsers = loadedUsers.filter(
            (user) => user.id && typeof user.id === "string"
          );
          setUsers(validUsers);
        })
        .catch((error) => {
          console.error("Error loading users:", error);
        });
    }
  }, [isAuthenticated]);

  const uniqueCounselors = useMemo(() => {
    return Array.from(new Set(users.map((user) => user.counselorName))).sort();
  }, [users]);

  const filteredUsers = useMemo(() => {
    return users.filter((user) => {
      const selectedAssessments = Object.keys(user.scores);
      const overallScore =
        selectedAssessments.length > 0
          ? Math.round(
              selectedAssessments.reduce(
                (sum, id) => sum + (user.scores[id]?.rawScore || 0),
                0
              ) / selectedAssessments.length
            )
          : 0;

      const userLevel = getPerformanceLevel(overallScore, "");

      return (
        (filterCounselor === "all" || user.counselorName === filterCounselor) &&
        (filterLevel === "all" || userLevel === filterLevel) &&
        (filterScoreMin === undefined || overallScore >= filterScoreMin) &&
        (filterScoreMax === undefined || overallScore <= filterScoreMax)
      );
    });
  }, [users, filterCounselor, filterLevel, filterScoreMin, filterScoreMax]);

  const handlePrintAll = () => {
    const printWindow = window.open("", "", "height=800,width=1000");
    if (printWindow) {
      const logoUrl = process.env.NEXT_PUBLIC_BASE_URL;

      let content = `<html><head><title>All Reports</title><style>${printStyles}</style></head><body><div class="print-content">`;
      filteredUsers.forEach((user, index) => {
        content += `
          ${index > 0 ? '<div class="print-page-break"></div>' : ""}
          <div class="print-section">
            <div class="print-header">
              <div class="print-logo">
                  <img src="${logoUrl}" alt="logo" style="width:100%;height:100%;object-fit:contain;" />
                </div>
              <div class="print-title">INFORMED CONSENT & SUMMARY REPORT</div>
              <div class="print-subtitle">ADITYA UNIVERSITY, SURAMPALEM</div>
              <div style="font-size:12pt;font-weight:600;color:#4b5563;">University Counselling Centre</div>
            </div>
            <div class="print-section-title">Summary Report</div>
            <table class="print-table">
              <tr><th>Student Name</th><td>${user.name}</td></tr>
              <tr><th>Roll Number</th><td>${user.rollNumber}</td></tr>
              <tr><th>Phone Number</th><td>${user.phoneNumber}</td></tr>
              <tr><th>Counselor Name</th><td>${user.counselorName}</td></tr>
              <tr><th>Date</th><td>${user.signatureDate}</td></tr>
            </table>
            <div class="print-section-title">Assessment Results</div>
            <table class="print-table">
              <thead><tr><th>Assessment</th><th style="text-align:center;">Raw Score</th><th>Level</th></tr></thead>
              <tbody>${Object.entries(user.scores)
                .map(
                  ([id, scoreData]) =>
                    `<tr><td>${
                      assessmentNames[id] || id
                    }</td><td style="text-align:center;">${
                      scoreData.rawScore
                    }</td><td>${getPerformanceLevel(
                      scoreData.rawScore,
                      id,
                      scoreData.subscales
                    )}</td></tr>`
                )
                .join("")}</tbody>
            </table>
            <div class="print-important-text">
              Note: Raw scores reflect the total points from the assessment. For counseling purposes.
            </div>
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
        `;
      });
      content += `</body></html>`;
      printWindow.document.write(content);
      printWindow.document.close();
      setTimeout(() => printWindow.print(), 1000);
    }
  };

  const handlePrintSingle = (user: AssessedUser) => {
    const printWindow = window.open("", "", "height=600,width=800");
    if (printWindow) {
      const logoUrl = process.env.NEXT_PUBLIC_BASE_URL;

      printWindow.document.write(`
        <html><head><title>Report</title><style>${printStyles}</style></head>
        <body><div class="print-content">
          <div class="print-header">
                <div class="print-logo">
                  <img src="${logoUrl}" alt="logo" style="width:100%;height:100%;object-fit:contain;" />
                </div>            <div class="print-title">INFORMED CONSENT & SUMMARY REPORT</div>
            <div class="print-subtitle">ADITYA UNIVERSITY, SURAMPALEM</div>
            <div style="font-size:12pt;font-weight:600;color:#4b5563;">University Counselling Centre</div>
          </div>
          <div class="print-section">
            <div class="print-section-title">Summary Report</div>
            <table class="print-table">
              <tr><th style="width:25%;">Student Name</th><td>${
                user.name
              }</td></tr>
              <tr><th>Roll Number</th><td>${user.rollNumber}</td></tr>
              <tr><th>Phone Number</th><td>${user.phoneNumber}</td></tr>
              <tr><th>Counselor Name</th><td>${user.counselorName}</td></tr>
              <tr><th>Date</th><td>${user.signatureDate}</td></tr>
            </table>
            <div class="print-section-title">Assessment Results</div>
            <table class="print-table">
              <thead><tr><th>Assessment</th><th style="text-align:center;">Raw Score</th><th>Level</th></tr></thead>
              <tbody>${Object.entries(user.scores)
                .map(
                  ([id, s]) =>
                    `<tr><td>${
                      assessmentNames[id] || id
                    }</td><td style="text-align:center;">${
                      s.rawScore
                    }</td><td>${getPerformanceLevel(
                      s.rawScore,
                      id,
                      s.subscales
                    )}</td></tr>`
                )
                .join("")}</tbody>
            </table>
            <div class="print-important-text">
              Note: Raw scores reflect the total points from the assessment. For counseling purposes.
            </div>
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
        </div></body></html>`);
      printWindow.document.close();
      setTimeout(() => printWindow.print(), 1000);
    }
  };

  const handleRefresh = async () => {
    try {
      const loadedUsers = await dataManager.getAllUsers();
      const validUsers = loadedUsers.filter(
        (user) => user.id && typeof user.id === "string"
      );
      setUsers(validUsers);
    } catch (error) {
      console.error("Error refreshing users:", error);
    }
  };

  const handleClearAll = () => {
    if (confirm("Clear ALL data forever?")) {
      dataManager
        .clearAll()
        .then(() => {
          setUsers([]);
        })
        .catch((error) => {
          console.error("Error clearing data:", error);
        });
    }
  };

  const handleResetFilters = () => {
    setFilterCounselor("all");
    setFilterLevel("all");
    setFilterScoreMin(undefined);
    setFilterScoreMax(undefined);
  };

  const handlePasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");

    try {
      const response = await fetch("/api/verify-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password }),
      });
      const data = await response.json();

      if (data.success) {
        setIsAuthenticated(true);
        sessionStorage.setItem("adminAuthenticated", "true");
        setPassword("");
      } else {
        setError(data.error || "Incorrect password");
      }
    } catch (error) {
      console.error("Error verifying password:", error);
      setError("Failed to verify password. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100 p-4">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle className="text-2xl font-bold text-center text-gray-800">
              Admin Access
            </CardTitle>
            <p className="text-center text-sm text-gray-600">
              Enter the admin password to access the dashboard
            </p>
          </CardHeader>
          <CardContent>
            <form onSubmit={handlePasswordSubmit} className="space-y-4">
              <div>
                <label className="text-sm font-medium text-gray-600 mb-1 block">
                  Password
                </label>
                <Input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter admin password"
                  className="h-10"
                  disabled={isLoading}
                />
              </div>
              {error && (
                <Alert variant="destructive">
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}
              <Button
                type="submit"
                className="w-full bg-blue-600 hover:bg-blue-700"
                disabled={isLoading || !password}
              >
                {isLoading ? "Verifying..." : "Submit"}
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen p-4 bg-white">
      <style dangerouslySetInnerHTML={{ __html: printStyles }} />
      <Card className="max-w-full">
        <CardHeader className="text-center border-b">
          <CardTitle className="text-xl font-bold text-gray-800">
            Admin Dashboard
          </CardTitle>
          <div className="text-sm text-gray-600 mb-2">
            📊 Total: <span className="font-semibold">{users.length}</span> | 🔍
            Showing:{" "}
            <span className="font-semibold">{filteredUsers.length}</span>
          </div>
          <div className="flex flex-wrap gap-2 justify-center mt-4">
            <Button onClick={handleRefresh} variant="outline" size="sm">
              <RefreshCw className="mr-2 h-4 w-4" /> Refresh
            </Button>
            <Button
              onClick={handlePrintAll}
              disabled={!filteredUsers.length}
              size="sm"
              className="bg-blue-600 hover:bg-blue-700"
            >
              <Printer className="mr-2 h-4 w-4" /> Print All (
              {filteredUsers.length})
            </Button>
            <Button onClick={handleResetFilters} variant="outline" size="sm">
              <RotateCcw className="mr-2 h-4 w-4" /> Reset
            </Button>
            <Button onClick={handleClearAll} variant="destructive" size="sm">
              <Trash2 className="mr-2 h-4 w-4" /> Clear All
            </Button>
            <Button
              onClick={() => {
                sessionStorage.removeItem("adminAuthenticated");
                setIsAuthenticated(false);
              }}
              variant="outline"
              size="sm"
              className="text-red-600 border-red-600 hover:bg-red-50"
            >
              <LogOut className="mr-2 h-4 w-4" /> Logout
            </Button>
          </div>
        </CardHeader>

        <CardContent className="p-0">
          <div className="p-4 bg-gray-50 border-b">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
              <div>
                <label className="text-xs font-medium text-gray-600 mb-1 block">
                  Counselor
                </label>
                <Select
                  value={filterCounselor}
                  onValueChange={setFilterCounselor}
                >
                  <SelectTrigger className="h-9">
                    <SelectValue placeholder="All Counselors" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Counselors</SelectItem>
                    {uniqueCounselors.map((counselor) => (
                      <SelectItem key={counselor} value={counselor}>
                        {counselor}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <label className="text-xs font-medium text-gray-600 mb-1 block">
                  Level
                </label>
                <Select value={filterLevel} onValueChange={setFilterLevel}>
                  <SelectTrigger className="h-9">
                    <SelectValue placeholder="All Levels" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Levels</SelectItem>
                    <SelectItem value="Excellent">Excellent</SelectItem>
                    <SelectItem value="Good">Good</SelectItem>
                    <SelectItem value="Needs Improvement">
                      Needs Improvement
                    </SelectItem>
                    <SelectItem value="At Risk">At Risk</SelectItem>
                    <SelectItem value="Mild">Mild</SelectItem>
                    <SelectItem value="Mild-Moderate">Mild-Moderate</SelectItem>
                    <SelectItem value="Moderate">Moderate</SelectItem>
                    <SelectItem value="Moderate-Severe">
                      Moderate-Severe
                    </SelectItem>
                    <SelectItem value="Severe">Severe</SelectItem>
                    <SelectItem value="Normal">Normal</SelectItem>
                    <SelectItem value="Possible Anxiety">
                      Possible Anxiety
                    </SelectItem>
                    <SelectItem value="High Anxiety">High Anxiety</SelectItem>
                    <SelectItem value="SAD">SAD</SelectItem>
                    <SelectItem value="Generalized SAD">
                      Generalized SAD
                    </SelectItem>
                    <SelectItem value="Good Balance">Good Balance</SelectItem>
                    <SelectItem value="Moderate Balance">
                      Moderate Balance
                    </SelectItem>
                    <SelectItem value="Poor Balance">Poor Balance</SelectItem>
                    <SelectItem value="High">High</SelectItem>
                    <SelectItem value="Average-High">Average-High</SelectItem>
                    <SelectItem value="Average-Low">Average-Low</SelectItem>
                    <SelectItem value="Low">Low</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <label className="text-xs font-medium text-gray-600 mb-1 block">
                  Min Score
                </label>
                <Input
                  type="number"
                  placeholder="0"
                  value={filterScoreMin ?? ""}
                  onChange={(e) => {
                    const val = e.target.value;
                    setFilterScoreMin(val === "" ? undefined : Number(val));
                  }}
                  className="h-9"
                />
              </div>

              <div>
                <label className="text-xs font-medium text-gray-600 mb-1 block">
                  Max Score
                </label>
                <Input
                  type="number"
                  placeholder="100"
                  value={filterScoreMax ?? ""}
                  onChange={(e) => {
                    const val = e.target.value;
                    setFilterScoreMax(val === "" ? undefined : Number(val));
                  }}
                  className="h-9"
                />
              </div>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full border-collapse border border-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="border p-3 text-left font-semibold">Name</th>
                  <th className="border p-3 text-left font-semibold">
                    Roll No
                  </th>
                  <th className="border p-3 text-left font-semibold">
                    Counselor
                  </th>
                  <th className="border p-3 text-left font-semibold">Date</th>
                  <th className="border p-3 text-left font-semibold">
                    Overall Score
                  </th>
                  <th className="border p-3 text-left font-semibold">Level</th>
                  <th className="border p-3 text-left font-semibold">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody>
                {filteredUsers.map((user) => {
                  if (!user.id) {
                    return null;
                  }
                  const selectedAssessments = Object.keys(user.scores);
                  const overallScore =
                    selectedAssessments.length > 0
                      ? Math.round(
                          selectedAssessments.reduce(
                            (sum, id) => sum + (user.scores[id]?.rawScore || 0),
                            0
                          ) / selectedAssessments.length
                        )
                      : 0;
                  const level = getPerformanceLevel(overallScore, "");
                  return (
                    <tr key={user.id} className="hover:bg-gray-50">
                      <td className="border p-3">{user.name}</td>
                      <td className="border p-3">{user.rollNumber}</td>
                      <td className="border p-3">{user.counselorName}</td>
                      <td className="border p-3">
                        {new Date(user.dateCompleted).toLocaleDateString()}
                      </td>
                      <td className="border p-3 font-bold">{overallScore}</td>
                      <td className="border p-3">
                        <Badge
                          className={`${
                            levelColors[level] ||
                            "bg-gray-100 text-gray-800 border-gray-300"
                          } px-2 py-1`}
                        >
                          {level}
                        </Badge>
                      </td>
                      <td className="border p-3">
                        <Button
                          size="sm"
                          onClick={() => handlePrintSingle(user)}
                          className="h-8"
                        >
                          Print
                        </Button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {filteredUsers.length === 0 && users.length > 0 && (
            <div className="text-center p-8 text-orange-600 flex items-center justify-center">
              <AlertTriangle className="mr-2 h-5 w-5" /> Filters too strict! Try
              broader ranges or reset.
            </div>
          )}
          {users.length === 0 && (
            <div className="text-center p-8 text-red-600 flex items-center justify-center">
              <AlertTriangle className="mr-2 h-5 w-5" /> No data available.
              Complete an assessment first!
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
