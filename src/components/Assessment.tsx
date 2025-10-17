"use client";
import { useRouter, useSearchParams } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useState } from "react";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Label } from "@/components/ui/label";
import { Form, FormField, FormItem, FormLabel, FormControl, FormMessage } from "@/components/ui/form";  // Add Form


const assessmentQuestions: Record<string, { 
  name: string; 
  questions: { text: string; scoring: Record<string, number> }[] 
}> = {
  "assessment-1": {
    name: "Social Skills Assessment",
    questions: [
      { text: "I feel confident initiating conversations with new people.", scoring: { "strongly-disagree": 1, "disagree": 2, "neutral": 3, "agree": 4, "strongly-agree": 5 } },
      { text: "I find it easy to maintain eye contact during discussions.", scoring: { "strongly-disagree": 1, "disagree": 2, "neutral": 3, "agree": 4, "strongly-agree": 5 } },
      { text: "I often feel uncomfortable in group social settings.", scoring: { "strongly-disagree": 5, "disagree": 4, "neutral": 3, "agree": 2, "strongly-agree": 1 } },
      { text: "I actively listen and respond to others' perspectives.", scoring: { "strongly-disagree": 1, "disagree": 2, "neutral": 3, "agree": 4, "strongly-agree": 5 } },
      { text: "I struggle to express my thoughts clearly in social interactions.", scoring: { "strongly-disagree": 5, "disagree": 4, "neutral": 3, "agree": 2, "strongly-agree": 1 } },
      { text: "I adapt my communication style to suit different social situations.", scoring: { "strongly-disagree": 1, "disagree": 2, "neutral": 3, "agree": 4, "strongly-agree": 5 } },
      { text: "I feel at ease when meeting new classmates or colleagues.", scoring: { "strongly-disagree": 1, "disagree": 2, "neutral": 3, "agree": 4, "strongly-agree": 5 } },
      { text: "I find it challenging to build rapport with people I don't know well.", scoring: { "strongly-disagree": 5, "disagree": 4, "neutral": 3, "agree": 2, "strongly-agree": 1 } },
    ]
  },
  "assessment-2": {
    name: "Emotional Awareness Assessment",
    questions: [
      { text: "I can accurately identify my emotions in challenging situations.", scoring: { "strongly-disagree": 1, "disagree": 2, "neutral": 3, "agree": 4, "strongly-agree": 5 } },
      { text: "I frequently feel overwhelmed by intense emotions.", scoring: { "strongly-disagree": 5, "disagree": 4, "neutral": 3, "agree": 2, "strongly-agree": 1 } },
      { text: "I am aware of how my emotions influence my behavior.", scoring: { "strongly-disagree": 1, "disagree": 2, "neutral": 3, "agree": 4, "strongly-agree": 5 } },
      { text: "I can easily recognize the emotions of others around me.", scoring: { "strongly-disagree": 1, "disagree": 2, "neutral": 3, "agree": 4, "strongly-agree": 5 } },
      { text: "I find it difficult to name my feelings when upset.", scoring: { "strongly-disagree": 5, "disagree": 4, "neutral": 3, "agree": 2, "strongly-agree": 1 } },
      { text: "I understand how my emotions affect my decision-making process.", scoring: { "strongly-disagree": 1, "disagree": 2, "neutral": 3, "agree": 4, "strongly-agree": 5 } },
      { text: "I can distinguish between similar emotions, like sadness and frustration.", scoring: { "strongly-disagree": 1, "disagree": 2, "neutral": 3, "agree": 4, "strongly-agree": 5 } },
      { text: "I struggle to empathize with others' emotional experiences.", scoring: { "strongly-disagree": 5, "disagree": 4, "neutral": 3, "agree": 2, "strongly-agree": 1 } },
    ]
  },
  "assessment-3": {
    name: "Stress Management Assessment",
    questions: [
      { text: "I use effective strategies to manage stress during exams.", scoring: { "strongly-disagree": 1, "disagree": 2, "neutral": 3, "agree": 4, "strongly-agree": 5 } },
      { text: "I often feel anxious even in low-pressure situations.", scoring: { "strongly-disagree": 5, "disagree": 4, "neutral": 3, "agree": 2, "strongly-agree": 1 } },
      { text: "I practice mindfulness or relaxation techniques regularly.", scoring: { "strongly-disagree": 1, "disagree": 2, "neutral": 3, "agree": 4, "strongly-agree": 5 } },
      { text: "I find it challenging to stay calm under tight deadlines.", scoring: { "strongly-disagree": 5, "disagree": 4, "neutral": 3, "agree": 2, "strongly-agree": 1 } },
      { text: "I recover quickly after experiencing a stressful event.", scoring: { "strongly-disagree": 1, "disagree": 2, "neutral": 3, "agree": 4, "strongly-agree": 5 } },
      { text: "I feel confident in my ability to prioritize tasks during stressful times.", scoring: { "strongly-disagree": 1, "disagree": 2, "neutral": 3, "agree": 4, "strongly-agree": 5 } },
      { text: "I tend to procrastinate when faced with stressful responsibilities.", scoring: { "strongly-disagree": 5, "disagree": 4, "neutral": 3, "agree": 2, "strongly-agree": 1 } },
      { text: "I use positive self-talk to cope with stressful situations.", scoring: { "strongly-disagree": 1, "disagree": 2, "neutral": 3, "agree": 4, "strongly-agree": 5 } },
    ]
  },
  "assessment-4": {
    name: "Team Dynamics Assessment",
    questions: [
      { text: "I feel comfortable contributing ideas in group projects.", scoring: { "strongly-disagree": 1, "disagree": 2, "neutral": 3, "agree": 4, "strongly-agree": 5 } },
      { text: "I often take a leadership role in team settings.", scoring: { "strongly-disagree": 1, "disagree": 2, "neutral": 3, "agree": 4, "strongly-agree": 5 } },
      { text: "I find it difficult to work with team members who disagree with me.", scoring: { "strongly-disagree": 5, "disagree": 4, "neutral": 3, "agree": 2, "strongly-agree": 1 } },
      { text: "I actively support my teammates to achieve group goals.", scoring: { "strongly-disagree": 1, "disagree": 2, "neutral": 3, "agree": 4, "strongly-agree": 5 } },
      { text: "I struggle to resolve conflicts within a team.", scoring: { "strongly-disagree": 5, "disagree": 4, "neutral": 3, "agree": 2, "strongly-agree": 1 } },
      { text: "I value the diverse perspectives of my team members.", scoring: { "strongly-disagree": 1, "disagree": 2, "neutral": 3, "agree": 4, "strongly-agree": 5 } },
      { text: "I feel frustrated when team members do not meet expectations.", scoring: { "strongly-disagree": 5, "disagree": 4, "neutral": 3, "agree": 2, "strongly-agree": 1 } },
      { text: "I communicate clearly to ensure team tasks are completed effectively.", scoring: { "strongly-disagree": 1, "disagree": 2, "neutral": 3, "agree": 4, "strongly-agree": 5 } },
    ]
  },
  "assessment-5": {
    name: "Motivation & Goals Assessment",
    questions: [
      { text: "I set specific and achievable goals for my academic success.", scoring: { "strongly-disagree": 1, "disagree": 2, "neutral": 3, "agree": 4, "strongly-agree": 5 } },
      { text: "I maintain motivation even when tasks are challenging.", scoring: { "strongly-disagree": 1, "disagree": 2, "neutral": 3, "agree": 4, "strongly-agree": 5 } },
      { text: "I often lose focus on my long-term objectives.", scoring: { "strongly-disagree": 5, "disagree": 4, "neutral": 3, "agree": 2, "strongly-agree": 1 } },
      { text: "I regularly review my progress toward my goals.", scoring: { "strongly-disagree": 1, "disagree": 2, "neutral": 3, "agree": 4, "strongly-agree": 5 } },
      { text: "I feel confident in my ability to achieve my aspirations.", scoring: { "strongly-disagree": 1, "disagree": 2, "neutral": 3, "agree": 4, "strongly-agree": 5 } },
      { text: "I find it easy to stay committed to my academic priorities.", scoring: { "strongly-disagree": 1, "disagree": 2, "neutral": 3, "agree": 4, "strongly-agree": 5 } },
      { text: "I feel discouraged when I encounter setbacks in my goals.", scoring: { "strongly-disagree": 5, "disagree": 4, "neutral": 3, "agree": 2, "strongly-agree": 1 } },
      { text: "I seek opportunities to develop skills that support my goals.", scoring: { "strongly-disagree": 1, "disagree": 2, "neutral": 3, "agree": 4, "strongly-agree": 5 } },
    ]
  },
  "assessment-6": {
    name: "Problem Solving Assessment",
    questions: [
      { text: "I approach problems with a structured and logical mindset.", scoring: { "strongly-disagree": 1, "disagree": 2, "neutral": 3, "agree": 4, "strongly-agree": 5 } },
      { text: "I feel overwhelmed when faced with complex challenges.", scoring: { "strongly-disagree": 5, "disagree": 4, "neutral": 3, "agree": 2, "strongly-agree": 1 } },
      { text: "I generate creative solutions to difficult problems.", scoring: { "strongly-disagree": 1, "disagree": 2, "neutral": 3, "agree": 4, "strongly-agree": 5 } },
      { text: "I seek feedback or assistance when solving problems.", scoring: { "strongly-disagree": 1, "disagree": 2, "neutral": 3, "agree": 4, "strongly-agree": 5 } },
      { text: "I make decisions confidently after considering alternatives.", scoring: { "strongly-disagree": 1, "disagree": 2, "neutral": 3, "agree": 4, "strongly-agree": 5 } },
      { text: "I break down complex problems into manageable parts.", scoring: { "strongly-disagree": 1, "disagree": 2, "neutral": 3, "agree": 4, "strongly-agree": 5 } },
      { text: "I struggle to find effective solutions under time pressure.", scoring: { "strongly-disagree": 5, "disagree": 4, "neutral": 3, "agree": 2, "strongly-agree": 1 } },
      { text: "I reflect on past solutions to improve my problem-solving approach.", scoring: { "strongly-disagree": 1, "disagree": 2, "neutral": 3, "agree": 4, "strongly-agree": 5 } },
    ]
  },
};

