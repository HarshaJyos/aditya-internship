"use client";
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import Image from 'next/image';

export default function LandingPage() {
  const router = useRouter();

  const handleGetStarted = () => {
    router.push('/consent');
  };

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
          <Button onClick={handleGetStarted} className="bg-blue-600 text-white">
            Get Started
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
