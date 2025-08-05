"use client";

import type {
  Activity,
  AlertTriangle,
  Calendar,
  FileText,
  Heart,
  Mail,
  MapPin,
  Minus,
  Phone,
  TrendingDown,
  TrendingUp,
  Users,
} from "lucide-react";
import React, { useEffect, useState } from "react";
import type { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import type { Badge } from "@/components/ui/badge";
import type { Button } from "@/components/ui/button";
import type {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import type { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

interface PatientProfile {
  patient_id: string;
  demographics: {
    name: string;
    date_of_birth: string;
    gender: string;
    phone: string;
    email: string;
    address: string;
    insurance_provider?: string;
    insurance_id?: string;
  };
  medical_history: string[];
  chronic_conditions: string[];
  current_medications: { name: string; dosage: string; frequency: string }[];
  allergies: string[];
  bmi?: number;
  blood_type?: string;
  profile_completeness_score: number;
  risk_score?: number;
  risk_level?: "low" | "medium" | "high" | "critical";
  ai_insights?: any;
  last_assessment_date?: string;
  emergency_contacts?: Array<{
    name: string;
    relationship: string;
    phone: string;
    email?: string;
  }>;
  care_preferences?: {
    communication_method: string;
    language: string;
    accessibility_needs?: string[];
  };
}

interface PatientProfileViewProps {
  patientId: string;
  onProfileUpdate?: (profile: PatientProfile) => void;
}

export default function PatientProfileView({
  patientId,
  onProfileUpdate,
}: PatientProfileViewProps) {
  const [profile, setProfile] = useState<PatientProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchPatientProfile();
  }, [patientId]);

  const fetchPatientProfile = async () => {
    try {
      setLoading(true);
      const response = await fetch(`/api/patients/${patientId}`);

      if (!response.ok) {
        throw new Error("Failed to fetch patient profile");
      }

      const data = await response.json();
      setProfile(data.profile);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred");
    } finally {
      setLoading(false);
    }
  };

  const getRiskBadgeColor = (riskLevel?: string) => {
    switch (riskLevel) {
      case "low":
        return "bg-green-100 text-green-800";
      case "medium":
        return "bg-yellow-100 text-yellow-800";
      case "high":
        return "bg-orange-100 text-orange-800";
      case "critical":
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const calculateAge = (dateOfBirth: string) => {
    const today = new Date();
    const birthDate = new Date(dateOfBirth);
    let age = today.getFullYear() - birthDate.getFullYear();
    const monthDiff = today.getMonth() - birthDate.getMonth();

    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
      age--;
    }

    return age;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (error) {
    return (
      <Card className="p-6">
        <div className="text-center text-red-600">
          <AlertTriangle className="h-8 w-8 mx-auto mb-2" />
          <p>{error}</p>
          <Button onClick={fetchPatientProfile} className="mt-4">
            Try Again
          </Button>
        </div>
      </Card>
    );
  }

  if (!profile) {
    return (
      <Card className="p-6">
        <div className="text-center text-gray-500">
          <FileText className="h-8 w-8 mx-auto mb-2" />
          <p>Patient profile not found</p>
        </div>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header Section */}
      <Card>
        <CardHeader>
          <div className="flex items-start justify-between">
            <div className="flex items-center space-x-4">
              <Avatar className="h-16 w-16">
                <AvatarImage src="" alt={profile.demographics.name} />
                <AvatarFallback className="text-lg">
                  {profile.demographics.name
                    .split(" ")
                    .map((n) => n[0])
                    .join("")
                    .toUpperCase()}
                </AvatarFallback>
              </Avatar>
              <div>
                <CardTitle className="text-2xl">{profile.demographics.name}</CardTitle>
                <CardDescription className="text-lg">
                  {calculateAge(profile.demographics.date_of_birth)} years old •{" "}
                  {profile.demographics.gender}
                </CardDescription>
                <div className="flex items-center space-x-4 mt-2 text-sm text-gray-600">
                  <div className="flex items-center space-x-1">
                    <Phone className="h-4 w-4" />
                    <span>{profile.demographics.phone}</span>
                  </div>
                  <div className="flex items-center space-x-1">
                    <Mail className="h-4 w-4" />
                    <span>{profile.demographics.email}</span>
                  </div>
                </div>
              </div>
            </div>
            <div className="text-right space-y-2">
              {profile.risk_level && (
                <Badge className={getRiskBadgeColor(profile.risk_level)}>
                  {profile.risk_level.toUpperCase()} RISK
                </Badge>
              )}
              <div className="text-sm text-gray-500">
                Profile: {Math.round(profile.profile_completeness_score * 100)}% complete
              </div>
            </div>
          </div>
        </CardHeader>
      </Card>

      {/* Main Content Tabs */}
      <Tabs defaultValue="overview" className="space-y-4">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="medical">Medical History</TabsTrigger>
          <TabsTrigger value="medications">Medications</TabsTrigger>
          <TabsTrigger value="contacts">Contacts</TabsTrigger>
          <TabsTrigger value="insights">AI Insights</TabsTrigger>
        </TabsList>

        {/* Overview Tab */}
        <TabsContent value="overview" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {/* Vital Stats */}
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Vital Statistics</CardTitle>
                <Activity className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="space-y-2 text-sm">
                  {profile.bmi && (
                    <div className="flex justify-between">
                      <span>BMI:</span>
                      <span className="font-medium">{profile.bmi}</span>
                    </div>
                  )}
                  {profile.blood_type && (
                    <div className="flex justify-between">
                      <span>Blood Type:</span>
                      <span className="font-medium">{profile.blood_type}</span>
                    </div>
                  )}
                  <div className="flex justify-between">
                    <span>Risk Score:</span>
                    <span className="font-medium">
                      {profile.risk_score ? `${Math.round(profile.risk_score * 100)}%` : "N/A"}
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Chronic Conditions */}
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Chronic Conditions</CardTitle>
                <Heart className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {profile.chronic_conditions.length > 0 ? (
                    profile.chronic_conditions.map((condition, index) => (
                      <Badge key={index} variant="outline" className="text-xs">
                        {condition}
                      </Badge>
                    ))
                  ) : (
                    <p className="text-sm text-gray-500">No chronic conditions recorded</p>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Allergies */}
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Allergies</CardTitle>
                <AlertTriangle className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {profile.allergies.length > 0 ? (
                    profile.allergies.map((allergy, index) => (
                      <Badge key={index} variant="destructive" className="text-xs">
                        {allergy}
                      </Badge>
                    ))
                  ) : (
                    <p className="text-sm text-gray-500">No known allergies</p>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Medical History Tab */}
        <TabsContent value="medical" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Medical History</CardTitle>
              <CardDescription>Past medical events and conditions</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {profile.medical_history.length > 0 ? (
                  profile.medical_history.map((event, index) => (
                    <div key={index} className="p-3 border rounded-lg">
                      <p className="text-sm">{event}</p>
                    </div>
                  ))
                ) : (
                  <p className="text-gray-500">No medical history recorded</p>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Medications Tab */}
        <TabsContent value="medications" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Current Medications</CardTitle>
              <CardDescription>Active prescriptions and supplements</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {profile.current_medications.length > 0 ? (
                  profile.current_medications.map((medication, index) => (
                    <div
                      key={index}
                      className="flex justify-between items-center p-3 border rounded-lg"
                    >
                      <div>
                        <p className="font-medium">{medication.name}</p>
                        <p className="text-sm text-gray-600">
                          {medication.dosage} • {medication.frequency}
                        </p>
                      </div>
                    </div>
                  ))
                ) : (
                  <p className="text-gray-500">No current medications</p>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Contacts Tab */}
        <TabsContent value="contacts" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Emergency Contacts</CardTitle>
              <CardDescription>People to contact in case of emergency</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {profile.emergency_contacts && profile.emergency_contacts.length > 0 ? (
                  profile.emergency_contacts.map((contact, index) => (
                    <div key={index} className="p-3 border rounded-lg">
                      <div className="flex justify-between items-start">
                        <div>
                          <p className="font-medium">{contact.name}</p>
                          <p className="text-sm text-gray-600">{contact.relationship}</p>
                        </div>
                        <div className="text-right text-sm">
                          <p>{contact.phone}</p>
                          {contact.email && <p>{contact.email}</p>}
                        </div>
                      </div>
                    </div>
                  ))
                ) : (
                  <p className="text-gray-500">No emergency contacts recorded</p>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* AI Insights Tab */}
        <TabsContent value="insights" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>AI-Powered Insights</CardTitle>
              <CardDescription>
                Intelligent analysis and recommendations based on patient data
              </CardDescription>
            </CardHeader>
            <CardContent>
              {profile.ai_insights ? (
                <div className="space-y-4">
                  <div className="text-center">
                    <Button
                      onClick={() => (window.location.href = `/patients/${patientId}/insights`)}
                    >
                      View Full AI Analysis
                    </Button>
                  </div>
                </div>
              ) : (
                <div className="text-center text-gray-500">
                  <TrendingUp className="h-8 w-8 mx-auto mb-2" />
                  <p>AI insights not yet generated</p>
                  <Button
                    className="mt-4"
                    onClick={() => {
                      // Generate insights
                      fetch(`/api/patients/${patientId}/insights`).then(() =>
                        fetchPatientProfile(),
                      );
                    }}
                  >
                    Generate AI Insights
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
