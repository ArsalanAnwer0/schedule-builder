import { getSession } from './session';

export async function requireAdmin() {
  const sessionData = await getSession();

  if (!sessionData || !sessionData.user) {
    throw new Error('Unauthorized: No session found');
  }

  if (sessionData.user.role !== 'admin') {
    throw new Error('Forbidden: Admin access required');
  }

  return sessionData.user;
}
