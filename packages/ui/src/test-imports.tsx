// Test file to verify UI component imports work correctly
import React from 'react';

// Test basic UI components
import { Button } from './components/ui/button';
import { Card, CardHeader, CardContent } from './components/ui/card';
import { Alert } from './components/ui/alert';
import { Input } from './components/ui/input';

// Test healthcare components
import { EmergencyAlert } from './components/healthcare/emergency-alert';
import { MobileHealthcareButton } from './components/ui/mobile-healthcare-button';

// Test accessibility components  
import { KeyboardNavigation } from './components/accessibility/keyboard-navigation';

// Test utilities
import { cn } from './lib/utils';

// Simple test component
export const TestComponent = () => {
  return (
    <div className="p-4">
      <Button>Test Button</Button>
      <Card>
        <CardHeader>Test Card</CardHeader>
        <CardContent>Test Content</CardContent>
      </Card>
      <Alert>Test Alert</Alert>
      <Input placeholder="Test input" />
    </div>
  );
};

export default TestComponent;