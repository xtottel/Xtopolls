import { createClient } from "@supabase/supabase-js";
import { NextRequest, NextResponse } from 'next/server';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

interface Nominee {
  id: string;
  name: string;
  image_url: string;
  description: string;
  nominee_code: string;
}

interface NomineeWithVotes extends Nominee {
  votes: number;
}

export async function GET(
  request: NextRequest,
  { params }: { params: { categorySlug: string } }
) {
  try {
    const { searchParams } = new URL(request.url);
    const contestSlug = searchParams.get('contestSlug');

    if (!contestSlug || typeof contestSlug !== 'string') {
      return NextResponse.json(
        { error: "Missing contestSlug parameter" },
        { status: 400 }
      );
    }

    // Fetch contest data
    const { data: contest, error: contestError } = await supabase
      .from("contests")
      .select("id, title, image, end_date, results_visible, status")
      .eq("slug", contestSlug)
      .single();

    if (contestError || !contest) {
      return NextResponse.json(
        { error: "Contest not found" },
        { status: 404 }
      );
    }

    // Fetch category data
    const { data: category, error: categoryError } = await supabase
      .from("categories")
      .select("id, name, description, slug")
      .eq("slug", params.categorySlug)
      .eq("contest_id", contest.id)
      .single();

    if (categoryError || !category) {
      return NextResponse.json(
        { error: "Category not found" },
        { status: 404 }
      );
    }

    // Fetch nominees
    const { data: nominees, error: nomineesError } = await supabase
      .from("nominees")
      .select("id, name, image_url, description, nominee_code")
      .eq("category_id", category.id);

    if (nomineesError || !nominees) {
      return NextResponse.json(
        { error: "Failed to fetch nominees" },
        { status: 500 }
      );
    }

    // Count votes
    const nomineeIds = nominees.map((n) => n.id);
    const { data: votes, error: votesError } = await supabase
      .from("votes")
      .select("nominee_id")
      .in("nominee_id", nomineeIds);

    if (votesError) {
      return NextResponse.json(
        { error: "Failed to fetch votes" },
        { status: 500 }
      );
    }

    const voteCountMap: Record<string, number> = {};
    for (const vote of votes ?? []) {
      voteCountMap[vote.nominee_id] = (voteCountMap[vote.nominee_id] || 0) + 1;
    }

    const nomineesWithVotes: NomineeWithVotes[] = nominees.map((n) => ({
      ...n,
      votes: voteCountMap[n.id] || 0,
    }));

    return NextResponse.json({
      contest: {
        id: contest.id,
        title: contest.title,
        image: contest.image,
        end_date: contest.end_date,
        status: contest.status,
        results_visible: contest.results_visible,
      },
      category: {
        id: category.id,
        name: category.name,
        description: category.description,
        slug: category.slug,
        nominee_count: nominees.length,
      },
      nominees: nomineesWithVotes.sort((a, b) => b.votes - a.votes),
    });
  } catch (error) {
    console.error("Unexpected error:", error);
    return NextResponse.json(
      { error: "Unexpected server error" },
      { status: 500 }
    );
  }
}