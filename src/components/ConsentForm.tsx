"use client";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { format } from "date-fns";
import { useRouter } from "next/navigation";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { FormField, FormItem, FormLabel, FormControl, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select";

const formSchema = z.object({
  name: z.string().min(2, "Enter full name"),
  rollNumber: z.string().min(1, "Enter roll number"),
  phoneNumber: z.string().min(10, "Enter valid phone"),
  counselorName: z.string().min(1, "Select counselor"),
  signatureDate: z.date({ message: "Select date" }),
});

type FormValues = z.infer<typeof formSchema>;

export default function ConsentForm() {
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

  const router = useRouter();

  const onSubmit = (data: FormValues) => {
    const submitData = {
      ...data,
      signatureDate: format(data.signatureDate, "MM/dd/yyyy"),
    };
    localStorage.setItem("consentData", JSON.stringify(submitData));
    router.push('/select-assessments');
  };

  return (
    <div className="min-h-screen p-4">
      <Card className="max-w-4xl mx-auto">
        <CardHeader>
          <CardTitle className="text-2xl">Patient Consent Form</CardTitle>
        </CardHeader>
        <CardContent className="p-6 space-y-6">
          <div className="space-y-3 text-sm text-gray-700">
            <p>I agree to participate in psychological assessments conducted by the psychologist.</p>
            <p>All information will remain confidential and used only for treatment purposes.</p>
            <p>I understand the results will guide personalized recommendations.</p>
          </div>
          
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField control={form.control} name="name" render={({ field }) => (
              <FormItem>
                <FormLabel>Full Name</FormLabel>
                <FormControl>
                  <Input {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )} />
            
            <FormField control={form.control} name="rollNumber" render={({ field }) => (
              <FormItem>
                <FormLabel>Student ID/Roll Number</FormLabel>
                <FormControl>
                  <Input {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )} />
            
            <FormField control={form.control} name="phoneNumber" render={({ field }) => (
              <FormItem>
                <FormLabel>Phone Number</FormLabel>
                <FormControl>
                  <Input {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )} />
            
            <FormField control={form.control} name="counselorName" render={({ field }) => (
              <FormItem>
                <FormLabel>Psychologist</FormLabel>
                <FormControl>
                  <Select onValueChange={field.onChange} value={field.value}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select psychologist" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Dr. Priya Sharma">Dr. Priya Sharma</SelectItem>
                      <SelectItem value="Dr. Anil Kumar">Dr. Anil Kumar</SelectItem>
                      <SelectItem value="Dr. Sarah Wilson">Dr. Sarah Wilson</SelectItem>
                    </SelectContent>
                  </Select>
                </FormControl>
                <FormMessage />
              </FormItem>
            )} />
            
            <FormField control={form.control} name="signatureDate" render={({ field }) => (
              <FormItem>
                <FormLabel>Date</FormLabel>
                <FormControl>
                  <Input 
                    type="date" 
                    onChange={(e) => field.onChange(e.target.value ? new Date(e.target.value) : undefined)}
                    value={field.value ? format(field.value, "yyyy-MM-dd") : ""}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )} />
            
            <Button type="submit" className="w-full bg-blue-600 text-white">
              Submit Consent & Continue
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}