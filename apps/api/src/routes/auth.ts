import { Hono } from "hono";
import { HTTPException } from "hono/http-exception";
import { createClient } from "@supabase/supabase-js";
import { sign, verify } from "hono/jwt";
import { getCookie, setCookie, deleteCookie } from "hono/cookie";
import { HTTP_STATUS } from "../lib/constants.js";
import crypto from "crypto";

export const authRoutes = new Hono();

// Initialize Supabase client
const supabaseUrl = process.env.SUPABASE_URL!;
const supabaseKey = process.env.SUPABASE_ANON_KEY!;
const supabase = createClient(supabaseUrl, supabaseKey);

// JWT Secret for custom tokens (should be in env)
const JWT_SECRET = process.env.JWT_SECRET || 'your-super-secret-jwt-key-change-in-production';
const JWT_EXPIRE_TIME = '24h';
const REFRESH_TOKEN_EXPIRE_DAYS = 30;

// Utility functions
const generateSessionId = () => crypto.randomBytes(32).toString('hex');

const getClientInfo = (c: any) => {
  const userAgent = c.req.header("User-Agent") || "";
  const xForwardedFor = c.req.header("X-Forwarded-For");
  const xRealIp = c.req.header("X-Real-IP");
  const ipAddress = xForwardedFor?.split(",")[0] || xRealIp || "unknown";
  
  return {
    ip_address: ipAddress,
    user_agent: userAgent,
    device_fingerprint: crypto.createHash('md5')
      .update(userAgent + ipAddress)
      .digest('hex')
  };
};

// POST /auth/login - Email/Password login
authRoutes.post("/login", async (c) => {
  try {
    const body = await c.req.json().catch(() => null);

    if (!body || !body.email || !body.password) {
      return c.json(
        { error: "Email and password are required" },
        HTTP_STATUS.BAD_REQUEST,
      );
    }

    const { email, password, remember_me = false } = body;

    // Authenticate with Supabase Auth
    const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (authError || !authData.user) {
      console.error("Authentication error:", authError);
      return c.json(
        { error: "Invalid credentials" },
        HTTP_STATUS.UNAUTHORIZED,
      );
    }

    const user = authData.user;

    // Get user profile
    const { data: profile, error: profileError } = await supabase
      .from("profiles")
      .select("*")
      .eq("id", user.id)
      .single();

    if (profileError || !profile) {
      console.error("Profile fetch error:", profileError);
      return c.json(
        { error: "User profile not found" },
        HTTP_STATUS.NOT_FOUND,
      );
    }

    // Create session record
    const sessionId = generateSessionId();
    const clientInfo = getClientInfo(c);

    const { error: sessionError } = await supabase
      .from("active_user_sessions")
      .insert({
        session_id: sessionId,
        user_id: user.id,
        user_email: user.email!,
        user_role: profile.role,
        ...clientInfo,
      });

    if (sessionError) {
      console.error("Session creation error:", sessionError);
    }

    // Generate custom JWT
    const tokenPayload = {
      sub: user.id,
      email: user.email,
      role: profile.role,
      session_id: sessionId,
      full_name: profile.full_name,
      professional_title: profile.professional_title,
      medical_license: profile.medical_license,
      department: profile.department,
      iat: Math.floor(Date.now() / 1000),
      exp: Math.floor(Date.now() / 1000) + (remember_me ? 30 * 24 * 60 * 60 : 24 * 60 * 60), // 30 days or 24 hours
    };

    const accessToken = await sign(tokenPayload, JWT_SECRET);

    // Set HTTP-only cookie
    const cookieOptions = {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict' as const,
      maxAge: remember_me ? 30 * 24 * 60 * 60 : 24 * 60 * 60, // 30 days or 24 hours
      path: '/',
    };

    setCookie(c, 'auth_token', accessToken, cookieOptions);

    // Log security event
    await supabase
      .from("security_events")
      .insert({
        event_type: "user_login",
        user_id: user.id,
        user_email: user.email,
        ip_address: clientInfo.ip_address,
        user_agent: clientInfo.user_agent,
        metadata: {
          session_id: sessionId,
          remember_me,
          login_method: "email_password"
        }
      })
      .catch(err => console.error("Security log error:", err));

    return c.json({
      message: "Login successful",
      user: {
        id: user.id,
        email: user.email,
        full_name: profile.full_name,
        first_name: profile.first_name,
        last_name: profile.last_name,
        role: profile.role,
        professional_title: profile.professional_title,
        medical_license: profile.medical_license,
        department: profile.department,
        avatar_url: profile.avatar_url,
        phone: profile.phone,
      },
      session_id: sessionId,
      access_token: accessToken,
      expires_in: remember_me ? 30 * 24 * 60 * 60 : 24 * 60 * 60,
    });

  } catch (error) {
    console.error("Login error:", error);
    return c.json(
      { error: "Internal server error" },
      HTTP_STATUS.INTERNAL_SERVER_ERROR,
    );
  }
});

