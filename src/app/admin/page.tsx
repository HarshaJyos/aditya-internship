"use client";
import { useEffect, useState, useMemo } from "react";
import { dataManager, type AssessedUser } from "@/utils/dataManager";

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

const assessmentNames: Record<string, string> = {
  "assessment-1": "Social Skills",
  "assessment-2": "Emotional Awareness", 
  "assessment-3": "Stress Management",
  "assessment-4": "Team Dynamics",
  "assessment-5": "Motivation & Goals",
  "assessment-6": "Problem Solving",
};

type PerformanceLevel = "Excellent" | "Good" | "Needs Improvement" | "At Risk";

const getPerformanceLevel = (score: number): PerformanceLevel => {
  const safeScore = Number.isFinite(score) ? score : 0;
  if (safeScore >= 85) return "Excellent";
  if (safeScore >= 70) return "Good";
  if (safeScore >= 50) return "Needs Improvement";
  return "At Risk";
};

const levelColors: Record<PerformanceLevel, string> = {
  Excellent: "bg-green-100 text-green-800 border-green-300",
  Good: "bg-blue-100 text-blue-800 border-blue-300",
  "Needs Improvement": "bg-yellow-100 text-yellow-800 border-yellow-300",
  "At Risk": "bg-red-100 text-red-800 border-red-300",
};

// SAME printStyles AS BEFORE
const logoUrl = "https://adityauniversity.in/static/media/au.f652eed91d8ba58a4968.webp";


// ✅ PRINT STYLES (SHORTENED)
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


