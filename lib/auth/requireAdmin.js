import { getServerSession } from 'next-auth';
import { authOptions } from '../../app/api/auth/[...nextauth]/route';

export async function requireAdmin() {
  const session = await getServerSession(authOptions);

  if (!session || !session.user) {
    throw new Error('Unauthorized: No session found');
  }

  if (session.user.role !== 'admin') {
    throw new Error('Forbidden: Admin access required');
  }

  return session.user;
}