// POST /auth/logout - Logout user
authRoutes.post("/logout", async (c) => {
  try {
    const token = c.req.header("Authorization")?.replace("Bearer ", "") || getCookie(c, 'auth_token');

    if (token) {
      try {
        const payload = await verify(token, JWT_SECRET);
        const sessionId = payload.session_id as string;
        const userId = payload.sub as string;

        // Remove session from database
        await supabase
          .from("active_user_sessions")
          .delete()
          .eq("session_id", sessionId);

        // Log security event
        await supabase
          .from("security_events")
          .insert({
            event_type: "user_logout",
            user_id: userId,
            user_email: payload.email as string,
            ip_address: getClientInfo(c).ip_address,
            user_agent: getClientInfo(c).user_agent,
            metadata: {
              session_id: sessionId,
              logout_method: "explicit"
            }
          })
          .catch(err => console.error("Security log error:", err));

      } catch (jwtError) {
        console.error("JWT verification error during logout:", jwtError);
      }
    }

    // Clear cookie
    deleteCookie(c, 'auth_token');

    return c.json({
      message: "Logout successful"
    });

  } catch (error) {
    console.error("Logout error:", error);
    return c.json(
      { error: "Internal server error" },
      HTTP_STATUS.INTERNAL_SERVER_ERROR,
    );
  }
});

// GET /auth/me - Get current user info
authRoutes.get("/me", async (c) => {
  try {
    const token = c.req.header("Authorization")?.replace("Bearer ", "") || getCookie(c, 'auth_token');

    if (!token) {
      return c.json(
        { error: "Authentication required" },
        HTTP_STATUS.UNAUTHORIZED,
      );
    }

    const payload = await verify(token, JWT_SECRET).catch(() => null);

    if (!payload) {
      return c.json(
        { error: "Invalid token" },
        HTTP_STATUS.UNAUTHORIZED,
      );
    }

    const userId = payload.sub as string;
    const sessionId = payload.session_id as string;

    // Verify session is still active
    const { data: session, error: sessionError } = await supabase
      .from("active_user_sessions")
      .select("last_activity")
      .eq("session_id", sessionId)
      .eq("user_id", userId)
      .single();

    if (sessionError || !session) {
      return c.json(
        { error: "Session expired or invalid" },
        HTTP_STATUS.UNAUTHORIZED,
      );
    }

    // Update last activity
    await supabase
      .from("active_user_sessions")
      .update({ last_activity: new Date().toISOString() })
      .eq("session_id", sessionId);

    // Get fresh user profile
    const { data: profile, error: profileError } = await supabase
      .from("profiles")
      .select("*")
      .eq("id", userId)
      .single();

    if (profileError || !profile) {
      return c.json(
        { error: "User profile not found" },
        HTTP_STATUS.NOT_FOUND,
      );
    }

    return c.json({
      user: {
        id: profile.id,
        email: profile.email,
        full_name: profile.full_name,
        first_name: profile.first_name,
        last_name: profile.last_name,
        role: profile.role,
        professional_title: profile.professional_title,
        medical_license: profile.medical_license,
        department: profile.department,
        avatar_url: profile.avatar_url,
        phone: profile.phone,
        google_verified_email: profile.google_verified_email,
        profile_sync_status: profile.profile_sync_status,
      },
      session: {
        session_id: sessionId,
        last_activity: session.last_activity,
        expires_at: new Date(payload.exp * 1000).toISOString(),
      }
    });

  } catch (error) {
    console.error("User info error:", error);
    return c.json(
      { error: "Internal server error" },
      HTTP_STATUS.INTERNAL_SERVER_ERROR,
    );
  }
});

