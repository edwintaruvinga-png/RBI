import { useMutation } from '@tanstack/react-query';
import { api } from '../client';
import type { User } from '../../types';

interface LoginInput {
  email: string;
  password: string;
}

interface LoginResponse {
  user: User;
  token: string;
}

export function useLogin() {
  return useMutation({
    mutationFn: async (input: LoginInput) => {
      const { data } = await api.post<LoginResponse>('/auth/login', input);
      return data;
    },
  });
}
