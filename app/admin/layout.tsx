import { auth } from '@clerk/nextjs/server';
import { redirect } from 'next/navigation';
import { isAdmin } from '@/app/utils/usageLimits';

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { userId } = await auth();

  // Redirect if not authenticated
  if (!userId) {
    redirect('/');
  }

  // Redirect if not admin
  if (!isAdmin(userId)) {
    redirect('/');
  }

  return (
    <div className="absolute inset-0 overflow-y-auto bg-gray-50">
      {children}
    </div>
  );
}
