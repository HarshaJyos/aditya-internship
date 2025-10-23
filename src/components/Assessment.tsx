"use client";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useState, useEffect } from "react";
import { dataManager, type AssessmentScore } from "@/utils/dataManager";
import { useRouter } from "next/navigation";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import {
  Form,
  FormField,
  FormItem,
  FormLabel,
  FormControl,
} from "@/components/ui/form";
import { onAuthStateChanged } from "firebase/auth";
import { auth } from "@/firebase";

const assessmentQuestions: Record<
  string,
  {
    name: string;
    questions: { text: string; scoring: Record<string, number> }[];
  }
> = {
  "assessment-1": {
    name: "Social Skills Assessment",
    questions: [
      {
        text: "I feel confident initiating conversations with new people.",
        scoring: {
          "strongly-disagree": 1,
          disagree: 2,
          neutral: 3,
          agree: 4,
          "strongly-agree": 5,
        },
      },
      {
        text: "I find it easy to maintain eye contact during discussions.",
        scoring: {
          "strongly-disagree": 1,
          disagree: 2,
          neutral: 3,
          agree: 4,
          "strongly-agree": 5,
        },
      },
      {
        text: "I often feel uncomfortable in group social settings.",
        scoring: {
          "strongly-disagree": 5,
          disagree: 4,
          neutral: 3,
          agree: 2,
          "strongly-agree": 1,
        },
      },
      {
        text: "I actively listen and respond to others' perspectives.",
        scoring: {
          "strongly-disagree": 1,
          disagree: 2,
          neutral: 3,
          agree: 4,
          "strongly-agree": 5,
        },
      },
      {
        text: "I struggle to express my thoughts clearly in social interactions.",
        scoring: {
          "strongly-disagree": 5,
          disagree: 4,
          neutral: 3,
          agree: 2,
          "strongly-agree": 1,
        },
      },
      {
        text: "I adapt my communication style to suit different social situations.",
        scoring: {
          "strongly-disagree": 1,
          disagree: 2,
          neutral: 3,
          agree: 4,
          "strongly-agree": 5,
        },
      },
      {
        text: "I feel at ease when meeting new classmates or colleagues.",
        scoring: {
          "strongly-disagree": 1,
          disagree: 2,
          neutral: 3,
          agree: 4,
          "strongly-agree": 5,
        },
      },
      {
        text: "I find it challenging to build rapport with people I don't know well.",
        scoring: {
          "strongly-disagree": 5,
          disagree: 4,
          neutral: 3,
          agree: 2,
          "strongly-agree": 1,
        },
      },
    ],
  },
  // ... (all other assessments remain same)
  "assessment-2": {
    name: "Emotional Awareness Assessment",
    questions: [
      {
        text: "I can accurately identify my emotions in challenging situations.",
        scoring: {
          "strongly-disagree": 1,
          disagree: 2,
          neutral: 3,
          agree: 4,
          "strongly-agree": 5,
        },
      },
      {
        text: "I frequently feel overwhelmed by intense emotions.",
        scoring: {
          "strongly-disagree": 5,
          disagree: 4,
          neutral: 3,
          agree: 2,
          "strongly-agree": 1,
        },
      },
      {
        text: "I am aware of how my emotions influence my behavior.",
        scoring: {
          "strongly-disagree": 1,
          disagree: 2,
          neutral: 3,
          agree: 4,
          "strongly-agree": 5,
        },
      },
      {
        text: "I can easily recognize the emotions of others around me.",
        scoring: {
          "strongly-disagree": 1,
          disagree: 2,
          neutral: 3,
          agree: 4,
          "strongly-agree": 5,
        },
      },
      {
        text: "I find it difficult to name my feelings when upset.",
        scoring: {
          "strongly-disagree": 5,
          disagree: 4,
          neutral: 3,
          agree: 2,
          "strongly-agree": 1,
        },
      },
      {
        text: "I understand how my emotions affect my decision-making process.",
        scoring: {
          "strongly-disagree": 1,
          disagree: 2,
          neutral: 3,
          agree: 4,
          "strongly-agree": 5,
        },
      },
      {
        text: "I can distinguish between similar emotions, like sadness and frustration.",
        scoring: {
          "strongly-disagree": 1,
          disagree: 2,
          neutral: 3,
          agree: 4,
          "strongly-agree": 5,
        },
      },
      {
        text: "I struggle to empathize with others' emotional experiences.",
        scoring: {
          "strongly-disagree": 5,
          disagree: 4,
          neutral: 3,
          agree: 2,
          "strongly-agree": 1,
        },
      },
    ],
  },
  "assessment-3": {
    name: "Stress Management Assessment",
    questions: [
      {
        text: "I use effective strategies to manage stress during exams.",
        scoring: {
          "strongly-disagree": 1,
          disagree: 2,
          neutral: 3,
          agree: 4,
          "strongly-agree": 5,
        },
      },
      {
        text: "I often feel anxious even in low-pressure situations.",
        scoring: {
          "strongly-disagree": 5,
          disagree: 4,
          neutral: 3,
          agree: 2,
          "strongly-agree": 1,
        },
      },
      {
        text: "I practice mindfulness or relaxation techniques regularly.",
        scoring: {
          "strongly-disagree": 1,
          disagree: 2,
          neutral: 3,
          agree: 4,
          "strongly-agree": 5,
        },
      },
      {
        text: "I find it challenging to stay calm under tight deadlines.",
        scoring: {
          "strongly-disagree": 5,
          disagree: 4,
          neutral: 3,
          agree: 2,
          "strongly-agree": 1,
        },
      },
      {
        text: "I recover quickly after experiencing a stressful event.",
        scoring: {
          "strongly-disagree": 1,
          disagree: 2,
          neutral: 3,
          agree: 4,
          "strongly-agree": 5,
        },
      },
      {
        text: "I feel confident in my ability to prioritize tasks during stressful times.",
        scoring: {
          "strongly-disagree": 1,
          disagree: 2,
          neutral: 3,
          agree: 4,
          "strongly-agree": 5,
        },
      },
      {
        text: "I tend to procrastinate when faced with stressful responsibilities.",
        scoring: {
          "strongly-disagree": 5,
          disagree: 4,
          neutral: 3,
          agree: 2,
          "strongly-agree": 1,
        },
      },
      {
        text: "I use positive self-talk to cope with stressful situations.",
        scoring: {
          "strongly-disagree": 1,
          disagree: 2,
          neutral: 3,
          agree: 4,
          "strongly-agree": 5,
        },
      },
    ],
  },
  "assessment-4": {
    name: "Team Dynamics Assessment",
    questions: [
      {
        text: "I feel comfortable contributing ideas in group projects.",
        scoring: {
          "strongly-disagree": 1,
          disagree: 2,
          neutral: 3,
          agree: 4,
          "strongly-agree": 5,
        },
      },
      {
        text: "I often take a leadership role in team settings.",
        scoring: {
          "strongly-disagree": 1,
          disagree: 2,
          neutral: 3,
          agree: 4,
          "strongly-agree": 5,
        },
      },
      {
        text: "I find it difficult to work with team members who disagree with me.",
        scoring: {
          "strongly-disagree": 5,
          disagree: 4,
          neutral: 3,
          agree: 2,
          "strongly-agree": 1,
        },
      },
      {
        text: "I actively support my teammates to achieve group goals.",
        scoring: {
          "strongly-disagree": 1,
          disagree: 2,
          neutral: 3,
          agree: 4,
          "strongly-agree": 5,
        },
      },
      {
        text: "I struggle to resolve conflicts within a team.",
        scoring: {
          "strongly-disagree": 5,
          disagree: 4,
          neutral: 3,
          agree: 2,
          "strongly-agree": 1,
        },
      },
      {
        text: "I value the diverse perspectives of my team members.",
        scoring: {
          "strongly-disagree": 1,
          disagree: 2,
          neutral: 3,
          agree: 4,
          "strongly-agree": 5,
        },
      },
      {
        text: "I feel frustrated when team members do not meet expectations.",
        scoring: {
          "strongly-disagree": 5,
          disagree: 4,
          neutral: 3,
          agree: 2,
          "strongly-agree": 1,
        },
      },
      {
        text: "I communicate clearly to ensure team tasks are completed effectively.",
        scoring: {
          "strongly-disagree": 1,
          disagree: 2,
          neutral: 3,
          agree: 4,
          "strongly-agree": 5,
        },
      },
    ],
  },
  "assessment-5": {
    name: "Motivation & Goals Assessment",
    questions: [
      {
        text: "I set specific and achievable goals for my academic success.",
        scoring: {
          "strongly-disagree": 1,
          disagree: 2,
          neutral: 3,
          agree: 4,
          "strongly-agree": 5,
        },
      },
      {
        text: "I maintain motivation even when tasks are challenging.",
        scoring: {
          "strongly-disagree": 1,
          disagree: 2,
          neutral: 3,
          agree: 4,
          "strongly-agree": 5,
        },
      },
      {
        text: "I often lose focus on my long-term objectives.",
        scoring: {
          "strongly-disagree": 5,
          disagree: 4,
          neutral: 3,
          agree: 2,
          "strongly-agree": 1,
        },
      },
      {
        text: "I regularly review my progress toward my goals.",
        scoring: {
          "strongly-disagree": 1,
          disagree: 2,
          neutral: 3,
          agree: 4,
          "strongly-agree": 5,
        },
      },
      {
        text: "I feel confident in my ability to achieve my aspirations.",
        scoring: {
          "strongly-disagree": 1,
          disagree: 2,
          neutral: 3,
          agree: 4,
          "strongly-agree": 5,
        },
      },
      {
        text: "I find it easy to stay committed to my academic priorities.",
        scoring: {
          "strongly-disagree": 1,
          disagree: 2,
          neutral: 3,
          agree: 4,
          "strongly-agree": 5,
        },
      },
      {
        text: "I feel discouraged when I encounter setbacks in my goals.",
        scoring: {
          "strongly-disagree": 5,
          disagree: 4,
          neutral: 3,
          agree: 2,
          "strongly-agree": 1,
        },
      },
      {
        text: "I seek opportunities to develop skills that support my goals.",
        scoring: {
          "strongly-disagree": 1,
          disagree: 2,
          neutral: 3,
          agree: 4,
          "strongly-agree": 5,
        },
      },
    ],
  },
  "assessment-6": {
    name: "Problem Solving Assessment",
    questions: [
      {
        text: "I approach problems with a structured and logical mindset.",
        scoring: {
          "strongly-disagree": 1,
          disagree: 2,
          neutral: 3,
          agree: 4,
          "strongly-agree": 5,
        },
      },
      {
        text: "I feel overwhelmed when faced with complex challenges.",
        scoring: {
          "strongly-disagree": 5,
          disagree: 4,
          neutral: 3,
          agree: 2,
          "strongly-agree": 1,
        },
      },
      {
        text: "I generate creative solutions to difficult problems.",
        scoring: {
          "strongly-disagree": 1,
          disagree: 2,
          neutral: 3,
          agree: 4,
          "strongly-agree": 5,
        },
      },
      {
        text: "I seek feedback or assistance when solving problems.",
        scoring: {
          "strongly-disagree": 1,
          disagree: 2,
          neutral: 3,
          agree: 4,
          "strongly-agree": 5,
        },
      },
      {
        text: "I make decisions confidently after considering alternatives.",
        scoring: {
          "strongly-disagree": 1,
          disagree: 2,
          neutral: 3,
          agree: 4,
          "strongly-agree": 5,
        },
      },
      {
        text: "I break down complex problems into manageable parts.",
        scoring: {
          "strongly-disagree": 1,
          disagree: 2,
          neutral: 3,
          agree: 4,
          "strongly-agree": 5,
        },
      },
      {
        text: "I struggle to find effective solutions under time pressure.",
        scoring: {
          "strongly-disagree": 5,
          disagree: 4,
          neutral: 3,
          agree: 2,
          "strongly-agree": 1,
        },
      },
      {
        text: "I reflect on past solutions to improve my problem-solving approach.",
        scoring: {
          "strongly-disagree": 1,
          disagree: 2,
          neutral: 3,
          agree: 4,
          "strongly-agree": 5,
        },
      },
    ],
  },
};