// POST /auth/register - Register new user
authRoutes.post("/register", async (c) => {
  try {
    const body = await c.req.json().catch(() => null);

    if (!body || !body.email || !body.password) {
      return c.json(
        { error: "Email and password are required" },
        HTTP_STATUS.BAD_REQUEST,
      );
    }

    const { 
      email, 
      password, 
      full_name, 
      first_name, 
      last_name,
      professional_title,
      medical_license,
      department,
      phone,
      role = "professional"
    } = body;

    // Register with Supabase Auth
    const { data: authData, error: authError } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          full_name,
          first_name,
          last_name,
          professional_title,
          medical_license,
          department,
          phone,
          role,
        }
      }
    });

    if (authError) {
      console.error("Registration error:", authError);
      
      if (authError.message.includes("already registered")) {
        return c.json(
          { error: "Email already registered" },
          HTTP_STATUS.CONFLICT,
        );
      }
      
      return c.json(
        { error: "Registration failed" },
        HTTP_STATUS.BAD_REQUEST,
      );
    }

    if (!authData.user) {
      return c.json(
        { error: "Registration failed" },
        HTTP_STATUS.BAD_REQUEST,
      );
    }

    // Create profile record (this might be handled by database trigger)
    const profileData = {
      id: authData.user.id,
      email,
      full_name: full_name || `${first_name || ""} ${last_name || ""}`.trim(),
      first_name,
      last_name,
      professional_title,
      medical_license,
      department,
      phone,
      role,
      profile_sync_status: "completed"
    };

    const { error: profileError } = await supabase
      .from("profiles")
      .upsert(profileData);

    if (profileError) {
      console.error("Profile creation error:", profileError);
      // Continue anyway, might be handled by trigger
    }

    // Log security event
    await supabase
      .from("security_events")
      .insert({
        event_type: "user_registration",
        user_id: authData.user.id,
        user_email: email,
        ip_address: getClientInfo(c).ip_address,
        user_agent: getClientInfo(c).user_agent,
        metadata: {
          registration_method: "email_password",
          role: role,
          professional_title: professional_title,
          department: department
        }
      })
      .catch(err => console.error("Security log error:", err));

    return c.json({
      message: "Registration successful. Please check your email for verification.",
      user: {
        id: authData.user.id,
        email: authData.user.email,
        email_confirmed_at: authData.user.email_confirmed_at,
      },
      requires_email_confirmation: !authData.user.email_confirmed_at
    }, HTTP_STATUS.CREATED);

  } catch (error) {
    console.error("Registration error:", error);
    return c.json(
      { error: "Internal server error" },
      HTTP_STATUS.INTERNAL_SERVER_ERROR,
    );
  }
});

