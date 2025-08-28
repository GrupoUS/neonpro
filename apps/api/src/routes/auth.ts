/**
 * 🔐 Authentication Routes - NeonPro API
 * =======================================
 *
 * Rotas de autenticação com validação Zod e type-safety
 * completo para Hono RPC integration.
 */

import { zValidator } from "@hono/zod-validator";
import type { AuthToken, AuthUser } from "@neonpro/shared/schemas";
import {
  ChangePasswordRequestSchema,
  ForgotPasswordRequestSchema,
  LoginRequestSchema,
  RefreshTokenRequestSchema,
  RegisterRequestSchema,
  ResetPasswordRequestSchema,
} from "@neonpro/shared/schemas";
import type { ApiResponse } from "@neonpro/shared/types";
import { Hono } from "hono";
import { HTTP_STATUS } from "../lib/constants.js";
import { supabase } from "../lib/supabase.js";

// Helper function to get user permissions based on role
function getUserPermissions(role: string): string[] {
  const rolePermissions: Record<string, string[]> = {
    admin: [
      "read:patients",
      "write:patients",
      "delete:patients",
      "read:appointments",
      "write:appointments",
      "delete:appointments",
      "read:users",
      "write:users",
      "read:analytics",
      "manage:system",
    ],
    healthcare_provider: [
      "read:patients",
      "write:patients",
      "read:appointments",
      "write:appointments",
      "read:medical_records",
      "write:medical_records",
    ],
    clinic_staff: [
      "read:patients",
      "write:patients",
      "read:appointments",
      "write:appointments",
    ],
    patient: [
      "read:own_data",
      "write:own_data",
      "read:own_appointments",
      "write:own_appointments",
    ],
  };

  return rolePermissions[role] || [];
}

