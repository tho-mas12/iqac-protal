import { redirect } from 'next/navigation';
import { getCurrentUser } from '@/lib/auth';

export default async function HomePage() {
  const session = await getCurrentUser();

  if (!session) {
    redirect('/login');
  }

  switch (session.role) {
    case 'DEPARTMENT':
    case 'STAFF':
      redirect('/department/dashboard');
    case 'DIRECTOR':
      redirect('/director/dashboard');
    case 'ADMINISTRATOR':
      redirect('/staff/dashboard');
    case 'ADMIN':
      redirect('/admin');
    default:
      redirect('/login');
  }
}
