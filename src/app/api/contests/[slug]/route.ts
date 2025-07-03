import { createClient } from "@supabase/supabase-js";
import { NextResponse } from "next/server";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
const supabase = createClient(supabaseUrl, supabaseKey);

export async function GET(
  request: Request,
  { params }: { params: { slug: string } }
) {
  try {
    // Fetch contest data
    const { data: contest, error: contestError } = await supabase
      .from('contests')
      .select('id, title, description, image, end_date')
      .eq('slug', params.slug)
      .single();

    if (contestError || !contest) {
      console.error('Contest fetch error:', contestError);
      return NextResponse.json(
        { error: "Contest not found" },
        { status: 404 }
      );
    }

    // Fetch categories with nominee count
    const { data: categories, error: categoriesError } = await supabase
      .from('categories')
      .select(`
        id,
        name,
        description,
        slug,
        nominees:nominees(count)
      `)
      .eq('contest_id', contest.id);

    if (categoriesError) {
      console.error('Categories fetch error:', categoriesError);
      return NextResponse.json(
        { error: "Failed to fetch categories" },
        { status: 500 }
      );
    }

    // Transform categories data to include nominee_count
    const transformedCategories = (categories || []).map(category => ({
      id: category.id,
      name: category.name,
      description: category.description,
      slug: category.slug,
      nominee_count: category.nominees?.[0]?.count || 0
    }));

    return NextResponse.json({
      contest: {
        ...contest,
        category_count: transformedCategories.length
      },
      categories: transformedCategories
    });

  } catch (error) {
    console.error('Server-side error:', error);
    return NextResponse.json(
      { error: "An unexpected error occurred" },
      { status: 500 }
    );
  }
}