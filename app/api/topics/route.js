import { NextResponse } from "next/server";

export async function GET() {
  try {
    const strapiApiUrl = process.env.STRAPI_API_URL;
    if (!strapiApiUrl) {
      return NextResponse.json(
        { error: "STRAPI_API_URL is not defined in environment variables" },
        { status: 500 }
      );
    }

    const strapiEndpoint = `${strapiApiUrl}/api/topics?populate[chapter][populate]=subject`;
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
    const strapiEndpoint = `${strapiApiUrl}/api/topics`; // Adjust if needed
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

export async function DELETE(request) {
  try {
    const strapiApiUrl = process.env.STRAPI_API_URL;
    if (!strapiApiUrl) {
      return NextResponse.json(
        { error: "STRAPI_API_URL is not defined in environment variables" },
        { status: 500 }
      );
    }

    const { topicsId } = await request.json(); // Ensure you're receiving the ID
    if (!topicsId) {
      return NextResponse.json(
        { error: "Topic ID is required" },
        { status: 400 }
      );
    }

    const strapiEndpoint = `${strapiApiUrl}/api/topics/${topicsId}`;
    const response = await fetch(strapiEndpoint, {
      method: "DELETE",
      headers: {
        "Content-Type": "application/json",
      },
    });

    if (!response.ok) {
      throw new Error(`Error deleting Topic: ${response.statusText}`);
    }

    return NextResponse.json({ message: "Topic deleted successfully" });
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function PUT(request) {
  try {
    const strapiApiUrl = process.env.STRAPI_API_URL;
    if (!strapiApiUrl) {
      return NextResponse.json(
        { error: "STRAPI_API_URL is not defined in environment variables" },
        { status: 500 }
      );
    }

    const { id, name, chapter } = await request.json();
    if (!id || !name || !chapter) {
      return NextResponse.json(
        { error: "ID, name, and chapter ID are required" },
        { status: 400 }
      );
    }

    const strapiEndpoint = `${strapiApiUrl}/api/topics/${id}`;
    const response = await fetch(strapiEndpoint, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        data: {
          name: name,
          chapter: chapter,
        },
      }),
    });

    if (!response.ok) {
      throw new Error(`Error updating Topic: ${response.statusText}`);
    }

    const data = await response.json();
    return NextResponse.json(data);
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
