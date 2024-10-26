import { NextResponse } from "next/server";

// GET request handler
export async function GET() {
  try {
    const strapiApiUrl = process.env.STRAPI_API_URL;
    if (!strapiApiUrl) {
      return NextResponse.json(
        { error: "STRAPI_API_URL is not defined in environment variables" },
        { status: 500 }
      );
    }

    const strapiEndpoint = `${strapiApiUrl}/api/chapters?populate[subject][populate]=class`;
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

// POST request handler
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

    const strapiEndpoint = `${strapiApiUrl}/api/chapters?populate[subject][populate]=class`;
    const response = await fetch(strapiEndpoint, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      throw new Error(`Error posting data to Strapi: ${response.statusText}`);
    }

    const data = await response.json();
    return NextResponse.json(data);
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

// DELETE request handler
export async function DELETE(request) {
  try {
    const strapiApiUrl = process.env.STRAPI_API_URL;
    if (!strapiApiUrl) {
      return NextResponse.json(
        { error: "STRAPI_API_URL is not defined in environment variables" },
        { status: 500 }
      );
    }

    const { chapterId } = await request.json();
    if (!chapterId) {
      return NextResponse.json(
        { error: "Subject ID is required" },
        { status: 400 }
      );
    }

    const strapiEndpoint = `${strapiApiUrl}/api/chapters/${chapterId}`;
    const response = await fetch(strapiEndpoint, {
      method: "DELETE",
      headers: {
        "Content-Type": "application/json",
      },
    });

    if (!response.ok) {
      throw new Error(`Error deleting subject: ${response.statusText}`);
    }

    return NextResponse.json({ message: "Subject deleted successfully" });
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

// PUT request handler
export async function PUT(request) {
  try {
    const strapiApiUrl = process.env.STRAPI_API_URL;
    if (!strapiApiUrl) {
      return NextResponse.json(
        { error: "STRAPI_API_URL is not defined in environment variables" },
        { status: 500 }
      );
    }

    // Destructuring request body to get chapterId, name, className, and subject
    const { chapterId, name, className, subject } = await request.json();

    // Validation for required fields
    if (!chapterId || !name) {
      return NextResponse.json(
        { error: "Chapter ID, name, and class are required" },
        { status: 400 }
      );
    }

    // Strapi API endpoint for updating chapter
    const strapiEndpoint = `${strapiApiUrl}/api/chapters/${chapterId}`;
    const response = await fetch(strapiEndpoint, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        data: { name, subject }, // Passing className as class
      }),
    });

    // Check if the response from Strapi is successful
    if (!response.ok) {
      throw new Error(`Error updating chapter: ${response.statusText}`);
    }

    // Returning the successful response
    const data = await response.json();
    return NextResponse.json(data);
  } catch (error) {
    // Error handling for any failure in the process
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