export default function AdminPage() {
  const [users, setUsers] = useState<AssessedUser[]>([]);
  const [filterCounselor, setFilterCounselor] = useState<string>("all");
  const [filterLevel, setFilterLevel] = useState<string>("all");
  const [filterScoreMin, setFilterScoreMin] = useState<number | undefined>(undefined);
  const [filterScoreMax, setFilterScoreMax] = useState<number | undefined>(undefined);

  // ✅ FIREBASE LOAD + DEBUG
  useEffect(() => {
    dataManager.getAllUsers().then(loadedUsers => {
      setUsers(loadedUsers);
    });
  }, []);

  const uniqueCounselors = useMemo(() => {
    return Array.from(new Set(users.map(user => user.counselorName))).sort();
  }, [users]);

  const filteredUsers = useMemo(() => {
    return users.filter((user) => {
      const scores = Object.values(user.scores);
      const overallScore = scores.length > 0 ? Math.round(
        scores.reduce((sum, s) => sum + (s.normalizedScore || 0), 0) / scores.length
      ) : 0;

      return (
        (filterCounselor === "all" || user.counselorName === filterCounselor) &&
        (filterLevel === "all" || getPerformanceLevel(overallScore) === filterLevel) &&
        (filterScoreMin === undefined || overallScore >= filterScoreMin) &&
        (filterScoreMax === undefined || overallScore <= filterScoreMax)
      );
    });
  }, [users, filterCounselor, filterLevel, filterScoreMin, filterScoreMax]);

  const handlePrintAll = () => {
    const printWindow = window.open("", "", "height=800,width=1000");
    if (printWindow) {
      let content = `<html><head><title>All Reports</title><style>${printStyles}</style></head><body><div class="print-content">`;
      filteredUsers.forEach((user) => {
        content += `
          <div class="print-page-break"></div>
          <div class="print-section">
            <div class="print-header">
              <div class="print-logo"><img src="/logo.jpeg" style="width:100%;height:100%;object-fit:contain;" /></div>
              <div class="print-title">STUDENT COUNSELING REPORT</div>
              <div class="print-subtitle">ADITYA UNIVERSITY, SURAMPALEM</div>
            </div>
            <table class="print-table">
              <tr><th>Student Name</th><td>${user.name}</td></tr>
              <tr><th>Roll Number</th><td>${user.rollNumber}</td></tr>
              <tr><th>Phone Number</th><td>${user.phoneNumber}</td></tr>
              <tr><th>Counselor Name</th><td>${user.counselorName}</td></tr>
              <tr><th>Date</th><td>${user.signatureDate}</td></tr>
            </table>
            <div class="print-section-title">Assessment Results</div>
            <table class="print-table">
              <thead><tr><th>Assessment</th><th style="text-align:center;">Score</th><th>Level</th></tr></thead>
              <tbody>${Object.entries(user.scores).map(([id, scoreData]) => `<tr><td>${assessmentNames[id]}</td><td style="text-align:center;">${scoreData.normalizedScore}/100</td><td>${getPerformanceLevel(scoreData.normalizedScore)}</td></tr>`).join("")}</tbody>
            </table>
            <div class="print-signature-text">Signature: ${user.name}</div>
          </div>`;
      });
      content += `<div style="margin-top:15mm;text-align:center;font-size:9pt;color:#6b7280;border-top:1px solid #d1d5db;padding-top:5mm;"><strong>Aditya University Counselling Centre</strong></div></div></body></html>`;
      printWindow.document.write(content);
      printWindow.document.close();
      printWindow.print();
    }
  };

  const handlePrintSingle = (user: AssessedUser) => {
    const printWindow = window.open("", "", "height=600,width=800");
    if (printWindow) {
      printWindow.document.write(`
        <html><head><title>Report</title><style>${printStyles}</style></head>
        <body><div class="print-content">
          <div class="print-header">
            <div class="print-logo"><img src="/logo.jpeg" style="width:100%;height:100%;object-fit:contain;" /></div>
            <div class="print-title">INFORMED CONSENT & SUMMARY REPORT</div>
            <div class="print-subtitle">ADITYA UNIVERSITY, SURAMPALEM</div>
          </div>
          <div class="print-section">
            <div class="print-section-title">Summary Report</div>
            <table class="print-table">
              <tr><th style="width:25%;">Student Name</th><td>${user.name}</td></tr>
              <tr><th>Roll Number</th><td>${user.rollNumber}</td></tr>
              <tr><th>Phone Number</th><td>${user.phoneNumber}</td></tr>
              <tr><th>Counselor Name</th><td>${user.counselorName}</td></tr>
              <tr><th>Date</th><td>${user.signatureDate}</td></tr>
            </table>
            <div class="print-section-title">Assessment Results</div>
            <table class="print-table">
              <thead><tr><th>Assessment</th><th style="text-align:center;">Score</th><th>Level</th></tr></thead>
              <tbody>${Object.entries(user.scores).map(([id, s]) => `<tr><td>${assessmentNames[id]}</td><td style="text-align:center;">${s.normalizedScore}/100</td><td>${getPerformanceLevel(s.normalizedScore)}</td></tr>`).join("")}</tbody>
            </table>
          </div>
          <div class="print-page-break"></div>
          <div class="print-section">
            <div class="print-section-title">INFORMED CONSENT</div>
            <div class="print-consent-text">At Aditya University, we prioritize your well-being...</div>
            <div class="print-signature-text">Signature: ${user.name}</div>
          </div>
        </div></body></html>`);
      printWindow.document.close();
      printWindow.print();
    }
  };

  const handleRefresh = async () => {
    const loadedUsers = await dataManager.getAllUsers();
    setUsers(loadedUsers);
  };

  const handleClearAll = () => {
    if (confirm("Clear ALL data forever?")) {
      dataManager.clearAll();
      setUsers([]);
    }
  };

  // ✅ PROFESSIONAL RESET
  const handleResetFilters = () => {
    setFilterCounselor("all");
    setFilterLevel("all");
    setFilterScoreMin(undefined);
    setFilterScoreMax(undefined);
  };

  return (
    <div className="min-h-screen p-4 bg-white">
      <style jsx global>{printStyles}</style>
      <Card className="max-w-full">
        <CardHeader className="text-center border-b">
          <CardTitle className="text-xl font-bold text-gray-800">Admin Dashboard</CardTitle>
          <div className="text-sm text-gray-600 mb-2">
            📊 Total: <span className="font-semibold">{users.length}</span> | 
            🔍 Showing: <span className="font-semibold">{filteredUsers.length}</span>
          </div>
          <div className="flex flex-wrap gap-2 justify-center mt-4">
            <Button onClick={handleRefresh} variant="outline" size="sm">🔄 Refresh</Button>
            <Button onClick={handlePrintAll} disabled={!filteredUsers.length} size="sm" className="bg-blue-600 hover:bg-blue-700">
              📄 Print All ({filteredUsers.length})
            </Button>
            <Button onClick={handleResetFilters} variant="outline" size="sm">🔄 Reset</Button>
            <Button onClick={handleClearAll} variant="destructive" size="sm">🗑️ Clear All</Button>
          </div>
        </CardHeader>

        <CardContent className="p-0">
          <div className="p-4 bg-gray-50 border-b">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
              <div>
                <label className="text-xs font-medium text-gray-600 mb-1 block">Counselor</label>
                <Select value={filterCounselor} onValueChange={setFilterCounselor}>
                  <SelectTrigger className="h-9">
                    <SelectValue placeholder="All Counselors" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Counselors</SelectItem>
                    {uniqueCounselors.map(counselor => (
                      <SelectItem key={counselor} value={counselor}>
                        {counselor}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <label className="text-xs font-medium text-gray-600 mb-1 block">Level</label>
                <Select value={filterLevel} onValueChange={setFilterLevel}>
                  <SelectTrigger className="h-9">
                    <SelectValue placeholder="All Levels" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Levels</SelectItem>
                    <SelectItem value="Excellent">Excellent</SelectItem>
                    <SelectItem value="Good">Good</SelectItem>
                    <SelectItem value="Needs Improvement">Needs Improvement</SelectItem>
                    <SelectItem value="At Risk">At Risk</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <label className="text-xs font-medium text-gray-600 mb-1 block">Min Score</label>
                <Input
                  type="number"
                  placeholder="0"
                  value={filterScoreMin ?? ""}
                  onChange={(e) => {
                    const val = e.target.value;
                    setFilterScoreMin(val === "" ? undefined : Number(val));
                  }}
                  className="h-9"
                  min="0"
                  max="100"
                />
              </div>

              <div>
                <label className="text-xs font-medium text-gray-600 mb-1 block">Max Score</label>
                <Input
                  type="number"
                  placeholder="100"
                  value={filterScoreMax ?? ""}
                  onChange={(e) => {
                    const val = e.target.value;
                    setFilterScoreMax(val === "" ? undefined : Number(val));
                  }}
                  className="h-9"
                  min="0"
                  max="100"
                />
              </div>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full border-collapse border border-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="border p-3 text-left font-semibold">Name</th>
                  <th className="border p-3 text-left font-semibold">Roll No</th>
                  <th className="border p-3 text-left font-semibold">Counselor</th>
                  <th className="border p-3 text-left font-semibold">Date</th>
                  <th className="border p-3 text-left font-semibold">Overall Score</th>
                  <th className="border p-3 text-left font-semibold">Level</th>
                  <th className="border p-3 text-left font-semibold">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredUsers.map((user) => {
                  const scores = Object.values(user.scores);
                  const overallScore = scores.length > 0 ? Math.round(
                    scores.reduce((sum, s) => sum + (s.normalizedScore || 0), 0) / scores.length
                  ) : 0;
                  const level = getPerformanceLevel(overallScore);
                  return (
                    <tr key={user.id} className="hover:bg-gray-50">
                      <td className="border p-3">{user.name}</td>
                      <td className="border p-3">{user.rollNumber}</td>
                      <td className="border p-3">{user.counselorName}</td>
                      <td className="border p-3">{new Date(user.dateCompleted).toLocaleDateString()}</td>
                      <td className="border p-3 font-bold">{overallScore}/100</td>
                      <td className="border p-3"><Badge className={`${levelColors[level]} px-2 py-1`}>{level}</Badge></td>
                      <td className="border p-3"><Button size="sm" onClick={() => handlePrintSingle(user)} className="h-8">Print</Button></td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {filteredUsers.length === 0 && users.length > 0 && (
            <div className="text-center p-8 text-orange-600">❌ Filters too strict! Try broader ranges or reset.</div>
          )}
          {users.length === 0 && (
            <div className="text-center p-8 text-red-600">❌ No data in localStorage. Complete an assessment first!</div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}