// POST /auth/forgot-password - Request password reset
authRoutes.post("/forgot-password", async (c) => {
  try {
    const body = await c.req.json().catch(() => null);

    if (!body || !body.email) {
      return c.json(
        { error: "Email is required" },
        HTTP_STATUS.BAD_REQUEST,
      );
    }

    const { email } = body;

    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${process.env.FRONTEND_URL}/reset-password`,
    });

    if (error) {
      console.error("Password reset error:", error);
      // Don't reveal if email exists or not for security
    }

    // Always return success for security reasons
    return c.json({
      message: "If the email exists, a password reset link has been sent."
    });

  } catch (error) {
    console.error("Forgot password error:", error);
    return c.json(
      { error: "Internal server error" },
      HTTP_STATUS.INTERNAL_SERVER_ERROR,
    );
  }
});

// POST /auth/reset-password - Reset password with token
authRoutes.post("/reset-password", async (c) => {
  try {
    const body = await c.req.json().catch(() => null);

    if (!body || !body.access_token || !body.refresh_token || !body.new_password) {
      return c.json(
        { error: "Access token, refresh token, and new password are required" },
        HTTP_STATUS.BAD_REQUEST,
      );
    }

    const { access_token, refresh_token, new_password } = body;

    // Set the session with the tokens from the email link
    const { data: sessionData, error: sessionError } = await supabase.auth.setSession({
      access_token,
      refresh_token,
    });

    if (sessionError || !sessionData.user) {
      return c.json(
        { error: "Invalid or expired reset token" },
        HTTP_STATUS.BAD_REQUEST,
      );
    }

    // Update password
    const { error: updateError } = await supabase.auth.updateUser({
      password: new_password
    });

    if (updateError) {
      console.error("Password update error:", updateError);
      return c.json(
        { error: "Failed to update password" },
        HTTP_STATUS.BAD_REQUEST,
      );
    }

    // Log security event
    await supabase
      .from("security_events")
      .insert({
        event_type: "password_reset",
        user_id: sessionData.user.id,
        user_email: sessionData.user.email!,
        ip_address: getClientInfo(c).ip_address,
        user_agent: getClientInfo(c).user_agent,
        metadata: {
          reset_method: "email_token"
        }
      })
      .catch(err => console.error("Security log error:", err));

    return c.json({
      message: "Password reset successful. You can now login with your new password."
    });

  } catch (error) {
    console.error("Reset password error:", error);
    return c.json(
      { error: "Internal server error" },
      HTTP_STATUS.INTERNAL_SERVER_ERROR,
    );
  }
});

// GET /auth/sessions - Get active sessions for current user
authRoutes.get("/sessions", async (c) => {
  try {
    const token = c.req.header("Authorization")?.replace("Bearer ", "") || getCookie(c, 'auth_token');

    if (!token) {
      return c.json(
        { error: "Authentication required" },
        HTTP_STATUS.UNAUTHORIZED,
      );
    }

    const payload = await verify(token, JWT_SECRET).catch(() => null);

    if (!payload) {
      return c.json(
        { error: "Invalid token" },
        HTTP_STATUS.UNAUTHORIZED,
      );
    }

    const userId = payload.sub as string;

    const { data: sessions, error } = await supabase
      .from("active_user_sessions")
      .select("id, session_id, ip_address, user_agent, started_at, last_activity")
      .eq("user_id", userId)
      .order("last_activity", { ascending: false });

    if (error) {
      console.error("Sessions fetch error:", error);
      return c.json(
        { error: "Failed to fetch sessions" },
        HTTP_STATUS.INTERNAL_SERVER_ERROR,
      );
    }

    return c.json({
      current_session_id: payload.session_id,
      sessions: sessions || []
    });

  } catch (error) {
    console.error("Sessions fetch error:", error);
    return c.json(
      { error: "Internal server error" },
      HTTP_STATUS.INTERNAL_SERVER_ERROR,
    );
  }
});

// DELETE /auth/sessions/:session_id - Revoke specific session
authRoutes.delete("/sessions/:session_id", async (c) => {
  try {
    const sessionIdToRevoke = c.req.param("session_id");
    const token = c.req.header("Authorization")?.replace("Bearer ", "") || getCookie(c, 'auth_token');

    if (!token) {
      return c.json(
        { error: "Authentication required" },
        HTTP_STATUS.UNAUTHORIZED,
      );
    }

    const payload = await verify(token, JWT_SECRET).catch(() => null);

    if (!payload) {
      return c.json(
        { error: "Invalid token" },
        HTTP_STATUS.UNAUTHORIZED,
      );
    }

    const userId = payload.sub as string;

    // Delete the specified session
    const { error } = await supabase
      .from("active_user_sessions")
      .delete()
      .eq("session_id", sessionIdToRevoke)
      .eq("user_id", userId);

    if (error) {
      console.error("Session revoke error:", error);
      return c.json(
        { error: "Failed to revoke session" },
        HTTP_STATUS.INTERNAL_SERVER_ERROR,
      );
    }

    // Log security event
    await supabase
      .from("security_events")
      .insert({
        event_type: "session_revoked",
        user_id: userId,
        user_email: payload.email as string,
        ip_address: getClientInfo(c).ip_address,
        user_agent: getClientInfo(c).user_agent,
        metadata: {
          revoked_session_id: sessionIdToRevoke,
          revoked_by_session_id: payload.session_id
        }
      })
      .catch(err => console.error("Security log error:", err));

    return c.json({
      message: "Session revoked successfully",
      revoked_session_id: sessionIdToRevoke
    });

  } catch (error) {
    console.error("Session revoke error:", error);
    return c.json(
      { error: "Internal server error" },
      HTTP_STATUS.INTERNAL_SERVER_ERROR,
    );
  }
});

// POST /auth/verify-token - Verify if token is valid
authRoutes.post("/verify-token", async (c) => {
  try {
    const body = await c.req.json().catch(() => null);
    const token = body?.token || c.req.header("Authorization")?.replace("Bearer ", "") || getCookie(c, 'auth_token');

    if (!token) {
      return c.json(
        { error: "Token is required" },
        HTTP_STATUS.BAD_REQUEST,
      );
    }

    const payload = await verify(token, JWT_SECRET).catch(() => null);

    if (!payload) {
      return c.json({
        valid: false,
        error: "Invalid or expired token"
      });
    }

    const sessionId = payload.session_id as string;
    const userId = payload.sub as string;

    // Verify session is still active
    const { data: session, error: sessionError } = await supabase
      .from("active_user_sessions")
      .select("last_activity")
      .eq("session_id", sessionId)
      .eq("user_id", userId)
      .single();

    if (sessionError || !session) {
      return c.json({
        valid: false,
        error: "Session expired or not found"
      });
    }

    return c.json({
      valid: true,
      user: {
        id: payload.sub,
        email: payload.email,
        role: payload.role,
        full_name: payload.full_name,
        professional_title: payload.professional_title,
        medical_license: payload.medical_license,
        department: payload.department,
      },
      expires_at: new Date(payload.exp * 1000).toISOString(),
      session_id: sessionId
    });

  } catch (error) {
    console.error("Token verification error:", error);
    return c.json(
      { error: "Internal server error" },
      HTTP_STATUS.INTERNAL_SERVER_ERROR,
    );
  }
});