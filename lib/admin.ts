import { getServerSession } from 'next-auth';
import { authOptions } from './nextauth';
import dbConnect from './dbConnect';
import User from '@/models/User';

/**
 * Check if the current user is an admin
 */
export async function isAdmin(): Promise<boolean> {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session || !session.user?.id) {
      return false;
    }

    await dbConnect();
    const user = await User.findById(session.user.id).select('role');
    
    return user?.role === 'admin';
  } catch (error) {
    console.error('Error checking admin status:', error);
    return false;
  }
}

/**
 * Require admin access - throws error if not admin
 */
export async function requireAdmin(): Promise<void> {
  const admin = await isAdmin();
  if (!admin) {
    throw new Error('Admin access required');
  }
}

