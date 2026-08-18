import { NextResponse } from "next/server";

// Proxies Unsplash search so the access key stays server-side. The client
// previously called api.unsplash.com directly with
// NEXT_PUBLIC_UNSPLASH_ACCESS_KEY inlined in the URL — anyone could read
// that key out of the bundle/network tab and burn or get it revoked.
export async function GET(req) {
  const { searchParams } = new URL(req.url);
  const query = searchParams.get("query")?.trim();
  const perPage = Math.min(
    Math.max(parseInt(searchParams.get("per_page") ?? "12", 10) || 12, 1),
    30
  );

  if (!query) {
    return NextResponse.json({ error: "Query is required" }, { status: 400 });
  }

  const accessKey = process.env.UNSPLASH_ACCESS_KEY;
  if (!accessKey) {
    console.error("UNSPLASH_ACCESS_KEY is not set");
    return NextResponse.json(
      { error: "Image search is not configured" },
      { status: 500 }
    );
  }

  try {
    const response = await fetch(
      `https://api.unsplash.com/search/photos?query=${encodeURIComponent(
        query
      )}&per_page=${perPage}`,
      { headers: { Authorization: `Client-ID ${accessKey}` } }
    );

    if (!response.ok) {
      return NextResponse.json(
        { error: "Unsplash request failed" },
        { status: response.status }
      );
    }

    const data = await response.json();
    return NextResponse.json({ results: data.results ?? [] });
  } catch (error) {
    console.error("Error fetching Unsplash images:", error);
    return NextResponse.json(
      { error: "Failed to search images" },
      { status: 500 }
    );
  }
}
