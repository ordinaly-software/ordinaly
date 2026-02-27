import { NextResponse } from "next/server";

const GOOGLE_DETAILS_URL = "https://maps.googleapis.com/maps/api/place/details/json";
const GOOGLE_PLACES_V1_URL = "https://places.googleapis.com/v1/places";

type GoogleReviewPayload = {
  author_name?: string;
  rating?: number;
  text?: string;
  profile_photo_url?: string;
  relative_time_description?: string;
  time?: number;
};

type GoogleReviewsPayload = {
  rating: number | null;
  userRatingsTotal: number | null;
  reviews: GoogleReviewPayload[];
  googleMapsUrl: string;
  writeReviewUrl: string;
};

type FetchSource = "places-v1" | "places-legacy";
type FetchError = {
  source: FetchSource;
  httpStatus: number;
  googleStatus?: string;
  message?: string;
};

type FetchResult =
  | { ok: true; payload: GoogleReviewsPayload }
  | { ok: false; error: FetchError };

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

type GooglePlacesV1Response = {
  rating?: number;
  userRatingCount?: number;
  reviews?: Array<{
    authorAttribution?: {
      displayName?: string;
      photoUri?: string;
    };
    rating?: number;
    relativePublishTimeDescription?: string;
    text?: {
      text?: string;
    };
    originalText?: {
      text?: string;
    };
    publishTime?: string;
  }>;
  googleMapsUri?: string;
};

type GooglePlacesV1ErrorResponse = {
  error?: {
    code?: number;
    message?: string;
    status?: string;
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

function mapHttpToFallbackStatus(httpStatus: number) {
  if (httpStatus === 429) return 429;
  if (httpStatus === 404) return 404;
  if (httpStatus >= 500) return 502;
  return 502;
}

function formatPublicErrorMessage(err: FetchError) {
  if (err.message) {
    return `${err.source}: ${err.message}`;
  }
  if (err.googleStatus) {
    return `${err.source}: ${err.googleStatus}`;
  }
  return `${err.source}: request failed`;
}

function mapPublishTimeToUnix(publishTime?: string) {
  if (!publishTime) return undefined;
  const ms = Date.parse(publishTime);
  if (Number.isNaN(ms)) return undefined;
  return Math.floor(ms / 1000);
}

async function fetchWithTimeout(input: string, init: RequestInit, timeoutMs = 8000) {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), timeoutMs);

  try {
    return await fetch(input, { ...init, signal: controller.signal });
  } finally {
    clearTimeout(timeout);
  }
}

async function fetchFromPlacesV1(apiKey: string, placeId: string): Promise<FetchResult> {
  const url = new URL(`${GOOGLE_PLACES_V1_URL}/${encodeURIComponent(placeId)}`);
  url.searchParams.set("languageCode", "es");

  let response: Response;
  try {
    response = await fetchWithTimeout(url.toString(), {
      headers: {
        "Accept": "application/json",
        "X-Goog-Api-Key": apiKey,
        "X-Goog-FieldMask": "rating,userRatingCount,reviews,googleMapsUri",
      },
    });
  } catch (err) {
    const isAbort = err instanceof Error && err.name === "AbortError";
    return {
      ok: false,
      error: {
        source: "places-v1",
        httpStatus: 504,
        message: isAbort ? "Google request timeout" : "Google request failed",
      },
    };
  }

  const text = await response.text();
  let data: GooglePlacesV1Response | GooglePlacesV1ErrorResponse | null = null;

  try {
    data = text ? (JSON.parse(text) as GooglePlacesV1Response | GooglePlacesV1ErrorResponse) : null;
  } catch {
    // Non-JSON response body
  }

  if (!response.ok) {
    const apiError = (data as GooglePlacesV1ErrorResponse | null)?.error;
    return {
      ok: false,
      error: {
        source: "places-v1",
        httpStatus: response.status,
        googleStatus: apiError?.status,
        message: apiError?.message,
      },
    };
  }

  const place = (data ?? {}) as GooglePlacesV1Response;
  const { googleMapsUrl, writeReviewUrl } = buildGoogleReviewLinks(placeId, place.googleMapsUri);

  const payload: GoogleReviewsPayload = {
    rating: typeof place.rating === "number" ? place.rating : null,
    userRatingsTotal: typeof place.userRatingCount === "number" ? place.userRatingCount : null,
    reviews: (place.reviews ?? []).map((review) => ({
      author_name: review.authorAttribution?.displayName,
      rating: review.rating,
      text: review.text?.text ?? review.originalText?.text,
      profile_photo_url: review.authorAttribution?.photoUri,
      relative_time_description: review.relativePublishTimeDescription,
      time: mapPublishTimeToUnix(review.publishTime),
    })),
    googleMapsUrl,
    writeReviewUrl,
  };

  return { ok: true, payload };
}

