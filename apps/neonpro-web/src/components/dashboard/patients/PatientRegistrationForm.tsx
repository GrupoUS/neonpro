"use client";

/**
 * Patient Registration Form Component
 *
 * FHIR-compliant patient registration with LGPD consent management.
 * Implements HL7 FHIR R4 Patient resource structure and Brazilian
 * data protection requirements.
 */

import type { zodResolver } from "@hookform/resolvers/zod";
import type { AlertCircle, FileText, Loader2, Plus, Shield, Trash2 } from "lucide-react";
import type { useState } from "react";
import type { useFieldArray, useForm } from "react-hook-form";
import type { toast } from "sonner";
import type { Alert, AlertDescription } from "@/components/ui/alert";
import type { Button } from "@/components/ui/button";
import type {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import type { Checkbox } from "@/components/ui/checkbox";
import type {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import type { Input } from "@/components/ui/input";
import type { Label } from "@/components/ui/label";
import type {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import type { Separator } from "@/components/ui/separator";
import type { Textarea } from "@/components/ui/textarea";
import type { useAuth } from "@/contexts/auth-context";
import type { createPatient } from "@/lib/supabase/patients";
import type { PatientRegistrationData, PatientRegistrationSchema } from "@/lib/validations/patient";

interface PatientRegistrationFormProps {
  onSuccess?: (patientId: string) => void;
  onCancel?: () => void;
}

export function PatientRegistrationForm({ onSuccess, onCancel }: PatientRegistrationFormProps) {
  const { user } = useAuth();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const form = useForm<PatientRegistrationData>({
    resolver: zodResolver(PatientRegistrationSchema),
    defaultValues: {
      given_names: [""],
      family_name: "",
      medical_record_number: "",
      gender: "unknown",
      birth_date: "",
      phone_primary: "",
      address_line1: "",
      city: "",
      state: "",
      postal_code: "",
      country: "BR",
      emergency_contact_name: "",
      emergency_contact_relationship: "",
      emergency_contact_phone: "",
      preferred_language: "pt-BR",
      lgpd_consent_general: false,
      lgpd_consent_marketing: false,
      lgpd_consent_research: false,
      lgpd_consent_third_party: false,
    },
  });

  const {
    fields: givenNameFields,
    append: appendGivenName,
    remove: removeGivenName,
  } = useFieldArray({
    control: form.control,
    name: "given_names",
  });

  const onSubmit = async (data: PatientRegistrationData) => {
    if (!user?.id) {
      toast.error("User not authenticated");
      return;
    }

    setIsSubmitting(true);
    try {
      const result = await createPatient(data, user.id);
      toast.success("Patient registered successfully");
      form.reset();
      onSuccess?.(result.patient.id);
    } catch (error) {
      console.error("Error creating patient:", error);
      if (error instanceof Error) {
        toast.error(error.message);
      } else {
        toast.error("Failed to register patient");
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
        {/* Header */}
        <div className="space-y-2">
          <h2 className="text-2xl font-bold tracking-tight">Patient Registration</h2>
          <p className="text-muted-foreground">
            Register a new patient with FHIR-compliant data structure and LGPD consent management.
          </p>
        </div>
        {/* Medical Record Information */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileText className="h-5 w-5" />
              Medical Record Information
            </CardTitle>
            <CardDescription>
              Basic patient identification following HL7 FHIR Patient resource structure.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <FormField
              control={form.control}
              name="medical_record_number"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Medical Record Number *</FormLabel>
                  <FormControl>
                    <Input placeholder="MR-2024-001" {...field} />
                  </FormControl>
                  <FormDescription>
                    Unique identifier for this patient within the clinic.
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
          </CardContent>
        </Card>
        {/* Personal Information */}
        <Card>
          <CardHeader>
            <CardTitle>Personal Information</CardTitle>
            <CardDescription>Patient demographics and contact information.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Name Fields */}
            <div className="space-y-4">
              <FormField
                control={form.control}
                name="family_name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Family Name (Last Name) *</FormLabel>
                    <FormControl>
                      <Input placeholder="Silva" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="space-y-2">
                <Label>Given Names (First Names) *</Label>
                {givenNameFields.map((field, index) => (
                  <div key={field.id} className="flex gap-2">
                    <FormField
                      control={form.control}
                      name={`given_names.${index}`}
                      render={({ field }) => (
                        <FormItem className="flex-1">
                          <FormControl>
                            <Input placeholder={index === 0 ? "João" : "Middle name"} {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    {index > 0 && (
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => removeGivenName(index)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    )}
                  </div>
                ))}
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => appendGivenName("")}
                  className="w-full"
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Add Middle Name
                </Button>
              </div>

              <FormField
                control={form.control}
                name="preferred_name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Preferred Name</FormLabel>
                    <FormControl>
                      <Input placeholder="How the patient likes to be called" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <Separator />

            {/* Identity Documents */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="cpf"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>CPF</FormLabel>
                    <FormControl>
                      <Input placeholder="000.000.000-00" {...field} />
                    </FormControl>
                    <FormDescription>Brazilian individual taxpayer registry</FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="rg"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>RG</FormLabel>
                    <FormControl>
                      <Input placeholder="00.000.000-0" {...field} />
                    </FormControl>
                    <FormDescription>Brazilian general registry</FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <Separator />

            {/* Demographics */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <FormField
                control={form.control}
                name="gender"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Gender *</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select gender" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="male">Male</SelectItem>
                        <SelectItem value="female">Female</SelectItem>
                        <SelectItem value="other">Other</SelectItem>
                        <SelectItem value="unknown">Prefer not to say</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="birth_date"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Birth Date *</FormLabel>
                    <FormControl>
                      <Input type="date" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="marital_status"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Marital Status</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select status" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="single">Single</SelectItem>
                        <SelectItem value="married">Married</SelectItem>
                        <SelectItem value="divorced">Divorced</SelectItem>
                        <SelectItem value="widowed">Widowed</SelectItem>
                        <SelectItem value="separated">Separated</SelectItem>
                        <SelectItem value="domestic_partner">Domestic Partner</SelectItem>
                        <SelectItem value="unknown">Unknown</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
          </CardContent>
        </Card>{" "}
        {/* Contact Information */}
        <Card>
          <CardHeader>
            <CardTitle>Contact Information</CardTitle>
            <CardDescription>
              Phone numbers and email addresses for patient communication.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="phone_primary"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Primary Phone *</FormLabel>
                    <FormControl>
                      <Input placeholder="+55 (11) 99999-9999" {...field} />
                    </FormControl>
                    <FormDescription>Main contact number with area code</FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="phone_secondary"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Secondary Phone</FormLabel>
                    <FormControl>
                      <Input placeholder="+55 (11) 3333-4444" {...field} />
                    </FormControl>
                    <FormDescription>Alternative contact number</FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Email Address</FormLabel>
                  <FormControl>
                    <Input type="email" placeholder="patient@example.com" {...field} />
                  </FormControl>
                  <FormDescription>
                    Primary email for appointment confirmations and communications
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
          </CardContent>
        </Card>
        {/* Address Information */}
        <Card>
          <CardHeader>
            <CardTitle>Address Information</CardTitle>
            <CardDescription>
              Patient's residential address for contact and billing purposes.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <FormField
              control={form.control}
              name="address_line1"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Address Line 1 *</FormLabel>
                  <FormControl>
                    <Input placeholder="Rua das Flores, 123" {...field} />
                  </FormControl>
                  <FormDescription>
                    Street address, apartment, suite, unit, building, floor, etc.
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="address_line2"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Address Line 2</FormLabel>
                  <FormControl>
                    <Input placeholder="Apartment 45, Building B" {...field} />
                  </FormControl>
                  <FormDescription>Additional address information (optional)</FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <FormField
                control={form.control}
                name="city"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>City *</FormLabel>
                    <FormControl>
                      <Input placeholder="São Paulo" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="state"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>State *</FormLabel>
                    <FormControl>
                      <Input placeholder="SP" maxLength={2} {...field} />
                    </FormControl>
                    <FormDescription>Two-letter state code</FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="postal_code"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>CEP *</FormLabel>
                    <FormControl>
                      <Input placeholder="01234-567" {...field} />
                    </FormControl>
                    <FormDescription>Brazilian postal code</FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
          </CardContent>
        </Card>
        {/* Emergency Contact */}
        <Card>
          <CardHeader>
            <CardTitle>Emergency Contact</CardTitle>
            <CardDescription>
              Primary emergency contact person for medical situations.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="emergency_contact_name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Contact Name *</FormLabel>
                    <FormControl>
                      <Input placeholder="Maria Silva" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="emergency_contact_relationship"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Relationship *</FormLabel>
                    <FormControl>
                      <Input placeholder="Mother, Father, Spouse, etc." {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="emergency_contact_phone"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Contact Phone *</FormLabel>
                    <FormControl>
                      <Input placeholder="+55 (11) 99999-9999" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="emergency_contact_email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Contact Email</FormLabel>
                    <FormControl>
                      <Input type="email" placeholder="contact@example.com" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
          </CardContent>
        </Card>
        {/* Insurance Information */}
        <Card>
          <CardHeader>
            <CardTitle>Insurance Information</CardTitle>
            <CardDescription>
              Health insurance details for billing and coverage verification.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="insurance_provider"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Insurance Provider</FormLabel>
                    <FormControl>
                      <Input placeholder="Unimed, Bradesco Saúde, etc." {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="insurance_plan"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Plan Name</FormLabel>
                    <FormControl>
                      <Input placeholder="Plan name or type" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="insurance_policy_number"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Policy Number</FormLabel>
                    <FormControl>
                      <Input placeholder="Insurance policy number" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="insurance_group_number"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Group Number</FormLabel>
                    <FormControl>
                      <Input placeholder="Group or employer code" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
          </CardContent>
        </Card>
        {/* Medical History */}
        <Card>
          <CardHeader>
            <CardTitle>Basic Medical History</CardTitle>
            <CardDescription>
              Initial medical information for safety and treatment planning.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <FormField
              control={form.control}
              name="known_allergies"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Known Allergies</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="List any known allergies to medications, foods, or materials..."
                      rows={3}
                      {...field}
                    />
                  </FormControl>
                  <FormDescription>
                    Include allergies to medications, foods, latex, or other substances
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="current_medications"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Current Medications</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="List current medications, dosages, and frequency..."
                      rows={3}
                      {...field}
                    />
                  </FormControl>
                  <FormDescription>
                    Include prescription medications, over-the-counter drugs, and supplements
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="medical_conditions"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Medical Conditions</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="List any chronic conditions, previous surgeries, or significant medical history..."
                      rows={3}
                      {...field}
                    />
                  </FormControl>
                  <FormDescription>
                    Include chronic conditions, previous surgeries, and significant medical events
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
          </CardContent>
        </Card>{" "}
        {/* LGPD Consent Management */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Shield className="h-5 w-5" />
              LGPD Consent Management
            </CardTitle>
            <CardDescription>
              Data processing consent in compliance with Brazilian General Data Protection Law
              (LGPD).
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <Alert>
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>
                <strong>LGPD Compliance:</strong> As required by Brazilian law, we need your
                explicit consent for processing your health data. You can withdraw consent at any
                time by contacting our clinic.
              </AlertDescription>
            </Alert>

            {/* Required Consent */}
            <div className="space-y-4 p-4 border border-blue-200 rounded-lg bg-blue-50">
              <h4 className="font-semibold text-blue-900">Required Consent</h4>
              <FormField
                control={form.control}
                name="lgpd_consent_general"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                    <FormControl>
                      <Checkbox checked={field.value} onCheckedChange={field.onChange} />
                    </FormControl>
                    <div className="space-y-1 leading-none">
                      <FormLabel className="text-sm font-medium">
                        Healthcare Service Provision *
                      </FormLabel>
                      <FormDescription className="text-xs">
                        I consent to the processing of my personal health data for healthcare
                        service provision, medical record management, appointment scheduling, and
                        emergency contact purposes.
                        <strong>Legal basis:</strong> LGPD Article 11, Item I.
                        <strong>Retention:</strong> 20 years minimum for medical records.
                      </FormDescription>
                    </div>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            {/* Optional Consents */}
            <div className="space-y-4">
              <h4 className="font-semibold">Optional Consents</h4>

              <FormField
                control={form.control}
                name="lgpd_consent_marketing"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                    <FormControl>
                      <Checkbox checked={field.value} onCheckedChange={field.onChange} />
                    </FormControl>
                    <div className="space-y-1 leading-none">
                      <FormLabel className="text-sm font-medium">
                        Marketing Communications
                      </FormLabel>
                      <FormDescription className="text-xs">
                        I consent to receive marketing communications, promotional materials, and
                        service updates.
                        <strong>Legal basis:</strong> LGPD Article 7, Item I.
                        <strong>Retention:</strong> 5 years or until consent withdrawal.
                      </FormDescription>
                    </div>
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="lgpd_consent_research"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                    <FormControl>
                      <Checkbox checked={field.value} onCheckedChange={field.onChange} />
                    </FormControl>
                    <div className="space-y-1 leading-none">
                      <FormLabel className="text-sm font-medium">
                        Medical Research (Anonymized)
                      </FormLabel>
                      <FormDescription className="text-xs">
                        I consent to the use of my anonymized health data for medical research and
                        clinical studies to improve healthcare services.
                        <strong>Legal basis:</strong> LGPD Article 7, Item I.
                        <strong>Retention:</strong> 10 years.
                      </FormDescription>
                    </div>
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="lgpd_consent_third_party"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                    <FormControl>
                      <Checkbox checked={field.value} onCheckedChange={field.onChange} />
                    </FormControl>
                    <div className="space-y-1 leading-none">
                      <FormLabel className="text-sm font-medium">Third-Party Sharing</FormLabel>
                      <FormDescription className="text-xs">
                        I consent to sharing my data with healthcare partners, insurance providers,
                        and authorized third parties for care coordination.
                        <strong>Legal basis:</strong> LGPD Article 7, Item I.
                        <strong>Retention:</strong> 5 years.
                      </FormDescription>
                    </div>
                  </FormItem>
                )}
              />
            </div>

            <Alert>
              <AlertCircle className="h-4 w-4" />
              <AlertDescription className="text-xs">
                <strong>Your Rights:</strong> You have the right to access, correct, delete, or
                request portability of your data. You can also withdraw consent at any time by
                contacting our Data Protection Officer. For more information, please review our
                Privacy Policy.
              </AlertDescription>
            </Alert>
          </CardContent>
        </Card>
        {/* Language Preference */}
        <Card>
          <CardHeader>
            <CardTitle>Communication Preferences</CardTitle>
            <CardDescription>
              Language and communication preferences for patient care.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <FormField
              control={form.control}
              name="preferred_language"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Preferred Language</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select preferred language" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="pt-BR">Portuguese (Brazil)</SelectItem>
                      <SelectItem value="en-US">English (US)</SelectItem>
                      <SelectItem value="es-ES">Spanish</SelectItem>
                      <SelectItem value="fr-FR">French</SelectItem>
                      <SelectItem value="it-IT">Italian</SelectItem>
                      <SelectItem value="de-DE">German</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormDescription>
                    Language for appointments, communications, and documentation
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
          </CardContent>
        </Card>
        {/* Form Actions */}
        <div className="flex flex-col sm:flex-row gap-4 pt-6">
          <Button type="submit" disabled={isSubmitting} className="flex-1">
            {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            {isSubmitting ? "Registering Patient..." : "Register Patient"}
          </Button>

          {onCancel && (
            <Button
              type="button"
              variant="outline"
              onClick={onCancel}
              disabled={isSubmitting}
              className="flex-1 sm:flex-none"
            >
              Cancel
            </Button>
          )}
        </div>
        {/* Form Validation Summary */}
        {Object.keys(form.formState.errors).length > 0 && (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              Please fix the following errors before submitting:
              <ul className="mt-2 list-disc list-inside space-y-1">
                {Object.entries(form.formState.errors).map(([field, error]) => (
                  <li key={field} className="text-xs">
                    <strong>{field.replace(/_/g, " ")}:</strong> {error?.message}
                  </li>
                ))}
              </ul>
            </AlertDescription>
          </Alert>
        )}
      </form>
    </Form>
  );
}
