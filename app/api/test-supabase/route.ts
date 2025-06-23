import { createClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";

export async function GET() {
  try {
    console.log("=== Testing Supabase Connection ===");

    // Test environment variables
    const envTest = {
      NEXT_PUBLIC_SUPABASE_URL: !!process.env.NEXT_PUBLIC_SUPABASE_URL,
      NEXT_PUBLIC_SUPABASE_ANON_KEY:
        !!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
      SUPABASE_URL: !!process.env.SUPABASE_URL,
      SUPABASE_ANON_KEY: !!process.env.SUPABASE_ANON_KEY,
      NODE_ENV: process.env.NODE_ENV,
    };

    console.log("Environment variables:", envTest);

    // Test Supabase client creation
    const supabase = await createClient();
    console.log("Supabase client created successfully");

    // Test auth status
    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser();
    console.log(
      "Auth test - User:",
      user ? "Present" : "None",
      "Error:",
      userError
    );

    // Test database connection (simple query)
    const { data: dbTest, error: dbError } = await supabase
      .from("auth.users")
      .select("count")
      .limit(1);

    console.log("Database test - Success:", !dbError, "Error:", dbError);

    // Test auth configuration
    const authConfig = {
      hasUser: !!user,
      userEmail: user?.email,
      userProvider: user?.app_metadata?.provider,
      sessionExists: !!user,
    };

    const result = {
      success: true,
      timestamp: new Date().toISOString(),
      environment: envTest,
      auth: authConfig,
      database: {
        connected: !dbError,
        error: dbError?.message,
      },
      client: {
        created: true,
        url: process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL,
      },
    };

    console.log("Test result:", result);
    return NextResponse.json(result);
  } catch (error: any) {
    console.error("Supabase test failed:", error);

    return NextResponse.json(
      {
        success: false,
        error: error.message,
        stack: error.stack,
        timestamp: new Date().toISOString(),
      },
      { status: 500 }
    );
  }
}

export async function POST() {
  try {
    console.log("=== Testing Supabase Auth Flow ===");

    const supabase = await createClient();

    // Test OAuth URL generation with implicit flow
    const { data: oauthData, error: oauthError } =
      await supabase.auth.signInWithOAuth({
        provider: "google",
        options: {
          redirectTo: `${
            process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000"
          }/auth/callback`,
          queryParams: {
            access_type: "offline",
            prompt: "consent",
          },
          skipBrowserRedirect: true, // Get URL without redirecting
        },
      });

    // Test specific error scenarios
    const errorTests = {
      pkce_disabled: true, // We disabled PKCE
      implicit_flow: true, // We're using implicit flow
      callback_urls: [
        `${
          process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000"
        }/auth/callback`,
        `${
          process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000"
        }/auth/popup-callback`,
      ],
    };

    const result = {
      success: !oauthError,
      oauth: {
        url: oauthData?.url,
        provider: oauthData?.provider,
        error: oauthError?.message,
      },
      configuration: errorTests,
      timestamp: new Date().toISOString(),
    };

    return NextResponse.json(result);
  } catch (error: any) {
    return NextResponse.json(
      {
        success: false,
        error: error.message,
        timestamp: new Date().toISOString(),
      },
      { status: 500 }
    );
  }
}
