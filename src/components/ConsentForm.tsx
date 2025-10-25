"use client";
import React from "react";
import { useForm, FormProvider } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { format } from "date-fns";
import { useRouter } from "next/navigation";
import Image from 'next/image';
import { Card, CardContent } from "@/components/ui/card";
import { FormField, FormItem, FormLabel, FormControl, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { dataManager } from "@/utils/dataManager";
import { Shield, Heart, Users, AlertTriangle, FileText, UserCheck, Loader2 } from "lucide-react";

const formSchema = z.object({
  name: z.string().min(2, "Please enter your full name"),
  rollNumber: z.string().min(1, "Please enter your roll number"),
  phoneNumber: z.string().min(10, "Please enter a valid phone number"),
  counselorName: z.string().min(1, "Please select a counselor"),
  signatureDate: z.date({ message: "Please select the signature date" }),
});

type FormValues = z.infer<typeof formSchema>;

const sections = [
  {
    icon: Heart,
    title: "Risks and Benefits of Counseling",
    content: (
      <div className="space-y-3">
        <p className="text-gray-700 text-sm leading-relaxed">
          Counseling can be an effective tool in helping students cope with emotional, relational, and developmental concerns. Counseling provides you with a safe environment to talk about your concerns with a licensed professional trained to provide treatment. The therapeutic relationship is unique because it is highly personal.
        </p>
        <div className="bg-green-50 p-4 rounded-lg border border-green-200">
          <p className="text-green-800 font-semibold text-sm mb-2">Benefits of Counseling:</p>
          <ul className="text-green-700 text-sm space-y-1 ml-4">
            <li>• Develop coping skills and make behavioral changes</li>
            <li>• Reduce symptoms of mental health disorders</li>
            <li>• Improve quality of life and manage emotions</li>
            <li>• Learn to live in the present</li>
          </ul>
        </div>
        <div className="bg-amber-50 p-4 rounded-lg border border-amber-200">
          <p className="text-amber-800 font-semibold text-sm mb-2">Important to Note:</p>
          <p className="text-amber-700 text-sm">
            Counseling can also be a difficult process. In the course of your treatment, you may experience difficult emotions or encounter unpleasant memories. Counseling is not an exact science and your therapist cannot guarantee any specific therapeutic outcome. Your therapist will, however, use their professional judgment to provide you with the best treatment possible.
          </p>
        </div>
      </div>
    ),
  },
  {
    icon: UserCheck,
    title: "Client Rights",
    content: (
      <div className="space-y-3">
        <p className="text-gray-700 text-sm mb-3">As a client, you have the right to:</p>
        <div className="grid gap-2">
          {[
            "Be treated with dignity and respect",
            "Know your counselor's qualifications and professional experience",
            "Expect your counselor to keep your treatment confidential (except as noted)",
            "Ask questions about your treatment",
            "Be informed about diagnoses, treatment philosophy, method, progress, and prognosis",
            "Participate in decisions regarding your treatment",
            "Obtain any assessment results and have them explained to you",
            "Refuse treatment methods or recommendations",
            "End counseling at any time (please discuss your reasons with your counselor)",
            "Request a second opinion, referral to another provider, or transfer to another counselor"
          ].map((right, idx) => (
            <div key={idx} className="flex items-start gap-2 bg-blue-50 p-3 rounded-lg">
              <div className="w-1.5 h-1.5 bg-blue-600 rounded-full mt-2 flex-shrink-0" />
              <p className="text-blue-900 text-sm">{right}</p>
            </div>
          ))}
        </div>
      </div>
    ),
  },
  {
    icon: Users,
    title: "Client Responsibility",
    content: (
      <div className="space-y-3">
        <p className="text-gray-700 text-sm mb-3">You have responsibility to:</p>
        <div className="grid gap-2">
          {[
            "Maintain your own personal health and safety",
            "Take an active role in the counseling process, including honestly sharing your thoughts, feelings, and concerns",
            "Help plan and follow through with your therapeutic goals",
            "Provide accurate information regarding past and present physical and psychological problems",
            "Provide notice of your desire to terminate the counseling relationship before entering into a relationship with another provider",
            "Keep scheduled appointments (contact your counselor in advance to cancel/reschedule)",
            "Inform your counselor if you become aware of any conflicts of interest",
            "Promptly notify your counselor of any problems or concerns that render you unable to participate in counseling"
          ].map((responsibility, idx) => (
            <div key={idx} className="flex items-start gap-2 bg-purple-50 p-3 rounded-lg">
              <div className="w-1.5 h-1.5 bg-purple-600 rounded-full mt-2 flex-shrink-0" />
              <p className="text-purple-900 text-sm">{responsibility}</p>
            </div>
          ))}
        </div>
      </div>
    ),
  },
  {
    icon: Shield,
    title: "Confidentiality",
    content: (
      <div className="space-y-4">
        <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
          <p className="text-blue-800 font-semibold text-sm mb-2">Our Promise:</p>
          <p className="text-blue-700 text-sm">
            Professional counselors recognize that confidentiality is essential to an effective counseling relationship. With a few exceptions (noted below), everything you share throughout your counseling treatment, including your identity, is confidential. State and federal laws establish certain rights to confidentiality.
          </p>
        </div>
        <div className="bg-red-50 p-4 rounded-lg border border-red-200">
          <h4 className="font-semibold text-red-800 text-sm mb-3 flex items-center gap-2">
            <AlertTriangle className="w-4 h-4" />
            Exceptions to student Confidentiality
          </h4>
          <ul className="text-red-700 text-sm space-y-2">
            <li><strong>Danger to self or others:</strong> If your counselor believes you intend to harm yourself or someone else, they are bound by laws and ethics to take steps to prevent that harm.</li>
            <li><strong>Minors:</strong> If you are under age 19, your parents or legal guardians have access to your records.</li>
            <li><strong>Abuse reporting:</strong> If you disclose abuse or neglect of a child, elderly person, or anyone similarly defenseless, your counselor is required by law to report it.</li>
            <li><strong>Group counseling:</strong> Your counselor maintains confidentiality, but cannot guarantee that group members will also maintain confidentiality.</li>
            <li><strong>Legal subpoenas:</strong> If a third party issues a lawful subpoena for your records, your counselor may be legally obligated to disclose them (you will be notified).</li>
            <li><strong>Administrative referrals:</strong> If you have been referred for counseling by a University administrator, your counselor will report your compliance with counseling.</li>
            <li><strong>Legal requirements:</strong> If your counselor or the University is required by law to disclose your records, they may disclose information necessary to comply.</li>
          </ul>
        </div>
      </div>
    ),
  },
  {
    icon: AlertTriangle,
    title: "Crisis Intervention",
    content: (
      <div className="space-y-3">
        <div className="bg-orange-50 p-4 rounded-lg border border-orange-200">
          <p className="text-orange-700 text-sm leading-relaxed">
            If you demonstrate that you are a danger to yourself or others, the University or your counselor may need to take steps to place you under Emergency Protective Custody (EPC). If that occurs, your counselor and another University employee will transport you to an appropriate medical facility for treatment.
          </p>
        </div>
        <p className="text-gray-700 text-sm">
          With your consent, the University will also contact your professors informing them that you will be absent from class due to a medical issue. Once you return to campus, your counselor will follow up with you regarding supportive measures.
        </p>
      </div>
    ),
  },
  {
    icon: FileText,
    title: "Professional Consultation & Additional Information",
    content: (
      <div className="space-y-3">
        <div className="bg-indigo-50 p-4 rounded-lg border border-indigo-200">
          <p className="text-indigo-800 font-semibold text-sm mb-2">Professional Consultation:</p>
          <p className="text-indigo-700 text-sm">
            Your counselor may consult with other counselors about your treatment to ensure appropriate care. All counselors involved are ethically bound to preserve confidentiality. If a conflict of interest is identified, consultation will be appropriately limited.
          </p>
        </div>
        <div className="bg-teal-50 p-4 rounded-lg border border-teal-200">
          <p className="text-teal-800 font-semibold text-sm mb-2">Discharge Based on Professional Judgment:</p>
          <p className="text-teal-700 text-sm">
            If your counselor determines that your needs go beyond their level of expertise, they have an ethical obligation to refer you to another professional who can provide the care you need. This might include a specialized counselor, medical care provider, psychologist, or psychiatrist.
          </p>
        </div>
        <div className="bg-cyan-50 p-4 rounded-lg border border-cyan-200">
          <p className="text-cyan-800 font-semibold text-sm mb-2">Authorization to Release Information:</p>
          <p className="text-cyan-700 text-sm">
            You may authorize release of your information whenever you choose. If you wish to have your counselor communicate with a professor or University administrator on your behalf, you can sign a release of information form. Your counselor will only provide information as specifically authorized and directed by you.
          </p>
        </div>
      </div>
    ),
  },
];

export default function ConsentForm() {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = React.useState(false);
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

  const onSubmit = async (data: FormValues) => {
    setIsSubmitting(true);
    const submitData = {
      name: data.name,
      rollNumber: data.rollNumber,
      phoneNumber: data.phoneNumber,
      counselorName: data.counselorName,
      signatureDate: format(data.signatureDate, "MM/dd/yyyy"),
      selectedAssessments: [],
      scores: {},
      dateCompleted: new Date().toISOString(),
    };

    try {
      const userId = await dataManager.saveUser(submitData);
      console.log("Redirecting to select-assessments with userId:", userId);
      router.push(`/select-assessments?userId=${userId}`);
    } catch (error) {
      console.error("Error saving consent:", error);
      alert("Failed to save. Please try again.");
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen p-4 md:p-6 bg-gradient-to-br from-blue-50 via-white to-indigo-50">
      <style jsx global>{`
        @media print {
          .print-hidden { display: none !important; }
          body { font-size: 12pt; margin: 0; }
        }
      `}</style>
      <div className="max-w-5xl mx-auto">
        <Card className="shadow-xl border-0 overflow-hidden">
          <CardContent className="p-0">
            <div className="relative text-center pt-10 pb-5 bg-gradient-to-r from-blue-600 to-indigo-600 text-white">
              <div className="absolute inset-0 bg-black opacity-5"></div>
              <div className="relative">
                <div className="inline-block bg-white rounded-lg shadow-lg">
                  <Image 
                    src="/logo.webp" 
                    alt="Aditya University" 
                    width={320} 
                    height={160}
                    className="relative mx-auto p-3"
                  />
                </div>
                <h1 className="text-3xl font-bold mb-2">INFORMED CONSENT</h1>
                <div className="space-y-1">
                  <p className="text-xl font-semibold">ADITYA UNIVERSITY, SURAMPALEM</p>
                  <p className="text-lg">Counseling Center</p>
                  <Badge className="mt-3 bg-white bg-opacity-20 text-white border-white border-opacity-40">Confidential Document</Badge>
                </div>
              </div>
            </div>

            <div className="p-6 md:p-8 bg-gradient-to-br from-blue-50 to-indigo-50 border-b-2 border-blue-200">
              <p className="text-gray-800 leading-relaxed mb-4">
                As a student of Aditya University&apos;s Counseling Center, your well-being is your therapist&apos;s top priority. Therapy is a relationship that works, in part, because of clearly defined rights and responsibilities held by each person. Your therapist will use their professional judgment to determine your appropriate course of therapy.
              </p>
              <p className="text-gray-800 leading-relaxed mb-4">
                This consent form helps to create the safety to take risks and the support to become empowered to change. This form is also intended to inform you about your rights as a student, limitations to those rights, and your therapist&apos;s corresponding responsibilities.
              </p>
              <div className="bg-amber-50 p-4 rounded-lg border-l-4 border-amber-500">
                <p className="text-amber-900 font-semibold mb-1">Important Notice:</p>
                <p className="text-amber-800 text-sm">
                  The consent you provide herein will last the entire duration of your treatment unless you revoke or modify your consent in writing. <strong>Do not sign this informed consent form unless you completely understand and agree to all aspects.</strong> If you have any questions, please bring this form back to your next session.
                </p>
              </div>
            </div>

            <div className="p-6 md:p-8 space-y-6">
              {sections.map((section, index) => {
                const IconComponent = section.icon;
                return (
                  <div key={index} className="border-2 border-gray-200 rounded-xl bg-white shadow-sm hover:shadow-md transition-shadow">
                    <div className="px-5 py-4 bg-gradient-to-r from-gray-50 to-white border-b border-gray-200">
                      <h3 className="font-bold text-gray-900 flex items-center gap-3 text-lg">
                        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-indigo-500 flex items-center justify-center flex-shrink-0">
                          <IconComponent className="w-5 h-5 text-white" />
                        </div>
                        {section.title}
                      </h3>
                    </div>
                    <div className="px-5 py-5">{section.content}</div>
                  </div>
                );
              })}
            </div>

            <div className="p-6 md:p-8 bg-gradient-to-br from-blue-50 to-indigo-50 border-t-4 border-blue-600">
              <FormProvider {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                  <div className="text-center mb-6">
                    <h2 className="text-2xl font-bold text-gray-900 mb-2">Required Signature</h2>
                    <p className="text-gray-600 text-sm">You may discuss any of the above with a counselor before signing</p>
                  </div>
                  
                  <Alert className="border-blue-300 bg-blue-50">
                    <AlertDescription className="text-sm text-blue-900">
                      <strong>I acknowledge that I have read and understand ALL of the above information</strong> and I am fully aware of my rights and benefits and risks of counseling. I am also aware of limits to confidentiality. If I have any questions or concerns about any of this information, I agree to discuss these concerns with the counselor.
                    </AlertDescription>
                  </Alert>

                  <div className="space-y-5 bg-white p-6 rounded-xl border-2 border-gray-200 shadow-sm">
                    <FormField
                      control={form.control}
                      name="name"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-sm font-bold text-gray-800">Student Name (Signature)</FormLabel>
                          <FormControl>
                            <Input {...field} placeholder="Enter your full name" className="h-11 text-base border-gray-300 focus:border-blue-500" />
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
                          <FormLabel className="text-sm font-bold text-gray-800">Roll Number</FormLabel>
                          <FormControl>
                            <Input {...field} placeholder="Enter your roll number" className="h-11 text-base border-gray-300 focus:border-blue-500" />
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
                          <FormLabel className="text-sm font-bold text-gray-800">Phone Number</FormLabel>
                          <FormControl>
                            <Input {...field} placeholder="Enter your phone number" className="h-11 text-base border-gray-300 focus:border-blue-500" />
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
                          <FormLabel className="text-sm font-bold text-gray-800">Counselor Name</FormLabel>
                          <FormControl>
                            <Select onValueChange={field.onChange} value={field.value}>
                              <SelectTrigger className="h-11 border-gray-300 focus:border-blue-500">
                                <SelectValue placeholder="Select your counselor" />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="Dr. Sohel">Dr. Sohel</SelectItem>
                                <SelectItem value="Dr. Katyayini">Dr. Katyayini</SelectItem>
                              </SelectContent>
                            </Select>
                          </FormControl>
                          <FormMessage className="text-xs" />
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={form.control}
                      name="signatureDate"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-sm font-bold text-gray-800">Date</FormLabel>
                          <FormControl>
                            <Input
                              type="date"
                              {...field}
                              value={field.value ? format(field.value, "yyyy-MM-dd") : ""}
                              onChange={(e) => field.onChange(e.target.value ? new Date(e.target.value) : undefined)}
                              className="h-11 w-40 text-base border-gray-300 focus:border-blue-500"
                            />
                          </FormControl>
                          <FormMessage className="text-xs" />
                        </FormItem>
                      )}
                    />
                  </div>

                  <div className="flex justify-center print-hidden pt-4">
                    <Button 
                      type="submit" 
                      disabled={isSubmitting}
                      className="w-full max-w-md bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white h-12 text-lg font-semibold shadow-lg hover:shadow-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {isSubmitting ? (
                        <>
                          <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                          Submitting...
                        </>
                      ) : (
                        "Submit Consent & Continue"
                      )}
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