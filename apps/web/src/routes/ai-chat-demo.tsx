"use client";

/**
 * AI Chat Demo Page
 *
 * Comprehensive demonstration page for AI chat functionality in NeonPro.
 * Showcases multiple use cases and scenarios for the AI assistant.
 *
 * Features:
 * - Multiple demo scenarios (general, client data, appointments, financial)
 * - Interactive AI chat interface
 * - Healthcare compliance and LGPD features
 * - Mobile-responsive design
 * - Accessibility compliance (WCAG 2.1 AA+)
 */

import React, { useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { AIChatDemo } from "@/components/ai/ai-chat-demo";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Brain,
  MessageSquare,
  Stethoscope,
  Calendar,
  TrendingUp,
  Users,
  Shield,
  Smartphone,
  Accessibility,
  BookOpen,
  ArrowLeft,
} from "lucide-react";
import { Link } from "@tanstack/react-router";

export const Route = createFileRoute("/ai-chat-demo")({
  component: AIChatDemoPage,
});

function AIChatDemoPage() {
  const [activeTab, setActiveTab] = useState("demo");

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800">
      {/* Header */}
      <div className="bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-700 sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Link to="/">
                <Button variant="ghost" size="sm">
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  Back to Home
                </Button>
              </Link>
              <div className="flex items-center gap-3">
                <div className="p-2 bg-primary/10 rounded-lg">
                  <Brain className="h-6 w-6 text-primary" />
                </div>
                <div>
                  <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-100">
                    AI Chat Demo
                  </h1>
                  <p className="text-sm text-slate-600 dark:text-slate-400">
                    Explore the power of AI in NeonPro's aesthetic clinic
                    platform
                  </p>
                </div>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Badge variant="outline">
                <Shield className="h-3 w-3 mr-1" />
                LGPD Compliant
              </Badge>
              <Badge variant="outline">
                <Accessibility className="h-3 w-3 mr-1" />
                WCAG 2.1 AA+
              </Badge>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="container mx-auto px-4 py-8">
        {/* Quick Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          <Card className="border-l-4 border-l-blue-500">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-slate-600 dark:text-slate-400">
                    AI Models
                  </p>
                  <p className="text-2xl font-bold">4+</p>
                </div>
                <Brain className="h-8 w-8 text-blue-500" />
              </div>
            </CardContent>
          </Card>

          <Card className="border-l-4 border-l-green-500">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-slate-600 dark:text-slate-400">
                    Use Cases
                  </p>
                  <p className="text-2xl font-bold">6+</p>
                </div>
                <MessageSquare className="h-8 w-8 text-green-500" />
              </div>
            </CardContent>
          </Card>

          <Card className="border-l-4 border-l-purple-500">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-slate-600 dark:text-slate-400">
                    Healthcare
                  </p>
                  <p className="text-2xl font-bold">100%</p>
                </div>
                <Stethoscope className="h-8 w-8 text-purple-500" />
              </div>
            </CardContent>
          </Card>

          <Card className="border-l-4 border-l-orange-500">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-slate-600 dark:text-slate-400">
                    Mobile
                  </p>
                  <p className="text-2xl font-bold">95%</p>
                </div>
                <Smartphone className="h-8 w-8 text-orange-500" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Main Tabs */}
        <Tabs
          value={activeTab}
          onValueChange={setActiveTab}
          className="space-y-6"
        >
          <TabsList className="grid w-full grid-cols-4 max-w-2xl mx-auto">
            <TabsTrigger value="demo" className="flex items-center gap-2">
              <MessageSquare className="h-4 w-4" />
              Live Demo
            </TabsTrigger>
            <TabsTrigger value="scenarios" className="flex items-center gap-2">
              <Users className="h-4 w-4" />
              Scenarios
            </TabsTrigger>
            <TabsTrigger value="features" className="flex items-center gap-2">
              <BookOpen className="h-4 w-4" />
              Features
            </TabsTrigger>
            <TabsTrigger
              value="documentation"
              className="flex items-center gap-2"
            >
              <BookOpen className="h-4 w-4" />
              Docs
            </TabsTrigger>
          </TabsList>

          {/* Live Demo Tab */}
          <TabsContent value="demo" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Brain className="h-5 w-5" />
                  Interactive AI Chat Demo
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="mb-6">
                  <p className="text-slate-600 dark:text-slate-400 mb-4">
                    Experience the full power of NeonPro's AI assistant. Try
                    different scenarios and see how it can help with various
                    tasks in your aesthetic clinic.
                  </p>
                  <div className="flex flex-wrap gap-2">
                    <Badge variant="secondary">
                      <Stethoscope className="h-3 w-3 mr-1" />
                      Healthcare Context
                    </Badge>
                    <Badge variant="secondary">
                      <Users className="h-3 w-3 mr-1" />
                      Patient Data
                    </Badge>
                    <Badge variant="secondary">
                      <Calendar className="h-3 w-3 mr-1" />
                      Appointments
                    </Badge>
                    <Badge variant="secondary">
                      <TrendingUp className="h-3 w-3 mr-1" />
                      Analytics
                    </Badge>
                  </div>
                </div>
                <div className="bg-slate-50 dark:bg-slate-800 rounded-lg p-4">
                  <AIChatDemo showScenarios={true} testMode={false} />
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Scenarios Tab */}
          <TabsContent value="scenarios" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Card className="hover:shadow-lg transition-shadow">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <MessageSquare className="h-5 w-5 text-blue-500" />
                    General AI Assistant
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <p className="text-slate-600 dark:text-slate-400">
                    Your everyday AI assistant for general questions and tasks.
                  </p>
                  <div className="space-y-2">
                    <h4 className="font-medium">Try asking:</h4>
                    <ul className="text-sm space-y-1 text-slate-600 dark:text-slate-400">
                      <li>
                        • "What are the most popular aesthetic treatments?"
                      </li>
                      <li>• "How can I improve patient satisfaction?"</li>
                      <li>
                        • "What are the latest trends in cosmetic procedures?"
                      </li>
                    </ul>
                  </div>
                  <Button variant="outline" className="w-full">
                    Try General Assistant
                  </Button>
                </CardContent>
              </Card>

              <Card className="hover:shadow-lg transition-shadow">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Users className="h-5 w-5 text-green-500" />
                    Client Data Queries
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <p className="text-slate-600 dark:text-slate-400">
                    AI assistant with access to patient information and medical
                    history.
                  </p>
                  <div className="space-y-2">
                    <h4 className="font-medium">Try asking:</h4>
                    <ul className="text-sm space-y-1 text-slate-600 dark:text-slate-400">
                      <li>• "Show me Maria Silva's treatment history"</li>
                      <li>• "What allergies does João Santos have?"</li>
                      <li>• "When was Ana's last appointment?"</li>
                    </ul>
                  </div>
                  <Button variant="outline" className="w-full">
                    Try Client Queries
                  </Button>
                </CardContent>
              </Card>

              <Card className="hover:shadow-lg transition-shadow">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Calendar className="h-5 w-5 text-purple-500" />
                    Appointment Scheduling
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <p className="text-slate-600 dark:text-slate-400">
                    Smart scheduling assistant with availability and conflict
                    detection.
                  </p>
                  <div className="space-y-2">
                    <h4 className="font-medium">Try asking:</h4>
                    <ul className="text-sm space-y-1 text-slate-600 dark:text-slate-400">
                      <li>• "Schedule a consultation for next week"</li>
                      <li>• "Find available slots with Dr. Fernanda"</li>
                      <li>• "What's my schedule for tomorrow?"</li>
                    </ul>
                  </div>
                  <Button variant="outline" className="w-full">
                    Try Scheduling
                  </Button>
                </CardContent>
              </Card>

              <Card className="hover:shadow-lg transition-shadow">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <TrendingUp className="h-5 w-5 text-orange-500" />
                    Financial Summaries
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <p className="text-slate-600 dark:text-slate-400">
                    AI-powered financial analysis and reporting for your clinic.
                  </p>
                  <div className="space-y-2">
                    <h4 className="font-medium">Try asking:</h4>
                    <ul className="text-sm space-y-1 text-slate-600 dark:text-slate-400">
                      <li>• "Show me revenue for this month"</li>
                      <li>• "What are our most profitable treatments?"</li>
                      <li>• "How many no-shows did we have this week?"</li>
                    </ul>
                  </div>
                  <Button variant="outline" className="w-full">
                    Try Financial Analysis
                  </Button>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Features Tab */}
          <TabsContent value="features" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">AI Capabilities</CardTitle>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-2 text-sm">
                    <li className="flex items-center gap-2">
                      <div className="w-2 h-2 bg-green-500 rounded-full" />
                      Multi-model support (GPT-4, Claude, etc.)
                    </li>
                    <li className="flex items-center gap-2">
                      <div className="w-2 h-2 bg-green-500 rounded-full" />
                      Real-time streaming responses
                    </li>
                    <li className="flex items-center gap-2">
                      <div className="w-2 h-2 bg-green-500 rounded-full" />
                      Context-aware conversations
                    </li>
                    <li className="flex items-center gap-2">
                      <div className="w-2 h-2 bg-green-500 rounded-full" />
                      Voice input (Portuguese BR)
                    </li>
                    <li className="flex items-center gap-2">
                      <div className="w-2 h-2 bg-green-500 rounded-full" />
                      File attachment support
                    </li>
                  </ul>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Healthcare Features</CardTitle>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-2 text-sm">
                    <li className="flex items-center gap-2">
                      <div className="w-2 h-2 bg-blue-500 rounded-full" />
                      Patient context integration
                    </li>
                    <li className="flex items-center gap-2">
                      <div className="w-2 h-2 bg-blue-500 rounded-full" />
                      Medical knowledge base
                    </li>
                    <li className="flex items-center gap-2">
                      <div className="w-2 h-2 bg-blue-500 rounded-full" />
                      Treatment recommendations
                    </li>
                    <li className="flex items-center gap-2">
                      <div className="w-2 h-2 bg-blue-500 rounded-full" />
                      Appointment intelligence
                    </li>
                    <li className="flex items-center gap-2">
                      <div className="w-2 h-2 bg-blue-500 rounded-full" />
                      No-show predictions
                    </li>
                  </ul>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">
                    Compliance & Security
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-2 text-sm">
                    <li className="flex items-center gap-2">
                      <div className="w-2 h-2 bg-purple-500 rounded-full" />
                      LGPD compliant data handling
                    </li>
                    <li className="flex items-center gap-2">
                      <div className="w-2 h-2 bg-purple-500 rounded-full" />
                      Patient data anonymization
                    </li>
                    <li className="flex items-center gap-2">
                      <div className="w-2 h-2 bg-purple-500 rounded-full" />
                      Audit trail logging
                    </li>
                    <li className="flex items-center gap-2">
                      <div className="w-2 h-2 bg-purple-500 rounded-full" />
                      End-to-end encryption
                    </li>
                    <li className="flex items-center gap-2">
                      <div className="w-2 h-2 bg-purple-500 rounded-full" />
                      Role-based access control
                    </li>
                  </ul>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">User Experience</CardTitle>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-2 text-sm">
                    <li className="flex items-center gap-2">
                      <div className="w-2 h-2 bg-orange-500 rounded-full" />
                      Mobile-first design
                    </li>
                    <li className="flex items-center gap-2">
                      <div className="w-2 h-2 bg-orange-500 rounded-full" />
                      Touch-friendly interface
                    </li>
                    <li className="flex items-center gap-2">
                      <div className="w-2 h-2 bg-orange-500 rounded-full" />
                      Offline capability
                    </li>
                    <li className="flex items-center gap-2">
                      <div className="w-2 h-2 bg-orange-500 rounded-full" />
                      Fast loading (&lt;2s)
                    </li>
                    <li className="flex items-center gap-2">
                      <div className="w-2 h-2 bg-orange-500 rounded-full" />
                      Intuitive navigation
                    </li>
                  </ul>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Accessibility</CardTitle>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-2 text-sm">
                    <li className="flex items-center gap-2">
                      <div className="w-2 h-2 bg-green-500 rounded-full" />
                      WCAG 2.1 AA+ compliant
                    </li>
                    <li className="flex items-center gap-2">
                      <div className="w-2 h-2 bg-green-500 rounded-full" />
                      Keyboard navigation
                    </li>
                    <li className="flex items-center gap-2">
                      <div className="w-2 h-2 bg-green-500 rounded-full" />
                      Screen reader support
                    </li>
                    <li className="flex items-center gap-2">
                      <div className="w-2 h-2 bg-green-500 rounded-full" />
                      High contrast mode
                    </li>
                    <li className="flex items-center gap-2">
                      <div className="w-2 h-2 bg-green-500 rounded-full" />
                      ARIA labels
                    </li>
                  </ul>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Integration</CardTitle>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-2 text-sm">
                    <li className="flex items-center gap-2">
                      <div className="w-2 h-2 bg-indigo-500 rounded-full" />
                      tRPC backend integration
                    </li>
                    <li className="flex items-center gap-2">
                      <div className="w-2 h-2 bg-indigo-500 rounded-full" />
                      Real-time updates
                    </li>
                    <li className="flex items-center gap-2">
                      <div className="w-2 h-2 bg-indigo-500 rounded-full" />
                      Knowledge base search
                    </li>
                    <li className="flex items-center gap-2">
                      <div className="w-2 h-2 bg-indigo-500 rounded-full" />
                      Multi-provider fallback
                    </li>
                    <li className="flex items-center gap-2">
                      <div className="w-2 h-2 bg-indigo-500 rounded-full" />
                      Session management
                    </li>
                  </ul>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Documentation Tab */}
          <TabsContent value="documentation" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Getting Started</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-3">
                    <div>
                      <h4 className="font-medium mb-2">1. Basic Usage</h4>
                      <pre className="bg-slate-100 dark:bg-slate-800 p-3 rounded text-xs overflow-x-auto">
                        {`import { EnhancedAIChat } from '@/components/ai';

<EnhancedAIChat
  sessionType="general"
  showModelSelection={true}
  showVoiceInput={true}
  lgpdConsent={{
    canStoreHistory: true,
    dataRetentionDays: 30
  }}
/>`}
                      </pre>
                    </div>

                    <div>
                      <h4 className="font-medium mb-2">
                        2. With Patient Context
                      </h4>
                      <pre className="bg-slate-100 dark:bg-slate-800 p-3 rounded text-xs overflow-x-auto">
                        {`<EnhancedAIChat
  sessionType="client"
  patientContext={{
    patientId: "123",
    patientName: "Maria Silva"
  }}
  healthcareProfessional={{
    name: "Dr. Carlos Mendes",
    specialty: "Clínico Geral"
  }}
/>`}
                      </pre>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>API Reference</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <h4 className="font-medium mb-2">Props</h4>
                    <div className="space-y-2 text-sm">
                      <div>
                        <code className="bg-slate-100 dark:bg-slate-800 px-1 rounded">
                          sessionType
                        </code>
                        <span className="text-slate-600 dark:text-slate-400 ml-2">
                          - 'general' | 'client' | 'appointment' | 'financial'
                        </span>
                      </div>
                      <div>
                        <code className="bg-slate-100 dark:bg-slate-800 px-1 rounded">
                          patientContext
                        </code>
                        <span className="text-slate-600 dark:text-slate-400 ml-2">
                          - Patient information object
                        </span>
                      </div>
                      <div>
                        <code className="bg-slate-100 dark:bg-slate-800 px-1 rounded">
                          healthcareProfessional
                        </code>
                        <span className="text-slate-600 dark:text-slate-400 ml-2">
                          - Professional context object
                        </span>
                      </div>
                      <div>
                        <code className="bg-slate-100 dark:bg-slate-800 px-1 rounded">
                          lgpdConsent
                        </code>
                        <span className="text-slate-600 dark:text-slate-400 ml-2">
                          - LGPD compliance settings
                        </span>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Best Practices</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <ul className="text-sm space-y-2">
                    <li>
                      • Always obtain explicit consent before accessing patient
                      data
                    </li>
                    <li>
                      • Use appropriate session types for different contexts
                    </li>
                    <li>• Implement proper error handling for AI responses</li>
                    <li>• Follow WCAG guidelines for accessibility</li>
                    <li>• Test thoroughly on mobile devices</li>
                    <li>• Monitor AI usage and costs</li>
                    <li>
                      • Keep conversation history within retention policies
                    </li>
                  </ul>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Troubleshooting</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="space-y-3">
                    <div>
                      <h4 className="font-medium">Common Issues</h4>
                      <ul className="text-sm space-y-1 text-slate-600 dark:text-slate-400">
                        <li>• AI responses taking too long</li>
                        <li>• Voice input not working</li>
                        <li>• Patient context not loading</li>
                        <li>• Mobile responsiveness issues</li>
                      </ul>
                    </div>
                    <div>
                      <h4 className="font-medium">Solutions</h4>
                      <ul className="text-sm space-y-1 text-slate-600 dark:text-slate-400">
                        <li>• Check network connectivity</li>
                        <li>• Verify microphone permissions</li>
                        <li>• Ensure patient data is properly formatted</li>
                        <li>• Test on different screen sizes</li>
                      </ul>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </div>

      {/* Footer */}
      <div className="bg-white dark:bg-slate-900 border-t border-slate-200 dark:border-slate-700 mt-12">
        <div className="container mx-auto px-4 py-8">
          <div className="text-center space-y-4">
            <h3 className="text-lg font-semibold">
              Ready to Transform Your Clinic?
            </h3>
            <p className="text-slate-600 dark:text-slate-400 max-w-2xl mx-auto">
              Experience the power of AI in aesthetic clinic management. Our AI
              assistant is designed to streamline operations, improve patient
              care, and boost your clinic's efficiency.
            </p>
            <div className="flex justify-center gap-4">
              <Link to="/">
                <Button size="lg">Back to Dashboard</Button>
              </Link>
              <Button variant="outline" size="lg">
                Contact Sales
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