const likertOptions = [
  { value: "strongly-disagree", label: "Strongly Disagree" },
  { value: "disagree", label: "Disagree" },
  { value: "neutral", label: "Neutral" },
  { value: "agree", label: "Agree" },
  { value: "strongly-agree", label: "Strongly Agree" },
];

type FormValues = { answers: string[] };

export default function Assessment({ id }: { id: string }) {
  const currentAssessment = assessmentQuestions[id];
  const questions = currentAssessment.questions;
  const numQuestions = questions.length;

  const formSchema = z.object({
    answers: z.array(z.string().min(1)).length(numQuestions),
  });

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: { answers: Array(numQuestions).fill("") },
  });

  const router = useRouter();
  const searchParams = useSearchParams();

  const selectedAssessments = searchParams.get("selectedAssessments")?.split(",") || [];
  const currentAssessmentIndex = parseInt(searchParams.get("currentAssessmentIndex") || "0");
  const numAssessments = parseInt(searchParams.get("numAssessments") || "0");

  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const watchedAnswers = form.watch("answers");
  const answeredQuestions = watchedAnswers.filter(a => a !== "").length;
  const progressPercentage = (answeredQuestions / numQuestions) * 100;

  const onAnswerChange = (value: string, index: number) => {
    form.setValue(`answers.${index}`, value);
    if (index + 1 < numQuestions && answeredQuestions + 1 === index + 1) {
      setCurrentQuestion(index + 1);
    }
  };

  const onSubmit = async (data: FormValues) => {
    setIsSubmitting(true);
    
    // CUSTOM SCORING: Each question has unique weights
    const rawScore = data.answers.reduce((total, answer, index) => 
      total + questions[index].scoring[answer]
    , 0);
    
    const minScore = numQuestions * 1;
    const maxScore = numQuestions * 5;
    const normalizedScore = Math.round(((rawScore - minScore) / (maxScore - minScore)) * 100);

    const storedScores = JSON.parse(localStorage.getItem("assessmentScores") || "{}");
    storedScores[id] = { rawScore, normalizedScore };
    localStorage.setItem("assessmentScores", JSON.stringify(storedScores));

    const nextIndex = currentAssessmentIndex + 1;
    if (nextIndex < numAssessments) {
      const query = new URLSearchParams({
        name: searchParams.get("name") || '',
        rollNumber: searchParams.get("rollNumber") || '',
        phoneNumber: searchParams.get("phoneNumber") || '',
        counselorName: searchParams.get("counselorName") || '',
        signatureDate: searchParams.get("signatureDate") || '',
        selectedAssessments: selectedAssessments.join(","),
        currentAssessmentIndex: nextIndex.toString(),
        numAssessments: numAssessments.toString(),
      }).toString();
      router.push(`/assessment/${selectedAssessments[nextIndex]}?${query}`);
    } else {
      const query = new URLSearchParams({
        name: searchParams.get("name") || '',
        rollNumber: searchParams.get("rollNumber") || '',
        phoneNumber: searchParams.get("phoneNumber") || '',
        counselorName: searchParams.get("counselorName") || '',
        signatureDate: searchParams.get("signatureDate") || '',
        hasAssessment: "true",
      }).toString();
      router.push(`/summary?${query}`);
    }
  };


