"use client";

import { createClient } from "@supabase/supabase-js";
import { useEffect, useState } from "react";

// Initialize Supabase client
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
const supabase = createClient(supabaseUrl, supabaseAnonKey);

interface User {
  id: string;
  email: string;
  name: string;
  role: "admin" | "healthcare_provider" | "clinic_staff" | "patient";
  clinic_id?: string;
  license_number?: string;
}

interface UseAuthReturn {
  user: User | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  register: (userData: RegisterData) => Promise<void>;
}

interface RegisterData {
  email: string;
  password: string;
  name: string;
  role: User["role"];
  clinic_id?: string;
}

export function useAuth(): UseAuthReturn {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Check for existing auth session
    checkAuthSession();
  }, []);

  const checkAuthSession = async () => {
    try {
      setIsLoading(true);

      const { data: { user }, error } = await supabase.auth.getUser();

      if (error) {
        console.error("Error getting user:", error);
        setUser(null);
        return;
      }

      if (user) {
        // Fetch user profile from our custom users table
        const { data: profile, error: profileError } = await supabase
          .from("users")
          .select("*")
          .eq("id", user.id)
          .single();

        if (profileError) {
          console.error("Error fetching user profile:", profileError);
          // Fallback to basic user data from auth
          const basicUser: User = {
            id: user.id,
            email: user.email || "",
            name: user.user_metadata?.name || user.email?.split("@")[0] || "User",
            role: user.user_metadata?.role || "patient",
            clinic_id: user.user_metadata?.clinic_id,
            license_number: user.user_metadata?.license_number,
          };
          setUser(basicUser);
        } else {
          const userData: User = {
            id: profile.id,
            email: profile.email,
            name: profile.name,
            role: profile.role,
            clinic_id: profile.clinic_id,
            license_number: profile.license_number,
          };
          setUser(userData);
        }
      } else {
        setUser(null);
      }
    } catch (error) {
      console.error("Auth session check failed:", error);
      setUser(null);
    } finally {
      setIsLoading(false);
    }
  };

  const login = async (email: string, password: string) => {
    try {
      setIsLoading(true);

      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        throw new Error(error.message);
      }

      if (data.user) {
        // Fetch user profile after successful login
        await checkAuthSession();
      }
    } catch (error) {
      console.error("Login failed:", error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const logout = async () => {
    try {
      setIsLoading(true);

      const { error } = await supabase.auth.signOut();

      if (error) {
        console.error("Logout error:", error);
        throw new Error(error.message);
      }

      setUser(null);
    } catch (error) {
      console.error("Logout failed:", error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const register = async (userData: RegisterData) => {
    try {
      setIsLoading(true);

      const { data, error } = await supabase.auth.signUp({
        email: userData.email,
        password: userData.password,
        options: {
          data: {
            name: userData.name,
            role: userData.role,
            clinic_id: userData.clinic_id,
          },
        },
      });

      if (error) {
        throw new Error(error.message);
      }

      if (data.user) {
        // Create user profile in our custom users table
        const { error: profileError } = await supabase
          .from("users")
          .insert({
            id: data.user.id,
            email: userData.email,
            name: userData.name,
            role: userData.role,
            clinic_id: userData.clinic_id,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
          });

        if (profileError) {
          console.error("Error creating user profile:", profileError);
          // Don't throw here as the auth user was created successfully
        }

        // Note: User will need to verify email before being able to login
        // Don't set user state here as they're not fully authenticated yet
      }
    } catch (error) {
      console.error("Registration failed:", error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  return {
    user,
    isLoading,
    isAuthenticated: !!user,
    login,
    logout,
    register,
  };
}
