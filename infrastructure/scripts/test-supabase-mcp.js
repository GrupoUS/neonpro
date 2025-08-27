#!/usr/bin/env node

/**
 * Script to test Supabase MCP server connection
 * Tests basic connectivity and authentication
 */

const { createClient } = require("@supabase/supabase-js");

// Load environment variables
require("dotenv").config();

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const SUPABASE_ANON_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

async function testSupabaseMCP() {
  // Validate environment variables
  if (!(SUPABASE_URL && SUPABASE_ANON_KEY)) {
    if (!SUPABASE_URL) {
    }
    if (!SUPABASE_ANON_KEY) {
    }
    process.exit(1);
  }

  try {
    // Initialize Supabase client
    const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

    // Try to get auth session
    const {
      data: { session },
      error: sessionError,
    } = await supabase.auth.getSession();

    if (sessionError) {
    } else {
    }

    const { data, error } = await supabase.from("profiles").select("count", {
      count: "exact",
      head: true,
    });

    if (error) {
      if (error.message.includes('relation "profiles" does not exist')) {
      }
    } else {
    }

    const { data: authConfig, error: authError } = await supabase.auth.getUser();

    if (authError) {
    } else {
    }
  } catch (_error) {}
}

// Run the test
testSupabaseMCP().catch(console.error);
