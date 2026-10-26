import { NextResponse } from "next/server";
import {
  fetchFromLegacyPlaces,
  fetchFromPlacesV1,
  formatPublicErrorMessage,
  mapHttpToFallbackStatus,
} from "@/lib/google-reviews";

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
