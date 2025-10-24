// src/app/assessment/[id]/page.tsx
"use client";
import { useParams, useSearchParams } from 'next/navigation';
import Assessment from '@/components/Assessment';

export default function AssessmentPage() {
  const params = useParams();
  const searchParams = useSearchParams();
  const id = params.id as string;
  const userId = searchParams.get('userId');

  if (!userId) {
    return <div className="p-8 text-center text-red-600">Error: No user ID. Please start from consent form.</div>;
  }

  return <Assessment id={id} />;
}