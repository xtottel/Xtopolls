// src/app/api/contests/route.ts
import { createClient } from "@supabase/supabase-js";
import { NextResponse } from "next/server";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
const supabase = createClient(supabaseUrl, supabaseKey);

export async function GET() {
  try {
    console.log("Fetching contests from Supabase...");
    const { data, error } = await supabase
      .from("contests")
      .select(`
        id,
        image,
        alt,
        title,
        description,
        start_date,
        end_date,
        slug,
        status
      `);

    if (error) {
      console.error("Supabase error:", error);
      return NextResponse.json(
        { error: "Failed to fetch contests from Supabase" },
        { status: 500 }
      );
    }

    console.log("Contests fetched successfully:", data);
    return NextResponse.json(data);
  } catch (error) {
    console.error("Unexpected error:", error);
    return NextResponse.json(
      { error: "An unexpected error occurred" },
      { status: 500 }
    );
  }
}

export const dynamic = "force-dynamic"; // Add this if you want to ensure dynamic fetching