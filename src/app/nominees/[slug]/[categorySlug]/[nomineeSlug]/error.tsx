'use client';

import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';

export default function Error({
  error,
  reset,
}: {
  error: Error;
  reset: () => void;
}) {
  return (
    <div className="container mx-auto px-4 py-12">
      <div className="max-w-3xl mx-auto text-center">
        <h2 className="text-2xl font-bold text-red-600 mb-4">
          {error.message.includes('not found') ? 'Nominee Not Found' : 'Error Loading Nominee'}
        </h2>
        <p className="text-gray-600 mb-6">{error.message}</p>
        <div className="flex justify-center gap-4">
          <button
            onClick={reset}
            className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
          >
            Try Again
          </button>
          <Link
            href="/contests"
            className="flex items-center gap-2 px-4 py-2 text-blue-600 hover:text-blue-800"
          >
            <ArrowLeft className="w-5 h-5" />
            <span>Back to Contests</span>
          </Link>
        </div>
      </div>
    </div>
  );
}