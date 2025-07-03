import Link from 'next/link';
import { notFound } from 'next/navigation';
import { ArrowLeft, Users, Calendar } from 'lucide-react';
import PageHeader from '@/components/common/PageHeader';
import { Container } from '@/layout/Container';
import { createClient } from '@supabase/supabase-js';
import { getApiUrl } from '@/lib/api';

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
  description: string;
  image: string;
  end_date: string;
  category_count: number;
}

async function getContestData(contestSlug: string) {
  try {
    const res = await fetch(
      getApiUrl(`/api/contests/${contestSlug}`),
      { next: { revalidate: 60 } } // Revalidate every 60 seconds
    );

    if (!res.ok) {
      if (res.status === 404) return null;
      throw new Error('Failed to fetch contest data');
    }

    return await res.json();
  } catch (error) {
    console.error('Error fetching contest data:', error);
    throw error;
  }
}

export default async function ContestPage({
  params,
}: {
  params: { contestSlug: string };
}) {
  let data;
  try {
    data = await getContestData(params.contestSlug);
  } catch (error) {
    console.error('Error in page component:', error);
    // You could also redirect to an error page here if preferred
    // rirect to '/error'; // Example error page
    
    return (
      <div className="container mx-auto px-4 py-8 text-center">
        <h2 className="text-2xl font-bold text-red-600 mb-4">Error Loading Contest</h2>
        <p className="text-gray-600 mb-4">Sorry, we couldn&apos;t load this contest.</p>
        <Link
          href="/contests"
          className="inline-flex items-center gap-2 text-blue-600 hover:text-blue-800"
        >
          <ArrowLeft className="w-5 h-5" />
          <span>Back to Contests</span>
        </Link>
      </div>
    );
  }

  if (!data) {
    return notFound();
  }

  const { contest, categories }: { contest: Contest; categories: Category[] } = data;

  return (
    <>
      <PageHeader
        title={contest.title}
        description={contest.description}
        backgroundImage={contest.image}
      />
      <Container>
        <div className="container mx-auto px-4 py-8">
          <div className="flex flex-col space-y-4 sm:space-y-0 sm:flex-row sm:items-center sm:justify-between mb-8">
            <Link
              href="/contests"
              className="flex items-center gap-2 text-gray-600 hover:text-gray-900 transition-colors"
            >
              <ArrowLeft className="w-5 h-5" />
              <span>Back to Contests</span>
            </Link>
            <div className="flex flex-col space-y-2 sm:space-y-0 sm:flex-row sm:items-center sm:gap-4">
              <div className="flex items-center gap-2 bg-gray-100 px-4 py-2 rounded-full">
                <Users className="w-5 h-5 text-gray-600" />
                <span className="text-gray-600">
                  {contest.category_count} Categories
                </span>
              </div>
              <div className="flex items-center gap-2 bg-gray-100 px-4 py-2 rounded-full">
                <Calendar className="w-5 h-5 text-gray-600" />
                <span className="text-gray-600">
                  Ends {new Date(contest.end_date).toLocaleDateString()}
                </span>
              </div>
            </div>
          </div>

          {categories.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
              {categories.map((category) => (
                <Link
                  key={category.id}
                  href={`/categories/${category.slug}?contestSlug=${params.contestSlug}`}
                  className="group"
                >
                  <div className="border rounded-xl overflow-hidden hover:shadow-lg transition-all duration-200 h-full flex flex-col">
                    <div className="p-6 flex-1">
                      <h3 className="text-xl font-semibold mb-2 group-hover:text-blue-600 transition-colors">
                        {category.name}
                      </h3>
                      <p className="text-gray-600 mb-4">{category.description}</p>
                      <div className="flex items-center gap-2 text-gray-500">
                        <Users className="w-5 h-5" />
                        <span>{category.nominee_count} Nominees</span>
                      </div>
                    </div>
                    <div className="bg-gray-50 px-6 py-4 border-t">
                      <div className="text-blue-600 font-medium group-hover:translate-x-1 transition-transform">
                        View Nominees →
                      </div>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <p className="text-gray-500">No categories found for this contest</p>
              <Link
                href="/contests"
                className="mt-4 inline-flex items-center gap-2 text-blue-600 hover:text-blue-800"
              >
                <ArrowLeft className="w-5 h-5" />
                <span>Back to Contests</span>
              </Link>
            </div>
          )}
        </div>
      </Container>
    </>
  );
}

export async function generateStaticParams() {
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );

  try {
    const { data: contests } = await supabase
      .from('contests')
      .select('slug');

    return contests?.map((contest) => ({
      contestSlug: contest.slug,
    })) || [];
  } catch (error) {
    console.error('Error generating static params:', error);
    return [];
  }
}