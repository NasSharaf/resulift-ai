import { auth } from '@clerk/nextjs/server';
import { NextResponse } from 'next/server';
import { isAdmin } from '@/app/utils/usageLimits';
import { umichDearbornDashboardData } from '@/app/lib/mockData/umichDearborn';

/**
 * GET /api/admin/data
 * Returns all dashboard data for admin users
 * Protected by Clerk auth + isAdmin check
 */
export async function GET() {
  try {
    // Check authentication
    const { userId } = await auth();

    if (!userId) {
      return NextResponse.json(
        { error: 'Unauthorized - Not authenticated' },
        { status: 401 }
      );
    }

    // Check admin privileges
    if (!isAdmin(userId)) {
      return NextResponse.json(
        { error: 'Forbidden - Admin access required' },
        { status: 403 }
      );
    }

    // Return mock data for demo
    // TODO: In production, replace with real database queries
    return NextResponse.json(umichDearbornDashboardData);
  } catch (error) {
    console.error('Error fetching admin data:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
