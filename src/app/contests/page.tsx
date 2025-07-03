"use client";
import { Suspense } from "react";
import ContestList from "./ContestList";
import ContestsHero from "./ContestsHero";

export default function ContestsPage() {
  return (
    <>
      <ContestsHero />

      <Suspense fallback={<LoadingState />}>
        <ContestList />
      </Suspense>
    </>
  );
}

function LoadingState() {
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-2xl mx-auto">
        <div className="animate-pulse">
          <div className="h-10 bg-gray-200 rounded-md mb-4"></div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[1, 2, 3].map((i) => (
              <div key={i} className="bg-gray-200 rounded-xl h-64"></div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
