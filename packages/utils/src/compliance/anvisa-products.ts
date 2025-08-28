/**
 * ANVISA Product Management Module
 */

import type { SupabaseClient } from "@supabase/supabase-js";
import type { ANVISAProduct } from "./anvisa-types";

const DEFAULT_EXPIRY_DAYS = 30;
const EMPTY_STRING_LENGTH = 0;

export class ANVISAProductManager {
  constructor(private readonly supabase: SupabaseClient) {}

  async registerProduct(
    product: Omit<ANVISAProduct, "id" | "created_at" | "updated_at">,
  ): Promise<ANVISAProduct | null> {
    try {
      const { data, error } = await this.supabase
        .from("anvisa_products")
        .insert(product)
        .select()
        .single();

      if (error) {
        throw error;
      }

      // Log compliance action
      await this.logComplianceAction(
        "product_registration",
        product.name,
        data.id,
      );

      return data;
    } catch {
      return null;
    }
  }

  async validateProductCompliance(productId: string): Promise<boolean> {
    try {
      const { data: product } = await this.supabase
        .from("anvisa_products")
        .select("*")
        .eq("id", productId)
        .single();

      if (!product) {
        return false;
      }

      // Check if product is approved and not expired
      const isApproved = product.regulatory_status === "approved";
      const notExpired = new Date(product.expiry_date) > new Date();
      const hasValidRegistration =
        product.registration_number &&
        product.registration_number.length > EMPTY_STRING_LENGTH;

      return isApproved && notExpired && hasValidRegistration;
    } catch {
      return false;
    }
  }

  async getExpiringSoonProducts(
    days = DEFAULT_EXPIRY_DAYS,
  ): Promise<ANVISAProduct[]> {
    try {
      const futureDate = new Date();
      futureDate.setDate(futureDate.getDate() + days);

      const { data } = await this.supabase
        .from("anvisa_products")
        .select("*")
        .lte("expiry_date", futureDate.toISOString())
        .gte("expiry_date", new Date().toISOString())
        .eq("regulatory_status", "approved");

      return data || [];
    } catch {
      return [];
    }
  }

  async getProductByRegistration(
    registrationNumber: string,
  ): Promise<ANVISAProduct | null> {
    try {
      const { data } = await this.supabase
        .from("anvisa_products")
        .select("*")
        .eq("registration_number", registrationNumber)
        .single();

      return data || undefined;
    } catch {
      return null;
    }
  }

  validateANVISARegistrationNumber(registrationNumber: string): boolean {
    // Brazilian ANVISA registration numbers follow specific patterns
    // This is a simplified validation - real implementation would call ANVISA API
    const ANVISA_REGISTRATION_PATTERN = /^[0-9]{13}$/; // 13-digit number
    return ANVISA_REGISTRATION_PATTERN.test(registrationNumber);
  }

  private async logComplianceAction(
    action: string,
    description: string,
    referenceId: string,
  ): Promise<void> {
    try {
      await this.supabase.from("compliance_logs").insert({
        action,
        description,
        module: "anvisa",
        reference_id: referenceId,
        timestamp: new Date().toISOString(),
      });
    } catch {
      // Silently fail on logging errors
    }
  }
}
