/**
 * NEONPROV1 - Home Page
 * Redirects to dashboard for authenticated users
 */
import { redirect } from 'next/navigation';

export default function HomePage() {
  // Redirect to dashboard - main entry point for NEONPROV1
  redirect('/dashboard');
}