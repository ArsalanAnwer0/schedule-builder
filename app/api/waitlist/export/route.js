import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import dbConnect from '../../../../lib/db/connect';
import Waitlist from '../../../../lib/db/models/Waitlist';
import User from '../../../../lib/db/models/User';

export async function GET(request) {
  try {
    // Get session to verify admin access
    const session = await getServerSession();

    if (!session || !session.user) {
      return NextResponse.json(
        { error: 'Unauthorized - Please log in' },
        { status: 401 }
      );
    }

    await dbConnect();

    // Verify user is an admin
    const user = await User.findOne({ email: session.user.email });

    if (!user || (user.role !== 'primary_admin' && user.role !== 'secondary_admin')) {
      return NextResponse.json(
        { error: 'Forbidden - Admin access required' },
        { status: 403 }
      );
    }

    // Fetch all waitlist entries
    const entries = await Waitlist.find({})
      .sort({ createdAt: -1 })
      .lean();

    // Convert to CSV
    const headers = ['Email', 'Status', 'Source', 'Created At', 'Updated At'];
    const csvRows = [headers.join(',')];

    entries.forEach(entry => {
      const row = [
        entry.email,
        entry.status,
        entry.source,
        new Date(entry.createdAt).toISOString(),
        new Date(entry.updatedAt).toISOString()
      ];
      csvRows.push(row.join(','));
    });

    const csvContent = csvRows.join('\n');

    // Return CSV file
    return new NextResponse(csvContent, {
      status: 200,
      headers: {
        'Content-Type': 'text/csv',
        'Content-Disposition': `attachment; filename="waitlist-export-${new Date().toISOString().split('T')[0]}.csv"`
      }
    });

  } catch (error) {
    console.error('Waitlist export error:', error);
    return NextResponse.json(
      { error: 'Failed to export waitlist' },
      { status: 500 }
    );
  }
}
