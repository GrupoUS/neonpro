// Central barrel for app-level components
// Import from here in routes/pages: import { Button, Card } from '@/components'

export * from './atoms';
export * from './molecules';
// Export specific Organisms only (avoid Sidebar name collisions from ui/sidebar re-exports)
export { AIChatContainer } from './organisms';
// export * from './templates'; // commented: path may not exist
// Avoid re-exporting entire ui barrel; export only safe items
export { Toaster } from './ui/toaster';
export * from './ui/ai-chat';
export * from './ui/background-gradient';
export * from './ui/beams-background';
export * from './ui/liquid-glass-card';
// Do not re-export './ui/sidebar' here to avoid duplicate Sidebar symbols

// export * from './healthcare'; // removed: folder no longer exists


// Common aliases (optional convenience re-exports)
export { Button } from './atoms/button';
export { Input } from './atoms/input';
export { Label } from './atoms/label';
export { Badge } from './atoms/badge';

export { Card, CardHeader, CardTitle, CardContent, CardDescription } from './molecules/card';
export { Alert, AlertTitle, AlertDescription } from './molecules/alert';
export { Table, TableHeader, TableHead, TableRow, TableBody, TableCell } from './molecules/table';