// Create auth router
export const authRoutes = new Hono()
  // 🚪 Login endpoint
  .post("/login", zValidator("json", LoginRequestSchema), async (c) => {
    const { email, password } = c.req.valid("json");

    try {
      // Authenticate with Supabase
      const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (authError || !authData.user) {
        return c.json(
          {
            success: false,
            error: "INVALID_CREDENTIALS",
            message: "Email ou senha incorretos",
          },
          HTTP_STATUS.UNAUTHORIZED,
        );
      }

      // Get user profile from our users table
      const { data: userProfile, error: profileError } = await supabase
        .from('users')
        .select('*')
        .eq('id', authData.user.id)
        .single();

      if (profileError || !userProfile) {
        return c.json(
          {
            success: false,
            error: "USER_NOT_FOUND",
            message: "Perfil do usuário não encontrado",
          },
          HTTP_STATUS.NOT_FOUND,
        );
      }

      // Check if user is active
      if (!userProfile.is_active) {
        return c.json(
          {
            success: false,
            error: "USER_INACTIVE",
            message: "Conta desativada. Entre em contato com o suporte.",
          },
          HTTP_STATUS.FORBIDDEN,
        );
      }

      // Get user permissions based on role
      const permissions = getUserPermissions(userProfile.role);

      const user: AuthUser = {
        id: userProfile.id,
        email: userProfile.email,
        fullName: userProfile.name,
        role: userProfile.role,
        isActive: userProfile.is_active,
        isVerified: userProfile.is_verified,
        isMFAEnabled: userProfile.is_mfa_enabled,
        createdAt: userProfile.created_at,
        permissions,
      };

      const tokens: AuthToken = {
        accessToken: authData.session.access_token,
        refreshToken: authData.session.refresh_token,
        tokenType: "Bearer",
        expiresIn: authData.session.expires_in || 3600,
      };

      const response: ApiResponse<{ user: AuthUser; tokens: AuthToken }> = {
        success: true,
        data: { user, tokens },
        message: "Login realizado com sucesso",
      };

      return c.json(response, HTTP_STATUS.OK);
    } catch (error) {
      console.error('Login error:', error);
      return c.json(
        {
          success: false,
          error: "INTERNAL_ERROR",
          message: "Erro interno do servidor",
        },
        HTTP_STATUS.INTERNAL_SERVER_ERROR,
      );
    }
  })
  // 📝 Register endpoint
  .post("/register", zValidator("json", RegisterRequestSchema), async (c) => {
    const userData = c.req.valid("json");

    try {
      // Check if user already exists
      const { data: existingUser } = await supabase
        .from('users')
        .select('id')
        .eq('email', userData.email)
        .single();

      if (existingUser) {
        return c.json(
          {
            success: false,
            error: "USER_EXISTS",
            message: "Usuário já existe com este email",
          },
          HTTP_STATUS.CONFLICT,
        );
      }

      // Validate license number if professional role
      if (['healthcare_provider', 'clinic_staff'].includes(userData.role) && userData.licenseNumber) {
        // TODO: Implement license validation with external service
        // For now, just check if license number is provided
        if (!userData.licenseNumber || userData.licenseNumber.length < 5) {
          return c.json(
            {
              success: false,
              error: "INVALID_LICENSE",
              message: "Número de licença profissional inválido",
            },
            HTTP_STATUS.BAD_REQUEST,
          );
        }
      }

      // Create user in Supabase Auth
      const { data: authData, error: authError } = await supabase.auth.admin.createUser({
        email: userData.email,
        password: userData.password,
        email_confirm: false, // Require email verification
        user_metadata: {
          full_name: userData.fullName,
          role: userData.role,
          clinic_id: userData.clinicId,
          license_number: userData.licenseNumber,
        }
      });

      if (authError) {
        return c.json(
          {
            success: false,
            error: "AUTH_ERROR",
            message: authError.message,
          },
          HTTP_STATUS.BAD_REQUEST,
        );
      }

      // Create user profile in our users table
      const { error: profileError } = await supabase
        .from('users')
        .insert({
          id: authData.user.id,
          email: userData.email,
          name: userData.fullName,
          role: userData.role,
          clinic_id: userData.clinicId,
          license_number: userData.licenseNumber,
          is_active: true,
          is_verified: false,
          is_mfa_enabled: false,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        });

      if (profileError) {
        // Cleanup: delete the auth user if profile creation failed
        await supabase.auth.admin.deleteUser(authData.user.id);
        
        return c.json(
          {
            success: false,
            error: "PROFILE_ERROR",
            message: "Erro ao criar perfil do usuário",
          },
          HTTP_STATUS.INTERNAL_SERVER_ERROR,
        );
      }

      // Send verification email
      const { error: emailError } = await supabase.auth.admin.generateLink({
        type: 'signup',
        email: userData.email,
      });

      if (emailError) {
        console.error('Error sending verification email:', emailError);
        // Don't fail the registration if email sending fails
      }

      const user: AuthUser = {
        id: authData.user.id,
        email: userData.email,
        fullName: userData.fullName,
        role: userData.role,
        isActive: true,
        isVerified: false,
        isMFAEnabled: false,
        createdAt: authData.user.created_at,
        permissions: [],
      };

      const response: ApiResponse<{
        user: AuthUser;
        requiresVerification: boolean;
      }> = {
        success: true,
        data: {
          user,
          requiresVerification: true,
        },
        message: "Cadastro realizado com sucesso. Verifique seu email.",
      };

      return c.json(response, HTTP_STATUS.CREATED);
    } catch (error) {
      console.error('Registration error:', error);
      return c.json(
        {
          success: false,
          error: "INTERNAL_ERROR",
          message: "Erro ao criar usuário",
        },
        HTTP_STATUS.INTERNAL_SERVER_ERROR,
      );
    }
  })
  // 🔄 Refresh token endpoint
  .post("/refresh", zValidator("json", RefreshTokenRequestSchema), async (c) => {
    const { refreshToken } = c.req.valid("json");

    try {
      // Refresh the session with Supabase
      const { data: sessionData, error: refreshError } = await supabase.auth.refreshSession({
        refresh_token: refreshToken,
      });

      if (refreshError || !sessionData.session) {
        return c.json(
          {
            success: false,
            error: "TOKEN_INVALID",
            message: "Token de renovação inválido ou expirado",
          },
          HTTP_STATUS.UNAUTHORIZED,
        );
      }

      const tokens: AuthToken = {
        accessToken: sessionData.session.access_token,
        refreshToken: sessionData.session.refresh_token,
        tokenType: "Bearer",
        expiresIn: sessionData.session.expires_in || 3600,
      };

      const response: ApiResponse<{ tokens: AuthToken }> = {
        success: true,
        data: { tokens },
        message: "Token renovado com sucesso",
      };

      return c.json(response, HTTP_STATUS.OK);
    } catch (error) {
      console.error('Refresh token error:', error);
      return c.json(
        {
          success: false,
          error: "TOKEN_INVALID",
          message: "Token de renovação inválido",
        },
        HTTP_STATUS.UNAUTHORIZED,
      );
    }
  })
  // 👤 Get profile endpoint (requires auth)
  .get("/profile", async (c) => {
    try {
      // Get user from auth middleware
      const userId = c.get("userId"); // From auth middleware

      if (!userId) {
        return c.json(
          {
            success: false,
            error: "UNAUTHORIZED",
            message: "Token de acesso necessário",
          },
          HTTP_STATUS.UNAUTHORIZED,
        );
      }

      // Fetch user from database
      const { data: userData, error: userError } = await supabase
        .from('users')
        .select('*')
        .eq('id', userId)
        .single();

      if (userError || !userData) {
        return c.json(
          {
            success: false,
            error: "USER_NOT_FOUND",
            message: "Usuário não encontrado",
          },
          HTTP_STATUS.NOT_FOUND,
        );
      }

      const user: AuthUser = {
        id: userData.id,
        email: userData.email,
        fullName: userData.full_name,
        role: userData.role,
        isActive: userData.is_active,
        isVerified: userData.is_verified,
        isMFAEnabled: userData.is_mfa_enabled || false,
        createdAt: userData.created_at,
        permissions: getUserPermissions(userData.role),
      };

      const response: ApiResponse<AuthUser> = {
        success: true,
        data: user,
        message: "Perfil recuperado com sucesso",
      };

      return c.json(response, HTTP_STATUS.OK);
    } catch {
      return c.json(
        {
          success: false,
          error: "INTERNAL_ERROR",
          message: "Erro ao buscar perfil",
        },
        HTTP_STATUS.INTERNAL_SERVER_ERROR,
      );
    }
  })
  // 🚪 Logout endpoint
  .post("/logout", async (c) => {
    try {
      // Get the authorization header
      const authHeader = c.req.header('Authorization');
      
      if (authHeader && authHeader.startsWith('Bearer ')) {
        const token = authHeader.substring(7);
        
        // Sign out the user from Supabase (invalidates the session)
        await supabase.auth.signOut();
        
        // Note: In a production environment, you might want to maintain
        // a blacklist of invalidated tokens or use a token store
      }

      const response: ApiResponse<{ loggedOut: boolean }> = {
        success: true,
        data: { loggedOut: true },
        message: "Logout realizado com sucesso",
      };

      return c.json(response, HTTP_STATUS.OK);
    } catch {
      return c.json(
        {
          success: false,
          error: "INTERNAL_ERROR",
          message: "Erro ao fazer logout",
        },
        HTTP_STATUS.INTERNAL_SERVER_ERROR,
      );
    }
  })
  // 🔑 Forgot password endpoint
  .post(
    "/forgot-password",
    zValidator("json", ForgotPasswordRequestSchema),
    async (c) => {
      const { email } = c.req.valid("json");

      try {
        // Send password reset email using Supabase
        const { error: resetError } = await supabase.auth.resetPasswordForEmail(email, {
          redirectTo: `${process.env.FRONTEND_URL}/reset-password`,
        });

        if (resetError) {
          console.error('Password reset error:', resetError);
          // Don't reveal if email exists or not for security
        }

        // Always return success to prevent email enumeration attacks
        const response: ApiResponse<{ emailSent: boolean }> = {
          success: true,
          data: { emailSent: true },
          message: "Se o email existir, um link de recuperação será enviado",
        };

        return c.json(response, HTTP_STATUS.OK);
      } catch (error) {
        console.error('Forgot password error:', error);
        return c.json(
          {
            success: false,
            error: "INTERNAL_ERROR",
            message: "Erro ao processar solicitação de recuperação",
          },
          HTTP_STATUS.INTERNAL_SERVER_ERROR,
        );
      }
    },
  )
  // 🔐 Reset password endpoint
  .post(
    "/reset-password",
    zValidator("json", ResetPasswordRequestSchema),
    async (c) => {
      const { token, password } = c.req.valid("json");

      try {
        // Verify the reset token and update password using Supabase
        const { data: sessionData, error: verifyError } = await supabase.auth.verifyOtp({
          token_hash: token,
          type: 'recovery',
        });

        if (verifyError || !sessionData.session) {
          return c.json(
            {
              success: false,
              error: "TOKEN_INVALID",
              message: "Token de recuperação inválido ou expirado",
            },
            HTTP_STATUS.BAD_REQUEST,
          );
        }

        // Update the user's password
        const { error: updateError } = await supabase.auth.updateUser({
          password: password,
        });

        if (updateError) {
          console.error('Password update error:', updateError);
          return c.json(
            {
              success: false,
              error: "PASSWORD_UPDATE_FAILED",
              message: "Erro ao atualizar senha",
            },
            HTTP_STATUS.INTERNAL_SERVER_ERROR,
          );
        }

        const response: ApiResponse<{ passwordChanged: boolean }> = {
          success: true,
          data: { passwordChanged: true },
          message: "Senha alterada com sucesso",
        };

        return c.json(response, HTTP_STATUS.OK);
      } catch (error) {
        console.error('Reset password error:', error);
        return c.json(
          {
            success: false,
            error: "INTERNAL_ERROR",
            message: "Erro ao redefinir senha",
          },
          HTTP_STATUS.INTERNAL_SERVER_ERROR,
        );
      }
    },
  )
  // 🔒 Change password endpoint (requires auth)
  .post(
    "/change-password",
    zValidator("json", ChangePasswordRequestSchema),
    async (c) => {
      const { currentPassword, newPassword } = c.req.valid("json");

      try {
        const userId = c.get("userId");
        const authHeader = c.req.header("authorization");

        if (!userId || !authHeader) {
          return c.json(
            {
              success: false,
              error: "UNAUTHORIZED",
              message: "Autenticação necessária",
            },
            HTTP_STATUS.UNAUTHORIZED,
          );
        }

        // Extract token from authorization header
        const token = authHeader.replace("Bearer ", "");

        // Verify current password by attempting to sign in
        const { data: userData } = await supabase.auth.getUser(token);
        if (!userData.user?.email) {
          return c.json(
            {
              success: false,
              error: "UNAUTHORIZED",
              message: "Token inválido",
            },
            HTTP_STATUS.UNAUTHORIZED,
          );
        }

        // Verify current password
        const { error: signInError } = await supabase.auth.signInWithPassword({
          email: userData.user.email,
          password: currentPassword,
        });

        if (signInError) {
          return c.json(
            {
              success: false,
              error: "INVALID_CREDENTIALS",
              message: "Senha atual incorreta",
            },
            HTTP_STATUS.BAD_REQUEST,
          );
        }

        // Update to new password
        const { error: updateError } = await supabase.auth.updateUser({
          password: newPassword,
        });

        if (updateError) {
          return c.json(
            {
              success: false,
              error: "PASSWORD_UPDATE_FAILED",
              message: "Falha ao atualizar senha",
            },
            HTTP_STATUS.INTERNAL_SERVER_ERROR,
          );
        }

        // Sign out to invalidate all existing tokens
        await supabase.auth.signOut();

        const response: ApiResponse<{ passwordReset: boolean }> = {
          success: true,
          data: { passwordReset: true },
          message: "Senha alterada com sucesso. Faça login novamente.",
        };

        return c.json(response, HTTP_STATUS.OK);
      } catch {
        return c.json(
          {
            success: false,
            error: "INTERNAL_ERROR",
            message: "Erro ao alterar senha",
          },
          HTTP_STATUS.INTERNAL_SERVER_ERROR,
        );
      }
    },
  );

// Export the router
export default authRoutes;