const likertOptions = [
  {
    value: "strongly-disagree",
    label: "Strongly Disagree",
    color: "bg-red-100 text-red-700 border-red-200",
  },
  {
    value: "disagree",
    label: "Disagree",
    color: "bg-orange-100 text-orange-700 border-orange-200",
  },
  {
    value: "neutral",
    label: "Neutral",
    color: "bg-gray-100 text-gray-700 border-gray-200",
  },
  {
    value: "agree",
    label: "Agree",
    color: "bg-blue-100 text-blue-700 border-blue-200",
  },
  {
    value: "strongly-agree",
    label: "Strongly Agree",
    color: "bg-green-100 text-green-700 border-green-200",
  },
];

type FormValues = { answers: string[] };

export default function Assessment({ id }: { id: string }) {
  const currentAssessment = assessmentQuestions[id];
  const questions = currentAssessment.questions;
  const numQuestions = questions.length;

  const form = useForm<FormValues>({
    resolver: zodResolver(
      z.object({ answers: z.array(z.string()).length(numQuestions) })
    ),
    defaultValues: { answers: Array(numQuestions).fill("") },
  });

  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [userId, setUserId] = useState<string | null>(null);
  const [selectedAssessments, setSelectedAssessments] = useState<string[]>([]);
  const [currentAssessmentIndex, setCurrentAssessmentIndex] = useState(0);
  const [numAssessments, setNumAssessments] = useState(0);
  const router = useRouter();

  // Assessment.tsx – useEffect
useEffect(() => {
  const init = async () => {
    await import("@/firebase").then(m => m.isAuthReady ? null : new Promise<void>(r => {
      const unsub = onAuthStateChanged(auth, () => { unsub(); r(); });
    }));
    const storedUserId = localStorage.getItem('tempUserId');
    const storedSelected = JSON.parse(localStorage.getItem('tempSelectedAssessments') || "[]");
    setUserId(storedUserId);
    setSelectedAssessments(storedSelected);
    setNumAssessments(storedSelected.length);
    setCurrentAssessmentIndex(storedSelected.indexOf(id));
  };
  init();
}, [id]);

  const onAnswerChange = (value: string, index: number) => {
    form.setValue(`answers.${index}`, value);
    if (index + 1 < numQuestions) {
      setTimeout(() => setCurrentQuestion(index + 1), 300);
    }
  };

  const calculateAndSaveScore = async (data: FormValues) => {
    const rawScore = data.answers.reduce(
      (total, answer, index) => total + questions[index].scoring[answer],
      0
    );
    const minScore = numQuestions * 1;
    const maxScore = numQuestions * 5;
    const normalizedScore = Math.round(
      ((rawScore - minScore) / (maxScore - minScore)) * 100
    );

    const score: AssessmentScore = {
      id,
      rawScore,
      normalizedScore,
      date: new Date().toISOString(),
    };

    // ✅ SAVE TO FIREBASE
    await dataManager.updateUserScores(userId!, { [id]: score });

    return normalizedScore;
  };

  const progressPercentage = Math.round(
    ((currentQuestion + 1) / numQuestions) * 100
  );

  const handleComplete = async () => {
    if (!form.getValues("answers")[currentQuestion]) return;
    if (!userId) {
      console.error("No userId – cannot save score");
      // Optionally redirect to consent
      router.push("/consent");
      return;
    }
    setIsSubmitting(true);
    await calculateAndSaveScore(form.getValues());

    await calculateAndSaveScore(form.getValues());
    const nextIndex = currentAssessmentIndex + 1;

    if (nextIndex < numAssessments) {
      router.push(`/assessment/${selectedAssessments[nextIndex]}`);
    } else {
      router.push("/summary");
    }
  };

  return (
    <div className="min-h-screen p-4 bg-gradient-to-br from-blue-50 to-indigo-100">
      <Card className="max-w-4xl mx-auto shadow-xl">
        <CardHeader className="text-center">
          <CardTitle className="text-3xl font-bold text-blue-800">
            {currentAssessment.name}
          </CardTitle>
          <Progress value={progressPercentage} className="w-full h-3 mt-4" />
          <p className="text-lg mt-2">
            Question {currentQuestion + 1} of {numQuestions}
          </p>
        </CardHeader>
        <CardContent className="p-8">
          <Form {...form}>
            <FormField
              control={form.control}
              name={`answers.${currentQuestion}`}
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-xl font-semibold text-gray-800 mb-6 text-center">
                    {currentQuestion + 1}. {questions[currentQuestion].text}
                  </FormLabel>
                  <FormControl>
                    <div className="grid grid-cols-5 gap-4">
                      {likertOptions.map((opt) => (
                        <div
                          key={opt.value}
                          className={`
                            p-4 rounded-lg cursor-pointer border-2 transition-all 
                            ${opt.color} 
                            ${
                              field.value === opt.value
                                ? "ring-4 ring-blue-500 scale-105 shadow-lg"
                                : ""
                            }
                          `}
                          onClick={() =>
                            onAnswerChange(opt.value, currentQuestion)
                          }
                        >
                          <FormLabel className="cursor-pointer block text-center font-medium">
                            {opt.label}
                          </FormLabel>
                        </div>
                      ))}
                    </div>
                  </FormControl>
                </FormItem>
              )}
            />
          </Form>

          {currentQuestion === numQuestions - 1 &&
            form.watch(`answers.${currentQuestion}`) &&
            !isSubmitting && (
              <div className="text-center space-y-4 mt-8">
                <Button
                  onClick={handleComplete}
                  size="lg"
                  className="w-full bg-green-600 text-white text-xl py-6 hover:bg-green-700"
                >
                  ✅ Complete Assessment & View Results
                </Button>
              </div>
            )}

          {currentQuestion < numQuestions - 1 && (
            <div className="flex justify-between mt-8">
              <Button
                type="button"
                onClick={() =>
                  setCurrentQuestion(Math.max(0, currentQuestion - 1))
                }
              >
                ← Previous
              </Button>
              <Button
                type="button"
                onClick={() =>
                  setCurrentQuestion(
                    Math.min(numQuestions - 1, currentQuestion + 1)
                  )
                }
              >
                Next →
              </Button>
            </div>
          )}

          {isSubmitting && (
            <div className="text-center mt-8 p-4 bg-blue-50 rounded-lg">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
              <p className="text-lg font-medium text-blue-800">
                Saving & Redirecting...
              </p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
