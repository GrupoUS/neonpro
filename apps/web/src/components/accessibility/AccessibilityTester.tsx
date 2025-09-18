/**
 * Accessibility Tester Component
 * T081 - WCAG 2.1 AA+ Accessibility Compliance
 *
 * Features:
 * - Real-time accessibility testing with axe-core
 * - Healthcare-specific validation
 * - Color contrast analysis
 * - Keyboard navigation testing
 * - Developer tools for accessibility debugging
 */

'use client';

import React, { useState, useEffect } from 'react';
import {
  Accessibility,
  AlertCircle,
  CheckCircle,
  Eye,
  EyeOff,
  RefreshCw,
  Shield,
  AlertTriangle,
  Info,
  Zap,
  Keyboard,
  Palette
} from 'lucide-react';
import { Button } from '@neonpro/ui';
import { Card, CardContent, CardHeader, CardTitle } from '@neonpro/ui';
import { Badge } from '@neonpro/ui';
import { useAccessibilityTesting, useKeyboardNavigationTest } from '../../hooks/useAccessibilityTesting';
import { generateAccessibilityReport } from '../../utils/accessibility-testing';

interface AccessibilityTesterProps {
  enabled?: boolean;
  position?: 'top-right' | 'top-left' | 'bottom-right' | 'bottom-left';
  includeHealthcareRules?: boolean;
  autoTest?: boolean;
}

