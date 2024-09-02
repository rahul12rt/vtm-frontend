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

    const strapiEndpoint = `${strapiApiUrl}/api/map-faculty-to-subjects?populate[faculty]=*&populate[subjects]=*`;
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

    console.log(payload);

    const strapiEndpoint = `${strapiApiUrl}/api/map-faculty-to-subjects?populate[faculty]=*&populate[subjects]=*`;
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

    const { id, data } = await request.json();

    if (!id || !data) {
      return NextResponse.json(
        { error: "Mapping ID and data are required" },
        { status: 400 }
      );
    }

    const strapiEndpoint = `${strapiApiUrl}/api/map-faculty-to-subjects/${id}?populate[faculty]=*&populate[subjects]=*`;
    const response = await fetch(strapiEndpoint, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ data: data }), // Payload for Strapi
    });

    if (!response.ok) {
      throw new Error(`Error updating data in Strapi: ${response.statusText}`);
    }

    const responseData = await response.json();
    return NextResponse.json(responseData);
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

    const { id } = await request.json();
    if (!id) {
      return NextResponse.json(
        { error: "Mapping ID is required" },
        { status: 400 }
      );
    }

    console.log(id);

    const strapiEndpoint = `${strapiApiUrl}/api/map-faculty-to-subjects/${id}`;
    const response = await fetch(strapiEndpoint, {
      method: "DELETE",
      headers: {
        "Content-Type": "application/json",
      },
    });

    if (!response.ok) {
      throw new Error(
        `Error deleting data from Strapi: ${response.statusText}`
      );
    }

    return NextResponse.json({ message: "Mapping deleted successfully" });
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
