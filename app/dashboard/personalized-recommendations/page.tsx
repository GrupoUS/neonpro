'use client';

import React from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { PersonalizedRecommendationsOverview } from '@/components/personalized-recommendations/personalized-recommendations-overview';
import { PersonalizationProfilesManagement } from '@/components/personalized-recommendations/personalization-profiles-management';
import { 
  Brain, 
  User, 
  Shield, 
  BarChart3, 
  Settings,
  Target,
  Activity,
  FileText
} from 'lucide-react';

export default function PersonalizedRecommendationsPage() {
  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-3">
            <Brain className="h-8 w-8 text-primary" />
            Personalized Treatment Recommendations
          </h1>
          <p className="text-muted-foreground text-lg mt-2">
            AI-powered personalized treatment recommendations with ≥75% user acceptance
          </p>
        </div>
      </div>

      {/* Feature Description */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Target className="h-5 w-5" />
            Personalization Engine Overview
          </CardTitle>
          <CardDescription>
            Advanced AI system that analyzes individual patient characteristics to provide customized treatment recommendations
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid md:grid-cols-3 gap-4">
            <div className="flex items-start gap-3">
              <div className="bg-blue-100 p-2 rounded-lg">
                <User className="h-5 w-5 text-blue-600" />
              </div>
              <div>
                <h4 className="font-medium">Patient Profiling</h4>
                <p className="text-sm text-muted-foreground">
                  Multi-dimensional analysis including medical history, preferences, and lifestyle factors
                </p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <div className="bg-green-100 p-2 rounded-lg">
                <Shield className="h-5 w-5 text-green-600" />
              </div>
              <div>
                <h4 className="font-medium">Safety & Customization</h4>
                <p className="text-sm text-muted-foreground">
                  Contraindication checking and patient-specific safety considerations
                </p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <div className="bg-purple-100 p-2 rounded-lg">
                <BarChart3 className="h-5 w-5 text-purple-600" />
              </div>
              <div>
                <h4 className="font-medium">Success Prediction</h4>
                <p className="text-sm text-muted-foreground">
                  Treatment ranking with success probability and risk assessment
                </p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Main Tabs */}
      <Tabs defaultValue="overview" className="space-y-6">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="overview" className="flex items-center gap-2">
            <Activity className="h-4 w-4" />
            Overview
          </TabsTrigger>
          <TabsTrigger value="profiles" className="flex items-center gap-2">
            <User className="h-4 w-4" />
            Profiles
          </TabsTrigger>
          <TabsTrigger value="recommendations" className="flex items-center gap-2">
            <Brain className="h-4 w-4" />
            Recommendations
          </TabsTrigger>
          <TabsTrigger value="safety" className="flex items-center gap-2">
            <Shield className="h-4 w-4" />
            Safety
          </TabsTrigger>
          <TabsTrigger value="analytics" className="flex items-center gap-2">
            <BarChart3 className="h-4 w-4" />
            Analytics
          </TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          <PersonalizedRecommendationsOverview />
        </TabsContent>

        <TabsContent value="profiles" className="space-y-6">
          <PersonalizationProfilesManagement />
        </TabsContent>

        <TabsContent value="recommendations" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Brain className="h-5 w-5" />
                Treatment Recommendations Management
              </CardTitle>
              <CardDescription>
                Manage and review AI-generated personalized treatment recommendations
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-center py-12">
                <FileText className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-medium mb-2">Recommendations Management</h3>
                <p className="text-muted-foreground">
                  Detailed recommendation management interface coming soon
                </p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="safety" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Shield className="h-5 w-5" />
                Safety & Contraindications
              </CardTitle>
              <CardDescription>
                Safety checking system and contraindication management
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-center py-12">
                <Shield className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-medium mb-2">Safety Management</h3>
                <p className="text-muted-foreground">
                  Safety checking and contraindication management interface coming soon
                </p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="analytics" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BarChart3 className="h-5 w-5" />
                Recommendation Analytics
              </CardTitle>
              <CardDescription>
                Performance analytics and adoption tracking for personalized recommendations
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-center py-12">
                <BarChart3 className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-medium mb-2">Analytics Dashboard</h3>
                <p className="text-muted-foreground">
                  Recommendation performance analytics and adoption tracking coming soon
                </p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}