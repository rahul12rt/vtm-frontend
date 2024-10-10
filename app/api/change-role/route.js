import { NextResponse } from "next/server";
export async function PUT(request) {
  try {
    const strapiApiUrl = process.env.STRAPI_API_URL;

    // Check if STRAPI_API_URL is defined
    if (!strapiApiUrl) {
      return NextResponse.json(
        { error: "STRAPI_API_URL is not defined in environment variables" },
        { status: 500 }
      );
    }

    // Extract userId and roleId from the request body
    const { userId, roleId } = await request.json();

    // Validate the required parameters
    if (!userId || !roleId) {
      return NextResponse.json(
        { error: "userId and roleId are required" },
        { status: 400 }
      );
    }

    const userEndpoint = `${strapiApiUrl}/api/users/${userId}?populate=*`;

    // Payload to update the role
    const rolePayload = {
      role: roleId,
    };

    // PUT request to update the user's role in Strapi
    const response = await fetch(userEndpoint, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(rolePayload),
    });

    // Check if the response is successful
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(
        `Error updating role: ${errorData.error || response.statusText}`
      );
    }

    // Return success response
    const data = await response.json();
    return NextResponse.json(data, { status: 200 });
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
