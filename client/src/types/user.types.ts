/** User & authentication types — mirrors server User model */

export type UserRole = "user" | "admin";

export interface Address {
  street: string;
  city: string;
  state: string;
  pincode: string;
  country: string;
}

export interface User {
  _id: string;
  name: string;
  email: string;
  phone?: string;
  address?: Address;
  role: UserRole;
  isVerified: boolean;
  googleId?: string;
  createdAt: string;
  updatedAt: string;
}

/** Safe user object returned from API (no password / refresh token) */
export type UserPublic = User;

export interface AuthTokens {
  accessToken: string;
}

export interface AuthResponse {
  user: UserPublic;
  accessToken: string;
}

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface RegisterPayload {
  name: string;
  email: string;
  password: string;
  phone?: string;
}

export interface VerifyEmailPayload {
  email: string;
  otp: string;
}

export interface ForgotPasswordPayload {
  email: string;
}

export interface ResetPasswordPayload {
  token: string;
  password: string;
}

export interface UpdateProfilePayload {
  name?: string;
  phone?: string;
  address?: Partial<Address>;
}

export interface AdminUpdateUserPayload {
  name?: string;
  phone?: string;
  role?: UserRole;
  isVerified?: boolean;
  address?: Partial<Address>;
}
