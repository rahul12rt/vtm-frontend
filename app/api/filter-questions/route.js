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
    const url = new URL(request.url);
    const queryParams = [];
    url.searchParams.forEach((value, key) => {
      queryParams.push(`${key}=${value}`);
    });

    const filters = queryParams.join("&");
    const strapiEndpoint = `${strapiApiUrl}/api/question-banks?populate[subject][populate][class]=*&populate[chapters]=*&populate[topics]=*&populate[class]=*&populate[academic_year]=*&populate[create_tests]=*&populate[level]=*&populate[stream]=*&${filters}`;

    // Fetch data from Strapi
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
    console.error("Error:", error.message, error.stack);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
