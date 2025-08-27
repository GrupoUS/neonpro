import { type NextRequest, NextResponse } from "next/server";
import { createClient } from "@/app/utils/supabase/server";

/**
 * WebAuthn Individual Credential API Route
 * Handles operations on specific WebAuthn credentials
 */

export async function GET(_request: NextRequest, { params }: { params: { credentialId: string } }) {
	try {
		const supabase = await createClient();
		const { credentialId } = params;

		// Get current user
		const {
			data: { user },
			error: userError,
		} = await supabase.auth.getUser();
		if (userError || !user) {
			return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
		}

		// Get specific WebAuthn credential
		const { data: credential, error } = await supabase
			.from("webauthn_credentials")
			.select("id, credential_id, name, created_at, last_used_at, transports, counter")
			.eq("user_id", user.id)
			.eq("credential_id", credentialId)
			.single();

		if (error) {
			if (error.code === "PGRST116") {
				// No rows returned
				return NextResponse.json({ error: "Credential not found" }, { status: 404 });
			}
			return NextResponse.json({ error: "Internal server error" }, { status: 500 });
		}

		return NextResponse.json({ credential });
	} catch (_error) {
		return NextResponse.json({ error: "Internal server error" }, { status: 500 });
	}
}

export async function PUT(request: NextRequest, { params }: { params: { credentialId: string } }) {
	try {
		const supabase = await createClient();
		const { credentialId } = params;

		// Get current user
		const {
			data: { user },
			error: userError,
		} = await supabase.auth.getUser();
		if (userError || !user) {
			return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
		}

		const body = await request.json();
		const { name, counter } = body;

		// Build update object
		const updates: unknown = {};
		if (name !== undefined) {
			updates.name = name;
		}
		if (counter !== undefined) {
			updates.counter = counter;
			updates.last_used_at = new Date().toISOString();
		}

		if (Object.keys(updates).length === 0) {
			return NextResponse.json(
				{
					error: "No valid fields to update",
				},
				{ status: 400 }
			);
		}

		// Update WebAuthn credential
		const { data, error } = await supabase
			.from("webauthn_credentials")
			.update(updates)
			.eq("user_id", user.id)
			.eq("credential_id", credentialId)
			.select()
			.single();

		if (error) {
			if (error.code === "PGRST116") {
				// No rows returned
				return NextResponse.json({ error: "Credential not found" }, { status: 404 });
			}
			return NextResponse.json({ error: "Internal server error" }, { status: 500 });
		}

		return NextResponse.json({
			message: "Credential updated successfully",
			credential: {
				id: data.id,
				credential_id: data.credential_id,
				name: data.name,
				counter: data.counter,
				last_used_at: data.last_used_at,
			},
		});
	} catch (_error) {
		return NextResponse.json({ error: "Internal server error" }, { status: 500 });
	}
}

export async function DELETE(_request: NextRequest, { params }: { params: { credentialId: string } }) {
	try {
		const supabase = await createClient();
		const { credentialId } = params;

		// Get current user
		const {
			data: { user },
			error: userError,
		} = await supabase.auth.getUser();
		if (userError || !user) {
			return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
		}

		// Delete WebAuthn credential
		const { error } = await supabase
			.from("webauthn_credentials")
			.delete()
			.eq("user_id", user.id)
			.eq("credential_id", credentialId);

		if (error) {
			return NextResponse.json({ error: "Internal server error" }, { status: 500 });
		}

		return NextResponse.json({
			message: "Credential deleted successfully",
		});
	} catch (_error) {
		return NextResponse.json({ error: "Internal server error" }, { status: 500 });
	}
}
