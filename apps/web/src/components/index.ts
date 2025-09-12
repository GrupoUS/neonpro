// Central barrel for app-level components
// Import from here in routes/pages: import { Button, Card } from '@/components'

export * from './atoms';
export * from './molecules';
// Export specific Organisms only (avoid Sidebar name collisions from ui/sidebar re-exports)
export { AIChatContainer } from './organisms';
// export * from './templates'; // commented: path may not exist
// Avoid re-exporting entire ui barrel; export only safe items
export * from './ui/ai-chat';
export * from './ui/beams-background';
export { Toaster } from './ui/toaster';
// Do not re-export './ui/sidebar' here to avoid duplicate Sidebar symbols

// export * from './healthcare'; // removed: folder no longer exists

// Common aliases (optional convenience re-exports)
export { Badge } from './atoms/badge';
export { Button } from './atoms/button';
export { Input } from './atoms/input';
export { Label } from './atoms/label';

export { Alert, AlertDescription, AlertTitle } from './molecules/alert';
export { Card, CardContent, CardDescription, CardHeader, CardTitle } from './molecules/card';
export { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from './molecules/table';
