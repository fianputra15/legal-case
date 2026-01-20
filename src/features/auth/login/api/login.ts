import { apiClient } from '@/shared/api';
import type { User, AuthResponse } from '@/shared/types';
import type { LoginFormData } from '../model';

export const loginUser = async (credentials: LoginFormData): Promise<User> => {
  const response = await apiClient.post<AuthResponse>('/api/auth/login', credentials);
  
  if (response.success && response.data?.user) {
    return response.data.user;
  }
  
  throw new Error(response.error || 'Login failed');
};