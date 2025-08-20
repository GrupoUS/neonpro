import { redirect } from 'next/navigation';

export default function RootPage() {
  // Redirect to login page by default
  redirect('/login');
}
