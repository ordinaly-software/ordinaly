import { NextResponse } from "next/server";

const GOOGLE_DETAILS_URL = "https://maps.googleapis.com/maps/api/place/details/json";

type GoogleDetailsResponse = {
  status?: string;
  error_message?: string;
  result?: {
    name?: string;
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

function buildGoogleReviewLinks(placeId: string, mapsUrl?: string | null) {
  const fallbackMapsUrl = `https://www.google.com/maps/place/?q=place_id:${placeId}`;
  return {
    googleMapsUrl: mapsUrl || fallbackMapsUrl,
    writeReviewUrl: `https://search.google.com/local/writereview?placeid=${placeId}`,
  };
}

function mapGoogleErrorToHttp(status?: string) {
  // Google suele devolver 200 + status != OK, aquí lo traducimos.
  switch (status) {
    case "REQUEST_DENIED":
    case "INVALID_REQUEST":
      return 502;
    case "OVER_QUERY_LIMIT":
      return 429;
    case "NOT_FOUND":
      return 404;
    default:
      return 502;
  }
}

export async function GET() {
  const apiKey = process.env.GOOGLE_PLACES_API_KEY || process.env.GOOGLE_MAPS_API_KEY;
  const placeId = process.env.GOOGLE_PLACE_ID;

  if (!apiKey || !placeId) {
    return NextResponse.json(
      { error: "Missing GOOGLE_PLACES_API_KEY / GOOGLE_PLACE_ID" },
      { status: 503 },
    );
  }

  const url = new URL(GOOGLE_DETAILS_URL);
  url.searchParams.set("place_id", placeId);
  url.searchParams.set("key", apiKey);
  url.searchParams.set("fields", "name,rating,user_ratings_total,reviews,url");
  url.searchParams.set("language", "es");

  // Timeout para evitar colgar funciones serverless
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 8000);

  let response: Response;
  try {
    response = await fetch(url.toString(), {
      signal: controller.signal,
      // Cache real en edge/CDN (además de lo que haga Next)
      headers: {
        "Accept": "application/json",
      },
    });
  } catch (err) {
    clearTimeout(timeout);
    const isAbort = err instanceof Error && err.name === "AbortError";
    return NextResponse.json(
      { error: isAbort ? "Google request timeout" : "Google request failed" },
      { status: 504 },
    );
  } finally {
    clearTimeout(timeout);
  }

  const text = await response.text(); // lee siempre el body
  let data: GoogleDetailsResponse | null = null;

  try {
    data = text ? (JSON.parse(text) as GoogleDetailsResponse) : null;
  } catch {
    // body no JSON
  }

  // Si HTTP no es OK, devuelve detalles para depurar
  if (!response.ok) {
    return NextResponse.json(
      {
        error: "Google Places HTTP error",
        httpStatus: response.status,
        body: data ?? text?.slice(0, 500),
      },
      { status: 502 },
    );
  }

  if (!data || data.status !== "OK" || !data.result) {
    return NextResponse.json(
      {
        error: "Google reviews unavailable",
        googleStatus: data?.status ?? "NO_DATA",
        errorMessage: data?.error_message,
      },
      { status: mapGoogleErrorToHttp(data?.status) },
    );
  }

  const { googleMapsUrl, writeReviewUrl } = buildGoogleReviewLinks(placeId, data.result.url);

  const payload = {
    rating: data.result.rating ?? null,
    userRatingsTotal: data.result.user_ratings_total ?? null,
    reviews: data.result.reviews ?? [],
    googleMapsUrl,
    writeReviewUrl,
  };

  // Cache-Control explícito (Netlify lo respeta mejor que revalidate)
  return new NextResponse(JSON.stringify(payload), {
    status: 200,
    headers: {
      "Content-Type": "application/json; charset=utf-8",
      "Cache-Control": "public, max-age=0, s-maxage=3600, stale-while-revalidate=86400",
    },
  });
}