export function AccessibilityTester({
  enabled = process.env.NODE_ENV === 'development',
  position = 'top-right',
  includeHealthcareRules = true,
  autoTest = true
}: AccessibilityTesterProps) {
  const [isVisible, setIsVisible] = useState(false);
  const [activeTab, setActiveTab] = useState<'summary' | 'violations' | 'contrast' | 'keyboard'>('summary');
  
  const {
    issues,
    criticalIssues,
    seriousIssues,
    moderateIssues,
    minorIssues,
    colorContrast,
    lastTested,
    isTesting,
    healthcareCompliance,
    testAccessibility,
    clearResults
  } = useAccessibilityTesting(null, {
    enabled,
    runOnMount: autoTest,
    includeHealthcareRules
  });

  const {
    tabOrder,
    focusableElements,
    issues: keyboardIssues,
    testKeyboardNavigation,
    hasIssues: hasKeyboardIssues
  } = useKeyboardNavigationTest();

  const [isTestingKeyboard, setIsTestingKeyboard] = useState(false);

  const positionClasses = {
    'top-right': 'top-4 right-4',
    'top-left': 'top-4 left-4',
    'bottom-right': 'bottom-4 right-4',
    'bottom-left': 'bottom-4 left-4'
  };

  const handleRunAllTests = async () => {
    await testAccessibility();
    setIsTestingKeyboard(true);
    await testKeyboardNavigation();
    setIsTestingKeyboard(false);
  };

  const handleExportReport = () => {
    if (!lastTested) return;

    const report = generateAccessibilityReport({
      passes: 0, // Would need to be calculated
      violations: issues,
      incomplete: [],
      timestamp: lastTested,
      url: window.location.href,
      healthcareCompliance
    });

    const blob = new Blob([report], { type: 'text/markdown' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `accessibility-report-${new Date().toISOString().split('T')[0]}.md`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  if (!enabled) return null;

  return (
    <>
      {/* Toggle Button */}
      <div
        className={`fixed z-50 ${positionClasses[position]}`}
        role="region"
        aria-label="Accessibility testing controls"
      >
        <Button
          variant="outline"
          size="sm"
          onClick={() => setIsVisible(!isVisible)}
          className={`
            shadow-lg transition-all duration-200
            ${isVisible ? 'bg-primary text-primary-foreground' : ''}
            focus:ring-2 focus:ring-primary focus:ring-offset-2
          `}
          aria-label={isVisible ? 'Hide accessibility tester' : 'Show accessibility tester'}
          aria-expanded={isVisible}
        >
          {isVisible ? <EyeOff className="w-4 h-4" /> : <Accessibility className="w-4 h-4" />}
          {issues.length > 0 && (
            <Badge
              variant="destructive"
              className="ml-2 -mr-1 w-5 h-5 p-0 text-xs flex items-center justify-center"
              aria-label={`${issues.length} accessibility issues found`}
            >
              {issues.length}
            </Badge>
          )}
        </Button>
      </div>

      {/* Tester Panel */}
      {isVisible && (
        <div
          className={`fixed z-40 ${positionClasses[position]} w-96 max-h-[80vh] overflow-hidden`}
          role="dialog"
          aria-label="Accessibility testing panel"
          aria-modal="true"
        >
          <Card className="shadow-2xl border-2">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center gap-2 text-lg">
                  <Accessibility className="w-5 h-5" />
                  Accessibility Tester
                </CardTitle>
                <div className="flex items-center gap-2">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={handleRunAllTests}
                    disabled={isTesting || isTestingKeyboard}
                    className="h-8 w-8 p-0"
                    aria-label="Run all accessibility tests"
                  >
                    <RefreshCw className={`w-4 h-4 ${isTesting || isTestingKeyboard ? 'animate-spin' : ''}`} />
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={handleExportReport}
                    disabled={!lastTested}
                    className="h-8 w-8 p-0"
                    aria-label="Export accessibility report"
                  >
                    <Eye className="w-4 h-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setIsVisible(false)}
                    className="h-8 w-8 p-0"
                    aria-label="Close accessibility tester"
                  >
                    <EyeOff className="w-4 h-4" />
                  </Button>
                </div>
              </div>

              {/* Status Indicators */}
              <div className="flex flex-wrap gap-2 mt-3">
                <div className="flex items-center gap-1 text-sm">
                  {issues.length === 0 ? (
                    <CheckCircle className="w-4 h-4 text-green-600" />
                  ) : (
                    <AlertCircle className="w-4 h-4 text-red-600" />
                  )}
                  <span>{issues.length} issues</span>
                </div>
                
                <div className="flex items-center gap-1 text-sm">
                  <Shield className="w-4 h-4 text-blue-600" />
                  <span>LGPD: {healthcareCompliance.lgpd ? '✅' : '❌'}</span>
                </div>

                <div className="flex items-center gap-1 text-sm">
                  <Zap className="w-4 h-4 text-purple-600" />
                  <span>Healthcare: {healthcareCompliance.healthcareData ? '✅' : '❌'}</span>
                </div>

                {lastTested && (
                  <div className="text-xs text-gray-500">
                    Tested: {lastTested.toLocaleTimeString()}
                  </div>
                )}
              </div>

              {/* Tabs */}
              <div className="flex gap-1 mt-3 border-b">
                {[
                  { id: 'summary', label: 'Summary', icon: Info },
                  { id: 'violations', label: 'Violations', icon: AlertTriangle },
                  { id: 'contrast', label: 'Colors', icon: Palette },
                  { id: 'keyboard', label: 'Keyboard', icon: Keyboard }
                ].map(({ id, label, icon: Icon }) => (
                  <Button
                    key={id}
                    variant={activeTab === id ? 'default' : 'ghost'}
                    size="sm"
                    onClick={() => setActiveTab(id as any)}
                    className="text-xs h-8"
                  >
                    <Icon className="w-3 h-3 mr-1" />
                    {label}
                  </Button>
                ))}
              </div>
            </CardHeader>

            <CardContent className="p-0">
              <div className="max-h-96 overflow-y-auto p-4">
                {/* Summary Tab */}
                {activeTab === 'summary' && (
                  <div className="space-y-4">
                    <div className="grid grid-cols-2 gap-3">
                      <div className="p-3 rounded-lg bg-red-50 border border-red-200">
                        <div className="text-lg font-bold text-red-600">{criticalIssues}</div>
                        <div className="text-xs text-red-600">Critical</div>
                      </div>
                      <div className="p-3 rounded-lg bg-orange-50 border border-orange-200">
                        <div className="text-lg font-bold text-orange-600">{seriousIssues}</div>
                        <div className="text-xs text-orange-600">Serious</div>
                      </div>
                      <div className="p-3 rounded-lg bg-yellow-50 border border-yellow-200">
                        <div className="text-lg font-bold text-yellow-600">{moderateIssues}</div>
                        <div className="text-xs text-yellow-600">Moderate</div>
                      </div>
                      <div className="p-3 rounded-lg bg-blue-50 border border-blue-200">
                        <div className="text-lg font-bold text-blue-600">{minorIssues}</div>
                        <div className="text-xs text-blue-600">Minor</div>
                      </div>
                    </div>

                    <div className="p-3 rounded-lg bg-gray-50 border">
                      <h4 className="font-semibold mb-2 flex items-center gap-2">
                        <Shield className="w-4 h-4" />
                        Healthcare Compliance
                      </h4>
                      <div className="space-y-1 text-sm">
                        <div className="flex justify-between">
                          <span>🇧🇷 LGPD Compliance</span>
                          <span>{healthcareCompliance.lgpd ? '✅' : '❌'}</span>
                        </div>
                        <div className="flex justify-between">
                          <span>🏥 Healthcare Data</span>
                          <span>{healthcareCompliance.healthcareData ? '✅' : '❌'}</span>
                        </div>
                        <div className="flex justify-between">
                          <span>🚨 Emergency Features</span>
                          <span>{healthcareCompliance.emergencyFeatures ? '✅' : '❌'}</span>
                        </div>
                      </div>
                    </div>

                    <div className="p-3 rounded-lg bg-gray-50 border">
                      <h4 className="font-semibold mb-2 flex items-center gap-2">
                        <Palette className="w-4 h-4" />
                        Color Contrast
                      </h4>
                      <div className="space-y-1 text-sm">
                        <div className="flex justify-between">
                          <span>Status</span>
                          <span>{colorContrast.passes ? '✅' : '❌'}</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Best Ratio</span>
                          <span>{colorContrast.ratio.toFixed(2)}:1</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Required</span>
                          <span>{colorContrast.required}:1</span>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* Violations Tab */}
                {activeTab === 'violations' && (
                  <div className="space-y-3">
                    {issues.length === 0 ? (
                      <div className="text-center py-8 text-green-600">
                        <CheckCircle className="w-12 h-12 mx-auto mb-2" />
                        <p className="font-semibold">No accessibility violations found!</p>
                        <p className="text-sm">Your interface meets WCAG 2.1 AA+ standards.</p>
                      </div>
                    ) : (
                      issues.map((issue, index) => (
                        <div
                          key={`${issue.id}-${index}`}
                          className="p-3 rounded-lg border-l-4 bg-white"
                          style={{
                            borderLeftColor: {
                              critical: '#dc2626',
                              serious: '#ea580c',
                              moderate: '#ca8a04',
                              minor: '#2563eb'
                            }[issue.impact]
                          }}
                        >
                          <div className="flex items-start justify-between mb-2">
                            <h4 className="font-semibold text-sm">{issue.id}</h4>
                            <Badge
                              variant={
                                issue.impact === 'critical' ? 'destructive' :
                                issue.impact === 'serious' ? 'default' :
                                'secondary'
                              }
                              className="text-xs"
                            >
                              {issue.impact}
                            </Badge>
                          </div>
                          
                          <p className="text-sm text-gray-700 mb-2">{issue.description}</p>
                          
                          <div className="flex gap-2 flex-wrap">
                            {issue.healthcareSpecific && (
                              <Badge variant="outline" className="text-xs">
                                🏥 Healthcare
                              </Badge>
                            )}
                            {issue.lgpdRelevant && (
                              <Badge variant="outline" className="text-xs">
                                🇧🇷 LGPD
                              </Badge>
                            )}
                          </div>
                          
                          <details className="mt-2">
                            <summary className="text-xs text-blue-600 cursor-pointer">
                              Technical details
                            </summary>
                            <div className="mt-2 text-xs bg-gray-50 p-2 rounded">
                              <p className="font-mono mb-1">{issue.nodes[0]?.html}</p>
                              <a
                                href={issue.helpUrl}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-blue-600 hover:underline"
                              >
                                Learn more →
                              </a>
                            </div>
                          </details>
                        </div>
                      ))
                    )}
                  </div>
                )}

                {/* Color Contrast Tab */}
                {activeTab === 'contrast' && (
                  <div className="space-y-3">
                    {colorContrast.elements.length === 0 ? (
                      <div className="text-center py-8 text-gray-500">
                        <Palette className="w-12 h-12 mx-auto mb-2" />
                        <p className="font-semibold">No color contrast data available</p>
                        <p className="text-sm">Run a test to check color contrast.</p>
                      </div>
                    ) : (
                      colorContrast.elements.map((element, index) => (
                        <div
                          key={index}
                          className="p-3 rounded-lg border bg-white"
                        >
                          <div className="flex items-center justify-between mb-2">
                            <h4 className="font-semibold text-sm capitalize">
                              {element.element}
                            </h4>
                            <div className="flex items-center gap-2">
                              <span className="text-xs font-mono">
                                {element.ratio.toFixed(2)}:1
                              </span>
                              {element.passes ? (
                                <CheckCircle className="w-4 h-4 text-green-600" />
                              ) : (
                                <AlertCircle className="w-4 h-4 text-red-600" />
                              )}
                            </div>
                          </div>
                          
                          <div className="flex gap-2 text-xs">
                            <div className="flex items-center gap-1">
                              <div
                                className="w-4 h-4 rounded border"
                                style={{ backgroundColor: element.foreground }}
                              />
                              <span className="font-mono">{element.foreground}</span>
                            </div>
                            <div className="flex items-center gap-1">
                              <div
                                className="w-4 h-4 rounded border"
                                style={{ backgroundColor: element.background }}
                              />
                              <span className="font-mono">{element.background}</span>
                            </div>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                )}

                {/* Keyboard Tab */}
                {activeTab === 'keyboard' && (
                  <div className="space-y-3">
                    <div className="grid grid-cols-2 gap-3">
                      <div className="p-3 rounded-lg bg-blue-50 border border-blue-200">
                        <div className="text-lg font-bold text-blue-600">{focusableElements}</div>
                        <div className="text-xs text-blue-600">Focusable Elements</div>
                      </div>
                      <div className="p-3 rounded-lg bg-red-50 border border-red-200">
                        <div className="text-lg font-bold text-red-600">{keyboardIssues.length}</div>
                        <div className="text-xs text-red-600">Keyboard Issues</div>
                      </div>
                    </div>

                    {hasKeyboardIssues ? (
                      <div className="space-y-2">
                        <h4 className="font-semibold text-sm">Keyboard Navigation Issues:</h4>
                        {keyboardIssues.map((issue, index) => (
                          <div
                            key={index}
                            className="p-2 rounded bg-red-50 border border-red-200 text-sm text-red-700"
                          >
                            ❌ {issue}
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="text-center py-4 text-green-600">
                        <CheckCircle className="w-8 h-8 mx-auto mb-2" />
                        <p className="font-semibold">No keyboard navigation issues!</p>
                      </div>
                    )}

                    {tabOrder.length > 0 && (
                      <div className="mt-4">
                        <h4 className="font-semibold text-sm mb-2">Tab Order:</h4>
                        <div className="text-xs font-mono bg-gray-50 p-2 rounded">
                          {tabOrder.slice(0, 10).join(' → ')}
                          {tabOrder.length > 10 && ' → ...'}
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Backdrop */}
      {isVisible && (
        <div
          className="fixed inset-0 bg-black bg-opacity-25 z-30"
          onClick={() => setIsVisible(false)}
          aria-hidden="true"
        />
      )}
    </>
  );
}

export default AccessibilityTester;