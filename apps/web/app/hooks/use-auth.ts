"use client";

import { useState, useEffect } from "react";

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
      // TODO: Implement actual auth check with Supabase
      // const { data: { user } } = await supabase.auth.getUser();
      // if (user) {
      //   const userData = await fetchUserProfile(user.id);
      //   setUser(userData);
      // }
      
      // Placeholder implementation
      const storedUser = localStorage.getItem("auth_user");
      if (storedUser) {
        setUser(JSON.parse(storedUser));
      }
    } catch (error) {
      console.error("Auth session check failed:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const login = async (email: string, password: string) => {
    try {
      setIsLoading(true);
      
      // TODO: Implement actual login with Supabase
      // const { data, error } = await supabase.auth.signInWithPassword({
      //   email,
      //   password,
      // });
      
      // Placeholder implementation
      const mockUser: User = {
        id: "mock-user-id",
        email,
        name: "Healthcare Provider",
        role: "healthcare_provider",
        clinic_id: "mock-clinic-id",
      };
      
      setUser(mockUser);
      localStorage.setItem("auth_user", JSON.stringify(mockUser));
      
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
      
      // TODO: Implement actual logout with Supabase
      // await supabase.auth.signOut();
      
      setUser(null);
      localStorage.removeItem("auth_user");
      
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
      
      // TODO: Implement actual registration with Supabase
      // const { data, error } = await supabase.auth.signUp({
      //   email: userData.email,
      //   password: userData.password,
      // });
      
      // Placeholder implementation
      const newUser: User = {
        id: "new-user-id",
        email: userData.email,
        name: userData.name,
        role: userData.role,
        clinic_id: userData.clinic_id,
      };
      
      setUser(newUser);
      localStorage.setItem("auth_user", JSON.stringify(newUser));
      
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