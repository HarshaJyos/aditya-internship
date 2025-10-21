"use client";
import { useForm, FormProvider } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { format } from "date-fns";
import { useRouter } from "next/navigation";
import Image from 'next/image';

import { Card, CardContent } from "@/components/ui/card";
import {  FormField, FormItem, FormLabel, FormControl, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select";
import { Alert, AlertDescription } from "@/components/ui/alert";

const formSchema = z.object({
  name: z.string().min(2, "Please enter your full name"),
  rollNumber: z.string().min(1, "Please enter your roll number"),
  phoneNumber: z.string().min(10, "Please enter a valid phone number"),
  counselorName: z.string().min(1, "Please select a counselor"),
  signatureDate: z.date({ message: "Please select the signature date" }),
});

type FormValues = z.infer<typeof formSchema>;

// ✅ ALL SECTIONS FROM OLD FORM (SIMPLE UI)
const sections = [
  {
    title: "Welcome to Aditya University, Surampalem",
    content: (
      <div className="space-y-2">
        <div className="bg-green-50 p-3 rounded border-l-4 border-green-400">
          <h4 className="font-semibold text-green-800 text-sm mb-1">What We Offer:</h4>
          <ul className="text-green-700 text-xs space-y-1">
            <li>• Individual counseling sessions</li>
            <li>• Group therapy opportunities</li>
            <li>• Workshops to enhance your skills</li>
          </ul>
        </div>
      </div>
    ),
  },
  {
    title: "What is Counseling Support?",
    content: (
      <div className="space-y-3">
        <p className="text-gray-700 text-sm leading-relaxed">
          Counseling at the University Counselling Centre is a friendly and supportive space where you can share your thoughts, explore personal concerns, and develop strategies to enhance your well-being.
        </p>
        <div className="bg-blue-50 p-3 rounded border border-blue-200">
          <p className="text-blue-800 font-medium text-sm mb-1">Why It Helps:</p>
          <ul className="text-blue-700 text-xs space-y-1">
            <li>• Build confidence and coping skills</li>
            <li>• Navigate academic and personal challenges</li>
            <li>• Feel supported in a safe environment</li>
          </ul>
        </div>
      </div>
    ),
  },
  {
    title: "Your Role in Counseling",
    content: (
      <div className="space-y-2">
        <p className="text-gray-700 text-sm leading-relaxed">
          Your participation makes counseling more effective. Feel free to share your thoughts and work with your counselor to set goals that suit you.
        </p>
        <div className="bg-purple-50 p-3 rounded">
          <ul className="text-purple-700 text-xs space-y-1">
            <li>• Attend sessions at your convenience</li>
            <li>• Share your experiences for tailored support</li>
            <li>• Let your counselor know if you need a different approach</li>
          </ul>
        </div>
      </div>
    ),
  },
  {
    title: "Keeping Your Conversations Private",
    content: (
      <div className="space-y-3">
        <div className="bg-blue-50 p-3 rounded border border-blue-200">
          <p className="text-blue-800 font-medium text-sm mb-1">Our Promise:</p>
          <p className="text-blue-700 text-xs">
            Everything you discuss is kept confidential, creating a safe space for you to open up.
          </p>
        </div>
        <div className="bg-yellow-50 p-3 rounded border border-yellow-200">
          <h4 className="font-semibold text-yellow-800 text-sm mb-1">When We May Share:</h4>
          <ul className="text-yellow-700 text-xs space-y-1">
            <li>• If there&apos;s risk of harm to you or others</li>
            <li>• With your permission, to university staff</li>
          </ul>
        </div>
      </div>
    ),
  },
];

export default function ConsentForm() {
  const router = useRouter();
  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
      rollNumber: "",
      phoneNumber: "",
      counselorName: "",
      signatureDate: undefined,
    },
  });

  const onSubmit = (data: FormValues) => {
    const submitData = {
      ...data,
      signatureDate: format(data.signatureDate, "MM/dd/yyyy"),
    };
    // ✅ TEMP STORAGE
    localStorage.setItem("tempConsentData", JSON.stringify(submitData));
    router.push('/select-assessments');
  };


  return (
    <div className="min-h-screen p-6 bg-white">
      <style jsx global>{`
        @media print {
          .print-hidden { display: none !important; }
          body { font-size: 12pt; margin: 0; }
        }
      `}</style>
      
      <div className="max-w-4xl mx-auto">
        <Card className="border-0 shadow-none print:shadow-none">
          <CardContent className="p-0">
            {/* ✅ HEADER - SIMPLE & PROFESSIONAL */}
            <div className="text-center py-8 border-b-2 border-gray-200">
              <div className="inline-block w-16 h-16 mb-4">
                <Image 
                  src="/logo.jpeg" 
                  alt="Aditya University" 
                  width={64} 
                  height={64}
                  className="object-contain"
                />
              </div>
              <h1 className="text-2xl font-bold text-gray-800 mb-2">INFORMED CONSENT</h1>
              <div className="text-sm text-gray-600 space-y-1">
                <p className="text-xl font-bold text-blue-800">ADITYA UNIVERSITY, SURAMPALEM</p>
                <p className="font-semibold text-gray-700">University Counselling Centre</p>
                <p className="text-xs">Surampalem, Andhra Pradesh | (123) 456-7890 | counseling@adityauniversity.edu</p>
                <Badge className="mt-2 border-blue-600 text-blue-600 text-xs">Confidential</Badge>
              </div>
            </div>

            {/* ✅ INTRODUCTION - SIMPLE */}
            <div className="p-6 bg-gray-50 border-b border-gray-200">
              <p className="text-sm text-gray-700 leading-relaxed mb-4">
                At Aditya University, we prioritize both your physical and mental well-being. For your physical health, we have partnered with Apollo, and for your mental well-being, our dedicated student counselors are here to support you. The University Counselling Centre provides a safe and confidential space for all students. You can attend multiple counseling sessions as per your wish.
              </p>
              <div className="bg-amber-50 p-3 rounded border-l-4 border-amber-400">
                <p className="text-xs text-amber-800 font-medium">
                  Please sign this form only if you understand and agree with the information.
                </p>
              </div>
            </div>

            {/* ✅ SECTIONS - MINIMALISTIC */}
            <div className="p-6 space-y-4">
              {sections.map((section, index) => (
                <div key={index} className="border border-gray-200 rounded-lg bg-white">
                  <h3 className="px-4 py-3 font-semibold text-gray-800 bg-gray-50 border-b">
                    {section.title}
                  </h3>
                  <div className="px-4 py-3 text-sm">{section.content}</div>
                </div>
              ))}
            </div>

            {/* ✅ FORM - CLEAN & SIMPLE */}
            <div className="p-6 border-t-2 border-blue-600">
              <FormProvider {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                  <div className="text-center mb-6">
                    <h2 className="text-xl font-bold text-gray-900 mb-2">Your Information</h2>
                    <Badge className="bg-blue-100 text-blue-800 text-xs">Please fill all fields</Badge>
                  </div>

                  {/* ✅ CONSENT CHECKBOX */}
                  <Alert className="border-blue-200 bg-blue-50 mb-6">
                    <AlertDescription className="text-sm text-blue-800">
                      I have read and understood the information above and agree to proceed with counseling at the University Counselling Centre.
                    </AlertDescription>
                  </Alert>

                  {/* ✅ INPUT FIELDS - SIMPLE */}
                  <div className="space-y-4 bg-gray-50 p-4 rounded-lg border">
                    <FormField
                      control={form.control}
                      name="name"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-sm font-semibold text-gray-800">Full Name</FormLabel>
                          <FormControl>
                            <Input {...field} className="h-10 text-base border-gray-300" />
                          </FormControl>
                          <FormMessage className="text-xs" />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="rollNumber"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-sm font-semibold text-gray-800">Roll Number</FormLabel>
                          <FormControl>
                            <Input {...field} className="h-10 text-base border-gray-300" />
                          </FormControl>
                          <FormMessage className="text-xs" />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="phoneNumber"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-sm font-semibold text-gray-800">Phone Number</FormLabel>
                          <FormControl>
                            <Input {...field} className="h-10 text-base border-gray-300" />
                          </FormControl>
                          <FormMessage className="text-xs" />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="counselorName"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-sm font-semibold text-gray-800">Counselor</FormLabel>
                          <FormControl>
                            <Select onValueChange={field.onChange} value={field.value}>
                              <SelectTrigger className="h-10 border-gray-300">
                                <SelectValue placeholder="Select counselor" />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="Dr. Priya Sharma">Dr. Priya Sharma</SelectItem>
                                <SelectItem value="Dr. Anil Kumar">Dr. Anil Kumar</SelectItem>
                                <SelectItem value="Dr. Sarah Wilson">Dr. Sarah Wilson</SelectItem>
                              </SelectContent>
                            </Select>
                          </FormControl>
                          <FormMessage className="text-xs" />
                        </FormItem>
                      )}
                    />
                  </div>

                  <FormField
                    control={form.control}
                    name="signatureDate"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-sm font-semibold text-gray-800">Date</FormLabel>
                        <FormControl>
                          <Input
                            type="date"
                            {...field}
                            value={field.value ? format(field.value, "yyyy-MM-dd") : ""}
                            onChange={(e) => field.onChange(e.target.value ? new Date(e.target.value) : undefined)}
                            className="h-10 text-base border-gray-300"
                          />
                        </FormControl>
                        <FormMessage className="text-xs" />
                      </FormItem>
                    )}
                  />

                  <div className="flex justify-center print-hidden pt-4">
                    <Button type="submit" className="w-full max-w-xs bg-blue-600 text-white h-10">
                      Submit Consent & Continue
                    </Button>
                  </div>
                </form>
              </FormProvider>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}