import { type NextRequest, NextResponse } from "next/server";
import { createRouteHandlerClient } from "@supabase/auth-helpers-nextjs";
import { cookies } from "next/headers";

/**
 * WebAuthn Credentials API Route
 * Handles CRUD operations for WebAuthn credentials
 */

export async function GET(request: NextRequest) {
  try {
    const supabase = createRouteHandlerClient({ cookies });

    // Get current user
    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser();
    if (userError || !user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Get user's WebAuthn credentials
    const { data: credentials, error } = await supabase
      .from("webauthn_credentials")
      .select("credential_id, name, created_at, last_used_at, transports")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false });

    if (error) {
      console.error("Error fetching WebAuthn credentials:", error);
      return NextResponse.json({ error: "Internal server error" }, { status: 500 });
    }

    return NextResponse.json({ credentials });
  } catch (error) {
    console.error("WebAuthn credentials GET error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const supabase = createRouteHandlerClient({ cookies });

    // Get current user
    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser();
    if (userError || !user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { credential_id, public_key, name, transports, attestation_type } = body;

    // Validate required fields
    if (!credential_id || !public_key) {
      return NextResponse.json(
        {
          error: "Missing required fields: credential_id, public_key",
        },
        { status: 400 },
      );
    }

    // Insert new WebAuthn credential
    const { data, error } = await supabase
      .from("webauthn_credentials")
      .insert({
        user_id: user.id,
        credential_id,
        public_key,
        name: name || "WebAuthn Credential",
        transports: transports || [],
        attestation_type: attestation_type || "none",
        counter: 0,
      })
      .select()
      .single();

    if (error) {
      console.error("Error creating WebAuthn credential:", error);
      if (error.code === "23505") {
        // Unique constraint violation
        return NextResponse.json(
          {
            error: "Credential already exists",
          },
          { status: 409 },
        );
      }
      return NextResponse.json({ error: "Internal server error" }, { status: 500 });
    }

    return NextResponse.json(
      {
        message: "Credential created successfully",
        credential: {
          id: data.id,
          credential_id: data.credential_id,
          name: data.name,
          created_at: data.created_at,
        },
      },
      { status: 201 },
    );
  } catch (error) {
    console.error("WebAuthn credentials POST error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
