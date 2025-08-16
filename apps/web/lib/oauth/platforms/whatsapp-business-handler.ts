import { BaseOAuthHandler } from '../base-oauth-handler';
import {
  type OAuthConfig,
  OAuthError,
  type OAuthPlatform,
  type OAuthTokens,
  type OAuthUserInfo,
} from '../types';

export class WhatsAppBusinessOAuthHandler extends BaseOAuthHandler {
  protected platform: OAuthPlatform = 'whatsapp_business';

  protected getAuthConfig(): OAuthConfig {
    return {
      authUrl: 'https://www.facebook.com/v18.0/dialog/oauth',
      tokenUrl: 'https://graph.facebook.com/v18.0/oauth/access_token',
      scope: [
        'whatsapp_business_management',
        'whatsapp_business_messaging',
        'business_management',
        'pages_manage_metadata',
        'pages_read_engagement',
      ].join(','),
      clientId: process.env.WHATSAPP_CLIENT_ID!,
      clientSecret: process.env.WHATSAPP_CLIENT_SECRET!,
      redirectUri: `${process.env.NEXT_PUBLIC_APP_URL}/api/oauth/whatsapp-business/callback`,
      extraParams: {
        config_id: process.env.WHATSAPP_CONFIG_ID!, // Required for WhatsApp Business
        response_type: 'code',
      },
    };
  }

  async getUserInfo(accessToken: string): Promise<OAuthUserInfo> {
    try {
      // Get user basic info
      const userResponse = await fetch(
        `https://graph.facebook.com/v18.0/me?fields=id,name,email&access_token=${accessToken}`,
      );

      if (!userResponse.ok) {
        throw new OAuthError(
          'Failed to fetch user info',
          userResponse.status,
          await userResponse.text(),
        );
      }

      const userData = await userResponse.json();

      // Get WhatsApp Business Accounts
      const wabaResponse = await fetch(
        `https://graph.facebook.com/v18.0/me/businesses?fields=whatsapp_business_accounts{id,name,currency,timezone_id,message_template_namespace}&access_token=${accessToken}`,
      );

      let whatsappAccounts = [];
      if (wabaResponse.ok) {
        const wabaData = await wabaResponse.json();
        // Extract WhatsApp Business Accounts from business accounts
        whatsappAccounts =
          wabaData.data?.flatMap(
            (business: any) => business.whatsapp_business_accounts?.data || [],
          ) || [];
      }

      // Get phone numbers for each WABA
      const phoneNumbers = await this.getPhoneNumbers(
        accessToken,
        whatsappAccounts,
      );

      return {
        id: userData.id,
        name: userData.name,
        email: userData.email,
        profilePicture: `https://graph.facebook.com/v18.0/${userData.id}/picture?type=large`,
        platformData: {
          whatsappBusinessAccounts: whatsappAccounts,
          phoneNumbers,
          permissions: await this.getUserPermissions(accessToken, userData.id),
        },
      };
    } catch (error) {
      if (error instanceof OAuthError) {
        throw error;
      }
      throw new OAuthError(
        'Failed to get WhatsApp Business user info',
        500,
        error instanceof Error ? error.message : 'Unknown error',
      );
    }
  }

  async refreshAccessToken(refreshToken: string): Promise<OAuthTokens> {
    try {
      const config = this.getAuthConfig();

      // WhatsApp Business uses Facebook's token exchange mechanism
      const response = await fetch(
        'https://graph.facebook.com/v18.0/oauth/access_token?' +
          'grant_type=fb_exchange_token&' +
          `client_id=${config.clientId}&` +
          `client_secret=${config.clientSecret}&` +
          `fb_exchange_token=${refreshToken}`,
      );

      if (!response.ok) {
        throw new OAuthError(
          'Failed to refresh WhatsApp Business access token',
          response.status,
          await response.text(),
        );
      }

      const data = await response.json();

      return {
        accessToken: data.access_token,
        refreshToken: data.access_token, // Facebook doesn't provide separate refresh tokens
        expiresIn: data.expires_in || 5_183_944, // Facebook long-lived tokens (~60 days)
        scope: config.scope,
        tokenType: 'Bearer',
      };
    } catch (error) {
      if (error instanceof OAuthError) {
        throw error;
      }
      throw new OAuthError(
        'Failed to refresh WhatsApp Business token',
        500,
        error instanceof Error ? error.message : 'Unknown error',
      );
    }
  }

