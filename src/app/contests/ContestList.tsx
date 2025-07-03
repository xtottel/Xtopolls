'use client';

import { useState, useEffect } from "react";
import { Search, CalendarX } from "lucide-react";
import ContestCard from "./ContestCard";
import { Container } from "@/layout/Container";
import { getApiUrl } from "@/lib/api";

type Contest = {
  id: string;
  image: string;
  alt: string;
  title: string;
  description: string;
  start_date: string;
  end_date: string;
  slug: string;
  status: "active" | "expired";
};

export default function ContestList() {
  const [searchTerm, setSearchTerm] = useState("");
  const [allContests, setAllContests] = useState<Contest[]>([]);
  const [filteredActiveContests, setFilteredActiveContests] = useState<Contest[]>([]);
  const [filteredExpiredContests, setFilteredExpiredContests] = useState<Contest[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchContests() {
      setLoading(true);
      setError(null);
      try {
        const response = await fetch(getApiUrl('/api/contests'));
        if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
        const data = await response.json();
        setAllContests(data);
      } catch (error) {
        console.error("Error fetching contests:", error);
        setError(error instanceof Error ? error.message : "Failed to fetch contests");
      } finally {
        setLoading(false);
      }
    }

    fetchContests();
  }, []);

  useEffect(() => {
    const filteredActive = allContests
      .filter((contest) => contest.status === "active")
      .filter((contest) =>
        contest.title.toLowerCase().includes(searchTerm.toLowerCase())
      );

    const filteredExpired = allContests
      .filter((contest) => contest.status === "expired")
      .filter((contest) =>
        contest.title.toLowerCase().includes(searchTerm.toLowerCase())
      );

    setFilteredActiveContests(filteredActive);
    setFilteredExpiredContests(filteredExpired);
  }, [searchTerm, allContests]);

  if (loading) {
    return <LoadingSkeleton />;
  }

  if (error) {
    return (
      <Container>
        <div className="container mx-auto px-4 py-8 text-center">
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative">
            <strong className="font-bold">Error: </strong>
            <span className="block sm:inline">{error}</span>
          </div>
          <button
            onClick={() => window.location.reload()}
            className="mt-4 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
          >
            Retry
          </button>
        </div>
      </Container>
    );
  }

  return (
    <Container>
      <div className="container mx-auto px-4 py-6">
        <div className="max-w-2xl mx-auto relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            placeholder="Search contests..."
            className="w-full px-10 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        <h2 className="text-2xl font-bold mb-6">Active Contests</h2>
        {filteredActiveContests.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
            {filteredActiveContests.map((contest) => (
              <ContestCard key={contest.id} {...contest} />
            ))}
          </div>
        ) : (
          <p className="text-gray-500">No active contests found</p>
        )}
      </div>

      {filteredExpiredContests.length > 0 && (
        <div className="container mx-auto px-4 py-8 bg-gray-50">
          <h2 className="text-2xl font-bold mb-6 flex items-center">
            <CalendarX className="mr-2 text-gray-500" />
            Expired Contests
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
            {filteredExpiredContests.map((contest) => (
              <ContestCard key={contest.id} {...contest} />
            ))}
          </div>
        </div>
      )}
    </Container>
  );
}

function LoadingSkeleton() {
  return (
    <Container>
      <div className="container mx-auto px-4 py-6">
        <div className="max-w-2xl mx-auto">
          <div className="h-10 bg-gray-200 rounded-md animate-pulse"></div>
        </div>
      </div>
      <div className="container mx-auto px-4 py-8">
        <div className="h-8 bg-gray-200 rounded w-1/4 mb-6 animate-pulse"></div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="bg-gray-200 rounded-xl h-64 animate-pulse"></div>
          ))}
        </div>
      </div>
    </Container>
  );
}