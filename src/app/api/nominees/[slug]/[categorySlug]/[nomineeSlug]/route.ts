import { createClient } from "@supabase/supabase-js";
import { NextResponse } from "next/server";

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
  request: Request,
  { params }: { params: { slug: string; categorySlug: string; nomineeSlug: string } }
) {
  try {
    // Get contest
    const { data: contest, error: contestError } = await supabase
      .from("contests")
      .select("id, slug")
      .eq("slug", params.slug)
      .single();

    if (contestError || !contest) {
      return NextResponse.json(
        { error: "Contest not found" },
        { status: 404 }
      );
    }

    // Get category
    const { data: category, error: categoryError } = await supabase
      .from("categories")
      .select("id, slug")
      .eq("contest_id", contest.id)
      .eq("slug", params.categorySlug)
      .single();

    if (categoryError || !category) {
      return NextResponse.json(
        { error: "Category not found" },
        { status: 404 }
      );
    }

    // Get nominee with case-insensitive search
    const { data: nominee, error: nomineeError } = await supabase
      .from("nominees")
      .select("id, name, slug, image_url, description, nominee_code")
      .eq("category_id", category.id)
      .or(`slug.ilike.${params.nomineeSlug},nominee_code.ilike.${params.nomineeSlug}`)
      .single();

    if (nomineeError || !nominee) {
      return NextResponse.json(
        { error: "Nominee not found" },
        { status: 404 }
      );
    }

    // Count votes for this nominee
    const { count, error: votesError } = await supabase
      .from("votes")
      .select("*", { count: 'exact' })
      .eq("nominee_id", nominee.id);

    if (votesError) {
      console.error("Votes fetching error:", votesError);
      return NextResponse.json(
        { error: "Failed to fetch votes" },
        { status: 500 }
      );
    }

    const nomineeWithVotes: NomineeWithVotes = {
      ...nominee,
      votes: count || 0,
    };

    return NextResponse.json(nomineeWithVotes);
  } catch (error) {
    console.error("Server-side error:", error);
    return NextResponse.json(
      { error: "An unexpected error occurred" },
      { status: 500 }
    );
  }
}