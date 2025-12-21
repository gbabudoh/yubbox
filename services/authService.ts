import { signIn } from 'next-auth/react';
import { ApiResponse } from '@/types/general';

const API_BASE_URL = '/api/auth';

export const authService = {
  async register(
    name: string,
    email: string,
    password: string
  ): Promise<void> {
    const response = await fetch(`${API_BASE_URL}/register`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ name, email, password }),
    });

    if (!response.ok) {
      const error: ApiResponse = await response.json();
      throw new Error(error.error || 'Failed to register');
    }
  },

  async login(email: string, password: string): Promise<void> {
    const result = await signIn('credentials', {
      email,
      password,
      redirect: false,
    });

    if (result?.error) {
      throw new Error(result.error);
    }
  },

  async logout(): Promise<void> {
    // NextAuth handles logout through signOut
    const { signOut } = await import('next-auth/react');
    await signOut({ redirect: true, callbackUrl: '/login' });
  },
};

