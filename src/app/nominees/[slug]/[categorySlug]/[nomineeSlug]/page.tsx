import PageHeader from '@/components/common/PageHeader';
import NomineeDetails from './NomineeDetails';
import PaymentForm from './PaymentForm';
import ErrorDisplay from './error';
import { createClient } from '@supabase/supabase-js';
import { getApiUrl } from '@/lib/api';
import Script from 'next/script';



async function getNomineeData(
  contestSlug: string,
  categorySlug: string,
  nomineeSlug: string
) {
  try {
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    );

    // Fetch contest data
    const { data: contest, error: contestError } = await supabase
      .from('contests')
      .select('id, title, image, cost_per_vote')
      .eq('slug', contestSlug)
      .single();

    if (contestError || !contest) {
      throw contestError || new Error('Contest not found');
    }

    // Fetch category data
    const { data: category, error: categoryError } = await supabase
      .from('categories')
      .select('id, name')
      .eq('contest_id', contest.id)
      .eq('slug', categorySlug)
      .single();

    if (categoryError || !category) {
      throw categoryError || new Error('Category not found');
    }

    // Fetch nominee data from API route
    const res = await fetch(
      getApiUrl(`/api/nominees/${contestSlug}/${categorySlug}/${nomineeSlug}`)
    );

    if (!res.ok) {
      if (res.status === 404) return null;
      throw new Error('Failed to fetch nominee data');
    }

    const nominee = await res.json();

    return { nominee, contest, category };
  } catch (error) {
    console.error('Error fetching data:', error);
    throw error;
  }
}

export default async function NomineePage({
  params,
}: {
  params: { slug: string; categorySlug: string; nomineeSlug: string };
}) {
  let data;
  try {
    data = await getNomineeData(params.slug, params.categorySlug, params.nomineeSlug);
  } catch (error) {
    return (
      <ErrorDisplay 
        error={error instanceof Error ? error : new Error('An error occurred')} reset={function (): void {
          throw new Error('Function not implemented.');
        } }      />
    );
  }

  if (!data) {
    return (
      <ErrorDisplay 
        error={new Error("Nominee not found")} reset={function (): void {
          throw new Error('Function not implemented.');
        } }      />
    );
  }

  const { nominee, contest, category } = data;

  return (
    <>
      <Script src="https://js.paystack.co/v2/inline.js" strategy="afterInteractive" />
      
      <PageHeader
        title={`Vote for ${nominee.name}`}
        description={`${category.name} - ${contest.title}`}
        backgroundImage={nominee.image_url}
      />

      <div className="container mx-auto px-4 py-12">
        <div className="max-w-3xl mx-auto">
          <NomineeDetails 
            contestSlug={params.slug}
            categorySlug={params.categorySlug}
            nominee={nominee}
          />
          
          <PaymentForm 
            contest={contest}
            nominee={nominee}
            category={category}
          />
        </div>
      </div>
    </>
  );
}