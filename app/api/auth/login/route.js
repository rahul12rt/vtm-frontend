import { NextResponse } from "next/server";

export async function POST(request) {
  try {
    const strapiApiUrl = process.env.STRAPI_API_URL;
    if (!strapiApiUrl) {
      return NextResponse.json(
        { error: "STRAPI_API_URL is not defined in environment variables" },
        { status: 500 }
      );
    }

    const payload = await request.json();

    const strapiEndpoint = `${strapiApiUrl}/api/auth/local?populate=*`;
    const response = await fetch(strapiEndpoint, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      throw new Error(`Incorrect Email or Password`);
    }

    const data = await response.json();
    return NextResponse.json(data);
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