return (
  <div className="min-h-screen p-4">
    <Card className="max-w-4xl mx-auto">
      <CardHeader>
        <CardTitle>{currentAssessment.name}</CardTitle>
        <Progress value={progressPercentage} />
        <p>Question {currentQuestion + 1} of {numQuestions}</p>
      </CardHeader>
      <CardContent className="p-6">
        <Form {...form}>  {/* Add this wrapper */}
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <FormField 
              control={form.control} 
              name={`answers.${currentQuestion}`} 
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-lg font-medium">
                    {currentQuestion + 1}. {questions[currentQuestion].text}
                  </FormLabel>
                  <FormControl>
                    <RadioGroup 
                      onValueChange={(value) => onAnswerChange(value, currentQuestion)} 
                      value={field.value}
                    >
                      {likertOptions.map((opt) => (
                        <div key={opt.value} className="flex items-center space-x-2 py-2">
                          <RadioGroupItem value={opt.value} id={`${currentQuestion}-${opt.value}`} />
                          <Label htmlFor={`${currentQuestion}-${opt.value}`}>{opt.label}</Label>
                        </div>
                      ))}
                    </RadioGroup>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )} 
            />
            
            <div className="flex space-x-4">
              <Button 
                type="button" 
                onClick={() => setCurrentQuestion(Math.max(0, currentQuestion - 1))}
                disabled={currentQuestion === 0}
              >
                Previous
              </Button>
              <Button 
                type="button" 
                onClick={() => setCurrentQuestion(Math.min(numQuestions - 1, currentQuestion + 1))}
                disabled={currentQuestion === numQuestions - 1}
              >
                Next
              </Button>
              {answeredQuestions === numQuestions && (
                <Button type="submit" disabled={isSubmitting} className="bg-blue-600 text-white ml-auto">
                  {isSubmitting ? "Submitting..." : "Complete Assessment"}
                </Button>
              )}
            </div>
          </form>
        </Form>  {/* End wrapper */}
      </CardContent>
    </Card>
  </div>
);
}