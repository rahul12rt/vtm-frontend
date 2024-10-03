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

    const strapiEndpoint = `${strapiApiUrl}/api/creat-dpps?populate[class]=*&populate[subject]=*&populate[chapters]=*&populate[topics]=*`;
    const response = await fetch(`${strapiEndpoint}`, {
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

    const formData = await request.json();

    const strapiEndpoint = `${strapiApiUrl}/api/creat-dpps?populate[class]=*&populate[subject]=*&populate[chapters]=*&populate[topics]=*`;
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
          { error: "Self Study exists" },
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

export async function DELETE(request) {
  try {
    const strapiApiUrl = process.env.STRAPI_API_URL;
    if (!strapiApiUrl) {
      return NextResponse.json(
        { error: "STRAPI_API_URL is not defined in environment variables" },
        { status: 500 }
      );
    }

    const { studyId } = await request.json();
    if (!studyId) {
      return NextResponse.json(
        { error: "DPP material ID is required" },
        { status: 400 }
      );
    }
    const strapiEndpoint = `${strapiApiUrl}/api/creat-dpps/${studyId}`;
    const response = await fetch(strapiEndpoint, {
      method: "DELETE",
      headers: {
        "Content-Type": "application/json",
      },
    });

    if (!response.ok) {
      throw new Error(`Error deleting DPP material: ${response.statusText}`);
    }

    return NextResponse.json({
      message: "DPP material deleted successfully",
    });
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

    // Get the updated data and ID from the request body
    const { studyId, updatedData } = await request.json();

    if (!studyId || !updatedData) {
      return NextResponse.json(
        { error: "Both studyId and updatedData are required" },
        { status: 400 }
      );
    }

    const strapiEndpoint = `${strapiApiUrl}/api/creat-dpps/${studyId}?populate[class]=*&populate[subject]=*&populate[chapters]=*&populate[topics]=*`;
    const response = await fetch(strapiEndpoint, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(updatedData),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(`Error updating Study Material: ${errorData.message}`);
    }

    const data = await response.json();
    console.log(data);
    return NextResponse.json(data);
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
