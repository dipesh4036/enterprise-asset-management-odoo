import { api } from "@/lib/axios";
import { LoginInput, SignupInput } from "../schema";
import { User } from "@/store/auth.store";

export interface AuthResponse {
  success: boolean;
  message: string;
  data: {
    user: User;
    token: string;
  };
}

export const authService = {
  async login(data: LoginInput): Promise<AuthResponse> {
    const res = await api.post<AuthResponse>("/auth/login", data);
    return res.data;
  },

  async signup(data: SignupInput): Promise<AuthResponse> {
    const res = await api.post<AuthResponse>("/auth/signup", data);
    return res.data;
  },

  async getMe(): Promise<AuthResponse> {
    const res = await api.get<AuthResponse>("/auth/me");
    return res.data;
  },
};
