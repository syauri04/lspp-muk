export type MukRole = "asesi" | "asesor";

export interface User {
  id: number;
  role: MukRole;
  name: string;
  email: string;
  phone: string | null;
  avatar_url: string | null;
  nomor_registrasi?: string | null;
}

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface LoginResponse {
  message: string;
  data: {
    token: string;
    token_type: "Bearer";
    expires_at: string | null;
    user: User;
  };
}

export const ROLE_LABEL: Record<MukRole, string> = {
  asesi: "Asesi",
  asesor: "Asesor",
};
