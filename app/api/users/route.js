import { NextResponse } from "next/server";

export async function GET(request) {
  try {
    const strapiApiUrl = process.env.STRAPI_API_URL;
    if (!strapiApiUrl) {
      return NextResponse.json(
        { error: "STRAPI_API_URL is not defined in environment variables" },
        { status: 500 }
      );
    }

    const { searchParams } = new URL(request.url);
    const userId = searchParams.get("userId");
    console.log(userId, "---req");
    const strapiEndpoint = `${strapiApiUrl}/api/users/${userId}?populate=*`;
    const response = await fetch(strapiEndpoint, {
      headers: {
        "Content-Type": "application/json",
      },
      cache: "no-store",
    });

    if (!response.ok) {
      throw new Error(
        `Error fetching data from Strapi: ${response.statusText}`
      );
    }

    const data = await response.json();
    return NextResponse.json(data);
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
