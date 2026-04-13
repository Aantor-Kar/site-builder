import { useAuth } from "@/context/AuthContext";

export const authClient = {
  useSession: () => {
    const { session, isPending } = useAuth();

    return {
      data: session,
      isPending,
    };
  },
};

export const useSession = authClient.useSession;
