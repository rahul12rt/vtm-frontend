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

    // Extract the token from the request cookies
    const token = request.cookies.get("token")?.value;

    if (!token) {
      return NextResponse.json(
        { error: "Token not found in cookies" },
        { status: 401 }
      );
    }

    const strapiEndpoint = `${strapiApiUrl}/api/results?populate=*`;
    const response = await fetch(strapiEndpoint, {
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`, // Include the Bearer token in the headers
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

export async function POST(request) {
  try {
    const strapiApiUrl = process.env.STRAPI_API_URL;

    if (!strapiApiUrl) {
      return NextResponse.json(
        { error: "STRAPI_API_URL is not defined in environment variables" },
        { status: 500 }
      );
    }

    // Extract the token from the request cookies
    const token = request.cookies.get("token")?.value;

    if (!token) {
      return NextResponse.json(
        { error: "Token not found in cookies" },
        { status: 401 }
      );
    }

    const payload = await request.json();
    const strapiEndpoint = `${strapiApiUrl}/api/results`;
    const response = await fetch(strapiEndpoint, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`, // Include the Bearer token in the headers
      },
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      const errorData = await response.json();

      if (response.status === 400) {
        return NextResponse.json(
          { error: "Unable to submit" },
          { status: 400 }
        );
      } else {
        throw new Error(`Error sending data to Strapi: ${errorData.message}`);
      }
    }
    const data = await response.json();
    return NextResponse.json(data);
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
