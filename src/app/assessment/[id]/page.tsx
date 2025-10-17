"use client";
import { useParams } from 'next/navigation';
import Assessment from '@/components/Assessment';
export default function AssessmentPage() {
const params = useParams();
const id = params.id as string;
return <Assessment id={id} />;
}