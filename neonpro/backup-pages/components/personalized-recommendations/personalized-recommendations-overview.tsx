'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Brain, 
  Shield, 
  TrendingUp, 
  Users, 
  CheckCircle, 
  AlertTriangle,
  Star,
  Clock,
  Target,
  Zap,
  Heart,
  Activity
} from 'lucide-react';

interface TreatmentRecommendation {
  id: string;
  patientId: string;
  treatmentOptions: {
    primary: string;
    alternatives: string[];
    combination?: string[];
  };
  rankingScores: {
    successProbability: number;
    riskScore: number;
    personalizedScore: number;
  };
  rationale: string;
  safetyAlerts: string[];
  status: 'pending' | 'approved' | 'rejected';
  createdAt: string;
}

interface PersonalizationProfile {
  id: string;
  patientId: string;
  profileData: {
    medicalHistory: string[];
    currentConditions: string[];
    lifestyle: string[];
  };
  preferenceWeights: {
    treatmentType: number;
    invasiveness: number;
    timeline: number;
  };
  lastUpdated: string;
}

export function PersonalizedRecommendationsOverview() {
  const [recommendations, setRecommendations] = useState<TreatmentRecommendation[]>([]);
  const [profiles, setProfiles] = useState<PersonalizationProfile[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [stats, setStats] = useState({
    totalRecommendations: 0,
    approvalRate: 0,
    averageSuccessRate: 0,
    activeTreatments: 0
  });

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Fetch recommendations
        const recResponse = await fetch('/api/personalized-recommendations/recommendations');
        if (recResponse.ok) {
          const recData = await recResponse.json();
          setRecommendations(recData.recommendations || []);
        }

        // Fetch profiles
        const profileResponse = await fetch('/api/personalized-recommendations/profiles');
        if (profileResponse.ok) {
          const profileData = await profileResponse.json();
          setProfiles(profileData.profiles || []);
        }

        // Calculate stats
        setStats({
          totalRecommendations: recommendations.length,
          approvalRate: recommendations.length > 0 
            ? (recommendations.filter(r => r.status === 'approved').length / recommendations.length) * 100
            : 0,
          averageSuccessRate: recommendations.length > 0
            ? recommendations.reduce((acc, r) => acc + r.rankingScores.successProbability, 0) / recommendations.length
            : 0,
          activeTreatments: recommendations.filter(r => r.status === 'approved').length
        });
      } catch (error) {
        console.error('Error fetching personalized recommendations data:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, []);

  if (isLoading) {
    return (
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {[1, 2, 3, 4].map((i) => (
          <Card key={i}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <div className="h-4 bg-gray-200 rounded w-1/2 animate-pulse" />
              <div className="h-4 w-4 bg-gray-200 rounded animate-pulse" />
            </CardHeader>
            <CardContent>
              <div className="h-8 bg-gray-200 rounded w-3/4 animate-pulse" />
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Stats Overview */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Recommendations</CardTitle>
            <Brain className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalRecommendations}</div>
            <p className="text-xs text-muted-foreground">
              Active personalized treatment plans
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Approval Rate</CardTitle>
            <CheckCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.approvalRate.toFixed(1)}%</div>
            <p className="text-xs text-muted-foreground">
              Medical professional acceptance
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Success Rate</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.averageSuccessRate.toFixed(1)}%</div>
            <p className="text-xs text-muted-foreground">
              Average predicted success
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Treatments</CardTitle>
            <Activity className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.activeTreatments}</div>
            <p className="text-xs text-muted-foreground">
              Currently approved plans
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Recent Recommendations */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Star className="h-5 w-5" />
            Recent Personalized Recommendations
          </CardTitle>
          <CardDescription>
            AI-generated treatment recommendations based on individual patient profiles
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {recommendations.slice(0, 5).map((recommendation) => (
              <div key={recommendation.id} className="flex items-center justify-between p-4 border rounded-lg">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <Badge variant={
                      recommendation.status === 'approved' ? 'default' :
                      recommendation.status === 'pending' ? 'secondary' : 'destructive'
                    }>
                      {recommendation.status}
                    </Badge>
                    <span className="text-sm text-muted-foreground">
                      Patient: {recommendation.patientId.slice(0, 8)}...
                    </span>
                  </div>
                  <div className="space-y-2">
                    <div>
                      <span className="font-medium">Primary Treatment: </span>
                      {recommendation.treatmentOptions.primary}
                    </div>
                    <div className="flex gap-4">
                      <div className="flex items-center gap-1">
                        <Target className="h-4 w-4 text-green-600" />
                        <span className="text-sm">Success: {recommendation.rankingScores.successProbability}%</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Shield className="h-4 w-4 text-blue-600" />
                        <span className="text-sm">Risk: {recommendation.rankingScores.riskScore}%</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Heart className="h-4 w-4 text-purple-600" />
                        <span className="text-sm">Match: {recommendation.rankingScores.personalizedScore}%</span>
                      </div>
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  {recommendation.safetyAlerts.length > 0 && (
                    <AlertTriangle className="h-4 w-4 text-amber-500" />
                  )}
                  <Clock className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm text-muted-foreground">
                    {new Date(recommendation.createdAt).toLocaleDateString()}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}