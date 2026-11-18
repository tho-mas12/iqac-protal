import { redirect } from 'next/navigation';
import { getCurrentUser } from '@/lib/auth';
import LoginPage from './login/page';

export default async function HomePage() {
  const session = await getCurrentUser();

  if (session) {
    redirect('/dashboard');
  }

  return <LoginPage />;
}
