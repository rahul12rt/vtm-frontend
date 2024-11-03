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

    const strapiEndpoint = `${strapiApiUrl}/api/question-banks?populate[subject][populate][class]=*&populate[chapters]=*&populate[topics]=*&populate[class]=*&populate[academic_year]=*&populate[create_tests]=*&populate[level]=*&populate[stream]=*
`;
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

    const strapiEndpoint = `${strapiApiUrl}/api/question-banks?populate[subject][populate][class]=*&populate[chapters]=*&populate[topics]=*&populate[class]=*&populate[academic_year]=*&populate[create_tests]=*&populate[level]=*&populate[stream]=*`;
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

    const { qbId, payload } = await request.json();
    if (!qbId) {
      return NextResponse.json(
        { error: "Qualification ID is required" },
        { status: 400 }
      );
    }

    const strapiEndpoint = `${strapiApiUrl}/api/question-banks/${qbId}?populate[subject][populate][class]=*&populate[chapters]=*&populate[topics]=*&populate[class]=*&populate[academic_year]=*&populate[create_tests]=*&populate[level]=*&populate[stream]=*`;
    const response = await fetch(strapiEndpoint, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      throw new Error(`Error updating Qualification: ${response.statusText}`);
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

    const { qbId } = await request.json();
    if (!qbId) {
      return NextResponse.json(
        { error: "Qualification ID is required" },
        { status: 400 }
      );
    }

    const strapiEndpoint = `${strapiApiUrl}/api/question-banks/${qbId}?populate=*`;
    const response = await fetch(strapiEndpoint, {
      method: "DELETE",
      headers: {
        "Content-Type": "application/json",
      },
    });

    if (!response.ok) {
      throw new Error(`Error deleting Qualification: ${response.statusText}`);
    }

    return NextResponse.json({ message: "Qualification deleted successfully" });
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
