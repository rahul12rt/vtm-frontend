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

    const formData = await request.json();

    const strapiEndpoint = `${strapiApiUrl}/api/faculties`;
    const response = await fetch(strapiEndpoint, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(formData),
    });

    if (!response.ok) {
      const errorData = await response.json();
      ed;
      if (response.status === 400) {
        return NextResponse.json(
          { error: "Faculty is already registered" },
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
