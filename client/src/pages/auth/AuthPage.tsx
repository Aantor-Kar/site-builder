import { useAuth } from "@/context/AuthContext";
import { Loader2Icon } from "lucide-react";
import { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { toast } from "sonner";

export default function AuthPage() {
  const { pathname } = useParams();
  const navigate = useNavigate();
  const { session, isPending, signIn, signUp } = useAuth();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const mode = pathname === "signup" ? "signup" : "signin";

  useEffect(() => {
    if (!isPending && session?.user) {
      navigate("/");
    }
  }, [isPending, navigate, session?.user]);

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();

    if (mode === "signup" && password !== confirmPassword) {
      toast.error("Passwords do not match");
      return;
    }

    setSubmitting(true);

    try {
      if (mode === "signup") {
        await signUp({ name, email, password });
        toast.success("Account created successfully");
      } else {
        await signIn({ email, password });
        toast.success("Signed in successfully");
      }

      navigate("/");
    } catch (error: any) {
      toast.error(error?.response?.data?.message || error.message);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <main className="min-h-[80vh] px-6 py-12 flex items-center justify-center">
      <div className="w-full max-w-md rounded-3xl border border-white/10 bg-black/20 p-8 text-white shadow-2xl shadow-indigo-950/30 backdrop-blur">
        <p className="text-sm uppercase tracking-[0.25em] text-indigo-300/80">
          Node Auth
        </p>
        <h1 className="mt-3 text-3xl font-semibold">
          {mode === "signup" ? "Create your account" : "Welcome back"}
        </h1>
        <p className="mt-2 text-sm text-gray-300">
          {mode === "signup"
            ? "Set up your account to start building sites."
            : "Sign in to manage your projects and credits."}
        </p>

        <form onSubmit={handleSubmit} className="mt-8 space-y-4">
          {mode === "signup" && (
            <label className="block">
              <span className="mb-2 block text-sm text-gray-300">Full name</span>
              <input
                value={name}
                onChange={(event) => setName(event.target.value)}
                className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 outline-none transition focus:border-indigo-400"
                placeholder="Jane Doe"
                required
              />
            </label>
          )}

          <label className="block">
            <span className="mb-2 block text-sm text-gray-300">Email</span>
            <input
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              type="email"
              className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 outline-none transition focus:border-indigo-400"
              placeholder="you@example.com"
              required
            />
          </label>

          <label className="block">
            <span className="mb-2 block text-sm text-gray-300">Password</span>
            <input
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              type="password"
              minLength={8}
              className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 outline-none transition focus:border-indigo-400"
              placeholder="At least 8 characters"
              required
            />
          </label>

          {mode === "signup" && (
            <label className="block">
              <span className="mb-2 block text-sm text-gray-300">
                Confirm password
              </span>
              <input
                value={confirmPassword}
                onChange={(event) => setConfirmPassword(event.target.value)}
                type="password"
                minLength={8}
                className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 outline-none transition focus:border-indigo-400"
                placeholder="Repeat your password"
                required
              />
            </label>
          )}

          <button
            type="submit"
            disabled={submitting || isPending}
            className="flex w-full items-center justify-center gap-2 rounded-xl bg-indigo-600 px-4 py-3 font-medium transition hover:bg-indigo-500 disabled:cursor-not-allowed disabled:opacity-70"
          >
            {submitting ? (
              <>
                <Loader2Icon className="size-4 animate-spin" />
                Processing
              </>
            ) : mode === "signup" ? (
              "Create account"
            ) : (
              "Sign in"
            )}
          </button>
        </form>

        <p className="mt-6 text-sm text-gray-300">
          {mode === "signup" ? "Already have an account?" : "Need an account?"}{" "}
          <Link
            to={mode === "signup" ? "/auth/signin" : "/auth/signup"}
            className="text-indigo-300 transition hover:text-indigo-200"
          >
            {mode === "signup" ? "Sign in" : "Create one"}
          </Link>
        </p>
      </div>
    </main>
  );
}
