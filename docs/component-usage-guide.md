# 🎨 NeonPro Component Usage Guide

**Updated:** 2025-01-12  
**Status:** ✅ **POST-CLEANUP - CLEAN ARCHITECTURE**

---

## 📋 **Quick Reference**

### **Import Hierarchy (Priority Order)**
```typescript
// 1. Shared UI Package (Highest Priority)
import { Button, Card, CardContent, CardHeader, CardTitle } from '@neonpro/ui';

// 2. Enhanced Molecules (Composed Components)
import { Alert, AlertDescription, AlertTitle } from '@/components/molecules/alert';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/molecules/table';

// 3. Basic Atoms (Primitive Components)
import { Badge } from '@/components/atoms/badge';
import { Input } from '@/components/atoms/input';
import { Label } from '@/components/atoms/label';

// 4. Specialized UI Components (Specific Use Cases)
import { MagicCard } from '@/components/ui/magic-card';
import { UniversalButton } from '@/components/ui/universal-button';
import { HoverBorderGradient } from '@/components/ui/hover-border-gradient';

// 5. Organisms (Complex Features)
import { AIChatContainer } from '@/components/organisms';
```

---

## 🏗️ **Component Categories**

### **1. Buttons**

#### **Primary Button (@neonpro/ui)**
```typescript
import { Button } from '@neonpro/ui';

// Standard usage
<Button>Click me</Button>
<Button variant="destructive">Delete</Button>
<Button size="lg">Large Button</Button>

// With loading state
<Button loading={isLoading}>
  {isLoading ? 'Processing...' : 'Submit'}
</Button>
```

#### **Universal Button (Advanced)**
```typescript
import { UniversalButton } from '@/components/ui/universal-button';

// Gradient effects
<UniversalButton variant="gradient-primary">Gradient</UniversalButton>
<UniversalButton variant="neumorph">Neumorphic</UniversalButton>

// With animations
<UniversalButton 
  enableGradient 
  enableShineBorder
  effect="bounce"
>
  Animated Button
</UniversalButton>
```

### **2. Cards**

#### **Standard Card (@neonpro/ui)**
```typescript
import { Card, CardContent, CardHeader, CardTitle } from '@neonpro/ui';

<Card>
  <CardHeader>
    <CardTitle>Card Title</CardTitle>
  </CardHeader>
  <CardContent>
    <p>Card content goes here.</p>
  </CardContent>
</Card>
```

#### **Magic Card (Spotlight Effects)**
```typescript
import { MagicCard } from '@/components/ui/magic-card';

<MagicCard 
  gradientSize={200}
  gradientColor="#AC9469"
  gradientOpacity={0.8}
>
  <p>Content with spotlight effect</p>
</MagicCard>
```

#### **Simple Card (Molecules)**
```typescript
import { Card } from '@/components/molecules/card';

<Card enableShineBorder shineColor="#AC9469">
  <p>Simple card with shine border</p>
</Card>
```

### **3. Form Components**

#### **Input & Label (Atoms)**
```typescript
import { Input } from '@/components/atoms/input';
import { Label } from '@/components/atoms/label';

<div>
  <Label htmlFor="email">Email</Label>
  <Input 
    id="email" 
    type="email" 
    placeholder="Enter your email"
  />
</div>
```

### **4. Feedback Components**

#### **Alert (Enhanced - Molecules)**
```typescript
import { Alert, AlertDescription, AlertTitle } from '@/components/molecules/alert';

<Alert variant="default">
  <AlertTitle>Heads up!</AlertTitle>
  <AlertDescription>
    You can add components to your app using the cli.
  </AlertDescription>
</Alert>

<Alert variant="destructive">
  <AlertTitle>Error</AlertTitle>
  <AlertDescription>
    Your session has expired. Please log in again.
  </AlertDescription>
</Alert>
```

#### **Badge (Atoms)**
```typescript
import { Badge } from '@/components/atoms/badge';

<Badge>Default</Badge>
<Badge variant="secondary">Secondary</Badge>
<Badge variant="destructive">Error</Badge>
<Badge variant="outline">Outline</Badge>
```

### **5. Data Display**

