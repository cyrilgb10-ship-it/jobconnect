import { NextResponse } from "next/server";

export async function GET() {
  const clientId = process.env.MYSOLEAS_CLIENT_ID;
  const clientSecret = process.env.MYSOLEAS_CLIENT_SECRET;

  if (!clientId || !clientSecret) {
    return NextResponse.json(
      {
        success: false,
        error: "MYSOLEAS_CLIENT_ID ou MYSOLEAS_CLIENT_SECRET manquant",
      },
      { status: 500 }
    );
  }

  try {
    const credentials = Buffer.from(
      `${clientId}:${clientSecret}`
    ).toString("base64");

    const response = await fetch(
      "https://account.mysoleas.com/oauth/v2/token",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
          Authorization: `Basic ${credentials}`,
        },
        body: new URLSearchParams({
          grant_type: "client_credentials",
          scope: "payments services countries providers",
        }).toString(),
        cache: "no-store",
      }
    );

    const data = await response.json();

    if (!response.ok) {
      return NextResponse.json(
        {
          success: false,
          status: response.status,
          error: data,
        },
        { status: response.status }
      );
    }

    return NextResponse.json({
      success: true,
      tokenType: data.token_type,
      expiresIn: data.expires_in,
      message: "Authentification Mysoleas réussie.",
    });
  } catch (error) {
    return NextResponse.json(
      {
        success: false,
        error:
          error instanceof Error ? error.message : "Erreur inconnue",
      },
      { status: 500 }
    );
  }
}