import api from "@/configs/axios";
import type { User } from "@/types";
import React, { createContext, useContext, useEffect, useState } from "react";

export interface AuthSession {
  user: User;
}

interface AuthContextValue {
  session: AuthSession | null;
  isPending: boolean;
  refreshSession: () => Promise<AuthSession | null>;
  signIn: (input: { email: string; password: string }) => Promise<AuthSession>;
  signUp: (input: {
    name: string;
    email: string;
    password: string;
  }) => Promise<AuthSession>;
  signOut: () => Promise<void>;
  updateProfile: (input: {
    name: string;
    email: string;
  }) => Promise<User>;
  changePassword: (input: {
    currentPassword: string;
    newPassword: string;
  }) => Promise<void>;
  deleteAccount: (password: string) => Promise<void>;
  getCredits: () => Promise<number>;
  purchaseCredits: (planId: string) => Promise<{ payment_link: string }>;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [session, setSession] = useState<AuthSession | null>(null);
  const [isPending, setIsPending] = useState(true);

  const refreshSession = async () => {
    try {
      const { data } = await api.get("/api/auth/session");
      setSession(data.session);
      return data.session;
    } catch (error) {
      setSession(null);
      return null;
    } finally {
      setIsPending(false);
    }
  };

  const signIn = async (input: { email: string; password: string }) => {
    const { data } = await api.post("/api/auth/signin", input);
    setSession(data.session);
    setIsPending(false);
    return data.session;
  };

  const signUp = async (input: {
    name: string;
    email: string;
    password: string;
  }) => {
    const { data } = await api.post("/api/auth/signup", input);
    setSession(data.session);
    setIsPending(false);
    return data.session;
  };

  const signOut = async () => {
    await api.post("/api/auth/signout");
    setSession(null);
    setIsPending(false);
  };

  const updateProfile = async (input: { name: string; email: string }) => {
    const { data } = await api.patch("/api/auth/profile", input);
    setSession((current) =>
      current
        ? {
            ...current,
            user: data.user,
          }
        : current,
    );
    return data.user;
  };

  const changePassword = async (input: {
    currentPassword: string;
    newPassword: string;
  }) => {
    await api.post("/api/auth/change-password", input);
  };

  const deleteAccount = async (password: string) => {
    await api.delete("/api/auth/account", {
      data: { password },
    });
    setSession(null);
    setIsPending(false);
  };

  const getCredits = async () => {
    const { data } = await api.get("/api/user/credits");
    return data.credits;
  };

  const purchaseCredits = async (planId: string) => {
    const { data } = await api.post("/api/user/purchase-credits", { planId });
    return data;
  };

  useEffect(() => {
    void refreshSession();
  }, []);

  return (
    <AuthContext.Provider
      value={{
        session,
        isPending,
        refreshSession,
        signIn,
        signUp,
        signOut,
        updateProfile,
        changePassword,
        deleteAccount,
        getCredits,
        purchaseCredits,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error("useAuth must be used inside AuthProvider");
  }

  return context;
}
