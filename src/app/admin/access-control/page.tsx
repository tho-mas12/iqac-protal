import { redirect } from 'next/navigation';

export default function AccessControlPage() {
  redirect('/admin/users');
}
