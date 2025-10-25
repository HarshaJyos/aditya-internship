import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import Image from 'next/image';
import Link from 'next/link';
import { Heart, Brain, Users, Sparkles } from 'lucide-react';

export default function LandingPage() {
  return (
    <div className="min-h-screen relative overflow-hidden bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50">
      {/* Animated background elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-20 left-10 w-72 h-72 bg-blue-200 rounded-full mix-blend-multiply filter blur-xl opacity-30 animate-pulse"></div>
        <div className="absolute top-40 right-10 w-72 h-72 bg-purple-200 rounded-full mix-blend-multiply filter blur-xl opacity-30 animate-pulse" style={{animationDelay: '1s'}}></div>
        <div className="absolute -bottom-8 left-1/2 w-72 h-72 bg-indigo-200 rounded-full mix-blend-multiply filter blur-xl opacity-30 animate-pulse" style={{animationDelay: '2s'}}></div>
      </div>

      <div className="relative flex items-center justify-center min-h-screen p-4">
        <Card className="w-full max-w-4xl shadow-2xl border-0 bg-white/80 backdrop-blur-sm">
          <CardHeader className="text-center pt-12 pb-8">
            <div className="relative inline-block mb-6">
              <Image 
                src="/logo.webp" 
                alt="Logo" 
                width={320} 
                height={160} 
                className="relative mx-auto border-4 p-3 rounded-lg border-white shadow-lg" 
              />
            </div>
            
            <CardTitle className="text-5xl font-bold bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 bg-clip-text text-transparent mb-4">
              Aditya University Counselling
            </CardTitle>
            
            <p className="mt-4 text-2xl text-gray-700 font-medium">
              Supporting Your Mental Well-Being
            </p>
          </CardHeader>

          <CardContent className="px-8 pb-12">
            {/* Feature highlights */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
              <div className="flex flex-col items-center p-4 rounded-lg bg-gradient-to-br from-blue-50 to-blue-100 transform transition-all hover:scale-105 hover:shadow-md">
                <div className="w-14 h-14 rounded-full bg-blue-500 flex items-center justify-center mb-3 shadow-lg">
                  <Brain className="w-7 h-7 text-white" />
                </div>
                <h3 className="font-semibold text-gray-800 mb-1">Confidential</h3>
                <p className="text-sm text-gray-600 text-center">Your privacy matters to us</p>
              </div>

              <div className="flex flex-col items-center p-4 rounded-lg bg-gradient-to-br from-purple-50 to-purple-100 transform transition-all hover:scale-105 hover:shadow-md">
                <div className="w-14 h-14 rounded-full bg-purple-500 flex items-center justify-center mb-3 shadow-lg">
                  <Heart className="w-7 h-7 text-white" />
                </div>
                <h3 className="font-semibold text-gray-800 mb-1">Supportive</h3>
                <p className="text-sm text-gray-600 text-center">Here to help you thrive</p>
              </div>

              <div className="flex flex-col items-center p-4 rounded-lg bg-gradient-to-br from-indigo-50 to-indigo-100 transform transition-all hover:scale-105 hover:shadow-md">
                <div className="w-14 h-14 rounded-full bg-indigo-500 flex items-center justify-center mb-3 shadow-lg">
                  <Users className="w-7 h-7 text-white" />
                </div>
                <h3 className="font-semibold text-gray-800 mb-1">Professional</h3>
                <p className="text-sm text-gray-600 text-center">Expert guidance available</p>
              </div>
            </div>

            {/* Main CTA section */}
            <div className="text-center">
              <p className="text-xl mb-8 text-gray-700">
                Welcome to our assessment platform for students.
              </p>
              
              <Link 
                href="/consent" 
                className="inline-flex items-center gap-2 px-8 py-4 rounded-full no-underline bg-gradient-to-r from-blue-600 to-indigo-600 text-white text-lg font-semibold shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-200 hover:from-blue-700 hover:to-indigo-700"
              >
                <Sparkles className="w-5 h-5" />
                Get Started
              </Link>

              <p className="mt-6 text-sm text-gray-500">
                Take the first step towards better mental wellness
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}