  async validateToken(accessToken: string): Promise<boolean> {
    try {
      // Validate by attempting to access WhatsApp Business API
      const response = await fetch(
        `https://graph.facebook.com/v18.0/me/businesses?fields=whatsapp_business_accounts&access_token=${accessToken}`,
      );
      return response.ok;
    } catch {
      return false;
    }
  }

  async revokeToken(accessToken: string): Promise<boolean> {
    try {
      // Get user ID first
      const userResponse = await fetch(
        `https://graph.facebook.com/v18.0/me?access_token=${accessToken}`,
      );

      if (!userResponse.ok) {
        return false;
      }

      const userData = await userResponse.json();

      // Revoke the access token
      const response = await fetch(
        `https://graph.facebook.com/v18.0/${userData.id}/permissions`,
        {
          method: 'DELETE',
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
        },
      );

      return response.ok;
    } catch {
      return false;
    }
  }

  private async getPhoneNumbers(
    accessToken: string,
    whatsappAccounts: any[],
  ): Promise<any[]> {
    const phoneNumbers = [];

    for (const account of whatsappAccounts) {
      try {
        const response = await fetch(
          `https://graph.facebook.com/v18.0/${account.id}/phone_numbers?access_token=${accessToken}`,
        );

        if (response.ok) {
          const data = await response.json();
          phoneNumbers.push(
            ...(data.data || []).map((phone: any) => ({
              ...phone,
              waba_id: account.id,
              waba_name: account.name,
            })),
          );
        }
      } catch (_error) {}
    }

    return phoneNumbers;
  }

  private async getUserPermissions(
    accessToken: string,
    userId: string,
  ): Promise<string[]> {
    try {
      const response = await fetch(
        `https://graph.facebook.com/v18.0/${userId}/permissions?access_token=${accessToken}`,
      );

      if (!response.ok) {
        return [];
      }

      const data = await response.json();
      return (
        data.data
          ?.filter((perm: any) => perm.status === 'granted')
          ?.map((perm: any) => perm.permission) || []
      );
    } catch {
      return [];
    }
  }

  protected getErrorMessage(error: any): string {
    if (error?.error?.message) {
      return error.error.message;
    }
    if (error?.error_description) {
      return error.error_description;
    }
    return 'WhatsApp Business OAuth error occurred';
  }

  // WhatsApp Business specific methods
  async sendMessage(
    accessToken: string,
    phoneNumberId: string,
    to: string,
    message: string,
  ): Promise<any> {
    try {
      const response = await fetch(
        `https://graph.facebook.com/v18.0/${phoneNumberId}/messages`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${accessToken}`,
          },
          body: JSON.stringify({
            messaging_product: 'whatsapp',
            to,
            text: { body: message },
          }),
        },
      );

      if (!response.ok) {
        throw new OAuthError(
          'Failed to send WhatsApp message',
          response.status,
          await response.text(),
        );
      }

      return await response.json();
    } catch (error) {
      if (error instanceof OAuthError) {
        throw error;
      }
      throw new OAuthError(
        'Failed to send WhatsApp message',
        500,
        error instanceof Error ? error.message : 'Unknown error',
      );
    }
  }

  async getMessageTemplates(
    accessToken: string,
    wabaId: string,
  ): Promise<any[]> {
    try {
      const response = await fetch(
        `https://graph.facebook.com/v18.0/${wabaId}/message_templates?access_token=${accessToken}`,
      );

      if (!response.ok) {
        throw new OAuthError(
          'Failed to get WhatsApp message templates',
          response.status,
          await response.text(),
        );
      }

      const data = await response.json();
      return data.data || [];
    } catch (error) {
      if (error instanceof OAuthError) {
        throw error;
      }
      throw new OAuthError(
        'Failed to get WhatsApp message templates',
        500,
        error instanceof Error ? error.message : 'Unknown error',
      );
    }
  }
}