async function fetchFromLegacyPlaces(apiKey: string, placeId: string): Promise<FetchResult> {
  const url = new URL(GOOGLE_DETAILS_URL);
  url.searchParams.set("place_id", placeId);
  url.searchParams.set("key", apiKey);
  url.searchParams.set("fields", "name,rating,user_ratings_total,reviews,url");
  url.searchParams.set("language", "es");

  let response: Response;
  try {
    response = await fetchWithTimeout(url.toString(), {
      headers: {
        "Accept": "application/json",
      },
    });
  } catch (err) {
    const isAbort = err instanceof Error && err.name === "AbortError";
    return {
      ok: false,
      error: {
        source: "places-legacy",
        httpStatus: 504,
        message: isAbort ? "Google request timeout" : "Google request failed",
      },
    };
  }

  const text = await response.text();
  let data: GoogleDetailsResponse | null = null;

  try {
    data = text ? (JSON.parse(text) as GoogleDetailsResponse) : null;
  } catch {
    // Non-JSON response body
  }

  if (!response.ok) {
    return {
      ok: false,
      error: {
        source: "places-legacy",
        httpStatus: response.status,
        message: "Google Places HTTP error",
      },
    };
  }

  if (!data || data.status !== "OK" || !data.result) {
    return {
      ok: false,
      error: {
        source: "places-legacy",
        httpStatus: mapGoogleErrorToHttp(data?.status),
        googleStatus: data?.status ?? "NO_DATA",
        message: data?.error_message,
      },
    };
  }

  const { googleMapsUrl, writeReviewUrl } = buildGoogleReviewLinks(placeId, data.result.url);

  return {
    ok: true,
    payload: {
      rating: data.result.rating ?? null,
      userRatingsTotal: data.result.user_ratings_total ?? null,
      reviews: data.result.reviews ?? [],
      googleMapsUrl,
      writeReviewUrl,
    },
  };
}

export async function GET() {
  const apiKey = process.env.GOOGLE_PLACES_API_KEY || process.env.GOOGLE_MAPS_API_KEY;
  const placeId = process.env.GOOGLE_PLACE_ID;

  if (!apiKey || !placeId) {
    return NextResponse.json(
      { error: "Missing GOOGLE_PLACE_ID or GOOGLE_PLACES_API_KEY/GOOGLE_MAPS_API_KEY" },
      { status: 503 },
    );
  }

  // Try Places API v1 first; fallback to legacy endpoint for backwards compatibility.
  const placesV1Result = await fetchFromPlacesV1(apiKey, placeId);
  if (placesV1Result.ok) {
    return new NextResponse(JSON.stringify(placesV1Result.payload), {
      status: 200,
      headers: {
        "Content-Type": "application/json; charset=utf-8",
        "Cache-Control": "public, max-age=0, s-maxage=3600, stale-while-revalidate=86400",
      },
    });
  }

  const legacyResult = await fetchFromLegacyPlaces(apiKey, placeId);
  if (legacyResult.ok) {
    return new NextResponse(JSON.stringify(legacyResult.payload), {
      status: 200,
      headers: {
        "Content-Type": "application/json; charset=utf-8",
        "Cache-Control": "public, max-age=0, s-maxage=3600, stale-while-revalidate=86400",
      },
    });
  }

  const fallbackStatus = mapHttpToFallbackStatus(
    Math.max(placesV1Result.error.httpStatus, legacyResult.error.httpStatus),
  );

  return NextResponse.json(
    {
      error: "Google reviews unavailable",
      attempts: [placesV1Result.error, legacyResult.error].map((err) => ({
        source: err.source,
        status: err.googleStatus,
        message: formatPublicErrorMessage(err),
      })),
    },
    { status: fallbackStatus },
  );
}