#### **Table (Molecules)**
```typescript
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from '@/components/molecules/table';

<Table>
  <TableHeader>
    <TableRow>
      <TableHead>Name</TableHead>
      <TableHead>Status</TableHead>
      <TableHead>Actions</TableHead>
    </TableRow>
  </TableHeader>
  <TableBody>
    <TableRow>
      <TableCell>John Doe</TableCell>
      <TableCell>
        <Badge variant="secondary">Active</Badge>
      </TableCell>
      <TableCell>
        <Button size="sm">Edit</Button>
      </TableCell>
    </TableRow>
  </TableBody>
</Table>
```

---

## 🎯 **Usage Patterns**

### **Healthcare Forms**
```typescript
import { Card, CardContent, CardHeader, CardTitle } from '@neonpro/ui';
import { Button } from '@neonpro/ui';
import { Input } from '@/components/atoms/input';
import { Label } from '@/components/atoms/label';
import { Alert, AlertDescription } from '@/components/molecules/alert';

function PatientForm() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Patient Information</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div>
          <Label htmlFor="name">Full Name</Label>
          <Input id="name" placeholder="Enter patient name" />
        </div>
        
        <Alert>
          <AlertDescription>
            All patient information is encrypted and HIPAA compliant.
          </AlertDescription>
        </Alert>
        
        <Button className="w-full">Save Patient</Button>
      </CardContent>
    </Card>
  );
}
```

### **Dashboard Cards**
```typescript
import { Card, CardContent, CardHeader, CardTitle } from '@neonpro/ui';
import { Badge } from '@/components/atoms/badge';

function MetricCard({ title, value, status, trend }) {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">{title}</CardTitle>
        <Badge variant={status === 'up' ? 'default' : 'destructive'}>
          {trend}
        </Badge>
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">{value}</div>
      </CardContent>
    </Card>
  );
}
```

### **Data Tables with Actions**
```typescript
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from '@/components/molecules/table';
import { Button } from '@neonpro/ui';
import { Badge } from '@/components/atoms/badge';

function AppointmentsTable({ appointments }) {
  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Patient</TableHead>
          <TableHead>Date</TableHead>
          <TableHead>Status</TableHead>
          <TableHead>Actions</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {appointments.map((appointment) => (
          <TableRow key={appointment.id}>
            <TableCell>{appointment.patientName}</TableCell>
            <TableCell>{appointment.date}</TableCell>
            <TableCell>
              <Badge variant={appointment.status === 'confirmed' ? 'default' : 'secondary'}>
                {appointment.status}
              </Badge>
            </TableCell>
            <TableCell>
              <Button size="sm" variant="outline">
                View Details
              </Button>
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}
```

---

## ⚠️ **Common Mistakes to Avoid**

### **❌ Wrong Import Paths**
```typescript
// DON'T - These paths no longer exist
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Alert } from '@/components/ui/alert';
```

### **✅ Correct Import Paths**
```typescript
// DO - Use these correct paths
import { Button } from '@neonpro/ui';
import { Badge } from '@/components/atoms/badge';
import { Alert } from '@/components/molecules/alert';
```

### **❌ Mixing Component Sources**
```typescript
// DON'T - Inconsistent sources
import { Card } from '@/components/ui/card';
import { CardContent } from '@neonpro/ui';
```

### **✅ Consistent Component Sources**
```typescript
// DO - Use consistent sources
import { Card, CardContent, CardHeader, CardTitle } from '@neonpro/ui';
```

---

## 🔧 **Troubleshooting**

### **Build Errors**
- **Import not found**: Check if you're using the correct import path
- **Type errors**: Ensure you're importing both the component and its types
- **Missing dependencies**: Run `bun install` to ensure all packages are installed

### **Component Not Rendering**
- **Check import path**: Verify the component exists at the specified path
- **Check props**: Ensure you're passing the correct props for the component
- **Check CSS**: Ensure Tailwind CSS is properly configured

### **Styling Issues**
- **Missing styles**: Ensure the component's CSS is being imported
- **Conflicting styles**: Check for CSS class conflicts
- **Theme issues**: Verify CSS variables are properly defined

---

## 📚 **Additional Resources**

- **Architecture Analysis**: `docs/neonpro-component-architecture-analysis.md`
- **Component Conflicts**: `docs/card-component-architecture-analysis.md`
- **Neumorph Integration**: `docs/cult-ui-neumorph-button-integration.md`
- **Source Tree**: `docs/architecture/source-tree.md`

---

**Last Updated**: 2025-01-12  
**Next Review**: When new components are added or architecture changes
