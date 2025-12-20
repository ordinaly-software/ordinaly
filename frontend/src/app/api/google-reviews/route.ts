import { NextResponse } from "next/server";

const GOOGLE_API_BASE = "https://maps.googleapis.com/maps/api/place/details/json";

function buildGoogleReviewLinks(placeId: string, mapsUrl?: string | null) {
  const fallbackMapsUrl = `https://www.google.com/maps/place/?q=place_id:${placeId}`;
  return {
    googleMapsUrl: mapsUrl || fallbackMapsUrl,
    writeReviewUrl: `https://search.google.com/local/writereview?placeid=${placeId}`,
  };
}

export async function GET() {
  const apiKey =
    process.env.GOOGLE_MAPS_API_KEY ?? process.env.GOOGLE_PLACES_API_KEY;
  const placeId = process.env.GOOGLE_PLACE_ID;

  if (!apiKey || !placeId) {
    return NextResponse.json(
      { error: "Missing Google Places configuration" },
      { status: 503 },
    );
  }

  const url = new URL(GOOGLE_API_BASE);
  url.searchParams.set("place_id", placeId);
  url.searchParams.set("key", apiKey);
  url.searchParams.set(
    "fields",
    "name,rating,user_ratings_total,reviews,url",
  );
  url.searchParams.set("language", "es");

  const response = await fetch(url.toString(), { next: { revalidate: 3600 } });
  if (!response.ok) {
    return NextResponse.json(
      { error: "Failed to fetch Google reviews" },
      { status: response.status },
    );
  }

  const data = (await response.json()) as {
    status?: string;
    error_message?: string;
    result?: {
      rating?: number;
      user_ratings_total?: number;
      reviews?: Array<{
        author_name?: string;
        rating?: number;
        text?: string;
        profile_photo_url?: string;
        relative_time_description?: string;
        time?: number;
      }>;
      url?: string;
    };
  };

  if (data.status !== "OK" || !data.result) {
    console.error("Google reviews API error", {
      status: data.status,
      errorMessage: data.error_message,
    });
    return NextResponse.json(
      {
        error: "Google reviews unavailable",
        status: data.status,
        errorMessage: data.error_message,
      },
      { status: 502 },
    );
  }

  const { googleMapsUrl, writeReviewUrl } = buildGoogleReviewLinks(
    placeId,
    data.result.url,
  );

  return NextResponse.json({
    rating: data.result.rating ?? null,
    userRatingsTotal: data.result.user_ratings_total ?? null,
    reviews: data.result.reviews ?? [],
    googleMapsUrl,
    writeReviewUrl,
  });
}
