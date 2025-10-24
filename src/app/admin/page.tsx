// src/app/admin/page.tsx
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
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  RefreshCw,
  Printer,
  RotateCcw,
  Trash2,
  LogOut,
  AlertTriangle,
} from "lucide-react";

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
  // Check session storage for authentication on mount
  useEffect(() => {
    const authStatus = sessionStorage.getItem("adminAuthenticated");
    if (authStatus === "true") {
      setIsAuthenticated(true);
    }
  }, []);

  // Load users from Firebase and validate IDs
  useEffect(() => {
    if (isAuthenticated) {
      dataManager
        .getAllUsers()
        .then((loadedUsers) => {
          console.log("Loaded users:", loadedUsers);
          const validUsers = loadedUsers.filter(
            (user) => user.id && typeof user.id === "string"
          );
          if (validUsers.length !== loadedUsers.length) {
            console.warn(
              "Filtered out users with invalid IDs:",
              loadedUsers.filter(
                (user) => !user.id || typeof user.id !== "string"
              )
            );
          }
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
      const scores = Object.values(user.scores);
      const overallScore =
        scores.length > 0
          ? Math.round(
              scores.reduce((sum, s) => sum + (s.normalizedScore || 0), 0) /
                scores.length
            )
          : 0;

      return (
        (filterCounselor === "all" || user.counselorName === filterCounselor) &&
        (filterLevel === "all" ||
          getPerformanceLevel(overallScore) === filterLevel) &&
        (filterScoreMin === undefined || overallScore >= filterScoreMin) &&
        (filterScoreMax === undefined || overallScore <= filterScoreMax)
      );
    });
  }, [users, filterCounselor, filterLevel, filterScoreMin, filterScoreMax]);

  const handlePrintAll = () => {
    const printWindow = window.open("", "", "height=800,width=1000");
    if (printWindow) {
      let content = `<html><head><title>All Reports</title><style>${printStyles}</style></head><body><div class="print-content">`;
      filteredUsers.forEach((user, index) => {
        content += `
          ${index > 0 ? '<div class="print-page-break"></div>' : ""}
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
              <tbody>${Object.entries(user.scores)
                .map(
                  ([id, scoreData]) =>
                    `<tr><td>${
                      assessmentNames[id] || id
                    }</td><td style="text-align:center;">${
                      scoreData.normalizedScore
                    }/100</td><td>${getPerformanceLevel(
                      scoreData.normalizedScore
                    )}</td></tr>`
                )
                .join("")}</tbody>
            </table>
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
           `;
      });
      content += `</body></html>`;
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
              <thead><tr><th>Assessment</th><th style="text-align:center;">Score</th><th>Level</th></tr></thead>
              <tbody>${Object.entries(user.scores)
                .map(
                  ([id, s]) =>
                    `<tr><td>${
                      assessmentNames[id] || id
                    }</td><td style="text-align:center;">${
                      s.normalizedScore
                    }/100</td><td>${getPerformanceLevel(
                      s.normalizedScore
                    )}</td></tr>`
                )
                .join("")}</tbody>
            </table>
            <div class="print-important-text">
                    Note: Scores are normalized to 0-100 scale For counseling purposes.
                  </div>
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
            </div></body></html>`);
      printWindow.document.close();
      printWindow.print();
    }
  };

  const handleRefresh = async () => {
    try {
      const loadedUsers = await dataManager.getAllUsers();
      const validUsers = loadedUsers.filter(
        (user) => user.id && typeof user.id === "string"
      );
      console.log("Refreshed users:", validUsers);
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
          console.log("All data cleared");
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
      <style jsx global>
        {printStyles}
      </style>
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
                  min="0"
                  max="100"
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
                    console.warn("User with missing ID:", user);
                    return null; // Skip users with missing IDs
                  }
                  const scores = Object.values(user.scores);
                  const overallScore =
                    scores.length > 0
                      ? Math.round(
                          scores.reduce(
                            (sum, s) => sum + (s.normalizedScore || 0),
                            0
                          ) / scores.length
                        )
                      : 0;
                  const level = getPerformanceLevel(overallScore);
                  return (
                    <tr key={user.id} className="hover:bg-gray-50">
                      <td className="border p-3">{user.name}</td>
                      <td className="border p-3">{user.rollNumber}</td>
                      <td className="border p-3">{user.counselorName}</td>
                      <td className="border p-3">
                        {new Date(user.dateCompleted).toLocaleDateString()}
                      </td>
                      <td className="border p-3 font-bold">
                        {overallScore}/100
                      </td>
                      <td className="border p-3">
                        <Badge className={`${levelColors[level]} px-2 py-1`}>
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
              <AlertTriangle className="mr-2 h-5 w-5" /> No data in Firebase.
              Complete an assessment first!
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
