
"use client";
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import Image from 'next/image';
import Link from 'next/link';

export default function LandingPage() {


  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <Card className="w-full max-w-4xl">
        <CardHeader className="text-center">
          <Image src="/logo.webp" alt="Logo" width={100} height={100} className="mx-auto mb-4" />
          <CardTitle className="text-4xl">Aditya University Counselling</CardTitle>
          <p className="mt-4 text-lg">Supporting Your Mental Well-Being</p>
        </CardHeader>
        <CardContent className="text-center">
          <p className="text-xl mb-8">Welcome to our assessment platform for students.</p>
          <Link href="/consent" className="no-underline bg-blue-600 text-white">
            Get Started
          </Link>
        </CardContent>
      </Card>
    </div>
  );
}
