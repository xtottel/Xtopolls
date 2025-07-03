import Link from 'next/link';
import { notFound } from 'next/navigation';
import { ArrowLeft, Vote, Users, Lock } from 'lucide-react';
import PageHeader from '@/components/common/PageHeader';
import { Container } from '@/layout/Container';
import Image from 'next/image';
import { getApiUrl } from '@/lib/api';

interface Nominee {
  id: string;
  name: string;
  image_url: string;
  description: string;
  nominee_code: string;
  votes: number;
}

interface Category {
  id: string;
  name: string;
  description: string;
  slug: string;
  nominee_count: number;
}

interface Contest {
  id: string;
  title: string;
  image: string;
  end_date: string;
  results_visible: boolean;
  status: "active" | "expired";
}

async function getCategoryData(categorySlug: string, contestSlug: string) {
  try {
    const res = await fetch(
      getApiUrl(`/api/categories/${categorySlug}?contestSlug=${contestSlug}`),
      { next: { revalidate: 60 } }
    );

    if (!res.ok) {
      if (res.status === 404) return null;
      throw new Error('Failed to fetch category data');
    }

    const data = await res.json();
    
    if (!data.category || !data.nominees || !data.contest) {
      throw new Error('Invalid data structure received');
    }

    return data;
  } catch (error) {
    console.error('Error fetching category data:', error);
    throw error;
  }
}

export default async function CategoryPage({
  params,
  searchParams,
}: {
  params: { categorySlug: string };
  searchParams: { contestSlug: string };
}) {
  if (!searchParams.contestSlug) {
    return notFound();
  }

  let data;
  try {
    data = await getCategoryData(params.categorySlug, searchParams.contestSlug);
  } catch (error) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-red-600 mb-4">Error</h2>
          <p className="text-gray-600">
            {error instanceof Error ? error.message : 'An error occurred'}
          </p>
          <Link
            href={`/contests/${searchParams.contestSlug}`}
            className="mt-4 inline-flex items-center gap-2 text-blue-600 hover:text-blue-800"
          >
            <ArrowLeft className="w-5 h-5" />
            <span>Back to Contest</span>
          </Link>
        </div>
      </div>
    );
  }

  if (!data) {
    return notFound();
  }

  const { category, nominees, contest }: { 
    category: Category; 
    nominees: Nominee[]; 
    contest: Contest 
  } = data;

  const isContestActive = contest.status === "active";
  const canShowResults = contest.results_visible === true;

  return (
    <>
      <PageHeader
        title={category.name}
        description={category.description}
        backgroundImage={contest.image}
      />
      <Container>
        <div className="container mx-auto px-4 py-8">
          <div className="flex flex-col space-y-4 sm:space-y-0 sm:flex-row sm:items-center sm:justify-between mb-8">
            <Link
              href={`/contests/${searchParams.contestSlug}`}
              className="flex items-center gap-2 text-gray-600 hover:text-gray-900 transition-colors"
            >
              <ArrowLeft className="w-5 h-5" />
              <span>Back to Contest</span>
            </Link>
            <div className="flex items-center gap-2 bg-gray-100 px-4 py-2 rounded-full">
              <Users className="w-5 h-5 text-gray-600" />
              <span className="text-gray-600">
                {category.nominee_count} Nominees
              </span>
            </div>
          </div>

          {nominees.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
              {nominees.map((nominee) => (
                <div
                  key={nominee.id}
                  className="border rounded-xl overflow-hidden hover:shadow-lg transition-all duration-200 h-full flex flex-col"
                >
                  <div className="relative h-64">
                    <Image
                      src={nominee.image_url}
                      alt={nominee.name}
                      fill
                      className="object-cover"
                      sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 25vw"
                    />
                  </div>
                  <div className="p-6 flex-1">
                    <h3 className="text-xl font-semibold mb-2">
                      {nominee.name}
                    </h3>
                    {canShowResults ? (
                      <div className="flex items-center gap-2 text-gray-500 mb-4">
                        <Vote className="w-5 h-5" />
                        <span>{nominee.votes.toLocaleString()} votes</span>
                      </div>
                    ) : (
                      <div className="flex items-center gap-2 text-gray-500 mb-4">
                        <Lock className="w-5 h-5" />
                        <span>Results hidden</span>
                      </div>
                    )}
                  </div>
                  <div className="bg-gray-50 px-6 py-4 border-t">
                    <Link
                      href={`/nominees/${searchParams.contestSlug}/${params.categorySlug}/${nominee.nominee_code}`}
                      className={`w-full flex items-center justify-center gap-2 py-2 px-4 rounded-md transition-colors ${
                        isContestActive
                          ? "bg-blue-600 text-white hover:bg-blue-700"
                          : "bg-gray-200 text-gray-500 cursor-not-allowed"
                      }`}
                    >
                      <Vote className="w-5 h-5" />
                      {isContestActive ? "Vote Now" : "Voting Closed"}
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8">
              <p className="text-gray-500">
                No nominees found in this category
              </p>
            </div>
          )}
        </div>
      </Container>
    </>
  );
}