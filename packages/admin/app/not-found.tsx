import React from 'react';
import Link from 'next/link';

export default function NotFound() {
  return (
    <div className="h-screen flex flex-col items-center justify-center">
        <h1 className="text-4xl font-bold">404 - Page Not Found</h1>
        <p className="mb-4">Could not find the requested resource.</p>
        <Link href="/" className="text-blue-500 underline">Return Home</Link>
    </div>
  );
}