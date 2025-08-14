'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  User, 
  Brain, 
  Shield, 
  CheckCircle, 
  AlertTriangle,
  Plus,
  Edit,
  Save,
  X,
  Target,
  Heart,
  Activity,
  Settings,
  FileText
} from 'lucide-react';

interface PersonalizationProfile {
  id: string;
  patientId: string;
  profileData: {
    medicalHistory: string[];
    currentConditions: string[];
    lifestyle: string[];
    demographics: {
      age: number;
      gender: string;
      occupation: string;
    };
  };
  preferenceWeights: {
    treatmentType: number;
    invasiveness: number;
    timeline: number;
    cost: number;
  };
  lifestyleFactors: {
    diet: string;
    exercise: string;
    stress: string;
    sleep: string;
  };
  medicalPreferences: {
    treatmentApproach: string;
    communicationStyle: string;
    involvementLevel: string;
  };
  lastUpdated: string;
}

export function PersonalizationProfilesManagement() {
  const [profiles, setProfiles] = useState<PersonalizationProfile[]>([]);
  const [selectedProfile, setSelectedProfile] = useState<PersonalizationProfile | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    const fetchProfiles = async () => {
      try {
        const response = await fetch('/api/personalized-recommendations/profiles');
        if (response.ok) {
          const data = await response.json();
          setProfiles(data.profiles || []);
        }
      } catch (error) {
        console.error('Error fetching profiles:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchProfiles();
  }, []);

  const handleSaveProfile = async (profile: PersonalizationProfile) => {
    try {
      const response = await fetch('/api/personalized-recommendations/profiles', {
        method: profile.id ? 'PUT' : 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(profile),
      });

      if (response.ok) {
        const data = await response.json();
        if (profile.id) {
          setProfiles(profiles.map(p => p.id === profile.id ? data.profile : p));
        } else {
          setProfiles([...profiles, data.profile]);
        }
        setIsEditing(false);
        setSelectedProfile(null);
      }
    } catch (error) {
      console.error('Error saving profile:', error);
    }
  };

  const filteredProfiles = profiles.filter(profile =>
    profile.patientId.toLowerCase().includes(searchTerm.toLowerCase()) ||
    profile.profileData.demographics.occupation.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (isLoading) {
    return (
      <div className="space-y-4">
        <div className="h-8 bg-gray-200 rounded w-1/4 animate-pulse" />
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <Card key={i}>
              <CardHeader>
                <div className="h-4 bg-gray-200 rounded w-3/4 animate-pulse" />
                <div className="h-3 bg-gray-200 rounded w-1/2 animate-pulse" />
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <div className="h-3 bg-gray-200 rounded animate-pulse" />
                  <div className="h-3 bg-gray-200 rounded w-5/6 animate-pulse" />
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header and Search */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold flex items-center gap-2">
            <User className="h-6 w-6" />
            Personalization Profiles
          </h2>
          <p className="text-muted-foreground">
            Manage patient personalization profiles for AI-powered treatment recommendations
          </p>
        </div>
        <Button onClick={() => setIsEditing(true)} className="flex items-center gap-2">
          <Plus className="h-4 w-4" />
          New Profile
        </Button>
      </div>

      <div className="flex gap-4">
        <Input
          placeholder="Search profiles by patient ID or occupation..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="max-w-md"
        />
      </div>

      {/* Profiles Grid */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {filteredProfiles.map((profile) => (
          <Card key={profile.id} className="hover:shadow-lg transition-shadow cursor-pointer"
                onClick={() => setSelectedProfile(profile)}>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <span className="text-sm">Patient: {profile.patientId.slice(0, 8)}...</span>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={(e) => {
                    e.stopPropagation();
                    setSelectedProfile(profile);
                    setIsEditing(true);
                  }}
                >
                  <Edit className="h-4 w-4" />
                </Button>
              </CardTitle>
              <CardDescription>
                {profile.profileData.demographics.age}y, {profile.profileData.demographics.gender}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div>
                  <Label className="text-xs font-medium">Medical Conditions</Label>
                  <div className="flex flex-wrap gap-1 mt-1">
                    {profile.profileData.currentConditions.slice(0, 3).map((condition, idx) => (
                      <Badge key={idx} variant="secondary" className="text-xs">
                        {condition}
                      </Badge>
                    ))}
                    {profile.profileData.currentConditions.length > 3 && (
                      <Badge variant="outline" className="text-xs">
                        +{profile.profileData.currentConditions.length - 3}
                      </Badge>
                    )}
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-2 text-xs">
                  <div>
                    <Label className="text-xs">Treatment Preference</Label>
                    <Progress 
                      value={profile.preferenceWeights.treatmentType} 
                      className="h-1 mt-1"
                    />
                  </div>
                  <div>
                    <Label className="text-xs">Invasiveness Tolerance</Label>
                    <Progress 
                      value={profile.preferenceWeights.invasiveness} 
                      className="h-1 mt-1"
                    />
                  </div>
                </div>

                <div className="text-xs text-muted-foreground">
                  Updated: {new Date(profile.lastUpdated).toLocaleDateString()}
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Profile Details/Edit Modal */}
      {(selectedProfile || isEditing) && (
        <Card className="fixed inset-4 z-50 bg-background border shadow-lg overflow-auto">
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <Settings className="h-5 w-5" />
              {isEditing ? 'Edit Profile' : 'Profile Details'}
            </CardTitle>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => {
                setSelectedProfile(null);
                setIsEditing(false);
              }}
            >
              <X className="h-4 w-4" />
            </Button>
          </CardHeader>
          <CardContent>
            <Tabs defaultValue="demographics" className="w-full">
              <TabsList className="grid w-full grid-cols-4">
                <TabsTrigger value="demographics">Demographics</TabsTrigger>
                <TabsTrigger value="medical">Medical</TabsTrigger>
                <TabsTrigger value="preferences">Preferences</TabsTrigger>
                <TabsTrigger value="lifestyle">Lifestyle</TabsTrigger>
              </TabsList>

              <TabsContent value="demographics" className="space-y-4 mt-6">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="age">Age</Label>
                    <Input
                      id="age"
                      type="number"
                      value={selectedProfile?.profileData.demographics.age || ''}
                      disabled={!isEditing}
                    />
                  </div>
                  <div>
                    <Label htmlFor="gender">Gender</Label>
                    <Select value={selectedProfile?.profileData.demographics.gender || ''} disabled={!isEditing}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select gender" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="male">Male</SelectItem>
                        <SelectItem value="female">Female</SelectItem>
                        <SelectItem value="other">Other</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <div>
                  <Label htmlFor="occupation">Occupation</Label>
                  <Input
                    id="occupation"
                    value={selectedProfile?.profileData.demographics.occupation || ''}
                    disabled={!isEditing}
                  />
                </div>
              </TabsContent>

              <TabsContent value="medical" className="space-y-4 mt-6">
                <div>
                  <Label htmlFor="conditions">Current Conditions</Label>
                  <Textarea
                    id="conditions"
                    value={selectedProfile?.profileData.currentConditions.join(', ') || ''}
                    disabled={!isEditing}
                    placeholder="Enter current medical conditions separated by commas"
                  />
                </div>
                <div>
                  <Label htmlFor="history">Medical History</Label>
                  <Textarea
                    id="history"
                    value={selectedProfile?.profileData.medicalHistory.join(', ') || ''}
                    disabled={!isEditing}
                    placeholder="Enter medical history separated by commas"
                  />
                </div>
              </TabsContent>

              <TabsContent value="preferences" className="space-y-4 mt-6">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label>Treatment Type Preference ({selectedProfile?.preferenceWeights.treatmentType || 0}%)</Label>
                    <Progress 
                      value={selectedProfile?.preferenceWeights.treatmentType || 0}
                      className="mt-2"
                    />
                  </div>
                  <div>
                    <Label>Invasiveness Tolerance ({selectedProfile?.preferenceWeights.invasiveness || 0}%)</Label>
                    <Progress 
                      value={selectedProfile?.preferenceWeights.invasiveness || 0}
                      className="mt-2"
                    />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label>Timeline Flexibility ({selectedProfile?.preferenceWeights.timeline || 0}%)</Label>
                    <Progress 
                      value={selectedProfile?.preferenceWeights.timeline || 0}
                      className="mt-2"
                    />
                  </div>
                  <div>
                    <Label>Cost Sensitivity ({selectedProfile?.preferenceWeights.cost || 0}%)</Label>
                    <Progress 
                      value={selectedProfile?.preferenceWeights.cost || 0}
                      className="mt-2"
                    />
                  </div>
                </div>
              </TabsContent>

              <TabsContent value="lifestyle" className="space-y-4 mt-6">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="diet">Diet</Label>
                    <Input
                      id="diet"
                      value={selectedProfile?.lifestyleFactors.diet || ''}
                      disabled={!isEditing}
                      placeholder="e.g., Mediterranean, Vegetarian"
                    />
                  </div>
                  <div>
                    <Label htmlFor="exercise">Exercise</Label>
                    <Input
                      id="exercise"
                      value={selectedProfile?.lifestyleFactors.exercise || ''}
                      disabled={!isEditing}
                      placeholder="e.g., Active, Sedentary"
                    />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="stress">Stress Level</Label>
                    <Input
                      id="stress"
                      value={selectedProfile?.lifestyleFactors.stress || ''}
                      disabled={!isEditing}
                      placeholder="e.g., High, Moderate, Low"
                    />
                  </div>
                  <div>
                    <Label htmlFor="sleep">Sleep Quality</Label>
                    <Input
                      id="sleep"
                      value={selectedProfile?.lifestyleFactors.sleep || ''}
                      disabled={!isEditing}
                      placeholder="e.g., Good, Poor, Variable"
                    />
                  </div>
                </div>
              </TabsContent>
            </Tabs>

            {isEditing && (
              <div className="flex justify-end gap-2 mt-6 pt-4 border-t">
                <Button variant="outline" onClick={() => setIsEditing(false)}>
                  Cancel
                </Button>
                <Button onClick={() => selectedProfile && handleSaveProfile(selectedProfile)}>
                  <Save className="h-4 w-4 mr-2" />
                  Save Profile
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
}